'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('Issue #11: Resets pet mood from sleepy/bored on active editor change or window focus', (t, done) => {
  const disposable = { dispose() {} };
  let editorChangeHandler = null;
  let windowStateChangeHandler = null;
  let idleTimerCallback = null;

  const statusBar = {
    text: '',
    tooltip: '',
    show() {},
    hide() {}
  };

  const vscode = {
    DiagnosticSeverity: { Error: 0 },
    StatusBarAlignment: { Right: 1 },
    MarkdownString: class { constructor(value) { this.value = value; } },
    commands: {
      registerCommand: () => disposable
    },
    window: {
      createStatusBarItem: () => statusBar,
      registerWebviewViewProvider: () => disposable,
      showInformationMessage: () => Promise.resolve(),
      visibleTextEditors: [],
      onDidChangeActiveTextEditor: handler => {
        editorChangeHandler = handler;
        return disposable;
      },
      onDidChangeWindowState: handler => {
        windowStateChangeHandler = handler;
        return disposable;
      }
    },
    workspace: {
      getConfiguration: () => ({ get: (key, fallback) => key === 'weeklyReview' ? false : fallback }),
      onDidSaveTextDocument: () => disposable,
      onDidChangeTextDocument: () => disposable,
      onDidChangeConfiguration: () => disposable
    },
    languages: {
      onDidChangeDiagnostics: () => disposable,
      getDiagnostics: () => []
    }
  };

  let sidebarUpdated = 0;
  class MockSidebarProvider {
    constructor() {}
    update() { sidebarUpdated++; }
  }

  let dashboardUpdatedMood = null;
  const dependencies = {
    vscode,
    './src/stats': {
      StatsEngine: class {
        getLevel() { return 1; }
        getSnapshot() { return { level: 1, saveCount: 0, linesTyped: 0, currentStreak: 0, errorsFixed: 0 }; }
      }
    },
    './src/moods': {
      getMoodDisplay: mood => ({ statusText: `(${mood})`, label: mood, tip: '' }),
      checkMilestones: () => [],
      getRandomHiMessage: () => 'hi',
      getRandomTip: () => 'tip',
      PET_THEMES: { default: { label: 'Default' } }
    },
    './src/dashboard': {
      showDashboard: () => {},
      updateDashboardIfOpen: (stats, name, mood) => { dashboardUpdatedMood = mood; }
    },
    './src/sidebar': {
      SidebarProvider: MockSidebarProvider
    }
  };

  let currentTime = 1000000;
  const sandbox = {
    module: { exports: {} },
    require: name => dependencies[name] || require(name),
    __dirname: path.join(__dirname, '..'),
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout,
    setInterval: (fn, ms) => {
      if (ms === 30000) {
        idleTimerCallback = fn;
      }
      return 1;
    },
    clearInterval: () => {},
    Date: {
      now: () => currentTime
    }
  };

  const extensionCode = fs.readFileSync(path.join(__dirname, '..', 'extension.js'), 'utf8');
  vm.runInNewContext(extensionCode, sandbox);
  const activate = sandbox.module.exports.activate;
  const deactivate = sandbox.module.exports.deactivate;

  const mockContext = {
    subscriptions: [],
    globalState: { get: () => null, update: () => Promise.resolve() }
  };

  activate(mockContext);

  assert.ok(typeof editorChangeHandler === 'function', 'onDidChangeActiveTextEditor handler must be registered');
  assert.ok(typeof windowStateChangeHandler === 'function', 'onDidChangeWindowState handler must be registered');

  // Simulate idle for 15 minutes (system sleep)
  currentTime += 15 * 60 * 1000;
  assert.ok(typeof idleTimerCallback === 'function', 'idleTimerCallback registered');
  idleTimerCallback();

  assert.ok(statusBar.text.includes('sleepy'), 'pet must be sleepy after 15m idle');

  // Case 1: Switching active text editor wakes pet up
  sidebarUpdated = 0;
  editorChangeHandler({ document: {} });
  assert.ok(statusBar.text.includes('happy'), 'active editor change must wake pet from sleepy to happy');
  assert.equal(dashboardUpdatedMood, 'happy', 'dashboard updated to happy');
  assert.ok(sidebarUpdated > 0, 'sidebar updated on wake');

  // Simulate idle again to bored
  currentTime += 5 * 60 * 1000;
  idleTimerCallback();
  assert.ok(statusBar.text.includes('bored'), 'pet must be bored after 5m idle');

  // Case 2: Window gain focus (system wake / return to VS Code) wakes pet up
  sidebarUpdated = 0;
  windowStateChangeHandler({ focused: true });
  assert.ok(statusBar.text.includes('happy'), 'window focus must wake pet from bored to happy');

  // Case 3: Window blur does NOT wake pet up
  currentTime += 12 * 60 * 1000;
  idleTimerCallback();
  assert.ok(statusBar.text.includes('sleepy'), 'pet must be sleepy again');
  windowStateChangeHandler({ focused: false });
  assert.ok(statusBar.text.includes('sleepy'), 'window blur should not alter sleepy state');

  deactivate();
  done();
});
