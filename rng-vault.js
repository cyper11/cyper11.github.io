/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RNG VAULT — A FREE RANDOMNESS EXPERIMENT
 * Laboratory PRNG Architecture · 5-Reel Engine · Quantum Dice · Calibrated Wheel · Mystery Vault · Telemetry Lab
 * Strictly 100% Free Virtual Experiment (Zero Real Money / Zero Gambling)
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  // CONSTANTS & DEFINITIONS
  // ─────────────────────────────────────────────────────────────────────────

  const STORAGE_KEY = 'rng_vault_state_v1';
  const AUDIO_KEY = 'rng_vault_audio_pref';
  const DEFAULT_TOKENS = 12480;
  const THEORETICAL_RTP = 0.95;

  // ── "SUGAR SURGE" — scatter-pays tumble machine (6 × 5) ─────────────────
  // Hand-drawn glossy candy / fruit symbols. 8+ of a kind ANYWHERE pays.
  const SVG_GLOSS = '<ellipse cx="24" cy="20" rx="11" ry="6" fill="#fff" opacity=".55" transform="rotate(-25 24 20)"/>';
  const g = (id, a, b) => `<defs><radialGradient id="rt-${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs>`;
  const REEL_SYMBOLS = [
    { id: 'blue', label: 'BLUE DROP', weight: 20, pays: [0.25, 0.75, 2], color: '#3b82f6',
      svg: `<svg viewBox="0 0 64 64">${g('blue', '#8fd0ff', '#1546c9')}<rect x="8" y="16" width="48" height="32" rx="16" fill="url(#rt-blue)" transform="rotate(-18 32 32)"/>${SVG_GLOSS}</svg>` },
    { id: 'green', label: 'GREEN GEM', weight: 19, pays: [0.4, 0.9, 4], color: '#22c55e',
      svg: `<svg viewBox="0 0 64 64">${g('green', '#a6ffb8', '#0d9440')}<polygon points="32,6 58,25 48,56 16,56 6,25" fill="url(#rt-green)" stroke="#0a6b2f" stroke-width="2" stroke-linejoin="round"/><polygon points="32,16 47,27 41,46 23,46 17,27" fill="#fff" opacity=".18"/>${SVG_GLOSS}</svg>` },
    { id: 'purple', label: 'BERRY CUBE', weight: 17, pays: [0.5, 1, 5], color: '#d946ef',
      svg: `<svg viewBox="0 0 64 64">${g('purple', '#ffb3fb', '#b0129f')}<path d="M14 10 Q32 4 50 10 Q60 32 50 54 Q32 60 14 54 Q4 32 14 10Z" fill="url(#rt-purple)"/>${SVG_GLOSS}</svg>` },
    { id: 'apple', label: 'APPLE', weight: 15, pays: [0.8, 1.2, 8], color: '#ef4444',
      svg: `<svg viewBox="0 0 64 64">${g('apple', '#ff8a80', '#c1121f')}<path d="M32 18 C20 10 6 16 8 34 C10 50 22 60 32 56 C42 60 54 50 56 34 C58 16 44 10 32 18Z" fill="url(#rt-apple)"/><path d="M32 18 C32 12 34 8 37 5" stroke="#5b3a1a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M35 12 C42 4 52 6 54 10 C48 14 40 15 35 12Z" fill="#3fbf4f"/>${SVG_GLOSS}</svg>` },
    { id: 'plum', label: 'PLUM', weight: 13, pays: [1, 1.5, 10], color: '#a855f7',
      svg: `<svg viewBox="0 0 64 64">${g('plum', '#f0a6ff', '#6d1aa0')}<circle cx="32" cy="35" r="23" fill="url(#rt-plum)"/><path d="M32 13 C30 20 30 30 33 40" stroke="#4a1270" stroke-width="2" fill="none" opacity=".5"/><path d="M32 12 C36 4 46 4 50 8 C44 13 37 14 32 12Z" fill="#3fbf4f"/>${SVG_GLOSS}</svg>` },
    { id: 'melon', label: 'MELON', weight: 11, pays: [1.5, 2, 12], color: '#16a34a',
      svg: `<svg viewBox="0 0 64 64">${g('melon', '#8ef08a', '#11722a')}<ellipse cx="32" cy="33" rx="25" ry="20" fill="url(#rt-melon)" transform="rotate(-20 32 33)"/><path d="M14 22 C24 30 30 40 32 52 M24 15 C34 24 40 36 42 50 M36 13 C44 22 50 32 52 44" stroke="#0b5a20" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".7"/>${SVG_GLOSS}</svg>` },
    { id: 'grape', label: 'GRAPES', weight: 9, pays: [2, 5, 15], color: '#6366f1',
      svg: `<svg viewBox="0 0 64 64">${g('grape', '#b3b5ff', '#3216a8')}<g fill="url(#rt-grape)"><circle cx="22" cy="20" r="9"/><circle cx="40" cy="20" r="9"/><circle cx="31" cy="29" r="9"/><circle cx="16" cy="32" r="8"/><circle cx="46" cy="32" r="8"/><circle cx="24" cy="42" r="8"/><circle cx="40" cy="42" r="8"/><circle cx="32" cy="53" r="7"/></g><path d="M31 11 C31 6 34 3 38 2" stroke="#3fbf4f" stroke-width="3" fill="none" stroke-linecap="round"/></svg>` },
    { id: 'heart', label: 'RED HEART', weight: 6, pays: [10, 25, 50], color: '#f43f5e',
      svg: `<svg viewBox="0 0 64 64">${g('heart', '#ff9aa9', '#d00c32')}<path d="M32 56 C10 42 4 30 6 20 C8 10 20 6 28 12 C30 14 31 15 32 17 C33 15 34 14 36 12 C44 6 56 10 58 20 C60 30 54 42 32 56Z" fill="url(#rt-heart)" stroke="#9e0a26" stroke-width="2"/>${SVG_GLOSS}</svg>` }
  ];
  // Scatter: 4+ anywhere unlocks free spins; also pays on its own
  const SCATTER = { id: 'lolly', label: 'SCATTER', weight: 3.5, scatter: true, color: '#ff4fa3',
    svg: `<svg viewBox="0 0 64 64"><rect x="30" y="34" width="5" height="28" rx="2" fill="#f5f5f5" stroke="#d6d6d6"/><circle cx="32" cy="26" r="21" fill="#fff" stroke="#ff4fa3" stroke-width="3"/><path d="M32 26 m0 -3 a3 3 0 1 1 -3 3 a6 6 0 1 1 6 6 a9 9 0 1 1 -9 -9 a12 12 0 1 1 12 12 a15 15 0 1 1 -15 -15" fill="none" stroke="#ff2d78" stroke-width="4" stroke-linecap="round"/><ellipse cx="22" cy="15" rx="7" ry="4" fill="#fff" opacity=".7" transform="rotate(-30 22 15)"/></svg>` };
  // Multiplier orb: only drops during free spins
  const ORB = { id: 'orb', label: 'MULTIPLIER', weight: 3, orb: true, color: '#fbbf24' };
  const ORB_VALUES = [[2, 30], [3, 22], [4, 14], [5, 10], [8, 8], [10, 6], [15, 4], [20, 3], [25, 2], [50, 0.8], [100, 0.3]];
  const SCATTER_PAYS = { 4: 3, 5: 5, 6: 100 };
  const GRID_COLS = 6, GRID_ROWS = 5;

  // 12 Calibrated Wheel Sectors
  const WHEEL_SECTORS = [
    { label: '1.5x', mult: 1.5, color: '#16221c', textColor: '#38bdf8', tier: 'uncommon' },
    { label: '0x BUST', mult: 0, color: '#101310', textColor: '#6b7280', tier: 'common' },
    { label: '2.0x', mult: 2.0, color: '#18241b', textColor: '#38bdf8', tier: 'uncommon' },
    { label: '0.5x', mult: 0.5, color: '#141812', textColor: '#9ca3af', tier: 'common' },
    { label: '5.0x', mult: 5.0, color: '#1f2e17', textColor: '#c8ff3d', tier: 'rare' },
    { label: '1.0x', mult: 1.0, color: '#141813', textColor: '#d1d5db', tier: 'common' },
    { label: 'BREACH', mult: 0, color: '#1c1315', textColor: '#f87171', tier: 'common' },
    { label: '3.0x', mult: 3.0, color: '#1b2a1a', textColor: '#c8ff3d', tier: 'rare' },
    { label: '10.0x', mult: 10.0, color: '#271730', textColor: '#e879f9', tier: 'epic' },
    { label: '1.5x', mult: 1.5, color: '#16221c', textColor: '#38bdf8', tier: 'uncommon' },
    { label: '25.0x', mult: 25.0, color: '#2c2210', textColor: '#fbbf24', tier: 'legendary' },
    { label: '50.0x', mult: 50.0, color: '#382a0d', textColor: '#fef08a', tier: 'legendary' }
  ];

  // Pre-calculate cumulative weights for reel symbol picker
  const TOTAL_REEL_WEIGHT = REEL_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);

  // ─────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  let state = {
    tokens: DEFAULT_TOKENS,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    totalSpins: 0,
    totalBet: 0,
    totalWon: 0,
    highestMult: 0,
    anomalyActive: false,
    distribution: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    },
    audio: false
  };

  let activeMode = 'reels'; // 'reels' | 'dice' | 'wheel' | 'vault' | 'stats'
  let currentBet = 100;
  let diceCount = 3;
  let isSpinning = false;
  let wheelAngle = 0;
  let vaultRoundPrizes = null;
  let vaultRoundClaimed = false;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign({}, state, parsed);
      }
      const audioPref = localStorage.getItem(AUDIO_KEY);
      if (audioPref !== null) {
        state.audio = audioPref === 'true';
      }
    } catch (e) {
      console.warn('RNG Vault: LocalStorage load error', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(AUDIO_KEY, String(state.audio));
    } catch (e) {
      console.warn('RNG Vault: LocalStorage save error', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNTHESIZED WEB AUDIO API
  // ─────────────────────────────────────────────────────────────────────────

  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15, pitchDrop = 0) {
    if (!state.audio) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (pitchDrop > 0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq - pitchDrop), audioCtx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio playback failsafe
    }
  }

  const Sound = {
    click: () => playTone(840, 'triangle', 0.04, 0.08),
    tick: () => playTone(1200, 'sine', 0.03, 0.05),
    spinWhoosh: () => playTone(240, 'triangle', 0.25, 0.1, 100),
    reelStop: (pitchIdx) => {
      const baseFreq = 220 + pitchIdx * 35;
      playTone(baseFreq, 'square', 0.09, 0.12, 60);
    },
    winCommon: () => {
      playTone(440, 'sine', 0.15, 0.12);
      setTimeout(() => playTone(554.37, 'sine', 0.2, 0.15), 90);
    },
    winRare: () => {
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'triangle', 0.22, 0.15), idx * 75);
      });
    },
    winLegendary: () => {
      [330, 440, 554.37, 659.25, 880, 1108.7, 1318.5].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'sine', 0.35, 0.18), idx * 80);
      });
    },
    anomaly: () => {
      [600, 750, 920, 1200, 1500, 1800].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'sawtooth', 0.14, 0.1), idx * 60);
      });
    },
    diceRoll: () => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => playTone(300 + Math.random() * 400, 'triangle', 0.04, 0.08), i * 65);
      }
    },
    vaultOpen: () => {
      playTone(180, 'sine', 0.3, 0.15, 80);
      setTimeout(() => playTone(620, 'triangle', 0.25, 0.12), 150);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MATH & PSEUDORANDOM GENERATOR
  // ─────────────────────────────────────────────────────────────────────────

  function pickRandomReelSymbol() {
    let rand = Math.random() * TOTAL_REEL_WEIGHT;
    for (let i = 0; i < REEL_SYMBOLS.length; i++) {
      if (rand < REEL_SYMBOLS[i].weight) {
        return REEL_SYMBOLS[i];
      }
      rand -= REEL_SYMBOLS[i].weight;
    }
    return REEL_SYMBOLS[0];
  }

  function getTierFromMult(mult) {
    if (mult <= 1.0) return 'common';
    if (mult <= 2.5) return 'uncommon';
    if (mult <= 5.0) return 'rare';
    if (mult <= 15.0) return 'epic';
    return 'legendary';
  }

  function checkTriggerAnomaly() {
    if (state.anomalyActive) return;
    // ~1 in 36 chance on any completed spin
    if (Math.random() < 0.028) {
      triggerAnomaly();
    }
  }

  function triggerAnomaly() {
    state.anomalyActive = true;
    Sound.anomaly();
    const banner = document.getElementById('rng-anomaly-banner');
    const seq = document.getElementById('rng-anomaly-seq');
    if (banner) {
      if (seq) {
        const hex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
        seq.textContent = `ENTROPY SPIKE // HARMONIC: #${hex}`;
      }
      banner.hidden = false;
    }
    logTelemetry('[ANOMALY]', 'Quantum Resonance field detected! Multipliers amplified 5x.', 'tag-rare');
    saveState();
  }

  function consumeAnomalyMultiplier() {
    if (state.anomalyActive) {
      state.anomalyActive = false;
      const banner = document.getElementById('rng-anomaly-banner');
      if (banner) banner.hidden = true;
      saveState();
      return 5;
    }
    return 1;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HUD & UI TELEMETRY UPDATES
  // ─────────────────────────────────────────────────────────────────────────

  function formatNumber(num) {
    return Number(num).toLocaleString('en-US');
  }

  function updateHUD() {
    const elTokens = document.getElementById('rng-hud-tokens');
    const elXp = document.getElementById('rng-hud-xp');
    const elStreak = document.getElementById('rng-hud-streak');
    const elLuck = document.getElementById('rng-hud-luck');

    if (elTokens) elTokens.textContent = formatNumber(state.tokens);
    if (elXp) elXp.textContent = formatNumber(state.xp);
    if (elStreak) elStreak.textContent = formatNumber(state.streak);

    const luck = state.totalBet > 0
      ? (state.totalWon / (state.totalBet * THEORETICAL_RTP))
      : 1.0;
    if (elLuck) {
      elLuck.textContent = luck.toFixed(2) + 'x';
      if (luck >= 1.25) elLuck.style.color = '#c8ff3d';
      else if (luck <= 0.8) elLuck.style.color = '#f87171';
      else elLuck.style.color = '#38bdf8';
    }

    updateStatsPanel();
  }

  function logTelemetry(tag, msg, extraClass = '') {
    const logBox = document.getElementById('rng-telemetry-log');
    if (!logBox) return;

    const time = new Date().toTimeString().split(' ')[0];
    const row = document.createElement('div');
    row.className = 'rng-log-entry';

    let tagHtml = `<span class="${extraClass}">${tag}</span>`;
    row.innerHTML = `<span class="time">[${time}]</span> ${tagHtml} ${msg}`;

    logBox.appendChild(row);
    // Keep max 60 log lines
    while (logBox.children.length > 60) {
      logBox.removeChild(logBox.firstChild);
    }
    logBox.scrollTop = logBox.scrollHeight;
  }

  function updateStatsPanel() {
    const elRuns = document.getElementById('stats-total-runs');
    const elNet = document.getElementById('stats-net-tokens');
    const elMult = document.getElementById('stats-highest-mult');
    const elLuckIndex = document.getElementById('stats-luck-index');
    const elDistTotal = document.getElementById('stats-dist-total');

    if (elRuns) elRuns.textContent = formatNumber(state.totalSpins);

    const net = state.totalWon - state.totalBet;
    if (elNet) {
      elNet.textContent = (net >= 0 ? '+' : '') + formatNumber(net);
      elNet.style.color = net >= 0 ? 'var(--lime)' : '#f87171';
    }

    if (elMult) elMult.textContent = state.highestMult.toFixed(1) + 'x';

    const luck = state.totalBet > 0
      ? (state.totalWon / (state.totalBet * THEORETICAL_RTP))
      : 1.0;
    if (elLuckIndex) {
      elLuckIndex.textContent = luck.toFixed(2) + 'x';
      if (luck >= 1.2) elLuckIndex.style.color = '#c8ff3d';
      else if (luck < 0.85) elLuckIndex.style.color = '#f87171';
      else elLuckIndex.style.color = '#38bdf8';
    }

    const totalTrials = Object.values(state.distribution).reduce((a, b) => a + b, 0);
    if (elDistTotal) elDistTotal.textContent = `${formatNumber(totalTrials)} TRIALS`;

    ['common', 'uncommon', 'rare', 'epic', 'legendary'].forEach((tier) => {
      const count = state.distribution[tier] || 0;
      const pct = totalTrials > 0 ? ((count / totalTrials) * 100).toFixed(1) : '0.0';
      const bar = document.getElementById(`bar-${tier}`);
      const txt = document.getElementById(`pct-${tier}`);
      if (bar) bar.style.width = `${pct}%`;
      if (txt) txt.textContent = `${pct}%`;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODE 01: SUGAR SURGE — 6×5 SCATTER-PAYS TUMBLE ENGINE
  // 8+ matching symbols anywhere pay; winners pop, the rest tumble down and
  // new symbols drop in until nothing more connects. 4+ scatters = 10 free
  // spins, where multiplier orbs add up and multiply the sequence win.
  // ─────────────────────────────────────────────────────────────────────────

  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tumbleGrid = [];          // [col][row] → { sym, uid, mult? }
  let uidSeq = 0;
  let freeSpins = 0;
  let freeSpinTotal = 0;        // winnings collected across the whole free-spin round
  const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? Math.min(ms, 120) : ms));

  function pickOrbValue() {
    const total = ORB_VALUES.reduce((s, v) => s + v[1], 0);
    let r = Math.random() * total;
    for (const [v, w] of ORB_VALUES) { if (r < w) return v; r -= w; }
    return 2;
  }
  function makeCell() {
    const pool = freeSpins > 0 ? [...REEL_SYMBOLS, SCATTER, ORB] : [...REEL_SYMBOLS, SCATTER];
    const total = pool.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total, sym = pool[0];
    for (const x of pool) { if (r < x.weight) { sym = x; break; } r -= x.weight; }
    const cell = { sym, uid: ++uidSeq };
    if (sym.orb) cell.mult = pickOrbValue();
    return cell;
  }
  function freshGrid() {
    tumbleGrid = Array.from({ length: GRID_COLS }, () => Array.from({ length: GRID_ROWS }, makeCell));
  }

  function orbSVG(v) {
    return `<svg viewBox="0 0 64 64"><defs><radialGradient id="rt-orb" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff6b0"/><stop offset=".45" stop-color="#ffb02e"/><stop offset="1" stop-color="#e0157a"/></radialGradient></defs>` +
      `<circle cx="32" cy="32" r="26" fill="url(#rt-orb)" stroke="#fff" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="900" font-size="${v >= 100 ? 20 : 24}" fill="#3b0a2a">${v}x</text>${SVG_GLOSS}</svg>`;
  }

  function cellEl(cell) {
    const el = document.createElement('div');
    el.className = 'rt-cell' + (cell.sym.scatter ? ' is-scatter' : '') + (cell.sym.orb ? ' is-orb' : '');
    el.dataset.uid = cell.uid;
    el.dataset.symbol = cell.sym.id;
    el.setAttribute('aria-label', cell.sym.orb ? `${cell.mult}x multiplier` : cell.sym.label.toLowerCase());
    el.innerHTML = cell.sym.orb ? orbSVG(cell.mult) : cell.sym.svg;
    return el;
  }

  // Render with FLIP: survivors slide from their old row, new cells fall in from above
  function renderReelGrid(opts = {}) {
    const gridEl = document.getElementById('rng-reels-grid');
    if (!gridEl) return Promise.resolve();
    if (!tumbleGrid.length) freshGrid();
    gridEl.classList.add('rt-grid');
    const prevRow = {};
    gridEl.querySelectorAll('.rt-cell').forEach(el => { prevRow[el.dataset.uid] = +el.dataset.row; });
    const sample = gridEl.querySelector('.rt-cell');
    const cellH = (sample && sample.offsetHeight) || (gridEl.offsetHeight / GRID_ROWS) || 64;

    gridEl.innerHTML = '';
    const anims = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const col = document.createElement('div');
      col.className = 'rt-col';
      col.dataset.c = c;
      const fresh = tumbleGrid[c].filter(x => !(x.uid in prevRow)).length;
      let k = 0;
      tumbleGrid[c].forEach((cell, r) => {
        const el = cellEl(cell);
        el.dataset.row = r;
        col.appendChild(el);
        if (opts.instant || reduceMotion) return;
        let from;
        if (opts.dropAll) from = -(GRID_ROWS + 1) * cellH;
        else if (cell.uid in prevRow) from = (prevRow[cell.uid] - r) * cellH;
        else from = -(fresh - k++) * cellH - cellH * 0.4;
        if (from !== 0) {
          const a = el.animate([{ transform: `translateY(${from}px)` }, { transform: 'translateY(0)' }],
            { duration: opts.dropAll ? 520 : 420, easing: 'cubic-bezier(.3,1.25,.5,1)', fill: 'backwards',
              delay: opts.dropAll ? c * 70 + (GRID_ROWS - r) * 25 : 0 });
          anims.push(a.finished.catch(() => {}));
        }
      });
      gridEl.appendChild(col);
    }
    return Promise.all(anims);
  }

  function findWins() {
    const counts = {};
    tumbleGrid.flat().forEach(cell => {
      if (!cell.sym.scatter && !cell.sym.orb) (counts[cell.sym.id] = counts[cell.sym.id] || []).push(cell);
    });
    const wins = [];
    for (const sym of REEL_SYMBOLS) {
      const cells = counts[sym.id] || [];
      if (cells.length >= 8) {
        const tier = cells.length >= 12 ? 2 : cells.length >= 10 ? 1 : 0;
        wins.push({ sym, cells, mult: sym.pays[tier] });
      }
    }
    return wins;
  }

  function setBanner(tagText, tier, msgText, payText, lit) {
    const tag = document.getElementById('reels-tier-tag');
    const msg = document.getElementById('reels-result-msg');
    const pay = document.getElementById('reels-result-payout');
    if (tag) { tag.className = `rng-tier-tag tier-${tier}`; tag.textContent = tagText; }
    if (msg) msg.textContent = msgText;
    if (pay) { pay.textContent = payText; pay.style.color = lit ? 'var(--lime)' : 'var(--muted)'; }
  }

  function flash(text, sub, host) {
    const frame = document.querySelector(host || '.rng-reels-frame');
    if (!frame) return;
    const f = document.createElement('div');
    f.className = 'rt-flash';
    f.innerHTML = `<b>${text}</b>${sub ? `<small>${sub}</small>` : ''}`;
    frame.appendChild(f);
    setTimeout(() => f.remove(), reduceMotion ? 900 : 1700);
  }

  function updateFreeSpinHud() {
    const btn = document.getElementById('reels-spin-btn');
    const lbl = btn && btn.querySelector('span:last-child');
    if (lbl) lbl.textContent = freeSpins > 0 ? `FREE SPIN · ${freeSpins} LEFT` : 'SPIN';
    const frame = document.querySelector('.rng-reels-frame');
    if (frame) frame.classList.toggle('rt-free', freeSpins > 0);
  }

  async function spinReels() {
    if (isSpinning) return;
    const isFree = freeSpins > 0;
    if (!isFree && state.tokens < currentBet) {
      logTelemetry('[WARN]', 'Insufficient Lab Tokens! Click Recharge in footer to top up.', 'tag-rare');
      return;
    }
    isSpinning = true;
    toggleSpinButtons(true);
    Sound.spinWhoosh();

    if (isFree) {
      freeSpins--;
    } else {
      state.tokens -= currentBet;
      state.totalBet += currentBet;
      state.totalSpins++;
      state.xp += 10;
    }
    updateHUD();
    updateFreeSpinHud();
    const anomalyMult = isFree ? 1 : consumeAnomalyMultiplier();

    // clear the board downward, then drop a fresh one
    const gridEl = document.getElementById('rng-reels-grid');
    if (gridEl && !reduceMotion) {
      gridEl.querySelectorAll('.rt-cell').forEach(el => el.animate(
        [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(120%)', opacity: 0 }],
        { duration: 240, delay: (+el.closest('.rt-col').dataset.c || 0) * 30, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }));
      await wait(300);
    }
    if (gridEl) gridEl.innerHTML = '';
    freshGrid();
    await renderReelGrid({ dropAll: true });
    Sound.reelStop(2);

    // ── tumble loop
    let seqMult = 0, tumbles = 0;
    for (;;) {
      const wins = findWins();
      if (!wins.length) break;
      tumbles++;
      const stepMult = wins.reduce((s, w) => s + w.mult, 0);
      seqMult += stepMult;
      wins.forEach(w => w.cells.forEach(cell => {
        const el = gridEl.querySelector(`[data-uid="${cell.uid}"]`);
        if (el) el.classList.add('rt-win');
      }));
      if (stepMult >= 5) Sound.winRare(); else Sound.winCommon();
      setBanner(`TUMBLE ${tumbles}`, getTierFromMult(seqMult), wins.map(w => `${w.cells.length}× ${w.sym.label}`).join(' · '),
        `+${formatNumber(Math.floor(currentBet * seqMult))} TOKENS`, true);
      await wait(560);
      const dead = new Set(wins.flatMap(w => w.cells.map(x => x.uid)));
      gridEl.querySelectorAll('.rt-cell.rt-win').forEach(el => el.animate(
        [{ transform: 'scale(1.15)', opacity: 1, filter: 'brightness(1.5)' }, { transform: 'scale(.2) rotate(25deg)', opacity: 0, filter: 'brightness(2)' }],
        { duration: 260, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }));
      await wait(270);
      // gravity: survivors keep their order and sink, new cells fill from the top
      for (let c = 0; c < GRID_COLS; c++) {
        const keep = tumbleGrid[c].filter(x => !dead.has(x.uid));
        const add = Array.from({ length: GRID_ROWS - keep.length }, makeCell);
        tumbleGrid[c] = [...add, ...keep];
      }
      await renderReelGrid();
      await wait(140);
    }

    // ── orbs (free spins only) multiply the sequence win
    let orbSum = 0;
    if (isFree && seqMult > 0) {
      const orbs = tumbleGrid.flat().filter(x => x.sym.orb);
      orbSum = orbs.reduce((s, o) => s + o.mult, 0);
      if (orbSum > 0) {
        gridEl.querySelectorAll('.rt-cell.is-orb').forEach(el => el.classList.add('rt-win'));
        flash(`×${orbSum}`, 'multiplier orbs');
        Sound.winLegendary();
        await wait(1000);
      }
    }

    const totalMult = seqMult * (orbSum || 1) * anomalyMult;
    let payout = Math.floor(currentBet * totalMult);

    // ── scatters
    const scatters = tumbleGrid.flat().filter(x => x.sym.scatter).length;
    let scatterPay = 0;
    if (scatters >= 4) scatterPay = Math.floor(currentBet * (SCATTER_PAYS[Math.min(scatters, 6)] || 0));
    payout += scatterPay;
    if (!isFree && scatters >= 4) {
      freeSpins += 10;
      freeSpinTotal = 0;
      gridEl.querySelectorAll('.rt-cell.is-scatter').forEach(el => el.classList.add('rt-win'));
      flash('10 FREE SPINS', `${scatters} scatters · multiplier orbs unlocked`);
      Sound.anomaly();
      logTelemetry('[SCATTER]', `${scatters} scatters → 10 free spins unlocked.`, 'tag-rare');
      await wait(1600);
    } else if (isFree && scatters >= 3) {
      freeSpins += 5;
      flash('+5 FREE SPINS', 'retrigger');
      await wait(1200);
    }

    state.tokens += payout;
    state.totalWon += payout;
    if (isFree) freeSpinTotal += payout;
    const effMult = payout / currentBet;
    if (effMult > state.highestMult) state.highestMult = effMult;
    const tier = getTierFromMult(effMult);
    state.distribution[tier] = (state.distribution[tier] || 0) + 1;

    if (payout > 0) {
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      state.xp += Math.floor(effMult * 15);
      if (effMult >= 50) { flash('MEGA WIN', `${formatNumber(payout)} tokens`); Sound.winLegendary(); await wait(1200); }
      else if (effMult >= 15) { flash('BIG WIN', `${formatNumber(payout)} tokens`); Sound.winLegendary(); await wait(1000); }
    } else if (!isFree) {
      state.streak = 0;
    }

    const parts = [];
    if (tumbles) parts.push(`${tumbles} tumble${tumbles > 1 ? 's' : ''} · ${seqMult.toFixed(2)}x`);
    if (orbSum) parts.push(`orbs ×${orbSum}`);
    if (scatterPay) parts.push(`${scatters} scatters`);
    if (anomalyMult > 1) parts.push('5X ANOMALY BOOST');
    setBanner(payout > 0 ? tier.toUpperCase() : (isFree ? 'FREE SPIN' : 'NO WIN'), payout > 0 ? tier : 'common',
      payout > 0 ? parts.join(' · ') : 'No cluster of 8+. Symbols redistributed.' + (anomalyMult > 1 ? ' (5x boost unused)' : ''),
      `+${formatNumber(payout)} TOKENS`, payout > 0);

    logTelemetry('[TUMBLE]', `${isFree ? 'Free spin' : 'Bet: ' + currentBet} · Win: ${formatNumber(payout)} (${effMult.toFixed(2)}x) · Tumbles: ${tumbles}`,
      effMult >= 5 ? 'tag-rare' : payout > 0 ? 'tag-win' : '');

    updateHUD();
    saveState();
    if (!isFree) checkTriggerAnomaly();

    if (isFree && freeSpins === 0) {
      await wait(500);
      flash('FREE SPINS DONE', `${formatNumber(freeSpinTotal)} tokens collected`);
      logTelemetry('[SCATTER]', `Free spins finished · ${formatNumber(freeSpinTotal)} tokens.`, 'tag-win');
      await wait(1500);
    }
    updateFreeSpinHud();

    await wait(250);
    isSpinning = false;
    toggleSpinButtons(false);
    // free spins play themselves while the overlay is open on this tab
    const ov = document.getElementById('rng-overlay');
    if (freeSpins > 0 && activeMode === 'reels' && ov && ov.classList.contains('open')) {
      setTimeout(() => { if (!isSpinning && freeSpins > 0 && activeMode === 'reels') spinReels(); }, reduceMotion ? 300 : 900);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODE 02: CANDY DICE — real 3D cubes thrown onto a felt tray
  // ─────────────────────────────────────────────────────────────────────────

  let currentDiceValues = [1, 2, 3, 4, 5];
  const DIE_COLORS = [
    ['#ff8cc0', '#e8337f', '#fff'], ['#7ff0c8', '#16a874', '#063b29'], ['#ffe27a', '#f0a90c', '#4a2a00'],
    ['#8fd0ff', '#2f7fe0', '#fff'], ['#d4a6ff', '#8a3fe0', '#fff']
  ];
  // which face sits where on the cube, and the cube rotation that brings each value to the front
  const FACE_ROT = { 1: [0, 0], 2: [0, -90], 3: [-90, 0], 4: [90, 0], 5: [0, 90], 6: [0, 180] };
  const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  const diceRot = [];   // cumulative [x, y] per die so every throw keeps turning forward

  function faceHTML(n) {
    let pips = '';
    for (let p = 1; p <= 9; p++) pips += `<i class="${PIPS[n].includes(p) ? 'on' : ''}"></i>`;
    return `<div class="cd-face f${n}">${pips}</div>`;
  }

  function renderDiceStage() {
    const stage = document.getElementById('rng-dice-stage');
    if (!stage) return;
    stage.innerHTML = '';
    stage.classList.add('cd-tray');
    stage.dataset.count = diceCount;
    for (let i = 0; i < diceCount; i++) {
      const v = currentDiceValues[i] || 1;
      const [a, b, pip] = DIE_COLORS[i % DIE_COLORS.length];
      const die = document.createElement('div');
      die.className = 'cd-die';
      die.id = `die-${i}`;
      die.dataset.val = v;
      die.style.setProperty('--d-a', a);
      die.style.setProperty('--d-b', b);
      die.style.setProperty('--d-pip', pip);
      const cube = document.createElement('div');
      cube.className = 'cd-cube';
      cube.innerHTML = [1, 2, 3, 4, 5, 6].map(faceHTML).join('');
      if (!diceRot[i]) diceRot[i] = FACE_ROT[v].slice();
      cube.style.transform = `rotateX(${diceRot[i][0]}deg) rotateY(${diceRot[i][1]}deg)`;
      die.appendChild(cube);
      die.appendChild(Object.assign(document.createElement('span'), { className: 'cd-shadow' }));
      stage.appendChild(die);
    }
  }

  function rollDice() {
    if (isSpinning) return;
    if (state.tokens < currentBet) {
      logTelemetry('[WARN]', 'Insufficient Lab Tokens! Click Recharge in footer to top up.', 'tag-rare');
      return;
    }
    isSpinning = true;
    toggleSpinButtons(true);
    Sound.diceRoll();

    state.tokens -= currentBet;
    state.totalBet += currentBet;
    state.totalSpins++;
    state.xp += 10;
    updateHUD();
    const anomalyMult = consumeAnomalyMultiplier();

    const stage = document.getElementById('rng-dice-stage');
    if (stage) stage.querySelectorAll('.cd-die').forEach(d => d.classList.remove('cd-win'));
    const targetValues = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
    let longest = 0;

    targetValues.forEach((v, i) => {
      const die = document.getElementById(`die-${i}`);
      const cube = die && die.querySelector('.cd-cube');
      if (!cube) return;
      const prev = diceRot[i] || [0, 0];
      const [fx, fy] = FACE_ROT[v];
      // always add 2–3 whole turns on each axis, then land on the target face
      const rx = (Math.floor(prev[0] / 360) + 2 + (Math.random() * 2 | 0)) * 360 + fx;
      const ry = (Math.floor(prev[1] / 360) + 2 + (Math.random() * 2 | 0)) * 360 + fy;
      diceRot[i] = [rx, ry];
      const dur = reduceMotion ? 1 : 950 + i * 160;
      longest = Math.max(longest, dur);
      cube.animate(
        [{ transform: `rotateX(${prev[0]}deg) rotateY(${prev[1]}deg)` }, { transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }],
        { duration: dur, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' });
      cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      if (!reduceMotion) {
        const drift = (Math.random() * 2 - 1) * 26;
        die.animate([
          { transform: `translate(${-drift}px, -150px) scale(1.15)` },
          { transform: `translate(${drift * 0.3}px, 0) scale(1)`, offset: 0.55 },
          { transform: `translate(${drift * 0.15}px, -26px) scale(1.04)`, offset: 0.72 },
          { transform: 'translate(0, 0) scale(1)', offset: 0.88 },
          { transform: 'translate(0, -6px)', offset: 0.94 },
          { transform: 'translate(0, 0)' }
        ], { duration: dur, easing: 'cubic-bezier(.33,0,.4,1)' });
        setTimeout(() => Sound.tick(), dur * 0.55);
        setTimeout(() => Sound.tick(), dur * 0.88);
      }
      die.dataset.val = v;
    });

    setTimeout(() => {
      currentDiceValues = targetValues;
      evaluateDiceOutcome(anomalyMult);
    }, longest + 60);
  }

  function evaluateDiceOutcome(anomalyMult) {
    const vals = currentDiceValues.slice(0, diceCount);
    const counts = {};
    vals.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    const countArr = Object.values(counts).sort((a, b) => b - a);
    const topFace = +Object.keys(counts).sort((a, b) => counts[b] - counts[a] || b - a)[0];

    let mult = 0;
    let desc = '';
    let winFaces = [];          // which dice light up

    if (diceCount === 3) {
      const sorted = [...vals].sort((a, b) => a - b).join('');
      if (countArr[0] === 3) {
        mult = vals[0] === 6 ? 30.0 : 12.0;
        desc = vals[0] === 6 ? 'TRIPLE 6s' : `TRIPLE ${vals[0]}s`;
        winFaces = [vals[0]];
      } else if (countArr[0] === 2) {
        mult = 2.0; desc = `PAIR OF ${topFace}s`; winFaces = [topFace];
      } else if (['123', '234', '345', '456'].includes(sorted)) {
        mult = 6.0; desc = 'STRAIGHT'; winFaces = vals;
      } else {
        const sum = vals.reduce((a, b) => a + b, 0);
        if (sum >= 15) { mult = 1.2; desc = `HIGH ROLL · ${sum}`; winFaces = vals; }
        else { mult = 0; desc = `NO COMBO · SUM ${sum}`; }
      }
    } else {
      const sorted = [...vals].sort((a, b) => a - b).join('');
      if (countArr[0] === 5) { mult = 50.0; desc = 'FIVE OF A KIND'; winFaces = [vals[0]]; }
      else if (countArr[0] === 4) { mult = 15.0; desc = 'FOUR OF A KIND'; winFaces = [topFace]; }
      else if (countArr[0] === 3 && countArr[1] === 2) { mult = 10.0; desc = 'FULL HOUSE'; winFaces = vals; }
      else if (countArr[0] === 3) { mult = 4.0; desc = 'THREE OF A KIND'; winFaces = [topFace]; }
      else if (countArr[0] === 2 && countArr[1] === 2) {
        mult = 2.5; desc = 'TWO PAIR'; winFaces = Object.keys(counts).filter(k => counts[k] === 2).map(Number);
      }
      else if (countArr[0] === 2) { mult = 1.2; desc = `PAIR OF ${topFace}s`; winFaces = [topFace]; }
      else if (sorted === '12345' || sorted === '23456') { mult = 12.0; desc = 'LARGE STRAIGHT'; winFaces = vals; }
      else { mult = 0; desc = 'NO COMBO'; }
    }

    mult *= anomalyMult;
    const payoutTokens = Math.floor(currentBet * mult);
    state.tokens += payoutTokens;
    state.totalWon += payoutTokens;
    if (mult > state.highestMult) state.highestMult = mult;
    const tier = getTierFromMult(mult);
    state.distribution[tier] = (state.distribution[tier] || 0) + 1;

    if (mult > 0) {
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      state.xp += Math.floor(mult * 15);
      if (mult >= 10.0) Sound.winLegendary(); else if (mult >= 3.0) Sound.winRare(); else Sound.winCommon();
      vals.forEach((v, i) => { if (winFaces.includes(v)) { const d = document.getElementById(`die-${i}`); if (d) d.classList.add('cd-win'); } });
      if (mult >= 4) flash(desc, `${mult.toFixed(1)}x · +${formatNumber(payoutTokens)} tokens`, '#rng-dice-stage');
    } else {
      state.streak = 0;
    }

    const tag = document.getElementById('dice-tier-tag');
    const msg = document.getElementById('dice-result-msg');
    const pay = document.getElementById('dice-result-payout');
    if (tag) { tag.className = `rng-tier-tag tier-${tier}`; tag.textContent = mult > 0 ? tier.toUpperCase() : 'NO WIN'; }
    if (msg) msg.textContent = `${desc}${anomalyMult > 1 ? ' · 5X BOOST' : ''} · ${mult.toFixed(1)}x`;
    if (pay) {
      pay.textContent = `+${formatNumber(payoutTokens)} TOKENS`;
      pay.style.color = mult > 0 ? 'var(--lime)' : 'var(--muted)';
    }
    logTelemetry('[DICE]', `[${vals.join('-')}] · ${desc} · +${formatNumber(payoutTokens)} (${mult.toFixed(1)}x)`,
      mult >= 5.0 ? 'tag-rare' : mult > 0 ? 'tag-win' : '');

    updateHUD();
    saveState();
    checkTriggerAnomaly();
    setTimeout(() => { isSpinning = false; toggleSpinButtons(false); }, 300);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODE 03: PRIZE WHEEL — candy slices, gold rim, chasing bulbs
  // ─────────────────────────────────────────────────────────────────────────

  const WHEEL_FILLS = ['#ff4f9a', '#ffd23f', '#3ee0a4', '#4fb3ff', '#b06bff', '#ff8a3d'];
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const n = document.createElementNS(SVGNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

  function buildWheelSVG() {
    const svg = document.getElementById('rng-wheel-svg');
    if (!svg) return;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 300 300');
    const C = 150, R = 140, n = WHEEL_SECTORS.length, slice = (Math.PI * 2) / n;

    const defs = svgEl('defs', {});
    defs.innerHTML = `<radialGradient id="wl-gold" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff3b0"/><stop offset=".55" stop-color="#f6b723"/><stop offset="1" stop-color="#b8740a"/></radialGradient>
      <radialGradient id="wl-shine" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>`;
    svg.appendChild(defs);

    let colorIdx = 0;
    WHEEL_SECTORS.forEach((sec, idx) => {
      const a0 = idx * slice - Math.PI / 2, a1 = a0 + slice;
      const x1 = C + R * Math.cos(a0), y1 = C + R * Math.sin(a0);
      const x2 = C + R * Math.cos(a1), y2 = C + R * Math.sin(a1);
      const bust = sec.mult === 0, gold = sec.tier === 'legendary';
      const fill = bust ? '#2a2233' : gold ? 'url(#wl-gold)' : WHEEL_FILLS[colorIdx++ % WHEEL_FILLS.length];
      svg.appendChild(svgEl('path', { d: `M${C} ${C} L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}Z`, fill, stroke: '#fff', 'stroke-width': 2, class: 'wl-slice', id: `wl-s-${idx}` }));

      const mid = a0 + slice / 2, tr = R * 0.66;
      const tx = C + tr * Math.cos(mid), ty = C + tr * Math.sin(mid);
      const deg = (mid * 180) / Math.PI;      // read outward along the radius
      const t = svgEl('text', {
        x: tx, y: ty, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        transform: `rotate(${deg} ${tx} ${ty})`, class: 'wl-label',
        fill: bust ? '#ff6b86' : '#2b0a1f', 'font-size': bust ? 15 : sec.label.length > 4 ? 19 : 23
      });
      t.textContent = bust ? (sec.label.includes('BREACH') ? 'BREACH' : 'BUST') : sec.label.replace('.0x', 'x');
      svg.appendChild(t);
    });
    svg.appendChild(svgEl('circle', { cx: C, cy: C, r: R, fill: 'url(#wl-shine)', 'pointer-events': 'none' }));

    // static rim with chasing bulbs (does not rotate with the disc)
    const assembly = svg.closest('.rng-wheel-assembly');
    if (assembly && !assembly.querySelector('.wl-rim')) {
      const rim = svgEl('svg', { viewBox: '0 0 300 300', class: 'wl-rim', 'aria-hidden': 'true' });
      rim.appendChild(svgEl('circle', { cx: 150, cy: 150, r: 146, fill: 'none', stroke: 'url(#wl-gold)', 'stroke-width': 10 }));
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        rim.appendChild(svgEl('circle', { cx: 150 + 146 * Math.cos(a), cy: 150 + 146 * Math.sin(a), r: 3.6, class: `wl-bulb ${i % 2 ? 'b' : 'a'}` }));
      }
      assembly.appendChild(rim);
      const hub = assembly.querySelector('.rng-wheel-hub');
      if (hub) {
        hub.textContent = 'SPIN';
        hub.setAttribute('role', 'button');
        hub.setAttribute('tabindex', '0');
        hub.setAttribute('aria-label', 'Spin the wheel');
        hub.addEventListener('click', () => spinWheel());
        hub.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); spinWheel(); } });
      }
    }
  }

  function readRotation(el) {
    const m = getComputedStyle(el).transform;
    if (!m || m === 'none') return 0;
    const v = m.match(/matrix\(([^)]+)\)/);
    if (!v) return 0;
    const [a, b] = v[1].split(',').map(Number);
    return (Math.atan2(b, a) * 180) / Math.PI;
  }

  function spinWheel() {
    if (isSpinning) return;
    if (state.tokens < currentBet) {
      logTelemetry('[WARN]', 'Insufficient Lab Tokens! Click Recharge in footer to top up.', 'tag-rare');
      return;
    }
    const disc = document.getElementById('rng-wheel-disc');
    if (!disc) return;
    isSpinning = true;
    toggleSpinButtons(true);
    Sound.spinWhoosh();

    state.tokens -= currentBet;
    state.totalBet += currentBet;
    state.totalSpins++;
    state.xp += 10;
    updateHUD();
    const anomalyMult = consumeAnomalyMultiplier();
    const pointer = document.getElementById('rng-wheel-pointer');
    const assembly = disc.closest('.rng-wheel-assembly');
    document.querySelectorAll('.wl-slice.wl-hit').forEach(s => s.classList.remove('wl-hit'));
    if (assembly) assembly.classList.add('wl-spinning');

    const targetIdx = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const sliceDeg = 360 / WHEEL_SECTORS.length;
    // land somewhere inside the slice, not dead centre, so it feels physical
    const jitter = (Math.random() - 0.5) * sliceDeg * 0.7;
    const targetOffset = targetIdx * sliceDeg + sliceDeg / 2 + jitter;
    const fullSpins = 360 * (5 + Math.floor(Math.random() * 3));
    const base = wheelAngle - (wheelAngle % 360);
    const targetRotation = base + fullSpins + (360 - targetOffset);
    const DUR = reduceMotion ? 300 : 5200;

    disc.style.transition = `transform ${DUR}ms cubic-bezier(0.12, 0.8, 0.12, 1)`;
    disc.style.transform = `rotate(${targetRotation}deg)`;

    // tick + flap the pointer every time a slice boundary passes under it
    let lastSlice = null, running = true;
    const watch = () => {
      if (!running) return;
      const ang = ((readRotation(disc) % 360) + 360) % 360;
      const s = Math.floor(((360 - ang) % 360) / sliceDeg);
      if (lastSlice !== null && s !== lastSlice) {
        Sound.tick();
        if (pointer && !reduceMotion) pointer.animate(
          [{ transform: 'translateX(-50%) rotate(0)' }, { transform: 'translateX(-50%) rotate(-22deg)' }, { transform: 'translateX(-50%) rotate(0)' }],
          { duration: 120, easing: 'ease-out' });
      }
      lastSlice = s;
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);

    setTimeout(() => {
      running = false;
      wheelAngle = targetRotation;
      if (assembly) assembly.classList.remove('wl-spinning');
      const hit = document.getElementById(`wl-s-${targetIdx}`);
      if (hit) hit.classList.add('wl-hit');
      evaluateWheelOutcome(targetIdx, anomalyMult);
    }, DUR + 80);
  }

  function evaluateWheelOutcome(targetIdx, anomalyMult) {
    const sec = WHEEL_SECTORS[targetIdx];
    const mult = sec.mult * anomalyMult;
    const payoutTokens = Math.floor(currentBet * mult);
    state.tokens += payoutTokens;
    state.totalWon += payoutTokens;
    if (mult > state.highestMult) state.highestMult = mult;
    const tier = getTierFromMult(mult);
    state.distribution[tier] = (state.distribution[tier] || 0) + 1;

    if (mult > 0) {
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      state.xp += Math.floor(mult * 15);
      if (mult >= 10.0) Sound.winLegendary(); else if (mult >= 3.0) Sound.winRare(); else Sound.winCommon();
      if (mult >= 5) flash(`${sec.label.replace('.0x', 'x')}!`, `+${formatNumber(payoutTokens)} tokens`, '.rng-wheel-assembly');
    } else {
      state.streak = 0;
    }

    const tag = document.getElementById('wheel-tier-tag');
    const msg = document.getElementById('wheel-result-msg');
    const pay = document.getElementById('wheel-result-payout');
    if (tag) { tag.className = `rng-tier-tag tier-${tier}`; tag.textContent = mult > 0 ? tier.toUpperCase() : 'NO WIN'; }
    if (msg) msg.textContent = mult > 0
      ? `Landed on ${sec.label.replace('.0x', 'x')}${anomalyMult > 1 ? ' · 5X BOOST' : ''} · ${mult.toFixed(1)}x`
      : `Landed on ${sec.label.includes('BREACH') ? 'BREACH' : 'BUST'} · no payout`;
    if (pay) {
      pay.textContent = `+${formatNumber(payoutTokens)} TOKENS`;
      pay.style.color = mult > 0 ? 'var(--lime)' : 'var(--muted)';
    }
    logTelemetry('[WHEEL]', `Sector: ${sec.label} · +${formatNumber(payoutTokens)} (${mult.toFixed(1)}x)`,
      mult >= 5.0 ? 'tag-rare' : mult > 0 ? 'tag-win' : '');

    updateHUD();
    saveState();
    checkTriggerAnomaly();
    setTimeout(() => { isSpinning = false; toggleSpinButtons(false); }, 200);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODE 04: MYSTERY VAULT ENGINE
  // ─────────────────────────────────────────────────────────────────────────

  function generateVaultPrizes() {
    // 8 vaults: 1 huge, 2 high, 3 standard, 2 depleted
    const pool = [
      { mult: 20.0, xp: 250, label: 'TITAN CORE' },
      { mult: 8.0, xp: 120, label: 'HIGH CACHE' },
      { mult: 5.0, xp: 80, label: 'SECURE CACHE' },
      { mult: 2.5, xp: 40, label: 'DATA PACK' },
      { mult: 1.5, xp: 25, label: 'BUFFER STACK' },
      { mult: 1.0, xp: 15, label: 'TOKEN RETURN' },
      { mult: 0.5, xp: 10, label: 'LEAKED CELL' },
      { mult: 0.0, xp: 0, label: 'EMPTY BREACH' }
    ];

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  function renderVaultGrid() {
    const grid = document.getElementById('rng-vault-grid');
    if (!grid) return;
    grid.innerHTML = '';

    vaultRoundPrizes = generateVaultPrizes();
    vaultRoundClaimed = false;

    for (let i = 0; i < 8; i++) {
      const card = document.createElement('div');
      card.className = 'rng-vault-card';
      card.id = `vault-card-${i}`;
      card.dataset.index = i;

      // Closed state markup
      const closed = document.createElement('div');
      closed.className = 'rng-vault-closed-view';
      closed.innerHTML = `
        <span class="rng-vault-icon">🔒</span>
        <span class="rng-vault-code">CHAMBER 0${i + 1}</span>
      `;

      // Open state markup
      const open = document.createElement('div');
      open.className = 'rng-vault-open-view';
      open.id = `vault-open-${i}`;

      card.appendChild(closed);
      card.appendChild(open);

      card.addEventListener('click', () => handleVaultSelect(i));
      grid.appendChild(card);
    }

    const resetBtn = document.getElementById('vault-reset-btn');
    if (resetBtn) resetBtn.textContent = 'RE-LOCK ALL VAULTS';
  }

  function handleVaultSelect(idx) {
    if (vaultRoundClaimed || isSpinning) return;
    if (state.tokens < currentBet) {
      logTelemetry('[WARN]', 'Insufficient Lab Tokens! Click Recharge in footer to top up.', 'tag-rare');
      return;
    }

    vaultRoundClaimed = true;
    isSpinning = true;
    toggleSpinButtons(true);
    Sound.vaultOpen();

    // Deduct bet
    state.tokens -= currentBet;
    state.totalBet += currentBet;
    state.totalSpins++;
    state.xp += 10;
    updateHUD();

    const anomalyMult = consumeAnomalyMultiplier();
    const chosenPrize = vaultRoundPrizes[idx];
    const mult = chosenPrize.mult * anomalyMult;
    const payoutTokens = Math.floor(currentBet * mult);

    state.tokens += payoutTokens;
    state.totalWon += payoutTokens;

    if (mult > state.highestMult) {
      state.highestMult = mult;
    }

    const tier = getTierFromMult(mult);
    state.distribution[tier] = (state.distribution[tier] || 0) + 1;

    // Open chosen card
    const chosenCard = document.getElementById(`vault-card-${idx}`);
    const chosenOpen = document.getElementById(`vault-open-${idx}`);
    if (chosenCard && chosenOpen) {
      chosenCard.classList.add('opened');
      chosenOpen.innerHTML = `
        <span class="rng-vault-prize-tokens">+${formatNumber(payoutTokens)}</span>
        <span class="rng-vault-prize-xp">${chosenPrize.label} (${mult.toFixed(1)}x)</span>
      `;
    }

    if (mult > 0) {
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      state.xp += chosenPrize.xp + Math.floor(mult * 15);
      if (mult >= 10.0) Sound.winLegendary();
      else if (mult >= 3.0) Sound.winRare();
      else Sound.winCommon();
    } else {
      state.streak = 0;
    }

    // Reveal all remaining 7 vaults in dimmed mode so user can see all contents
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        if (i === idx) continue;
        const otherCard = document.getElementById(`vault-card-${i}`);
        const otherOpen = document.getElementById(`vault-open-${i}`);
        const prize = vaultRoundPrizes[i];
        if (otherCard && otherOpen) {
          otherCard.classList.add('opened', 'dimmed');
          otherOpen.innerHTML = `
            <span class="rng-vault-prize-tokens" style="color:var(--muted)">+${formatNumber(Math.floor(currentBet * prize.mult))}</span>
            <span class="rng-vault-prize-xp">${prize.label}</span>
          `;
        }
      }
    }, 450);

    // Update Result Banner
    const tag = document.getElementById('vault-tier-tag');
    const msg = document.getElementById('vault-result-msg');
    const pay = document.getElementById('vault-result-payout');

    if (tag) {
      tag.className = `rng-tier-tag tier-${tier}`;
      tag.textContent = tier.toUpperCase();
    }
    if (msg) msg.textContent = `Breached Chamber 0${idx + 1}: ${chosenPrize.label}${anomalyMult > 1 ? ' [5X BOOST!]' : ''} (${mult.toFixed(1)}x)`;
    if (pay) {
      pay.textContent = `${payoutTokens >= 0 ? '+' : ''}${formatNumber(payoutTokens)} TOKENS`;
      pay.style.color = mult > 0 ? 'var(--lime)' : 'var(--muted)';
    }

    logTelemetry(
      `[VAULT]`,
      `Chamber 0${idx + 1} Breached · ${chosenPrize.label} · Payout: +${formatNumber(payoutTokens)} (${mult.toFixed(1)}x)`,
      mult >= 5.0 ? 'tag-rare' : mult > 0 ? 'tag-win' : ''
    );

    updateHUD();
    saveState();
    checkTriggerAnomaly();

    setTimeout(() => {
      isSpinning = false;
      toggleSpinButtons(false);
      const resetBtn = document.getElementById('vault-reset-btn');
      if (resetBtn) resetBtn.focus();
    }, 600);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTROLS & INTERACTION WIRING
  // ─────────────────────────────────────────────────────────────────────────

  function toggleSpinButtons(disabled) {
    const reelBtn = document.getElementById('reels-spin-btn');
    const diceBtn = document.getElementById('dice-roll-btn');
    const wheelBtn = document.getElementById('wheel-spin-btn');
    if (reelBtn) reelBtn.disabled = disabled;
    if (diceBtn) diceBtn.disabled = disabled;
    if (wheelBtn) wheelBtn.disabled = disabled;
  }

  function setMode(mode) {
    activeMode = mode;

    // Tabs
    document.querySelectorAll('.rng-tab').forEach((tab) => {
      const isTarget = tab.dataset.mode === mode;
      tab.classList.toggle('active', isTarget);
      tab.setAttribute('aria-selected', isTarget);
    });

    // Panels
    document.querySelectorAll('.rng-panel-view').forEach((p) => {
      p.hidden = true;
    });

    const activePanel = document.getElementById(`panel-${mode}`);
    if (activePanel) {
      activePanel.hidden = false;
    }

    Sound.click();
  }

  function setBet(amount) {
    currentBet = Math.max(10, Math.min(amount, state.tokens || 1000));
    document.querySelectorAll('.rng-bet-btn').forEach((btn) => {
      const val = parseInt(btn.dataset.bet, 10);
      btn.classList.toggle('active', val === currentBet);
    });
    Sound.click();
  }

  function refillTokens() {
    state.tokens += 5000;
    Sound.winRare();
    updateHUD();
    logTelemetry('[FINANCE]', 'Recharged +5,000 Free Lab Tokens.', 'tag-win');
    saveState();
  }

  function toggleAudio() {
    initAudioContext();
    state.audio = !state.audio;
    const btn = document.getElementById('rng-audio-toggle');
    const stateTxt = document.getElementById('rng-audio-state');
    if (btn) btn.classList.toggle('active', state.audio);
    if (stateTxt) stateTxt.textContent = state.audio ? 'ON' : 'OFF';
    if (state.audio) Sound.click();
    saveState();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OVERLAY CONTROLLER
  // ─────────────────────────────────────────────────────────────────────────

  let lastActiveElement = null;

  function openOverlay() {
    const overlay = document.getElementById('rng-overlay');
    if (!overlay) return;

    lastActiveElement = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('fe-modal-open', 'game-active');

    if (window.__pauseContourBackground) {
      window.__pauseContourBackground();
    }

    // Allow display: flex before adding active open transition
    requestAnimationFrame(() => {
      overlay.classList.add('open');
    });

    updateHUD();
    renderReelGrid();
    renderDiceStage();
    buildWheelSVG();
    renderVaultGrid();

    // Auto focus first interactive button
    const firstBtn = document.getElementById('reels-spin-btn');
    if (firstBtn) firstBtn.focus();
  }

  function closeOverlay() {
    const overlay = document.getElementById('rng-overlay');
    if (!overlay) return;

    overlay.classList.remove('open');
    document.body.classList.remove('fe-modal-open', 'game-active');

    if (window.__resumeContourBackground) {
      window.__resumeContourBackground();
    }

    setTimeout(() => {
      overlay.hidden = true;
      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
      }
    }, 250);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  function init() {
    loadState();

    // Hook launch button in Lab carousel
    const launchBtn = document.getElementById('open-rng-btn');
    if (launchBtn) {
      launchBtn.addEventListener('click', openOverlay);
    }

    // Close / Exit buttons (topbar, footer, and any close triggers)
    const closeTriggers = document.querySelectorAll('#rng-exit-top-btn, #rng-close-btn, #rng-footer-close-btn, .rng-close-btn, .rng-footer-close-btn');
    closeTriggers.forEach((btn) => {
      btn.addEventListener('click', closeOverlay);
    });

    const audioToggle = document.getElementById('rng-audio-toggle');
    if (audioToggle) {
      audioToggle.addEventListener('click', toggleAudio);
      if (state.audio) audioToggle.classList.add('active');
      const stateTxt = document.getElementById('rng-audio-state');
      if (stateTxt) stateTxt.textContent = state.audio ? 'ON' : 'OFF';
    }

    // Refill button in footer
    const refillBtn = document.getElementById('rng-refill-btn');
    if (refillBtn) refillBtn.addEventListener('click', refillTokens);

    // Mode tab buttons
    document.querySelectorAll('.rng-tab').forEach((tab) => {
      tab.addEventListener('click', () => setMode(tab.dataset.mode));
    });

    // Bet selection buttons across all modes
    document.querySelectorAll('.rng-bet-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.bet, 10);
        if (!isNaN(val)) setBet(val);
      });
    });

    // Max Bet buttons
    document.querySelectorAll('.rng-btn-secondary[id$="-max-bet"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const maxAvailable = Math.min(1000, state.tokens);
        setBet(maxAvailable > 0 ? maxAvailable : 100);
      });
    });

    // Mode 01: Reels Spin
    const reelBtn = document.getElementById('reels-spin-btn');
    if (reelBtn) reelBtn.addEventListener('click', spinReels);

    // Mode 02: Dice Controls
    const diceBtn = document.getElementById('dice-roll-btn');
    if (diceBtn) diceBtn.addEventListener('click', rollDice);

    document.querySelectorAll('.rng-dice-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rng-dice-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        diceCount = parseInt(btn.dataset.diceCount, 10) || 3;
        currentDiceValues = diceCount === 3 ? [1, 2, 3] : [1, 2, 3, 4, 5];
        renderDiceStage();
        Sound.click();
      });
    });

    // Mode 03: Wheel Spin
    const wheelBtn = document.getElementById('wheel-spin-btn');
    if (wheelBtn) wheelBtn.addEventListener('click', spinWheel);

    // Mode 04: Vault Reset
    const vaultReset = document.getElementById('vault-reset-btn');
    if (vaultReset) {
      vaultReset.addEventListener('click', () => {
        renderVaultGrid();
        Sound.click();
      });
    }

    // Keyboard bindings
    window.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('rng-overlay');
      if (!overlay || overlay.hidden) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeOverlay();
        return;
      }

      if (e.key === ' ' && !isSpinning) {
        // Spacebar action based on active mode
        e.preventDefault();
        if (activeMode === 'reels') spinReels();
        else if (activeMode === 'dice') rollDice();
        else if (activeMode === 'wheel') spinWheel();
        else if (activeMode === 'vault') {
          if (!vaultRoundClaimed) {
            handleVaultSelect(0);
          } else {
            renderVaultGrid();
          }
        }
        return;
      }

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const modeMap = {
          '1': 'reels',
          '2': 'dice',
          '3': 'wheel',
          '4': 'vault',
          '5': 'stats'
        };
        setMode(modeMap[e.key]);
      }
    });

    // Backdrop click to close (when clicking outside the modal shell)
    const overlayWrap = document.getElementById('rng-overlay');
    if (overlayWrap) {
      overlayWrap.addEventListener('click', (e) => {
        if (e.target === overlayWrap) {
          closeOverlay();
        }
      });
    }

    // Initial render
    renderReelGrid();
    renderDiceStage();
    buildWheelSVG();
    renderVaultGrid();
    updateHUD();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
