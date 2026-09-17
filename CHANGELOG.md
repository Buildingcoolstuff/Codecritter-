# Changelog

All notable changes to **CodeCritter** are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] — 2026-09-17

*Competitor research edition — features inspired by gaps in vscode-pets, Code Tamagotchi, LevelUp, and Power Mode.*

### ✨ Added

#### 🎨 Pet Theme Selector (4 skins)
- New command: **CodeCritter: Choose Pet Theme 🎨** (quick-pick menu)
- New setting: `codecritter.petTheme` — `default` / `fire` / `galaxy` / `nature`
- Dashboard SVG critter now changes color completely based on the selected theme
- Theme name shown in the status bar tooltip and as a badge in the dashboard

#### ⚡ Typing Combo Meter
- When typing at least 2 new lines rapidly, the status bar flashes `⚡ 🔥` (comboTyping mood)
- Unique feature not found in any competitor — gives instant positive feedback for momentum
- Resets automatically after 4 seconds of inactivity

#### 💧 Break Reminder System
- New setting: `codecritter.breakReminder` (default: off) — stress-free by default
- New setting: `codecritter.breakReminderInterval` (default: 45 min)
- After N minutes of continuous coding, critter nudges you to take a break
- Includes a "Snooze 15 min" button so it's never annoying

#### 📅 Weekly Monday Review
- New setting: `codecritter.weeklyReview` (default: on)
- On the first VS Code open each Monday, shows a one-line summary of your all-time stats
- Includes an "Open Dashboard" button — inspired by Spotify Wrapped style summaries

### 🔧 Fixed
- **Line count paste inflation**: Large pastes (e.g., copying a 500-line file) now cap at 10 lines per change event. Previously, pasting 500 lines would incorrectly award 500 XP.
- **Diagnostics scope**: Error detection is now scoped to *visible editors only* (not the entire workspace), reducing false `struggling 😰` triggers from background linting

---


## [1.0.0] — 2026-09-17

### ✨ Added — Major Feature Release

#### Animated Dashboard
- New command: **CodeCritter: Show Dashboard** (`Ctrl+Shift+P` → search it)
- Fully animated SVG pet with 7 distinct mood states, each with unique CSS animations
- Mood overlays: ⭐ stars for excited, 💤 floating Zzz for sleepy, 🐛 bugs for struggling, ⚡ lightning for focused, 🎉 confetti for celebrating
- Blinking eyes with CSS animation
- Fake code on the critter's laptop screen (with a blinking cursor!)
- XP progress bar toward the next level
- Stats grid: saves, lines typed, errors fixed, coding time
- Daily goal progress bar (turns gold when completed)
- Coding streaks panel (current + longest)
- 11 achievement badges (greyed out until unlocked)
- Fully theme-aware — works in light, dark, and high-contrast VS Code themes

#### Real Emoji Status Bar
- Status bar now uses native OS emoji instead of ASCII faces
- 🐱 Happy · 🤩 Excited · 😑 Bored · 😴 Sleepy · 🧠 Focused · 😰 Struggling · 🥳 Celebrating
- Rich markdown tooltip with all key stats at a glance

#### Stats Engine (`src/stats.js`)
- Tracks: total saves, lines typed, errors fixed, total coding minutes, daily lines typed
- **Coding streaks**: consecutive days with any coding activity
- **Session time**: minutes actively coding in the current VS Code session
- All data stored in `globalState` — 100% local, never sent anywhere

#### Mood System (`src/moods.js`)
- 7 moods with real emoji (rendered natively by your OS)
- Error-aware: switches to `struggling 😰` when diagnostics show errors; switches to `focused 🧠` when all errors are cleared
- Idle detection: `bored 😑` after 3 min, `sleepy 😴` after 10 min

#### 11 Achievements / Milestones
- 🐾 First Steps — 10 saves
- 💾 Save Master — 100 saves
- ⭐ Seasoned Critter — Level 10
- 🚀 Code Veteran — Level 25
- 💻 Keyboard Warrior — 1,000 lines typed
- ⌨️ Code Machine — 10,000 lines typed
- 🐛 Bug Hunter — 10 errors fixed
- 🔫 Bug Slayer — 50 errors fixed
- 🔥 On a Roll — 3-day streak
- 🌟 On Fire! — 7-day streak
- 🏆 Unstoppable — 30-day streak

#### Daily Goals
- Configurable daily lines-typed goal (default: 100)
- Notification + celebrating mood when goal is hit
- Progress bar in the dashboard resets each day

#### New Commands
- `CodeCritter: Show Dashboard 📊`
- `CodeCritter: Reset All Stats 🗑️`
- `CodeCritter: Set Daily Goal 🎯`

#### New Settings
| Setting | Default | Description |
|---|---|---|
| `codecritter.petName` | `"Critter"` | Name your CodeCritter |
| `codecritter.dailyGoal` | `100` | Lines-typed daily goal |
| `codecritter.enableTips` | `true` | Coding tips in hi messages |
| `codecritter.showInStatusBar` | `true` | Toggle status bar visibility |
| `codecritter.statusBarAlignment` | `"right"` | Left or right alignment |

### 🔧 Changed
- `extension.js` fully refactored into modular `src/` architecture
- `package.json` updated to v1.0.0 with full marketplace metadata, keywords, gallery banner, and bug tracker URL
- README rewritten for end users (install instructions, features, settings, commands)

---

## [0.0.1] — Initial Release

- Basic status bar pet with ASCII faces
- 4 moods: happy, bored, sleepy, excited
- Save counter + level system
- Click to "say hi"
