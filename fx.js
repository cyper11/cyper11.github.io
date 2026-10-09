/* ═══════════════════════════════════════════════════════════════════
   FX LAYER — "SIGNAL CHECK" (pairs with fx.css)
   Additive motion graphics in the site's own instrument language:
   flat colour, 1px lines, hard edges, stepped timing, mono readouts.
   It injects its own nodes and never edits existing markup or styles.

   · Signal palette  four status colours per theme, lerped on flip
   · Tape ruler      right-edge scroll gauge: colour-coded section
                     marks, fisheye ticks round the thumb, readout
   · Wire packets    a packet train rides each section wire as it
                     draws; a colour-coded terminator latches
   · Read-head       the portrait's own scan beam recolours three
                     rows as it passes (fault · data · warning)
   · Probe lock      click empty space → stepped bracket lock + XY
   · Split-flap      the slide / plate counters become a Solari board
   · Blueprint       hover a card → dimension lines measure it
   · Theme sweep     a measuring dial rides the circular reveal —
                     amber heading to light, cyan heading to dark
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Flip any of these to false to switch an effect off */
  const CFG = { ruler: true, wires: true, readHead: true, probe: true, themeSweep: true, flaps: true, blueprint: true };

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MONO = '"IBM Plex Mono", ui-monospace, monospace';

  const $ = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => Array.from(r.querySelectorAll(s));
  const make = (tag, cls, html) => {
    const n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  const pad = (n, w) => String(Math.max(0, Math.round(n))).padStart(w, '0');
  const themeName = () => (root.dataset.theme === 'light' ? 'light' : 'dark');
  const busy = () => body.classList.contains('game-active') || body.classList.contains('fe-modal-open');
  const rgba = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')';

  function bezier(x1, y1, x2, y2) {
    return t => {
      if (t <= 0 || t >= 1) return clamp(t);
      let lo = 0, hi = 1, u = t;
      for (let i = 0; i < 24; i++) {
        const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
        if (Math.abs(x - t) < 1e-4) break;
        if (x < t) lo = u; else hi = u;
        u = (lo + hi) / 2;
      }
      return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    };
  }
  const easeReveal = bezier(0.22, 1, 0.36, 1);   // the curve app.js uses for the circular theme reveal

  /* ─── One shared rAF loop; a job returns false when it is done ── */
  const jobs = new Set();
  let raf = 0;
  function frame(now) {
    raf = 0;
    for (const j of jobs) if (j(now) === false) jobs.delete(j);
    if (jobs.size && !doc.hidden) raf = requestAnimationFrame(frame);
  }
  function addJob(fn) {
    jobs.add(fn);
    if (!raf && !doc.hidden) raf = requestAnimationFrame(frame);
  }
  doc.addEventListener('visibilitychange', () => { if (!doc.hidden && jobs.size && !raf) raf = requestAnimationFrame(frame); });

  /* Run fn once the boot overlay has gone (or at once when it was skipped) */
  function whenBooted(fn) {
    const boot = $('#mx-boot');
    if (!boot || root.classList.contains('mx-skip') || !boot.isConnected) { fn(); return; }
    let done = false;
    const go = d => { if (done) return; done = true; mo.disconnect(); mo2.disconnect(); setTimeout(fn, d); };
    const mo = new MutationObserver(() => { if (boot.classList.contains('mx-out')) go(300); });
    const mo2 = new MutationObserver(() => { if (!boot.isConnected) go(0); });
    mo.observe(boot, { attributes: true, attributeFilter: ['class'] });
    mo2.observe(body, { childList: true });
    setTimeout(() => go(0), 9000);
  }

  /* ═══ Signal palette ═══════════════════════════════════════════════ */
  const PAL = {
    //      OK / power        data link        warning          fault
    dark:  [[213, 251, 120], [46, 230, 255], [255, 170, 40], [255, 46, 99]],
    light: [[74, 138, 20],   [10, 126, 164], [194, 94, 0],   [209, 25, 79]]
  };
  const INK = { dark: [240, 241, 233], light: [26, 29, 23] };
  let cur = PAL[themeName()].map(c => c.slice());
  let ink = INK[themeName()].slice();
  let palFrom = null, palTo = null, inkFrom = null, inkTo = null, palT0 = 0;
  const PAL_MS = 900;
  const palHooks = [];    // every frame the palette moves
  const themeHooks = [];  // once per theme flip

  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const setVars = pal => pal.forEach((c, i) => root.style.setProperty('--fx-' + (i + 1), Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2])));
  const clearVars = () => { for (let i = 1; i <= 4; i++) root.style.removeProperty('--fx-' + i); };

  function palJob(now) {
    const p = clamp((now - palT0) / PAL_MS), e = smooth(p);
    cur = palFrom.map((c, i) => mix(c, palTo[i], e));
    ink = mix(inkFrom, inkTo, e);
    if (p >= 1) { cur = palTo.map(c => c.slice()); ink = inkTo.slice(); clearVars(); }
    else setVars(cur);
    palHooks.forEach(fn => fn());
    return p < 1;
  }

  let sweepReq = null;   // set by the theme button click, consumed by the flip
  new MutationObserver(() => {
    const next = themeName();
    palFrom = cur.map(c => c.slice()); palTo = PAL[next].map(c => c.slice());
    inkFrom = ink.slice(); inkTo = INK[next].slice();
    if (reduce) { cur = palTo; ink = inkTo; clearVars(); palHooks.forEach(fn => fn()); }
    else { palT0 = performance.now(); addJob(palJob); }
    themeHooks.forEach(fn => fn(next));
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  /* ═══ Sections — numbering follows the sidebar, colour = signal code ═ */
  const SECTIONS = [
    ['overview', 'OVERVIEW', 0], ['work', 'PROJECTS', 3], ['experience', 'EXPERIENCE', 1],
    ['credentials', 'CREDENTIALS', 2], ['stack', 'TOOLKIT', 0], ['lab', 'LAB', 3],
    ['activity', 'ACTIVITY', 1], ['learning', 'LEARNING', 2], ['contact', 'CONTACT', 0]
  ].map(([id, label, acc], i) => ({ id, label, acc, n: i + 1, el: doc.getElementById(id) }))
   .filter(s => s.el);
  let active = SECTIONS[0] || null;
  let secDirty = true;
  addEventListener('scroll', () => { secDirty = true; }, { passive: true });
  function readSection() {
    secDirty = false;
    const mid = innerHeight * 0.45;
    for (const s of SECTIONS) if (s.el.getBoundingClientRect().top <= mid) active = s;
      else break;
    if (SECTIONS[0] && SECTIONS[0].el.getBoundingClientRect().top > mid) active = SECTIONS[0];
  }
  const accent = () => cur[active ? active.acc : 0];

  /* ═══ TAPE RULER ═══════════════════════════════════════════════════ */
  function initRuler() {
    if (!fine || !SECTIONS.length) return;
    const cv = make('canvas', 'fx-ruler');
    cv.setAttribute('aria-hidden', 'true');
    body.appendChild(cv);
    const ctx = cv.getContext('2d');
    if (!ctx) { cv.remove(); return; }

    const RW = 48, SPINE = RW - 6, TOP = 30, BOT = 118;   // BOT keeps clear of the chat button
    const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789/#';
    let H = 0, DPR = 1, docH = 0, thumb = -1, running = false, lastId = '', scrT0 = -1e9, booted = false;
    const marks = [];

    function measure() {
      docH = Math.max(1, root.scrollHeight);
      marks.length = 0;
      for (const s of SECTIONS) marks.push({ s, f: clamp((s.el.getBoundingClientRect().top + scrollY) / docH) });
    }
    function fit() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      H = innerHeight;
      cv.width = RW * DPR; cv.height = Math.round(H * DPR);
      measure();
    }

    function readout(now) {
      const txt = pad(active.n, 2) + ' ' + active.label;
      const t = now - scrT0;
      if (reduce || t >= 320) return txt;
      const shown = Math.floor(t / 40) * 2;     // stepped decode, two glyphs per tick
      let out = '';
      for (let i = 0; i < txt.length; i++) {
        out += i < shown || txt[i] === ' ' ? txt[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      return out;
    }

    function draw(now) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, RW, H);
      const L = H - TOP - BOT;
      if (L < 160 || !active) return;
      const tTop = TOP + thumb * L;
      const tH = Math.max(10, (innerHeight / docH) * L);
      const tC = tTop + tH / 2;
      const ac = accent();

      // spine
      ctx.fillStyle = rgba(ink, 0.16);
      ctx.fillRect(SPINE, TOP, 1, L + 1);

      // graduations every 5px — mid every 25, major every 50 — fisheye round the thumb
      for (let i = 0, y = TOP; y <= TOP + L + 0.1; i++, y += 5) {
        const major = i % 10 === 0, mid = i % 5 === 0;
        const d = (y - tC) / 44, k = Math.exp(-d * d);
        const len = (major ? 8 : mid ? 5 : 3) + k * (major ? 5 : 7);
        ctx.fillStyle = rgba(ink, Math.min(0.95, (major ? 0.4 : mid ? 0.28 : 0.16) + k * 0.5));
        ctx.fillRect(SPINE - len, Math.round(y), len, 1);
      }

      // section marks, colour-coded, numbered like the sidebar
      ctx.font = '500 8px ' + MONO;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      for (const m of marks) {
        const y = Math.round(TOP + m.f * L), on = m.s === active, c = cur[m.s.acc];
        ctx.fillStyle = rgba(c, on ? 1 : 0.75);
        ctx.fillRect(SPINE - 12, y, 12, on ? 2 : 1);
        ctx.fillStyle = on ? rgba(c, 1) : rgba(ink, 0.42);
        ctx.fillText(pad(m.s.n, 2), SPINE - 17, y + 0.5);
      }

      // thumb: viewport window + pointer
      ctx.fillStyle = rgba(ac, 1);
      ctx.fillRect(SPINE + 2, Math.round(tTop), 2, Math.round(tH));
      ctx.fillRect(SPINE - 15, Math.round(tC), 15, 1);

      // vertical readout beside the thumb
      ctx.save();
      ctx.font = '500 9px ' + MONO;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
      const txt = readout(now);
      const w = ctx.measureText(txt).width;
      let y0 = tC + 14;
      if (y0 + w > TOP + L) y0 = tC - 14 - w;
      ctx.translate(8, Math.round(y0));
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(ac, 1);
      ctx.fillText(txt, 0, 0);
      ctx.restore();
    }

    function tick(now) {
      if (busy()) { running = false; return false; }
      if (secDirty) readSection();
      if (root.scrollHeight !== docH) measure();
      if (active && active.id !== lastId) { lastId = active.id; scrT0 = now; }
      // the hero already has its own HUD + SCROLL cue: the gauge comes in once you leave it
      if (booted) cv.classList.toggle('fx-on', scrollY > innerHeight * 0.6);
      const target = clamp(scrollY / docH);
      thumb = thumb < 0 || reduce ? target : thumb + (target - thumb) * 0.24;
      draw(now);
      if (Math.abs(target - thumb) > 0.00004 || now - scrT0 < 340) return true;
      running = false;
      return false;
    }
    const wake = () => { if (running || busy()) return; running = true; addJob(tick); };

    addEventListener('scroll', wake, { passive: true });
    addEventListener('resize', () => { fit(); wake(); }, { passive: true });
    addEventListener('load', () => { measure(); wake(); });
    palHooks.push(wake);
    fit();
    whenBooted(() => { booted = true; wake(); });
  }

  /* ═══ WIRE PACKETS ═════════════════════════════════════════════════ */
  function initWires() {
    $$('.section-head').forEach(head => {
      const w = make('span', 'fx-wire',
        '<i class="fx-pk"></i><i class="fx-pk b"></i><i class="fx-pk c"></i><i class="fx-end"></i><i class="fx-end b"></i>');
      w.setAttribute('aria-hidden', 'true');
      head.appendChild(w);

      let ran = false, cool = 0;
      const fire = () => { if (ran) return; ran = true; w.classList.add('fx-go'); };
      if (head.classList.contains('mx-in')) fire();
      else {
        const mo = new MutationObserver(() => { if (head.classList.contains('mx-in')) { mo.disconnect(); fire(); } });
        mo.observe(head, { attributes: true, attributeFilter: ['class'] });
      }

      // hovering the head sends one more packet down the line
      if (fine && !reduce) {
        head.addEventListener('pointerenter', () => {
          const now = performance.now();
          if (!ran || now < cool) return;
          cool = now + 2600;
          w.classList.remove('fx-re');
          void w.offsetWidth;
          w.classList.add('fx-re');
        });
      }
    });
  }

  /* ═══ PORTRAIT READ-HEAD ═══════════════════════════════════════════ */
  // motion.js already sweeps a scan beam down the LED portrait (dots swell as
  // it passes). This rides the same clock and recolours three rows under the
  // beam — trailing fault, centre data, leading warning — like an RGB read-head.
  function initReadHead() {
    if (reduce) return;
    const host = $('.mx-portrait');
    const dots = host && $('.mx-dots', host);
    if (!dots) return;
    const cv = make('canvas', 'fx-scan');
    cv.setAttribute('aria-hidden', 'true');
    dots.insertAdjacentElement('afterend', cv);
    const ctx = cv.getContext('2d');
    if (!ctx) { cv.remove(); return; }

    const BANDS = [[-11, -4, 3], [-4, 3, 1], [3, 9, 2]];   // css px from beam centre → palette index
    let visible = false, running = false;

    function tick(now) {
      if (!visible || busy()) { ctx.clearRect(0, 0, cv.width, cv.height); running = false; return false; }
      const W = dots.width, Hd = dots.height;
      if (!W || !Hd) return true;
      if (cv.width !== W || cv.height !== Hd) { cv.width = W; cv.height = Hd; }
      const dpr = Math.min(1.5, devicePixelRatio || 1);       // motion.js caps the dots canvas the same way
      const beam = ((now / 4500) % 1) * (Hd / dpr + 200) - 100;
      ctx.clearRect(0, 0, W, Hd);
      for (const [a, b, ci] of BANDS) {
        const y0 = Math.round((beam + a) * dpr), y1 = Math.round((beam + b) * dpr);
        if (y1 <= 0 || y0 >= Hd) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y0, W, y1 - y0);
        ctx.clip();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(dots, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = rgba(cur[ci], 1);
        ctx.fillRect(0, y0, W, y1 - y0);
        ctx.restore();
      }
      return true;
    }

    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; addJob(tick); }
    }).observe(host);
    themeHooks.push(() => { if (visible && !running) { running = true; addJob(tick); } });
  }

  /* ═══ SPLIT-FLAP COUNTERS ══════════════════════════════════════════ */
  // The counters stay exactly as they are (other scripts write and read their
  // text); they are made transparent and a flap board is laid over them.
  // Digits roll forward through the drum one flap at a time, like a Solari board.
  function initFlaps() {
    const FLAP_MS = 70;
    const isDigit = c => c >= '0' && c <= '9';
    $$('#work .carousel-counter, .lab-carousel-counter, .mx-shelf-bar b').forEach(host => {
      const ov = doc.createElement('fx-board');
      ov.setAttribute('aria-hidden', 'true');
      ov.style.setProperty('--fx-fd', FLAP_MS + 'ms');
      host.after(ov);
      let tiles = [], shown = '', seen = false;

      function syncStyle() {
        host.classList.remove('fx-flap-host');
        const cs = getComputedStyle(host);
        ov.style.fontFamily = cs.fontFamily;
        ov.style.fontSize = cs.fontSize;
        ov.style.fontWeight = cs.fontWeight;
        ov.style.letterSpacing = cs.letterSpacing;
        ov.style.color = cs.color;
        host.classList.add('fx-flap-host');
      }
      function place() {
        if (!host.offsetParent || !host.offsetWidth) { ov.style.display = 'none'; return; }
        ov.style.display = '';
        ov.style.left = (host.offsetLeft - 2) + 'px';
        ov.style.top = Math.round(host.offsetTop + (host.offsetHeight - ov.offsetHeight) / 2) + 'px';
      }
      function build(text) {
        ov.textContent = '';
        tiles = [];
        for (const ch of text) {
          if (isDigit(ch)) {
            const t = make('fx-flap', '', '<fx-s></fx-s><fx-t></fx-t><fx-o></fx-o><fx-n></fx-n>');
            const k = { el: t, s: t.children[0], ot: t.children[1], ob: t.children[2], nb: t.children[3], d: +ch, want: +ch, timer: 0 };
            k.s.textContent = ch;
            tiles.push(k);
            ov.appendChild(t);
          } else {
            tiles.push(null);
            const c = ov.appendChild(doc.createElement('fx-c'));
            if (ch === ' ') c.className = 'sp'; else c.textContent = ch;
          }
        }
        shown = text;
      }
      function step(k) {
        k.timer = 0;
        if (k.d === k.want) return;
        const from = k.d, to = (k.d + 1) % 10;
        k.d = to;
        k.ot.textContent = k.ob.textContent = from;
        k.s.textContent = k.nb.textContent = to;
        k.el.classList.remove('go');
        void k.el.offsetWidth;
        k.el.classList.add('go');
        k.timer = setTimeout(() => step(k), FLAP_MS);
      }
      function roll(k, digit) {
        k.want = digit;
        if (reduce) { k.d = digit; k.s.textContent = digit; return; }
        if (!k.timer) step(k);
      }
      function update(text, animate) {
        const same = text.length === shown.length && [...text].every((c, i) => isDigit(c) === !!tiles[i]);
        if (!same) { tiles.forEach(k => k && clearTimeout(k.timer)); build(text); requestAnimationFrame(place); return; }
        [...text].forEach((c, i) => {
          const k = tiles[i];
          if (!k) return;
          if (animate) roll(k, +c);
          else { clearTimeout(k.timer); k.timer = 0; k.d = k.want = +c; k.s.textContent = c; }
        });
        shown = text;
      }

      syncStyle();
      build(host.textContent);
      place();
      new MutationObserver(() => {
        const t = host.textContent;
        if (t !== shown) update(t, seen);
      }).observe(host, { childList: true, characterData: true, subtree: true });

      // the first time it comes into view the board spins up from zero
      new IntersectionObserver((entries, o) => {
        if (!entries[0].isIntersecting) return;
        o.disconnect();
        seen = true;
        if (reduce) return;
        tiles.forEach((k, i) => {
          if (!k) return;
          const want = k.want;
          k.d = k.want = 0;
          k.s.textContent = '0';
          setTimeout(() => roll(k, want), i * 90);
        });
      }, { threshold: 0.6 }).observe(host);

      if (window.ResizeObserver) {
        const ro = new ResizeObserver(place);
        ro.observe(host);
        if (host.parentElement) ro.observe(host.parentElement);
      }
      addEventListener('resize', place, { passive: true });
      addEventListener('load', () => { syncStyle(); place(); });
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(place);
      themeHooks.push(() => setTimeout(() => { syncStyle(); place(); }, 0));
    });
  }

  /* ═══ PROBE LOCK + THEME SWEEP (one overlay canvas) ════════════════ */
  function initOverlay() {
    const cv = make('canvas', 'fx-fx');
    cv.setAttribute('aria-hidden', 'true');
    body.appendChild(cv);
    const ctx = cv.getContext('2d');
    if (!ctx) { cv.remove(); return; }

    let W = 0, H = 0, DPR = 1;
    const fit = () => {
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    };
    fit();
    addEventListener('resize', fit, { passive: true });

    const locks = [];
    let sweep = null, running = false;
    const wake = () => { if (running) return; running = true; addJob(tick); };

    // stepped lock-on: the brackets jump inwards in four frames, hold, blink out
    const STEPS = [30, 21, 14, 10];
    function drawLock(k, t) {
      if (t > 560 && Math.floor((t - 560) / 60) % 2 === 0) return;
      const s = STEPS[Math.min(3, Math.floor(t / 45))];
      const x = Math.round(k.x) + 0.5, y = Math.round(k.y) + 0.5, arm = 6;
      ctx.strokeStyle = rgba(k.col, 1);
      ctx.fillStyle = rgba(k.col, 1);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const cx = x + sx * s, cy = y + sy * s;
        ctx.moveTo(cx, cy - sy * arm); ctx.lineTo(cx, cy); ctx.lineTo(cx - sx * arm, cy);
      }
      ctx.stroke();
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      if (t < 180) return;

      // callout: leader line, then the readout types in
      ctx.font = '500 10px ' + MONO;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '1px';
      const tw = ctx.measureText(k.text).width;
      const dir = x + s + 14 + tw + 12 > W ? -1 : 1;
      const lx = x + dir * s, ly = y - s, ex = lx + dir * 10, ey = ly - 10;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx, ly); ctx.lineTo(ex, ey); ctx.lineTo(ex + dir * (tw + 8), ey);
      ctx.stroke();
      const n = Math.min(k.text.length, Math.floor((t - 180) / 14));
      ctx.textBaseline = 'bottom';
      ctx.textAlign = dir > 0 ? 'left' : 'right';
      ctx.fillText(k.text.slice(0, n), ex + dir * 4, ey - 3);
    }

    // a measuring dial on the edge of the circular reveal
    function drawSweep(sw, now) {
      const p = clamp((now - sw.t0) / sw.dur);
      const r = sw.R * easeReveal(p);
      if (r < 4) return;
      ctx.strokeStyle = rgba(sw.col, 1);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sw.x, sw.y, r - 1, 0, 6.2832); ctx.stroke();
      const n = Math.round(clamp((6.2832 * r) / 9, 48, 420) / 10) * 10;   // ticks ≈ 9px apart, majors every 10
      const rot = p * 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * 6.2832, ca = Math.cos(a), sa = Math.sin(a);
        const len = i % 10 === 0 ? 14 : i % 5 === 0 ? 9 : 5;
        ctx.moveTo(sw.x + ca * (r - 3), sw.y + sa * (r - 3));
        ctx.lineTo(sw.x + ca * (r - 3 - len), sw.y + sa * (r - 3 - len));
      }
      ctx.stroke();
      if (p >= 1) sweep = null;
    }

    function tick(now) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (busy()) { locks.length = 0; sweep = null; running = false; return false; }
      for (let i = locks.length - 1; i >= 0; i--) {
        const t = now - locks[i].t0;
        if (t > 800) locks.splice(i, 1); else drawLock(locks[i], t);
      }
      if (bp) drawBlueprint(now);
      if (sweep && now >= sweep.t0) drawSweep(sweep, now);
      if (locks.length || sweep || bp) return true;
      running = false;
      return false;
    }

    /* Blueprint — hover a card and it gets dimensioned like a technical
       drawing: extension lines, slash-terminated dimension lines growing
       out from the centre, and a size readout that counts up with them. */
    let bp = null, bpTimer = 0;
    const BP_SEL = '#work .work-feature, #work .work-side article, #lab .lab-card, #credentials .badge-card, #credentials .cert-card, #stack .toolkit-card, #learning .learn-card, #contact .contact-panel';
    function bpColor(el) {
      const sec = el.closest('section');
      if (sec && sec.id === 'work') return '#0b0c0a';          // ink on the lime sheet
      const s = SECTIONS.find(x => x.el === sec);
      return rgba(cur[s ? s.acc : 0], 1);
    }
    function bpBg(el) {
      const sec = el.closest('section') || root;
      return getComputedStyle(sec).getPropertyValue('--bg').trim() || (themeName() === 'light' ? '#f5f4f0' : '#111310');
    }
    function slash(x, y) { ctx.moveTo(x - 4, y + 4); ctx.lineTo(x + 4, y - 4); }
    function drawBlueprint(now) {
      let a = 1;
      if (bp.out) { a = 1 - clamp((now - bp.tOut) / 160); if (a <= 0) { bp = null; return; } }
      const r = bp.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || !r.width) return;
      const p = clamp((now - bp.t0) / 280), e = 1 - Math.pow(1 - p, 3);
      const col = bp.col, OFF = 16;
      ctx.globalAlpha = a;
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.font = '500 10px ' + MONO;
      if ('letterSpacing' in ctx) ctx.letterSpacing = '1px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const L = Math.round(r.left) + 0.5, R = Math.round(r.right) - 0.5, T = Math.round(r.top) + 0.5, B = Math.round(r.bottom) - 0.5;

      // width: above the card (below it when there is no room)
      const up = r.top - OFF > 14, yD = up ? T - OFF : B + OFF, sy = up ? -1 : 1, ey = up ? T : B;
      const cx = (L + R) / 2, hw = (R - L) / 2 * e;
      ctx.beginPath();
      ctx.moveTo(L, ey + sy * 3); ctx.lineTo(L, yD + sy * 5);
      ctx.moveTo(R, ey + sy * 3); ctx.lineTo(R, yD + sy * 5);
      ctx.moveTo(cx - hw, yD); ctx.lineTo(cx + hw, yD);
      if (e > 0.98) { slash(L, yD); slash(R, yD); }
      ctx.stroke();

      // height: right of the card (left of it when the ruler is there)
      const rt = r.right + OFF < W - 60, xD = rt ? R + OFF : L - OFF, sx = rt ? 1 : -1, ex = rt ? R : L;
      const cy = (T + B) / 2, hh = (B - T) / 2 * e;
      ctx.beginPath();
      ctx.moveTo(ex + sx * 3, T); ctx.lineTo(xD + sx * 5, T);
      ctx.moveTo(ex + sx * 3, B); ctx.lineTo(xD + sx * 5, B);
      ctx.moveTo(xD, cy - hh); ctx.lineTo(xD, cy + hh);
      if (e > 0.98) { slash(xD, T); slash(xD, B); }
      ctx.stroke();

      // readouts count up with the lines
      if (p > 0.25) {
        const wTxt = String(Math.round(r.width * e)), hTxt = String(Math.round(r.height * e));
        const ww = ctx.measureText(wTxt).width;
        ctx.fillStyle = bp.bg; ctx.fillRect(cx - ww / 2 - 6, yD - 7, ww + 12, 14);
        ctx.fillStyle = col; ctx.fillText(wTxt, cx, yD + 0.5);
        ctx.save();
        ctx.translate(xD, cy);
        ctx.rotate(-Math.PI / 2);
        const hw2 = ctx.measureText(hTxt).width;
        ctx.fillStyle = bp.bg; ctx.fillRect(-hw2 / 2 - 6, -7, hw2 + 12, 14);
        ctx.fillStyle = col; ctx.fillText(hTxt, 0, 0.5);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    if (CFG.blueprint && fine && !reduce) {
      const release = () => { if (bp && !bp.out) { bp.out = true; bp.tOut = performance.now(); wake(); } };
      addEventListener('pointerover', e => {
        if (e.pointerType !== 'mouse' || busy()) return;
        const el = e.target.closest ? e.target.closest(BP_SEL) : null;
        if (bp && el === bp.el && !bp.out) return;
        clearTimeout(bpTimer);
        if (bp && el !== bp.el) release();
        if (!el) return;
        bpTimer = setTimeout(() => {
          bp = { el, t0: performance.now(), out: false, col: bpColor(el), bg: bpBg(el) };
          wake();
        }, 160);
      }, { passive: true });
      doc.addEventListener('mouseout', e => { if (!e.relatedTarget) { clearTimeout(bpTimer); release(); } });
      themeHooks.push(() => { if (bp) { bp.col = bpColor(bp.el); bp.bg = bpBg(bp.el); } });
    }

    /* Probe lock — only on empty space, never on controls, media or canvases */
    if (CFG.probe && fine && !reduce) {
      const SKIP = 'a,button,input,textarea,select,label,summary,[role="button"],[contenteditable],[tabindex],canvas,img,video,iframe,dialog,.sidebar';
      addEventListener('pointerdown', e => {
        if (e.button !== 0 || e.pointerType !== 'mouse' || busy()) return;
        if (e.target.closest && e.target.closest(SKIP)) return;
        if (locks.length > 3) locks.shift();
        locks.push({
          x: e.clientX, y: e.clientY, t0: performance.now(), col: accent().slice(),
          text: 'X ' + pad(e.clientX + scrollX, 4) + '  Y ' + pad(e.clientY + scrollY, 4)
        });
        wake();
      }, { passive: true });
    }

    /* Theme sweep — the dial wears the colour of where it is heading:
       amber going to light (sunrise), cyan going to dark (nightfall) */
    const btn = $('#theme-toggle');
    if (btn && CFG.themeSweep && !reduce && doc.startViewTransition) {
      btn.addEventListener('click', () => {
        if (busy()) return;
        const r = btn.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        sweepReq = { x, y, R: Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) };
        cv.classList.add('fx-vt');
        setTimeout(() => cv.classList.remove('fx-vt'), 1400);
        setTimeout(() => { sweepReq = null; }, 900);
      }, true);   // capture: runs before app.js starts the view transition

      themeHooks.push(next => {
        const q = sweepReq;
        if (!q) return;
        sweepReq = null;
        sweep = { x: q.x, y: q.y, R: q.R + 20, t0: performance.now() + 26, dur: 440, col: next === 'light' ? PAL.light[2] : PAL.dark[1] };
        wake();
      });
    }
  }

  /* ═══ boot ═════════════════════════════════════════════════════════ */
  if (CFG.ruler) initRuler();
  if (CFG.wires) initWires();
  if (CFG.readHead) initReadHead();
  if (CFG.flaps) initFlaps();
  if (CFG.probe || CFG.themeSweep || CFG.blueprint) initOverlay();
})();
