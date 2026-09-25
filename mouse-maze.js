/* ═══════════════════════════════════════════════════════════════════
   LAB 07 // MOUSE MAZE — 10-LEVEL PROCEDURAL MAZE & PSYCHOLOGICAL UI
   Recursive Backtracking + BFS Verification · 100% Sandboxed Browser Experiment
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const openBtn = document.getElementById('open-maze-btn');
  const overlay = document.getElementById('mm-overlay');
  if (!openBtn || !overlay) return;

  const canvas = document.getElementById('mm-canvas');
  const stage = document.getElementById('mm-stage');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!canvas || !ctx || !stage) return;

  /* ─── HUD & Screen Elements ─── */
  const statusBadge = document.getElementById('mm-status-badge');
  const statusText = document.getElementById('mm-status-text');
  const topTitleEl = document.getElementById('mm-top-title');
  const levelEl = document.getElementById('mm-top-level');
  const timerEl = document.getElementById('mm-top-timer');
  const attemptsEl = document.getElementById('mm-top-attempts');
  const exitTopBtn = document.getElementById('mm-exit-top-btn');
  const footerProgressEl = document.getElementById('mm-footer-progress');

  const startScreen = document.getElementById('mm-start-screen');
  const startBtn = document.getElementById('mm-start-btn');
  const startExitBtn = document.getElementById('mm-start-exit-btn');

  const levelTransScreen = document.getElementById('mm-level-transition');
  const transEyebrow = document.getElementById('mm-trans-eyebrow');
  const transTitle = document.getElementById('mm-trans-title');
  const transProgressLabel = document.getElementById('mm-trans-progress-label');
  const transProgressAscii = document.getElementById('mm-trans-progress-ascii');
  const transSub = document.getElementById('mm-trans-sub');

  const winScreen = document.getElementById('mm-win-screen');
  const winEyebrow = document.getElementById('mm-win-eyebrow');
  const winTitle = document.getElementById('mm-win-title');
  const winProgressLabel = document.getElementById('mm-win-progress-label');
  const winProgressAscii = document.getElementById('mm-win-progress-ascii');
  const winTimeLabel = document.getElementById('mm-win-time-label');
  const winTimeEl = document.getElementById('mm-win-time');
  const winAttemptsLabel = document.getElementById('mm-win-attempts-label');
  const winAttemptsEl = document.getElementById('mm-win-attempts');
  const playAgainBtn = document.getElementById('mm-play-again-btn');
  const winExitBtn = document.getElementById('mm-win-exit-btn');

  /* ─── Psychological / Simulated Desktop UI Elements ─── */
  const desktopToast = document.getElementById('mm-desktop-toast');
  const toastBody = document.getElementById('mm-toast-body');
  const miniTerm = document.getElementById('mm-mini-term');
  const miniTermText = document.getElementById('mm-mini-term-text');
  const camPopup = document.getElementById('mm-cam-popup');
  const filePopup = document.getElementById('mm-file-popup');
  const fileWarnText = document.getElementById('mm-file-warn');
  const idleMsg = document.getElementById('mm-idle-msg');
  const whisperMsg = document.getElementById('mm-whisper-msg');
  const finaleScreen = document.getElementById('mm-finale-screen');
  const finaleText = document.getElementById('mm-finale-text');
  const jumpscareOverlay = document.getElementById('mm-jumpscare-overlay');
  const jumpscareImg = document.getElementById('mm-jumpscare-img');

  /* Silent off-DOM preloader for the final level jumpscare asset (never displayed before trigger) */
  const JUMPSCARE_ASSET_SRC = 'mm-final-asset.png';
  let jumpscarePreloaded = false;
  function preloadFinalAssetSilently() {
    if (jumpscarePreloaded) return;
    jumpscarePreloaded = true;
    const preloader = new Image();
    preloader.src = JUMPSCARE_ASSET_SRC;
  }

  /* Optional Web Audio API Scare Sound (Zero external audio dependency) */
  let audioCtx = null;
  function unlockAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch (_) {
      /* Ignore if audio is blocked or unavailable */
    }
  }

  function playScareSound() {
    try {
      unlockAudioContext();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const duration = 1.25;

      const master = audioCtx.createGain();
      master.gain.setValueAtTime(0.65, now);
      master.gain.exponentialRampToValueAtTime(0.01, now + duration);
      master.connect(audioCtx.destination);

      /* Dissonant shriek oscillators */
      const freqs = [118, 233, 587, 830, 1244];
      for (let i = 0; i < freqs.length; i++) {
        const osc = audioCtx.createOscillator();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(freqs[i], now);
        osc.frequency.linearRampToValueAtTime(freqs[i] * (i % 2 === 0 ? 1.18 : 0.86), now + 0.35);
        osc.connect(master);
        osc.start(now);
        osc.stop(now + duration);
      }

      /* White noise burst for sudden impact */
      const bufferSize = Math.floor(audioCtx.sampleRate * duration);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.45));
      }
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.55, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.02, now + duration);
      whiteNoise.connect(noiseGain);
      noiseGain.connect(master);
      whiteNoise.start(now);
    } catch (_) {
      /* Ignore if audio is unavailable */
    }
  }

  /* ─── Theme Colors ─── */
  const COLORS = {
    bg: '#111310',
    wallFill: '#121510',
    corridorFill: '#191d16',
    corridorGrid: 'rgba(213, 251, 120, 0.055)',
    wallStroke: '#3a452e',
    wallAccent: '#d5fb78',
    text: '#f0f1e9',
    muted: '#a0a598',
    lime: '#d5fb78',
    amber: '#e2b86b',
    danger: '#ff6b6b'
  };

  /* ─── 10-Level Progressive Difficulty Configuration ─── */
  const MAX_LEVEL = 10;
  const LEVEL_CONFIGS = [
    null, // 1-indexed
    {
      level: 1,
      cols: 4,
      rows: 3,
      corridorRatio: 0.64,
      pruneDeadEnds: 0.80,
      turnBias: 0.50,
      minTurns: 2,
      timer: 45.0,
      subtitle: 'WIDE CORRIDORS // BASELINE CALIBRATION'
    },
    {
      level: 2,
      cols: 5,
      rows: 3,
      corridorRatio: 0.56,
      pruneDeadEnds: 0.42,
      turnBias: 0.58,
      minTurns: 4,
      timer: 40.0,
      subtitle: 'SLIGHTLY SMALLER CORRIDORS // MORE TURNS & DEAD ENDS'
    },
    {
      level: 3,
      cols: 6,
      rows: 4,
      corridorRatio: 0.50,
      pruneDeadEnds: 0.15,
      turnBias: 0.64,
      minTurns: 5,
      timer: 35.0,
      subtitle: 'SMALLER CORRIDORS // MISLEADING BRANCH PATHS'
    },
    {
      level: 4,
      cols: 7,
      rows: 4,
      corridorRatio: 0.45,
      pruneDeadEnds: 0.0,
      turnBias: 0.70,
      minTurns: 7,
      timer: 30.0,
      subtitle: 'NARROW CORRIDORS // LONGER ROUTE & DEAD ENDS'
    },
    {
      level: 5,
      cols: 8,
      rows: 5,
      corridorRatio: 0.40,
      pruneDeadEnds: 0.0,
      turnBias: 0.75,
      minTurns: 8,
      timer: 25.0,
      subtitle: 'VERY NARROW CORRIDORS // MULTIPLE MISLEADING ROUTES'
    },
    {
      level: 6,
      cols: 8,
      rows: 5,
      corridorRatio: 0.37,
      pruneDeadEnds: 0.0,
      turnBias: 0.78,
      minTurns: 9,
      timer: 24.0,
      subtitle: 'SUB-SECTOR 06 // HIGH-DENSITY ROUTING'
    },
    {
      level: 7,
      cols: 9,
      rows: 5,
      corridorRatio: 0.35,
      pruneDeadEnds: 0.0,
      turnBias: 0.80,
      minTurns: 10,
      timer: 23.0,
      subtitle: 'SUB-SECTOR 07 // DEEP LABYRINTH TOPOLOGY'
    },
    {
      level: 8,
      cols: 9,
      rows: 6,
      corridorRatio: 0.34,
      pruneDeadEnds: 0.0,
      turnBias: 0.82,
      minTurns: 11,
      timer: 22.0,
      subtitle: 'SUB-SECTOR 08 // MICRO-CLEARANCE CONDUIT'
    },
    {
      level: 9,
      cols: 10,
      rows: 6,
      corridorRatio: 0.32,
      pruneDeadEnds: 0.0,
      turnBias: 0.85,
      minTurns: 12,
      timer: 21.0,
      subtitle: 'SUB-SECTOR 09 // CRITICAL TOLERANCE MATRIX'
    },
    {
      level: 10,
      cols: 11,
      rows: 6,
      corridorRatio: 0.31,
      pruneDeadEnds: 0.0,
      turnBias: 0.88,
      minTurns: 13,
      timer: 20.0,
      subtitle: 'FINAL CORE // TERMINAL PRECISION LABYRINTH'
    }
  ];

  function getLevelConfig(lvl) {
    const idx = Math.max(1, Math.min(MAX_LEVEL, lvl));
    return LEVEL_CONFIGS[idx];
  }

  function formatAsciiProgress(lvl) {
    const filled = Math.max(0, Math.min(MAX_LEVEL, lvl));
    return '█'.repeat(filled) + '░'.repeat(MAX_LEVEL - filled);
  }

  /* ─── Runtime State ─── */
  let isModalOpen = false;
  let listenersMounted = false;
  let rafId = null;
  let lastTime = 0;
  let pulseClock = 0;

  let viewW = 800;
  let viewH = 520;
  let dpr = 1;

  let currentLevel = 1;
  let activeMazeTopology = null; // Stores procedural grid & verified edges
  let corridors = [];
  let startPos = { x: 100, y: 400, r: 16 };
  let exitPos = { x: 700, y: 110, r: 16 };
  let waypoints = [];
  let totalPathLen = 1;

  // 'READY' | 'PLAYING' | 'TRANSITION' | 'LEVEL_WIN' | 'TIMEOUT' | 'FINALE' | 'ALL_COMPLETE'
  let state = 'READY';
  let probeEngaged = false;
  let probe = { x: 100, y: 400, r: 6 };
  let pointer = { x: 100, y: 400 };
  let ghostCursor = { x: 100, y: 400, alpha: 0 };

  let levelDuration = 45.0;
  let timeLeft = 45.0;
  let levelAttempts = 1;
  let totalAttempts = 1;
  let totalTimeCompleted = 0;
  let sessionPlayTime = 0;
  let idleTime = 0;
  let currentProgress = 0;
  let shakeTime = 0;
  let glitchCanvasMode = false;
  let jumpscareTriggeredThisSession = false;
  let particles = [];
  let activeTimeouts = [];

  /* Track psychological horror events across the 10-level session */
  let triggeredEvents = {
    toast1: false,
    userDetected: false,
    miniTerm: false,
    camStatus: false,
    fakeFile: false,
    whisper1: false,
    whisper2: false,
    whisper3: false,
    whisper4: false
  };

  /* ─── Safe Timeout Helper (Cleared on Exit/Reset) ─── */
  function scheduleEvent(fn, delayMs) {
    const id = setTimeout(() => {
      const idx = activeTimeouts.indexOf(id);
      if (idx !== -1) activeTimeouts.splice(idx, 1);
      if (isModalOpen) fn();
    }, delayMs);
    activeTimeouts.push(id);
    return id;
  }

  function clearAllScheduledEvents() {
    while (activeTimeouts.length > 0) {
      clearTimeout(activeTimeouts.pop());
    }
    if (desktopToast) desktopToast.hidden = true;
    if (miniTerm) miniTerm.hidden = true;
    if (camPopup) camPopup.hidden = true;
    if (filePopup) filePopup.hidden = true;
    if (idleMsg) idleMsg.hidden = true;
    if (whisperMsg) whisperMsg.hidden = true;
    if (levelTransScreen) levelTransScreen.hidden = true;
    if (finaleScreen) {
      finaleScreen.hidden = true;
      finaleScreen.classList.remove('mm-glitch-active');
    }
    if (jumpscareOverlay) {
      jumpscareOverlay.hidden = true;
      jumpscareOverlay.classList.remove('mm-jumpscare-active');
    }
    if (jumpscareImg) {
      jumpscareImg.removeAttribute('src');
    }
    if (statusBadge) statusBadge.classList.remove('mm-status-override');
    if (statusText) statusText.textContent = state === 'PLAYING' ? 'STATUS: CALIBRATED' : 'STATUS: READY';
    if (topTitleEl) topTitleEl.innerHTML = '<b>07 / GAME</b>MOUSE MAZE';
    glitchCanvasMode = false;
  }

  /* ═══════════════════════════════════════════════════════════════════
     PROCEDURAL MAZE GENERATION (RECURSIVE BACKTRACKING + BFS VERIFIER)
     Guarantees every generated maze has a valid START -> EXIT path
     ═══════════════════════════════════════════════════════════════════ */

  function cellKey(c, r) {
    return `${c},${r}`;
  }

  function edgeKey(c1, r1, c2, r2) {
    if (c1 < c2 || (c1 === c2 && r1 < r2)) {
      return `${c1},${r1}-${c2},${r2}`;
    }
    return `${c2},${r2}-${c1},${r1}`;
  }

  /* Breadth-First Search (BFS) shortest path from Start to Exit */
  function findShortestPathBFS(cols, rows, adjMap, startCell, exitCell) {
    const startK = cellKey(startCell.c, startCell.r);
    const exitK = cellKey(exitCell.c, exitCell.r);
    const queue = [startCell];
    const visited = new Set([startK]);
    const parent = new Map();

    while (queue.length > 0) {
      const curr = queue.shift();
      const currK = cellKey(curr.c, curr.r);
      if (currK === exitK) {
        const path = [];
        let trace = curr;
        while (trace) {
          path.push(trace);
          trace = parent.get(cellKey(trace.c, trace.r));
        }
        path.reverse();
        return path;
      }

      const neighbors = adjMap.get(currK) || [];
      for (let i = 0; i < neighbors.length; i++) {
        const nb = neighbors[i];
        const nbK = cellKey(nb.c, nb.r);
        if (!visited.has(nbK)) {
          visited.add(nbK);
          parent.set(nbK, curr);
          queue.push(nb);
        }
      }
    }
    return null; // Unreachable
  }

  function countPathTurns(path) {
    if (!path || path.length < 3) return 0;
    let turns = 0;
    for (let i = 1; i < path.length - 1; i++) {
      const dx1 = path[i].c - path[i - 1].c;
      const dy1 = path[i].r - path[i - 1].r;
      const dx2 = path[i + 1].c - path[i].c;
      const dy2 = path[i + 1].r - path[i].r;
      if (dx1 !== dx2 || dy1 !== dy2) {
        turns++;
      }
    }
    return turns;
  }

  function generateSingleCandidateMaze(cfg) {
    const { cols, rows, turnBias, pruneDeadEnds } = cfg;
    const startCell = { c: 0, r: rows - 1 };
    const exitCell = { c: cols - 1, r: 0 };

    const visited = Array.from({ length: cols }, () => Array(rows).fill(false));
    const adjMap = new Map();

    function addPassage(c1, r1, c2, r2) {
      const k1 = cellKey(c1, r1);
      const k2 = cellKey(c2, r2);
      if (!adjMap.has(k1)) adjMap.set(k1, []);
      if (!adjMap.has(k2)) adjMap.set(k2, []);
      adjMap.get(k1).push({ c: c2, r: r2 });
      adjMap.get(k2).push({ c: c1, r: r1 });
    }

    /* Iterative Recursive Backtracking (Randomized DFS with turn preference) */
    const stack = [{ c: startCell.c, r: startCell.r, dirX: 0, dirY: 0 }];
    visited[startCell.c][startCell.r] = true;

    const DIRS = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      const candidates = [];

      for (let i = 0; i < DIRS.length; i++) {
        const nc = top.c + DIRS[i].dx;
        const nr = top.r + DIRS[i].dy;
        if (nc >= 0 && nc < cols && nr >= 0 && nr < rows && !visited[nc][nr]) {
          const isTurn = top.dirX !== 0 || top.dirY !== 0
            ? (DIRS[i].dx !== top.dirX || DIRS[i].dy !== top.dirY)
            : true;
          const weight = (isTurn ? turnBias : 1 - turnBias) + Math.random() * 0.45;
          candidates.push({ nc, nr, dx: DIRS[i].dx, dy: DIRS[i].dy, weight });
        }
      }

      if (candidates.length === 0) {
        stack.pop();
      } else {
        candidates.sort((a, b) => b.weight - a.weight);
        const chosen = candidates[0];
        visited[chosen.nc][chosen.nr] = true;
        addPassage(top.c, top.r, chosen.nc, chosen.nr);
        stack.push({ c: chosen.nc, r: chosen.nr, dirX: chosen.dx, dirY: chosen.dy });
      }
    }

    /* Verify shortest path via BFS */
    const initialSolution = findShortestPathBFS(cols, rows, adjMap, startCell, exitCell);
    if (!initialSolution) return null;

    /* For earlier levels (Levels 1-3), prune a percentage of non-solution dead ends
       so Level 1 is wide & clean, Level 2 has moderate branches, and Level 4+ has full dead ends */
    if (pruneDeadEnds > 0) {
      const solutionSet = new Set(initialSolution.map((p) => cellKey(p.c, p.r)));
      let changed = true;
      let pass = 0;
      while (changed && pass < 6) {
        changed = false;
        pass++;
        for (const [k, neighbors] of adjMap.entries()) {
          if (solutionSet.has(k)) continue;
          if (neighbors.length === 1 && Math.random() < pruneDeadEnds) {
            const nb = neighbors[0];
            const nbK = cellKey(nb.c, nb.r);
            const nbList = adjMap.get(nbK) || [];
            const [cStr, rStr] = k.split(',');
            const cVal = Number(cStr);
            const rVal = Number(rStr);
            adjMap.set(
              nbK,
              nbList.filter((item) => !(item.c === cVal && item.r === rVal))
            );
            adjMap.delete(k);
            changed = true;
          }
        }
      }
    }

    /* Final BFS Verification before accepting the maze */
    const verifiedSolution = findShortestPathBFS(cols, rows, adjMap, startCell, exitCell);
    if (!verifiedSolution || verifiedSolution.length < 2) return null;

    /* Collect unique open passage edges */
    const seenEdges = new Set();
    const edges = [];
    for (const [k, neighbors] of adjMap.entries()) {
      const [c1, r1] = k.split(',').map(Number);
      for (let i = 0; i < neighbors.length; i++) {
        const c2 = neighbors[i].c;
        const r2 = neighbors[i].r;
        const ek = edgeKey(c1, r1, c2, r2);
        if (!seenEdges.has(ek)) {
          seenEdges.add(ek);
          edges.push({ c1, r1, c2, r2 });
        }
      }
    }

    return {
      cols,
      rows,
      startCell,
      exitCell,
      edges,
      solutionPath: verifiedSolution,
      turns: countPathTurns(verifiedSolution),
      corridorRatio: cfg.corridorRatio
    };
  }

  function generateVerifiedLevelMaze(lvl) {
    const cfg = getLevelConfig(lvl);
    let bestCandidate = null;
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < 24; attempt++) {
      const candidate = generateSingleCandidateMaze(cfg);
      if (!candidate) continue;

      const turnScore = candidate.turns >= cfg.minTurns
        ? 20 + candidate.turns
        : candidate.turns * 2;
      const lenScore = candidate.solutionPath.length;
      const totalScore = turnScore + lenScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestCandidate = candidate;
      }
      if (candidate.turns >= cfg.minTurns && candidate.solutionPath.length >= cfg.cols + cfg.rows - 1) {
        break;
      }
    }

    return bestCandidate;
  }

  /* ─── Build Pixel Corridors & Waypoints from Active Maze Topology ─── */
  function computeMazeGeometry() {
    if (!stage || !canvas) return;
    const rect = stage.getBoundingClientRect();
    viewW = Math.max(300, Math.floor(rect.width));
    viewH = Math.max(280, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!activeMazeTopology) {
      activeMazeTopology = generateVerifiedLevelMaze(currentLevel);
    }

    const topo = activeMazeTopology;
    const { cols, rows, edges, solutionPath, startCell, exitCell, corridorRatio } = topo;

    /* Compute responsive cell grid bounds */
    const padX = Math.max(36, Math.round(viewW * 0.075));
    const padY = Math.max(36, Math.round(viewH * 0.09));
    const usableW = Math.max(200, viewW - padX * 2);
    const usableH = Math.max(180, viewH - padY * 2);

    const stepX = cols > 1 ? usableW / (cols - 1) : usableW;
    const stepY = rows > 1 ? usableH / (rows - 1) : usableH;
    const cellPitch = Math.min(stepX, stepY);

    /* Scale probe radius and corridor width so the maze is ALWAYS physically solvable */
    const rawCorridorW = Math.round(cellPitch * corridorRatio);
    probe.r = Math.max(4.5, Math.min(7.5, Math.min(rawCorridorW * 0.27, Math.min(viewW, viewH) * 0.014)));
    const minPlayableCorridorW = Math.ceil(probe.r * 2 + 10);
    const corridorW = Math.max(minPlayableCorridorW, rawCorridorW);
    const halfW = corridorW / 2;

    function cellCenter(c, r) {
      return {
        x: Math.round(padX + c * stepX),
        y: Math.round(padY + r * stepY)
      };
    }

    /* Convert every verified edge into an overlapping walkable rectangle */
    corridors = edges.map((e, idx) => {
      const p1 = cellCenter(e.c1, e.r1);
      const p2 = cellCenter(e.c2, e.r2);
      const minX = Math.min(p1.x, p2.x) - halfW;
      const minY = Math.min(p1.y, p2.y) - halfW;
      const maxX = Math.max(p1.x, p2.x) + halfW;
      const maxY = Math.max(p1.y, p2.y) + halfW;
      return {
        x: Math.round(minX),
        y: Math.round(minY),
        w: Math.round(maxX - minX),
        h: Math.round(maxY - minY),
        label: idx % 3 === 0 ? `S${String(currentLevel).padStart(2, '0')}-${String(idx + 1).padStart(2, '0')}` : ''
      };
    });

    const sCenter = cellCenter(startCell.c, startCell.r);
    const eCenter = cellCenter(exitCell.c, exitCell.r);
    const nodeRadius = Math.max(10, Math.min(18, Math.floor(halfW * 0.82)));

    startPos = { x: sCenter.x, y: sCenter.y, r: nodeRadius };
    exitPos = { x: eCenter.x, y: eCenter.y, r: nodeRadius };

    waypoints = solutionPath.map((cell) => cellCenter(cell.c, cell.r));

    totalPathLen = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dx = waypoints[i + 1].x - waypoints[i].x;
      const dy = waypoints[i + 1].y - waypoints[i].y;
      waypoints[i].segLen = Math.hypot(dx, dy);
      waypoints[i].cumLen = totalPathLen;
      totalPathLen += waypoints[i].segLen;
    }

    if (!probeEngaged) {
      probe.x = startPos.x;
      probe.y = startPos.y;
    }
  }

  /* ─── Progress Calculation Along Verified BFS Solution Path (0..1) ─── */
  function calculateMazeProgress(px, py) {
    if (!waypoints.length || totalPathLen <= 0) return 0;
    let bestDistSq = Infinity;
    let bestAlong = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const vx = b.x - a.x;
      const vy = b.y - a.y;
      const lenSq = vx * vx + vy * vy;
      let t = 0;
      if (lenSq > 0) {
        t = Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / lenSq));
      }
      const projX = a.x + t * vx;
      const projY = a.y + t * vy;
      const dSq = (px - projX) * (px - projX) + (py - projY) * (py - projY);
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        bestAlong = a.cumLen + t * a.segLen;
      }
    }
    return Math.max(0, Math.min(1, bestAlong / totalPathLen));
  }

  /* ─── Collision Detection: Is Circle Completely Inside Walkable Union ─── */
  function isPointInAnyCorridor(px, py) {
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      if (px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h) {
        return true;
      }
    }
    return false;
  }

  function isProbeSafe(cx, cy, r) {
    if (!isPointInAnyCorridor(cx, cy)) return false;
    const samples = 16;
    for (let i = 0; i < samples; i++) {
      const theta = (Math.PI * 2 * i) / samples;
      const sx = cx + Math.cos(theta) * r;
      const sy = cy + Math.sin(theta) * r;
      if (!isPointInAnyCorridor(sx, sy)) {
        return false;
      }
    }
    return true;
  }

  /* ─── HUD & Progress Bar Updates ─── */
  function updateHUD() {
    const lvlStr = `${String(currentLevel).padStart(2, '0')} / ${String(MAX_LEVEL).padStart(2, '0')}`;
    if (levelEl) levelEl.textContent = lvlStr;
    if (timerEl) timerEl.textContent = `${Math.max(0, timeLeft).toFixed(1)}s`;
    if (attemptsEl) attemptsEl.textContent = String(levelAttempts).padStart(3, '0');
    if (footerProgressEl) {
      footerProgressEl.textContent = `LEVEL ${lvlStr} · ${formatAsciiProgress(currentLevel)}`;
    }
  }

  /* ─── Psychological Horror Trigger Engine ─── */
  function triggerDesktopNotification(msg) {
    if (!desktopToast || !toastBody) return;
    toastBody.textContent = msg;
    desktopToast.hidden = false;
    scheduleEvent(() => {
      desktopToast.hidden = true;
    }, 2900);
  }

  function triggerUserDetectedFlicker() {
    if (!statusBadge || !statusText || !topTitleEl) return;
    statusBadge.classList.add('mm-status-override');
    statusText.textContent = 'USER DETECTED';
    topTitleEl.innerHTML = '<b>ALERT //</b>USER DETECTED';

    scheduleEvent(() => {
      statusBadge.classList.remove('mm-status-override');
      statusText.textContent = state === 'PLAYING' ? 'STATUS: CALIBRATED' : 'STATUS: READY';
      topTitleEl.innerHTML = '<b>07 / GAME</b>MOUSE MAZE';
    }, 1250);
  }

  function triggerMiniTerminal(cmdStr) {
    if (!miniTerm || !miniTermText) return;
    miniTermText.textContent = '';
    miniTerm.hidden = false;

    let idx = 0;
    function stepChar() {
      if (!isModalOpen || miniTerm.hidden) return;
      idx++;
      miniTermText.textContent = cmdStr.slice(0, idx);
      if (idx < cmdStr.length) {
        scheduleEvent(stepChar, 55);
      } else {
        scheduleEvent(() => {
          miniTerm.hidden = true;
        }, 1650);
      }
    }
    stepChar();
  }

  function triggerCameraStatusPopup() {
    if (!camPopup) return;
    camPopup.hidden = false;
    scheduleEvent(() => {
      camPopup.hidden = true;
    }, 2600);
  }

  function triggerFakeFilePopup() {
    if (!filePopup || !fileWarnText) return;
    fileWarnText.textContent = 'Reading local descriptor...';
    filePopup.hidden = false;
    scheduleEvent(() => {
      fileWarnText.textContent = '"You shouldn\'t have opened this."';
    }, 650);
    scheduleEvent(() => {
      filePopup.hidden = true;
    }, 3100);
  }

  function triggerWhisper(text, duration = 1800) {
    if (!whisperMsg) return;
    whisperMsg.textContent = text;
    whisperMsg.hidden = false;
    scheduleEvent(() => {
      whisperMsg.hidden = true;
    }, duration);
  }

  function evaluatePsychologicalEvents(dt) {
    if (state !== 'PLAYING') return;

    sessionPlayTime += dt;
    currentProgress = calculateMazeProgress(probe.x, probe.y);

    /* Overall progression metric across levels (Level 1 starts completely normal) */
    const overallProgress = ((currentLevel - 1) + currentProgress) / MAX_LEVEL;

    /* 4. Mouse Observation: Idle Check ("Why did you stop moving?") once anomalies begin */
    if (probeEngaged && (currentLevel >= 2 || sessionPlayTime >= 14)) {
      idleTime += dt;
      if (idleTime >= 2.4) {
        if (idleMsg && idleMsg.hidden) {
          idleMsg.hidden = false;
        }
      } else if (idleMsg && !idleMsg.hidden) {
        idleMsg.hidden = true;
      }
    } else if (idleMsg && !idleMsg.hidden) {
      idleMsg.hidden = true;
    }

    /* 1. Fake Desktop Notification ("You're still there?") */
    if (!triggeredEvents.toast1 && (currentLevel >= 2 || sessionPlayTime >= 11.0)) {
      triggeredEvents.toast1 = true;
      triggerDesktopNotification("You're still there?");
    }

    /* 2. Unexpected UI Message ("USER DETECTED") */
    if (!triggeredEvents.userDetected && ((currentLevel >= 2 && currentProgress >= 0.45) || sessionPlayTime >= 19.0)) {
      triggeredEvents.userDetected = true;
      triggerUserDetectedFlicker();
    }

    /* 3. Fake Terminal ("> who_are_you?") */
    if (!triggeredEvents.miniTerm && (currentLevel >= 3 || sessionPlayTime >= 27.0)) {
      triggeredEvents.miniTerm = true;
      triggerMiniTerminal('> who_are_you?');
    }

    /* 5. Desktop-like Camera Popup ("CAMERA STATUS / ACTIVE") */
    if (!triggeredEvents.camStatus && (currentLevel >= 4 || sessionPlayTime >= 36.0)) {
      triggeredEvents.camStatus = true;
      triggerCameraStatusPopup();
    }

    /* 6. Fake File ("/Users/Desktop/MOUSE_MAZE.txt" -> "You shouldn't have opened this.") */
    if (!triggeredEvents.fakeFile && (currentLevel >= 5 || sessionPlayTime >= 45.0)) {
      triggeredEvents.fakeFile = true;
      triggerFakeFilePopup();
    }

    /* 7. Escalation messages on deeper levels or as player nears EXIT */
    if (!triggeredEvents.whisper1 && ((currentLevel >= 3 && currentProgress >= 0.65) || overallProgress >= 0.32)) {
      triggeredEvents.whisper1 = true;
      triggerWhisper('"I can see your cursor."', 1900);
      ghostCursor.alpha = 0.55;
    }
    if (!triggeredEvents.whisper2 && ((currentLevel >= 5 && currentProgress >= 0.65) || overallProgress >= 0.52)) {
      triggeredEvents.whisper2 = true;
      triggerWhisper('"Almost there."', 1700);
    }
    if (!triggeredEvents.whisper3 && ((currentLevel >= 7 && currentProgress >= 0.60) || overallProgress >= 0.70)) {
      triggeredEvents.whisper3 = true;
      triggerWhisper('"Don\'t look away."', 1800);
      ghostCursor.alpha = 0.75;
    }
    if (!triggeredEvents.whisper4 && ((currentLevel >= 9 && currentProgress >= 0.55) || overallProgress >= 0.86)) {
      triggeredEvents.whisper4 = true;
      triggerWhisper('"You\'re not supposed to be here."', 1900);
    }

    /* Smoothly trail the subtle shadow cursor behind the player on deeper levels */
    if (currentLevel >= 3) {
      ghostCursor.x += (probe.x - 16 - ghostCursor.x) * Math.min(1, dt * 4.5);
      ghostCursor.y += (probe.y + 12 - ghostCursor.y) * Math.min(1, dt * 4.5);
      if (currentProgress > 0.6) {
        ghostCursor.alpha = Math.min(0.65, ghostCursor.alpha + dt * 0.25);
      } else if (ghostCursor.alpha > 0) {
        ghostCursor.alpha = Math.max(0, ghostCursor.alpha - dt * 0.2);
      }
    }
  }

  /* ─── Level Complete vs Final Level Complete ─── */
  function handleReachExit() {
    if (state !== 'PLAYING') return;
    probeEngaged = false;
    clearAllScheduledEvents();

    const levelElapsed = Math.max(0.1, levelDuration - timeLeft);
    totalTimeCompleted += levelElapsed;

    if (currentLevel < MAX_LEVEL) {
      /* Standard Level Complete (Levels 1 - 9): Continue to Next Level */
      state = 'LEVEL_WIN';
      const lvlStr = `LEVEL ${String(currentLevel).padStart(2, '0')} / ${String(MAX_LEVEL).padStart(2, '0')}`;

      if (statusBadge && statusText) {
        statusBadge.removeAttribute('data-state');
        statusText.textContent = `SECTOR ${String(currentLevel).padStart(2, '0')} COMPLETE`;
      }

      if (winEyebrow) winEyebrow.textContent = `SECTOR ${String(currentLevel).padStart(2, '0')} CLEARED`;
      if (winTitle) winTitle.textContent = 'LEVEL COMPLETE';
      if (winProgressLabel) winProgressLabel.textContent = lvlStr;
      if (winProgressAscii) winProgressAscii.textContent = formatAsciiProgress(currentLevel);

      if (winTimeLabel) winTimeLabel.textContent = 'TIME:';
      if (winTimeEl) winTimeEl.textContent = `${levelElapsed.toFixed(1)}s`;
      if (winAttemptsLabel) winAttemptsLabel.textContent = 'ATTEMPTS:';
      if (winAttemptsEl) winAttemptsEl.textContent = String(levelAttempts).padStart(3, '0');

      if (playAgainBtn) playAgainBtn.textContent = '[ NEXT LEVEL ]';
      if (winScreen) winScreen.hidden = false;
      if (playAgainBtn) playAgainBtn.focus();
    } else {
      /* Final Level (Level 10 / 10): Trigger Psychological Finale Sequence -> ALL LEVELS COMPLETE */
      triggerFinalCompletionSequence();
    }
  }

  function showAllLevelsCompleteScreen() {
    glitchCanvasMode = false;
    if (finaleScreen) {
      finaleScreen.hidden = true;
      finaleScreen.classList.remove('mm-glitch-active');
    }
    if (jumpscareOverlay) {
      jumpscareOverlay.hidden = true;
      jumpscareOverlay.classList.remove('mm-jumpscare-active');
    }
    if (jumpscareImg) {
      jumpscareImg.removeAttribute('src');
    }
    if (statusBadge && statusText) {
      statusBadge.classList.remove('mm-status-override');
      statusText.textContent = 'ALL SECTORS CLEARED';
    }

    state = 'ALL_COMPLETE';
    if (winEyebrow) winEyebrow.textContent = 'CALIBRATION SEQUENCE 10 / 10';
    if (winTitle) winTitle.textContent = 'ALL LEVELS COMPLETE';
    if (winProgressLabel) winProgressLabel.textContent = 'LEVEL 10 / 10';
    if (winProgressAscii) winProgressAscii.textContent = formatAsciiProgress(MAX_LEVEL);

    if (winTimeLabel) winTimeLabel.textContent = 'TOTAL TIME:';
    if (winTimeEl) winTimeEl.textContent = `${totalTimeCompleted.toFixed(1)}s`;
    if (winAttemptsLabel) winAttemptsLabel.textContent = 'TOTAL ATTEMPTS:';
    if (winAttemptsEl) winAttemptsEl.textContent = String(totalAttempts).padStart(3, '0');

    if (playAgainBtn) playAgainBtn.textContent = '[ PLAY AGAIN ]';
    if (winScreen) winScreen.hidden = false;
    if (playAgainBtn) playAgainBtn.focus();
  }

  function triggerFinalCompletionSequence() {
    /* 1. Freeze the maze immediately */
    state = 'FINALE';
    probeEngaged = false;

    /* Guard so the jumpscare only triggers ONCE per completed game session */
    if (jumpscareTriggeredThisSession) {
      showAllLevelsCompleteScreen();
      return;
    }
    jumpscareTriggeredThisSession = true;

    /* 2. Briefly display: EXIT REACHED */
    if (finaleScreen && finaleText) {
      finaleScreen.classList.remove('mm-glitch-active');
      finaleText.textContent = 'EXIT REACHED';
      finaleScreen.hidden = false;
    }

    /* 3. Wait ~400ms (within 300-500ms), then flash the provided image over the entire game viewport */
    scheduleEvent(() => {
      if (finaleScreen) finaleScreen.hidden = true;

      if (jumpscareImg) {
        jumpscareImg.src = JUMPSCARE_ASSET_SRC;
      }
      if (jumpscareOverlay) {
        jumpscareOverlay.hidden = false;
        jumpscareOverlay.classList.add('mm-jumpscare-active');
      }

      /* 6. Short screen shake / flash + scare sound */
      shakeTime = 1.25;
      if (statusBadge && statusText) {
        statusBadge.classList.add('mm-status-override');
        statusText.textContent = 'CRITICAL ANOMALY';
      }
      playScareSound();

      /* 5 & 8. Keep image visible for ~1.25s (within 1-1.5s), then immediately transition to ALL LEVELS COMPLETE */
      scheduleEvent(() => {
        showAllLevelsCompleteScreen();
      }, 1250);
    }, 400);
  }

  /* ─── Advance to Next Level with Transition Banner ─── */
  function advanceToNextLevel() {
    unlockAudioContext();
    preloadFinalAssetSilently();
    clearAllScheduledEvents();
    winScreen.hidden = true;

    currentLevel = Math.min(MAX_LEVEL, currentLevel + 1);
    const cfg = getLevelConfig(currentLevel);
    levelDuration = cfg.timer;
    timeLeft = cfg.timer;
    levelAttempts = 1;
    totalAttempts += 1;
    probeEngaged = false;
    idleTime = 0;
    currentProgress = 0;
    particles = [];

    /* Generate & verify the new level's maze topology */
    activeMazeTopology = generateVerifiedLevelMaze(currentLevel);
    computeMazeGeometry();
    probe.x = startPos.x;
    probe.y = startPos.y;
    updateHUD();

    /* Show brief "LEVEL XX" transition overlay */
    state = 'TRANSITION';
    const lvlNumStr = String(currentLevel).padStart(2, '0');
    if (transEyebrow) transEyebrow.textContent = 'LOADING NEXT SECTOR';
    if (transTitle) transTitle.textContent = `LEVEL ${lvlNumStr}`;
    if (transProgressLabel) transProgressLabel.textContent = `LEVEL ${lvlNumStr} / ${String(MAX_LEVEL).padStart(2, '0')}`;
    if (transProgressAscii) transProgressAscii.textContent = formatAsciiProgress(currentLevel);
    if (transSub) transSub.textContent = cfg.subtitle;
    if (levelTransScreen) levelTransScreen.hidden = false;

    if (statusBadge && statusText) {
      statusBadge.removeAttribute('data-state');
      statusText.textContent = `LOADING LEVEL ${lvlNumStr}`;
    }

    scheduleEvent(() => {
      if (levelTransScreen) levelTransScreen.hidden = true;
      state = 'PLAYING';
      if (statusText) statusText.textContent = 'STATUS: CALIBRATED';
      updateHUD();
    }, 1150);
  }

  /* ─── Timeout on Current Level ─── */
  function triggerTimeoutState() {
    state = 'TIMEOUT';
    probeEngaged = false;
    clearAllScheduledEvents();

    const lvlStr = `LEVEL ${String(currentLevel).padStart(2, '0')} / ${String(MAX_LEVEL).padStart(2, '0')}`;
    if (statusBadge && statusText) {
      statusBadge.setAttribute('data-state', 'crashed');
      statusText.textContent = 'STATUS: TIMEOUT';
    }
    if (winEyebrow) winEyebrow.textContent = `SECTOR ${String(currentLevel).padStart(2, '0')} TIMEOUT`;
    if (winTitle) winTitle.textContent = 'TIME EXPIRED';
    if (winProgressLabel) winProgressLabel.textContent = lvlStr;
    if (winProgressAscii) winProgressAscii.textContent = formatAsciiProgress(currentLevel);

    if (winTimeLabel) winTimeLabel.textContent = 'LIMIT:';
    if (winTimeEl) winTimeEl.textContent = `${levelDuration.toFixed(1)}s`;
    if (winAttemptsLabel) winAttemptsLabel.textContent = 'ATTEMPTS:';
    if (winAttemptsEl) winAttemptsEl.textContent = String(levelAttempts).padStart(3, '0');

    if (playAgainBtn) playAgainBtn.textContent = '[ RETRY LEVEL ]';
    if (winScreen) winScreen.hidden = false;
    if (playAgainBtn) playAgainBtn.focus();
  }

  function retryCurrentLevel() {
    unlockAudioContext();
    clearAllScheduledEvents();
    winScreen.hidden = true;

    const cfg = getLevelConfig(currentLevel);
    levelDuration = cfg.timer;
    timeLeft = cfg.timer;
    levelAttempts += 1;
    totalAttempts += 1;
    probeEngaged = false;
    idleTime = 0;
    currentProgress = 0;
    particles = [];

    activeMazeTopology = generateVerifiedLevelMaze(currentLevel);
    computeMazeGeometry();
    probe.x = startPos.x;
    probe.y = startPos.y;

    state = 'PLAYING';
    if (statusBadge) statusBadge.removeAttribute('data-state');
    if (statusText) statusText.textContent = 'STATUS: CALIBRATED';
    updateHUD();
  }

  /* ─── Wall Contact Reset ─── */
  function handleWallCollision(hitX, hitY) {
    probeEngaged = false;
    levelAttempts += 1;
    totalAttempts += 1;
    shakeTime = 0.2;
    idleTime = 0;

    for (let i = 0; i < 14; i++) {
      const ang = (Math.PI * 2 * i) / 14 + (Math.random() * 0.3 - 0.15);
      const spd = 45 + Math.random() * 110;
      particles.push({
        x: hitX,
        y: hitY,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 2.5 + Math.random() * 2,
        life: 1,
        decay: 2.4 + Math.random(),
        color: i % 2 === 0 ? COLORS.danger : COLORS.amber
      });
    }

    probe.x = startPos.x;
    probe.y = startPos.y;
    updateHUD();
  }

  /* ─── Sub-Stepped Probe Movement Toward Pointer ─── */
  function moveProbeToward(targetX, targetY) {
    if (state !== 'PLAYING') return;

    /* Engage probe when user brings cursor onto START node */
    if (!probeEngaged) {
      const distToStart = Math.hypot(targetX - startPos.x, targetY - startPos.y);
      if (distToStart <= startPos.r + 10) {
        probeEngaged = true;
        idleTime = 0;
      } else {
        return;
      }
    }

    const dx = targetX - probe.x;
    const dy = targetY - probe.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.5) return;

    idleTime = 0;

    const stepSize = 2.0;
    const steps = Math.max(1, Math.ceil(dist / stepSize));
    const sx = dx / steps;
    const sy = dy / steps;

    for (let s = 1; s <= steps; s++) {
      const nx = probe.x + sx;
      const ny = probe.y + sy;

      if (!isProbeSafe(nx, ny, probe.r)) {
        handleWallCollision(nx, ny);
        return;
      }

      probe.x = nx;
      probe.y = ny;

      /* Check if probe reached EXIT terminal */
      const distToExit = Math.hypot(probe.x - exitPos.x, probe.y - exitPos.y);
      if (distToExit <= exitPos.r - 1) {
        handleReachExit();
        return;
      }
    }
  }

  /* ─── Reset & Start New 10-Level Session ─── */
  function resetToReadyState() {
    clearAllScheduledEvents();
    state = 'READY';
    currentLevel = 1;
    const cfg = getLevelConfig(1);
    levelDuration = cfg.timer;
    timeLeft = cfg.timer;
    levelAttempts = 1;
    totalAttempts = 1;
    totalTimeCompleted = 0;
    sessionPlayTime = 0;
    idleTime = 0;
    currentProgress = 0;
    probeEngaged = false;
    jumpscareTriggeredThisSession = false;
    particles = [];

    activeMazeTopology = generateVerifiedLevelMaze(1);
    computeMazeGeometry();
    probe.x = startPos.x;
    probe.y = startPos.y;

    if (statusBadge) statusBadge.removeAttribute('data-state');
    if (statusText) statusText.textContent = 'STATUS: READY';

    startScreen.hidden = false;
    winScreen.hidden = true;
    if (levelTransScreen) levelTransScreen.hidden = true;
    updateHUD();
  }

  function startNewSession() {
    unlockAudioContext();
    preloadFinalAssetSilently();
    clearAllScheduledEvents();
    currentLevel = 1;
    const cfg = getLevelConfig(1);
    levelDuration = cfg.timer;
    timeLeft = cfg.timer;
    levelAttempts = 1;
    totalAttempts = 1;
    totalTimeCompleted = 0;
    sessionPlayTime = 0;
    idleTime = 0;
    currentProgress = 0;
    probeEngaged = false;
    jumpscareTriggeredThisSession = false;
    particles = [];
    ghostCursor.alpha = 0;

    triggeredEvents = {
      toast1: false,
      userDetected: false,
      miniTerm: false,
      camStatus: false,
      fakeFile: false,
      whisper1: false,
      whisper2: false,
      whisper3: false,
      whisper4: false
    };

    activeMazeTopology = generateVerifiedLevelMaze(1);
    computeMazeGeometry();
    probe.x = startPos.x;
    probe.y = startPos.y;

    state = 'PLAYING';
    if (statusBadge) statusBadge.removeAttribute('data-state');
    if (statusText) statusText.textContent = 'STATUS: CALIBRATED';

    startScreen.hidden = true;
    winScreen.hidden = true;
    if (levelTransScreen) levelTransScreen.hidden = true;
    updateHUD();
  }

  function handlePrimaryActionBtn() {
    if (state === 'LEVEL_WIN') {
      advanceToNextLevel();
    } else if (state === 'TIMEOUT') {
      retryCurrentLevel();
    } else {
      startNewSession();
    }
  }

  /* ─── Update & Render Loop ─── */
  function update(dt) {
    pulseClock += dt;

    if (shakeTime > 0) {
      shakeTime = Math.max(0, shakeTime - dt);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    if (state === 'PLAYING') {
      timeLeft = Math.max(0, timeLeft - dt);
      updateHUD();
      if (timeLeft <= 0) {
        triggerTimeoutState();
        return;
      }
      evaluatePsychologicalEvents(dt);
    }
  }

  function render() {
    ctx.save();

    if (shakeTime > 0) {
      const mag = (shakeTime / 0.2) * 5;
      ctx.translate((Math.random() * 2 - 1) * mag, (Math.random() * 2 - 1) * mag);
    }

    /* 1. Outer Wall / Chassis Background */
    ctx.fillStyle = COLORS.wallFill;
    ctx.fillRect(0, 0, viewW, viewH);

    /* Subtle technical diagonal hatch on non-walkable wall areas */
    ctx.strokeStyle = 'rgba(44, 48, 40, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -viewH; x < viewW + viewH; x += 26) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + viewH, viewH);
    }
    ctx.stroke();

    /* 2. Walkable Maze Corridors */
    /* Draw outer border first, then fill interior so overlapping corners have zero seams */
    ctx.fillStyle = COLORS.wallStroke;
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      ctx.fillRect(c.x - 2, c.y - 2, c.w + 4, c.h + 4);
    }

    ctx.fillStyle = COLORS.corridorFill;
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      ctx.fillRect(c.x, c.y, c.w, c.h);
    }

    /* Subtle telemetry labels inside selected corridor nodes */
    ctx.fillStyle = 'rgba(160, 165, 152, 0.22)';
    ctx.font = '500 8.5px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (let i = 0; i < corridors.length; i++) {
      const c = corridors[i];
      if (c.label && c.w > 46 && c.h > 22) {
        ctx.fillText(c.label, c.x + 5, c.y + 4);
      }
    }

    /* 3. Start Node [START] */
    const startPulse = 0.5 + 0.5 * Math.sin(pulseClock * 5);
    ctx.save();
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, startPos.r + (probeEngaged ? 0 : startPulse * 3.5), 0, Math.PI * 2);
    ctx.fillStyle = probeEngaged ? 'rgba(213, 251, 120, 0.12)' : 'rgba(213, 251, 120, 0.24)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = COLORS.lime;
    ctx.stroke();

    ctx.fillStyle = COLORS.lime;
    ctx.font = '600 8.5px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', startPos.x, startPos.y);
    ctx.restore();

    /* 4. Exit Node [EXIT] */
    ctx.save();
    ctx.beginPath();
    ctx.arc(exitPos.x, exitPos.y, exitPos.r + startPulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(213, 251, 120, 0.18)';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = COLORS.lime;
    ctx.stroke();

    ctx.fillStyle = COLORS.lime;
    ctx.font = '600 8.5px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', exitPos.x, exitPos.y);
    ctx.restore();

    /* 5. If not yet engaged, show tether prompt near START node */
    if (state === 'PLAYING' && !probeEngaged) {
      ctx.save();
      ctx.fillStyle = COLORS.lime;
      ctx.font = '500 10.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      const promptX = Math.min(viewW - 230, startPos.x + startPos.r + 10);
      const promptY = Math.max(20, startPos.y);
      ctx.fillText(`◀ HOVER [START] · LVL ${String(currentLevel).padStart(2, '0')}`, promptX, promptY);
      ctx.restore();
    }

    /* 6. Subtle Shadow/Ghost Cursor during deeper levels */
    if (ghostCursor.alpha > 0.02 && state === 'PLAYING') {
      ctx.save();
      ctx.globalAlpha = ghostCursor.alpha;
      ctx.strokeStyle = COLORS.danger;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ghostCursor.x, ghostCursor.y, probe.r + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    /* 7. Player Probe */
    ctx.save();
    ctx.beginPath();
    ctx.arc(probe.x, probe.y, probe.r, 0, Math.PI * 2);
    ctx.fillStyle = probeEngaged ? COLORS.lime : '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#111310';
    ctx.stroke();
    ctx.restore();

    /* 8. Collision Sparks */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    /* 9. Disturbing Procedural Glitch Wireframe Eye during Finale "I FOUND YOU." */
    if (glitchCanvasMode) {
      drawGlitchObserverEffect();
    }

    ctx.restore();
  }

  function drawGlitchObserverEffect() {
    ctx.save();
    const cx = viewW / 2;
    const cy = viewH / 2;

    for (let i = 0; i < 9; i++) {
      const by = Math.random() * viewH;
      const bh = 3 + Math.random() * 14;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 107, 107, 0.16)' : 'rgba(213, 251, 120, 0.12)';
      ctx.fillRect(0, by, viewW, bh);
    }

    const rx = Math.min(viewW, viewH) * 0.26;
    const ry = rx * 0.48;
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - rx, cy);
    ctx.quadraticCurveTo(cx, cy - ry * 1.4, cx + rx, cy);
    ctx.quadraticCurveTo(cx, cy + ry * 1.4, cx - rx, cy);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = COLORS.lime;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx + (Math.random() * 6 - 3), cy + (Math.random() * 6 - 3), ry * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = COLORS.danger;
    ctx.beginPath();
    ctx.arc(cx, cy, ry * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /* ─── Main Game Loop (requestAnimationFrame) ─── */
  function loop(timestamp) {
    if (!isModalOpen) return;
    if (!lastTime) lastTime = timestamp;
    const rawDt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    const dt = Math.min(0.05, Math.max(0.001, rawDt));
    update(dt);
    render();

    rafId = requestAnimationFrame(loop);
  }

  /* ─── Pointer / Touch / Keyboard Handlers ─── */
  function getCanvasLocalCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handlePointerMove(e) {
    if (!isModalOpen || state !== 'PLAYING') return;
    const pt = getCanvasLocalCoords(e.clientX, e.clientY);
    pointer.x = pt.x;
    pointer.y = pt.y;
    moveProbeToward(pt.x, pt.y);
  }

  function handlePointerDown(e) {
    if (!isModalOpen || state !== 'PLAYING') return;
    const pt = getCanvasLocalCoords(e.clientX, e.clientY);
    pointer.x = pt.x;
    pointer.y = pt.y;
    moveProbeToward(pt.x, pt.y);
  }

  function handleTouchMove(e) {
    if (!isModalOpen) return;
    if (e.cancelable) e.preventDefault();
    if (state !== 'PLAYING' || !e.touches || !e.touches.length) return;
    const pt = getCanvasLocalCoords(e.touches[0].clientX, e.touches[0].clientY);
    moveProbeToward(pt.x, pt.y);
  }

  function handleKeyDown(e) {
    if (!isModalOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeGameModal();
    }
  }

  function handleWindowResize() {
    if (!isModalOpen) return;
    computeMazeGeometry();
    render();
  }

  function mountRuntimeListeners() {
    if (listenersMounted) return;
    listenersMounted = true;
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('resize', handleWindowResize, { passive: true });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
  }

  function unmountRuntimeListeners() {
    if (!listenersMounted) return;
    listenersMounted = false;
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', handleWindowResize);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('touchmove', handleTouchMove);
    overlay.removeEventListener('touchmove', handleTouchMove);
  }

  /* ─── Modal Open / Close Lifecycle ─── */
  function openGameModal() {
    if (isModalOpen) return;
    isModalOpen = true;

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    resetToReadyState();
    mountRuntimeListeners();

    requestAnimationFrame(() => {
      overlay.classList.add('open');
      computeMazeGeometry();
      render();
      if (startBtn) startBtn.focus();
    });

    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function closeGameModal() {
    if (!isModalOpen) return;
    isModalOpen = false;

    clearAllScheduledEvents();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    unmountRuntimeListeners();

    overlay.classList.remove('open');
    document.body.style.overflow = '';

    setTimeout(() => {
      if (!isModalOpen) {
        overlay.hidden = true;
        openBtn.focus();
      }
    }, 280);
  }

  /* ─── Static Button Bindings ─── */
  openBtn.addEventListener('click', openGameModal);
  if (startBtn) startBtn.addEventListener('click', startNewSession);
  if (playAgainBtn) playAgainBtn.addEventListener('click', handlePrimaryActionBtn);
  if (startExitBtn) startExitBtn.addEventListener('click', closeGameModal);
  if (winExitBtn) winExitBtn.addEventListener('click', closeGameModal);
  if (exitTopBtn) exitTopBtn.addEventListener('click', closeGameModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGameModal();
  });
})();
