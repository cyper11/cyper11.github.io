/* ═══════════════════════════════════════════════════════════════════
   SECTIONS 02 · 04–09 — behaviour for the "FIELD OPS // SIGNAL" redesign
   Head wires · pixel dissolves · work rail + pixel stairs · pinned
   credential shelf · rack LEDs · lab arcade · heatmap telemetry ·
   contact marquee
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, r = document) => r.querySelector(sel);
  const $$ = (sel, r = document) => Array.from(r.querySelectorAll(sel));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const pad = n => String(n).padStart(2, '0');
  const make = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  root.classList.add('mx-js');

  // Run fn once per element, the first time it scrolls into view
  function once(targets, fn, threshold = 0.2) {
    const list = typeof targets === 'string' ? $$(targets) : targets;
    if (!list.length) return;
    const io = new IntersectionObserver((entries, o) => entries.forEach(e => {
      if (!e.isIntersecting) return;
      o.unobserve(e.target);
      fn(e.target);
    }), { threshold });
    list.forEach(el => io.observe(el));
  }

  // Count a number up inside el
  function countUp(el, to, ms = 1300) {
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now();
    const step = now => {
      const p = clamp((now - t0) / ms);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ─── Shared: head wires + pixel dissolves ────────────────────── */
  function pixwipe(el) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    let size = innerWidth < 600 ? 40 : 64;
    while (Math.ceil(w / size) * Math.ceil(h / size) > 360) size += 8;
    const cols = Math.ceil(w / size), rows = Math.ceil(h / size);
    const wipe = make('div', 'mx-pixwipe');
    wipe.setAttribute('aria-hidden', 'true');
    wipe.style.gridTemplateColumns = `repeat(${cols},1fr)`;
    wipe.style.gridTemplateRows = `repeat(${rows},1fr)`;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = make('i');
      i.style.setProperty('--d', ((c / cols) * 0.3 + (r / rows) * 0.25 + Math.random() * 0.25).toFixed(3) + 's');
      wipe.appendChild(i);
    }
    el.appendChild(wipe);
    setTimeout(() => wipe.remove(), 1500);
  }


  /* ═══ 02 FIELD WORK ═════════════════════════════════════════════ */
  const work = $('#work');
  if (work) {
    // Pixel stairs stepping out of the lime sheet, top and bottom
    const stairs = ['top', 'bot'].map(pos => {
      const s = make('div', 'mx-stair ' + pos);
      s.setAttribute('aria-hidden', 'true');
      work.appendChild(s);
      return s;
    });
    const buildStairs = () => {
      const cell = innerWidth < 850 ? 20 : 32;
      const cols = Math.ceil(work.offsetWidth / cell);
      stairs.forEach((s, k) => {
        s.textContent = '';
        s.style.gridTemplateColumns = `repeat(${cols},1fr)`;
        s.style.gridTemplateRows = 'repeat(2,1fr)';
        for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
          // the row touching the sheet is mostly filled, the outer row sparse
          const near = k === 0 ? r === 1 : r === 0;
          const i = make('i', Math.random() < (near ? 0.62 : 0.18) ? '' : 'off');
          i.style.setProperty('--d', (Math.random() * 0.5).toFixed(2) + 's');
          s.appendChild(i);
        }
      });
    };
    buildStairs();
    let rs = 0;
    addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(buildStairs, 200); });
    if (reduce) work.classList.add('mx-lit');
    else once([work], el => el.classList.add('mx-lit'), 0.02);

    // Project rail: jump straight to any case
    const carousel = $('.carousel', work);
    const slides = $$('.carousel-slide', work);
    const counter = $('.carousel-counter', work);
    if (carousel && slides.length > 1) {
      const rail = make('div', 'mx-rail');
      rail.setAttribute('role', 'navigation');
      rail.setAttribute('aria-label', 'Selected projects');
      const btns = slides.map((s, i) => {
        const h = $('h3', s);
        const tmp = make('span', '', h ? h.innerHTML.replace(/<br\s*\/?>/gi, ' ') : '');
        const name = (tmp.textContent || s.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
        const b = make('button', '', `<b>${pad(i + 1)}</b>`);
        b.type = 'button';
        b.appendChild(document.createTextNode(name));
        b.addEventListener('click', () => {
          if (typeof carousel.mxGoTo === 'function') carousel.mxGoTo(i);
        });
        rail.appendChild(b);
        return b;
      });
      carousel.before(rail);

      // Scanner wipe that sweeps the stage on every change
      const sweep = make('div', 'mx-sweep');
      sweep.setAttribute('aria-hidden', 'true');
      carousel.appendChild(sweep);

      // Slideshow: auto-advance with a progress bar in the active chip.
      // Pauses on hover/focus, off-screen, hidden tab; off by default for reduced motion.
      const DUR = 6500;
      let cur = -1, elapsed = 0, prev = 0, playing = !reduce, held = false, visible = false, raf = 0;
      const play = make('button', 'mx-play');
      play.type = 'button';
      const nav = $('.carousel-nav', work);
      if (nav && counter) counter.before(play);
      else rail.after(play);
      const drawPlay = () => {
        play.innerHTML = playing ? '<i></i><i></i> AUTO' : '<b class="mx-tri"></b> PLAY';
        play.setAttribute('aria-label', playing ? 'Pause project slideshow' : 'Play project slideshow');
        play.setAttribute('aria-pressed', String(playing));
        work.classList.toggle('mx-autoplay', playing);
      };
      play.addEventListener('click', () => { playing = !playing; elapsed = 0; drawPlay(); });
      drawPlay();

      const tick = now => {
        raf = 0;
        if (!visible) return;
        const dt = prev ? Math.min(1000, now - prev) : 0;
        prev = now;
        if (playing && !held && !document.hidden) elapsed += dt;
        const p = clamp(elapsed / DUR);
        if (btns[cur]) btns[cur].style.setProperty('--rp', p.toFixed(4));
        if (p >= 1 && typeof carousel.mxGoTo === 'function') {
          elapsed = 0;
          carousel.mxGoTo((cur + 1) % btns.length);
        }
        raf = requestAnimationFrame(tick);
      };
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        prev = 0;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      }, { threshold: 0.15 }).observe(carousel);
      const hold = v => () => { held = v; };
      [carousel, rail].forEach(el => {
        el.addEventListener('pointerenter', hold(true));
        el.addEventListener('pointerleave', hold(false));
      });
      work.addEventListener('focusin', e => { if (e.target !== play) held = true; });
      work.addEventListener('focusout', () => { held = false; });

      const sync = () => {
        const m = counter && counter.textContent.match(/(\d+)/);
        const next = m ? +m[1] - 1 : 0;
        if (next === cur) return;
        const first = cur < 0;
        cur = next;
        elapsed = 0;
        btns.forEach((b, i) => {
          b.classList.toggle('on', i === cur);
          b.setAttribute('aria-current', i === cur ? 'true' : 'false');
          b.style.setProperty('--rp', 0);
        });
        const on = btns[cur];
        if (on && rail.scrollWidth > rail.clientWidth) {
          rail.scrollTo({ left: on.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth' });
        }
        if (!first && !reduce) {
          sweep.classList.remove('go');
          void sweep.offsetWidth;
          sweep.classList.add('go');
        }
      };
      if (counter) new MutationObserver(sync).observe(counter, { childList: true, characterData: true, subtree: true });
      sync();
    }
  }

  /* ═══ 04 CREDENTIALS — pinned trophy shelf ═════════════════════ */
  const cred = $('#credentials');
  const plates = cred ? [...$$('.badge-card', cred), ...$$('.cert-card', cred)] : [];
  if (plates.length) {
    const shelf = make('div', 'mx-shelf');
    const stick = make('div', 'mx-shelf-stick');
    const bar = make('div', 'mx-shelf-bar', `<b>01 / ${pad(plates.length)}</b><span><i></i></span><em>SCROLL →</em>`);
    bar.setAttribute('aria-hidden', 'true');
    const track = make('div', 'mx-shelf-track');
    plates.forEach((p, i) => {
      track.appendChild(p);
    });
    const end = make('div', 'mx-shelf-end', `${pad(plates.length)} certs<br><em>and counting.</em>`);
    end.setAttribute('aria-hidden', 'true');
    track.appendChild(end);
    stick.append(bar, track);
    shelf.appendChild(stick);
    const oldGrid = $('.badge-grid', cred);
    (oldGrid || $('.section-head', cred)).after(shelf);
    $$('.badge-grid, .cert-cards', cred).forEach(n => n.remove());

    const num = $('b', bar), fill = $('i', bar), hint = $('em', bar);
    const wide = matchMedia('(min-width: 900px)');
    let pinned = false, dist = 0, queued = false;
    const update = () => {
      queued = false;
      let p;
      if (pinned) {
        const r = shelf.getBoundingClientRect();
        p = clamp(-r.top / Math.max(1, r.height - innerHeight));
        track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      } else {
        const max = track.scrollWidth - track.clientWidth;
        p = max > 0 ? track.scrollLeft / max : 0;
      }
      bar.style.setProperty('--p', p.toFixed(4));
      num.textContent = `${pad(Math.min(plates.length, Math.round(p * (plates.length - 1)) + 1))} / ${pad(plates.length)}`;
    };
    const layout = () => {
      pinned = !reduce && wide.matches && innerHeight >= 560;
      shelf.classList.toggle('mx-pinned', pinned);
      hint.textContent = pinned ? 'SCROLL →' : 'SWIPE →';
      if (pinned) {
        dist = Math.max(0, track.scrollWidth - stick.clientWidth);
        shelf.style.height = (innerHeight + dist) + 'px';
      } else {
        shelf.style.height = '';
        track.style.transform = '';
      }
      update();
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener('scroll', queue, { passive: true });
    track.addEventListener('scroll', queue, { passive: true });
    let rl = 0;
    addEventListener('resize', () => { clearTimeout(rl); rl = setTimeout(layout, 120); });
    // plate images arrive lazily and change the track width
    $$('img', track).forEach(img => { if (!img.complete) img.addEventListener('load', layout, { once: true }); });
    layout();
    // plates sit off-screen inside the pinned frame; reveal them all once the shelf arrives
    once([stick], () => plates.forEach(p => p.classList.add('visible')), 0.05);
  }

  /* ═══ 05 TOOLKIT — server rack ══════════════════════════════════ */
  const addLeds = unit => {
    if ($('.mx-leds', unit)) return;
    const leds = make('span', 'mx-leds', '<i></i><i></i><i></i>');
    leds.setAttribute('aria-hidden', 'true');
    $$('i', leds).forEach(i => i.style.setProperty('--d', (Math.random() * 1.2).toFixed(2) + 's'));
    unit.prepend(leds);
  };
  const racks = $$('#stack .toolkit-grid, #stack .toolkit-bottom');
  racks.forEach(rack => {
    $$('.toolkit-card, .toolkit-mini', rack).forEach(addLeds);
    // the dev tab can re-render its cards; keep the LEDs in place
    new MutationObserver(() => $$('.toolkit-card, .toolkit-mini', rack).forEach(addLeds)).observe(rack, { childList: true });
    const scan = make('div', 'mx-rack-scan');
    scan.setAttribute('aria-hidden', 'true');
    rack.appendChild(scan);
  });
  const powerOn = rack => {
    rack.style.setProperty('--h', rack.offsetHeight + 'px');
    rack.classList.add('mx-rack-on');
  };
  if (reduce) racks.forEach(r => r.classList.add('mx-rack-on'));
  else racks.forEach(r => {
    // hidden tab racks power on when they become visible
    if (r.hidden) new MutationObserver((_, o) => { if (!r.hidden) { o.disconnect(); powerOn(r); } }).observe(r, { attributes: true, attributeFilter: ['hidden'] });
    else once([r], powerOn, 0.15);
  });

  /* ═══ 06 LAB — arcade grid ══════════════════════════════════════ */
  const lab = $('#lab-carousel');
  if (lab) {
    $$('.lab-carousel-slide', lab).forEach(s => s.removeAttribute('aria-hidden'));
    const total = $$('.lab-carousel-slide', lab).length;
    const hint = make('p', 'mx-lab-hint', `<i></i> SWIPE · ${pad(total)} EXPERIMENTS`);
    hint.setAttribute('aria-hidden', 'true');
    lab.before(hint);
  }

  /* ═══ 07 ACTIVITY — fit the year + telemetry stats ══════════════ */
  const ghMap = document.getElementById('gh-heatmap');
  const ghMonths = document.getElementById('gh-months');
  if (ghMap && ghMonths) {
    const panel = ghMap.closest('.gh-heatmap-wrap');
    const scroller = ghMap.closest('.gh-heatmap-scroll') || panel;

    const stats = make('div', 'mx-gh-stats',
      '<div><b>0</b><small>CONTRIBUTIONS</small></div><div><b>0</b><small>ACTIVE DAYS</small></div>' +
      '<div><b>0</b><small>LONGEST STREAK</small></div><div><b>0</b><small>CURRENT STREAK</small></div>');
    panel.before(stats);
    const statEls = $$('b', stats);
    let values = null, inView = false, rolled = false;
    const roll = () => {
      if (rolled || !values || !inView) return;
      rolled = true;
      statEls.forEach((b, i) => countUp(b, values[i]));
    };

    const compute = () => {
      const days = $$('.gh-day[data-date]', ghMap);
      if (!days.length) return;
      let active = 0, run = 0, longest = 0;
      days.forEach(d => {
        if (+d.dataset.level > 0) { active++; run++; longest = Math.max(longest, run); } else run = 0;
      });
      // current streak: count back from the latest day (today may still be empty)
      let current = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (+days[i].dataset.level > 0) current++;
        else if (i === days.length - 1) continue;
        else break;
      }
      const totalEl = $('.gh-total-num', panel);
      const total = totalEl ? parseInt(totalEl.textContent, 10) || 0 : 0;
      values = [total, active, longest, current];
      if (rolled || reduce) statEls.forEach((b, i) => { b.textContent = values[i]; });
      roll();
    };

    const fit = () => {
      const weeks = $$('.gh-week', ghMap);
      if (!weeks.length) return;
      const daysCol = $('.gh-weekdays', panel);
      const avail = scroller.clientWidth - (daysCol ? daysCol.offsetWidth : 28) - 10;
      const g = avail / weeks.length > 10 ? 3 : 2;
      const raw = Math.floor((avail - (weeks.length - 1) * g) / weeks.length * 10) / 10;
      const c = Math.max(7, Math.min(18, raw));
      panel.style.setProperty('--gh-c', c + 'px');
      panel.style.setProperty('--gh-g', g + 'px');
      panel.classList.add('gh-fit');
      panel.classList.toggle('gh-tight', raw < 7);
      weeks.forEach((w, i) => w.style.setProperty('--w', i));
      $$('span', ghMonths).forEach(sp => {
        if (!sp.dataset.w) sp.dataset.w = parseFloat(sp.style.width) / 15;
        sp.style.width = (sp.dataset.w * (c + g)) + 'px';
      });
      // on phones the year still scrolls: start on the most recent weeks
      if (raw < 7) scroller.scrollLeft = scroller.scrollWidth;
    };
    const refresh = () => { fit(); compute(); };
    new MutationObserver(refresh).observe(ghMap, { childList: true });
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(scroller);
    refresh();
    once([panel], el => {
      inView = true;
      if (!reduce) el.classList.add('mx-wave');
      roll();
    }, 0.25);
  }

  /* ═══ 09 CONTACT — drifting outline marquee ═════════════════════ */
  const contact = $('#contact');
  if (contact && !reduce) {
    const mq = make('div', 'mx-contact-mq', '<span>LET’S BUILD SOMETHING —</span>'.repeat(4));
    mq.setAttribute('aria-hidden', 'true');
    contact.prepend(mq);
  }

  /* ═══ FIELD LOG — transmission timeline ═════════════════════════ */
  const flFeed = document.getElementById('field-log-feed');
  const flHead = $('.field-log-header');
  if (flFeed && flHead) {
    const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const title = make('h2', 'mx-fl-title', 'Latest from <em>the field.</em>');
    const eyebrow = $('.note-eyebrow', flHead);
    (eyebrow || flHead.firstChild).after(title);
    const live = make('div', 'mx-fl-live', '<i></i> LIVE FEED · <b>00</b> ENTRIES');
    live.setAttribute('aria-hidden', 'true');
    flHead.appendChild(live);
    const filters = make('div', 'mx-fl-filters');
    filters.setAttribute('role', 'toolbar');
    filters.setAttribute('aria-label', 'Filter field log entries');
    flHead.appendChild(filters);
    let filter = 'ALL';

    const applyFilter = () => {
      $$('.field-log-post', flFeed).forEach(a => a.classList.toggle('mx-off', filter !== 'ALL' && a.dataset.type !== filter));
      $$('button', filters).forEach(b => {
        b.classList.toggle('on', b.dataset.f === filter);
        b.setAttribute('aria-pressed', String(b.dataset.f === filter));
      });
    };

    const decorate = () => {
      const posts = $$('.field-log-post', flFeed);
      if (!posts.length) return;
      posts.forEach((post, i) => {
        post.style.setProperty('--n', i);
        if ($('.mx-fl-stamp', post)) return;
        const t = $('time', post);
        const d = t ? new Date(t.getAttribute('datetime')) : null;
        const id = post.dataset.id || String(posts.length - i);
        const stamp = make('div', 'mx-fl-stamp', d && !isNaN(d)
          ? `<b>${pad(d.getDate())}</b><span>${MONTHS[d.getMonth()]}</span><small>${d.getFullYear()}</small><i>LOG #${pad(id)}</i>`
          : `<i>LOG #${pad(id)}</i>`);
        stamp.setAttribute('aria-hidden', 'true');
        post.prepend(stamp);
      });
      $('b', live).textContent = pad(posts.length);
      // filter chips with counts, rebuilt only when the set of types changes
      const counts = {};
      posts.forEach(p => { counts[p.dataset.type] = (counts[p.dataset.type] || 0) + 1; });
      const types = ['ALL', ...Object.keys(counts)];
      if (filters.dataset.types !== types.join('|')) {
        filters.dataset.types = types.join('|');
        filters.textContent = '';
        types.forEach(ty => {
          const b = make('button', '', `${ty} <b>${pad(ty === 'ALL' ? posts.length : counts[ty])}</b>`);
          b.type = 'button';
          b.dataset.f = ty;
          b.addEventListener('click', () => { filter = ty; applyFilter(); flFeed.scrollTop = 0; });
          filters.appendChild(b);
        });
        if (!types.includes(filter)) filter = 'ALL';
      }
      applyFilter();
    };
    new MutationObserver(decorate).observe(flFeed, { childList: true });
    decorate();
    if (reduce) flFeed.classList.add('mx-fl-in');
    else once([flFeed], el => el.classList.add('mx-fl-in'), 0.1);
  }

  /* ─── Sidebar: right edge works as a page-scroll meter ───────── */
  const sidebar = $('.sidebar');
  if (sidebar) {
    let q = false;
    const meter = () => {
      q = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      sidebar.style.setProperty('--mx-page', max > 0 ? (scrollY / max).toFixed(4) : 0);
    };
    addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(meter); } }, { passive: true });
    meter();
  }

  // registered last so the shelf and other built blocks exist
  if (reduce) $$('.section-head, .contact-copy').forEach(el => el.classList.add('mx-in'));
  else {
    once('.section-head, .contact-copy', el => el.classList.add('mx-in'), 0.3);
    once('.lab-carousel, .learn-grid, .mx-shelf-stick', pixwipe, 0.15);
  }
})();
