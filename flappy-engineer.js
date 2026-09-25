/* ═══════════════════════════════════════════════════════════════════
   LAB 05 // FLAPPY ENGINEER — ISOLATED GAME MODULE
   HTML5 Canvas · requestAnimationFrame · Physics · Collision · Telemetry
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const STORAGE_KEY = 'cyper_lab_flappy_engineer_best';

  const openBtn = document.getElementById('open-flappy-btn');
  const overlay = document.getElementById('fe-overlay');
  if (!openBtn || !overlay) return;

  const canvas = document.getElementById('fe-canvas');
  const stage = document.getElementById('fe-stage');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!canvas || !ctx || !stage) return;

  /* ─── UI Elements ─── */
  const statusBadge = document.getElementById('fe-status-badge');
  const statusText = document.getElementById('fe-status-text');
  const topScoreEl = document.getElementById('fe-top-score');
  const topBestEl = document.getElementById('fe-top-best');
  const liveHud = document.getElementById('fe-live-hud');
  const liveScoreVal = document.getElementById('fe-live-score-val');

  const startScreen = document.getElementById('fe-start-screen');
  const startBtn = document.getElementById('fe-start-btn');
  const startExitBtn = document.getElementById('fe-start-exit-btn');

  const gameOverScreen = document.getElementById('fe-gameover-screen');
  const finalScoreEl = document.getElementById('fe-final-score');
  const finalBestEl = document.getElementById('fe-final-best');
  const newRecordBadge = document.getElementById('fe-new-record');
  const tryAgainBtn = document.getElementById('fe-try-again-btn');
  const exitBtn = document.getElementById('fe-exit-btn');
  const exitTopBtn = document.getElementById('fe-exit-top-btn');

  /* ─── Theme Colors (Technical Dark Interface) ─── */
  const COLORS = {
    bg: '#111310',
    panel: '#191c17',
    panelDark: '#141712',
    line: '#2c3028',
    lineBright: '#3d4a30',
    grid: 'rgba(44, 48, 40, 0.42)',
    gridCross: 'rgba(160, 165, 152, 0.22)',
    text: '#f0f1e9',
    muted: '#a0a598',
    lime: '#d5fb78',
    limeGlow: 'rgba(213, 251, 120, 0.16)',
    limeSoft: 'rgba(213, 251, 120, 0.07)',
    amber: '#e2b86b',
    danger: '#ff6b6b'
  };

  /* ─── Game Constants ─── */
  const CEILING_H = 26;
  const FLOOR_H = 34;
  const GRAVITY = 1360;          // px / s^2
  const FLAP_IMPULSE = -410;     // px / s
  const MAX_FALL_SPEED = 560;    // px / s
  const BASE_SPEED = 215;        // px / s
  const MAX_SPEED = 345;         // px / s
  const BASE_GAP = 162;          // px
  const MIN_GAP = 122;           // px
  const OBSTACLE_WIDTH = 64;     // px
  const OBSTACLE_TYPES = ['RACK', 'CONDUIT', 'BUSWAY'];

  /* ─── Runtime State ─── */
  let isModalOpen = false;
  let listenersMounted = false;
  let rafId = null;
  let lastTime = 0;
  let viewW = 800;
  let viewH = 520;
  let dpr = 1;

  let state = 'READY'; // 'READY' | 'PLAYING' | 'GAMEOVER'
  let score = 0;
  let bestScore = loadBestScore();
  let isNewBest = false;
  let gameOverTimestamp = 0;
  let bgScroll = 0;
  let gridScroll = 0;
  let shakeTime = 0;
  let shakeMagnitude = 0;
  let obstacleCounter = 0;

  const player = {
    x: 170,
    y: 250,
    vy: 0,
    w: 38,
    h: 30,
    angle: 0,
    flapTimer: 0,
    hoverPhase: 0
  };

  let obstacles = [];
  let particles = [];
  let floatingPopups = [];

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

  function updateScoreUI() {
    const sStr = pad3(score);
    const bStr = pad3(bestScore);
    if (topScoreEl) topScoreEl.textContent = sStr;
    if (topBestEl) topBestEl.textContent = bStr;
    if (liveScoreVal) liveScoreVal.textContent = sStr;
  }

  function setStatusIndicator(mode) {
    if (!statusBadge || !statusText) return;
    if (mode === 'READY') {
      statusBadge.removeAttribute('data-state');
      statusText.textContent = 'SYSTEM READY';
    } else if (mode === 'PLAYING') {
      statusBadge.removeAttribute('data-state');
      statusText.textContent = 'ACTIVE TELEMETRY';
    } else if (mode === 'GAMEOVER') {
      statusBadge.setAttribute('data-state', 'crashed');
      statusText.textContent = 'SIGNAL LOST';
    }
  }

  function currentDifficulty() {
    const speed = Math.min(MAX_SPEED, BASE_SPEED + score * 4.5);
    const maxAllowedGap = Math.max(136, (viewH - CEILING_H - FLOOR_H) * 0.42);
    const startGap = Math.min(BASE_GAP, maxAllowedGap);
    const minGap = Math.min(MIN_GAP, startGap - 20);
    const gap = Math.max(minGap, startGap - score * 1.15);
    const spacing = Math.max(255, Math.min(320, speed * 1.32));
    const speedMultiplier = (speed / BASE_SPEED).toFixed(1);
    return { speed, gap, spacing, speedMultiplier };
  }

  /* ─── Canvas Sizing ─── */
  function resizeCanvas() {
    if (!stage || !canvas) return;
    const rect = stage.getBoundingClientRect();
    viewW = Math.max(300, Math.floor(rect.width));
    viewH = Math.max(320, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    player.x = Math.round(Math.max(84, Math.min(200, viewW * 0.22)));
    if (state === 'READY') {
      player.y = Math.round(viewH * 0.48);
    } else {
      const minY = CEILING_H + player.h / 2;
      const maxY = viewH - FLOOR_H - player.h / 2;
      player.y = Math.max(minY, Math.min(maxY, player.y));
    }
  }

  /* ─── Reset & Transitions ─── */
  function resetToReadyState() {
    state = 'READY';
    score = 0;
    isNewBest = false;
    obstacles = [];
    particles = [];
    floatingPopups = [];
    obstacleCounter = 0;
    shakeTime = 0;

    player.x = Math.round(Math.max(84, Math.min(200, viewW * 0.22)));
    player.y = Math.round(viewH * 0.48);
    player.vy = 0;
    player.angle = 0;
    player.flapTimer = 0;
    player.hoverPhase = 0;

    updateScoreUI();
    setStatusIndicator('READY');

    startScreen.hidden = false;
    gameOverScreen.hidden = true;
    liveHud.hidden = true;
  }

  function startGameplay() {
    state = 'PLAYING';
    score = 0;
    isNewBest = false;
    obstacles = [];
    particles = [];
    floatingPopups = [];
    obstacleCounter = 0;
    shakeTime = 0;

    player.x = Math.round(Math.max(84, Math.min(200, viewW * 0.22)));
    player.y = Math.round(viewH * 0.48);
    player.vy = 0;
    player.angle = 0;

    startScreen.hidden = true;
    gameOverScreen.hidden = true;
    liveHud.hidden = false;

    updateScoreUI();
    setStatusIndicator('PLAYING');

    /* Spawn first obstacle nicely ahead of player */
    spawnObstacle(viewW + 120);
    /* Give an immediate initial upward flap */
    triggerFlap();
  }

  function triggerGameOver() {
    if (state === 'GAMEOVER') return;
    state = 'GAMEOVER';
    gameOverTimestamp = performance.now();
    shakeTime = 0.24;
    shakeMagnitude = 6;

    if (score > bestScore) {
      bestScore = score;
      isNewBest = true;
      saveBestScore(bestScore);
    }

    /* Emit collision telemetry sparks */
    spawnCollisionSparks(player.x, player.y);

    updateScoreUI();
    setStatusIndicator('GAMEOVER');

    if (finalScoreEl) finalScoreEl.textContent = pad3(score);
    if (finalBestEl) finalBestEl.textContent = pad3(bestScore);
    if (newRecordBadge) newRecordBadge.hidden = !isNewBest;

    liveHud.hidden = true;
    gameOverScreen.hidden = false;

    setTimeout(() => {
      if (state === 'GAMEOVER' && tryAgainBtn) {
        tryAgainBtn.focus();
      }
    }, 80);
  }

  /* ─── Player Actions & Particles ─── */
  function triggerFlap() {
    if (state === 'READY') {
      startGameplay();
      return;
    }
    if (state !== 'PLAYING') return;

    player.vy = FLAP_IMPULSE;
    player.flapTimer = 0.16;

    /* Thruster exhaust particles */
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: player.x - 16 + (Math.random() * 6 - 3),
        y: player.y + 6 + (Math.random() * 6 - 3),
        vx: -80 - Math.random() * 70,
        vy: 60 + Math.random() * 95,
        size: 2.5 + Math.random() * 2.5,
        life: 1,
        decay: 2.6 + Math.random() * 1.4,
        color: i % 2 === 0 ? COLORS.lime : COLORS.muted
      });
    }
  }

  function spawnCollisionSparks(x, y) {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + (Math.random() * 0.3 - 0.15);
      const spd = 70 + Math.random() * 160;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 2.5,
        life: 1,
        decay: 1.8 + Math.random() * 1.2,
        color: i % 3 === 0 ? COLORS.amber : i % 2 === 0 ? COLORS.lime : COLORS.danger
      });
    }
  }

  function spawnObstacle(startX) {
    const diff = currentDifficulty();
    const usableH = viewH - CEILING_H - FLOOR_H;
    const margin = Math.max(46, Math.min(72, usableH * 0.14));
    const minGapCenter = CEILING_H + margin + diff.gap / 2;
    const maxGapCenter = viewH - FLOOR_H - margin - diff.gap / 2;

    let gapCenter = (minGapCenter + maxGapCenter) / 2;
    if (maxGapCenter > minGapCenter) {
      gapCenter = minGapCenter + Math.random() * (maxGapCenter - minGapCenter);
    }

    obstacleCounter++;
    const type = OBSTACLE_TYPES[(obstacleCounter - 1) % OBSTACLE_TYPES.length];
    const code = `${type.slice(0, 2)}-${String(obstacleCounter).padStart(2, '0')}`;

    obstacles.push({
      x: startX,
      w: OBSTACLE_WIDTH,
      gapY: Math.round(gapCenter),
      gapH: Math.round(diff.gap),
      passed: false,
      type,
      code,
      seed: obstacleCounter * 17
    });
  }

  /* ─── Update Loop (Physics & Collisions) ─── */
  function update(dt) {
    const diff = currentDifficulty();

    if (shakeTime > 0) {
      shakeTime = Math.max(0, shakeTime - dt);
    }

    /* Update particles */
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    /* Update score popups */
    for (let i = floatingPopups.length - 1; i >= 0; i--) {
      const f = floatingPopups[i];
      f.y -= 32 * dt;
      f.life -= 1.5 * dt;
      if (f.life <= 0) floatingPopups.splice(i, 1);
    }

    if (state === 'READY') {
      bgScroll = (bgScroll + 45 * dt) % 10000;
      gridScroll = (gridScroll + 90 * dt) % 28;
      player.hoverPhase += dt * 3.8;
      player.y = Math.round(viewH * 0.47 + Math.sin(player.hoverPhase) * 7);
      player.angle = Math.sin(player.hoverPhase * 0.8) * 0.05;
      return;
    }

    if (state !== 'PLAYING') {
      return;
    }

    /* Scroll background & grid */
    bgScroll = (bgScroll + diff.speed * 0.25 * dt) % 10000;
    gridScroll = (gridScroll + diff.speed * dt) % 28;

    /* Player gravity & velocity */
    player.vy = Math.min(MAX_FALL_SPEED, player.vy + GRAVITY * dt);
    player.y += player.vy * dt;

    if (player.flapTimer > 0) {
      player.flapTimer = Math.max(0, player.flapTimer - dt);
    }

    /* Smooth pitch angle derived from vertical velocity */
    const targetAngle = Math.max(-0.44, Math.min(0.75, player.vy / 520));
    player.angle += (targetAngle - player.angle) * Math.min(1, dt * 12);

    /* Ceiling & floor collision bounds */
    const halfH = player.h * 0.42;
    if (player.y - halfH <= CEILING_H) {
      player.y = CEILING_H + halfH;
      triggerGameOver();
      return;
    }
    if (player.y + halfH >= viewH - FLOOR_H) {
      player.y = viewH - FLOOR_H - halfH;
      triggerGameOver();
      return;
    }

    /* Spawn new obstacles from right side */
    if (obstacles.length === 0) {
      spawnObstacle(viewW + 60);
    } else {
      const last = obstacles[obstacles.length - 1];
      if (viewW - (last.x + last.w) >= diff.spacing) {
        spawnObstacle(viewW + 20);
      }
    }

    /* Move obstacles & test collisions */
    const hitRx = player.w * 0.36;
    const hitRy = player.h * 0.36;
    const pLeft = player.x - hitRx;
    const pRight = player.x + hitRx;
    const pTop = player.y - hitRy;
    const pBottom = player.y + hitRy;

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.x -= diff.speed * dt;

      const topBarBottom = ob.gapY - ob.gapH / 2;
      const bottomBarTop = ob.gapY + ob.gapH / 2;

      /* Check collision with obstacle column */
      if (pRight > ob.x + 3 && pLeft < ob.x + ob.w - 3) {
        if (pTop < topBarBottom || pBottom > bottomBarTop) {
          triggerGameOver();
          return;
        }
      }

      /* Check passing obstacle for score increment */
      if (!ob.passed && ob.x + ob.w < player.x - hitRx) {
        ob.passed = true;
        score += 1;
        if (score > bestScore) {
          bestScore = score;
          isNewBest = true;
          saveBestScore(bestScore);
        }
        updateScoreUI();

        floatingPopups.push({
          x: player.x + 10,
          y: player.y - 22,
          text: '+1 SYNC',
          life: 1
        });
      }

      /* Remove offscreen obstacles */
      if (ob.x + ob.w < -80) {
        obstacles.splice(i, 1);
      }
    }
  }

  /* ─── Rendering (Technical Infrastructure & Character) ─── */
  function render() {
    ctx.save();

    /* Apply collision camera shake if active */
    if (shakeTime > 0) {
      const intensity = (shakeTime / 0.24) * shakeMagnitude;
      const dx = (Math.random() * 2 - 1) * intensity;
      const dy = (Math.random() * 2 - 1) * intensity;
      ctx.translate(dx, dy);
    }

    /* 1. Base Dark Canvas */
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, viewW, viewH);

    /* 2. Far-Background Server Rack Silhouettes (Parallax) */
    drawBackgroundRacks();

    /* 3. Engineering Blueprint Grid */
    drawTechnicalGrid();

    /* 4. Obstacles (Server Racks, Network Conduits, Busways) */
    for (let i = 0; i < obstacles.length; i++) {
      drawObstacle(obstacles[i]);
    }

    /* 5. Ceiling Cable Raceway & Bottom Raised Server Floor */
    drawCeilingAndFloor();

    /* 6. Thruster / Collision Particles */
    drawParticles();

    /* 7. Flappy Engineer Character */
    drawEngineerCharacter();

    /* 8. Floating Score Telemetry Popups */
    drawFloatingPopups();

    /* 9. Subtle Canvas Telemetry Footer Readout */
    drawCanvasTelemetry();

    ctx.restore();
  }

  function drawBackgroundRacks() {
    const bayW = 96;
    const gap = 36;
    const step = bayW + gap;
    const offset = bgScroll % step;

    ctx.save();
    for (let x = -offset - step; x < viewW + step; x += step) {
      const idx = Math.abs(Math.floor((x + bgScroll) / step));
      const rackH = 110 + (idx % 3) * 38;
      const rackY = viewH - FLOOR_H - rackH;

      ctx.fillStyle = 'rgba(22, 26, 20, 0.55)';
      ctx.strokeStyle = 'rgba(44, 48, 40, 0.35)';
      ctx.lineWidth = 1;
      ctx.fillRect(x, rackY, bayW, rackH);
      ctx.strokeRect(x + 0.5, rackY + 0.5, bayW - 1, rackH - 1);

      /* Subtle horizontal blade lines & tiny status LED */
      for (let sy = rackY + 14; sy < viewH - FLOOR_H - 10; sy += 18) {
        ctx.fillStyle = 'rgba(44, 48, 40, 0.28)';
        ctx.fillRect(x + 8, sy, bayW - 16, 1);
      }
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(213, 251, 120, 0.2)' : 'rgba(226, 184, 107, 0.18)';
      ctx.fillRect(x + 10, rackY + 8, 4, 2);
    }
    ctx.restore();
  }

  function drawTechnicalGrid() {
    const cell = 28;
    const offX = gridScroll % cell;

    ctx.save();
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = -offX; x <= viewW; x += cell) {
      const rx = Math.floor(x) + 0.5;
      ctx.moveTo(rx, CEILING_H);
      ctx.lineTo(rx, viewH - FLOOR_H);
    }
    for (let y = CEILING_H; y <= viewH - FLOOR_H; y += cell) {
      const ry = Math.floor(y) + 0.5;
      ctx.moveTo(0, ry);
      ctx.lineTo(viewW, ry);
    }
    ctx.stroke();

    /* Periodic coordinate crosshairs */
    ctx.fillStyle = COLORS.gridCross;
    for (let x = -offX + cell * 2; x < viewW; x += cell * 4) {
      for (let y = CEILING_H + cell * 2; y < viewH - FLOOR_H - cell; y += cell * 4) {
        ctx.fillRect(Math.floor(x) - 2, Math.floor(y), 5, 1);
        ctx.fillRect(Math.floor(x), Math.floor(y) - 2, 1, 5);
      }
    }
    ctx.restore();
  }

  function drawCeilingAndFloor() {
    ctx.save();

    /* Top Cable Tray Raceway */
    ctx.fillStyle = COLORS.panel;
    ctx.fillRect(0, 0, viewW, CEILING_H);
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, CEILING_H - 0.5);
    ctx.lineTo(viewW, CEILING_H - 0.5);
    ctx.stroke();

    /* Diagonal truss struts in ceiling raceway */
    const strutStep = 24;
    const strutOff = (gridScroll * 0.5) % strutStep;
    ctx.strokeStyle = 'rgba(61, 74, 48, 0.45)';
    ctx.beginPath();
    for (let x = -strutOff - strutStep; x < viewW + strutStep; x += strutStep) {
      ctx.moveTo(x, 4);
      ctx.lineTo(x + 12, CEILING_H - 4);
    }
    ctx.stroke();

    /* Bottom Raised Server Floor */
    const floorY = viewH - FLOOR_H;
    ctx.fillStyle = COLORS.panel;
    ctx.fillRect(0, floorY, viewW, FLOOR_H);

    /* Lime / muted top rail line */
    ctx.fillStyle = 'rgba(213, 251, 120, 0.25)';
    ctx.fillRect(0, floorY, viewW, 1.5);

    /* Floor tile dividers & ruler ticks */
    const tileStep = 42;
    const tileOff = gridScroll % tileStep;
    ctx.strokeStyle = COLORS.line;
    ctx.beginPath();
    for (let x = -tileOff; x < viewW + tileStep; x += tileStep) {
      ctx.moveTo(Math.floor(x) + 0.5, floorY + 2);
      ctx.lineTo(Math.floor(x) + 0.5, viewH);
    }
    ctx.stroke();

    /* Subtle lime alignment ticks along the floor edge */
    ctx.fillStyle = 'rgba(213, 251, 120, 0.45)';
    for (let x = -tileOff; x < viewW + tileStep; x += tileStep) {
      ctx.fillRect(Math.floor(x), floorY + 2, 6, 2);
    }

    ctx.restore();
  }

  function drawObstacle(ob) {
    const topH = Math.max(0, ob.gapY - ob.gapH / 2 - CEILING_H);
    const bottomY = ob.gapY + ob.gapH / 2;
    const bottomH = Math.max(0, viewH - FLOOR_H - bottomY);

    ctx.save();

    /* Draw Top Infrastructure Pillar */
    if (topH > 0) {
      drawPillarSection(ob.x, CEILING_H, ob.w, topH, true, ob);
    }

    /* Draw Bottom Infrastructure Pillar */
    if (bottomH > 0) {
      drawPillarSection(ob.x, bottomY, ob.w, bottomH, false, ob);
    }

    /* Subtle optical alignment guide ticks inside the gap */
    const guideAlpha = ob.passed ? 0.12 : 0.28;
    ctx.strokeStyle = `rgba(213, 251, 120, ${guideAlpha})`;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(ob.x + ob.w / 2, ob.gapY - ob.gapH / 2 + 2);
    ctx.lineTo(ob.x + ob.w / 2, ob.gapY + ob.gapH / 2 - 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  function drawPillarSection(x, y, w, h, isTop, ob) {
    const collarH = Math.min(18, h);
    const bodyY = isTop ? y : y + collarH;
    const bodyH = Math.max(0, h - collarH);

    /* Main Pillar Chassis */
    if (bodyH > 0) {
      ctx.fillStyle = COLORS.panelDark;
      ctx.fillRect(x + 3, bodyY, w - 6, bodyH);

      /* Side rack rails */
      ctx.fillStyle = '#1f241b';
      ctx.fillRect(x + 3, bodyY, 6, bodyH);
      ctx.fillRect(x + w - 9, bodyY, 6, bodyH);

      ctx.strokeStyle = COLORS.line;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 3.5, bodyY + 0.5, w - 7, bodyH - 1);

      /* Infrastructure Internal Pattern by Type */
      if (ob.type === 'RACK') {
        /* 1U / 2U Server Rack Bays & Blinking Activity LEDs */
        const slotStep = 16;
        for (let sy = bodyY + 8; sy < bodyY + bodyH - 10; sy += slotStep) {
          ctx.fillStyle = '#1b2017';
          ctx.fillRect(x + 11, sy, w - 22, 11);
          ctx.strokeStyle = 'rgba(61, 74, 48, 0.45)';
          ctx.strokeRect(x + 11.5, sy + 0.5, w - 23, 10);

          /* Server LED indicator */
          const ledOn = ((Math.floor(sy) + ob.seed) % 3) !== 0;
          ctx.fillStyle = ob.passed
            ? COLORS.lime
            : ledOn
              ? 'rgba(213, 251, 120, 0.78)'
              : 'rgba(226, 184, 107, 0.65)';
          ctx.fillRect(x + 15, sy + 4, 4, 2.5);

          /* Vent slots */
          ctx.fillStyle = 'rgba(160, 165, 152, 0.22)';
          ctx.fillRect(x + 24, sy + 4, w - 38, 2);
        }
      } else if (ob.type === 'CONDUIT') {
        /* Network Trunk Cable Bundles */
        const cables = [x + 16, x + 24, x + 32, x + 40, x + 48];
        for (let c = 0; c < cables.length; c++) {
          ctx.fillStyle = c === 2 ? 'rgba(213, 251, 120, 0.32)' : 'rgba(61, 74, 48, 0.55)';
          ctx.fillRect(cables[c], bodyY + 2, 2, bodyH - 4);
        }
        /* Cable tie clamps */
        for (let cy = bodyY + 22; cy < bodyY + bodyH - 14; cy += 28) {
          ctx.fillStyle = '#252b20';
          ctx.fillRect(x + 10, cy, w - 20, 6);
          ctx.fillStyle = COLORS.lime;
          ctx.fillRect(x + 13, cy + 2, 5, 2);
        }
      } else {
        /* High-Voltage / Busway Barrier */
        for (let by = bodyY + 10; by < bodyY + bodyH - 12; by += 20) {
          ctx.fillStyle = 'rgba(44, 48, 40, 0.6)';
          ctx.fillRect(x + 12, by, w - 24, 14);
          ctx.fillStyle = 'rgba(213, 251, 120, 0.45)';
          ctx.fillRect(x + 15, by + 5, (w - 30) * 0.65, 3);
        }
      }
    }

    /* Reinforced Terminal Collar framing the gap */
    const collarY = isTop ? y + h - collarH : y;
    ctx.fillStyle = '#21271c';
    ctx.fillRect(x, collarY, w, collarH);

    ctx.strokeStyle = ob.passed ? COLORS.lime : COLORS.lineBright;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, collarY + 0.5, w - 1, collarH - 1);

    /* Crisp Lime Clearance Strip on Gap Edge */
    ctx.fillStyle = COLORS.lime;
    if (isTop) {
      ctx.fillRect(x + 1, collarY + collarH - 2.5, w - 2, 2.5);
    } else {
      ctx.fillRect(x + 1, collarY, w - 2, 2.5);
    }

    /* Stencil Label on Collar */
    if (collarH >= 14) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = '500 8.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ob.code, x + w / 2, collarY + collarH / 2 + (isTop ? -1 : 1));
    }
  }

  function drawEngineerCharacter() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    /* 1. Subtle Headlamp Light Cone Ahead of Engineer */
    const coneGrad = ctx.createLinearGradient(12, -4, 98, -4);
    coneGrad.addColorStop(0, 'rgba(213, 251, 120, 0.14)');
    coneGrad.addColorStop(1, 'rgba(213, 251, 120, 0)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(12, -7);
    ctx.lineTo(96, -28);
    ctx.lineTo(96, 18);
    ctx.lineTo(12, -1);
    ctx.closePath();
    ctx.fill();

    /* 2. Diagnostic Backpack / Micro-Thruster */
    ctx.fillStyle = '#181c15';
    ctx.strokeStyle = COLORS.lineBright;
    ctx.lineWidth = 1.2;
    ctx.fillRect(-19, -6, 9, 15);
    ctx.strokeRect(-19, -6, 9, 15);

    /* Antenna on Backpack */
    ctx.strokeStyle = COLORS.muted;
    ctx.beginPath();
    ctx.moveTo(-15, -6);
    ctx.lineTo(-15, -13);
    ctx.stroke();
    ctx.fillStyle = COLORS.lime;
    ctx.fillRect(-16.5, -15, 3, 3);

    /* Thruster Nozzle Flame Glow when flapping */
    if (player.flapTimer > 0) {
      ctx.fillStyle = COLORS.lime;
      ctx.beginPath();
      ctx.moveTo(-18, 9);
      ctx.lineTo(-14.5, 17 + Math.random() * 4);
      ctx.lineTo(-11, 9);
      ctx.closePath();
      ctx.fill();
    }

    /* 3. Engineer Torso / Field Utility Jacket */
    ctx.fillStyle = '#22281d';
    ctx.strokeStyle = COLORS.lineBright;
    ctx.lineWidth = 1.2;
    roundRect(ctx, -11, -7, 22, 18, 4);
    ctx.fill();
    ctx.stroke();

    /* Utility Belt & Lime ID Badge on Chest */
    ctx.fillStyle = '#141712';
    ctx.fillRect(-10, 5, 20, 3);
    ctx.fillStyle = COLORS.lime;
    ctx.fillRect(2, -2, 5, 4);

    /* 4. Pivoting Stabilizer Wing / Tool Arm */
    const wingAngle = player.flapTimer > 0 ? -0.45 : 0.18;
    ctx.save();
    ctx.translate(-3, 1);
    ctx.rotate(wingAngle);
    ctx.fillStyle = '#2b3324';
    ctx.strokeStyle = COLORS.lime;
    ctx.lineWidth = 1;
    roundRect(ctx, -8, -3, 13, 6, 2.5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    /* 5. Engineer Head & Technical AR Visor */
    ctx.fillStyle = '#d8dccf';
    roundRect(ctx, -6, -14, 15, 10, 3);
    ctx.fill();

    /* Dark AR Goggles / Visor */
    ctx.fillStyle = '#111310';
    ctx.fillRect(-1, -12, 11, 5.5);
    /* Glowing HUD Scanline inside Visor */
    ctx.fillStyle = COLORS.lime;
    ctx.fillRect(1, -10, 7, 1.8);

    /* 6. Signature Lime Engineer Safety Hard Hat */
    ctx.fillStyle = COLORS.lime;
    ctx.beginPath();
    ctx.arc(1.5, -13.5, 9, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    /* Hard Hat Brim & Ridge */
    ctx.fillStyle = COLORS.lime;
    ctx.fillRect(-8, -14.5, 22, 2.6);
    ctx.fillStyle = '#1c2510';
    ctx.fillRect(-3, -16.5, 9, 1.5);

    /* Front Headlamp Unit */
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, -17, 3, 2.5);

    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }

  function drawFloatingPopups() {
    ctx.save();
    ctx.font = '500 10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < floatingPopups.length; i++) {
      const f = floatingPopups[i];
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      ctx.fillStyle = COLORS.lime;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
  }

  function drawCanvasTelemetry() {
    const diff = currentDifficulty();
    const alt = Math.max(0, Math.round(viewH - FLOOR_H - player.y));

    ctx.save();
    ctx.font = '400 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(160, 165, 152, 0.72)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const yPos = viewH - FLOOR_H / 2;
    const telemetryStr = `ALT: ${String(alt).padStart(3, '0')}PX   VEL: ${diff.speedMultiplier}X   GAP: ${Math.round(diff.gap)}PX`;
    ctx.fillText(telemetryStr, 14, yPos);

    ctx.textAlign = 'right';
    ctx.fillStyle = state === 'PLAYING' ? COLORS.lime : 'rgba(160, 165, 152, 0.6)';
    ctx.fillText(`STATE // ${state}`, viewW - 14, yPos);
    ctx.restore();
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  /* ─── Game Loop (requestAnimationFrame) ─── */
  function loop(timestamp) {
    if (!isModalOpen) return;
    if (!lastTime) lastTime = timestamp;
    const rawDt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    /* Clamp delta time so tab switching doesn't cause physics jumps */
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    update(dt);
    render();

    rafId = requestAnimationFrame(loop);
  }

  /* ─── Input & Event Handlers (Scoped to Active Modal Lifecycle) ─── */
  function handleKeyDown(e) {
    if (!isModalOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeGameModal();
      return;
    }

    const isFlapKey = e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp' || e.code === 'KeyW';
    if (isFlapKey) {
      e.preventDefault();
      if (state === 'READY') {
        startGameplay();
      } else if (state === 'PLAYING') {
        triggerFlap();
      } else if (state === 'GAMEOVER') {
        /* Short cooldown prevents accidental instant restart on collision frame */
        if (performance.now() - gameOverTimestamp > 350) {
          startGameplay();
        }
      }
    }
  }

  function handleCanvasPointerDown(e) {
    if (!isModalOpen) return;
    /* Ignore clicks on buttons/panels */
    if (e.target !== canvas) return;
    if (e.cancelable) e.preventDefault();

    if (state === 'READY') {
      startGameplay();
    } else if (state === 'PLAYING') {
      triggerFlap();
    }
  }

  function handleTouchMovePreventScroll(e) {
    if (!isModalOpen) return;
    if (e.cancelable) e.preventDefault();
  }

  function handleWindowResize() {
    if (!isModalOpen) return;
    resizeCanvas();
    render();
  }

  function mountRuntimeListeners() {
    if (listenersMounted) return;
    listenersMounted = true;
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('resize', handleWindowResize, { passive: true });
    canvas.addEventListener('pointerdown', handleCanvasPointerDown, { passive: false });
    overlay.addEventListener('touchmove', handleTouchMovePreventScroll, { passive: false });
  }

  function unmountRuntimeListeners() {
    if (!listenersMounted) return;
    listenersMounted = false;
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', handleWindowResize);
    canvas.removeEventListener('pointerdown', handleCanvasPointerDown);
    overlay.removeEventListener('touchmove', handleTouchMovePreventScroll);
  }

  /* ─── Modal Open / Close Lifecycle ─── */
  function openGameModal() {
    if (isModalOpen) return;
    isModalOpen = true;

    bestScore = loadBestScore();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    resizeCanvas();
    resetToReadyState();
    mountRuntimeListeners();

    requestAnimationFrame(() => {
      overlay.classList.add('open');
      resizeCanvas();
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

  /* ─── Static UI Button Bindings ─── */
  openBtn.addEventListener('click', openGameModal);
  if (startBtn) startBtn.addEventListener('click', startGameplay);
  if (tryAgainBtn) tryAgainBtn.addEventListener('click', startGameplay);
  if (startExitBtn) startExitBtn.addEventListener('click', closeGameModal);
  if (exitBtn) exitBtn.addEventListener('click', closeGameModal);
  if (exitTopBtn) exitTopBtn.addEventListener('click', closeGameModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGameModal();
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   LAB SECTION — SINGLE FEATURED EXPERIMENT CAROUSEL CONTROLLER
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const carouselEl = document.getElementById('lab-carousel');
  const track = document.getElementById('lab-carousel-track');
  if (!carouselEl || !track) return;

  const slides = Array.from(track.querySelectorAll('.lab-carousel-slide'));
  const prevBtn = document.getElementById('lab-prev-btn');
  const nextBtn = document.getElementById('lab-next-btn');
  const counterEl = document.getElementById('lab-carousel-counter');
  const total = slides.length;
  if (!total || !prevBtn || !nextBtn || !counterEl) return;

  let current = 0;
  let animating = false;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function updateCounter() {
    counterEl.textContent = `${pad(current + 1)} / ${pad(total)}`;
  }

  function goTo(index, direction) {
    if (animating || index === current) return;

    const outSlide = slides[current];
    const inSlide = slides[index];
    const dir = direction || (index > current ? 'next' : 'prev');

    if (prefersReducedMotion()) {
      outSlide.classList.remove('active');
      outSlide.setAttribute('aria-hidden', 'true');
      outSlide.style.cssText = '';

      inSlide.classList.add('active');
      inSlide.setAttribute('aria-hidden', 'false');
      inSlide.style.cssText = '';

      current = index;
      updateCounter();
      return;
    }

    animating = true;

    /* Phase 1: subtle fade & slide out (160ms) */
    outSlide.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
    outSlide.style.opacity = '0';
    outSlide.style.transform = dir === 'next' ? 'translateX(-18px)' : 'translateX(18px)';

    setTimeout(() => {
      outSlide.classList.remove('active');
      outSlide.setAttribute('aria-hidden', 'true');
      outSlide.style.cssText = '';

      /* Phase 2: prepare incoming slide */
      inSlide.style.transition = 'none';
      inSlide.style.opacity = '0';
      inSlide.style.transform = dir === 'next' ? 'translateX(18px)' : 'translateX(-18px)';
      inSlide.classList.add('active');
      inSlide.setAttribute('aria-hidden', 'false');

      /* Force reflow */
      void inSlide.offsetHeight;

      /* Phase 3: smooth slide & fade in (260ms) */
      inSlide.style.transition = 'opacity 0.26s cubic-bezier(0.22, 1, 0.36, 1), transform 0.26s cubic-bezier(0.22, 1, 0.36, 1)';
      inSlide.style.opacity = '1';
      inSlide.style.transform = 'translateX(0)';

      current = index;
      updateCounter();

      setTimeout(() => {
        inSlide.style.cssText = '';
        animating = false;
      }, 270);
    }, 165);
  }

  function next() {
    goTo((current + 1) % total, 'next');
  }

  function prev() {
    goTo((current - 1 + total) % total, 'prev');
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* Keyboard navigation when Lab section is in view or focused */
  let labInView = false;
  const labSection = document.getElementById('lab');
  if (labSection && 'IntersectionObserver' in window) {
    const labObs = new IntersectionObserver(
      ([entry]) => {
        labInView = entry.isIntersecting;
      },
      { threshold: 0.25 }
    );
    labObs.observe(labSection);
  }

  document.addEventListener('keydown', (e) => {
    const feOverlay = document.getElementById('fe-overlay');
    const eeOverlay = document.getElementById('ee-overlay');
    const snOverlay = document.getElementById('sn-overlay');
    if ((feOverlay && !feOverlay.hidden) || (eeOverlay && !eeOverlay.hidden) || (snOverlay && !snOverlay.hidden)) return;
    if (document.querySelector('dialog[open]')) return;

    const isFocusedInside = carouselEl.contains(document.activeElement);
    if (!labInView && !isFocusedInside) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  });

  /* Touch swipe on mobile */
  let touchStartX = 0;
  let touchStartY = 0;
  carouselEl.addEventListener(
    'touchstart',
    (e) => {
      if (!e.touches || !e.touches.length) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  carouselEl.addEventListener(
    'touchend',
    (e) => {
      if (!e.changedTouches || !e.changedTouches.length) return;
      const dx = touchStartX - e.changedTouches[0].clientX;
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) next();
        else prev();
      }
    },
    { passive: true }
  );

  updateCounter();
})();

