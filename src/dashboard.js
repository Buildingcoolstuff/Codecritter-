'use strict';

const vscode = require('vscode');
const path   = require('path');
const fs     = require('fs');
const { MILESTONES } = require('./moods');

/** @type {vscode.WebviewPanel | null} */
let panel = null;

/**
 * Opens (or focuses) the CodeCritter dashboard webview panel.
 *
 * @param {import('vscode').ExtensionContext} context
 * @param {import('./stats').StatsEngine} statsEngine
 * @param {string} petName
 * @param {string} currentMood — current mood key (e.g. 'happy', 'excited')
 */
function showDashboard(context, statsEngine, petName, currentMood = 'happy') {
  if (panel) {
    panel.reveal(vscode.ViewColumn.One);
    _updatePanel(statsEngine, petName, currentMood);
    return;
  }

  panel = vscode.window.createWebviewPanel(
    'codecritterDashboard',
    `🐾 ${petName}'s Dashboard`,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, 'media'))
      ],
      retainContextWhenHidden: true
    }
  );

  panel.onDidDispose(() => {
    panel = null;
  }, null, context.subscriptions);

  // Handle messages from the webview (e.g., reset button)
  panel.webview.onDidReceiveMessage(msg => {
    if (msg.command === 'resetStats') {
      statsEngine.resetAll();
      vscode.window.showInformationMessage('🐾 Stats reset! Starting fresh!');
      _updatePanel(statsEngine, petName, 'happy');
    }
  }, null, context.subscriptions);

  _updatePanel(statsEngine, petName, currentMood);
}

/**
 * Refreshes the dashboard HTML if it's currently open.
 * Call this after any stat change.
 *
 * @param {import('./stats').StatsEngine} statsEngine
 * @param {string} petName
 * @param {string} currentMood
 */
function updateDashboardIfOpen(statsEngine, petName, currentMood = 'happy') {
  if (panel) {
    _updatePanel(statsEngine, petName, currentMood);
  }
}

// ─── Private ──────────────────────────────────────────────────────────────────

function _updatePanel(statsEngine, petName, currentMood) {
  if (!panel) return;

  const stats      = statsEngine.getSnapshot();
  const config     = vscode.workspace.getConfiguration('codecritter');
  const dailyGoal  = config.get('dailyGoal', 100);
  const dailyPct   = Math.min(100, Math.round((stats.dailyLinesTyped / dailyGoal) * 100));
  const nextLevel  = stats.level + 1;
  const codingHrs  = Math.floor(stats.totalCodingMins / 60);
  const codingMins = stats.totalCodingMins % 60;
  const codingTime = codingHrs > 0
    ? `${codingHrs}h ${codingMins}m`
    : `${codingMins}m`;

  const milestoneData = MILESTONES.map(m => ({
    id:       m.id,
    emoji:    m.emoji,
    label:    m.label,
    desc:     m.desc,
    unlocked: statsEngine.hasMilestone(m.id)
  }));

  const htmlPath = path.join(__dirname, '..', 'media', 'dashboard.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Replace all placeholders (global regex so multiple occurrences are handled)
  const isGoalDone = dailyPct >= 100;

  const replacements = {
    '__PET_NAME__':        _esc(petName),
    '__LEVEL__':           String(stats.level),
    '__NEXT_LEVEL__':      String(nextLevel),
    '__XP_PROGRESS__':     String(stats.xpProgress),
    '__SAVE_COUNT__':      stats.saveCount.toLocaleString(),
    '__LINES_TYPED__':     stats.linesTyped.toLocaleString(),
    '__ERRORS_FIXED__':    stats.errorsFixed.toLocaleString(),
    '__CODING_TIME__':     codingTime,
    '__CURRENT_STREAK__':  String(stats.currentStreak),
    '__LONGEST_STREAK__':  String(stats.longestStreak),
    '__DAILY_LINES__':     stats.dailyLinesTyped.toLocaleString(),
    '__DAILY_GOAL__':      dailyGoal.toLocaleString(),
    '__DAILY_PROGRESS__':  String(dailyPct),
    '__GOAL_DONE_CLASS__': isGoalDone ? 'done' : '',
    '__CURRENT_MOOD__':    currentMood,
    '__MILESTONES_JSON__': JSON.stringify(milestoneData)
  };

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }

  panel.webview.html = html;
  panel.title = `🐾 ${petName}'s Dashboard`;
}

/** Escape HTML to prevent injection from petName. */
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { showDashboard, updateDashboardIfOpen };
