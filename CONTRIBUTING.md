# Contributing to CodeCritter 🐾

Thanks for wanting to improve CodeCritter! Contributions of all kinds are welcome — bug fixes, new features, better emoji ideas, you name it.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (any recent LTS)
- [VS Code](https://code.visualstudio.com/) (1.85+)
- Git

### Setup

```bash
# 1. Fork the repo on GitHub, then clone your fork:
git clone https://github.com/<your-username>/Codecritter-.git
cd Codecritter-

# 2. Install dev dependencies:
npm install

# 3. Open the folder in VS Code:
code .
```

### Running the Extension

1. Press **F5** inside VS Code.
2. A second **"Extension Development Host"** window opens with CodeCritter active.
3. Type code, save files, trigger errors, and watch the status bar change.
4. Open the Command Palette (`Ctrl+Shift+P`) and run **CodeCritter: Show Dashboard** to see the pet panel.

---

## 🗂️ Project Structure

```
codecritter/
├── extension.js          ← Entry point — wires everything together
├── package.json          ← Manifest (commands, settings, metadata)
├── src/
│   ├── stats.js          ← StatsEngine — all data tracking
│   ├── moods.js          ← Mood definitions, milestones, messages
│   └── dashboard.js      ← Webview panel controller
├── media/
│   ├── dashboard.html    ← Dashboard UI (animated SVG pet + stats)
│   └── icon.svg          ← Extension icon
├── CHANGELOG.md
└── README.md
```

---

## 🎨 Adding a New Mood

1. Open `src/moods.js` and add your mood to the `MOODS` object:
   ```js
   myMood: {
     emoji: '😎',
     statusText: '😎',
     label: 'Cool',
     tip: 'Looking good!',
     animClass: 'pet-myMood'
   }
   ```

2. Add a CSS animation in `media/dashboard.html` under the `/* Pet Animations */` section:
   ```css
   @keyframes myAnim { ... }
   .pet-myMood { animation: myAnim 2s ease-in-out infinite; }
   ```

3. Add a mood overlay SVG group and JavaScript handling for it in the `applyMood()` function in `dashboard.html`.

4. Trigger it from `extension.js` wherever appropriate.

---

## 🏅 Adding a New Milestone

In `src/moods.js`, add an entry to the `MILESTONES` array:

```js
{
  id:    'my_milestone',       // unique string ID
  emoji: '🎸',
  label: 'Rock Star',
  desc:  '500 saves',
  check: s => s.saveCount >= 500  // receives a stats snapshot
}
```

That's it! The system handles detection, display, and deduplication automatically.

---

## 📋 Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Test with `F5` before submitting
- Update `CHANGELOG.md` under a new `[Unreleased]` section
- Be kind in code review — we're all here for fun 🐾

---

## 🐛 Reporting Bugs

[Open an issue](https://github.com/Buildingcoolstuff/Codecritter-/issues) with:
- VS Code version
- OS (Windows / macOS / Linux)
- What you expected vs. what happened
- Steps to reproduce

---

## 💡 Feature Ideas

Check the [Issues tab](https://github.com/Buildingcoolstuff/Codecritter-/issues) for existing ideas or open a new one. Good first ideas:

- Sound effects (optional, off by default)
- More pet skins / color themes
- Weekly summary notification
- "Pet of the day" tip
- Webview panel sidebar mode

---

Made with ☕ and 🐾 — happy coding!
