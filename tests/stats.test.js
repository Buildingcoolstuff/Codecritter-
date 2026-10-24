'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { StatsEngine } = require('../src/stats');

function createMockContext(initialState = {}) {
  const store = new Map(Object.entries(initialState));
  return {
    globalState: {
      get: (key, defaultValue) => store.has(key) ? store.get(key) : defaultValue,
      update: (key, value) => {
        if (value === undefined) store.delete(key);
        else store.set(key, value);
        return Promise.resolve();
      }
    }
  };
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

test('Issue #22: totalCodingMins does not double-count session coding time in snapshot', () => {
  const context = createMockContext({
    'codecritter.totalCodingMinutes': 30
  });

  const stats = new StatsEngine(context);

  // Record 15 additional minutes of coding time
  stats.recordCodingTime(15);

  const snapshot = stats.getSnapshot();
  assert.equal(snapshot.totalCodingMins, 45, 'total coding minutes must equal accumulated time without session inflation');
});

test('Issue #24: streak resets to 0 if user has been inactive for 2 or more days', () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const context = createMockContext({
    'codecritter.currentStreak': 10,
    'codecritter.longestStreak': 10,
    'codecritter.lastActiveDay': formatDate(threeDaysAgo)
  });

  const stats = new StatsEngine(context);

  const snapshot = stats.getSnapshot();
  assert.equal(snapshot.currentStreak, 0, 'inactive streak must be 0 after 2+ days without coding');
  assert.equal(snapshot.longestStreak, 10, 'longest streak record must be preserved');

  // Saving a file today starts a new streak of 1
  stats.recordSave();
  const updatedSnapshot = stats.getSnapshot();
  assert.equal(updatedSnapshot.currentStreak, 1, 'streak restarts at 1 on fresh activity');
  assert.equal(updatedSnapshot.longestStreak, 10, 'longest streak record remains unchanged');
});

test('Issue #24: streak continues when active on consecutive days (yesterday -> today)', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const context = createMockContext({
    'codecritter.currentStreak': 4,
    'codecritter.longestStreak': 4,
    'codecritter.lastActiveDay': formatDate(yesterday)
  });

  const stats = new StatsEngine(context);

  // Before activity today, current streak is still intact
  assert.equal(stats.getSnapshot().currentStreak, 4, 'yesterdays streak is preserved pending activity today');

  // Activity today increments streak to 5
  stats.recordLines(10);
  const snapshot = stats.getSnapshot();
  assert.equal(snapshot.currentStreak, 5, 'consecutive day activity increments streak');
  assert.equal(snapshot.longestStreak, 5, 'longest streak updates when current exceeds it');
});

test('Issue #31: weekend streak protection preserves streak from Friday to Monday', () => {
  const context = createMockContext({
    'codecritter.currentStreak': 5,
    'codecritter.longestStreak': 5,
    'codecritter.lastActiveDay': '2026-10-16' // Friday
  });

  // Today is Monday (2026-10-19)
  const stats = new StatsEngine(context, {
    today: '2026-10-19',
    weekendStreakProtection: true
  });

  const snapshot = stats.getSnapshot();
  assert.equal(snapshot.currentStreak, 5, 'Friday streak must be protected on Monday before coding');

  // Activity on Monday increments the streak to 6
  stats.recordSave();
  assert.equal(stats.getSnapshot().currentStreak, 6, 'Friday to Monday coding activity increments streak');
});

test('Issue #31: streak resets from Friday to Monday if weekendStreakProtection is disabled', () => {
  const context = createMockContext({
    'codecritter.currentStreak': 5,
    'codecritter.longestStreak': 5,
    'codecritter.lastActiveDay': '2026-10-16' // Friday
  });

  // Today is Monday (2026-10-19) with protection disabled
  const stats = new StatsEngine(context, {
    today: '2026-10-19',
    weekendStreakProtection: false
  });

  const snapshot = stats.getSnapshot();
  assert.equal(snapshot.currentStreak, 0, 'Streak resets to 0 on Monday when weekend protection is disabled');

  // Coding on Monday starts streak at 1
  stats.recordSave();
  assert.equal(stats.getSnapshot().currentStreak, 1, 'Streak restarts at 1 when protection disabled');
});
