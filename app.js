/* ─── Toolkit tabs & Marquee ─── */
const TECH_ICONS = {
  java: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M7.8 4.2c-.8 1.4.3 2.6 1.4 3.4 1-.9 1.6-1.8 1.1-2.9-.4-.9-1.8-1.4-2.5-.5z" fill="#EA2D2E"/><path d="M11.6 2.5c-.9 1.6.4 3 1.7 4 1.2-1.1 1.9-2.2 1.3-3.5-.5-1.1-2.1-1.6-3-.5z" fill="#EA2D2E"/><path d="M4 14.2c.4 2.8 3 4.8 6.8 5 1.5.1 3.1.1 4.6-.2 2.5-.5 4.3-1.8 4.4-4V11H4v3.2zm15.4-1.7h-1.3v1.9c0 1.2-.8 2.1-2 2.5 1.8-.3 3.3-1.3 3.3-3.1v-1.3z" fill="#5382A1"/><path d="M3.2 19.8c2.7.9 7 1.3 10.7.8 2.5-.3 4.9-.9 6.3-1.7l.5.8c-1.7 1-4.3 1.7-7 2-3.9.4-8.4 0-11-1l.5-.9z" fill="#5382A1"/></svg>`,
  python: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M11.9 2c-5 0-4.7 2.2-4.7 2.2l.01 2.3h4.8v.7H5.2S2 6.8 2 12c0 5.1 2.8 4.9 2.8 4.9h1.7v-2.3s-.1-2.8 2.8-2.8h4.7s2.7 0 2.7-2.6V4.7S17 2 11.9 2zm-2.6 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="#3776AB"/><path d="M12.1 22c5 0 4.7-2.2 4.7-2.2l-.01-2.3h-4.8v-.7h6.8s3.2.4 3.2-4.8c0-5.1-2.8-4.9-2.8-4.9h-1.7v2.3s.1 2.8-2.8 2.8H10s-2.7 0-2.7 2.6v4.5s-.4 2.7 4.8 2.7zm2.6-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="#FFD43B"/></svg>`,
  csharp: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M12 1.5l9 5.2v10.6l-9 5.2-9-5.2V6.7l9-5.2z" fill="#9B4993"/><path d="M11.5 15.6c-2 0-3.3-1.4-3.3-3.6 0-2.2 1.3-3.6 3.3-3.6 1.3 0 2.2.6 2.7 1.5l-1.4.9c-.3-.5-.7-.8-1.3-.8-1.1 0-1.8.8-1.8 2s.7 2 1.8 2c.6 0 1-.3 1.3-.8l1.4.9c-.5.9-1.4 1.4-2.7 1.4zm3.9-.8l.4-1.5h-.9l.3-1.1h.9l.4-1.5h1.1l-.4 1.5h1l.4-1.5h1.1l-.4 1.5h.9l-.3 1.1h-.9l-.4 1.5h1.1l-.3 1.1h-.9l-.4 1.5h-1.1l.4-1.5h-1l-.4 1.5h-1.1l.4-1.5h-.9l.3-1.1h.9zm1.3 0h1l.3-1.1h-1l-.3 1.1z" fill="#fff"/></svg>`,
  php: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><ellipse cx="12" cy="12" rx="11" ry="7.2" fill="#777BB4"/><path d="M5.5 14.5l1.6-5.2h2.2c1.2 0 1.9.5 1.7 1.6-.2 1.2-1.1 1.7-2.3 1.7H7.1l-.6 1.9H5.5zm2.1-3.1h1.1c.5 0 .9-.2 1-.7.1-.5-.2-.7-.7-.7H7.9l-.3 1.4zm4.4 3.1l1.6-5.2h1.4l-.7 2.2h1.6c1.2 0 1.9.5 1.7 1.6-.2 1.2-1.1 1.7-2.3 1.7h-2.1l-.6 1.9H12zm2.1-3.1h1.1c.5 0 .9-.2 1-.7.1-.5-.2-.7-.7-.7h-.8l-.3 1.4zm3.7 3.1l1.6-5.2h1.4l-.7 2.2h1.8c1.2 0 1.9.5 1.7 1.6-.2 1.2-1.1 1.7-2.3 1.7H20l-.6 1.9h-1.6zm2.1-3.1h1.1c.5 0 .9-.2 1-.7.1-.5-.2-.7-.7-.7h-.8l-.3 1.4z" fill="#fff"/></svg>`,
  html5: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M3.2 2l1.6 18.2L12 22.4l7.2-2.2L20.8 2H3.2z" fill="#E34F26"/><path d="M12 3.8v16.7l5.6-1.7 1.3-15H12z" fill="#EF652A"/><path d="M12 8.4H7.8l.2 2.4h4V13H8.2l.2 2.4H12v2.4l-4.2-1.2-.3-3.6h2.2l.1 1.4 2.2.6v-1.6z" fill="#fff"/><path d="M12 8.4h4.4l-.4 4.8-4 1.1v-2.4l1.9-.5.2-1.9H12V8.4zm4.6-2.4H12V3.8h4.8l-.2 2.2z" fill="#EBEBEB"/></svg>`,
  css3: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M3.2 2l1.6 18.2L12 22.4l7.2-2.2L20.8 2H3.2z" fill="#1572B6"/><path d="M12 3.8v16.7l5.6-1.7 1.3-15H12z" fill="#33A9DC"/><path d="M12 8.4H7.8l.2 2.4H12V8.4zm0 4.6H8.2l.2 2.4H12v2.4l-4.2-1.2-.3-3.6h2.2l.1 1.4 2.2.6V13z" fill="#fff"/><path d="M12 8.4h4.4l-.4 4.8-4 1.1v-2.4l1.9-.5.2-1.9H12V8.4zm4.6-2.4H12V3.8h4.8l-.2 2.2z" fill="#EBEBEB"/></svg>`,
  mysql: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M18.8 13.5c-.3-.2-.7-.3-1.1-.2-.5.1-.9.4-1.3.6-.4.2-.8.4-1.3.4-.4 0-.8-.1-1.1-.4-.6-.6-.8-1.5-.6-2.3.2-.9.9-1.7 1.5-2.3 1-.9 2-1.7 2.9-2.7.2-.2.4-.5.4-.8 0-.4-.4-.7-.7-.7-.3 0-.6.1-.8.4-1.1 1.1-2.4 2.1-3.4 3.3-.9.9-1.6 1.9-2 3.1-.4 1.1-.5 2.3-.1 3.4.3.9.9 1.6 1.7 2 .7.4 1.4.5 2.2.4.9-.1 1.8-.5 2.6-1 .4-.3.9-.6 1.4-.8.4-.1.8-.1 1 .1.2.1.4.4.3.7-.1.6-.7 1-1.2 1.3-1.2.7-2.6 1-4 1-1.6 0-3.1-.7-4.2-1.8-1.3-1.2-2-2.8-2.2-4.5-.1-1.6.4-3.2 1.2-4.5.8-1.2 1.9-2.1 3.1-2.8.7-.4 1.5-.7 2.3-.8.4-.1.7-.1 1 .1.2.1.3.4.2.7-.1.2-.3.4-.5.5-.9.4-1.8 1.1-2.5 1.8-.9 1-1.7 2-2 3.3-.4 1.2-.4 2.5 0 3.7.4 1 1.1 1.8 2 2.3.8.4 1.7.6 2.7.4.9-.1 1.9-.6 2.6-1.2.4-.3.7-.7 1.2-.8.5-.2 1.1-.1 1.5.2.3.2.4.6.4 1-.2.5-.7.9-1.2 1.2z" fill="#00758F"/><path d="M12 20.8c-2.4 0-4.7-.7-6.5-2.1-.3-.2-.4-.6-.2-.9.2-.3.6-.4.9-.2 1.6 1.2 3.6 1.8 5.7 1.8 1 0 2-.1 3-.5.4-.1.8 0 1 .4.1.4 0 .8-.4 1-1.1.3-2.3.5-3.5.5z" fill="#F29111"/></svg>`,
  git: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M21.6 10.9L13.1 2.4c-.6-.6-1.5-.6-2.1 0L8.9 4.5l2.7 2.7c.6-.2 1.3-.1 1.8.4.5.5.6 1.3.4 1.9l2.6 2.6c.6-.2 1.4-.1 1.9.4.7.7.7 1.8 0 2.5-.7.7-1.8.7-2.5 0-.6-.6-.7-1.4-.3-2.1l-2.4-2.4v5.3c.2.2.3.4.3.7 0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5c0-.6.4-1.1.9-1.4V9.3c-.6-.3-.9-.9-.9-1.5 0-.4.2-.8.4-1.1L8.3 4.1 2.4 10c-.6.6-.6 1.5 0 2.1l8.5 8.5c.6.6 1.5.6 2.1 0l8.5-8.5c.6-.6.6-1.5.1-2.1z" fill="#F05032"/></svg>`,
  github: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  vscode: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true"><path d="M17.6 2.3l4.6 2.2c.5.3.8.8.8 1.4v12.2c0 .6-.3 1.1-.8 1.4l-4.6 2.2c-.6.3-1.3.1-1.7-.4L9.1 14.5l-4.5 3.5c-.3.2-.8.2-1.1 0L1.4 16.5c-.5-.4-.6-1.1-.3-1.6l3.8-4.9-3.8-4.9c-.3-.5-.2-1.2.3-1.6l2.1-1.5c.3-.2.8-.2 1.1 0l4.5 3.5 6.8-6.8c.4-.5 1.1-.7 1.7-.4z" fill="#007ACC"/><path d="M17.6 2.3c-.6-.3-1.3-.1-1.7.4L9.1 9.5l2.9 2.5 5.6-5.6V2.3z" fill="#0065A9"/><path d="M17.6 21.7c-.6.3-1.3.1-1.7-.4L9.1 14.5l2.9-2.5 5.6 5.6v4.1z" fill="#0065A9"/><path d="M17.6 6.4L12 12l5.6 5.6 4.6-2.2c.5-.3.8-.8.8-1.4V8c0-.6-.3-1.1-.8-1.4l-4.6-.2z" fill="#1F9CF0"/></svg>`,
  sdlc: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:var(--lime)"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>`,
  nextjs: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.8 14.8l-5.6-7.8v7.8H8.8V7.2h1.5l5.9 8.2V7.2h1.6v9.6z"/></svg>`,
  javascript: `<svg class="tech-icon" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><rect width="24" height="24" rx="3.5" fill="#F7DF1E"/><path d="M7.4 17.6c.6.9 1.5 1.5 2.7 1.5 1.4 0 2.2-.8 2.2-2.4V8.5H10v8.1c0 .7-.3 1-1 1-.5 0-.9-.3-1.2-.6l-.4.6zm8.1.1c1.2 0 2.2-.6 2.8-1.5l-.8-.5c-.4.6-1.1 1-1.9 1-1.1 0-1.8-.7-1.8-1.7 0-1.2.9-1.6 2.1-2.1 1.6-.7 2.6-1.3 2.6-2.9 0-1.6-1.2-2.7-2.8-2.7-1.4 0-2.3.6-2.8 1.6l.8.5c.3-.6.9-1.1 1.9-1.1 1 0 1.7.6 1.7 1.6 0 1.1-.8 1.5-2.1 2.1-1.5.6-2.6 1.3-2.6 2.9-.1 1.7 1.2 2.8 2.9 2.8z" fill="#000"/></svg>`
};

const stacks = {
  field: [
    { label: 'Hardware diagnostics' },
    { label: 'Laptop repair' },
    { label: 'Lenovo systems' },
    { label: 'Network troubleshooting' },
    { label: 'Structured cabling' },
    { label: 'CCTV / NVR' },
    { label: 'Technical documentation' },
    { label: 'B2B support' },
    { label: 'VirtualBox' },
    { label: 'Packet Tracer' },
    { label: 'IP networking' }
  ],
  dev: [
    { label: 'Java', icons: [TECH_ICONS.java] },
    { label: 'Python', icons: [TECH_ICONS.python] },
    { label: 'C#', icons: [TECH_ICONS.csharp] },
    { label: 'PHP', icons: [TECH_ICONS.php] },
    { label: 'HTML & CSS', icons: [TECH_ICONS.html5, TECH_ICONS.css3] },
    { label: 'MySQL', icons: [TECH_ICONS.mysql] },
    { label: 'Git & GitHub', icons: [TECH_ICONS.git, TECH_ICONS.github] },
    { label: 'VS Code', icons: [TECH_ICONS.vscode] },
    { label: 'SDLC', icons: [TECH_ICONS.sdlc] },
    { label: 'Next.js', icons: [TECH_ICONS.nextjs] },
    { label: 'JavaScript', icons: [TECH_ICONS.javascript] }
  ]
};

const skills = document.querySelector('#skills');
const fieldCards = document.getElementById('toolkit-cards-field');
const devCards = document.getElementById('toolkit-cards-dev');
const fieldBottom = document.getElementById('toolkit-bottom-field');
const toolkitSub = document.querySelector('.toolkit-sub');

function showStack(key) {
  const isDev = key === 'dev';
  const list = stacks[key];
  if (!skills || !list) return;

  const fragment = document.createDocumentFragment();

  // Create 2 identical sets for seamless infinite loop (0% -> -50%)
  for (let pass = 0; pass < 2; pass++) {
    const isClone = pass === 1;
    list.forEach(item => {
      const itemEl = document.createElement('span');
      itemEl.className = 'ticker-item' + (isClone ? ' ticker-clone' : '');

      if (isDev && item.icons && item.icons.length) {
        const iconWrap = document.createElement('span');
        iconWrap.className = 'ticker-icons';
        iconWrap.innerHTML = item.icons.join('');
        itemEl.appendChild(iconWrap);
      }

      const textEl = document.createElement('span');
      textEl.className = 'ticker-text';
      textEl.textContent = item.label;
      itemEl.appendChild(textEl);

      fragment.appendChild(itemEl);

      const sep = document.createElement('span');
      sep.className = 'ticker-sep' + (isClone ? ' ticker-clone' : '');
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '+';
      fragment.appendChild(sep);
    });
  }

  skills.replaceChildren(fragment);

  // Smoothly restart ticker animation on stack change
  skills.style.animation = 'none';
  void skills.offsetWidth;
  skills.style.animation = '';

  document.querySelectorAll('[data-stack]').forEach(btn => {
    const active = btn.dataset.stack === key;
    btn.classList.toggle('selected', active);
    btn.setAttribute('aria-pressed', active);
  });

  const isField = key === 'field';
  if (fieldCards) fieldCards.style.display = isField ? '' : 'none';
  if (devCards) devCards.style.display = isField ? 'none' : '';
  if (fieldBottom) fieldBottom.style.display = isField ? '' : 'none';
  if (toolkitSub) {
    toolkitSub.textContent = isField
      ? 'Tools, systems, and technologies I work with to solve real-world IT and field engineering problems.'
      : 'Languages, frameworks, and tools I use for software development, from building interfaces to deploying real-world applications.';
  }
}
showStack('field');
document.querySelectorAll('[data-stack]').forEach(btn => btn.addEventListener('click', () => showStack(btn.dataset.stack)));

/* ─── Mobile menu ─── */
const menu=document.querySelector('.mobile-menu'),nav=document.querySelector('nav');
const tabbarMenuBtn=document.getElementById('tabbar-menu-btn');
function syncMenuState(isOpen){
  menu.setAttribute('aria-expanded',isOpen);
  menu.textContent=isOpen?'Close −':'Menu +';
  if(tabbarMenuBtn){
    tabbarMenuBtn.setAttribute('aria-expanded',isOpen);
    tabbarMenuBtn.classList.toggle('active',isOpen);
  }
}
menu.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  syncMenuState(open);
});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  syncMenuState(false);
  if(a.hash)setActiveNav(a.hash.slice(1));
}));
if(tabbarMenuBtn){
  tabbarMenuBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    menu.click();
  });
}

/* ─── Theme toggle with GPU-accelerated circular warp reveal ─── */
const themeBtn = document.getElementById('theme-toggle');

function updateThemeVisuals(theme){
  themeBtn.textContent = theme === 'light' ? '☾' : '☀';
  themeBtn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
}

const curTheme = document.documentElement.dataset.theme || 'dark';
updateThemeVisuals(curTheme);

function executeThemeToggle(){
  const next = (document.documentElement.dataset.theme || 'dark') === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  updateThemeVisuals(next);
}

let isThemeTransitioning = false;
themeBtn.addEventListener('click', () => {
  if (isThemeTransitioning) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Immediate tactile rotation on button (no forced layout reflow)
  themeBtn.classList.remove('theme-warping');
  requestAnimationFrame(() => {
    themeBtn.classList.add('theme-warping');
  });

  if (prefersReduced || !document.startViewTransition) {
    document.body.classList.add('theme-switching');
    executeThemeToggle();
    window.dispatchEvent(new CustomEvent('themetoggle'));
    setTimeout(() => {
      document.body.classList.remove('theme-switching');
      themeBtn.classList.remove('theme-warping');
    }, 280);
    return;
  }

  isThemeTransitioning = true;
  const rect = themeBtn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  document.documentElement.classList.add('vt-theme');
  const transition = document.startViewTransition(() => {
    executeThemeToggle();
    window.dispatchEvent(new CustomEvent('themetoggle'));
  });

  transition.ready.then(() => {
    document.documentElement.classList.remove('vt-theme');
    // Hardware-accelerated circular clipPath animation on compositor thread
    const anim = document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: 440,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pseudoElement: '::view-transition-new(root)'
      }
    );
    return anim.finished;
  }).catch(() => {}).finally(() => {
    document.documentElement.classList.remove('vt-theme');
    isThemeTransitioning = false;
    themeBtn.classList.remove('theme-warping');
  });
});

/* ─── Active nav scroll-spy (Precomputed Zero-Layout-Thrash Math) ─── */
const sections = Array.from(document.querySelectorAll('main section[id]'));
const navLinks = document.querySelectorAll('nav a');
const tabbarItems = document.querySelectorAll('.mobile-tabbar .tabbar-item');
let activeNavId = null;

function setActiveNav(id){
  if(activeNavId === id) return;
  activeNavId = id;
  navLinks.forEach(a => a.classList.toggle('active', a.hash === '#' + id));
  tabbarItems.forEach(item => {
    const target = item.dataset.nav;
    const isMatch = target === id || (id === 'overview' && target === 'overview');
    item.classList.toggle('active', isMatch);
  });
}

// Precompute section offsets to completely eliminate getBoundingClientRect on scroll
let sectionLayout = [];
function cacheSectionLayout(){
  const scrollY = window.scrollY || window.pageYOffset || 0;
  sectionLayout = sections.map(s => {
    const rect = s.getBoundingClientRect();
    return {
      id: s.id,
      top: rect.top + scrollY,
      bottom: rect.bottom + scrollY
    };
  });
}
cacheSectionLayout();

/* ─── Mobile Floating Tab Bar Scroll Behavior (Merged in unified rAF tick) ─── */
const mobileTabbar = document.getElementById('mobile-tabbar');
let lastScrollY = window.scrollY;
const scrollDeltaThreshold = 12;

if(mobileTabbar){
  mobileTabbar.querySelectorAll('.tabbar-item:not(#tabbar-menu-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
      if(nav && nav.classList.contains('open')){
        nav.classList.remove('open');
        syncMenuState(false);
      }
      const targetId = btn.getAttribute('href')?.slice(1);
      if(targetId) setActiveNav(targetId);
    });
  });
}

function updateScrollUI(){
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const vh = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight;
  const distFromBottom = (scrollHeight - vh) - scrollY;
  lastScrollY = scrollY;

  // 2. High-performance scroll-spy using precomputed layout (0 reflows)
  if(!sectionLayout.length) return;

  if(distFromBottom <= 80){
    setActiveNav(sectionLayout[sectionLayout.length - 1].id);
    return;
  }

  if(scrollY <= 60){
    setActiveNav(sectionLayout[0].id);
    return;
  }

  const probeY = scrollY + vh * 0.42;
  for(let i = 0; i < sectionLayout.length; i++){
    const s = sectionLayout[i];
    if(probeY >= s.top && probeY < s.bottom){
      setActiveNav(s.id);
      break;
    }
  }
}

let navTicking = false;
function onNavScroll(){
  if(!navTicking){
    requestAnimationFrame(() => {
      updateScrollUI();
      navTicking = false;
    });
    navTicking = true;
  }
}
window.addEventListener('scroll', onNavScroll, { passive: true });
window.addEventListener('resize', () => {
  cacheSectionLayout();
  onNavScroll();
}, { passive: true });
updateScrollUI();

/* ─── Interactive Card Spotlight Glow (Delegated & rAF Throttled) ─── */
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !('ontouchstart' in window)){
  let cardGlowRaf = null;
  let activeCard = null;
  let activeCardRect = null;
  let clientX = 0, clientY = 0;

  document.addEventListener('pointerover', (e) => {
    const card = e.target.closest('.work-feature, .interactive-slide, .principle-item');
    if(card){
      activeCard = card;
      activeCardRect = card.getBoundingClientRect();
    }
  }, { passive: true });

  document.addEventListener('pointerout', (e) => {
    if(activeCard && (e.target === activeCard || !activeCard.contains(e.relatedTarget))){
      activeCard = null;
      activeCardRect = null;
    }
  }, { passive: true });

  document.addEventListener('pointermove', (e) => {
    if(!activeCard) return;
    clientX = e.clientX;
    clientY = e.clientY;
    if(!cardGlowRaf){
      cardGlowRaf = requestAnimationFrame(() => {
        if(activeCard && activeCardRect){
          activeCard.style.setProperty('--mouse-x', `${clientX - activeCardRect.left}px`);
          activeCard.style.setProperty('--mouse-y', `${clientY - activeCardRect.top}px`);
        }
        cardGlowRaf = null;
      });
    }
  }, { passive: true });
}

/* ─── Case / credential dialogs ─── */
document.querySelectorAll('[data-case]').forEach(btn=>{
  btn.addEventListener('click',e=>{
    e.preventDefault();
    const map={mec:'case-dialog',triphil:'triphil-dialog',ganap:'ganap-dialog',codex:'codex-dialog',c1p:'c1p-dialog',typing:'typing-dialog'};
    const id=map[btn.dataset.case]||'case-dialog';
    document.getElementById(id).showModal();
  });
});
document.querySelectorAll('[data-scroll]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.getElementById(btn.dataset.scroll).scrollIntoView({behavior:'smooth'});
  });
});
document.querySelectorAll('[data-image]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector('#image-title').textContent=btn.dataset.title;const img=document.querySelector('#credential-image');img.src=btn.dataset.image;img.alt=btn.dataset.title;document.querySelector('#image-dialog').showModal()}));
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});

/* ─── Copy email ─── */
document.querySelector('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('cyperpelina27@gmail.com');document.querySelector('#copy-status').textContent='Email copied. Talk soon!'}catch{document.querySelector('#copy-status').textContent='Copy this address: cyperpelina27@gmail.com'}});

/* ─── Clock ─── */
function tick(){document.querySelector('#clock').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())+' PHT · UTC+8'}tick();setInterval(tick,60000);document.querySelector('#year').textContent=new Date().getFullYear();

/* ─── Scroll-reveal ─── */
const revealObs=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObs.unobserve(entry.target)}})},{threshold:0.08,rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.section, .hero').forEach(section=>{
  const reveals=section.querySelectorAll('.reveal');
  reveals.forEach((el,i)=>{el.style.transitionDelay=`${i*90}ms`;revealObs.observe(el)});
});
/* Standalone reveals outside sections */
document.querySelectorAll('.reveal').forEach(el=>{if(!el.closest('.section')&&!el.closest('.hero')){revealObs.observe(el)}});
/* Section visibility for heading animations */
const sectionObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:0.1});
document.querySelectorAll('.section').forEach(s=>sectionObs.observe(s));

/* ═══════════════════════════════════════════════
   PROJECT CAROUSEL
   ═══════════════════════════════════════════════ */
(function(){
  const track=document.querySelector('.carousel-track');
  if(!track)return;
  const slides=track.querySelectorAll('.carousel-slide');
  const prevBtn=document.querySelector('.carousel-prev');
  const nextBtn=document.querySelector('.carousel-next');
  const counter=document.querySelector('.carousel-counter');
  const carouselEl=document.querySelector('.carousel');
  const total=slides.length;
  let current=0;
  let animating=false;

  function pad(n){return String(n).padStart(2,'0')}
  function updateCounter(){counter.textContent=pad(current+1)+' / '+pad(total)}

  function goTo(index,direction){
    if(animating||index===current)return;
    animating=true;

    const outSlide=slides[current];
    const inSlide=slides[index];
    const dir=direction||(index>current?'next':'prev');

    /* Phase 1: fade out current */
    outSlide.style.transition='opacity .2s ease, transform .2s ease';
    outSlide.style.opacity='0';
    outSlide.style.transform=dir==='next'?'translateX(-24px)':'translateX(24px)';

    setTimeout(()=>{
      outSlide.classList.remove('active');
      outSlide.style.cssText='';

      /* Phase 2: prep incoming slide */
      inSlide.style.transition='none';
      inSlide.style.opacity='0';
      inSlide.style.transform=dir==='next'?'translateX(24px)':'translateX(-24px)';
      inSlide.classList.add('active');

      /* Force reflow */
      void inSlide.offsetHeight;

      /* Phase 3: animate in */
      inSlide.style.transition='opacity .35s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1)';
      inSlide.style.opacity='1';
      inSlide.style.transform='translateX(0)';

      current=index;
      updateCounter();

      setTimeout(()=>{
        inSlide.style.cssText='';
        animating=false;
      },360);
    },210);
  }

  function next(){goTo((current+1)%total,'next')}
  function prev(){goTo((current-1+total)%total,'prev')}

  prevBtn.addEventListener('click',prev);
  nextBtn.addEventListener('click',next);

  /* Keyboard: arrow keys when work section is in view */
  let workInView=false;
  const workObs=new IntersectionObserver(([e])=>{workInView=e.isIntersecting},{threshold:0.15});
  workObs.observe(document.getElementById('work'));

  document.addEventListener('keydown',e=>{
    if(!workInView)return;
    if(e.key==='ArrowRight'){e.preventDefault();next()}
    if(e.key==='ArrowLeft'){e.preventDefault();prev()}
  });

  /* Touch swipe */
  let touchX=0;
  carouselEl.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX},{passive:true});
  carouselEl.addEventListener('touchend',e=>{
    const diff=touchX-e.changedTouches[0].clientX;
    if(Math.abs(diff)>50){diff>0?next():prev()}
  });

  updateCounter();
})();

/* ═══════════════════════════════════════════════
   GITHUB LIVE ACTIVITY (Cached Singleton, Zero-Lag)
   ═══════════════════════════════════════════════ */
(function(){
  const GH_USER = 'cyper11';
  const CACHE_KEY = 'gh_heatmap_v2';
  const CACHE_TTL = 6 * 3600 * 1000; // 6 hours
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  let memData = null;
  let inFlightPromise = null;
  let rendered = false;
  const tipCache = new Map();

  function cacheGet(){
    if(memData) return memData;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        if(Date.now() - parsed.ts < CACHE_TTL){
          memData = parsed.data;
          return memData;
        }
      }
    }catch(e){}
    return null;
  }

  function cacheSet(data){
    memData = data;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    }catch(e){}
  }

  async function fetchHeatmapData(){
    const cached = cacheGet();
    if(cached) return cached;
    if(inFlightPromise) return inFlightPromise;

    inFlightPromise = (async () => {
      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
        if(!res.ok) throw new Error('API offline');
        const json = await res.json();
        cacheSet(json);
        return json;
      } finally {
        inFlightPromise = null;
      }
    })();

    return inFlightPromise;
  }

  let tip = document.querySelector('.gh-tip');
  if(!tip){
    tip = document.createElement('div');
    tip.className = 'gh-tip';
    document.body.appendChild(tip);
  }

  function renderHeatmap(data){
    if(rendered) return;
    const hEl = document.getElementById('gh-heatmap');
    const mEl = document.getElementById('gh-months');
    const tEl = document.getElementById('gh-total');
    if(!hEl || !mEl || !tEl) return;

    try {
      const contributions = data.contributions;
      const total = data.total ? data.total.lastYear || Object.values(data.total).reduce((a, b) => a + b, 0) : 0;
      tEl.innerHTML = `<span class="gh-total-num">${total.toLocaleString()}</span> contributions in the last year`;

      const weeks = [];
      let cw = [];
      tipCache.clear();

      // Precompute weeks and tooltip content in a single linear pass
      for(let i = 0; i < contributions.length; i++){
        const c = contributions[i];
        const parts = c.date.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);

        if(i === 0){
          for(let p = 0; p < d.getDay(); p++) cw.push(null);
        }
        cw.push(c);

        // Precompute formatted date string once
        const dateStr = `${MONTHS[month]} ${day}, ${year}`;
        const count = c.count || 0;
        const countStr = `<strong>${count > 0 ? count : 'No'}</strong> ${count === 1 ? 'contribution' : 'contributions'}`;
        tipCache.set(c.date, `<span class="gh-tip-date">${dateStr}</span><span class="gh-tip-count">${countStr}</span>`);

        if(d.getDay() === 6 || i === contributions.length - 1){
          weeks.push(cw);
          cw = [];
        }
      }

      // Generate months header
      let lm = -1;
      const ml = [];
      weeks.forEach((w, wi) => {
        const f = w.find(d => d);
        if(f){
          const m = parseInt(f.date.split('-')[1], 10) - 1;
          if(m !== lm){
            ml.push({ week: wi, label: MONTHS[m] });
            lm = m;
          }
        }
      });

      const colStep = 15; // 12px day cell + 3px gap
      mEl.innerHTML = ml.map((m, i) => {
        const n = ml[i + 1];
        const s = n ? (n.week - m.week) * colStep : (weeks.length - m.week) * colStep;
        return `<span style="width:${s}px">${m.label}</span>`;
      }).join('');

      // Build DOM in a single innerHTML injection
      hEl.innerHTML = weeks.map(w => {
        const c = [];
        for(let d = 0; d < 7; d++){
          const e = w[d];
          if(!e) c.push('<div class="gh-day" data-level="0" style="visibility:hidden"></div>');
          else c.push(`<div class="gh-day" data-level="${e.level}" data-date="${e.date}"></div>`);
        }
        return `<div class="gh-week">${c.join('')}</div>`;
      }).join('');

      // Efficient event delegation with Map lookup and transform positioning
      let activeHoverDate = null;
      hEl.addEventListener('mouseover', e => {
        const dayEl = e.target.closest('.gh-day');
        if(!dayEl || !dayEl.dataset.date) return;
        const date = dayEl.dataset.date;
        if(activeHoverDate === date) return;
        activeHoverDate = date;

        const tipHtml = tipCache.get(date);
        if(!tipHtml) return;

        tip.innerHTML = tipHtml;
        tip.classList.add('show');
        const rect = dayEl.getBoundingClientRect();
        const posX = Math.round(rect.left + rect.width / 2);
        const posY = Math.round(rect.top - 8);
        tip.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -100%)`;
      }, { passive: true });

      hEl.addEventListener('mouseout', e => {
        if(e.target.closest('.gh-day')){
          activeHoverDate = null;
          tip.classList.remove('show');
        }
      }, { passive: true });

      rendered = true;
    } catch(err){
      console.warn('Heatmap render fallback:', err);
      showErrorState();
    }
  }

  function showLoadingState(){
    const tEl = document.getElementById('gh-total');
    const hEl = document.getElementById('gh-heatmap');
    if(tEl) tEl.innerHTML = '<span class="gh-total-num">—</span> Loading activity…';
    if(hEl && !rendered) hEl.innerHTML = '<div class="gh-placeholder">Loading activity…</div>';
  }

  function showErrorState(){
    const tEl = document.getElementById('gh-total');
    const hEl = document.getElementById('gh-heatmap');
    if(tEl) tEl.innerHTML = '<span class="gh-total-num">—</span> Activity unavailable';
    if(hEl && !rendered) hEl.innerHTML = '<div class="gh-placeholder">Activity unavailable</div>';
  }

  async function loadAndRender(){
    if(rendered) return;
    showLoadingState();
    try {
      const data = await fetchHeatmapData();
      renderHeatmap(data);
    } catch(e){
      showErrorState();
    }
  }

  // Check cache immediately: if available, render with zero network delay
  const cached = cacheGet();
  if(cached){
    renderHeatmap(cached);
  } else {
    // If not in cache, observe Section 07 to fetch when approaching viewport (or on idle)
    const actSection = document.getElementById('activity');
    if(actSection && 'IntersectionObserver' in window){
      const obs = new IntersectionObserver(([entry]) => {
        if(entry.isIntersecting){
          obs.disconnect();
          loadAndRender();
        }
      }, { rootMargin: '400px' });
      obs.observe(actSection);

      // Preload after 2.5s idle if user stays at top of page
      if('requestIdleCallback' in window){
        requestIdleCallback(() => { if(!rendered) loadAndRender(); }, { timeout: 3000 });
      } else {
        setTimeout(() => { if(!rendered) loadAndRender(); }, 3000);
      }
    } else {
      loadAndRender();
    }
  }
})();

/* ═══════════════════════════════════════════════
   CURSOR GLOW (Event-Delegated, Zero-Reflow)
   ═══════════════════════════════════════════════ */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(window.matchMedia('(max-width: 850px)').matches || ('ontouchstart' in window)) return;

  const targets = document.querySelectorAll('.hero, .lab-card, .contact-panel');
  targets.forEach(el => {
    el.classList.add('cursor-glow-target');
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    el.appendChild(glow);
  });

  let activeTarget = null;
  let activeRect = null;
  let mouseX = 0, mouseY = 0;
  let glowTicking = false;

  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('.cursor-glow-target');
    if(target){
      activeTarget = target;
      activeRect = target.getBoundingClientRect();
    }
  }, { passive: true });

  document.addEventListener('pointerout', (e) => {
    if(activeTarget && (e.target === activeTarget || !activeTarget.contains(e.relatedTarget))){
      activeTarget = null;
      activeRect = null;
    }
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    if(!activeTarget) return;
    mouseX = e.clientX;
    mouseY = e.clientY;

    if(!glowTicking){
      glowTicking = true;
      requestAnimationFrame(() => {
        if(activeTarget && activeRect){
          activeTarget.style.setProperty('--glow-x', `${mouseX - activeRect.left}px`);
          activeTarget.style.setProperty('--glow-y', `${mouseY - activeRect.top}px`);
        }
        glowTicking = false;
      });
    }
  }, { passive: true });
})();

/* ─── Marquee: Offscreen Pause & Reduced Motion ─── */
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const specTrack = document.querySelector('.specialties-track');
  const skillsTrack = document.querySelector('.skills-track');

  if(prefersReduced){
    if(specTrack) specTrack.style.animationPlayState = 'paused';
    if(skillsTrack) skillsTrack.style.animationPlayState = 'paused';
    return;
  }

  // Only animate marquees when in the viewport to conserve compositor threads
  if('IntersectionObserver' in window){
    const marqueeObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const track = entry.target.querySelector('.specialties-track, .skills-track');
        if(track){
          track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        }
      });
    }, { threshold: 0.05 });

    const specContainer = document.querySelector('.specialties');
    const skillsContainer = document.querySelector('.skills-marquee');
    if(specContainer) marqueeObs.observe(specContainer);
    if(skillsContainer) marqueeObs.observe(skillsContainer);
  }
})();

/* ═══════════════════════════════════════════════
   "CLICK THIS" EASTER EGG (ephemeral, browser-side)
   ═══════════════════════════════════════════════ */
(function(){
  const triggerBtn=document.getElementById('click-this-btn');
  const overlay=document.getElementById('ee-overlay');
  if(!triggerBtn||!overlay)return;

  const logEl=document.getElementById('ee-log');
  const bodyEl=document.getElementById('ee-body');
  const terminalEl=document.getElementById('ee-terminal');
  const promptActions=document.getElementById('ee-prompt-actions');
  const finalEl=document.getElementById('ee-final');
  const continueBtn=document.getElementById('ee-continue-btn');
  const cancelBtn=document.getElementById('ee-cancel-btn');
  const closeTopBtn=document.getElementById('ee-close-top');
  const replayBtn=document.getElementById('ee-replay-btn');
  const closeBtn=document.getElementById('ee-close-btn');

  let runId=0;
  let activeCursor=null;
  let abortCtrl=null;

  function isReducedMotion(){
    return window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  }

  function wait(ms,id){
    const d=isReducedMotion()?Math.min(ms,80):ms;
    return new Promise(resolve=>{
      setTimeout(()=>resolve(id===runId),d);
    });
  }

  function triggerFlicker(){
    if(isReducedMotion())return;
    overlay.classList.remove('ee-flicker');
    void overlay.offsetWidth;
    overlay.classList.add('ee-flicker');
    setTimeout(()=>overlay.classList.remove('ee-flicker'),240);
  }

  function attachCursor(el){
    if(activeCursor&&activeCursor.parentNode){
      activeCursor.parentNode.removeChild(activeCursor);
    }
    const c=document.createElement('span');
    c.className='ee-cursor';
    c.setAttribute('aria-hidden','true');
    el.appendChild(c);
    activeCursor=c;
  }

  function scrollToBottom(){
    if(bodyEl)bodyEl.scrollTop=bodyEl.scrollHeight;
  }

  async function typeLine(text,id,cls='',charSpeed=22){
    if(id!==runId)return false;
    const p=document.createElement('p');
    p.className='ee-line'+(cls?' '+cls:'');
    const span=document.createElement('span');
    p.appendChild(span);
    logEl.appendChild(p);
    attachCursor(p);
    scrollToBottom();

    if(isReducedMotion()||charSpeed<=0){
      span.textContent=text;
      scrollToBottom();
      return true;
    }

    for(let i=1;i<=text.length;i++){
      if(id!==runId)return false;
      span.textContent=text.slice(0,i);
      scrollToBottom();
      await new Promise(r=>setTimeout(r,charSpeed));
    }
    return id===runId;
  }

  async function typeKeyValue(key,val,id){
    if(id!==runId)return false;
    const p=document.createElement('p');
    p.className='ee-line ee-bright';
    const kSpan=document.createElement('span');
    kSpan.className='ee-key';
    const vSpan=document.createElement('span');
    vSpan.className='ee-val';
    p.appendChild(kSpan);
    p.appendChild(vSpan);
    logEl.appendChild(p);
    attachCursor(p);
    scrollToBottom();

    const prefix='> '+key+': ';
    if(isReducedMotion()){
      kSpan.textContent=prefix;
      vSpan.textContent=val;
      scrollToBottom();
      return true;
    }
    for(let i=1;i<=prefix.length;i++){
      if(id!==runId)return false;
      kSpan.textContent=prefix.slice(0,i);
      await new Promise(r=>setTimeout(r,14));
    }
    for(let i=1;i<=val.length;i++){
      if(id!==runId)return false;
      vSpan.textContent=val.slice(0,i);
      scrollToBottom();
      await new Promise(r=>setTimeout(r,18));
    }
    return id===runId;
  }

  function addSpacer(){
    const div=document.createElement('div');
    div.className='ee-line ee-spacer';
    logEl.appendChild(div);
  }

  function detectBrowserEnv(){
    const ua=navigator.userAgent||'';
    let os='UNKNOWN OS';
    if(/Windows/i.test(ua))os='WINDOWS';
    else if(/Android/i.test(ua))os='ANDROID';
    else if(/iPhone|iPad|iPod/i.test(ua))os='IOS';
    else if(/Mac OS X|Macintosh/i.test(ua))os='MACOS';
    else if(/Linux/i.test(ua))os='LINUX';

    let browser='BROWSER';
    if(/Edg\//i.test(ua))browser='EDGE';
    else if(/OPR\/|Opera/i.test(ua))browser='OPERA';
    else if(/Chrome\//i.test(ua)&&!/Edg\//i.test(ua))browser='CHROME';
    else if(/Firefox\//i.test(ua))browser='FIREFOX';
    else if(/Safari\//i.test(ua)&&!/Chrome\//i.test(ua))browser='SAFARI';

    const lang=(navigator.language||'EN-US').toUpperCase();
    const threads=navigator.hardwareConcurrency?String(navigator.hardwareConcurrency):null;
    const memory=navigator.deviceMemory?String(navigator.deviceMemory)+' GB':null;
    const display=(window.screen&&window.screen.width&&window.screen.height)?`${window.screen.width} × ${window.screen.height}`:`${window.innerWidth} × ${window.innerHeight}`;
    let tz='UTC';
    try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone.toUpperCase()}catch(e){}
    const conn=(navigator.connection&&navigator.connection.effectiveType)?String(navigator.connection.effectiveType).toUpperCase():null;
    const status=navigator.onLine?'ONLINE':'OFFLINE';

    return{os,browser,lang,threads,memory,display,tz,conn,status};
  }

  async function fetchEphemeralNetInfo(signal){
    try{
      const r=await fetch('https://ipwho.is/',{signal,cache:'no-store'});
      if(r.ok){
        const d=await r.json();
        if(d&&d.success!==false&&d.ip){
          return{
            ip:d.ip,
            isp:(d.connection&&(d.connection.isp||d.connection.org))||d.isp||null,
            lat:typeof d.latitude==='number'?d.latitude:null,
            lon:typeof d.longitude==='number'?d.longitude:null,
            region:[d.city,d.region].filter(Boolean).slice(0,2).join(', ')||null,
            country:d.country||null
          };
        }
      }
    }catch(e){}
    try{
      const r2=await fetch('https://ipapi.co/json/',{signal,cache:'no-store'});
      if(r2.ok){
        const d2=await r2.json();
        if(d2&&d2.ip){
          return{
            ip:d2.ip,
            isp:d2.org||null,
            lat:typeof d2.latitude==='number'?d2.latitude:null,
            lon:typeof d2.longitude==='number'?d2.longitude:null,
            region:[d2.city,d2.region].filter(Boolean).slice(0,2).join(', ')||null,
            country:d2.country_name||d2.country||null
          };
        }
      }
    }catch(e){}
    try{
      const r3=await fetch('https://api.ipify.org?format=json',{signal,cache:'no-store'});
      if(r3.ok){
        const d3=await r3.json();
        if(d3&&d3.ip)return{ip:d3.ip,isp:null,lat:null,lon:null,region:null,country:null};
      }
    }catch(e){}
    return null;
  }

  const statusLabel=overlay.querySelector('.ee-status span');

  async function typeStatusLine(prefix,badge,id,badgeCls='ee-accent'){
    if(id!==runId)return null;
    const p=document.createElement('p');
    p.className='ee-line ee-bright';
    const preSpan=document.createElement('span');
    preSpan.className='ee-key';
    const bSpan=document.createElement('span');
    bSpan.className='ee-val '+badgeCls;
    p.appendChild(preSpan);
    p.appendChild(bSpan);
    logEl.appendChild(p);
    attachCursor(p);
    scrollToBottom();

    if(isReducedMotion()){
      preSpan.textContent=prefix;
      bSpan.textContent=badge;
      scrollToBottom();
      return bSpan;
    }
    for(let i=1;i<=prefix.length;i++){
      if(id!==runId)return null;
      preSpan.textContent=prefix.slice(0,i);
      await new Promise(r=>setTimeout(r,15));
    }
    if(!(await wait(140,id)))return null;
    bSpan.textContent=badge;
    scrollToBottom();
    return bSpan;
  }

  async function typeScanProgress(id){
    if(id!==runId)return false;
    const p=document.createElement('p');
    p.className='ee-line ee-bright';
    const preSpan=document.createElement('span');
    preSpan.className='ee-key';
    const barSpan=document.createElement('span');
    barSpan.className='ee-val';
    p.appendChild(preSpan);
    p.appendChild(barSpan);
    logEl.appendChild(p);
    attachCursor(p);
    scrollToBottom();

    const prefix='> scanning browser environment... ';
    if(isReducedMotion()){
      preSpan.textContent=prefix;
      barSpan.textContent='[██████████████░░] 87%';
      await wait(80,id);
      barSpan.textContent='[████████████████] 100%';
      return id===runId;
    }
    for(let i=1;i<=prefix.length;i++){
      if(id!==runId)return false;
      preSpan.textContent=prefix.slice(0,i);
      await new Promise(r=>setTimeout(r,14));
    }
    const steps=[
      ['[███░░░░░░░░░░░░░] 19%',90],
      ['[███████░░░░░░░░░] 44%',95],
      ['[███████████░░░░░] 68%',100],
      ['[██████████████░░] 87%',240],
      ['[████████████████] 100%',140]
    ];
    for(const [txt,delay] of steps){
      if(id!==runId)return false;
      barSpan.textContent=txt;
      scrollToBottom();
      await new Promise(r=>setTimeout(r,delay));
    }
    return id===runId;
  }

  function corruptFewChars(container,degBadge){
    if(isReducedMotion())return()=>{};
    const saved=[];
    if(degBadge){
      saved.push({el:degBadge,txt:degBadge.textContent});
      degBadge.textContent='DΞGRΔD░D';
    }
    const keys=container.querySelectorAll('.ee-key');
    if(keys.length>=2){
      const t=keys[keys.length-2];
      saved.push({el:t,txt:t.textContent});
      t.textContent=t.textContent.replace('local data','l0c░l d∆ta');
    }
    return()=>{
      saved.forEach(item=>{item.el.textContent=item.txt});
    };
  }

  async function startPromptStage(){
    const id=++runId;
    if(abortCtrl){try{abortCtrl.abort()}catch(e){}abortCtrl=null}
    overlay.classList.remove('ee-anomaly');
    if(statusLabel)statusLabel.textContent='SESSION // UNKNOWN';
    logEl.innerHTML='';
    promptActions.hidden=true;
    finalEl.hidden=true;
    terminalEl.hidden=false;

    if(!(await wait(180,id)))return;
    if(!(await typeLine('> ???',id,'ee-bright',32)))return;
    if(!(await wait(420,id)))return;
    if(!(await typeLine('> are you sure?',id,'ee-accent',28)))return;
    if(!(await wait(220,id)))return;

    promptActions.hidden=false;
    continueBtn.focus();
  }

  async function runSequence(){
    const id=++runId;
    if(abortCtrl){try{abortCtrl.abort()}catch(e){}}
    abortCtrl=new AbortController();
    const timeoutId=setTimeout(()=>{try{abortCtrl.abort()}catch(e){}},4000);

    /* Ephemeral in-memory lookup — never saved anywhere */
    let netPromise=fetchEphemeralNetInfo(abortCtrl.signal).finally(()=>clearTimeout(timeoutId));

    overlay.classList.remove('ee-anomaly');
    if(statusLabel)statusLabel.textContent='SESSION // UNKNOWN';
    promptActions.hidden=true;
    finalEl.hidden=true;
    terminalEl.hidden=false;
    logEl.innerHTML='';

    if(!(await typeLine('> click registered.',id,'ee-bright',18)))return;
    if(!(await wait(240,id)))return;
    if(!(await typeLine('> initializing session...',id,'',18)))return;
    if(!(await wait(240,id)))return;
    if(!(await typeLine('> reading browser environment...',id,'',18)))return;
    if(!(await wait(260,id)))return;

    if(!(await typeScanProgress(id)))return;
    if(!(await wait(220,id)))return;
    if(!(await typeStatusLine('> checking session integrity... ','[OK]',id,'ee-accent')))return;
    if(!(await wait(220,id)))return;
    if(!(await typeStatusLine('> checking local data... ','[NONE]',id,'ee-accent')))return;
    if(!(await wait(420,id)))return;

    /* Subtle system anomaly (680ms) */
    addSpacer();
    if(!(await typeLine('> unusual response detected.',id,'ee-warn',20)))return;
    if(!(await wait(180,id)))return;
    const degBadge=await typeStatusLine('> session integrity: ','DEGRADED',id,'ee-warn');
    if(!degBadge)return;

    overlay.classList.add('ee-anomaly');
    if(statusLabel)statusLabel.textContent='SESSION // INTEGRITY DEGRADED';
    const restoreCorrupted=corruptFewChars(logEl,degBadge);
    if(!(await wait(680,id))){
      restoreCorrupted();
      overlay.classList.remove('ee-anomaly');
      return;
    }

    /* Recovery */
    if(!(await typeLine('> attempting recovery...',id,'',18)))return;
    if(!(await wait(380,id))){
      restoreCorrupted();
      overlay.classList.remove('ee-anomaly');
      return;
    }
    restoreCorrupted();
    overlay.classList.remove('ee-anomaly');
    if(statusLabel)statusLabel.textContent='SESSION // UNKNOWN';
    triggerFlicker();
    if(!(await typeLine('> recovery complete.',id,'ee-accent',18)))return;
    if(!(await wait(240,id)))return;
    if(!(await typeLine('> restoring interface...',id,'',18)))return;
    if(!(await wait(550,id)))return;

    triggerFlicker();
    logEl.innerHTML='';

    if(!(await typeLine("> here's what your browser revealed",id,'ee-bright',22)))return;
    if(!(await typeLine('> the moment you opened this site.',id,'ee-bright',20)))return;
    if(!(await wait(600,id)))return;

    addSpacer();
    const env=detectBrowserEnv();
    if(!(await typeKeyValue('operating system',env.os,id)))return;
    if(!(await wait(140,id)))return;
    if(!(await typeKeyValue('browser',env.browser,id)))return;
    if(!(await wait(140,id)))return;
    if(!(await typeKeyValue('language',env.lang,id)))return;
    if(!(await wait(140,id)))return;
    if(env.threads){
      if(!(await typeKeyValue('processor threads',env.threads,id)))return;
      if(!(await wait(140,id)))return;
    }
    if(env.memory){
      if(!(await typeKeyValue('memory estimate',env.memory,id)))return;
      if(!(await wait(140,id)))return;
    }
    if(!(await typeKeyValue('display',env.display,id)))return;
    if(!(await wait(140,id)))return;
    if(!(await typeKeyValue('timezone',env.tz,id)))return;
    if(!(await wait(140,id)))return;
    if(env.conn){
      if(!(await typeKeyValue('connection',env.conn,id)))return;
      if(!(await wait(140,id)))return;
    }
    if(!(await typeKeyValue('status',env.status,id)))return;
    if(!(await wait(520,id)))return;

    let net=await netPromise;
    if(id!==runId){net=null;return}

    if(net&&net.ip){
      addSpacer();
      if(!(await typeLine('> your public ip address is',id,'',18)))return;
      if(!(await typeLine('> '+net.ip,id,'ee-accent',22)))return;
      if(!(await wait(480,id)))return;

      if(net.isp){
        if(!(await typeLine('> you are connected through',id,'',18)))return;
        if(!(await typeLine('> '+String(net.isp).toUpperCase(),id,'ee-bright',18)))return;
        if(!(await wait(460,id)))return;
      }

      if(net.lat!==null&&net.lon!==null){
        if(!(await typeLine('> your approximate coordinates are around',id,'',18)))return;
        if(!(await typeLine(`> ${Number(net.lat).toFixed(4)}, ${Number(net.lon).toFixed(4)}`,id,'ee-accent',20)))return;
        if(!(await wait(460,id)))return;
      }

      if(net.region||net.country){
        const locStr=[net.region,net.country].filter(Boolean).join(', ').toUpperCase();
        if(!(await typeLine('> your approximate region is',id,'',18)))return;
        if(!(await typeLine('> '+locStr,id,'ee-bright',20)))return;
        if(!(await typeLine('> location is approximate and network-derived.',id,'ee-note',12)))return;
        if(!(await wait(480,id)))return;
      }
    }

    addSpacer();
    if(!(await typeLine('> your timezone is',id,'',18)))return;
    if(!(await typeLine('> '+env.tz,id,'ee-bright',18)))return;
    const localTimeStr=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(!(await typeLine('> local time is',id,'',18)))return;
    if(!(await typeLine('> '+localTimeStr,id,'ee-bright',18)))return;

    /* Wipe ephemeral network info from memory immediately after display */
    net=null;

    if(!(await wait(850,id)))return;
    triggerFlicker();
    addSpacer();

    if(!(await typeLine('> wait.',id,'ee-bright',30)))return;
    if(!(await wait(800,id)))return;
    if(!(await typeLine('> you clicked it.',id,'ee-bright',28)))return;
    if(!(await wait(800,id)))return;
    if(!(await typeLine("> that's exactly the point.",id,'ee-accent',26)))return;
    if(!(await wait(1050,id)))return;

    triggerFlicker();
    terminalEl.hidden=true;
    logEl.innerHTML='';
    finalEl.hidden=false;
    if(bodyEl)bodyEl.scrollTop=0;
    replayBtn.focus();
  }

  function openOverlay(){
    if(nav&&nav.classList.contains('open')){
      nav.classList.remove('open');
      if(menu){menu.setAttribute('aria-expanded','false');menu.textContent='Menu +'}
    }
    overlay.hidden=false;
    document.body.style.overflow='hidden';
    requestAnimationFrame(()=>{
      overlay.classList.add('open');
      startPromptStage();
    });
  }

  function closeOverlay(){
    runId++;
    if(abortCtrl){try{abortCtrl.abort()}catch(e){}abortCtrl=null}
    overlay.classList.remove('open','ee-anomaly','ee-flicker');
    if(statusLabel)statusLabel.textContent='SESSION // UNKNOWN';
    document.body.style.overflow='';
    setTimeout(()=>{
      overlay.hidden=true;
      logEl.innerHTML='';
      promptActions.hidden=true;
      finalEl.hidden=true;
      triggerBtn.focus();
    },300);
  }

  triggerBtn.addEventListener('click',openOverlay);
  continueBtn.addEventListener('click',runSequence);
  replayBtn.addEventListener('click',runSequence);
  cancelBtn.addEventListener('click',closeOverlay);
  closeBtn.addEventListener('click',closeOverlay);
  closeTopBtn.addEventListener('click',closeOverlay);

  overlay.addEventListener('click',e=>{
    if(e.target===overlay)closeOverlay();
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!overlay.hidden){
      e.preventDefault();
      closeOverlay();
    }
  });
})();


