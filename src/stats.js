'use strict';

/**
 * Storage keys for globalState persistence.
 * All data is local — nothing ever leaves the machine.
 */
const KEYS = {
  SAVE_COUNT:          'codecritter.saveCount',
  LINES_TYPED:         'codecritter.linesTyped',
  ERRORS_FIXED:        'codecritter.errorsFixed',
  TOTAL_CODING_MINS:   'codecritter.totalCodingMinutes',
  CURRENT_STREAK:      'codecritter.currentStreak',
  LONGEST_STREAK:      'codecritter.longestStreak',
  LAST_ACTIVE_DAY:     'codecritter.lastActiveDay',
  MILESTONES_REACHED:  'codecritter.milestonesReached',
  DAILY_LINES_TYPED:   'codecritter.dailyLinesTyped',
  DAILY_GOAL_HIT:      'codecritter.dailyGoalHit',
  DAILY_DATE:          'codecritter.dailyDate'
};

/**
 * StatsEngine — manages all CodeCritter statistics.
 * Instantiate once in activate() and pass the VS Code ExtensionContext.
 */
class StatsEngine {
  /**
   * @param {import('vscode').ExtensionContext} context
   */
  constructor(context) {
    this.context = context;
    this.sessionStart = Date.now();
    this._load();
    this._checkDayRollover();
  }

  // ─── Private: Load & Save ────────────────────────────────────────────────

  _load() {
    const g = this.context.globalState;
    this.saveCount         = g.get(KEYS.SAVE_COUNT, 0);
    this.linesTyped        = g.get(KEYS.LINES_TYPED, 0);
    this.errorsFixed       = g.get(KEYS.ERRORS_FIXED, 0);
    this.totalCodingMins   = g.get(KEYS.TOTAL_CODING_MINS, 0);
    this.currentStreak     = g.get(KEYS.CURRENT_STREAK, 0);
    this.longestStreak     = g.get(KEYS.LONGEST_STREAK, 0);
    this.lastActiveDay     = g.get(KEYS.LAST_ACTIVE_DAY, null);
    this.milestonesReached = g.get(KEYS.MILESTONES_REACHED, []);
    this.dailyLinesTyped   = g.get(KEYS.DAILY_LINES_TYPED, 0);
    this.dailyGoalHit      = g.get(KEYS.DAILY_GOAL_HIT, false);
    this.dailyDate         = g.get(KEYS.DAILY_DATE, null);
  }

  _save() {
    const g = this.context.globalState;
    g.update(KEYS.SAVE_COUNT,         this.saveCount);
    g.update(KEYS.LINES_TYPED,        this.linesTyped);
    g.update(KEYS.ERRORS_FIXED,       this.errorsFixed);
    g.update(KEYS.TOTAL_CODING_MINS,  this.totalCodingMins);
    g.update(KEYS.CURRENT_STREAK,     this.currentStreak);
    g.update(KEYS.LONGEST_STREAK,     this.longestStreak);
    g.update(KEYS.LAST_ACTIVE_DAY,    this.lastActiveDay);
    g.update(KEYS.MILESTONES_REACHED, this.milestonesReached);
    g.update(KEYS.DAILY_LINES_TYPED,  this.dailyLinesTyped);
    g.update(KEYS.DAILY_GOAL_HIT,     this.dailyGoalHit);
    g.update(KEYS.DAILY_DATE,         this.dailyDate);
  }

  // ─── Private: Helpers ─────────────────────────────────────────────────────

  /** Returns today's ISO date string (YYYY-MM-DD) in local time. */
  _today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Resets daily counters if the date has changed since last save. */
  _checkDayRollover() {
    const today = this._today();
    if (this.dailyDate !== today) {
      this.dailyLinesTyped = 0;
      this.dailyGoalHit    = false;
      this.dailyDate       = today;
      this._save();
    }
  }

  /**
   * Updates the coding streak based on the last active day.
   * Increments streak if yesterday, resets if 2+ days ago.
   */
  _updateStreak() {
    const today = this._today();
    if (this.lastActiveDay === today) return; // already counted today

    if (this.lastActiveDay) {
      const last = new Date(this.lastActiveDay + 'T00:00:00');
      const now  = new Date(today + 'T00:00:00');
      const diffDays = Math.round((now - last) / 86400000);
      if (diffDays === 1) {
        this.currentStreak++; // consecutive day
      } else {
        this.currentStreak = 1; // streak broken — reset
      }
    } else {
      this.currentStreak = 1; // first ever day
    }

    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
    this.lastActiveDay = today;
    this._save();
  }

  // ─── Public: Record Activity ─────────────────────────────────────────────

  /**
   * Call this whenever a file is saved.
   * @returns {number} New total save count.
   */
  recordSave() {
    this.saveCount++;
    this._updateStreak();
    this._save();
    return this.saveCount;
  }

  /**
   * Call this whenever lines are typed (from onDidChangeTextDocument).
   * @param {number} count — number of new lines inserted
   */
  recordLines(count) {
    if (count <= 0) return;
    this.linesTyped      += count;
    this.dailyLinesTyped += count;
    this._updateStreak();
    this._save();
  }

  /**
   * Call this whenever an error is resolved (error count decreases).
   * @returns {number} New total errors fixed.
   */
  recordErrorFixed() {
    this.errorsFixed++;
    this._save();
    return this.errorsFixed;
  }

  /**
   * Add minutes to total coding time (called by a 1-minute interval timer).
   * @param {number} minutes
   */
  recordCodingTime(minutes) {
    this.totalCodingMins += minutes;
    this._save();
  }

  // ─── Public: Goals & Milestones ──────────────────────────────────────────

  /**
   * Returns true (and marks goal as hit) the first time the daily goal is reached.
   * @param {number} goal — the configured daily lines goal
   * @returns {boolean}
   */
  checkAndMarkDailyGoal(goal) {
    if (!this.dailyGoalHit && this.dailyLinesTyped >= goal) {
      this.dailyGoalHit = true;
      this._save();
      return true;
    }
    return false;
  }

  /**
   * Returns true if the milestone was newly unlocked (marks it as reached).
   * @param {string} id
   * @returns {boolean}
   */
  markMilestone(id) {
    if (!this.milestonesReached.includes(id)) {
      this.milestonesReached.push(id);
      this._save();
      return true;
    }
    return false;
  }

  /** @param {string} id */
  hasMilestone(id) {
    return this.milestonesReached.includes(id);
  }

  // ─── Public: Computed Values ─────────────────────────────────────────────

  /** Level = every 10 saves. Starts at 1. */
  getLevel() {
    return Math.floor(this.saveCount / 10) + 1;
  }

  /** XP progress toward the next level, as a percentage (0–100). */
  getXpProgress() {
    return (this.saveCount % 10) * 10;
  }

  /** Minutes coded in this VS Code session (since extension activated). */
  getSessionMinutes() {
    return Math.floor((Date.now() - this.sessionStart) / 60000);
  }

  /** Returns a plain-object snapshot of all stats (safe to pass to webview). */
  getSnapshot() {
    return {
      saveCount:         this.saveCount,
      linesTyped:        this.linesTyped,
      errorsFixed:       this.errorsFixed,
      totalCodingMins:   this.totalCodingMins + this.getSessionMinutes(),
      currentStreak:     this.currentStreak,
      longestStreak:     this.longestStreak,
      milestonesReached: [...this.milestonesReached],
      dailyLinesTyped:   this.dailyLinesTyped,
      level:             this.getLevel(),
      xpProgress:        this.getXpProgress()
    };
  }

  // ─── Public: Reset ────────────────────────────────────────────────────────

  /** Wipes all stats back to zero. */
  resetAll() {
    for (const key of Object.values(KEYS)) {
      this.context.globalState.update(key, undefined);
    }
    this.saveCount         = 0;
    this.linesTyped        = 0;
    this.errorsFixed       = 0;
    this.totalCodingMins   = 0;
    this.currentStreak     = 0;
    this.longestStreak     = 0;
    this.lastActiveDay     = null;
    this.milestonesReached = [];
    this.dailyLinesTyped   = 0;
    this.dailyGoalHit      = false;
    this.dailyDate         = this._today();
    this._save();
  }
}

module.exports = { StatsEngine };
