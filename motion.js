/* ═══════════════════════════════════════════════════════════════════
   MOTION v3 — "FIELD OPS // SIGNAL"
   Boot sequence · LED-matrix portrait · name glitch · oscilloscope ·
   hazard tapes · manifesto scrub · rolling counters
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, r = document) => r.querySelector(sel);
  const $$ = (sel, r = document) => Array.from(r.querySelectorAll(sel));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const css = name => getComputedStyle(root).getPropertyValue(name).trim();

  root.classList.add('mx-js');
  const hero = $('.mx-hero');
  const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, speed: 0, inHero: false };

  /* ─── Boot sequence ───────────────────────────────────────────── */
  const boot = $('#mx-boot');
  const bootDone = new Promise(resolve => {
    if (!boot || root.classList.contains('mx-skip')) { resolve(); return; }
    root.classList.add('mx-booting');
    const log = $('.mx-boot-log', boot);
    const num = $('.mx-boot-n span', boot);
    const bar = $('.mx-boot-bar', boot);
    const LINES = [
      ['C1 FIELD BIOS v26.10', ''],
      ['CPU ............ ', 'ENGINEER x1 @ FULL SEND'],
      ['MEMORY TEST .... ', 'OK'],
      ['MULTIMETER ..... ', 'CALIBRATED'],
      ['NIC LINK ....... ', 'UP 1000Mbps'],
      ['FRU INVENTORY .. ', 'READY'],
      ['GPS FIX ........ ', '14.38N 120.88E'],
      ['MOUNT /cyper.ivan', '']
    ];
    let skipped = false;
    const start = performance.now();
    const DUR = 1700;
    let shown = 0;
    const step = now => {
      if (skipped) return;
      const p = clamp((now - start) / DUR);
      const e = 1 - Math.pow(1 - p, 3);
      num.textContent = String(Math.round(e * 100)).padStart(3, '0');
      bar.style.setProperty('--p', e.toFixed(3));
      const want = Math.min(LINES.length, Math.floor(p * (LINES.length + 1)));
      while (shown < want) {
        const [k, v] = LINES[shown++];
        log.innerHTML += (shown === 1 ? '<b>' + k + '</b>' : k + (v ? '<span class="mx-ok">' + v + '</span>' : '')) + '\n';
      }
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(exit, 160);
    };
    const exit = () => {
      if (boot.classList.contains('mx-out')) return;
      const pix = $('.mx-boot-pix', boot);
      const size = innerWidth < 600 ? 48 : 72;
      const cols = Math.ceil(innerWidth / size), rows = Math.ceil(innerHeight / size);
      pix.style.gridTemplateColumns = `repeat(${cols},1fr)`;
      pix.style.gridTemplateRows = `repeat(${rows},1fr)`;
      const frag = document.createDocumentFragment();
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = document.createElement('i');
        // dissolve sweeps diagonally with noise, like a panel losing power
        const d = ((c / cols) * 0.35 + (r / rows) * 0.2 + Math.random() * 0.3);
        i.style.setProperty('--d', d.toFixed(3) + 's');
        frag.appendChild(i);
      }
      pix.appendChild(frag);
      boot.classList.add('mx-out');
      root.classList.remove('mx-booting');
      try { sessionStorage.setItem('mx-booted', '1'); } catch (_) {}
      setTimeout(resolve, 260);
      setTimeout(() => boot.remove(), 1200);
    };
    boot.addEventListener('click', () => { skipped = true; exit(); });
    addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter') { skipped = true; exit(); removeEventListener('keydown', onKey); }
    });
    requestAnimationFrame(step);
  });

  if (!hero) return;

  /* ─── Live clock with seconds ─────────────────────────────────── */
  const clockEl = $('#mx-clock');
  if (clockEl) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const t = () => { clockEl.textContent = fmt.format(new Date()); };
    t(); setInterval(t, 1000);
  }

  /* ─── Name: split into letters, entrance, random glitch ──────── */
  const name = $('.mx-name');
  const chars = [];
  if (name) {
    let i = 0;
    $$('.mx-line', name).forEach(line => {
      const tail = Array.from(line.childNodes).filter(n => n.nodeType === 1);
      const text = Array.from(line.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
      line.textContent = '';
      for (const ch of text) {
        const outer = document.createElement('span');
        outer.className = 'mx-ch';
        outer.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.textContent = ch;
        outer.style.setProperty('--i', i++);
        outer.appendChild(inner);
        line.appendChild(outer);
        chars.push(inner);
      }
      tail.forEach(n => line.appendChild(n));
    });
    if (!reduce) {
      name.classList.add('mx-armed');
      bootDone.then(() => requestAnimationFrame(() => name.classList.add('mx-go')));
      const GL = 'ΞΛ#Ø0/<>█▓╳Ж';
      const glitch = () => {
        if (!document.hidden && heroVisible) {
          const n = 1 + (Math.random() < 0.35);
          for (let k = 0; k < n; k++) {
            const c = chars[(Math.random() * chars.length) | 0];
            const orig = c.textContent;
            if (c.parentNode.classList.contains('mx-glitch')) continue;
            c.parentNode.classList.add('mx-glitch');
            c.textContent = GL[(Math.random() * GL.length) | 0];
            setTimeout(() => { c.textContent = orig; c.parentNode.classList.remove('mx-glitch'); }, 70 + Math.random() * 110);
          }
          dots && dots.glitch();
        }
        setTimeout(glitch, 1400 + Math.random() * 2600);
      };
      bootDone.then(() => setTimeout(glitch, 1800));
    }
  }

  /* ─── Pointer tracking (hero-relative) ────────────────────────── */
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; if (heroVisible) kick(); }).observe(hero);
  if (finePointer && !reduce) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (pointer.inHero) { pointer.vx = x - pointer.x; pointer.vy = y - pointer.y; }
      pointer.x = x; pointer.y = y; pointer.inHero = true;
      pointer.speed = Math.min(60, pointer.speed + Math.hypot(pointer.vx, pointer.vy) * 0.25);
      kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.inHero = false; pointer.x = pointer.y = -1e4; kick(); });
  }

  /* ─── LED-matrix portrait ─────────────────────────────────────── */
  const portrait = $('.mx-portrait', hero);
  const dots = portrait ? createDots(portrait) : null;

  function createDots(host) {
    const canvas = $('.mx-dots', host);
    const img = $('.mx-portrait-src', host);
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0, DPR = 1, cell = 7, ox = 0, oy = 0, cols = 0, rows = 0;
    let cells = null;          // Float32Array [x, y, darkness, rowIndex]
    let color = '#d5fb78';
    let introStart = 0;
    let glitchUntil = 0, glitchRows = new Map();
    let ready = false;

    let light = false;
    function readColor() {
      color = css('--mx-dot') || '#d5fb78';
      const was = light;
      light = root.dataset.theme === 'light';
      if (was !== light && ready) sample();
    }

    function layout() {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      DPR = Math.min(1.5, devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cell = Math.max(5, Math.min(9, Math.round(Math.min(W, H) / 105)));
      sample();
    }

    function sample() {
      if (!img.naturalWidth) return;
      // fit the (square, white-backed) photo to the host height, anchored right
      const size = Math.min(H * 1.02, W * (innerWidth < 850 ? 1.1 : 1.15));
      ox = W - size + (innerWidth < 850 ? (size - W) / 2 + W * 0.06 : size * 0.05);
      oy = H - size;
      cols = Math.floor(size / cell); rows = Math.floor(size / cell);
      const off = document.createElement('canvas');
      off.width = cols; off.height = rows;
      const octx = off.getContext('2d', { willReadFrequently: true });
      octx.drawImage(img, 0, 0, cols, rows);
      const data = octx.getImageData(0, 0, cols, rows).data;
      const lum = new Float32Array(cols * rows);
      for (let i = 0; i < lum.length; i++) {
        lum[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
      }
      // the photo sits on a white backdrop: flood-fill it away from the edges
      const bg = new Uint8Array(cols * rows);
      const stack = [];
      const seed = i => { if (!bg[i] && lum[i] > 0.9) { bg[i] = 1; stack.push(i); } };
      for (let x = 0; x < cols; x++) { seed(x); seed((rows - 1) * cols + x); }
      for (let y = 0; y < rows; y++) { seed(y * cols); seed(y * cols + cols - 1); }
      while (stack.length) {
        const i = stack.pop(), x = i % cols;
        if (x > 0) seed(i - 1);
        if (x < cols - 1) seed(i + 1);
        if (i >= cols) seed(i - cols);
        if (i < cols * (rows - 1)) seed(i + cols);
      }
      const list = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        if (bg[i]) continue;
        // dark theme: lit pixels → big LEDs (screen). light theme: ink halftone (print).
        // a floor keeps the whole silhouette readable either way
        const d = 0.14 + 0.86 * (light ? Math.pow(1 - lum[i], 1.1) : Math.pow(lum[i], 1.35));
        list.push(ox + x * cell + cell / 2, oy + y * cell + cell / 2, d, y);
      }
      cells = new Float32Array(list);
      ready = true;
    }

    function glitch() {
      glitchUntil = performance.now() + 160 + Math.random() * 140;
      glitchRows.clear();
      const bands = 2 + ((Math.random() * 4) | 0);
      for (let b = 0; b < bands; b++) {
        const r0 = (Math.random() * rows) | 0, h = 2 + ((Math.random() * 8) | 0), s = (Math.random() - 0.5) * cell * 10;
        for (let r = r0; r < r0 + h; r++) glitchRows.set(r, s);
      }
      kick();
    }

    function draw(now) {
      if (!ready) return false;
      ctx.clearRect(0, 0, W, H);
      const intro = reduce ? 1 : clamp((now - introStart) / 1500);
      const glitching = now < glitchUntil;
      // scan beam sweeps top→bottom every ~4.5s
      const beam = reduce ? -1e4 : ((now / 4500) % 1) * (H + 200) - 100;
      const px = pointer.x - (host.offsetLeft || 0), py = pointer.y;
      const R = 150, R2 = R * R;
      const live = pointer.inHero;
      let animating = intro < 1 || glitching;
      const passes = glitching ? 3 : 1;
      for (let pass = 0; pass < passes; pass++) {
        let shift = 0;
        if (passes === 3) {
          ctx.globalCompositeOperation = pass === 2 ? 'source-over' : 'lighter';
          ctx.fillStyle = pass === 0 ? 'rgba(255,46,99,.75)' : pass === 1 ? 'rgba(46,230,255,.7)' : color;
          shift = pass === 0 ? -cell * 0.9 : pass === 1 ? cell * 0.9 : 0;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = color;
        }
        for (let i = 0; i < cells.length; i += 4) {
          let x = cells[i], y = cells[i + 1];
          const d = cells[i + 2], row = cells[i + 3];
          // intro: rows power on from the bottom, with a little scatter
          const rowT = clamp(intro * 1.6 - (1 - row / rows) * 0.6);
          if (rowT <= 0) continue;
          let s = d * cell * 0.9 * rowT;
          if (rowT < 1) x += (1 - rowT) * ((row * 37 + i) % 23 - 11) * 2;
          const db = Math.abs(y - beam);
          if (db < 26) s *= 1 + (1 - db / 26) * 0.45;
          if (live) {
            const dx = x - px, dy = y - py, q = dx * dx + dy * dy;
            if (q < R2) {
              const f = 1 - Math.sqrt(q) / R, push = f * f * 26;
              const inv = 1 / (Math.sqrt(q) || 1);
              x += dx * inv * push; y += dy * inv * push;
              s *= 1 + f * 0.6;
            }
          }
          if (glitching) { const g = glitchRows.get(row); if (g) x += g; }
          x += shift;
          const h = s * 0.5;
          ctx.fillRect(x - h, y - h, s, s);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      return animating || live || !reduce; // beam keeps it alive while visible
    }

    readColor();
    const onReady = () => { layout(); introStart = performance.now(); kick(); };
    if (img.complete && img.naturalWidth) bootDone.then(onReady);
    else img.addEventListener('load', () => bootDone.then(onReady), { once: true });
    let rs = 0;
    addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => { layout(); kick(); }, 120); });
    addEventListener('themetoggle', () => setTimeout(() => { readColor(); kick(); }, 30));
    new MutationObserver(() => { readColor(); kick(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return { draw, glitch };
  }

  /* ─── Oscilloscope (mains 230V · 60Hz, reacts to pointer speed) ─ */
  const scope = $('.mx-scope canvas', hero);
  const scopeCtx = scope ? scope.getContext('2d') : null;
  let scopeColor = css('--lime');
  addEventListener('themetoggle', () => setTimeout(() => { scopeColor = css('--lime'); }, 30));
  function drawScope(now) {
    if (!scopeCtx) return;
    const w = scope.clientWidth, h = scope.clientHeight, dpr = Math.min(1.5, devicePixelRatio || 1);
    if (scope.width !== Math.round(w * dpr)) { scope.width = Math.round(w * dpr); scope.height = Math.round(h * dpr); }
    scopeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scopeCtx.clearRect(0, 0, w, h);
    const amp = 6 + pointer.speed * 0.45;
    const t = now / 1000;
    scopeCtx.lineWidth = 1.25;
    scopeCtx.strokeStyle = scopeColor;
    scopeCtx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const u = x / w;
      const env = Math.sin(u * Math.PI);
      let y = Math.sin(u * 38 - t * 6) * amp * env;
      y += Math.sin(u * 140 + t * 17) * pointer.speed * 0.08 * env;
      if (pointer.inHero) {
        const dx = (x - pointer.x) / 90;
        y += Math.exp(-dx * dx) * Math.sin(t * 40) * (8 + pointer.speed * 0.4);
      }
      x ? scopeCtx.lineTo(x, h * 0.6 + y) : scopeCtx.moveTo(x, h * 0.6 + y);
    }
    scopeCtx.stroke();
    scopeCtx.globalAlpha = 0.18;
    scopeCtx.lineWidth = 4;
    scopeCtx.stroke();
    scopeCtx.globalAlpha = 1;
    pointer.speed *= 0.92;
  }

  /* ─── One rAF loop for the hero; sleeps when offscreen ────────── */
  let running = false;
  function frame(now) {
    if (!heroVisible || document.hidden) { running = false; return; }
    if (dots) dots.draw(now);
    drawScope(now);
    if (reduce) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function kick() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  kick();

  /* ─── Hazard tapes: second crossing tape ──────────────────────── */
  const spec = $('.specialties');
  if (spec) {
    const track = $('.specialties-track', spec);
    spec.classList.add('mx-tapes');
    const a = document.createElement('div');
    a.className = 'mx-tape mx-tape-a';
    track.replaceWith(a);
    a.appendChild(track);
    const b = document.createElement('div');
    b.className = 'mx-tape mx-tape-b';
    b.setAttribute('aria-hidden', 'true');
    const clone = track.cloneNode(true);
    b.appendChild(clone);
    spec.prepend(b);
    if (!reduce) new IntersectionObserver(([e]) => {
      clone.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
    }, { threshold: 0.05 }).observe(spec);
  }

  /* ─── Scroll: hero split + manifesto scrub ────────────────────── */
  const man = $('.mx-manifesto');
  let words = [], pixels = [], pixOrder = [], manText = null;
  if (man) {
    manText = $('.mx-man-text', man);
    // wrap words (keeps <em> as highlighted words)
    const out = document.createDocumentFragment();
    Array.from(manText.childNodes).forEach(n => {
      const em = n.nodeType === 1;
      n.textContent.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) { out.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'mx-mw' + (em ? ' mx-em' : '');
        w.textContent = p;
        out.appendChild(w);
        words.push(w);
      });
    });
    manText.setAttribute('aria-label', manText.textContent.replace(/\s+/g, ' ').trim());
    manText.textContent = '';
    manText.appendChild(out);
    words.forEach(w => w.setAttribute('aria-hidden', 'true'));

    if (!reduce) {
      const grid = $('.mx-man-pix', man);
      const build = () => {
        grid.textContent = '';
        const stick = $('.mx-man-stick', man);
        const size = innerWidth < 600 ? 44 : 80;
        const cols = Math.ceil(stick.clientWidth / size), rows = Math.ceil(stick.clientHeight / size);
        grid.style.gridTemplateColumns = `repeat(${cols},1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows},1fr)`;
        pixels = [];
        for (let i = 0; i < cols * rows; i++) { const el = document.createElement('i'); grid.appendChild(el); pixels.push(el); }
        // fill from the bottom-right corner outward, with noise (stair-step look)
        pixOrder = pixels.map((el, i) => {
          const c = i % cols, r = (i / cols) | 0;
          return { el, k: (cols - c) / cols * 0.55 + (rows - r) / rows * 0.45 + Math.random() * 0.22 };
        }).sort((p, q) => p.k - q.k).map(p => p.el);
      };
      build();
      let rb = 0;
      addEventListener('resize', () => { clearTimeout(rb); rb = setTimeout(build, 150); });
    }

    // Fit the motto: largest size where it stays inside ~60% of the screen
    // and no single word is wider than the column.
    const stick = $('.mx-man-stick', man);
    const fit = () => {
      const avail = stick.clientHeight * (innerWidth < 850 ? 0.5 : 0.6);
      let lo = 24, hi = 240;
      for (let k = 0; k < 14; k++) {
        const mid = (lo + hi) / 2;
        manText.style.setProperty('--mx-fit', mid + 'px');
        if (manText.scrollHeight <= avail && manText.scrollWidth <= manText.clientWidth + 1) lo = mid; else hi = mid;
      }
      manText.style.setProperty('--mx-fit', Math.floor(lo) + 'px');
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    let rf = 0;
    addEventListener('resize', () => { clearTimeout(rf); rf = setTimeout(fit, 150); });
  }

  let lastPix = -1;
  function onScroll() {
    queued = false;
    const vh = innerHeight;
    if (!reduce) {
      const hr = hero.getBoundingClientRect();
      hero.style.setProperty('--mx-s', clamp(-hr.top / (hr.height * 0.9)).toFixed(4));
    }
    if (man && !reduce) {
      const r = man.getBoundingClientRect();
      const total = r.height - vh;
      const p = clamp(-r.top / total);
      const wp = clamp(p / 0.62);
      const n = words.length;
      words.forEach((w, i) => {
        const o = clamp(wp * n - i);
        w.style.setProperty('--o', (0.1 + o * 0.9).toFixed(3));
      });
      man.style.setProperty('--sub', clamp((p - 0.55) / 0.12).toFixed(3));
      const fp = clamp((p - 0.72) / 0.24);
      const on = Math.round(fp * pixOrder.length);
      if (on !== lastPix) {
        for (let i = 0; i < pixOrder.length; i++) pixOrder[i].classList.toggle('on', i < on);
        lastPix = on;
      }
      man.style.setProperty('--end', clamp((p - 0.9) / 0.08).toFixed(3));
    }
  }
  let queued = false;
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ─── Rolling counters ────────────────────────────────────────── */
  $$('.mx-roll').forEach(el => {
    const to = el.dataset.to || el.textContent.trim();
    const suffix = el.dataset.suffix || '';
    el.setAttribute('aria-label', to + suffix);
    el.textContent = '';
    const cols = [];
    [...to].forEach((digit, idx) => {
      const col = document.createElement('span');
      col.className = 'mx-col';
      col.setAttribute('aria-hidden', 'true');
      // two full spins then land on the digit
      const seq = [];
      for (let s = 0; s < 2; s++) for (let d = 0; d < 10; d++) seq.push(d);
      for (let d = 0; d <= +digit; d++) seq.push(d);
      seq.forEach(d => { const s = document.createElement('span'); s.textContent = d; col.appendChild(s); });
      col.style.setProperty('--d', (idx * 0.12) + 's');
      col.dataset.end = seq.length - 1;
      el.appendChild(col);
      cols.push(col);
    });
    if (suffix) { const sup = document.createElement('sup'); sup.textContent = suffix; sup.setAttribute('aria-hidden', 'true'); el.appendChild(sup); }
    const land = () => cols.forEach(c => { c.style.transform = `translateY(-${c.dataset.end}em)`; });
    const stat = el.closest('.mx-stat');
    if (reduce) { land(); return; }
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      o.disconnect();
      land();
      if (stat) stat.classList.add('mx-in');
    }, { threshold: 0.4 }).observe(el);
  });
})();
