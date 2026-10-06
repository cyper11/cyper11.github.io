/* ═══════════════════════════════════════════════════════════════════
   MOBILE NAV — tab bar ink, Menu bottom sheet, auto-hiding header
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const tabbar = document.getElementById('mobile-tabbar');
  const menuBtn = document.getElementById('tabbar-menu-btn');
  if (!tabbar || !menuBtn) return;

  const mq = window.matchMedia('(max-width: 850px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sidebar = document.querySelector('.sidebar');
  const items = Array.from(tabbar.querySelectorAll('.tabbar-item'));
  const ink = tabbar.querySelector('.tabbar-ink');
  const tap = () => { try { if (navigator.vibrate) navigator.vibrate(8); } catch (_) {} };

  /* ─── Sliding ink under the active tab ─── */
  function placeInk() {
    const i = items.findIndex(it => it.classList.contains('active') && it !== menuBtn);
    if (i < 0) { ink.classList.remove('on'); return; }
    ink.style.setProperty('--ink', i);
    ink.classList.add('on');
  }
  const inkObs = new MutationObserver(placeInk);
  items.forEach(it => inkObs.observe(it, { attributes: true, attributeFilter: ['class'] }));
  placeInk();
  items.forEach(it => { if (it !== menuBtn) it.addEventListener('click', () => { tap(); closeSheet(); }); });

  /* ─── Bottom sheet, built from the sidebar so links stay in sync ─── */
  const backdrop = document.createElement('div');
  backdrop.className = 'msheet-backdrop';
  const sheet = document.createElement('div');
  sheet.className = 'msheet';
  sheet.id = 'mobile-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', 'Menu');
  sheet.inert = true;

  const avatar = document.querySelector('.identity img');
  const name = (document.querySelector('.identity-name') || {}).firstChild;
  const role = document.querySelector('.identity small');
  const resume = document.querySelector('.sidebar-bottom a[href$=".pdf"]');

  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    gh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
    li: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'
  };

  const tiles = Array.from(document.querySelectorAll('#navigation > a[href^="#"]')).map((a, n) => {
    const svg = a.querySelector('span') ? a.querySelector('span').innerHTML : '';
    const num = a.querySelector('b') ? a.querySelector('b').textContent : '';
    const label = Array.from(a.childNodes).filter(c => c.nodeType === 3).map(c => c.textContent).join('').trim();
    return `<a class="msheet-tile" href="${a.getAttribute('href')}" style="--n:${n}"><span class="ico">${svg}</span>${label}<b>${num}</b></a>`;
  }).join('');

  const mailLink = document.querySelector('a[href^="mailto:"]');
  sheet.innerHTML = `
    <button type="button" class="msheet-grab" aria-label="Drag down to close"></button>
    <div class="msheet-head"><h2>Menu</h2><button type="button" class="msheet-close" aria-label="Close menu">✕</button></div>
    <div class="msheet-profile">
      <img src="${avatar ? avatar.getAttribute('src') : 'profile.jpg'}" alt="">
      <div><strong>${name ? name.textContent.trim() : 'Cyper Ivan Pelina'}</strong><small>${role ? role.textContent : ''} · Cavite, PH</small></div>
      ${resume ? `<a href="${resume.getAttribute('href')}" target="_blank" rel="noopener">RÉSUMÉ ↗︎</a>` : ''}
    </div>
    <p class="msheet-label">SHORTCUTS</p>
    <div class="msheet-grid">${tiles}</div>
    <p class="msheet-label">SETTINGS &amp; LINKS</p>
    <div class="msheet-list">
      <button type="button" class="msheet-row" data-act="theme"><span class="ico"></span><span>Appearance</span><em></em></button>
      ${mailLink ? `<a class="msheet-row" href="${mailLink.getAttribute('href')}"><span class="ico">${ICONS.mail}</span><span>Email me</span><em>↗︎</em></a>` : ''}
      <a class="msheet-row" href="https://github.com/cyper11" target="_blank" rel="noreferrer"><span class="ico">${ICONS.gh}</span><span>GitHub</span><em>↗︎</em></a>
      <a class="msheet-row" href="https://www.linkedin.com/in/cyper-ivan-peli%C3%B1a-118131351/" target="_blank" rel="noreferrer"><span class="ico">${ICONS.li}</span><span>LinkedIn</span><em>↗︎</em></a>
      <button type="button" class="msheet-row secret" data-act="secret"><span class="ico">?</span><span>???</span><em>don't.</em></button>
    </div>
    <p class="msheet-foot">BASED IN CAVITE, PH · BUILT BY HAND</p>`;
  document.body.append(backdrop, sheet);

  const themeRow = sheet.querySelector('[data-act="theme"]');
  function syncThemeRow() {
    const light = document.documentElement.dataset.theme === 'light';
    themeRow.querySelector('.ico').innerHTML = light ? ICONS.sun : ICONS.moon;
    themeRow.querySelector('em').textContent = light ? 'LIGHT' : 'DARK';
  }
  syncThemeRow();
  new MutationObserver(syncThemeRow).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function markCurrent() {
    const active = document.querySelector('#navigation > a.active');
    sheet.querySelectorAll('.msheet-tile').forEach(t => t.classList.toggle('is-current', !!active && t.getAttribute('href') === active.getAttribute('href')));
  }

  let open = false, lastFocus = null;
  function openSheet() {
    if (open) return;
    open = true;
    lastFocus = document.activeElement;
    markCurrent();
    sheet.inert = false;
    sheet.scrollTop = 0;
    sheet.style.removeProperty('--drag');
    sheet.classList.add('open');
    backdrop.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (sidebar) sidebar.classList.remove('mh-hidden');
    setTimeout(() => { const c = sheet.querySelector('.msheet-close'); if (c) c.focus({ preventScroll: true }); }, 50);
  }
  function closeSheet(restoreFocus) {
    if (!open) return;
    open = false;
    sheet.classList.remove('open', 'dragging');
    backdrop.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    sheet.inert = true;
    if (restoreFocus && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  menuBtn.addEventListener('click', e => {
    e.preventDefault();
    tap();
    open ? closeSheet(true) : openSheet();
  });
  backdrop.addEventListener('click', () => closeSheet(true));
  sheet.querySelector('.msheet-close').addEventListener('click', () => closeSheet(true));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeSheet(true); });
  mq.addEventListener('change', () => { if (!mq.matches) closeSheet(); });

  sheet.addEventListener('click', e => {
    const tile = e.target.closest('.msheet-tile');
    if (tile) {
      e.preventDefault();
      tap();
      const target = document.querySelector(tile.getAttribute('href'));
      closeSheet();
      if (target) setTimeout(() => target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 60);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'theme') {
      const t = document.getElementById('theme-toggle');
      if (t) t.click();
    } else if (act.dataset.act === 'secret') {
      closeSheet();
      const s = document.getElementById('click-this-btn');
      if (s) setTimeout(() => s.click(), 380);
    }
  });

  /* Swipe the sheet down to close (grab bar, or anywhere while scrolled to top) */
  let drag = null;
  sheet.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && !e.target.closest('.msheet-grab')) return;
    if (sheet.scrollTop > 0 && !e.target.closest('.msheet-grab')) return;
    drag = { y: e.clientY, dy: 0, id: e.pointerId, t: performance.now() };
  });
  sheet.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dy = Math.max(0, e.clientY - drag.y);
    if (drag.dy > 6) {
      sheet.classList.add('dragging');
      sheet.style.setProperty('--drag', drag.dy + 'px');
    }
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const fast = drag.dy / Math.max(1, performance.now() - drag.t) > 0.6;
    sheet.classList.remove('dragging');
    if (drag.dy > 110 || (fast && drag.dy > 40)) closeSheet(true);
    else sheet.style.removeProperty('--drag');
    drag = null;
  };
  sheet.addEventListener('pointerup', endDrag);
  sheet.addEventListener('pointercancel', endDrag);

  /* ─── Header hides on scroll-down, returns on scroll-up ─── */
  let lastY = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (!sidebar || !mq.matches || open) return;
      const y = scrollY;
      const navOpen = document.getElementById('navigation')?.classList.contains('open');
      if (y > lastY + 6 && y > 160 && !navOpen) sidebar.classList.add('mh-hidden');
      else if (y < lastY - 6 || y < 80) sidebar.classList.remove('mh-hidden');
      lastY = y;
    });
  }, { passive: true });
})();
