<div align="center">

# 🐾 CodeCritter

**A virtual coding companion that lives in your VS Code status bar.**  
It reacts to how you code — with real emoji, an animated pet dashboard, streaks, achievements, daily goals, and personalized themes!

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.85+-blue.svg)](https://code.visualstudio.com/)
[![Version](https://img.shields.io/badge/version-1.1.0-brightgreen.svg)](CHANGELOG.md)
[![CI Build](https://github.com/Buildingcoolstuff/Codecritter-/actions/workflows/ci.yml/badge.svg)](https://github.com/Buildingcoolstuff/Codecritter-/actions)

</div>

---

## ✨ What is CodeCritter?

CodeCritter is a tiny virtual pet that lives in your VS Code status bar and reacts to everything you do:

- **Actively typing** → 🐱 Happy
- **Typing really fast** → ⚡ On Fire (Combo Meter!)
- **Just saved** → 🤩 Excited (XP gained!)
- **Errors in your code** → 😰 Struggling
- **Fixed all errors** → 🧠 Focused
- **Idle 3+ minutes** → 😑 Bored
- **Idle 10+ minutes** → 😴 Sleepy
- **Hit a milestone/daily goal** → 🥳 Celebrating

**Click it** → it says hi with a motivational message.  
**Open the Dashboard** → see your pet animated in the browser with full stats and customized color themes.

---

## 📦 Installation

### Option A — VS Code Marketplace *(coming soon)*

Search for **CodeCritter** in the Extensions panel (`Ctrl+Shift+X`) and click Install.

### Option B — Install from `.vsix`

1. Go to the [Releases page](https://github.com/Buildingcoolstuff/Codecritter-/releases)
2. Download the latest `.vsix` file
3. In VS Code: `Extensions` → `···` menu → `Install from VSIX…`

### Option C — Run from source

```bash
git clone https://github.com/Buildingcoolstuff/Codecritter-.git
cd Codecritter-
npm install
code .
# Press F5 to launch in Extension Development Host
```

---

## 🎮 Features (New in v1.1.0!)

### 🎨 Pet Themes (Color Skins)
Choose a personalized color palette for your pet:
- **Default (Teal)**, **Fire (Orange)**, **Galaxy (Purple)**, **Nature (Green)**
- *Command: `CodeCritter: Choose Pet Theme 🎨`*

### ⚡ Typing Combo Meter
CodeCritter tracks your coding momentum! If you type rapidly without stopping, your status bar pet catches fire `⚡ 🔥` to cheer you on. 

### 💧 Break Reminders
Avoid burnout. CodeCritter can gently nudge you to take a break after continuous coding (e.g., 45 minutes) with a handy "Snooze" button. Stress-free and disabled by default.

### 📅 Weekly Monday Review
Start your week right! On Monday mornings, CodeCritter will give you a brief pop-up summarizing your all-time lines typed, files saved, and best streak (like Spotify Wrapped for your code).

### 🌡️ 8 Real Emoji Moods

| Emoji | Mood | When |
|:---:|---|---|
| 🐱 | Happy | You're actively coding |
| ⚡ | On Fire | Typing combo streak |
| 🤩 | Excited | Just saved a file |
| 😑 | Bored | Idle 3+ minutes |
| 😴 | Sleepy | Idle 10+ minutes |
| 🧠 | Focused | Cleared all errors |
| 😰 | Struggling | Active errors in visible editors |
| 🥳 | Celebrating | Goal hit / milestone unlocked |

### 📊 Animated Dashboard

Open the dashboard with: `Ctrl+Shift+P` → **CodeCritter: Show Dashboard 📊**

- **Animated SVG pet** with mood-specific animations (bobbing, bouncing, shaking, glowing, confetti…)
- **XP bar** to the next level
- **All-time stats**: saves, lines typed, errors fixed, coding time
- **Daily goal progress bar** (resets every day)
- **Streak tracker**: current + best streak
- **11 achievement badges** (locked until earned)

### 🏅 11 Achievements

| Achievement | How to Earn |
|---|---|
| 🐾 First Steps | 10 saves |
| 💾 Save Master | 100 saves |
| ⭐ Seasoned Critter | Level 10 |
| 🚀 Code Veteran | Level 25 |
| 💻 Keyboard Warrior | 1,000 lines typed |
| ⌨️ Code Machine | 10,000 lines typed |
| 🐛 Bug Hunter | 10 errors fixed |
| 🔫 Bug Slayer | 50 errors fixed |
| 🔥 On a Roll | 3-day coding streak |
| 🌟 On Fire! | 7-day coding streak |
| 🏆 Unstoppable | 30-day coding streak |

### 🔒 100% Private

All data is stored **locally in VS Code's globalState**. Nothing is ever sent to any server, ever.

---

## ⚙️ Settings

Go to `File → Preferences → Settings` and search `codecritter`:

| Setting | Default | Description |
|---|---|---|
| `codecritter.petName` | `"Critter"` | Name your CodeCritter |
| `codecritter.petTheme` | `"default"` | Change the color skin (fire, galaxy, etc.) |
| `codecritter.dailyGoal` | `100` | Daily lines-typed goal |
| `codecritter.breakReminder` | `false` | Remind you to take a break after coding straight |
| `codecritter.breakReminderInterval` | `45` | Minutes of continuous coding before a reminder |
| `codecritter.weeklyReview` | `true` | Show a weekly stat summary on Monday mornings |
| `codecritter.enableTips` | `true` | Show tips in hi messages |
| `codecritter.showInStatusBar` | `true` | Toggle status bar pet |
| `codecritter.statusBarAlignment` | `"right"` | Left or right side |

---

## 🖱️ Commands

Open the Command Palette (`Ctrl+Shift+P`) and type **CodeCritter**:

| Command | What it does |
|---|---|
| `CodeCritter: Say Hi 👋` | Pet says hi with a motivational message |
| `CodeCritter: Show Dashboard 📊` | Opens the animated stats dashboard |
| `CodeCritter: Choose Pet Theme 🎨`| Pick a new color scheme for your pet |
| `CodeCritter: Set Daily Goal 🎯` | Set your daily lines goal |
| `CodeCritter: Reset All Stats 🗑️` | Wipe everything and start over |

---

## 🤝 Contributing

PRs and issues are very welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

Ideas for future features:
- More pet skins & colors
- Optional sound effects
- Sidebar panel mode

---

## 📄 License

[MIT](LICENSE) — made with ☕ by [Buildingcoolstuff](https://github.com/Buildingcoolstuff)
