/* ═══════════════════════════════════════════════════════════════════
   LAB 06 // SNAKE.EXE — ISOLATED TERMINAL GAME MODULE
   HTML5 Canvas · requestAnimationFrame · Grid Logic · Persistent High Score
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const STORAGE_KEY = 'cyper_lab_snake_exe_best';

  const openBtn = document.getElementById('open-snake-btn');
  const overlay = document.getElementById('sn-overlay');
  if (!openBtn || !overlay) return;

  const canvas = document.getElementById('sn-canvas');
  const stage = document.getElementById('sn-stage');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!canvas || !ctx || !stage) return;

  /* ─── UI Elements ─── */
  const statusBadge = document.getElementById('sn-status-badge');
  const statusText = document.getElementById('sn-status-text');
  const topScoreEl = document.getElementById('sn-top-score');
  const topBestEl = document.getElementById('sn-top-best');
  const sysNoticeEl = document.getElementById('sn-sys-notice');

  const startScreen = document.getElementById('sn-start-screen');
  const startBtn = document.getElementById('sn-start-btn');
  const startExitBtn = document.getElementById('sn-start-exit-btn');

  const gameOverScreen = document.getElementById('sn-gameover-screen');
  const finalScoreEl = document.getElementById('sn-final-score');
  const finalBestEl = document.getElementById('sn-final-best');
  const newRecordBadge = document.getElementById('sn-new-record');
  const restartBtn = document.getElementById('sn-restart-btn');
  const exitBtn = document.getElementById('sn-exit-btn');
  const exitTopBtn = document.getElementById('sn-exit-top-btn');

  /* Mobile D-Pad Buttons */
  const dpadUp = document.getElementById('sn-dpad-up');
  const dpadDown = document.getElementById('sn-dpad-down');
  const dpadLeft = document.getElementById('sn-dpad-left');
  const dpadRight = document.getElementById('sn-dpad-right');

  /* ─── Theme Palette ─── */
  const COLORS = {
    bg: '#111310',
    arenaBg: '#131612',
    panel: '#191c17',
    line: '#2c3028',
    lineBright: '#3d4a30',
    grid: 'rgba(44, 48, 40, 0.42)',
    text: '#f0f1e9',
    muted: '#a0a598',
    lime: '#d5fb78',
    bodyFill: '#222b1b',
    bodyStroke: '#78b833',
    amber: '#e2b86b',
    danger: '#ff6b6b'
  };

  /* ─── Speed & Grid Constants ─── */
  const BASE_STEP_MS = 122; // Initial ms per grid cell step
  const MIN_STEP_MS = 54;   // Fastest cap
  const STEP_DECAY_MS = 1.35;
  const NOTICE_THRESHOLD = 50; // Easter egg trigger score

  /* ─── Runtime State ─── */
  let isModalOpen = false;
  let listenersMounted = false;
  let rafId = null;
  let lastTime = 0;
  let accumulator = 0;
  let pulseClock = 0;
  let gameOverTimestamp = 0;

  let viewW = 800;
  let viewH = 520;
  let dpr = 1;

  let cellSize = 22;
  let cols = 28;
  let rows = 18;
  let boardX = 20;
  let boardY = 20;
  let boardW = 616;
  let boardH = 396;

  let state = 'READY'; // 'READY' | 'RUNNING' | 'TERMINATED'
  let score = 0;
  let bestScore = loadBestScore();
  let isNewBest = false;

  let snake = [];
  let dir = { x: 1, y: 0 };
  let dirQueue = [];
  let food = { x: 10, y: 8, id: 1 };
  let particles = [];
  let shakeTimer = 0;

  /* ─── Helpers ─── */
  function pad3(n) {
    return String(Math.max(0, Math.floor(n))).padStart(3, '0');
  }

  function loadBestScore() {
    try {
      const saved = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      return Number.isFinite(saved) && saved > 0 ? saved : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBestScore(val) {
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch (e) {}
  }

  function currentStepInterval() {
    return Math.max(MIN_STEP_MS, BASE_STEP_MS - score * STEP_DECAY_MS);
  }

  function updateHUD() {
    const sStr = pad3(score);
    const bStr = pad3(bestScore);
    if (topScoreEl) topScoreEl.textContent = sStr;
    if (topBestEl) topBestEl.textContent = bStr;

    if (statusBadge && statusText) {
      if (state === 'READY') {
        statusBadge.removeAttribute('data-state');
        statusText.textContent = 'STATUS: READY';
      } else if (state === 'RUNNING') {
        statusBadge.removeAttribute('data-state');
        statusText.textContent = 'STATUS: RUNNING';
      } else {
        statusBadge.setAttribute('data-state', 'crashed');
        statusText.textContent = 'STATUS: TERMINATED';
      }
    }

    /* Easter Egg: SYSTEM NOTICE when score >= 50 */
    if (sysNoticeEl) {
      sysNoticeEl.hidden = score < NOTICE_THRESHOLD;
    }
  }

  /* ─── Arena Layout & Responsive Resizing ─── */
  function computeBoardDimensions() {
    if (!stage || !canvas) return;
    const rect = stage.getBoundingClientRect();
    viewW = Math.max(280, Math.floor(rect.width));
    viewH = Math.max(280, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padX = viewW < 600 ? 14 : 28;
    const padTop = viewW < 600 ? 14 : 24;
    const padBottom = viewW < 600 ? 28 : 34;

    const availW = Math.max(220, viewW - padX * 2);
    const availH = Math.max(200, viewH - padTop - padBottom);

    cellSize = viewW < 520 ? 18 : viewW < 780 ? 20 : 22;
    const newCols = Math.max(12, Math.min(38, Math.floor(availW / cellSize)));
    const newRows = Math.max(10, Math.min(26, Math.floor(availH / cellSize)));

    cols = newCols;
    rows = newRows;
    boardW = cols * cellSize;
    boardH = rows * cellSize;
    boardX = Math.floor((viewW - boardW) / 2);
    boardY = Math.floor(padTop + (availH - boardH) / 2);

    /* Clamp existing entities if resized while active */
    if (snake.length > 0) {
      for (let i = 0; i < snake.length; i++) {
        snake[i].x = Math.max(0, Math.min(cols - 1, snake[i].x));
        snake[i].y = Math.max(0, Math.min(rows - 1, snake[i].y));
      }
    }
    if (food) {
      if (food.x >= cols || food.y >= rows) {
        spawnFood();
      }
    }
  }

  /* ─── Initialize / Reset Game State ─── */
  function initSnakeEntities() {
    const startX = Math.max(4, Math.floor(cols * 0.35));
    const startY = Math.floor(rows / 2);

    snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
      { x: startX - 3, y: startY }
    ];
    dir = { x: 1, y: 0 };
    dirQueue = [];
    particles = [];
    spawnFood();
  }

  function spawnFood() {
    const freeCells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let occupied = false;
        for (let i = 0; i < snake.length; i++) {
          if (snake[i].x === x && snake[i].y === y) {
            occupied = true;
            break;
          }
        }
        if (!occupied) {
          freeCells.push({ x, y });
        }
      }
    }

    if (freeCells.length > 0) {
      const choice = freeCells[Math.floor(Math.random() * freeCells.length)];
      food = {
        x: choice.x,
        y: choice.y,
        id: (food ? food.id + 1 : 1)
      };
    }
  }

  function resetToReadyState() {
    state = 'READY';
    score = 0;
    isNewBest = false;
    accumulator = 0;
    shakeTimer = 0;

    computeBoardDimensions();
    initSnakeEntities();
    updateHUD();

    startScreen.hidden = false;
    gameOverScreen.hidden = true;
  }

  function startGameplay() {
    state = 'RUNNING';
    score = 0;
    isNewBest = false;
    accumulator = 0;
    shakeTimer = 0;

    computeBoardDimensions();
    initSnakeEntities();
    updateHUD();

    startScreen.hidden = true;
    gameOverScreen.hidden = true;
    lastTime = performance.now();
  }

  function triggerGameOver() {
    if (state === 'TERMINATED') return;
    state = 'TERMINATED';
    gameOverTimestamp = performance.now();
    shakeTimer = 0.22;

    if (score > bestScore) {
      bestScore = score;
      isNewBest = true;
      saveBestScore(bestScore);
    }

    /* Emit crash sparks at snake head */
    if (snake.length > 0) {
      const head = snake[0];
      const cx = boardX + (head.x + 0.5) * cellSize;
      const cy = boardY + (head.y + 0.5) * cellSize;
      spawnBurstParticles(cx, cy, COLORS.danger, 14);
    }

    updateHUD();

    if (finalScoreEl) finalScoreEl.textContent = pad3(score);
    if (finalBestEl) finalBestEl.textContent = pad3(bestScore);
    if (newRecordBadge) newRecordBadge.hidden = !isNewBest;

    gameOverScreen.hidden = false;
    setTimeout(() => {
      if (state === 'TERMINATED' && restartBtn) {
        restartBtn.focus();
      }
    }, 80);
  }

  /* ─── Direction Input Queue (Prevents 180-Degree Reversal) ─── */
  function queueDirection(nx, ny) {
    if (state === 'READY') {
      startGameplay();
    }
    if (state !== 'RUNNING') return;

    const referenceDir = dirQueue.length > 0 ? dirQueue[dirQueue.length - 1] : dir;

    /* Ignore same direction or immediate 180-degree opposite reversal */
    if (nx === referenceDir.x && ny === referenceDir.y) return;
    if (nx === -referenceDir.x && ny === -referenceDir.y) return;

    if (dirQueue.length < 2) {
      dirQueue.push({ x: nx, y: ny });
    }
  }

  /* ─── Discrete Grid Step ─── */
  function stepSnake() {
    if (state !== 'RUNNING') return;

    if (dirQueue.length > 0) {
      const nextDir = dirQueue.shift();
      if (!(nextDir.x === -dir.x && nextDir.y === -dir.y)) {
        dir = nextDir;
      }
    }

    const head = snake[0];
    const nextX = head.x + dir.x;
    const nextY = head.y + dir.y;

    /* 1. Wall Collision Check */
    if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) {
      triggerGameOver();
      return;
    }

    /* 2. Self Collision Check (excluding tail tip if it will move forward) */
    const willEat = (nextX === food.x && nextY === food.y);
    const checkLen = willEat ? snake.length : snake.length - 1;
    for (let i = 0; i < checkLen; i++) {
      if (snake[i].x === nextX && snake[i].y === nextY) {
        triggerGameOver();
        return;
      }
    }

    /* 3. Advance Snake Head */
    snake.unshift({ x: nextX, y: nextY });

    if (willEat) {
      score += 1;
      if (score > bestScore) {
        bestScore = score;
        isNewBest = true;
        saveBestScore(bestScore);
      }

      const fx = boardX + (food.x + 0.5) * cellSize;
      const fy = boardY + (food.y + 0.5) * cellSize;
      spawnBurstParticles(fx, fy, COLORS.lime, 10);

      spawnFood();
      updateHUD();
    } else {
      snake.pop();
    }
  }

  function spawnBurstParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.3 - 0.15);
      const speed = 45 + Math.random() * 95;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 2,
        life: 1,
        decay: 2.2 + Math.random() * 1.2,
        color
      });
    }
  }

  /* ─── Frame Update & Render ─── */
  function update(dt) {
    pulseClock += dt;

    if (shakeTimer > 0) {
      shakeTimer = Math.max(0, shakeTimer - dt);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    if (state === 'RUNNING') {
      accumulator += dt * 1000;
      const stepMs = currentStepInterval();
      while (accumulator >= stepMs && state === 'RUNNING') {
        accumulator -= stepMs;
        stepSnake();
      }
    }
  }

  function render() {
    ctx.save();

    if (shakeTimer > 0) {
      const mag = (shakeTimer / 0.22) * 5;
      ctx.translate((Math.random() * 2 - 1) * mag, (Math.random() * 2 - 1) * mag);
    }

    /* 1. Outer Canvas Background */
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, viewW, viewH);

    /* 2. Playable Terminal Grid Arena */
    ctx.fillStyle = COLORS.arenaBg;
    ctx.fillRect(boardX, boardY, boardW, boardH);

    /* Subtle Grid Lines */
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < cols; c++) {
      const gx = Math.floor(boardX + c * cellSize) + 0.5;
      ctx.moveTo(gx, boardY);
      ctx.lineTo(gx, boardY + boardH);
    }
    for (let r = 1; r < rows; r++) {
      const gy = Math.floor(boardY + r * cellSize) + 0.5;
      ctx.moveTo(boardX, gy);
      ctx.lineTo(boardX + boardW, gy);
    }
    ctx.stroke();

    /* Arena Border & Corner Terminal Brackets */
    ctx.strokeStyle = score >= NOTICE_THRESHOLD ? COLORS.amber : COLORS.lineBright;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boardX + 0.5, boardY + 0.5, boardW - 1, boardH - 1);

    drawCornerBrackets(boardX, boardY, boardW, boardH);

    /* 3. Food / Digital Data Packet Node */
    drawFoodPacket();

    /* 4. Segmented Digital Snake */
    drawDigitalSnake();

    /* 5. Particles */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    /* 6. Bottom Telemetry Bar on Canvas */
    drawTelemetryFooter();

    ctx.restore();
  }

  function drawCornerBrackets(x, y, w, h) {
    const len = 10;
    ctx.save();
    ctx.strokeStyle = COLORS.lime;
    ctx.lineWidth = 2;
    ctx.beginPath();
    /* Top-left */
    ctx.moveTo(x, y + len);
    ctx.lineTo(x, y);
    ctx.lineTo(x + len, y);
    /* Top-right */
    ctx.moveTo(x + w - len, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + len);
    /* Bottom-left */
    ctx.moveTo(x, y + h - len);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + len, y + h);
    /* Bottom-right */
    ctx.moveTo(x + w - len, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - len);
    ctx.stroke();
    ctx.restore();
  }

  function drawFoodPacket() {
    if (!food) return;
    const cx = boardX + (food.x + 0.5) * cellSize;
    const cy = boardY + (food.y + 0.5) * cellSize;
    const pulse = 0.5 + 0.5 * Math.sin(pulseClock * 6);

    ctx.save();

    /* Subtle coordinate guide crosshairs around packet */
    ctx.strokeStyle = 'rgba(213, 251, 120, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - cellSize * 0.85, cy);
    ctx.lineTo(cx + cellSize * 0.85, cy);
    ctx.moveTo(cx, cy - cellSize * 0.85);
    ctx.lineTo(cx, cy + cellSize * 0.85);
    ctx.stroke();

    /* Outer pulsing packet ring */
    const outerR = cellSize * (0.36 + pulse * 0.08);
    ctx.strokeStyle = 'rgba(213, 251, 120, 0.48)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cx - outerR, cy - outerR, outerR * 2, outerR * 2);

    /* Inner glowing digital node core */
    const coreR = cellSize * 0.24;
    ctx.fillStyle = COLORS.lime;
    ctx.fillRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2);

    ctx.restore();
  }

  function drawDigitalSnake() {
    if (!snake.length) return;

    ctx.save();

    /* Draw internal data-bus line linking consecutive segments */
    if (snake.length > 1) {
      ctx.strokeStyle = 'rgba(213, 251, 120, 0.38)';
      ctx.lineWidth = Math.max(2, cellSize * 0.14);
      ctx.beginPath();
      for (let i = 0; i < snake.length; i++) {
        const sx = boardX + (snake[i].x + 0.5) * cellSize;
        const sy = boardY + (snake[i].y + 0.5) * cellSize;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    /* Draw each segment from tail to head */
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const x = boardX + seg.x * cellSize;
      const y = boardY + seg.y * cellSize;
      const pad = i === 0 ? 1.5 : 2.5;
      const w = cellSize - pad * 2;
      const h = cellSize - pad * 2;

      if (i === 0) {
        /* Snake Head: Active Processor Node */
        ctx.fillStyle = COLORS.lime;
        ctx.fillRect(x + pad, y + pad, w, h);

        /* Directional optical sensor dots on head */
        ctx.fillStyle = '#111310';
        const eyeSize = Math.max(2, Math.floor(cellSize * 0.13));
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        const fwd = cellSize * 0.2;
        const side = cellSize * 0.2;

        const e1x = cx + dir.x * fwd - dir.y * side - eyeSize / 2;
        const e1y = cy + dir.y * fwd + dir.x * side - eyeSize / 2;
        const e2x = cx + dir.x * fwd + dir.y * side - eyeSize / 2;
        const e2y = cy + dir.y * fwd - dir.x * side - eyeSize / 2;

        ctx.fillRect(e1x, e1y, eyeSize, eyeSize);
        ctx.fillRect(e2x, e2y, eyeSize, eyeSize);
      } else {
        /* Snake Body: Segmented Digital Conduit Block */
        ctx.fillStyle = COLORS.bodyFill;
        ctx.strokeStyle = i % 2 === 0 ? COLORS.bodyStroke : COLORS.lineBright;
        ctx.lineWidth = 1.2;
        ctx.fillRect(x + pad, y + pad, w, h);
        ctx.strokeRect(x + pad + 0.5, y + pad + 0.5, w - 1, h - 1);

        /* Subtle node center pin */
        ctx.fillStyle = i % 3 === 0 ? COLORS.lime : 'rgba(160, 165, 152, 0.45)';
        ctx.fillRect(x + cellSize / 2 - 1.5, y + cellSize / 2 - 1.5, 3, 3);
      }
    }

    ctx.restore();
  }

  function drawTelemetryFooter() {
    const hz = (1000 / currentStepInterval()).toFixed(1);
    const memPct = Math.min(99, 18 + Math.floor((score / NOTICE_THRESHOLD) * 76));

    ctx.save();
    ctx.font = '400 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(160, 165, 152, 0.7)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const footerY = viewH - 13;
    ctx.fillText(
      `GRID: ${cols}x${rows}   LEN: ${String(snake.length).padStart(3, '0')}   CLK: ${hz}HZ   MEM: ${memPct}%`,
      boardX,
      footerY
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = score >= NOTICE_THRESHOLD ? COLORS.amber : COLORS.lime;
    ctx.fillText(
      score >= NOTICE_THRESHOLD ? 'WARN // MEMORY CRITICAL' : `PID // SNAKE.EXE`,
      boardX + boardW,
      footerY
    );
    ctx.restore();
  }

  /* ─── Main Loop (requestAnimationFrame) ─── */
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

  /* ─── Event Listeners (Scoped to Open Modal) ─── */
  function handleKeyDown(e) {
    if (!isModalOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeGameModal();
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        queueDirection(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        queueDirection(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        queueDirection(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        queueDirection(1, 0);
        break;
      case ' ':
      case 'Enter':
        if (state === 'READY') {
          e.preventDefault();
          startGameplay();
        } else if (state === 'TERMINATED' && performance.now() - gameOverTimestamp > 350) {
          e.preventDefault();
          startGameplay();
        }
        break;
    }
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e) {
    if (!isModalOpen) return;
    if (!e.touches || !e.touches.length) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (!isModalOpen) return;
    if (!e.changedTouches || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      queueDirection(dx > 0 ? 1 : -1, 0);
    } else {
      queueDirection(0, dy > 0 ? 1 : -1);
    }
  }

  function handleTouchMovePreventScroll(e) {
    if (!isModalOpen) return;
    if (e.cancelable) e.preventDefault();
  }

  function handleWindowResize() {
    if (!isModalOpen) return;
    computeBoardDimensions();
    render();
  }

  function mountRuntimeListeners() {
    if (listenersMounted) return;
    listenersMounted = true;
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('resize', handleWindowResize, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    overlay.addEventListener('touchmove', handleTouchMovePreventScroll, { passive: false });
  }

  function unmountRuntimeListeners() {
    if (!listenersMounted) return;
    listenersMounted = false;
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', handleWindowResize);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchend', handleTouchEnd);
    overlay.removeEventListener('touchmove', handleTouchMovePreventScroll);
  }

  /* ─── Open / Close Modal Lifecycle ─── */
  function openGameModal() {
    if (isModalOpen) return;
    isModalOpen = true;

    bestScore = loadBestScore();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    resetToReadyState();
    mountRuntimeListeners();

    requestAnimationFrame(() => {
      overlay.classList.add('open');
      computeBoardDimensions();
      render();
      if (startBtn) startBtn.focus();
    });

    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function closeGameModal() {
    if (!isModalOpen) return;
    isModalOpen = false;

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
  if (startBtn) startBtn.addEventListener('click', startGameplay);
  if (restartBtn) restartBtn.addEventListener('click', startGameplay);
  if (startExitBtn) startExitBtn.addEventListener('click', closeGameModal);
  if (exitBtn) exitBtn.addEventListener('click', closeGameModal);
  if (exitTopBtn) exitTopBtn.addEventListener('click', closeGameModal);

  if (dpadUp) dpadUp.addEventListener('click', () => queueDirection(0, -1));
  if (dpadDown) dpadDown.addEventListener('click', () => queueDirection(0, 1));
  if (dpadLeft) dpadLeft.addEventListener('click', () => queueDirection(-1, 0));
  if (dpadRight) dpadRight.addEventListener('click', () => queueDirection(1, 0));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGameModal();
  });
})();
