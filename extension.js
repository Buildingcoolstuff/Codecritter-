const vscode = require('vscode');

let statusBarItem;
let idleTimer;
let lastActivity = Date.now();
let saveCount = 0;
let extContext;
let currentMood = 'happy';
let sidebarWebview;

const HI_MESSAGES = [
  "You're doing great! 🐾",
  "Ooh, what are we building today?",
  "Beep boop, still here, still cheering for you.",
  "Ship it. I believe in you.",
  "Save early, save often — I love it when you do."
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLevel() {
  return Math.floor(saveCount / 10) + 1;
}

function sayHi() {
  vscode.window.showInformationMessage(
    `🐾 CodeCritter (Lv.${getLevel()}): ${pick(HI_MESSAGES)}`
  );
}

function setMood(mood) {
  currentMood = mood;
  const faces = {
    happy: '🐾 (^ᴥ^)',
    bored: '🐾 (._.)',
    sleepy: '🐾 (-.-) zzz',
    excited: '🐾 (★‿★)!!'
  };
  statusBarItem.text = faces[mood] || faces.happy;
  statusBarItem.tooltip = `CodeCritter — Level ${getLevel()} · ${saveCount} saves. Click to say hi!`;

  if (sidebarWebview) {
    sidebarWebview.postMessage({ type: 'mood', mood, level: getLevel(), saveCount });
  }
}

function flash(mood) {
  setMood(mood);
  setTimeout(() => setMood('happy'), 2000);
}

function getWebviewHtml() {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; text-align: center; padding-top: 24px;
    color: var(--vscode-foreground); background: var(--vscode-sideBar-background); }
  .pet { width: 120px; height: 120px; margin: 0 auto; border-radius: 50%;
    background: rgba(100,255,218,0.13); border: 3px solid #64ffda;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; transition: transform .15s; }
  .pet:active { transform: scale(0.93); }
  .eyes { display: flex; gap: 22px; margin-bottom: 8px; }
  .eye { width: 10px; height: 10px; background: currentColor; border-radius: 50%; }
  .mouth { width: 24px; height: 12px; border-bottom: 3px solid currentColor; border-radius: 0 0 12px 12px; }
  .sleepy .eye { height: 2px; border-radius: 1px; }
  .sleepy .mouth { border-radius: 12px; height: 8px; }
  .bored .eye { height: 3px; border-radius: 2px; }
  .bored .mouth { border-bottom-width: 2px; border-radius: 0; width: 20px; }
  .excited .eye { width: 12px; height: 12px; }
  .excited .mouth { height: 16px; border-bottom-width: 4px; }
  #level { margin-top: 14px; font-size: 13px; opacity: .8; }
  #hint { margin-top: 6px; font-size: 11px; opacity: .5; }
</style>
</head>
<body>
  <div class="pet happy" id="pet">
    <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
    <div class="mouth"></div>
  </div>
  <div id="level">Level 1 · 0 saves</div>
  <div id="hint">click me!</div>
  <script>
    const vscode = acquireVsCodeApi();
    const pet = document.getElementById('pet');
    const levelEl = document.getElementById('level');
    pet.addEventListener('click', () => vscode.postMessage({ type: 'petClicked' }));
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'mood') {
        pet.className = 'pet ' + msg.mood;
        levelEl.textContent = 'Level ' + msg.level + ' · ' + msg.saveCount + ' saves';
      }
    });
  </script>
</body>
</html>`;
}

const sidebarProvider = {
  resolveWebviewView(webviewView) {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = getWebviewHtml();
    sidebarWebview = webviewView.webview;

    sidebarWebview.postMessage({ type: 'mood', mood: currentMood, level: getLevel(), saveCount });

    webviewView.webview.onDidReceiveMessage(message => {
      if (message.type === 'petClicked') sayHi();
    });

    webviewView.onDidDispose(() => {
      sidebarWebview = undefined;
    });
  }
};

function activate(context) {
  extContext = context;
  saveCount = context.globalState.get('codecritter.saveCount', 0);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'codecritter.sayHi';
  setMood('happy');
  statusBarItem.show();

  const sayHiCmd = vscode.commands.registerCommand('codecritter.sayHi', sayHi);
  const viewProvider = vscode.window.registerWebviewViewProvider('codecritter.petView', sidebarProvider);

  const onSave = vscode.workspace.onDidSaveTextDocument(() => {
    lastActivity = Date.now();
    saveCount++;
    extContext.globalState.update('codecritter.saveCount', saveCount);
    flash('excited');
  });

  const onChange = vscode.workspace.onDidChangeTextDocument(() => {
    lastActivity = Date.now();
  });

  idleTimer = setInterval(() => {
    const idleMinutes = (Date.now() - lastActivity) / 60000;
    if (idleMinutes > 10) setMood('sleepy');
    else if (idleMinutes > 3) setMood('bored');
    else setMood('happy');
  }, 30000);

  context.subscriptions.push(
    statusBarItem,
    sayHiCmd,
    viewProvider,
    onSave,
    onChange,
    { dispose: () => clearInterval(idleTimer) }
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
