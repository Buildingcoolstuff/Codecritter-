'use strict';

/**
 * All mood states with their native emoji, label, and tooltip tip.
 * Emoji render as real colored emoji on Windows, macOS, and Linux.
 */
const MOODS = {
  happy: {
    emoji: '🐱',
    statusText: '🐱',
    label: 'Happy',
    tip: 'Ready to code! 🚀',
    animClass: 'pet-happy'
  },
  excited: {
    emoji: '🤩',
    statusText: '🤩',
    label: 'Excited',
    tip: "LET'S GOOO! 🔥",
    animClass: 'pet-excited'
  },
  bored: {
    emoji: '😑',
    statusText: '😑',
    label: 'Bored',
    tip: 'Waiting for you...',
    animClass: 'pet-bored'
  },
  sleepy: {
    emoji: '😴',
    statusText: '😴 💤',
    label: 'Sleepy',
    tip: 'Zzz... wake me up!',
    animClass: 'pet-sleepy'
  },
  focused: {
    emoji: '🧠',
    statusText: '🧠 ⚡',
    label: 'Focused',
    tip: 'Zero errors — you legend!',
    animClass: 'pet-focused'
  },
  struggling: {
    emoji: '😰',
    statusText: '😰 🐛',
    label: 'Struggling',
    tip: 'Squashing bugs together...',
    animClass: 'pet-struggling'
  },
  celebrating: {
    emoji: '🥳',
    statusText: '🥳 ✨',
    label: 'Celebrating',
    tip: 'WOOOOO!! 🎉',
    animClass: 'pet-celebrating'
  }
};

/**
 * Achievement milestones.
 * Each has a unique id, display info, and a check function against a stats snapshot.
 */
const MILESTONES = [
  {
    id:    'saves_10',
    emoji: '🐾',
    label: 'First Steps',
    desc:  '10 files saved',
    check: s => s.saveCount >= 10
  },
  {
    id:    'saves_100',
    emoji: '💾',
    label: 'Save Master',
    desc:  '100 files saved',
    check: s => s.saveCount >= 100
  },
  {
    id:    'level_10',
    emoji: '⭐',
    label: 'Seasoned Critter',
    desc:  'Reached Level 10',
    check: s => s.level >= 10
  },
  {
    id:    'level_25',
    emoji: '🚀',
    label: 'Code Veteran',
    desc:  'Reached Level 25',
    check: s => s.level >= 25
  },
  {
    id:    'lines_1000',
    emoji: '💻',
    label: 'Keyboard Warrior',
    desc:  '1,000 lines typed',
    check: s => s.linesTyped >= 1000
  },
  {
    id:    'lines_10000',
    emoji: '⌨️',
    label: 'Code Machine',
    desc:  '10,000 lines typed',
    check: s => s.linesTyped >= 10000
  },
  {
    id:    'errors_10',
    emoji: '🐛',
    label: 'Bug Hunter',
    desc:  '10 errors fixed',
    check: s => s.errorsFixed >= 10
  },
  {
    id:    'errors_50',
    emoji: '🔫',
    label: 'Bug Slayer',
    desc:  '50 errors fixed',
    check: s => s.errorsFixed >= 50
  },
  {
    id:    'streak_3',
    emoji: '🔥',
    label: 'On a Roll',
    desc:  '3-day streak',
    check: s => s.currentStreak >= 3
  },
  {
    id:    'streak_7',
    emoji: '🌟',
    label: 'On Fire!',
    desc:  '7-day streak',
    check: s => s.currentStreak >= 7
  },
  {
    id:    'streak_30',
    emoji: '🏆',
    label: 'Unstoppable',
    desc:  '30-day streak',
    check: s => s.currentStreak >= 30
  }
];

/** Motivational messages shown when the user clicks the status bar. */
const HI_MESSAGES = [
  "You're doing great! Keep it up 💪",
  "Ooh, what are we building today? 👀",
  "Beep boop, still here, still cheering for you! 🐾",
  "Ship it. I believe in you. 🚀",
  "Save early, save often — I love it when you do! 💾",
  "Every line of code is progress. You got this! ✨",
  "I've seen your code. It's pretty good. Don't tell anyone 🤫",
  "Remember to take a break and hydrate! 💧",
  "One bug at a time. You're crushing it! 🐛",
  "The best code is code that ships. Let's go! 🎯",
  "Stack Overflow is just documentation with attitude 😄",
  "Your future self will thank you for those comments 📝",
  "Coffee + Code = Magic ☕✨",
  "Debugging: being the detective in a crime movie you also wrote 🔍"
];

/** Tips shown in focused/struggling states. */
const CODING_TIPS = [
  "💡 Tip: Name variables for what they ARE, not what they DO.",
  "💡 Tip: Small commits > massive PRs. Future you agrees.",
  "💡 Tip: Write the test before the fix — it's weirdly satisfying.",
  "💡 Tip: If you're stuck, explain the problem out loud. It usually helps.",
  "💡 Tip: `console.log` isn't a debugger, but it gets things done 😅"
];

// ─── Helper functions ─────────────────────────────────────────────────────────

/** @param {any[]} arr */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** @param {string} moodKey @returns {typeof MOODS[keyof typeof MOODS]} */
function getMoodDisplay(moodKey) {
  return MOODS[moodKey] || MOODS.happy;
}

/**
 * Checks all milestones against current stats and returns newly unlocked ones.
 * Marks each unlocked milestone in the StatsEngine so it only fires once.
 *
 * @param {object} stats — snapshot from StatsEngine.getSnapshot()
 * @param {import('./stats').StatsEngine} statsEngine
 * @returns {Array} newly unlocked milestones
 */
function checkMilestones(stats, statsEngine) {
  const unlocked = [];
  for (const milestone of MILESTONES) {
    if (!statsEngine.hasMilestone(milestone.id) && milestone.check(stats)) {
      if (statsEngine.markMilestone(milestone.id)) {
        unlocked.push(milestone);
      }
    }
  }
  return unlocked;
}

/** Returns a random motivational hi-message. */
function getRandomHiMessage() {
  return pick(HI_MESSAGES);
}

/** Returns a random coding tip. */
function getRandomTip() {
  return pick(CODING_TIPS);
}

module.exports = {
  MOODS,
  MILESTONES,
  getMoodDisplay,
  checkMilestones,
  getRandomHiMessage,
  getRandomTip
};
