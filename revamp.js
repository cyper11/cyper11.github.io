/* ═══════════════════════════════════════════════════════════════════
   REVAMP v2 — motion layer
   Scroll progress · word reveals · mono scramble · section index
   parallax · card spotlight · magnetic buttons · portrait tilt ·
   sliding nav pill · reveal stagger
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ─── Scroll progress + per-frame scroll work (one rAF) ─── */
  const progress = document.createElement('div');
  progress.className = 'rv-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const nums = [];
  const wordmark = document.querySelector('.rv-wordmark');
  let scrollQueued = false;
  function onScrollFrame() {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--rv-p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    if (reduce) return;
    const vh = innerHeight;
    for (const n of nums) {
      const r = n.host.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const t = (r.top + r.height / 2 - vh / 2) / vh; // -1..1 around center
      n.el.style.setProperty('--rv-par', (t * 40).toFixed(1) + 'px');
    }
  }
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScrollFrame); }
  }, { passive: true });

  /* ─── Section heads: giant index number + word reveal + scramble ─── */
  const inView = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      inView.unobserve(e.target);
      const fn = e.target.__rvEnter;
      if (fn) fn();
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

  function splitWords(h) {
    // Wrap each word of text nodes (keeps <em>, <br> etc. intact)
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span');
            w.className = 'rv-w';
            const inner = document.createElement('span');
            inner.style.setProperty('--i', i++);
            inner.textContent = p;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(h);
    h.classList.add('rv-words');
  }

  const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFX';
  function scramble(el) {
    const nodes = [];
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) if (tw.currentNode.textContent.trim()) nodes.push(tw.currentNode);
    nodes.forEach(node => {
      const final = node.textContent;
      const start = performance.now();
      const dur = 380 + final.length * 22;
      const tick = now => {
        const p = Math.min(1, (now - start) / dur);
        const fixed = Math.floor(p * final.length);
        let out = final.slice(0, fixed);
        for (let k = fixed; k < final.length; k++) {
          out += final[k] === ' ' || final[k] === '/' ? final[k] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        node.textContent = out;
        if (p < 1) requestAnimationFrame(tick);
        else node.textContent = final;
      };
      requestAnimationFrame(tick);
    });
  }

  $$('.section-head, .contact-copy').forEach(head => {
    const eyebrow = head.querySelector('.eyebrow');
    const h2 = head.querySelector('h2');
    const m = eyebrow && eyebrow.textContent.match(/^\s*(\d{2})\s*\//);
    if (m && head.classList.contains('section-head')) {
      const n = document.createElement('span');
      n.className = 'rv-num';
      n.setAttribute('aria-hidden', 'true');
      n.textContent = m[1];
      head.prepend(n);
      nums.push({ el: n, host: head });
    }
    if (reduce) return;
    if (h2) {
      h2.setAttribute('aria-label', h2.textContent.replace(/\s+/g, ' ').trim());
      splitWords(h2);
      $$('.rv-w', h2).forEach(w => w.setAttribute('aria-hidden', 'true'));
    }
    if (eyebrow) eyebrow.classList.add('rv-scramble');
    head.__rvEnter = () => {
      if (h2) h2.classList.add('rv-in');
      if (eyebrow) scramble(eyebrow);
    };
    inView.observe(head);
  });

  /* ─── Reveal stagger: siblings cascade instead of popping together ─── */
  const groups = new Map();
  $$('.reveal').forEach(el => {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });
  groups.forEach(list => {
    if (list.length < 2) return;
    list.forEach((el, i) => {
      if (!i) return;
      el.style.setProperty('--rv-d', Math.min(i, 8) * 70 + 'ms');
      // Drop the delay once revealed so hovers stay instant
      const clear = ev => {
        if (ev.target !== el || !el.classList.contains('visible')) return;
        el.style.removeProperty('--rv-d');
        el.removeEventListener('transitionend', clear);
      };
      el.addEventListener('transitionend', clear);
    });
  });

  /* ─── Hero portrait: HUD frame, scan line, coordinates ─── */
  const portrait = document.querySelector('.hero .portrait');
  if (portrait) {
    const hud = document.createElement('div');
    hud.className = 'rv-hud';
    hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML = '<i></i><i></i><i></i><i></i>';
    const scan = document.createElement('div');
    scan.className = 'rv-scan';
    scan.setAttribute('aria-hidden', 'true');
    const coords = document.createElement('div');
    coords.className = 'rv-coords';
    coords.setAttribute('aria-hidden', 'true');
    coords.innerHTML = '<b>●</b> ON SITE<br>14.38°N · 120.88°E';
    portrait.append(scan, hud, coords);
  }

  onScrollFrame();

  /* ─── Footer wordmark: shine + sparkles, animated only while visible ─── */
  if (wordmark) {
    if (!reduce) {
      const rnd = (a, b) => a + Math.random() * (b - a);
      const place = sp => {
        sp.style.setProperty('--x', rnd(6, 94).toFixed(1) + '%');
        sp.style.setProperty('--y', rnd(14, 86).toFixed(1) + '%');
        sp.style.setProperty('--s', rnd(10, 26).toFixed(0) + 'px');
      };
      for (let i = 0; i < 10; i++) {
        const sp = document.createElement('i');
        sp.className = 'rv-spark';
        place(sp);
        sp.style.setProperty('--d', rnd(1.8, 3.4).toFixed(2) + 's');
        sp.style.setProperty('--delay', rnd(0, 3).toFixed(2) + 's');
        sp.addEventListener('animationiteration', () => place(sp));
        wordmark.appendChild(sp);
      }
    }
    new IntersectionObserver(([e]) => wordmark.classList.toggle('rv-live', e.isIntersecting)).observe(wordmark);
  }

  if (!finePointer) { initNavPill(); return; }

  /* ─── Card spotlight follows the pointer ─── */
  const SPOT = '.cert-card,.badge-card,.toolkit-card,.learn-card,.lab-card,.contact-panel';
  document.addEventListener('pointermove', e => {
    const card = e.target.closest && e.target.closest(SPOT);
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ─── Magnetic buttons ─── */
  if (!reduce) {
    const MAG = '.button,.circle-button,.contact-btn,.cc-nav button,.carousel-prev,.carousel-next,.lab-carousel-prev,.lab-carousel-next,.theme-toggle,.download-btn';
    $$(MAG).forEach(btn => {
      const strength = btn.classList.contains('button') ? 0.22 : 0.3;
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * strength).toFixed(1) + 'px');
        btn.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * strength).toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--tx', '0px');
        btn.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ─── Portrait 3D tilt (mouse only) ─── */
  if (portrait && !reduce) {
    portrait.addEventListener('pointermove', e => {
      const r = portrait.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      portrait.classList.add('rv-tilting');
      portrait.style.setProperty('--rv-rx', (-py).toFixed(3));
      portrait.style.setProperty('--rv-ry', px.toFixed(3));
      portrait.style.setProperty('--rv-ra', (Math.hypot(px, py) * 12).toFixed(2) + 'deg');
    });
    portrait.addEventListener('pointerleave', () => {
      portrait.classList.remove('rv-tilting');
      portrait.style.setProperty('--rv-ra', '0deg');
    });
  }

  initNavPill();

  /* ─── Sidebar: one pill that slides to the active link ─── */
  function initNavPill() {
    const nav = document.getElementById('navigation');
    if (!nav) return;
    const links = $$(':scope > a[href^="#"]', nav);
    if (!links.length) return;
    const pill = document.createElement('span');
    pill.className = 'rv-nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.prepend(pill);
    nav.classList.add('rv-pill-on');
    const place = () => {
      const a = links.find(l => l.classList.contains('active'));
      if (!a || !a.offsetParent) { pill.classList.remove('on'); return; }
      pill.style.transform = `translate(${a.offsetLeft}px,${a.offsetTop}px)`;
      pill.style.width = a.offsetWidth + 'px';
      pill.style.height = a.offsetHeight + 'px';
      pill.classList.add('on');
    };
    const mo = new MutationObserver(place);
    links.forEach(l => mo.observe(l, { attributes: true, attributeFilter: ['class'] }));
    addEventListener('resize', place);
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(nav);
    place();
  }
})();
