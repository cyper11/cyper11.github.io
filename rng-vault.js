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

  // 7 Tech / Lab Symbols with weights & payline multipliers
  const REEL_SYMBOLS = [
    {
      id: 'chip',
      label: 'LOGIC CHIP',
      weight: 34,
      payouts: { 3: 1.2, 4: 2.5, 5: 6.0 },
      color: '#38bdf8',
      svg: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>'
    },
    {
      id: 'ram',
      label: 'RAM STRIP',
      weight: 26,
      payouts: { 3: 1.5, 4: 3.5, 5: 9.0 },
      color: '#a3e635',
      svg: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#a3e635" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="6" y1="18" x2="6" y2="21"/><line x1="10" y1="18" x2="10" y2="21"/><line x1="14" y1="18" x2="14" y2="21"/><line x1="18" y1="18" x2="18" y2="21"/><rect x="5" y="9" width="3" height="4"/><rect x="10.5" y="9" width="3" height="4"/><rect x="16" y="9" width="3" height="4"/></svg>'
    },
    {
      id: 'bios',
      label: 'BIOS ROM',
      weight: 18,
      payouts: { 3: 2.0, 4: 5.0, 5: 14.0 },
      color: '#fb923c',
      svg: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fb923c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/><rect x="2" y="2" width="20" height="20" rx="3"/></svg>'
    },
    {
      id: 'cpu',
      label: 'QUANTUM CORE',
      weight: 11,
      payouts: { 3: 3.0, 4: 8.0, 5: 22.0 },
      color: '#c084fc',
      svg: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#c084fc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/></svg>'
    },
    {
      id: 'fiber',
      label: 'OPTIC LASER',
      weight: 6,
      payouts: { 3: 5.0, 4: 15.0, 5: 45.0 },
      color: '#2dd4bf',
      svg: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2dd4bf" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    },
    {
      id: 'reactor',
      label: 'FUSION CELL',
      weight: 3,
      payouts: { 3: 10.0, 4: 30.0, 5: 90.0 },
      color: '#facc15',
      svg: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#facc15" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12a14.5 14.5 0 0 0 20 0 14.5 14.5 0 0 0-20 0"/></svg>'
    },
    {
      id: 'wild',
      label: 'VAULT WILD',
      weight: 2,
      isWild: true,
      payouts: { 3: 15.0, 4: 50.0, 5: 180.0 },
      color: '#f43f5e',
      svg: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f43f5e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5"/></svg>'
    }
  ];

  // 5 Active Paylines across 5-reels x 3-rows
  const PAYLINES = [
    { name: 'MIDDLE ROW', lineClass: 'line-mid', coords: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]] },
    { name: 'TOP ROW', lineClass: 'line-top', coords: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
    { name: 'BOTTOM ROW', lineClass: 'line-bot', coords: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]] },
    { name: 'V-SHAPE', lineClass: 'line-diag1', coords: [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]] },
    { name: 'INVERTED-V', lineClass: 'line-diag2', coords: [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]] }
  ];

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
  // MODE 01: 5-REEL MACHINE ENGINE
  // ─────────────────────────────────────────────────────────────────────────

  // Grid is 5 columns x 3 visible rows
  let reelGridData = [
    [REEL_SYMBOLS[0], REEL_SYMBOLS[1], REEL_SYMBOLS[2]],
    [REEL_SYMBOLS[1], REEL_SYMBOLS[2], REEL_SYMBOLS[0]],
    [REEL_SYMBOLS[2], REEL_SYMBOLS[0], REEL_SYMBOLS[1]],
    [REEL_SYMBOLS[0], REEL_SYMBOLS[1], REEL_SYMBOLS[2]],
    [REEL_SYMBOLS[1], REEL_SYMBOLS[2], REEL_SYMBOLS[0]]
  ];

  function renderReelGrid() {
    const gridEl = document.getElementById('rng-reels-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    for (let c = 0; c < 5; c++) {
      const colEl = document.createElement('div');
      colEl.className = 'rng-reel-col';
      colEl.id = `reel-col-${c}`;

      const stripEl = document.createElement('div');
      stripEl.className = 'rng-reel-strip';
      stripEl.id = `reel-strip-${c}`;

      for (let r = 0; r < 3; r++) {
        const sym = reelGridData[c][r] || REEL_SYMBOLS[0];
        stripEl.appendChild(createCellElement(sym, c, r));
      }

      colEl.appendChild(stripEl);
      gridEl.appendChild(colEl);
    }
  }

  function createCellElement(symbol, col, row) {
    const cell = document.createElement('div');
    cell.className = 'rng-cell';
    cell.id = `cell-${col}-${row}`;
    cell.dataset.symbol = symbol.id;

    const iconWrap = document.createElement('div');
    iconWrap.className = 'rng-cell-icon';
    iconWrap.innerHTML = symbol.svg;

    const label = document.createElement('span');
    label.className = 'rng-cell-label';
    label.textContent = symbol.label;
    label.style.color = symbol.color;

    cell.appendChild(iconWrap);
    cell.appendChild(label);
    return cell;
  }

  function spinReels() {
    if (isSpinning) return;
    if (state.tokens < currentBet) {
      logTelemetry('[WARN]', 'Insufficient Lab Tokens! Click Recharge in footer to top up.', 'tag-rare');
      return;
    }

    isSpinning = true;
    toggleSpinButtons(true);
    Sound.spinWhoosh();

    // Deduct bet
    state.tokens -= currentBet;
    state.totalBet += currentBet;
    state.totalSpins++;
    state.xp += 10;
    updateHUD();

    // Clear active highlights and paylines
    document.querySelectorAll('.rng-cell.win-highlight').forEach((c) => c.classList.remove('win-highlight'));
    document.querySelectorAll('.rng-payline-indicator').forEach((p) => p.classList.remove('active'));

    // Anomaly multiplier
    const anomalyMult = consumeAnomalyMultiplier();

    // Determine target outcomes for each of the 5 reels x 3 rows
    const targetOutcome = [];
    for (let c = 0; c < 5; c++) {
      targetOutcome[c] = [pickRandomReelSymbol(), pickRandomReelSymbol(), pickRandomReelSymbol()];
    }

    // Spin animation for each column with staggered stops
    const stopTimes = [550, 850, 1150, 1450, 1750];

    for (let c = 0; c < 5; c++) {
      const colEl = document.getElementById(`reel-col-${c}`);
      const stripEl = document.getElementById(`reel-strip-${c}`);
      if (!colEl || !stripEl) continue;

      colEl.classList.add('spinning');

      // Populate dummy blur spinning symbols
      stripEl.innerHTML = '';
      for (let s = 0; s < 12; s++) {
        const randSym = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)];
        stripEl.appendChild(createCellElement(randSym, c, s));
      }

      // Append final 3 target symbols at the bottom
      for (let r = 0; r < 3; r++) {
        stripEl.appendChild(createCellElement(targetOutcome[c][r], c, r));
      }

      // Animate translation
      const cellHeight = colEl.offsetHeight / 3;
      const totalShift = cellHeight * 12;
      stripEl.style.transition = 'none';
      stripEl.style.transform = 'translateY(0px)';

      // Trigger scroll
      setTimeout(() => {
        stripEl.style.transition = `transform ${stopTimes[c]}ms cubic-bezier(0.2, 0.8, 0.25, 1)`;
        stripEl.style.transform = `translateY(-${totalShift}px)`;
      }, 20);

      // Stop handling
      setTimeout(() => {
        colEl.classList.remove('spinning');
        Sound.reelStop(c);

        // Normalize strip to only show final 3 cells with landing bounce
        stripEl.style.transition = 'none';
        stripEl.style.transform = 'translateY(0px)';
        stripEl.innerHTML = '';
        for (let r = 0; r < 3; r++) {
          stripEl.appendChild(createCellElement(targetOutcome[c][r], c, r));
        }

        // Settling bounce effect
        stripEl.animate(
          [
            { transform: 'translateY(-10px)' },
            { transform: 'translateY(4px)' },
            { transform: 'translateY(0)' }
          ],
          { duration: 220, easing: 'ease-out' }
        );

        // Once last reel stops, evaluate payouts
        if (c === 4) {
          reelGridData = targetOutcome;
          evaluateReelOutcome(anomalyMult);
        }
      }, stopTimes[c]);
    }
  }

  function evaluateReelOutcome(anomalyMult) {
    let totalMultiplier = 0;
    const winningPaylines = [];
    const winningCells = new Set();

    // Check each of the 5 paylines
    PAYLINES.forEach((payline, pIdx) => {
      const lineSymbols = payline.coords.map(([c, r]) => reelGridData[c][r]);

      // Check for matching symbols starting from reel 0 (left to right)
      // Account for WILD
      let matchSymbol = null;
      let count = 0;

      for (let i = 0; i < 5; i++) {
        const sym = lineSymbols[i];
        if (!matchSymbol) {
          if (!sym.isWild) {
            matchSymbol = sym;
            count++;
          } else {
            count++;
          }
        } else {
          if (sym.id === matchSymbol.id || sym.isWild) {
            count++;
          } else {
            break;
          }
        }
      }

      // Fallback if all 5 were wild!
      if (!matchSymbol) matchSymbol = REEL_SYMBOLS.find((s) => s.isWild);

      // Payline qualifies if >= 3 match
      if (count >= 3 && matchSymbol && matchSymbol.payouts[count]) {
        const mult = matchSymbol.payouts[count];
        totalMultiplier += mult;
        winningPaylines.push({ payline, count, mult, symbol: matchSymbol });

        for (let i = 0; i < count; i++) {
          const [c, r] = payline.coords[i];
          winningCells.add(`cell-${c}-${r}`);
        }
      }
    });

    // Apply anomaly multiplier if triggered
    totalMultiplier *= anomalyMult;

    const payoutTokens = Math.floor(currentBet * totalMultiplier);
    state.tokens += payoutTokens;
    state.totalWon += payoutTokens;

    if (totalMultiplier > state.highestMult) {
      state.highestMult = totalMultiplier;
    }

    const tier = getTierFromMult(totalMultiplier);
    state.distribution[tier] = (state.distribution[tier] || 0) + 1;

    // Highlights
    winningCells.forEach((cellId) => {
      const el = document.getElementById(cellId);
      if (el) el.classList.add('win-highlight');
    });

    winningPaylines.forEach(({ payline }) => {
      const lineEl = document.getElementById(payline.lineClass);
      if (lineEl) lineEl.classList.add('active');
    });

    // Sounds & Streaks
    if (totalMultiplier > 0) {
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      state.xp += Math.floor(totalMultiplier * 15);

      if (totalMultiplier >= 15.0) Sound.winLegendary();
      else if (totalMultiplier >= 3.0) Sound.winRare();
      else Sound.winCommon();
    } else {
      state.streak = 0;
    }

    // Update Result Banner
    const banner = document.getElementById('rng-reels-result');
    const tag = document.getElementById('reels-tier-tag');
    const msg = document.getElementById('reels-result-msg');
    const pay = document.getElementById('reels-result-payout');

    if (tag) {
      tag.className = `rng-tier-tag tier-${tier}`;
      tag.textContent = tier.toUpperCase();
    }

    if (msg) {
      if (totalMultiplier > 0) {
        const countTxt = winningPaylines.length === 1 ? '1 Payline' : `${winningPaylines.length} Paylines`;
        msg.textContent = `${countTxt} matched! Multiplier: ${totalMultiplier.toFixed(1)}x${anomalyMult > 1 ? ' [5X ANOMALY BOOST!]' : ''}`;
      } else {
        msg.textContent = 'Zero resonance match. Entropy redistributed.';
      }
    }

    if (pay) {
      pay.textContent = `${payoutTokens >= 0 ? '+' : ''}${formatNumber(payoutTokens)} TOKENS`;
      pay.style.color = totalMultiplier > 0 ? 'var(--lime)' : 'var(--muted)';
    }

    // Telemetry log
    const logTag = totalMultiplier >= 5.0 ? 'tag-rare' : totalMultiplier > 0 ? 'tag-win' : '';
    logTelemetry(
      `[REELS]`,
      `Bet: ${currentBet} · Win: ${formatNumber(payoutTokens)} (${totalMultiplier.toFixed(1)}x) · Streak: ${state.streak}`,
      logTag
    );

    updateHUD();
    saveState();
    checkTriggerAnomaly();

    setTimeout(() => {
      isSpinning = false;
      toggleSpinButtons(false);
    }, 400);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODE 02: QUANTUM DICE ENGINE
  // ─────────────────────────────────────────────────────────────────────────

  let currentDiceValues = [1, 2, 3];

  function renderDiceStage() {
    const stage = document.getElementById('rng-dice-stage');
    if (!stage) return;
    stage.innerHTML = '';

    for (let i = 0; i < diceCount; i++) {
      const die = document.createElement('div');
      die.className = 'rng-die';
      die.id = `die-${i}`;
      die.dataset.val = currentDiceValues[i] || 1;

      // 9 pips in 3x3 grid
      for (let p = 1; p <= 9; p++) {
        const pip = document.createElement('span');
        pip.className = `rng-pip p-${p}`;
        die.appendChild(pip);
      }

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

    // Deduct bet
    state.tokens -= currentBet;
    state.totalBet += currentBet;
    state.totalSpins++;
    state.xp += 10;
    updateHUD();

    const anomalyMult = consumeAnomalyMultiplier();
    const diceEls = [];

    for (let i = 0; i < diceCount; i++) {
      const die = document.getElementById(`die-${i}`);
      if (die) {
        die.classList.add('rolling');
        diceEls.push(die);
      }
    }

    // Random roll cycle
    const targetValues = [];
    for (let i = 0; i < diceCount; i++) {
      targetValues.push(Math.floor(Math.random() * 6) + 1);
    }

    // Settle dice sequentially
    diceEls.forEach((die, idx) => {
      setTimeout(() => {
        die.classList.remove('rolling');
        die.dataset.val = targetValues[idx];
        Sound.tick();

        if (idx === diceCount - 1) {
          currentDiceValues = targetValues;
          evaluateDiceOutcome(anomalyMult);
        }
      }, 600 + idx * 200);
    });
  }

  function evaluateDiceOutcome(anomalyMult) {
    const vals = [...currentDiceValues];
    const counts = {};
    vals.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    const countArr = Object.values(counts).sort((a, b) => b - a);

    let mult = 0;
    let desc = '';

    if (diceCount === 3) {
      // 3 Dice Evaluation
      if (countArr[0] === 3) {
        if (vals[0] === 6) {
          mult = 30.0;
          desc = 'TRIPLE 6s! MAXIMUM QUANTUM TRIAD';
        } else {
          mult = 12.0;
          desc = `TRIPLE ${vals[0]}s! QUANTUM TRIAD`;
        }
      } else if (countArr[0] === 2) {
        mult = 2.0;
        desc = 'MATCH! DUAL HARMONIC PAIR';
      } else {
        // Check straight
        const sorted = [...vals].sort();
        if (
          (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) ||
          (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4) ||
          (sorted[0] === 3 && sorted[1] === 4 && sorted[2] === 5) ||
          (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6)
        ) {
          mult = 6.0;
          desc = 'STRAIGHT! SEQUENTIAL FLUX';
        } else {
          const sum = vals.reduce((a, b) => a + b, 0);
          if (sum >= 15) {
            mult = 1.2;
            desc = `HIGH SUM ENERGY (${sum})`;
          } else {
            mult = 0;
            desc = `NO HARMONIC COMBO (SUM ${sum})`;
          }
        }
      }
    } else {
      // 5 Dice Evaluation
      if (countArr[0] === 5) {
        mult = 50.0;
        desc = `PENTAGON 5-OF-A-KIND! PERFECT ROLL`;
      } else if (countArr[0] === 4) {
        mult = 15.0;
        desc = 'FOUR OF A KIND! QUAD MATRIX';
      } else if (countArr[0] === 3 && countArr[1] === 2) {
        mult = 10.0;
        desc = 'FULL HOUSE RESONANCE';
      } else if (countArr[0] === 3) {
        mult = 4.0;
        desc = 'THREE OF A KIND';
      } else if (countArr[0] === 2 && countArr[1] === 2) {
        mult = 2.5;
        desc = 'TWO PAIR STABILIZED';
      } else if (countArr[0] === 2) {
        mult = 1.2;
        desc = 'SINGLE PAIR';
      } else {
        const sorted = [...vals].sort().join('');
        if (sorted === '12345' || sorted === '23456') {
          mult = 12.0;
          desc = 'LARGE STRAIGHT (5-SEQUENCE)';
        } else {
          mult = 0;
          desc = 'HIGH DISORDER BUST';
        }
      }
    }

    mult *= anomalyMult;

    const payoutTokens = Math.floor(currentBet * mult);
    state.tokens += payoutTokens;
    state.totalWon += payoutTokens;

    if (mult > state.highestMult) {
      state.highestMult = mult;
    }

    const tier = getTierFromMult(mult);
    state.distribution[tier] = (state.distribution[tier] || 0) + 1;

    if (mult > 0) {
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      state.xp += Math.floor(mult * 15);
      if (mult >= 10.0) Sound.winLegendary();
      else if (mult >= 3.0) Sound.winRare();
      else Sound.winCommon();
    } else {
      state.streak = 0;
    }

    // Update Result Banner
    const tag = document.getElementById('dice-tier-tag');
    const msg = document.getElementById('dice-result-msg');
    const pay = document.getElementById('dice-result-payout');

    if (tag) {
      tag.className = `rng-tier-tag tier-${tier}`;
      tag.textContent = tier.toUpperCase();
    }
    if (msg) msg.textContent = `${desc}${anomalyMult > 1 ? ' [5X BOOST!]' : ''} (${mult.toFixed(1)}x)`;
    if (pay) {
      pay.textContent = `${payoutTokens >= 0 ? '+' : ''}${formatNumber(payoutTokens)} TOKENS`;
      pay.style.color = mult > 0 ? 'var(--lime)' : 'var(--muted)';
    }

    logTelemetry(
      `[DICE]`,
      `[${vals.join('-')}] · ${desc} · Payout: +${formatNumber(payoutTokens)} (${mult.toFixed(1)}x)`,
      mult >= 5.0 ? 'tag-rare' : mult > 0 ? 'tag-win' : ''
    );

    updateHUD();
    saveState();
    checkTriggerAnomaly();

    setTimeout(() => {
      isSpinning = false;
      toggleSpinButtons(false);
    }, 300);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MODE 03: CALIBRATED RNG WHEEL
  // ─────────────────────────────────────────────────────────────────────────

  function buildWheelSVG() {
    const svg = document.getElementById('rng-wheel-svg');
    if (!svg) return;
    svg.innerHTML = '';

    const center = 150;
    const radius = 146;
    const totalSlices = WHEEL_SECTORS.length;
    const sliceAngle = (Math.PI * 2) / totalSlices;

    WHEEL_SECTORS.forEach((sec, idx) => {
      const startAngle = idx * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', sec.color);
      path.setAttribute('stroke', '#283222');
      path.setAttribute('stroke-width', '1.5');
      svg.appendChild(path);

      // Label text
      const midAngle = startAngle + sliceAngle / 2;
      const textRadius = radius * 0.72;
      const tx = center + textRadius * Math.cos(midAngle);
      const ty = center + textRadius * Math.sin(midAngle);
      const deg = (midAngle * 180) / Math.PI + 90;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tx);
      text.setAttribute('y', ty);
      text.setAttribute('fill', sec.textColor);
      text.setAttribute('font-family', 'IBM Plex Mono, monospace');
      text.setAttribute('font-size', '10.5');
      text.setAttribute('font-weight', '700');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('transform', `rotate(${deg}, ${tx}, ${ty})`);
      text.textContent = sec.label;
      svg.appendChild(text);
    });
  }

  function spinWheel() {
    if (isSpinning) return;
    if (state.tokens < currentBet) {
      logTelemetry('[WARN]', 'Insufficient Lab Tokens! Click Recharge in footer to top up.', 'tag-rare');
      return;
    }

    isSpinning = true;
    toggleSpinButtons(true);
    Sound.spinWhoosh();

    // Deduct bet
    state.tokens -= currentBet;
    state.totalBet += currentBet;
    state.totalSpins++;
    state.xp += 10;
    updateHUD();

    const anomalyMult = consumeAnomalyMultiplier();
    const disc = document.getElementById('rng-wheel-disc');
    const pointer = document.getElementById('rng-wheel-pointer');
    if (!disc) return;

    // Pick target sector
    const targetIdx = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const sliceDeg = 360 / WHEEL_SECTORS.length;

    // Target stop: Pointer is at top (0 deg). Segment center aligned with top pointer.
    const targetOffset = targetIdx * sliceDeg + sliceDeg / 2;
    const fullSpins = 360 * (5 + Math.floor(Math.random() * 3));
    const targetRotation = wheelAngle + fullSpins + (360 - (targetOffset % 360));

    disc.style.transition = 'transform 3.8s cubic-bezier(0.12, 0.9, 0.22, 1)';
    disc.style.transform = `rotate(${targetRotation}deg)`;

    // Audio ticks during deceleration
    let tickCount = 0;
    const totalTicks = 24;
    const tickInterval = setInterval(() => {
      tickCount++;
      Sound.tick();
      if (pointer) {
        pointer.style.transform = 'translateX(-50%) rotate(-12deg)';
        setTimeout(() => {
          if (pointer) pointer.style.transform = 'translateX(-50%) rotate(0deg)';
        }, 50);
      }
      if (tickCount >= totalTicks) {
        clearInterval(tickInterval);
      }
    }, 150);

    setTimeout(() => {
      clearInterval(tickInterval);
      wheelAngle = targetRotation % 360;
      evaluateWheelOutcome(targetIdx, anomalyMult);
    }, 3900);
  }

  function evaluateWheelOutcome(targetIdx, anomalyMult) {
    const sec = WHEEL_SECTORS[targetIdx];
    const mult = sec.mult * anomalyMult;
    const payoutTokens = Math.floor(currentBet * mult);

    state.tokens += payoutTokens;
    state.totalWon += payoutTokens;

    if (mult > state.highestMult) {
      state.highestMult = mult;
    }

    const tier = getTierFromMult(mult);
    state.distribution[tier] = (state.distribution[tier] || 0) + 1;

    if (mult > 0) {
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      state.xp += Math.floor(mult * 15);
      if (mult >= 10.0) Sound.winLegendary();
      else if (mult >= 3.0) Sound.winRare();
      else Sound.winCommon();
    } else {
      state.streak = 0;
    }

    const tag = document.getElementById('wheel-tier-tag');
    const msg = document.getElementById('wheel-result-msg');
    const pay = document.getElementById('wheel-result-payout');

    if (tag) {
      tag.className = `rng-tier-tag tier-${tier}`;
      tag.textContent = tier.toUpperCase();
    }
    if (msg) msg.textContent = `Wheel locked sector: ${sec.label}${anomalyMult > 1 ? ' [5X BOOST!]' : ''} (${mult.toFixed(1)}x)`;
    if (pay) {
      pay.textContent = `${payoutTokens >= 0 ? '+' : ''}${formatNumber(payoutTokens)} TOKENS`;
      pay.style.color = mult > 0 ? 'var(--lime)' : 'var(--muted)';
    }

    logTelemetry(
      `[WHEEL]`,
      `Sector: ${sec.label} · Payout: +${formatNumber(payoutTokens)} (${mult.toFixed(1)}x) · Multiplier: ${mult.toFixed(1)}x`,
      mult >= 5.0 ? 'tag-rare' : mult > 0 ? 'tag-win' : ''
    );

    updateHUD();
    saveState();
    checkTriggerAnomaly();

    setTimeout(() => {
      isSpinning = false;
      toggleSpinButtons(false);
    }, 200);
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
    // Allow display: flex before adding active open transition
    requestAnimationFrame(() => {
      overlay.classList.add('open');
      document.body.classList.add('fe-modal-open');
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
    document.body.classList.remove('fe-modal-open');

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
