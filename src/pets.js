'use strict';

/**
 * Returns the SVG string for the requested pet species.
 * The SVGs use CSS variables (--pet-body, etc.) so themes work automatically across all species.
 */
function getPetSvg(species) {
  const ALIEN = `
    <g class="pet-shadow">
      <ellipse cx="70" cy="152" rx="30" ry="5" fill="rgba(0,0,0,0.18)"/>
    </g>
    <!-- Arms -->
    <path d="M 35 102 Q 18 96 16 84" stroke="var(--pet-antennae)" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M 105 102 Q 122 96 124 84" stroke="var(--pet-antennae)" stroke-width="9" stroke-linecap="round" fill="none"/>
    <!-- Laptop -->
    <rect x="24" y="130" width="92" height="8" rx="4" fill="#4a4a7a"/>
    <rect x="28" y="84" width="84" height="50" rx="7" fill="#5c5c8a"/>
    <rect x="31" y="87" width="78" height="40" rx="5" fill="#1e1e3a"/>
    <!-- Fake code -->
    <rect x="37" y="93"  width="42" height="3.5" rx="1.75" fill="#7c5cbf" opacity="0.9"/>
    <rect x="37" y="100" width="60" height="3.5" rx="1.75" fill="#4ecdc4" opacity="0.75"/>
    <rect x="37" y="107" width="28" height="3.5" rx="1.75" fill="#f39c12" opacity="0.65"/>
    <rect x="37" y="114" width="50" height="3.5" rx="1.75" fill="#2ecc71" opacity="0.7"/>
    <rect x="37" y="121" width="35" height="3.5" rx="1.75" fill="#9d7fe3" opacity="0.6"/>
    <!-- Body -->
    <ellipse cx="70" cy="108" rx="40" ry="37" fill="var(--pet-body)"/>
    <ellipse cx="70" cy="112" rx="24" ry="18" fill="rgba(255,255,255,0.13)"/>
    <path d="M 32 116 Q 70 124 108 116" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" fill="none"/>
    <path d="M 36 126 Q 70 133 104 126" stroke="rgba(0,0,0,0.06)" stroke-width="1.5" fill="none"/>
    <!-- Head -->
    <circle cx="70" cy="57" r="33" fill="var(--pet-body-alt)"/>
    <ellipse cx="58" cy="44" rx="12" ry="8" fill="rgba(255,255,255,0.18)" transform="rotate(-20,58,44)"/>
    <!-- Cheeks -->
    <ellipse cx="48" cy="68" rx="9" ry="6" fill="#ff9eb5" opacity="0.55"/>
    <ellipse cx="92" cy="68" rx="9" ry="6" fill="#ff9eb5" opacity="0.55"/>
    <!-- Eyes -->
    <g class="eye-l">
      <circle cx="57" cy="54" r="11" fill="white"/>
      <circle cx="57" cy="56" r="6.5" fill="#2d2d4a"/>
      <circle cx="59.5" cy="52.5" r="2.8" fill="white"/>
      <path d="M 49 44 Q 57 40 65 44" stroke="var(--pet-antennae)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </g>
    <g class="eye-r">
      <circle cx="83" cy="54" r="11" fill="white"/>
      <circle cx="83" cy="56" r="6.5" fill="#2d2d4a"/>
      <circle cx="85.5" cy="52.5" r="2.8" fill="white"/>
      <path d="M 75 44 Q 83 40 91 44" stroke="var(--pet-antennae)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </g>
    <!-- Mouth -->
    <g class="mouth-group">
      <g id="mouth-happy">
        <path d="M 60 72 Q 70 81 80 72" stroke="#2d2d4a" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      </g>
      <g id="mouth-sad" style="display:none">
        <path d="M 60 78 Q 70 70 80 78" stroke="#2d2d4a" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      </g>
      <g id="mouth-open" style="display:none">
        <ellipse cx="70" cy="76" rx="8" ry="6" fill="#2d2d4a"/>
        <ellipse cx="70" cy="74" rx="5" ry="3.5" fill="#e74c3c"/>
      </g>
      <g id="mouth-flat" style="display:none">
        <line x1="62" y1="75" x2="78" y2="75" stroke="#2d2d4a" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </g>
    <!-- Antennae -->
    <line x1="58" y1="26" x2="48" y2="7"  stroke="var(--pet-antennae)" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="82" y1="26" x2="92" y2="7"  stroke="var(--pet-antennae)" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="47" cy="6"  r="6" fill="var(--pet-accent)"/>
    <circle cx="93" cy="6"  r="6" fill="var(--pet-accent)"/>
    <!-- Legs -->
    <path d="M 50 138 Q 45 148 42 152" stroke="#3db5ac" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M 90 138 Q 95 148 98 152" stroke="#3db5ac" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M 62 140 Q 60 150 58 154" stroke="#3db5ac" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M 78 140 Q 80 150 82 154" stroke="#3db5ac" stroke-width="6" stroke-linecap="round" fill="none"/>
    __ACCESSORIES__
  `;

  const CAT = `
    <g class="pet-shadow">
      <ellipse cx="70" cy="152" rx="30" ry="5" fill="rgba(0,0,0,0.18)"/>
    </g>
    <!-- Tail -->
    <path d="M 100 130 Q 130 135 125 110 Q 120 85 135 95" stroke="var(--pet-body)" stroke-width="8" stroke-linecap="round" fill="none"/>
    <!-- Laptop -->
    <rect x="24" y="130" width="92" height="8" rx="4" fill="#4a4a7a"/>
    <rect x="28" y="84" width="84" height="50" rx="7" fill="#5c5c8a"/>
    <rect x="31" y="87" width="78" height="40" rx="5" fill="#1e1e3a"/>
    <rect x="37" y="93"  width="42" height="3.5" rx="1.75" fill="#7c5cbf" opacity="0.9"/>
    <!-- Body -->
    <ellipse cx="70" cy="115" rx="35" ry="30" fill="var(--pet-body)"/>
    <!-- Paws on laptop -->
    <circle cx="50" cy="135" r="6" fill="var(--pet-accent)"/>
    <circle cx="90" cy="135" r="6" fill="var(--pet-accent)"/>
    <!-- Head -->
    <circle cx="70" cy="65" r="30" fill="var(--pet-body-alt)"/>
    <!-- Ears -->
    <path d="M 45 45 L 35 15 L 60 38 Z" fill="var(--pet-body-alt)"/>
    <path d="M 95 45 L 105 15 L 80 38 Z" fill="var(--pet-body-alt)"/>
    <path d="M 43 42 L 38 22 L 55 38 Z" fill="var(--pet-accent)"/>
    <path d="M 97 42 L 102 22 L 85 38 Z" fill="var(--pet-accent)"/>
    <!-- Eyes -->
    <g class="eye-l">
      <circle cx="58" cy="60" r="7" fill="white"/>
      <circle cx="58" cy="60" r="4" fill="#2d2d4a"/>
    </g>
    <g class="eye-r">
      <circle cx="82" cy="60" r="7" fill="white"/>
      <circle cx="82" cy="60" r="4" fill="#2d2d4a"/>
    </g>
    <!-- Whiskers -->
    <line x1="45" y1="65" x2="25" y2="60" stroke="#2d2d4a" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="45" y1="70" x2="25" y2="75" stroke="#2d2d4a" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="95" y1="65" x2="115" y2="60" stroke="#2d2d4a" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="95" y1="70" x2="115" y2="75" stroke="#2d2d4a" stroke-width="1.5" stroke-linecap="round"/>
    <!-- Nose / Mouth -->
    <path d="M 68 70 L 72 70 L 70 73 Z" fill="#ff9eb5"/>
    <g class="mouth-group">
      <g id="mouth-happy">
        <path d="M 65 75 Q 70 80 75 75" stroke="#2d2d4a" stroke-width="2" stroke-linecap="round" fill="none"/>
      </g>
      <g id="mouth-sad" style="display:none">
        <path d="M 65 78 Q 70 73 75 78" stroke="#2d2d4a" stroke-width="2" stroke-linecap="round" fill="none"/>
      </g>
      <g id="mouth-open" style="display:none">
        <ellipse cx="70" cy="77" rx="4" ry="3" fill="#2d2d4a"/>
      </g>
      <g id="mouth-flat" style="display:none">
        <line x1="66" y1="76" x2="74" y2="76" stroke="#2d2d4a" stroke-width="2" stroke-linecap="round"/>
      </g>
    </g>
    __ACCESSORIES__
  `;

  const ROBOT = `
    <g class="pet-shadow">
      <ellipse cx="70" cy="152" rx="30" ry="5" fill="rgba(0,0,0,0.18)"/>
    </g>
    <!-- Laptop -->
    <rect x="24" y="130" width="92" height="8" rx="4" fill="#4a4a7a"/>
    <rect x="28" y="84" width="84" height="50" rx="7" fill="#5c5c8a"/>
    <rect x="31" y="87" width="78" height="40" rx="5" fill="#1e1e3a"/>
    <rect x="37" y="93"  width="42" height="3.5" rx="1.75" fill="#7c5cbf" opacity="0.9"/>
    <!-- Body -->
    <rect x="45" y="80" width="50" height="55" rx="5" fill="var(--pet-body)"/>
    <rect x="55" y="90" width="30" height="35" rx="2" fill="var(--pet-body-alt)"/>
    <!-- Head -->
    <rect x="35" y="30" width="70" height="45" rx="8" fill="var(--pet-body)"/>
    <!-- Ears (Antennae) -->
    <rect x="25" y="45" width="10" height="15" rx="2" fill="var(--pet-accent)"/>
    <rect x="105" y="45" width="10" height="15" rx="2" fill="var(--pet-accent)"/>
    <!-- Face Screen -->
    <rect x="45" y="40" width="50" height="25" rx="3" fill="#1e1e3a"/>
    <!-- Eyes -->
    <g class="eye-l">
      <rect x="52" y="45" width="12" height="6" rx="2" fill="var(--pet-antennae)"/>
    </g>
    <g class="eye-r">
      <rect x="76" y="45" width="12" height="6" rx="2" fill="var(--pet-antennae)"/>
    </g>
    <!-- Mouth -->
    <g class="mouth-group">
      <g id="mouth-happy">
        <path d="M 55 58 Q 70 63 85 58" stroke="var(--pet-accent)" stroke-width="2" stroke-linecap="round" fill="none"/>
      </g>
      <g id="mouth-sad" style="display:none">
        <line x1="55" y1="60" x2="85" y2="60" stroke="var(--pet-accent)" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g id="mouth-open" style="display:none">
        <rect x="65" y="56" width="10" height="4" rx="1" fill="var(--pet-accent)"/>
      </g>
      <g id="mouth-flat" style="display:none">
        <line x1="60" y1="58" x2="80" y2="58" stroke="var(--pet-accent)" stroke-width="2" stroke-linecap="round"/>
      </g>
    </g>
    <!-- Top Antenna -->
    <line x1="70" y1="30" x2="70" y2="10" stroke="var(--pet-antennae)" stroke-width="4"/>
    <circle cx="70" cy="8" r="5" fill="var(--pet-accent)"/>
    __ACCESSORIES__
  `;

  const OVERLAYS = `
    <!-- ════ MOOD OVERLAYS (shown/hidden via JS) ════ -->
    <g id="ov-stars" style="display:none">
      <text x="6"  y="46" font-size="15" class="star1" style="transform-origin:15px 42px">⭐</text>
      <text x="107" y="41" font-size="13" class="star2">✨</text>
      <text x="62" y="14" font-size="11" class="star3">⭐</text>
    </g>
    <g id="ov-zzz" style="display:none">
      <text x="98" y="35" font-size="13" fill="#9d7fe3" class="zzz1">z</text>
      <text x="108" y="22" font-size="16" fill="#7c5cbf" class="zzz2">Z</text>
      <text x="120" y="11" font-size="20" fill="#5c3cbf" class="zzz3">Z</text>
    </g>
    <g id="ov-bugs" style="display:none">
      <text x="4"  y="62" font-size="16">🐛</text>
      <text x="112" y="55" font-size="14">🐛</text>
      <text x="60" y="10" font-size="12">🐛</text>
    </g>
    <g id="ov-lightning" style="display:none">
      <text x="4"   y="55" font-size="18">⚡</text>
      <text x="112" y="48" font-size="16">⚡</text>
    </g>
    <g id="ov-confetti" style="display:none">
      <circle cx="28"  cy="82" r="5" fill="#f39c12" class="conf1"/>
      <circle cx="112" cy="75" r="5" fill="#e74c3c" class="conf2"/>
      <circle cx="70"  cy="12" r="5" fill="#2ecc71" class="conf3"/>
      <circle cx="12"  cy="38" r="4" fill="#9d7fe3" class="conf4"/>
      <circle cx="128" cy="32" r="4" fill="#4ecdc4" class="conf5"/>
      <circle cx="50"  cy="5"  r="3" fill="#f39c12" class="conf1"/>
      <circle cx="90"  cy="8"  r="3" fill="#3498db" class="conf2"/>
    </g>
    <g id="ov-bored" style="display:none">
      <circle cx="94" cy="42" r="5" fill="#3498db" opacity="0.7"/>
      <circle cx="94" cy="42" r="3" fill="white" opacity="0.6"/>
    </g>
  `;

  if (species === 'cat') return CAT + OVERLAYS;
  if (species === 'robot') return ROBOT + OVERLAYS;
  return ALIEN + OVERLAYS;
}

/**
 * Returns accessory SVGs based on level.
 */
function getAccessoriesSvg(level) {
  let svg = '';
  // Level 5: Sunglasses
  if (level >= 5) {
    svg += \`
      <g class="acc-sunglasses">
        <path d="M 42 55 Q 57 55 57 65 Q 42 65 42 55" fill="#111" stroke="#333" stroke-width="1"/>
        <path d="M 83 55 Q 98 55 98 65 Q 83 65 83 55" fill="#111" stroke="#333" stroke-width="1"/>
        <line x1="57" y1="58" x2="83" y2="58" stroke="#111" stroke-width="3"/>
        <line x1="42" y1="58" x2="35" y2="55" stroke="#111" stroke-width="2"/>
        <line x1="98" y1="58" x2="105" y2="55" stroke="#111" stroke-width="2"/>
      </g>
    \`;
  }
  // Level 10: Top Hat
  if (level >= 10 && level < 15) {
    svg += \`
      <g class="acc-tophat">
        <rect x="55" y="10" width="30" height="25" fill="#222"/>
        <rect x="45" y="35" width="50" height="5" fill="#222"/>
        <rect x="55" y="30" width="30" height="5" fill="#e74c3c"/>
      </g>
    \`;
  }
  // Level 15: Party Hat
  if (level >= 15 && level < 20) {
    svg += \`
      <g class="acc-partyhat">
        <polygon points="70,10 50,40 90,40" fill="#3498db"/>
        <circle cx="70" cy="8" r="6" fill="#f1c40f"/>
        <circle cx="60" cy="35" r="3" fill="#e74c3c"/>
        <circle cx="70" cy="30" r="3" fill="#2ecc71"/>
        <circle cx="80" cy="35" r="3" fill="#9b59b6"/>
      </g>
    \`;
  }
  // Level 20: Crown
  if (level >= 20) {
    svg += \`
      <g class="acc-crown">
        <path d="M 45 40 L 50 15 L 60 30 L 70 10 L 80 30 L 90 15 L 95 40 Z" fill="#f1c40f" stroke="#d4ac0d" stroke-width="2"/>
        <circle cx="50" cy="15" r="3" fill="#e74c3c"/>
        <circle cx="70" cy="10" r="3" fill="#3498db"/>
        <circle cx="90" cy="15" r="3" fill="#2ecc71"/>
        <rect x="50" y="35" width="40" height="3" fill="#e67e22"/>
      </g>
    \`;
  }
  
  return svg;
}

module.exports = { getPetSvg, getAccessoriesSvg };
