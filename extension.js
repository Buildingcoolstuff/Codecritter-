'use strict';

const vscode = require('vscode');
const { StatsEngine }                                = require('./src/stats');
const { getMoodDisplay, checkMilestones,
        getRandomHiMessage, getRandomTip, PET_THEMES } = require('./src/moods');
const { showDashboard, updateDashboardIfOpen }       = require('./src/dashboard');

/** @type {vscode.StatusBarItem} */
let statusBarItem;
let idleTimer;
let codingTimer;
let breakTimer     = null;   // tracks continuous coding for break reminder
let flashTimeout   = null;
let comboTimeout   = null;   // typing combo flash timer
let lastActivity   = Date.now();
let currentMood    = 'happy';
let prevErrorCount = 0;
let continuousCodingMins = 0; // minutes coded without a long idle
let lastBreakReminderDay = null; // ISO date of last weekly review shown

/** @type {StatsEngine} */
let stats;

// ─── Config helpers ───────────────────────────────────────────────────────────

function cfg()        { return vscode.workspace.getConfiguration('codecritter'); }
function petName()    { return cfg().get('petName', 'Critter'); }
function dailyGoal()  { return cfg().get('dailyGoal', 100); }
function tipsOn()     { return cfg().get('enableTips', true); }
function petTheme()   { return cfg().get('petTheme', 'default'); }

// ─── Status bar helpers ───────────────────────────────────────────────────────

function _buildText(moodKey) {
  const m = getMoodDisplay(moodKey);
  return `${m.statusText}  Lv.${stats.getLevel()}`;
}

function _buildTooltip(moodKey) {
  const m  = getMoodDisplay(moodKey);
  const sn = stats.getSnapshot();
  const theme = PET_THEMES[petTheme()] || PET_THEMES.default;
  const lines = [
    `${petName()} the CodeCritter — ${m.label} (Level ${sn.level})`,
    `${m.tip}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `💾 ${sn.saveCount.toLocaleString()} saves  ·  💻 ${sn.linesTyped.toLocaleString()} lines typed`,
    `🔥 ${sn.currentStreak}-day streak  ·  🐛 ${sn.errorsFixed} errors fixed`,
    `🎨 Theme: ${theme.label}`,
    ``,
    `Click to say hi!  |  Open Command Palette → "CodeCritter"`
  ];
  return new vscode.MarkdownString(lines.join('\n'), true);
}

function _applyMood(moodKey) {
  statusBarItem.text    = _buildText(moodKey);
  statusBarItem.tooltip = _buildTooltip(moodKey);
}

/**
 * Sets the critter's mood.
 * If temporary=true, flashes for 2.5 s then reverts to currentMood.
 *
 * @param {string}  moodKey
 * @param {boolean} [temporary=false]
 */
function setMood(moodKey, temporary = false) {
  if (temporary) {
    if (flashTimeout) clearTimeout(flashTimeout);
    _applyMood(moodKey);
    flashTimeout = setTimeout(() => {
      flashTimeout = null;
      _applyMood(currentMood);
    }, 2500);
  } else {
    if (flashTimeout) return; // don't override a flash
    currentMood = moodKey;
    _applyMood(moodKey);
  }
}

// ─── Milestone handling ───────────────────────────────────────────────────────

function checkAndShowMilestones(snapshot) {
  const newMilestones = checkMilestones(snapshot, stats);
  for (const m of newMilestones) {
    vscode.window.showInformationMessage(
      `${m.emoji} Achievement Unlocked — **${m.label}**: ${m.desc}! 🎉`
    );
    setMood('celebrating', true);
  }
}

// ─── Weekly Review ────────────────────────────────────────────────────────────

/**
 * Checks if today is Monday and we haven't shown the weekly review yet.
 * Shows a one-line summary of last week's stats.
 */
function maybeShowWeeklyReview() {
  if (!cfg().get('weeklyReview', true)) return;

  const today     = new Date();
  const todayStr  = today.toISOString().slice(0, 10);
  if (today.getDay() !== 1) return;                  // only on Monday
  if (lastBreakReminderDay === todayStr) return;      // already shown today

  lastBreakReminderDay = todayStr;
  const sn = stats.getSnapshot();

  vscode.window.showInformationMessage(
    `🐾 Weekly Check-in! ` +
    `You've typed ${sn.linesTyped.toLocaleString()} lines total, ` +
    `saved ${sn.saveCount.toLocaleString()} files, ` +
    `and you're on a ${sn.currentStreak}-day streak. Keep it up! 🔥`,
    'Open Dashboard'
  ).then(choice => {
    if (choice === 'Open Dashboard') {
      vscode.commands.executeCommand('codecritter.showDashboard');
    }
  });
}

// ─── activate ─────────────────────────────────────────────────────────────────

/**
 * @param {import('vscode').ExtensionContext} context
 */
function activate(context) {
  stats = new StatsEngine(context);

  // ── Status bar ──
  const alignment = cfg().get('statusBarAlignment', 'right') === 'left'
    ? vscode.StatusBarAlignment.Left
    : vscode.StatusBarAlignment.Right;

  statusBarItem = vscode.window.createStatusBarItem(alignment, 100);
  statusBarItem.command = 'codecritter.sayHi';
  _applyMood('happy');

  if (cfg().get('showInStatusBar', true)) {
    statusBarItem.show();
  }

  // Show weekly review on startup
  maybeShowWeeklyReview();

  // ── Commands ──

  /** Say hi — click on status bar */
  const cmdSayHi = vscode.commands.registerCommand('codecritter.sayHi', () => {
    const name = petName();
    const level = stats.getLevel();
    const msg   = getRandomHiMessage();
    const tip   = tipsOn() ? `\n\n${getRandomTip()}` : '';
    vscode.window.showInformationMessage(`🐾 ${name} (Lv.${level}): ${msg}${tip}`);
    setMood('excited', true);
  });

  /** Open the stats dashboard */
  const cmdDashboard = vscode.commands.registerCommand('codecritter.showDashboard', () => {
    showDashboard(context, stats, petName(), currentMood);
  });

  /** Reset all stats with confirmation */
  const cmdReset = vscode.commands.registerCommand('codecritter.resetStats', async () => {
    const choice = await vscode.window.showWarningMessage(
      `⚠️ Reset ALL of ${petName()}'s stats? This cannot be undone.`,
      { modal: true },
      'Reset Everything'
    );
    if (choice === 'Reset Everything') {
      stats.resetAll();
      currentMood = 'happy';
      _applyMood('happy');
      vscode.window.showInformationMessage('🐾 Stats reset! Starting fresh from Level 1.');
      updateDashboardIfOpen(stats, petName(), 'happy');
    }
  });

  /** Set daily lines goal via input box */
  const cmdSetGoal = vscode.commands.registerCommand('codecritter.setDailyGoal', async () => {
    const current = String(dailyGoal());
    const val = await vscode.window.showInputBox({
      title:   'CodeCritter — Set Daily Goal',
      prompt:  'How many lines do you want to type today?',
      value:   current,
      validateInput: v => {
        const n = Number(v);
        if (isNaN(n) || n < 1 || !Number.isInteger(n)) return 'Please enter a positive whole number.';
        return null;
      }
    });
    if (val !== undefined) {
      await cfg().update('dailyGoal', Number(val), vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`🎯 Daily goal set to ${Number(val).toLocaleString()} lines!`);
    }
  });

  /** Choose pet theme from quick-pick */
  const cmdChooseTheme = vscode.commands.registerCommand('codecritter.choosePetTheme', async () => {
    const items = Object.entries(PET_THEMES).map(([key, t]) => ({
      label:       t.label,
      description: key === petTheme() ? '✓ Current' : '',
      themeKey:    key
    }));

    const picked = await vscode.window.showQuickPick(items, {
      title:       'CodeCritter — Choose Pet Theme',
      placeHolder: 'Pick a color skin for your CodeCritter'
    });

    if (picked) {
      await cfg().update('petTheme', picked.themeKey, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`🎨 Pet theme changed to ${picked.label}!`);
      _applyMood(currentMood); // refresh tooltip
      updateDashboardIfOpen(stats, petName(), currentMood);
    }
  });

  // ── Event: File Saved ──
  const onSave = vscode.workspace.onDidSaveTextDocument(() => {
    lastActivity = Date.now();
    stats.recordSave();
    setMood('excited', true);
    const snap = stats.getSnapshot();
    checkAndShowMilestones(snap);
    updateDashboardIfOpen(stats, petName(), currentMood);
  });

  // ── Event: Text Changed (typing) ──
  const onChange = vscode.workspace.onDidChangeTextDocument(e => {
    lastActivity = Date.now();

    // Count newly inserted lines with a paste-cap to prevent stat inflation.
    // Single keystroke Enter = 1 line. Large pastes are capped at 10 lines max
    // per change event so that pasting a 500-line file doesn't give 500 XP.
    let newLines = 0;
    for (const change of e.contentChanges) {
      const inserted = change.text.split('\n').length - 1;
      if (inserted > 0) {
        newLines += Math.min(inserted, 10); // cap: max 10 lines per change
      }
    }

    if (newLines > 0) {
      stats.recordLines(newLines);

      // Check daily goal
      if (stats.checkAndMarkDailyGoal(dailyGoal())) {
        vscode.window.showInformationMessage(
          `🎯 Daily goal reached! ${dailyGoal().toLocaleString()} lines typed today. ${petName()} is proud of you! 🥳`
        );
        setMood('celebrating', true);
      }

      // ── Typing combo flash ──
      // When a user is actively typing (not just paste-importing), flash the
      // combo mood for 2 s whenever they've typed 5+ lines since last flash.
      if (!comboTimeout && newLines >= 2 && !flashTimeout) {
        setMood('comboTyping', true);
        comboTimeout = setTimeout(() => { comboTimeout = null; }, 4000);
      }

      const snap = stats.getSnapshot();
      checkAndShowMilestones(snap);
      updateDashboardIfOpen(stats, petName(), currentMood);
    }
  });

  // ── Event: Diagnostics (errors/warnings) ──
  const onDiagnostics = vscode.languages.onDidChangeDiagnostics(() => {
    // Only scan diagnostics from open editors to avoid noisy workspace-wide counts
    const openUris = vscode.window.visibleTextEditors.map(e => e.document.uri.toString());
    const allDiags = vscode.languages.getDiagnostics();
    const errorCount = allDiags
      .filter(([uri]) => openUris.includes(uri.toString()))
      .flatMap(([, diags]) => diags)
      .filter(d => d.severity === vscode.DiagnosticSeverity.Error)
      .length;

    // Award credit for errors fixed
    if (errorCount < prevErrorCount) {
      const fixed = prevErrorCount - errorCount;
      for (let i = 0; i < fixed; i++) stats.recordErrorFixed();
      const snap = stats.getSnapshot();
      checkAndShowMilestones(snap);
      updateDashboardIfOpen(stats, petName(), currentMood);
    }
    prevErrorCount = errorCount;

    // Update persistent mood (not during a flash)
    if (!flashTimeout) {
      if (errorCount > 0) {
        currentMood = 'struggling';
      } else if (currentMood === 'struggling') {
        // Cleared all errors — go focused for 5 s then happy
        currentMood = 'focused';
        setTimeout(() => {
          if (currentMood === 'focused') {
            currentMood = 'happy';
            _applyMood('happy');
          }
        }, 5000);
      }
      _applyMood(currentMood);
    }
  });

  // ── Idle Mood Timer (every 30 s) ──
  idleTimer = setInterval(() => {
    if (flashTimeout) return;
    const idleMins = (Date.now() - lastActivity) / 60000;
    let target;
    if      (idleMins > 10) target = 'sleepy';
    else if (idleMins > 3)  target = 'bored';
    else if (prevErrorCount > 0) target = 'struggling';
    else    target = 'happy';

    if (target !== currentMood) {
      currentMood = target;
      _applyMood(currentMood);
    }
  }, 30_000);

  // ── Coding Time + Break Reminder Tracker (every 1 min) ──
  codingTimer = setInterval(() => {
    const idleMins = (Date.now() - lastActivity) / 60000;
    if (idleMins < 5) {
      stats.recordCodingTime(1);
      continuousCodingMins++;

      // Break reminder
      const breakEnabled  = cfg().get('breakReminder', false);
      const breakInterval = cfg().get('breakReminderInterval', 45);

      if (breakEnabled && continuousCodingMins >= breakInterval) {
        continuousCodingMins = 0; // reset so it doesn't fire again immediately
        vscode.window.showInformationMessage(
          `🐾 ${petName()} thinks you should take a short break! ` +
          `You've been coding for ${breakInterval} min straight. Stretch, hydrate, come back fresh! 💧`,
          'Snooze 15 min',
          'Got it!'
        ).then(choice => {
          if (choice === 'Snooze 15 min') {
            // Don't remind again for 15 more minutes
            continuousCodingMins = -15;
          }
        });
      }
    } else {
      // User is idle — reset continuous coding counter
      continuousCodingMins = 0;
    }
  }, 60_000);

  // ── Settings change listener ──
  const onConfigChange = vscode.workspace.onDidChangeConfiguration(e => {
    if (!e.affectsConfiguration('codecritter')) return;
    const show = cfg().get('showInStatusBar', true);
    show ? statusBarItem.show() : statusBarItem.hide();
    _applyMood(currentMood); // rebuild text/tooltip for petName/theme changes
    updateDashboardIfOpen(stats, petName(), currentMood); // refresh theme in dashboard
  });

  // ── Register everything ──
  context.subscriptions.push(
    statusBarItem,
    cmdSayHi,
    cmdDashboard,
    cmdReset,
    cmdSetGoal,
    cmdChooseTheme,
    onSave,
    onChange,
    onDiagnostics,
    onConfigChange,
    { dispose: () => {
        clearInterval(idleTimer);
        clearInterval(codingTimer);
        if (breakTimer) clearTimeout(breakTimer);
    }}
  );
}

// ─── deactivate ───────────────────────────────────────────────────────────────

function deactivate() {
  if (flashTimeout) clearTimeout(flashTimeout);
  if (comboTimeout)  clearTimeout(comboTimeout);
}

module.exports = { activate, deactivate };
