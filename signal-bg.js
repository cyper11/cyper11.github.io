/* ═══════════════════════════════════════════════════════════════════
   SIGNAL BACKGROUND — procedural circuit board behind the site
   PCB trace buses run in from the edges (45° bends, vias, IC pads),
   lime signal packets travel along them, and the cursor carries a
   soft scanner light that reveals the board around it.
   Canvas 2D on #contour-canvas; keeps the __pause/__resumeContourBackground
   API the lab games already call.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('contour-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.style.display = 'none'; return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const G = 26;                       // routing grid (px)
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

  let W = 0, H = 0, DPR = 1;
  let base = null, lit = null, spot = null, spotMask = null;  // pre-rendered board: dim + bright copies, cursor mask
  const SPOT_R = 230;
  let traces = [];                    // { pts:[[x,y]...], cum:[...], len }
  let packets = [];
  let colors = null;
  let mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, a: 0 };
  let paused = false, running = false, last = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const irand = (a, b) => Math.floor(rand(a, b + 1));

  function palette() {
    const light = document.documentElement.dataset.theme === 'light';
    return light
      ? { trace: 'rgba(74,138,20,.16)', via: 'rgba(74,138,20,.22)', dot: 'rgba(26,29,23,.07)', lit: 'rgba(74,138,20,.55)', pkt: '74,138,20' }
      : { trace: 'rgba(213,251,120,.075)', via: 'rgba(213,251,120,.12)', dot: 'rgba(240,241,233,.05)', lit: 'rgba(213,251,120,.42)', pkt: '213,251,120' };
  }

  /* ─── Board generation: parallel buses routed on an occupancy grid ─ */
  function generate() {
    const cols = Math.ceil(W / G) + 1, rows = Math.ceil(H / G) + 1;
    const used = new Uint8Array(cols * rows);
    const free = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && !used[r * cols + c];
    const mark = (c, r) => { if (c >= 0 && r >= 0 && c < cols && r < rows) used[r * cols + c] = 1; };
    traces = [];

    // keep the reading column quieter: fewer buses start mid-screen
    const busCount = Math.round((W * H) / 52000) + 6;
    for (let b = 0; b < busCount; b++) {
      const edge = irand(0, 3);       // 0 left, 1 right, 2 top, 3 bottom
      const width = irand(2, 6);
      let c0, r0, d0;
      if (edge === 0) { c0 = 0; r0 = irand(1, rows - width - 1); d0 = 0; }
      else if (edge === 1) { c0 = cols - 1; r0 = irand(1, rows - width - 1); d0 = 4; }
      else if (edge === 2) { c0 = irand(1, cols - width - 1); r0 = 0; d0 = 2; }
      else { c0 = irand(1, cols - width - 1); r0 = rows - 1; d0 = 6; }
      // one route plan shared by every wire in the bus so they run in parallel
      const plan = [];
      let d = d0;
      const segs = irand(2, 5);
      for (let s = 0; s < segs; s++) {
        plan.push([d, irand(3, 12)]);
        const turn = Math.random() < 0.5 ? 1 : -1;
        d = (d + turn + 8) % 8;
        if (Math.random() < 0.55) { plan.push([d, irand(1, 3)]); d = (d + turn + 8) % 8; }
      }
      const perp = d0 % 4 === 0 ? [0, 1] : [1, 0];
      for (let k = 0; k < width; k++) {
        let c = c0 + perp[0] * k, r = r0 + perp[1] * k;
        if (!free(c, r)) continue;
        const pts = [[c, r]];
        mark(c, r);
        let blocked = false;
        for (const [dir, len] of plan) {
          const [dx, dy] = DIRS[dir];
          for (let n = 0; n < len; n++) {
            const nc = c + dx, nr = r + dy;
            if (!free(nc, nr)) { blocked = true; break; }
            c = nc; r = nr; mark(c, r);
          }
          pts.push([c, r]);
          if (blocked) break;
        }
        if (pts.length < 2) continue;
        const px = pts.map(([pc, pr]) => [pc * G + 0.5, pr * G + 0.5]);
        const cum = [0];
        for (let i = 1; i < px.length; i++) cum.push(cum[i - 1] + Math.hypot(px[i][0] - px[i - 1][0], px[i][1] - px[i - 1][1]));
        if (cum[cum.length - 1] < G * 3) continue;
        traces.push({ pts: px, cum, len: cum[cum.length - 1] });
      }
    }

    // a few IC footprints: body outline + pin stubs
    const chips = [];
    const chipCount = Math.max(2, Math.round(W / 520));
    for (let i = 0; i < chipCount; i++) {
      const cw = irand(3, 6), ch = irand(2, 4);
      const cc = irand(1, cols - cw - 2), cr = irand(1, rows - ch - 2);
      let ok = true;
      for (let y = cr - 1; y <= cr + ch + 1 && ok; y++) for (let x = cc - 1; x <= cc + cw + 1; x++) if (!free(x, y)) { ok = false; break; }
      if (!ok) continue;
      for (let y = cr - 1; y <= cr + ch + 1; y++) for (let x = cc - 1; x <= cc + cw + 1; x++) mark(x, y);
      chips.push([cc * G, cr * G, cw * G, ch * G]);
    }

    render(chips);
    packets = [];
    const n = Math.min(traces.length, touch ? 10 : Math.round(traces.length * 0.35) + 6);
    for (let i = 0; i < n; i++) packets.push(newPacket(true));
  }

  function newPacket(scatter) {
    const t = traces[(Math.random() * traces.length) | 0];
    return { t, s: scatter ? Math.random() * t.len : 0, v: rand(70, 160), tail: rand(40, 90), dir: Math.random() < 0.5 ? 1 : -1 };
  }

  /* ─── Pre-render the board twice: dim (always) and lit (under the cursor) ─ */
  function paintBoard(target, color, viaColor, chips, withDots) {
    const c = target.getContext('2d');
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.clearRect(0, 0, W, H);
    if (withDots) {
      c.fillStyle = colors.dot;
      for (let y = 0; y <= H; y += G) for (let x = 0; x <= W; x += G) c.fillRect(x, y, 1, 1);
    }
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.lineJoin = 'round';
    c.beginPath();
    for (const t of traces) {
      c.moveTo(t.pts[0][0], t.pts[0][1]);
      for (let i = 1; i < t.pts.length; i++) c.lineTo(t.pts[i][0], t.pts[i][1]);
    }
    c.stroke();
    c.strokeStyle = viaColor;
    for (const t of traces) {
      const [x, y] = t.pts[t.pts.length - 1];
      c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.stroke();
    }
    for (const [x, y, w, h] of chips) {
      c.strokeRect(x + 0.5, y + 0.5, w, h);
      c.beginPath(); c.arc(x + 7, y + 7, 2, 0, Math.PI * 2); c.stroke();
      for (let px = x + G / 2; px < x + w; px += G / 2) {
        c.moveTo(px + 0.5, y); c.lineTo(px + 0.5, y - 6);
        c.moveTo(px + 0.5, y + h); c.lineTo(px + 0.5, y + h + 6);
      }
      c.stroke();
    }
  }
  function render(chips) {
    colors = palette();
    for (const cv of [base, lit]) { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); }
    paintBoard(base, colors.trace, colors.via, chips, true);
    paintBoard(lit, colors.lit, colors.lit, chips, false);
    render.chips = chips;
  }

  function resize() {
    DPR = Math.min(1.5, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    if (!base) { base = document.createElement('canvas'); lit = document.createElement('canvas'); spot = document.createElement('canvas'); }
    spot.width = spot.height = Math.round(SPOT_R * 2 * DPR);
    const half = spot.width / 2;
    spotMask = spot.getContext('2d').createRadialGradient(half, half, 0, half, half, half);
    spotMask.addColorStop(0, 'rgba(0,0,0,1)');
    spotMask.addColorStop(0.55, 'rgba(0,0,0,.55)');
    spotMask.addColorStop(1, 'rgba(0,0,0,0)');
    generate();
    draw(performance.now(), 0);
  }

  /* ─── Frame ─── */
  function pointAt(t, s) {
    let i = 1;
    while (i < t.cum.length - 1 && t.cum[i] < s) i++;
    const a = t.pts[i - 1], b = t.pts[i];
    const seg = t.cum[i] - t.cum[i - 1] || 1;
    const u = Math.min(1, Math.max(0, (s - t.cum[i - 1]) / seg));
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }

  function draw(now, dt) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // scanner light: reveal the bright board inside a soft circle around the cursor
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 10);
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 10);
    if (mouse.a > 0.01) {
      const S = spot.width, R = SPOT_R;
      const sc = spot.getContext('2d');
      sc.globalCompositeOperation = 'source-over';
      sc.clearRect(0, 0, S, S);
      sc.drawImage(lit, (mouse.x - R) * DPR, (mouse.y - R) * DPR, S, S, 0, 0, S, S);
      sc.globalCompositeOperation = 'destination-in';
      sc.fillStyle = spotMask;
      sc.fillRect(0, 0, S, S);
      ctx.globalAlpha = mouse.a;
      ctx.drawImage(spot, mouse.x - R, mouse.y - R, R * 2, R * 2);
      ctx.globalAlpha = 1;
    }

    // packets: bright head with a fading tail along the trace
    ctx.lineCap = 'round';
    for (let i = 0; i < packets.length; i++) {
      const p = packets[i];
      p.s += p.v * dt;
      if (p.s - p.tail > p.t.len) { packets[i] = newPacket(false); continue; }
      const head = Math.min(p.s, p.t.len), tailS = Math.max(0, p.s - p.tail);
      const steps = 6;
      for (let k = 0; k < steps; k++) {
        const s0 = tailS + (head - tailS) * (k / steps), s1 = tailS + (head - tailS) * ((k + 1) / steps);
        const a = p.dir > 0 ? pointAt(p.t, s0) : pointAt(p.t, p.t.len - s0);
        const b = p.dir > 0 ? pointAt(p.t, s1) : pointAt(p.t, p.t.len - s1);
        ctx.strokeStyle = `rgba(${colors.pkt},${((k + 1) / steps * 0.75).toFixed(3)})`;
        ctx.lineWidth = 1 + (k / steps) * 1.2;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      if (p.s <= p.t.len) {
        const h = p.dir > 0 ? pointAt(p.t, head) : pointAt(p.t, p.t.len - head);
        ctx.fillStyle = `rgba(${colors.pkt},.95)`;
        ctx.fillRect(h[0] - 1.5, h[1] - 1.5, 3, 3);
        ctx.fillStyle = `rgba(${colors.pkt},.18)`;
        ctx.beginPath(); ctx.arc(h[0], h[1], 6, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function loop(now) {
    if (paused || document.hidden || reduce) { running = false; return; }
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    mouse.a += ((mouse.tx > -999 ? 1 : 0) - mouse.a) * Math.min(1, dt * 4);
    draw(now, dt);
    requestAnimationFrame(loop);
  }
  function start() {
    if (running || paused || document.hidden || reduce) return;
    running = true; last = 0;
    requestAnimationFrame(loop);
  }

  /* ─── Wiring ─── */
  if (!touch) {
    addEventListener('pointermove', e => { mouse.tx = e.clientX; mouse.ty = e.clientY; if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; } }, { passive: true });
    document.addEventListener('pointerleave', () => { mouse.tx = mouse.ty = -9999; });
  }
  let rs = 0;
  addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(resize, 150); });
  const repaint = () => { colors = palette(); render(render.chips || []); if (reduce || !running) draw(performance.now(), 0); };
  addEventListener('themetoggle', () => setTimeout(repaint, 40));
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', start);

  // Lab games and modals call these to free the GPU while they run
  window.__pauseContourBackground = function () { paused = true; canvas.style.display = 'none'; };
  window.__resumeContourBackground = function () { paused = false; canvas.style.display = ''; start(); };
  new MutationObserver(() => {
    const busy = document.body.classList.contains('fe-modal-open') || document.body.classList.contains('game-active') ||
      Boolean(document.querySelector('dialog[open], .fe-overlay.open:not([hidden])'));
    if (busy !== paused) (busy ? window.__pauseContourBackground : window.__resumeContourBackground)();
  }).observe(document.body, { attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open'], subtree: true });

  resize();
  start();
})();
