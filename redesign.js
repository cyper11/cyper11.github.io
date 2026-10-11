/* ═══════════════════════════════════════════════════════════════════
   REDESIGN — "FIELD KIT" (pairs with redesign.css)
   Top bar + full-screen menu on desktop, rack column guides,
   Lenis smooth scroll, Motion reveals, Lucide icons.
   Runs only when html.rd is set (?classic turns it off).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const root = document.documentElement;
  if (!root.classList.contains('rd')) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 851px)');
  const M = window.Motion || null;
  const EASE = [0.23, 1, 0.32, 1];
  let lenis = null;               // declared up front so menu handlers never hit the TDZ
  const EASE_IO = [0.77, 0, 0.175, 1];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const drawIcons = () => { if (window.lucide) window.lucide.createIcons({ icons: window.lucide.icons, attrs: { 'stroke-width': 1.75 } }); };

  /* ─── Column guides ─── */
  const guides = el('div', 'rd-guides', '<i></i><i></i><i></i><i></i>');
  guides.setAttribute('aria-hidden', 'true');
  document.body.prepend(guides);

  /* ─── Sections from the existing nav ─── */
  const ICONS = { overview: 'house', work: 'briefcase', experience: 'route', credentials: 'badge-check', stack: 'wrench',
    lab: 'flask-conical', activity: 'activity', learning: 'graduation-cap', contact: 'phone' };
  const sections = $$('#navigation > a[href^="#"]').map(a => ({
    id: a.getAttribute('href').slice(1),
    label: (a.textContent || '').replace(/\s+/g, ' ').trim().replace(/\s*\d+$/, '')
  })).filter(s => s.id && s.label);

  /* ─── Top bar ─── */
  const bar = el('header', 'rd-bar');
  bar.innerHTML = `
    <a class="rd-brand" href="#overview" aria-label="Back to top"><b>C1<span>.</span></b><small>Cyper Ivan Pelina<br>Field Service Engineer</small></a>
    <div class="rd-mid"><span>Cavite, PH <b class="rd-clock">--:--</b></span><span>14.38°N · 120.88°E</span></div>
    <div class="rd-right">
      <a class="rd-status" href="#contact"><i></i>Open to work</a>
      <button class="rd-btn rd-theme" type="button" aria-label="Toggle light or dark theme">${icon('sun-moon')}</button>
      <button class="rd-menu-btn" type="button" aria-expanded="false" aria-controls="rd-menu">${icon('menu')}Menu</button>
    </div>`;
  document.body.prepend(bar);

  const clock = $('.rd-clock', bar);
  const tick = () => { clock.textContent = new Intl.DateTimeFormat('en-PH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Manila' }).format(new Date()) + ' PHT'; };
  tick(); setInterval(tick, 15000);

  $('.rd-theme', bar).addEventListener('click', () => { const t = document.getElementById('theme-toggle'); if (t) t.click(); });

  /* ─── ??? — the real easter-egg button moves into the bar as a CCTV tag.
     Moving (not cloning) keeps app.js / field-log.js / mobile-nav.js handlers. ─── */
  const secret = document.getElementById('click-this-btn');
  if (secret) {
    const tag = el('span', 'rd-secret');
    tag.innerHTML = '<i class="rd-rec" aria-hidden="true"></i>';
    tag.append(secret);
    $('.rd-right', bar).prepend(tag);
    const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ÆØ';
    let scr = 0;
    secret.addEventListener('pointerenter', () => {
      if (reduce || secret.textContent.trim() !== '???') return;
      clearInterval(scr);
      let n = 0;
      scr = setInterval(() => {
        secret.textContent = n++ < 9 ? Array.from({ length: 3 }, () => GLYPHS[Math.random() * GLYPHS.length | 0]).join('') : '???';
        if (n > 9) clearInterval(scr);
      }, 45);
    });
  }
  const ownerLog = $('.sidebar .nav-log');

  /* ─── Menu ─── */
  const resume = $('.sidebar-bottom > a');
  const socials = $$('.sidebar .socials a');
  const menu = el('div', 'rd-menu');
  menu.id = 'rd-menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Site menu');
  menu.innerHTML = `
    <button class="rd-menu-close" type="button">${icon('x')}Close</button>
    <nav class="rd-menu-nav" aria-label="Sections">
      ${sections.map((s, i) => `<a href="#${s.id}"><small>${String(i + 1).padStart(2, '0')}</small><span>${s.label}</span>${icon(ICONS[s.id] || 'arrow-up-right')}</a>`).join('')}
      ${secret ? `<button class="rd-menu-secret" type="button"><small>??</small><span data-text="CLASSIFIED">Classified</span><em>Do not open</em></button>` : ''}
    </nav>
    <div class="rd-menu-side">
      <div><h4>Documents</h4>${resume ? `<a href="${resume.getAttribute('href')}" target="_blank" rel="noreferrer">Résumé ${icon('file-down')}</a>` : ''}</div>
      <div><h4>Elsewhere</h4>${socials.map(a => `<a href="${a.href}" target="_blank" rel="noreferrer">${(a.textContent || a.getAttribute('aria-label') || '').trim()} ${icon('arrow-up-right')}</a>`).join('')}</div>
      <p>Based in Cavite, Philippines.<br>Hardware · networks · CCTV · field support.</p>
    </div>`;
  document.body.append(menu);
  if (ownerLog) { ownerLog.classList.add('rd-owner-log'); $('.rd-menu-side', menu).append(ownerLog); }

  drawIcons();

  const menuBtn = $('.rd-menu-btn', bar);
  let open = false, anim = null;
  function setMenu(next) {
    if (next === open) return;
    open = next;
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('rd-menu-open', open);
    if (anim) anim.stop && anim.stop();
    if (open) {
      menu.classList.add('open');
      lenis && lenis.stop();
      if (M && !reduce) {
        anim = M.animate(menu, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 0.55, easing: EASE_IO });
        M.animate($$('.rd-menu-nav a', menu), { opacity: [0, 1], transform: ['translateY(40px)', 'translateY(0)'] }, { duration: 0.5, delay: M.stagger(0.045, { start: 0.18 }), easing: EASE });
      } else menu.style.clipPath = 'inset(0 0 0% 0)';
      setTimeout(() => $('.rd-menu-close', menu).focus(), 60);
    } else {
      lenis && lenis.start();
      const done = () => { menu.classList.remove('open'); menu.style.clipPath = ''; };
      if (M && !reduce) {
        anim = M.animate(menu, { clipPath: ['inset(0 0 0% 0)', 'inset(100% 0 0 0)'] }, { duration: 0.4, easing: EASE_IO });
        Promise.resolve(anim).then(done, done);
      } else done();
      menuBtn.focus();
    }
  }
  menuBtn.addEventListener('click', () => setMenu(true));
  $('.rd-menu-close', menu).addEventListener('click', () => setMenu(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) setMenu(false); });
  $$('.rd-menu-nav a', menu).forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();   // keep Lenis anchors / app.js nav handlers out of it
    const id = a.getAttribute('href');
    setMenu(false);
    setTimeout(() => goTo(id), reduce ? 0 : 260);
  }));
  desktop.addEventListener('change', e => { if (!e.matches) setMenu(false); });
  const menuSecret = $('.rd-menu-secret', menu);
  if (menuSecret) menuSecret.addEventListener('click', () => { setMenu(false); setTimeout(() => secret.click(), reduce ? 0 : 420); });

  /* ─── Lenis smooth scroll ─── */
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      anchors: { offset: -64 },
      prevent: node => !!(node.closest && node.closest('dialog,.fe-overlay,.ee-overlay,.cb-root,.msheet,.rd-menu,.km-stage,.cc-stage,.gh-heatmap-scroll,.mx-shelf-track'))
    });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // pause while a game / modal owns the screen
    const sync = () => {
      const busy = document.body.classList.contains('game-active') || document.body.classList.contains('fe-modal-open') || !!document.querySelector('dialog[open]');
      busy ? lenis.stop() : (!open && lenis.start());
    };
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: false });
    document.addEventListener('toggle', sync, true);
    document.addEventListener('close', sync, true);
    window.__rdLenis = lenis;
  }
  function goTo(hash) {
    const t = document.querySelector(hash);
    if (!t) return;
    const off = desktop.matches ? -64 : 0;
    // content above can still be settling (lazy media, sticky blocks), so re-aim once the glide ends
    const settle = () => { const d = t.getBoundingClientRect().top + off; if (Math.abs(d) > 4) lenis.scrollTo(t, { offset: off, duration: 0.5 }); };
    if (lenis) lenis.scrollTo(t, { offset: off, duration: 1.2, easing: x => 1 - Math.pow(1 - x, 4), onComplete: settle });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  $('.rd-brand', bar).addEventListener('click', e => { e.preventDefault(); goTo('#overview'); });
  $('.rd-status', bar).addEventListener('click', e => { e.preventDefault(); goTo('#contact'); });

  /* ─── Motion reveals ─── */
  if (M && !reduce) {
    // top bar settles in once
    M.animate(bar, { transform: ['translateY(-100%)', 'translateY(0)'] }, { duration: 0.6, delay: 0.2, easing: EASE });

    // stat strip: each tag wipes in from the left
    M.inView('.mx-stats', ({ target }) => {
      M.animate($$('.mx-stat', target), { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }, { duration: 0.7, delay: M.stagger(0.08), easing: EASE_IO });
    }, { margin: '0px 0px -15% 0px' });

    // dot-matrix wordmark prints line by line
    M.inView('.rv-wordmark', ({ target }) => {
      M.animate($('.rv-wm-text', target) || target, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 1.1, easing: EASE_IO });
    }, { margin: '0px 0px -10% 0px' });

    // yellow sheets slide their head rule in
    M.inView('#work .section-head, #contact .contact-copy', ({ target }) => {
      M.animate(target, { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0)'] }, { duration: 0.7, easing: EASE });
    }, { margin: '0px 0px -10% 0px' });
  }
})();
