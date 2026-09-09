# CodeCritter 🐾

A tiny pet that lives in your VS Code status bar and reacts to how you code.

- **Actively typing** → happy
- **Idle 3+ minutes** → bored
- **Idle 10+ minutes** → sleepy
- **Every save** → excited flash, and it gains XP
- **Click it** → it says hi and tells you its level

Levels up every 10 saves. Fully local — no data ever leaves your machine.

## Running it locally (during development)

1. Open this folder in VS Code.
2. Press `F5`. This launches a second "Extension Development Host" window with CodeCritter active.
3. Type and save files in that window and watch the status bar (bottom-right).

## Publishing (later, free)

1. Create a free publisher account at https://marketplace.visualstudio.com/manage
2. Install the packaging tool: `npm install -g @vscode/vsce`
3. Package it: `vsce package` (produces a `.vsix` file anyone can install manually)
4. Publish it: `vsce publish` (puts it on the Marketplace for free, one `ext install` away for anyone)
