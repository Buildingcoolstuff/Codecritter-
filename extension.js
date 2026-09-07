const vscode = require('vscode');

let statusBarItem;
let idleTimer;
let lastActivity = Date.now();
let saveCount = 0;
let extContext;

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

function setMood(mood) {
  const faces = {
    happy: '🐾 (^ᴥ^)',
    bored: '🐾 (._.)',
    sleepy: '🐾 (-.-) zzz',
    excited: '🐾 (★‿★)!!'
  };
  statusBarItem.text = faces[mood] || faces.happy;
  statusBarItem.tooltip = `CodeCritter — Level ${getLevel()} · ${saveCount} saves. Click to say hi!`;
}

function flash(mood) {
  setMood(mood);
  setTimeout(() => setMood('happy'), 2000);
}

function activate(context) {
  extContext = context;
  saveCount = context.globalState.get('codecritter.saveCount', 0);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'codecritter.sayHi';
  setMood('happy');
  statusBarItem.show();

  const sayHiCmd = vscode.commands.registerCommand('codecritter.sayHi', () => {
    vscode.window.showInformationMessage(
      `🐾 CodeCritter (Lv.${getLevel()}): ${pick(HI_MESSAGES)}`
    );
  });

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
    onSave,
    onChange,
    { dispose: () => clearInterval(idleTimer) }
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
