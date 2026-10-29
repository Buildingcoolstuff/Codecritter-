'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('Issue #23: Feed/Play commands maintain mood duration for 5s and do not lock comboTimeout', (t, done) => {
  const disposable = { dispose() {} };
  const commands = {};
  let infoMessage = '';
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
      registerCommand: (cmd, handler) => {
        commands[cmd] = handler;
        return disposable;
      }
    },
    window: {
      createStatusBarItem: () => statusBar,
      registerWebviewViewProvider: () => disposable,
      showInformationMessage: msg => { infoMessage = msg; },
      visibleTextEditors: []
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

  const timers = [];
  const sandbox = {
    module: { exports: {} },
    require: name => dependencies[name] || require(name),
    __dirname: path.join(__dirname, '..'),
    setTimeout: (fn, ms) => {
      const id = setTimeout(fn, ms);
      timers.push(id);
      return id;
    },
    clearTimeout: id => {
      clearTimeout(id);
    },
    setInterval: () => 1,
    clearInterval: () => {},
    Date
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

  assert.ok(typeof commands['codecritter.feedPet'] === 'function', 'feedPet command must be registered');
  assert.ok(typeof commands['codecritter.playPet'] === 'function', 'playPet command must be registered');

  // Trigger feedPet
  commands['codecritter.feedPet']();
  assert.ok(infoMessage.includes('You fed'), 'info message shown');
  assert.ok(statusBar.text.includes('excited'), 'status bar displays excited mood');
  assert.equal(dashboardUpdatedMood, 'excited', 'dashboard updated to excited');
  assert.ok(sidebarUpdated > 0, 'sidebar was updated');

  // Trigger playPet
  commands['codecritter.playPet']();
  assert.ok(infoMessage.includes('You played'), 'info message shown');
  assert.ok(statusBar.text.includes('celebrating'), 'status bar displays celebrating mood');
  assert.equal(dashboardUpdatedMood, 'celebrating', 'dashboard updated to celebrating');

  // Cleanup
  deactivate();
  timers.forEach(t => clearTimeout(t));
  done();
});
