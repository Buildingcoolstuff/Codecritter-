const { execSync } = require('child_process');

const ghPath = '"C:\\Program Files\\GitHub CLI\\gh.exe"';

const issues = [
  // Good First Issues
  {
    title: 'Add space helmet accessory for Level 25',
    body: 'We need a new SVG accessory (space helmet) specifically for the Alien pet when reaching level 25. See `src/pets.js` to add the SVG block.',
    labels: ['enhancement', 'good first issue']
  },
  {
    title: 'New Pet Species: Dog',
    body: 'Add a new `dog` species to the `codecritter.petSpecies` setting. You will need to design a simple SVG dog and add it to `src/pets.js`.',
    labels: ['enhancement', 'good first issue']
  },
  {
    title: 'New Dashboard Theme: Nature',
    body: 'The dashboard currently has Fire and Galaxy themes. Add a "Nature" theme with green/earthy tones in `package.json` and `src/dashboard.js`.',
    labels: ['enhancement', 'good first issue']
  },
  {
    title: 'XP Bar Tooltip',
    body: 'Hovering over the XP bar should show the exact XP remaining until the next level (e.g. "450 / 1000 XP"). Update `media/dashboard.html`.',
    labels: ['enhancement', 'good first issue']
  },
  {
    title: 'Add "Feed" button to dashboard UI',
    body: 'Currently you can only feed the pet via the command palette. Add a "Feed" button to `media/dashboard.html` that sends a message back to the extension.',
    labels: ['enhancement', 'good first issue']
  },
  {
    title: 'Add "Play" button to dashboard UI',
    body: 'Currently you can only play with the pet via the command palette. Add a "Play" button to `media/dashboard.html`.',
    labels: ['enhancement', 'good first issue']
  },
  {
    title: 'High-res Extension Icon',
    body: 'The current extension icon is an SVG, but the marketplace requires a high-res PNG (256x256). Please convert `media/icon.svg` to PNG and update `package.json`.',
    labels: ['enhancement', 'good first issue']
  },
  {
    title: 'Milestone Notification: 1000 Lines',
    body: 'When the user types 1000 lines, trigger a special VS Code notification pop-up saying "Keyboard Warrior! 1000 lines typed!".',
    labels: ['enhancement', 'good first issue']
  },
  {
    title: 'Fix typos in CHANGELOG.md',
    body: 'There are a few minor typos in the v1.1.0 release notes in `CHANGELOG.md`. Please fix them.',
    labels: ['documentation', 'good first issue']
  },
  {
    title: 'Command to rename pet',
    body: 'Add a command `CodeCritter: Rename Pet` that prompts the user for a new name and updates the `codecritter.petName` setting.',
    labels: ['enhancement', 'good first issue']
  },

  // Standard Enhancements
  {
    title: 'Sound effects on level up',
    body: 'Play a small "tada" sound effect when the pet levels up. This should be controlled by a new setting `codecritter.enableSound`.',
    labels: ['enhancement']
  },
  {
    title: 'Activity Bar container',
    body: 'Move the Sidebar view from the Explorer panel into its own dedicated Activity Bar icon.',
    labels: ['enhancement']
  },
  {
    title: 'Migrate SVG generation to Mustache templates',
    body: 'Generating SVGs using string concatenation in `src/pets.js` is getting messy. Let\'s refactor this to use Mustache or Handlebars templates.',
    labels: ['refactor']
  },
  {
    title: 'Pet mood does not reset after system sleep',
    body: 'If VS Code is left open and the computer goes to sleep, the pet\'s mood gets stuck on "Sleepy" indefinitely. We need to detect wake events or reset on active editor change.',
    labels: ['bug']
  },
  {
    title: 'Export pet state to PNG',
    body: 'Add a button in the dashboard to download a PNG image of the pet\'s current mood and accessories.',
    labels: ['enhancement']
  },
  {
    title: 'Settings Sync support for stats',
    body: 'Store the XP and level in a way that syncs across devices using VS Code Settings Sync, rather than just local `globalState`.',
    labels: ['enhancement']
  },
  {
    title: 'WakaTime integration',
    body: 'Pull accurate coding time from the WakaTime extension API instead of just relying on our idle timer.',
    labels: ['enhancement']
  },
  {
    title: 'Focus Mode',
    body: 'Add a "Focus Mode" command that maximizes the editor, hides the sidebar, and places the pet directly above the minimap.',
    labels: ['enhancement']
  },
  {
    title: 'Migrate to TypeScript',
    body: 'Rewrite the extension in TypeScript to catch bugs early and provide better autocompletion for contributors.',
    labels: ['refactor']
  },
  {
    title: 'Bundle with esbuild',
    body: 'The extension currently ships raw JS files. Set up esbuild to bundle the extension for faster startup times.',
    labels: ['build']
  }
];

console.log(`Preparing to create ${issues.length} issues via GitHub CLI...`);

let successCount = 0;
let failCount = 0;

for (const issue of issues) {
  try {
    const labelsArg = issue.labels.map(l => `"${l}"`).join(',');
    const cmd = `${ghPath} issue create --title "${issue.title}" --body "${issue.body}" --label ${labelsArg}`;
    console.log(`Creating: ${issue.title}`);
    execSync(cmd, { stdio: 'inherit' });
    successCount++;
  } catch (error) {
    console.error(`Failed to create issue: ${issue.title}`);
    failCount++;
  }
}

console.log(`\nFinished! Created ${successCount} issues. Failed: ${failCount}.`);
