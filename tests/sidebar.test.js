'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('Issue #30: SidebarProvider disposes previous message listener when view is reopened', () => {
  let executedCommand = null;
  const vscode = {
    commands: {
      executeCommand: cmd => { executedCommand = cmd; }
    },
    workspace: {
      getConfiguration: () => ({ get: (k, def) => def })
    }
  };

  const dependencies = {
    vscode,
    path,
    fs,
    './moods': {
      PET_THEMES: { default: { label: 'Default', body: '', bodyAlt: '', accent: '', antennae: '' } }
    },
    './pets': {
      getPetSvg: () => '__ACCESSORIES__',
      getAccessoriesSvg: () => ''
    }
  };

  const sandbox = {
    module: { exports: {} },
    require: name => dependencies[name] || require(name),
    __dirname: path.join(__dirname, '..', 'src')
  };

  const sidebarCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'sidebar.js'), 'utf8');
  vm.runInNewContext(sidebarCode, sandbox);
  const SidebarProvider = sandbox.module.exports.SidebarProvider;

  const mockContext = {
    extensionUri: { toString: () => 'file:///ext' },
    subscriptions: []
  };

  const mockStats = {
    getSnapshot: () => ({ level: 1, xpProgress: 0 })
  };

  const provider = new SidebarProvider(
    mockContext,
    mockStats,
    () => 'Critter',
    () => 'happy'
  );

  let firstListenerDisposed = false;
  let secondListenerDisposed = false;
  let activeMessageHandler = null;

  // First time resolving view
  const mockWebviewView1 = {
    webview: {
      options: {},
      html: '',
      onDidReceiveMessage: handler => {
        activeMessageHandler = handler;
        return {
          dispose: () => { firstListenerDisposed = true; }
        };
      }
    },
    onDidDispose: () => {}
  };

  provider.resolveWebviewView(mockWebviewView1);
  assert.equal(firstListenerDisposed, false, 'first listener must be active initially');

  // Trigger message on first view
  activeMessageHandler({ command: 'openDashboard' });
  assert.equal(executedCommand, 'codecritter.showDashboard');

  // Second time resolving view (e.g. view hidden and reopened)
  const mockWebviewView2 = {
    webview: {
      options: {},
      html: '',
      onDidReceiveMessage: () => {
        return {
          dispose: () => { secondListenerDisposed = true; }
        };
      }
    },
    onDidDispose: () => {}
  };

  provider.resolveWebviewView(mockWebviewView2);

  // The first listener must have been disposed when resolving the second view!
  assert.equal(firstListenerDisposed, true, 'previous message listener must be disposed on view reopen');
  assert.equal(secondListenerDisposed, false, 'new message listener must remain active');

  // Disposing provider cleans up second listener
  provider.dispose();
  assert.equal(secondListenerDisposed, true, 'provider.dispose() must dispose active listener');
});

test('Issue #28: media/sidebar.html renders clean UTF-8 emojis without Mojibake artifacts', () => {
  const sidebarHtml = fs.readFileSync(path.join(__dirname, '..', 'media', 'sidebar.html'), 'utf8');
  assert.equal(sidebarHtml.includes('dY"S'), false, 'must not contain Mojibake dY"S');
  assert.equal(sidebarHtml.includes('📊 Full Dashboard'), true, 'must render standard 📊 Full Dashboard button');
});

test('Issue #29: media/sidebar.html includes strict Content-Security-Policy meta tag', () => {
  const sidebarHtml = fs.readFileSync(path.join(__dirname, '..', 'media', 'sidebar.html'), 'utf8');
  assert.match(
    sidebarHtml,
    /<meta\s+http-equiv=["']Content-Security-Policy["']/i,
    'sidebar.html must define a Content-Security-Policy'
  );
});

test('Issue #29: .vscodeignore excludes internal scripts, tests, and CI workflows', () => {
  const vscodeignore = fs.readFileSync(path.join(__dirname, '..', '.vscodeignore'), 'utf8');
  assert.ok(vscodeignore.includes('scripts/**'), '.vscodeignore must exclude scripts/**');
  assert.ok(vscodeignore.includes('.github/**'), '.vscodeignore must exclude .github/**');
  assert.ok(vscodeignore.includes('tests/**'), '.vscodeignore must exclude tests/**');
});
