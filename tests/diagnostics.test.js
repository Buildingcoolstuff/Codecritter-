'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('diagnostics queries only distinct visible documents and credits fixed errors', () => {
  const disposable = { dispose() {} };
  const calls = [];
  let onDiagnostics;
  let fixed = 0;
  const uri = { toString: () => 'file:///visible.js' };
  let diagnostics = [{ severity: 0 }, { severity: 1 }];
  const statusBar = { show() {}, hide() {} };
  const vscode = {
    DiagnosticSeverity: { Error: 0 },
    StatusBarAlignment: { Right: 1 },
    MarkdownString: class { constructor(value) { this.value = value; } },
    commands: { registerCommand: () => disposable },
    workspace: {
      getConfiguration: () => ({ get: (key, fallback) => key === 'weeklyReview' ? false : fallback }),
      onDidSaveTextDocument: () => disposable,
      onDidChangeTextDocument: () => disposable,
      onDidChangeConfiguration: () => disposable
    },
    window: {
      createStatusBarItem: () => statusBar,
      registerWebviewViewProvider: () => disposable,
      visibleTextEditors: [{ document: { uri } }, { document: { uri } }]
    },
    languages: {
      onDidChangeDiagnostics: callback => { onDiagnostics = callback; return disposable; },
      getDiagnostics: requested => {
        assert.equal(requested, uri, 'must never scan the workspace');
        calls.push(requested);
        return diagnostics;
      }
    }
  };
  const dependencies = {
    vscode,
    './src/stats': { StatsEngine: class {
      getLevel() { return 1; }
      getSnapshot() { return { level: 1, saveCount: 0, linesTyped: 0, currentStreak: 0, errorsFixed: fixed }; }
      recordErrorFixed() { fixed++; }
    } },
    './src/moods': {
      getMoodDisplay: mood => ({ statusText: mood, label: mood, tip: '' }),
      checkMilestones: () => [],
      PET_THEMES: { default: { label: 'Default' } }
    },
    './src/dashboard': { updateDashboardIfOpen() {} },
    './src/sidebar': { SidebarProvider: class { update() {} } }
  };
  const sandbox = {
    module: { exports: {} },
    require: name => { assert.ok(name in dependencies); return dependencies[name]; },
    setInterval: () => 0,
    setTimeout: () => 0,
    clearInterval() {},
    clearTimeout() {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'extension.js'), 'utf8'), sandbox);
  sandbox.module.exports.activate({ subscriptions: [] });

  onDiagnostics();
  assert.equal(calls.length, 1, 'split editors must not double-count one document');
  assert.match(statusBar.text, /struggling/);

  diagnostics = [];
  onDiagnostics();
  assert.equal(fixed, 1, 'warnings must not count as fixed errors');
  assert.match(statusBar.text, /focused/);

  calls.length = 0;
  vscode.window.visibleTextEditors = [];
  onDiagnostics();
  assert.equal(calls.length, 0, 'no editor means no diagnostic query');
  assert.equal(fixed, 1);
});
