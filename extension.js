'use strict';

const vscode = require('vscode');
const { StatsEngine }                           = require('./src/stats');
const { getMoodDisplay, checkMilestones,
        getRandomHiMessage, getRandomTip }      = require('./src/moods');
const { showDashboard, updateDashboardIfOpen }  = require('./src/dashboard');

/** @type {vscode.StatusBarItem} */
let statusBarItem;
let idleTimer;
let codingTimer;
let flashTimeout = null;
let lastActivity = Date.now();
let currentMood  = 'happy';
let prevErrorCount = 0;

/** @type {StatsEngine} */
let stats;

// ─── Config helpers ───────────────────────────────────────────────────────────

function cfg()        { return vscode.workspace.getConfiguration('codecritter'); }
function petName()    { return cfg().get('petName', 'Critter'); }
function dailyGoal()  { return cfg().get('dailyGoal', 100); }
function tipsOn()     { return cfg().get('enableTips', true); }

// ─── Status bar helpers ───────────────────────────────────────────────────────

function _buildText(moodKey) {
  const m = getMoodDisplay(moodKey);
  return `${m.statusText}  Lv.${stats.getLevel()}`;
}

function _buildTooltip(moodKey) {
  const m  = getMoodDisplay(moodKey);
  const sn = stats.getSnapshot();
  const lines = [
    `${petName()} the CodeCritter — ${m.label} (Level ${sn.level})`,
    `${m.tip}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `💾 ${sn.saveCount.toLocaleString()} saves  ·  💻 ${sn.linesTyped.toLocaleString()} lines typed`,
    `🔥 ${sn.currentStreak}-day streak  ·  🐛 ${sn.errorsFixed} errors fixed`,
    ``,
    `Click to say hi!  |  Cmd: CodeCritter: Show Dashboard`
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

    // Count newly inserted lines (newline characters in inserted text)
    let newLines = 0;
    for (const change of e.contentChanges) {
      const inserted = change.text.split('\n').length - 1;
      if (inserted > 0) newLines += inserted;
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

      const snap = stats.getSnapshot();
      checkAndShowMilestones(snap);
      updateDashboardIfOpen(stats, petName(), currentMood);
    }
  });

  // ── Event: Diagnostics (errors/warnings) ──
  const onDiagnostics = vscode.languages.onDidChangeDiagnostics(() => {
    const allDiags  = vscode.languages.getDiagnostics();
    const errorCount = allDiags
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
        // Cleared all errors — celebrate briefly then go focused
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
    if (flashTimeout) return; // don't interrupt flash
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

  // ── Coding Time Tracker (every 1 min) ──
  codingTimer = setInterval(() => {
    const idleMins = (Date.now() - lastActivity) / 60000;
    if (idleMins < 5) {
      stats.recordCodingTime(1);
    }
  }, 60_000);

  // ── Settings change listener ──
  const onConfigChange = vscode.workspace.onDidChangeConfiguration(e => {
    if (!e.affectsConfiguration('codecritter')) return;
    const show = cfg().get('showInStatusBar', true);
    show ? statusBarItem.show() : statusBarItem.hide();
    _applyMood(currentMood); // rebuild text/tooltip in case petName changed
  });

  // ── Register everything ──
  context.subscriptions.push(
    statusBarItem,
    cmdSayHi,
    cmdDashboard,
    cmdReset,
    cmdSetGoal,
    onSave,
    onChange,
    onDiagnostics,
    onConfigChange,
    { dispose: () => { clearInterval(idleTimer); clearInterval(codingTimer); } }
  );
}

// ─── deactivate ───────────────────────────────────────────────────────────────

function deactivate() {
  if (flashTimeout) clearTimeout(flashTimeout);
}

module.exports = { activate, deactivate };
