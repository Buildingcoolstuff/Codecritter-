'use strict';

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { PET_THEMES } = require('./moods');

class SidebarProvider {
  /**
   * @param {vscode.ExtensionContext} context
   * @param {import('./stats').StatsEngine} statsEngine
   * @param {function} getPetName
   * @param {function} getCurrentMood
   */
  constructor(context, statsEngine, getPetName, getCurrentMood) {
    this.context = context;
    this.stats = statsEngine;
    this.getPetName = getPetName;
    this.getCurrentMood = getCurrentMood;
    /** @type {vscode.WebviewView | undefined} */
    this._view = undefined;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri]
    };
    this.update();
  }

  update() {
    if (!this._view) return;
    
    const config = vscode.workspace.getConfiguration('codecritter');
    const themeKey = config.get('petTheme', 'default');
    const theme = PET_THEMES[themeKey] || PET_THEMES.default;
    const petSpecies = config.get('petSpecies', 'alien');

    const stats = this.stats.getSnapshot();
    const currentMood = this.getCurrentMood();
    const petName = this.getPetName();

    const htmlPath = path.join(__dirname, '..', 'media', 'sidebar.html');
    let html = 'Sidebar HTML not found.';
    try {
      html = fs.readFileSync(htmlPath, 'utf8');
    } catch(e) {}

    const replacements = {
      '__PET_NAME__':        _esc(petName),
      '__LEVEL__':           String(stats.level),
      '__XP_PROGRESS__':     String(stats.xpProgress),
      '__CURRENT_MOOD__':    currentMood,
      '__THEME_BODY__':      theme.body,
      '__THEME_BODY_ALT__':  theme.bodyAlt,
      '__THEME_ACCENT__':    theme.accent,
      '__THEME_ANTENNAE__':  theme.antennae,
      '__THEME_LABEL__':     _esc(theme.label),
      '__PET_SPECIES__':     _esc(petSpecies)
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
    this._view.webview.html = html;
  }
}

function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { SidebarProvider };
