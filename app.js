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

const FIELD_ICONS = {
  diagnostics: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  laptop: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 18h20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/></svg>`,
  lenovo: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="9.5" x2="18" y2="9.5"/><line x1="14" y1="14.5" x2="18" y2="14.5"/></svg>`,
  network: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/><path d="M12 10v4"/></svg>`,
  cabling: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="11" rx="2"/><path d="M9 13v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5M9 2v4M12 2v4M15 2v4"/></svg>`,
  cctv: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h12l3.5 2.5v3L14 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><path d="M17.5 10.5l4.5-2.5v8l-4.5-2.5"/><circle cx="7" cy="12" r="1.5"/></svg>`,
  docs: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`,
  support: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/><path d="M8 21h4a2 2 0 0 0 2-2v-1"/></svg>`,
  virtualization: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
  simulation: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><line x1="12" y1="7.5" x2="5" y2="16.5"/><line x1="12" y1="7.5" x2="19" y2="16.5"/></svg>`,
  ip: `<svg class="tech-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>`
};

const stacks = {
  field: [
    { label: 'Hardware diagnostics', icons: [FIELD_ICONS.diagnostics] },
    { label: 'Laptop repair', icons: [FIELD_ICONS.laptop] },
    { label: 'Lenovo systems', icons: [FIELD_ICONS.lenovo] },
    { label: 'Network troubleshooting', icons: [FIELD_ICONS.network] },
    { label: 'Structured cabling', icons: [FIELD_ICONS.cabling] },
    { label: 'CCTV / NVR', icons: [FIELD_ICONS.cctv] },
    { label: 'Technical documentation', icons: [FIELD_ICONS.docs] },
    { label: 'B2B support', icons: [FIELD_ICONS.support] },
    { label: 'VirtualBox', icons: [FIELD_ICONS.virtualization] },
    { label: 'Packet Tracer', icons: [FIELD_ICONS.simulation] },
    { label: 'IP networking', icons: [FIELD_ICONS.ip] }
  ],
  dev: [
    { label: 'Python', icons: [TECH_ICONS.python] },
    { label: 'C#', icons: [TECH_ICONS.csharp] },
    { label: 'PHP', icons: [TECH_ICONS.php] },
    { label: 'HTML & CSS', icons: [TECH_ICONS.html5, TECH_ICONS.css3] },
    { label: 'MySQL', icons: [TECH_ICONS.mysql] },
    { label: 'Git & GitHub', icons: [TECH_ICONS.git, TECH_ICONS.github] },
    { label: 'VS Code', icons: [TECH_ICONS.vscode] },
    { label: 'SDLC', icons: [TECH_ICONS.sdlc] },
    { label: 'Next.js', icons: [TECH_ICONS.nextjs] },
    { label: 'JavaScript', icons: [TECH_ICONS.javascript] },
    { label: 'Java', icons: [TECH_ICONS.java] }
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

      if (item.icons && item.icons.length) {
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
// The tab bar's Menu button opens the bottom sheet (mobile-nav.js)

/* ─── Theme toggle with GPU-accelerated circular warp reveal ─── */
const themeBtn = document.getElementById('theme-toggle');

function updateThemeVisuals(theme){
  themeBtn.innerHTML = theme === 'light' ? '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' : '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
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
    const isMatch = (item.dataset.nav || '').split(' ').includes(id);
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
// Async content (Field Log feed, lazy images, 3D map) shifts sections after load:
// recache whenever the page height changes so the active link isn't off by one.
if('ResizeObserver' in window){
  let layoutRaf = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(layoutRaf);
    layoutRaf = requestAnimationFrame(cacheSectionLayout);
  }).observe(document.querySelector('main') || document.body);
}

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
    const map={mec:'case-dialog',triphil:'triphil-dialog',ganap:'ganap-dialog',codex:'codex-dialog',c1p:'c1p-dialog',c1convert:'c1convert-dialog',biofuel:'biofuel-dialog',sweldo:'sweldo-dialog',typing:'typing-dialog'};
    const id=map[btn.dataset.case]||'case-dialog';
    document.getElementById(id).showModal();
  });
});
document.querySelectorAll('[data-scroll]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.getElementById(btn.dataset.scroll).scrollIntoView({behavior:'smooth'});
  });
});
/* ─── Image Preview Lightbox (Certificates, Badges, Field Work, Portrait) ─── */
function openImagePreview(src, title, category) {
  const dialog = document.querySelector('#image-dialog');
  if (!dialog) return;
  const titleEl = dialog.querySelector('#image-title');
  const catEl = dialog.querySelector('#image-category');
  const imgEl = dialog.querySelector('#credential-image');
  const linkEl = dialog.querySelector('#image-direct-link');

  if (titleEl) titleEl.textContent = title || 'Image Preview';
  if (catEl) catEl.textContent = category || 'PREVIEW / VIEW';
  if (imgEl) {
    imgEl.src = src;
    imgEl.alt = title || 'Preview image';
  }
  if (linkEl) {
    linkEl.href = src;
  }
  dialog.showModal();
}

document.querySelectorAll('[data-image]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openImagePreview(btn.dataset.image, btn.dataset.title, btn.dataset.category);
  });
  if (btn.getAttribute('role') === 'button' || btn.tagName !== 'BUTTON') {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openImagePreview(btn.dataset.image, btn.dataset.title, btn.dataset.category);
      }
    });
  }
});
document.querySelectorAll('dialog').forEach(d=>{const c=d.querySelector('.close');if(c)c.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});

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

  try {
    const p = new URLSearchParams(window.location.search);
    const s = parseInt(p.get('slide'), 10);
    if (!isNaN(s) && s >= 0 && s < total) {
      slides[0].classList.remove('active');
      slides[s].classList.add('active');
      current = s;
    }
    if (p.get('scroll')) {
      const el = document.getElementById(p.get('scroll'));
      if (el) {
        try { el.scrollIntoView({ behavior: 'instant' }); } catch(e) { el.scrollIntoView(); }
        window.scrollTo(0, el.offsetTop);
      }
    }
  } catch(e){}

  function pad(n){return String(n).padStart(2,'0')}
  function updateCounter(){counter.textContent=pad(current+1)+' / '+pad(total)}
  updateCounter();

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
  carouselEl.mxGoTo=i=>goTo(i); // used by the project rail in sections.js

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
   ??? — "SOMEONE'S WATCHING" (ephemeral, browser-side)
   Everything is read inside this tab and dropped on close.
   ═══════════════════════════════════════════════ */
(function(){
  const triggerBtn=document.getElementById('click-this-btn');
  const overlay=document.getElementById('ee-overlay');
  if(!triggerBtn||!overlay)return;

  /* ─── Session awareness: everything below stays in this tab's memory,
     except a tiny visit counter kept in this browser's localStorage ─── */
  const pageStart=performance.now();
  const session={hovers:0,clicks:0,mouseM:0,maxScroll:0,dwell:{},themeFlips:0,clickAt:0,snap:{}};
  let visit={n:1,prevLast:null};
  try{
    const prev=JSON.parse(localStorage.getItem('c1_seen')||'null');
    visit={n:prev&&prev.n?prev.n+1:1,prevLast:prev&&prev.last?prev.last:null};
    localStorage.setItem('c1_seen',JSON.stringify({n:visit.n,last:Date.now()}));
  }catch(e){}
  triggerBtn.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')session.hovers++});
  document.addEventListener('click',e=>{if(!overlay.contains(e.target))session.clicks++},true);
  let lastPt=null;
  document.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    if(lastPt)session.mouseM+=Math.hypot(e.clientX-lastPt[0],e.clientY-lastPt[1])*0.0002646; // px → m at ~96dpi
    lastPt=[e.clientX,e.clientY];
  },{passive:true});
  addEventListener('scroll',()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    if(max>0)session.maxScroll=Math.max(session.maxScroll,scrollY/max);
  },{passive:true});
  new MutationObserver(()=>session.themeFlips++).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  const SECTION_NAMES={overview:'the intro',work:'field work',experience:'experience',credentials:'credentials',stack:'the toolkit',lab:'the lab',activity:'activity',learning:'currently learning',contact:'contact'};
  if('IntersectionObserver' in window){
    const since={};
    const dwellObs=new IntersectionObserver(entries=>{
      const now=performance.now();
      entries.forEach(en=>{
        const id=en.target.id;
        if(en.isIntersecting)since[id]=now;
        else if(since[id]){session.dwell[id]=(session.dwell[id]||0)+(now-since[id]);delete since[id]}
      });
    },{threshold:0.35});
    document.querySelectorAll('main section[id]').forEach(sec=>dwellObs.observe(sec));
    session.flushDwell=()=>{const now=performance.now();for(const id in since){session.dwell[id]=(session.dwell[id]||0)+(now-since[id]);since[id]=now}};
  }

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
  const clockEl=document.getElementById('ee-clock');
  const soundBtn=document.getElementById('ee-sound');
  const cross=document.getElementById('ee-cross');
  const crossTag=cross&&cross.querySelector('.ee-ctag');

  /* Click / Space inside the overlay fast-forwards the typing */
  let speed=1;
  let facts=0;
  let runId=0;
  let activeCursor=null;
  let abortCtrl=null;
  let clockTimer=0;
  let seen=false;

  const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
  const alive=id=>id===runId;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function wait(ms,id){await sleep((reduced()?Math.min(ms,80):ms)*speed);return alive(id)}

  function flicker(){
    if(reduced())return;
    overlay.classList.remove('ee-flicker');
    void overlay.offsetWidth;
    overlay.classList.add('ee-flicker');
    setTimeout(()=>overlay.classList.remove('ee-flicker'),240);
  }

  /* ─── Sound: a low drone, key ticks and a thud on reveals. WebAudio only,
     started by the visitor's own click, toggle remembered per browser ─── */
  const snd={ctx:null,master:null,drone:null,noise:null,on:true}; // sound is always on
  function audio(){
    if(snd.ctx)return snd.ctx;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    try{
      const ctx=new AC();
      const master=ctx.createGain();
      master.gain.value=snd.on?1:0;
      master.connect(ctx.destination);
      const len=Math.floor(ctx.sampleRate*0.018);
      const buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
      Object.assign(snd,{ctx,master,noise:buf});
      return ctx;
    }catch(e){return null}
  }
  function droneStart(){
    const ctx=audio();
    if(!ctx||snd.drone)return;
    if(ctx.state==='suspended')ctx.resume();
    const g=ctx.createGain();g.gain.value=0;
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=150;lp.Q.value=7;
    const oscs=[[41.2,'sawtooth'],[41.7,'sawtooth'],[82.1,'sine']].map(([f,t])=>{
      const o=ctx.createOscillator();o.type=t;o.frequency.value=f;o.connect(lp);o.start();return o;
    });
    const lfo=ctx.createOscillator(),lfoG=ctx.createGain();
    lfo.frequency.value=0.07;lfoG.gain.value=80;
    lfo.connect(lfoG);lfoG.connect(lp.frequency);lfo.start();
    lp.connect(g);g.connect(snd.master);
    g.gain.setTargetAtTime(0.08,ctx.currentTime,1.4);
    snd.drone={g,nodes:[...oscs,lfo]};
  }
  function droneStop(fade=0.3){
    const d=snd.drone;
    if(!d||!snd.ctx)return;
    snd.drone=null;
    const t=snd.ctx.currentTime;
    d.g.gain.cancelScheduledValues(t);
    d.g.gain.setTargetAtTime(0,t,fade);
    setTimeout(()=>d.nodes.forEach(n=>{try{n.stop()}catch(e){}}),fade*6000+100);
  }
  function tick(){
    const ctx=snd.ctx;
    if(!ctx||!snd.on||!snd.noise)return;
    const s=ctx.createBufferSource(),hp=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=snd.noise;
    hp.type='highpass';hp.frequency.value=1800+Math.random()*1600;
    g.gain.value=0.05;
    s.connect(hp);hp.connect(g);g.connect(snd.master);s.start();
  }
  function thud(){
    const ctx=snd.ctx;
    if(!ctx||!snd.on)return;
    const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(30,t+0.55);
    g.gain.setValueAtTime(0.4,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.75);
    o.connect(g);g.connect(snd.master);o.start(t);o.stop(t+0.8);
  }
  function setSound(on){
    snd.on=on;
    try{localStorage.setItem('c1_ee_sound',on?'on':'off')}catch(e){}
    if(snd.master)snd.master.gain.setTargetAtTime(on?1:0,snd.ctx.currentTime,0.05);
    if(soundBtn){soundBtn.setAttribute('aria-pressed',String(on));soundBtn.textContent=on?'SOUND ON':'SOUND OFF'}
  }
  setSound(snd.on);

  /* ─── Typing ─── */
  function placeCursor(el){
    if(activeCursor)activeCursor.remove();
    activeCursor=document.createElement('span');
    activeCursor.className='ee-cursor';
    activeCursor.setAttribute('aria-hidden','true');
    el.appendChild(activeCursor);
  }
  function newLine(cls){
    const p=document.createElement('p');
    p.className='ee-line'+(cls?' '+cls:'');
    const span=document.createElement('span');
    p.appendChild(span);
    logEl.appendChild(p);
    placeCursor(p);
    bodyEl.scrollTop=bodyEl.scrollHeight;
    return span;
  }
  function keyDelay(ch){
    let d=26+Math.random()*48;
    if(/[.,?!:]/.test(ch))d+=170;
    return d*speed;
  }

  /* Types like a person: uneven rhythm, pauses at punctuation, the odd correction.
     typo = [index, wrongText] — wrongText is typed at index, then erased. */
  async function say(text,id,cls='',typo=null){
    if(!alive(id))return false;
    const span=newLine(cls);
    if(reduced()){span.textContent=text;return true}
    let typed='';
    for(let i=0;i<text.length;i++){
      if(typo&&i===typo[0]){
        for(const ch of typo[1]){
          if(!alive(id))return false;
          typed+=ch;span.textContent=typed;tick();
          await sleep(keyDelay(ch));
        }
        await sleep(420*speed);
        for(let k=0;k<typo[1].length;k++){
          if(!alive(id))return false;
          typed=typed.slice(0,-1);span.textContent=typed;
          await sleep(60*speed);
        }
        await sleep(220*speed);
      }
      if(!alive(id))return false;
      typed+=text[i];span.textContent=typed;
      if(text[i]!==' ')tick();
      await sleep(keyDelay(text[i]));
    }
    return alive(id);
  }

  /* Big reveal: characters scramble, then lock into the real value */
  async function reveal(text,id){
    if(!alive(id))return false;
    facts++;
    const span=newLine('ee-data');
    thud();
    if(reduced()){span.textContent=text;return true}
    const G='0123456789ABCDEF#%&@$';
    const frames=16;
    for(let f=0;f<=frames;f++){
      if(!alive(id))return false;
      const lock=Math.floor(text.length*f/frames);
      span.textContent=text.split('').map((ch,i)=>i<lock||/[\s.,:\-]/.test(ch)?ch:G[(Math.random()*G.length)|0]).join('');
      await sleep(40*speed);
    }
    span.textContent=text;
    return alive(id);
  }

  /* ─── What the browser hands over ─── */
  function detectBrowserEnv(){
    const ua=navigator.userAgent||'';
    let os='an unknown os';
    if(/Windows/i.test(ua))os='windows';
    else if(/Android/i.test(ua))os='android';
    else if(/iPhone|iPad|iPod/i.test(ua))os='ios';
    else if(/Mac OS X|Macintosh/i.test(ua))os='macos';
    else if(/Linux/i.test(ua))os='linux';

    let browser='some browser';
    if(/Edg\//i.test(ua))browser='edge';
    else if(/OPR\/|Opera/i.test(ua))browser='opera';
    else if(/Chrome\//i.test(ua))browser='chrome';
    else if(/Firefox\//i.test(ua))browser='firefox';
    else if(/Safari\//i.test(ua))browser='safari';

    const lang=(navigator.language||'EN-US').toUpperCase();
    const threads=navigator.hardwareConcurrency?String(navigator.hardwareConcurrency):null;
    const memory=navigator.deviceMemory?String(navigator.deviceMemory)+' GB':null;
    const display=(window.screen&&window.screen.width&&window.screen.height)?`${window.screen.width}×${window.screen.height}`:`${window.innerWidth}×${window.innerHeight}`;
    let tz='UTC';
    try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){}
    return{os,browser,lang,threads,memory,display,tz};
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

  function gpuName(){
    try{
      const gl=document.createElement('canvas').getContext('webgl');
      const ext=gl&&gl.getExtension('WEBGL_debug_renderer_info');
      if(!ext)return null;
      let r=String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||'');
      const m=r.match(/ANGLE \(([^,]+),\s*([^,]+?)(\s*\(0x[0-9a-f]+\))?\s*(Direct3D|OpenGL|Vulkan|Metal|,)/i);
      if(m)r=m[2];
      return r.replace(/\s+/g,' ').trim().slice(0,48)||null;
    }catch(e){return null}
  }

  async function batteryInfo(){
    try{
      if(!navigator.getBattery)return null;
      const b=await navigator.getBattery();
      return{level:Math.round(b.level*100),charging:b.charging};
    }catch(e){return null}
  }

  async function fingerprint(env,gpu){
    let raw=[env.os,env.browser,env.lang,env.threads,env.memory,env.display,env.tz,gpu,window.devicePixelRatio,navigator.userAgent].join('|');
    try{
      const c=document.createElement('canvas');c.width=240;c.height=60;
      const x=c.getContext('2d');
      x.textBaseline='top';x.font='16px Arial';x.fillStyle='#d5fb78';x.fillRect(2,2,120,30);
      x.fillStyle='#111310';x.fillText('C1 // fingerprint \u{1F441}',6,8);
      x.strokeStyle='rgba(255,0,80,.6)';x.beginPath();x.arc(170,30,22,0,Math.PI*1.7);x.stroke();
      raw+='|'+c.toDataURL();
    }catch(e){}
    let hex='';
    try{
      const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));
      hex=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }catch(e){
      let h=2166136261;for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619)}
      hex=(h>>>0).toString(16).padStart(8,'0').repeat(2);
    }
    return ('FP-'+hex.slice(0,4)+'-'+hex.slice(4,8)+'-'+hex.slice(8,12)).toUpperCase();
  }

  function referrerLabel(){
    const r=document.referrer;
    if(!r)return null;
    let host='';
    try{host=new URL(r).hostname.replace(/^www\./,'')}catch(e){return null}
    if(host===location.hostname)return null;
    const map=[[/facebook|fb\.|messenger/,'facebook'],[/linkedin|lnkd/,'linkedin'],[/google\./,'a google search'],[/tiktok/,'tiktok'],[/github/,'github'],[/^t\.co$|twitter|x\.com/,'x'],[/bing/,'bing'],[/instagram/,'instagram']];
    for(const [re,label] of map)if(re.test(host))return label;
    return host;
  }

  function fmtDuration(ms){
    const t=Math.max(1,Math.round(ms/1000));
    const m=Math.floor(t/60),sec=t%60;
    return m?`${m}m ${String(sec).padStart(2,'0')}s`:`${sec}s`;
  }
  function fmtClock(ms){
    const t=Math.floor(ms/1000);
    return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
  }
  function ago(ts){
    const d=Date.now()-ts;
    if(d<90e3)return 'a minute ago';
    if(d<3600e3)return Math.round(d/60e3)+' minutes ago';
    if(d<86400e3)return Math.round(d/3600e3)+' hours ago';
    const days=Math.round(d/86400e3);
    return days===1?'yesterday':days+' days ago';
  }
  function ordinal(n){
    const v=n%100;
    if(v>=11&&v<=13)return n+'th';
    return n+({1:'st',2:'nd',3:'rd'}[n%10]||'th');
  }

  /* Red crosshair locks onto the visitor's pointer */
  async function watchPointer(id){
    if(!alive(id))return false;
    const touch=matchMedia('(pointer: coarse)').matches;
    if(!(await say(touch?'touch the screen.':'move your mouse.',id,'ee-bright')))return false;
    let moved=0,last=null,got=false;
    const onMove=e=>{
      got=true;
      if(last)moved+=Math.hypot(e.clientX-last[0],e.clientY-last[1]);
      last=[e.clientX,e.clientY];
      if(!cross)return;
      cross.style.setProperty('--x',e.clientX+'px');
      cross.style.setProperty('--y',e.clientY+'px');
      cross.classList.add('on');
      if(crossTag)crossTag.textContent=`X ${String(Math.round(e.clientX)).padStart(4,'0')}  Y ${String(Math.round(e.clientY)).padStart(4,'0')}`;
    };
    addEventListener('pointermove',onMove);
    addEventListener('pointerdown',onMove);
    const t0=performance.now();
    while(alive(id)&&performance.now()-t0<5200&&moved<1200)await sleep(60);
    removeEventListener('pointermove',onMove);
    removeEventListener('pointerdown',onMove);
    const clear=()=>{if(cross)cross.classList.remove('on','lock')};
    if(!alive(id)){clear();return false}
    if(!got)return say("fine. stay still. i'll wait.",id,'ee-dim');
    if(cross)cross.classList.add('lock');
    thud();
    facts++;
    const ok=await say('there you are.',id,'ee-red');
    await wait(1000,id);
    clear();
    return ok&&alive(id);
  }

  function resetStage(){
    if(abortCtrl){try{abortCtrl.abort()}catch(e){}abortCtrl=null}
    overlay.classList.remove('ee-black','ee-run');
    if(cross)cross.classList.remove('on','lock');
    logEl.innerHTML='';
    promptActions.hidden=true;
    finalEl.hidden=true;
    terminalEl.hidden=false;
    placeCursor(logEl);
  }

  async function startPromptStage(){
    const id=++runId;
    resetStage();
    if(!(await wait(1300,id)))return; // nothing but a cursor, for a while
    if(!(await say('oh.',id,'ee-bright')))return;
    if(!(await wait(800,id)))return;
    if(!(await say('hi.',id,'ee-bright')))return;
    if(session.hovers>=2){
      if(!(await wait(600,id)))return;
      if(!(await say(`you hovered over that button ${session.hovers} times before clicking.`,id,'ee-dim')))return;
    }
    if(!(await wait(700,id)))return;
    if(!(await say('want to see what i see?',id,'ee-bright',[17,'kn'])))return;
    if(!(await wait(300,id)))return;
    promptActions.hidden=false;
    continueBtn.focus();
  }

  async function decline(){
    const id=++runId;
    promptActions.hidden=true;
    if(!(await say('okay.',id,'ee-dim')))return;
    if(!(await wait(600,id)))return;
    if(!(await say("i'll still be here.",id,'ee-dim')))return;
    if(!(await wait(1100,id)))return;
    seen=true;
    closeOverlay();
  }

  async function runSequence(){
    const id=++runId;
    speed=1;
    facts=0;
    const runStart=performance.now();
    resetStage();
    abortCtrl=new AbortController();
    const timeoutId=setTimeout(()=>{try{abortCtrl&&abortCtrl.abort()}catch(e){}},4000);
    /* Ephemeral in-memory lookup — never saved anywhere */
    let netPromise=fetchEphemeralNetInfo(abortCtrl.signal).finally(()=>clearTimeout(timeoutId));
    droneStart();
    overlay.classList.add('ee-run');

    if(!(await wait(500,id)))return;
    if(!(await say('okay.',id,'ee-bright')))return;
    if(!(await wait(800,id)))return;

    /* The machine */
    const env=detectBrowserEnv();
    const gpu=gpuName();
    facts+=2;
    if(!(await say(`you're on ${env.os}, using ${env.browser}.`,id)))return;
    if(env.threads||env.memory){
      facts++;
      const hw=[env.threads&&env.threads+' cpu threads',env.memory&&'about '+env.memory.toLowerCase()+' of ram'].filter(Boolean).join(', ');
      if(!(await say(hw+'.',id,'ee-dim')))return;
    }
    if(gpu){
      facts++;
      if(!(await say(`graphics: ${gpu.toLowerCase()}.`,id,'ee-dim')))return;
    }
    const batt=await batteryInfo();
    if(batt){
      facts++;
      const note=batt.charging?' plugged in.':batt.level<=20?' you should charge that.':'';
      if(!(await say(`${batt.level}% battery.${note}`,id,'ee-dim')))return;
    }

    /* The hour */
    if(!(await wait(700,id)))return;
    const now=new Date(),h=now.getHours();
    facts++;
    if(!(await say(`it's ${now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}).toLowerCase()} where you are.`,id)))return;
    if(h<5){
      if(!(await say('you should be asleep.',id,'ee-red')))return;
    }else if(h>=22){
      if(!(await say('late night, huh.',id,'ee-dim')))return;
    }

    /* The place */
    let net=await netPromise;
    if(!alive(id))return;
    if(!(await wait(700,id)))return;
    if(net&&net.ip){
      if(!(await say('your address:',id,'ee-dim')))return;
      if(!(await reveal(net.ip,id)))return;
      if(net.isp){
        facts++;
        if(!(await say(`through ${String(net.isp).toLowerCase().replace(/\.+$/,'')}.`,id,'ee-dim')))return;
      }
      if(net.region||net.country){
        if(!(await wait(600,id)))return;
        if(!(await say('somewhere near',id,'ee-dim')))return;
        if(!(await reveal([net.region,net.country].filter(Boolean).join(', ').toUpperCase(),id)))return;
        if(net.lat!==null&&net.lon!==null){
          facts++;
          if(!(await say(`${Number(net.lat).toFixed(2)}, ${Number(net.lon).toFixed(2)}. give or take a few kilometers.`,id,'ee-dim')))return;
        }
      }
    }else{
      if(!(await say("can't see your ip. something's hiding it. smart.",id,'ee-dim')))return;
    }
    /* Drop the network info from memory as soon as it's shown */
    net=null;

    /* What they did here — watched quietly since the page loaded */
    if(!(await wait(1000,id)))return;
    flicker();
    facts++;
    if(!(await say(`you've been here ${fmtDuration(session.clickAt-pageStart)}.`,id,'ee-bright')))return;
    const top=Object.entries(session.snap).sort((a,b)=>b[1]-a[1])[0];
    if(top&&top[1]>2500){
      facts++;
      if(!(await say(`most of it on ${SECTION_NAMES[top[0]]||top[0]}.`,id)))return;
    }
    if(session.maxScroll>0.02){
      facts++;
      if(!(await say(`you scrolled through ${Math.round(session.maxScroll*100)}% of the page.`,id,'ee-dim')))return;
    }
    if(session.mouseM>0.05){
      facts++;
      if(!(await say(`your mouse traveled ${session.mouseM>=1?session.mouseM.toFixed(1)+' meters':Math.round(session.mouseM*100)+' cm'}.`,id,'ee-dim')))return;
    }
    if(session.clicks>0){
      facts++;
      if(!(await say(`${session.clicks} click${session.clicks===1?'':'s'}.`,id,'ee-dim')))return;
    }
    if(session.themeFlips>0){
      facts++;
      if(!(await say(`you flipped the theme ${session.themeFlips===1?'once':session.themeFlips+' times'}. couldn't decide?`,id,'ee-dim')))return;
    }
    const ref=referrerLabel();
    if(ref){
      facts++;
      if(!(await say(`you came here from ${ref}.`,id)))return;
    }
    facts++;
    if(!(await wait(500,id)))return;
    if(visit.n>1&&visit.prevLast){
      if(!(await say(`you came back. ${ordinal(visit.n)} time.`,id,'ee-red')))return;
      if(!(await say(`last time was ${ago(visit.prevLast)}.`,id,'ee-dim')))return;
    }else{
      if(!(await say("first time here. i'll remember.",id,'ee-red')))return;
    }

    /* Recognisable without cookies or login */
    if(!(await wait(900,id)))return;
    if(!(await say("no cookies. no login. i'd still know you again:",id,'ee-dim')))return;
    if(!(await reveal(await fingerprint(env,gpu),id)))return;

    if(!(await wait(1000,id)))return;
    if(!(await watchPointer(id)))return;

    /* Cut to black. Silence. */
    if(!(await wait(500,id)))return;
    droneStop(0.04);
    overlay.classList.add('ee-black');
    if(!(await wait(1800,id)))return;
    logEl.innerHTML='';
    overlay.classList.remove('ee-black');
    if(!(await wait(300,id)))return;
    if(!(await say('relax.',id,'ee-big')))return;
    if(!(await wait(900,id)))return;
    if(!(await say("it's just a website.",id,'ee-big')))return;
    if(!(await wait(1100,id)))return;
    if(!(await say('but so is every other one.',id,'ee-big ee-red')))return;
    if(!(await wait(1800,id)))return;

    flicker();
    terminalEl.hidden=true;
    logEl.innerHTML='';
    overlay.classList.remove('ee-run');
    const tally=document.getElementById('ee-tally');
    if(tally)tally.textContent=`${facts} THINGS · ${fmtDuration(performance.now()-runStart).toUpperCase()} · 0 PERMISSIONS ASKED`;
    seen=true;
    if(!triggerBtn.querySelector('.owner-pill'))triggerBtn.textContent='!!!';
    finalEl.hidden=false;
    bodyEl.scrollTop=0;
    replayBtn.focus();
  }

  const pageTitle=document.title;
  document.addEventListener('visibilitychange',()=>{
    if(!seen)return;
    document.title=document.hidden?'still here.':pageTitle;
  });

  /* The whole site "breaks" for a beat before the overlay takes over */
  function takeover(done){
    if(reduced()){done();return}
    const root=document.documentElement;
    const nodes=[];
    document.querySelectorAll('.sidebar nav a, main h1, main h2, main h3, main .eyebrow, main p').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight||el.closest('.ee-overlay'))return;
      const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      while(tw.nextNode())if(tw.currentNode.textContent.trim())nodes.push([tw.currentNode,tw.currentNode.textContent]);
    });
    const G='!<>-_\\/[]{}=+*^?#01░▒▓';
    root.classList.add('ee-takeover');
    const t0=performance.now();
    const step=()=>{
      const p=(performance.now()-t0)/950;
      if(p>=1){
        nodes.forEach(([n,t])=>{n.textContent=t});
        root.classList.remove('ee-takeover');
        done();
        return;
      }
      nodes.forEach(([n,t])=>{
        n.textContent=t.split('').map(ch=>ch===' '||Math.random()>p*0.9?ch:G[(Math.random()*G.length)|0]).join('');
      });
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function startClock(){
    clearInterval(clockTimer);
    const upd=()=>{if(clockEl)clockEl.textContent=fmtClock(performance.now()-pageStart)};
    upd();
    clockTimer=setInterval(upd,500);
  }

  function openOverlay(){
    if(triggerBtn.querySelector('.owner-pill'))return;
    if(document.documentElement.classList.contains('ee-takeover'))return;
    // Freeze the behaviour stats at the moment of the click
    session.clickAt=performance.now();
    if(session.flushDwell)session.flushDwell();
    session.snap=Object.assign({},session.dwell);
    if(nav&&nav.classList.contains('open')){
      nav.classList.remove('open');
      if(menu){menu.setAttribute('aria-expanded','false');menu.textContent='Menu +'}
    }
    // unlock audio inside the click gesture; sound always starts on
    audio();
    if(snd.ctx&&snd.ctx.state==='suspended')snd.ctx.resume();
    setSound(true);
    takeover(()=>{
      overlay.hidden=false;
      document.body.style.overflow='hidden';
      startClock();
      requestAnimationFrame(()=>{
        overlay.classList.add('open');
        startPromptStage();
      });
    });
  }

  function closeOverlay(){
    runId++;
    if(abortCtrl){try{abortCtrl.abort()}catch(e){}abortCtrl=null}
    droneStop(0.15);
    clearInterval(clockTimer);
    overlay.classList.remove('open','ee-flicker','ee-black','ee-run');
    if(cross)cross.classList.remove('on','lock');
    document.body.style.overflow='';
    setTimeout(()=>{
      overlay.hidden=true;
      logEl.innerHTML='';
      promptActions.hidden=true;
      finalEl.hidden=true;
      triggerBtn.focus();
    },400);
  }

  triggerBtn.addEventListener('click',openOverlay);
  bodyEl.addEventListener('click',e=>{if(!e.target.closest('button'))speed=0.2});
  continueBtn.addEventListener('click',runSequence);
  replayBtn.addEventListener('click',runSequence);
  cancelBtn.addEventListener('click',decline);
  closeBtn.addEventListener('click',closeOverlay);
  closeTopBtn.addEventListener('click',closeOverlay);
  if(soundBtn)soundBtn.addEventListener('click',()=>{audio();setSound(!snd.on)});

  document.addEventListener('keydown',e=>{
    if(overlay.hidden)return;
    if(e.key===' '&&!terminalEl.hidden&&promptActions.hidden&&!(e.target.closest&&e.target.closest('button'))){e.preventDefault();speed=0.2;return}
    if(e.key==='Escape'){
      e.preventDefault();
      closeOverlay();
    }
  });
})();


