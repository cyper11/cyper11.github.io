/* ─── C1 Assistant: AI answers (via the cyper-chat Worker, key stays server-side)
       with the hand-written knowledge base for buttons, tools and offline fallback ─── */
(() => {
  'use strict';

  const EMAIL = 'cyperpelina27@gmail.com';
  const STORE = 'c1-chat-v1';
  // Cloudflare Worker that holds the DeepSeek key; empty = rule-based only
  const AI_ENDPOINT = 'https://cyper-chat.sweldoplanner.workers.dev/chat';
  const LINKS = {
    resume: 'Cyper-Ivan-Resume.pdf',
    github: 'https://github.com/cyper11',
    linkedin: 'https://www.linkedin.com/in/cyper-ivan-peli%C3%B1a-118131351/',
    facebook: 'https://www.facebook.com/cyper1van',
    tiktok: 'https://www.tiktok.com/@cyper1van',
    viber: 'viber://chat?number=%2B639619630931',
    powercodex: 'https://powercodex.vercel.app/',
    c1p: 'https://c1p.vercel.app/',
    c1convert: 'https://c1-convert.vercel.app/',
    ganapApk: 'https://drive.google.com/uc?export=download&id=1b3jgmyaupezEqyn9orxTBKdr6uRuFNWV'
  };

  /* ── Action helpers: buttons inside bot replies ── */
  const go = (id, label) => ({ label: label || 'Take me there →', run: () => scrollToId(id) });
  const open = (href, label) => ({ label, href });
  const tap = (btnId, label) => ({ label, run: () => { close(); setTimeout(() => document.getElementById(btnId)?.click(), 250); } });
  const ask = (text, label) => ({ label: label || text, ask: text });

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.matchMedia('(max-width:850px)').matches) close();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Small utilities ── */
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9./?\s-]/g, ' ').replace(/\s+/g, ' ').trim();

  function phTime() {
    return new Date().toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' });
  }
  function phHour() {
    return +new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', hour12: false }) % 24;
  }
  function greetWord() {
    const h = phHour();
    return h < 12 ? 'Magandang umaga' : h < 18 ? 'Magandang hapon' : 'Magandang gabi';
  }

  /* ── Subnet calculator (reuses the Lab's Network Calculator idea, inline) ── */
  function subnet(ip, prefix) {
    const oct = ip.split('.').map(Number);
    if (oct.length !== 4 || oct.some(n => !Number.isInteger(n) || n < 0 || n > 255) || prefix < 0 || prefix > 32) return null;
    const ipN = ((oct[0] << 24) >>> 0) + (oct[1] << 16) + (oct[2] << 8) + oct[3];
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const net = (ipN & mask) >>> 0;
    const bc = (net | (~mask >>> 0)) >>> 0;
    const toIp = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
    const total = 2 ** (32 - prefix);
    const usable = prefix >= 31 ? (prefix === 32 ? 1 : 2) : total - 2;
    const first = prefix >= 31 ? net : net + 1;
    const last = prefix >= 31 ? bc : bc - 1;
    return { network: toIp(net), broadcast: toIp(bc), mask: toIp(mask), first: toIp(first), last: toIp(last), usable, total };
  }

  /* ── Knowledge base: each intent has trigger keywords and a reply ──
     Score = number of keyword hits (multi-word phrases count double). */
  const INTENTS = [
    {
      id: 'greet',
      keys: ['hi', 'hello', 'hey', 'yo', 'kumusta', 'kamusta', 'musta', 'good morning', 'good afternoon', 'good evening', 'magandang', 'sup', 'hola', 'uy', 'oy'],
      reply: () => ({
        text: `${greetWord()}! 👋 Ako si <strong>C1</strong>, assistant ni Cyper. Ask me about his work, skills, projects, or kahit IT problem mo — I'll do my best.`,
        actions: [ask('Who is Cyper?'), ask('Show me his projects'), ask('Is he available for sidelines?')]
      })
    },
    {
      id: 'about',
      keys: ['who', 'sino', 'about', 'yourself', 'cyper', 'ivan', 'introduce', 'tell me about', 'background', 'profile', 'siya'],
      reply: () => ({
        text: `<p><strong>Cyper Ivan Pelina</strong> is a <strong>Field Service Engineer</strong> based in Cavite, Philippines. 🇵🇭</p>
<p>He diagnoses, repairs, and keeps technology working — from the laptop on your desk to the network behind it. Currently at <strong>IPVCYX</strong>, a Lenovo field service center, and finishing his B.S. Information Technology at LPU–Cavite — graduating soon. 🎓</p>
<p>Hands-on sa hardware, networking, CCTV, and he also builds web & Android apps on the side.</p>`,
        actions: [go('experience', 'See the journey →'), ask('What are his skills?'), open(LINKS.resume, 'Open résumé ↗︎')]
      })
    },
    {
      id: 'bot',
      keys: ['ikaw', 'bot', 'robot', 'chatgpt', 'are you real', 'are you a bot', 'human', 'tao ka', 'what are you', 'who are you', 'sino ka'],
      w: 2,
      reply: () => ({
        text: `I'm <strong>C1</strong>, Cyper's assistant on this site. 🤖 I run on AI, but I only talk about Cyper: his work, projects, skills, and sidelines. For anything else, best to <a href="mailto:${EMAIL}">email him directly</a>.`,
        actions: [ask('What can you do?')]
      })
    },
    {
      id: 'help',
      keys: ['help', 'what can you do', 'commands', 'menu', 'options', 'tulong', 'paano', 'features'],
      reply: () => ({
        text: `<p>Here's what I can help with:</p>
<ul><li>👤 About Cyper, experience & education</li><li>🛠️ Skills, toolkit & certifications</li><li>📁 Projects — GanapToday, PowerCodex, C1P Studio, C1-Convert, CCTV work</li><li>🎮 Launch Lab games (try “play snake”)</li><li>🌐 Subnet calc — type <code>192.168.1.0/26</code></li><li>🔧 Quick IT tips — “slow wifi”, “laptop overheating”, “printer offline”</li><li>📬 Contact, résumé, socials</li><li>🌗 “dark mode” / “light mode”, “what time is it?”, “tell me a joke”</li></ul>`,
        actions: [ask('Show me his projects'), ask('Play a game'), ask('Tell me a joke')]
      })
    },
    {
      id: 'experience',
      keys: ['experience', 'work', 'job', 'trabaho', 'career', 'journey', 'history', 'worked', 'employment', 'company', 'role', 'position'],
      reply: () => ({
        text: `<p>Career route so far:</p>
<ul><li><strong>Aug 2026 — Present</strong> · Field Service Engineer, <em>IPVCYX (Lenovo field service center)</em> — hardware diagnostics, laptop repairs, B2B technical support.</li>
<li><strong>Jan — May 2026</strong> · IT Support Intern, <em>Paramount Life & General Insurance</em> — laptops, printers, IP, DNS & connectivity.</li>
<li><strong>Field work</strong> · CCTV infrastructure at Tri-Phil International, cabling & electrical documentation at MEC.</li></ul>`,
        actions: [go('career-city', 'Explore Career City →'), ask('Where did he study?'), open(LINKS.resume, 'Full résumé ↗︎')]
      })
    },
    {
      id: 'current',
      keys: ['lenovo', 'ipvcyx', 'currently', 'current', 'field service engineer', 'fse'],
      reply: () => ({
        text: `He's currently a <strong>Field Service Engineer at IPVCYX</strong>, a Lenovo field service center (General Trias, Cavite) since Aug 2026 — on-site laptop diagnostics, FRU replacement, warranty service, and B2B support. He's also earned Lenovo's <strong>Rising Star</strong> and <strong>Advanced Qualification</strong>. ⭐`,
        actions: [go('credentials', 'See credentials →')]
      })
    },
    {
      id: 'paramount', w: 2,
      keys: ['paramount', 'intern', 'internship', 'ojt', 'insurance'],
      reply: () => ({
        text: `Jan — May 2026, he was an <strong>IT Support Intern at Paramount Life & General Insurance Corporation</strong> — solving everyday IT roadblocks: laptops, printers, IP, DNS, and connectivity support.`,
        actions: [go('experience', 'See the journey →')]
      })
    },
    {
      id: 'education',
      keys: ['study', 'studied', 'school', 'college', 'university', 'education', 'degree', 'graduate', 'grad', 'graduating', 'graduation', 'lpu', 'lyceum', 'aral', 'nag-aral', 'course', 'bsit'],
      reply: () => ({
        text: `🎓 <strong>B.S. Information Technology</strong> (2022 — 2026) at <strong>Lyceum of the Philippines University — Cavite</strong> — graduating soon! Focus areas: programming, databases, networking, and IT systems.`,
        actions: [go('career-city', 'View in Career City →'), ask('What certifications does he have?')]
      })
    },
    {
      id: 'skills',
      keys: ['skill', 'skills', 'toolkit', 'tools', 'stack', 'tech', 'technologies', 'kaya', 'alam', 'expertise', 'good at', 'marunong'],
      reply: () => ({
        text: `<p><strong>Field engineering:</strong> hardware diagnostics, FRU replacement, laptop repair (Lenovo/MSI), BIOS & drivers, network troubleshooting, VLANs, structured cabling, CCTV/NVR setup, technical documentation, B2B support.</p>
<p><strong>Development:</strong> Java, Python, C#, JavaScript, HTML/CSS, Next.js, PHP, MySQL, Git/GitHub, Vercel & Cloudflare Pages.</p>
<p><strong>Labs:</strong> Cisco Packet Tracer, GNS3, VirtualBox, VMware.</p>`,
        actions: [go('stack', 'Open toolkit →'), ask('What is he learning now?')]
      })
    },
    {
      id: 'network',
      keys: ['network', 'networking', 'cisco', 'ccna', 'vlan', 'router', 'switch', 'cabling', 'packet tracer'],
      reply: () => ({
        text: `Networking is a big part of his work: IP addressing, VLAN configuration, switch/router config, structured cabling, and troubleshooting. He has <strong>Cisco CCNAv7: Introduction to Networks</strong> and practices on Packet Tracer & GNS3. Tip: type a subnet like <code>10.0.0.0/22</code> and I'll calculate it. 🌐`,
        actions: [open('network-calculator.html', 'Network Calculator ↗︎'), ask('192.168.1.0/26', 'Try 192.168.1.0/26')]
      })
    },
    {
      id: 'certs',
      keys: ['cert', 'certs', 'certificate', 'certification', 'certifications', 'credential', 'credentials', 'qualification', 'google', 'coursera', 'certiport'],
      reply: () => ({
        text: `<ul><li>⭐ Lenovo Field Service — <strong>Rising Star</strong></li><li>⭐ Lenovo Field Service — <strong>Advanced Qualification</strong></li><li>Cisco — CCNAv7: Introduction to Networks (Feb 2025)</li><li>Google — AI Essentials & Prompting Essentials (Apr 2026)</li><li>EWIT · LPU — Certified Cloud System Analyst (May 2026)</li><li>Certiport — IT Specialist: Databases (Jun 2024)</li><li>Rotary · MaraLabs — CyberSafety Seminar (Apr 2025)</li></ul>`,
        actions: [go('credentials', 'View credentials →')]
      })
    },
    {
      id: 'projects',
      keys: ['project', 'projects', 'portfolio', 'built', 'build', 'gawa', 'ginawa', 'apps', 'app', 'case', 'cases', 'showcase'],
      reply: () => ({
        text: `<p>Selected work:</p><ul>
<li>📹 <strong>Tri-Phil CCTV</strong> — ongoing CCTV layout, NVR & IP camera work</li>
<li>🔌 <strong>MEC Cabling & Electrical</strong> — diagrams & quality checks</li>
<li>📱 <strong>GanapToday</strong> — Android AI companion app</li>
<li>♟️ <strong>PowerCodex</strong> — 48 Laws of Power strategy web app</li>
<li>🎬 <strong>C1P Studio</strong> — browser video editor</li>
<li>📄 <strong>C1-Convert</strong> — privacy-first file converter</li>
<li>💸 <strong>SweldoPlanner</strong> — payday budget planner</li>
<li>🗳️ <strong>Saan Tayo?</strong> — group voting for barkada plans</li>
<li>🧭 <strong>Linya</strong> — browser diagram editor</li></ul>`,
        actions: [go('work', 'Browse field work →'), ask('Tell me about GanapToday', 'GanapToday'), ask('Tell me about PowerCodex', 'PowerCodex')]
      })
    },
    {
      id: 'ganap', w: 2,
      keys: ['ganap', 'ganaptoday', 'android', 'apk', 'companion', 'lola', 'tropa', 'reflection'],
      reply: () => ({
        text: `📱 <strong>GanapToday</strong> — your AI tropa for life's daily chaos. Pick a vibe (Funny Best Friend, Motivational Coach, Caring Lola, Strict Asian Parent, Calm Therapist, Gamer Buddy), log your daily ganap, track streaks, and get weekly reflections. Android only, ~89 MB.`,
        actions: [open(LINKS.ganapApk, 'Download APK ↗︎'), go('work', 'See on site →')]
      })
    },
    {
      id: 'powercodex', w: 2,
      keys: ['powercodex', 'power codex', '48 laws', 'laws of power', 'robert greene', 'strategy'],
      reply: () => ({
        text: `♟️ <strong>PowerCodex</strong> — adapted from <em>The 48 Laws of Power</em>. Taglish commentary, a situation simulator, a strategy analyzer, and a searchable archive of all 48 laws. <em>Unawain ang pattern. Hasain ang judgment.</em>`,
        actions: [open(LINKS.powercodex, 'Visit PowerCodex ↗︎')]
      })
    },
    {
      id: 'c1p', w: 2,
      keys: ['c1p', 'studio', 'video', 'editor', 'editing', 'motion graphics', 'timeline'],
      reply: () => ({
        text: `🎬 <strong>C1P Studio</strong> — a browser-based creative workspace: multi-track video & audio timeline, clip trimming, split at playhead, live preview — zero cloud uploads. Built with React, WebAssembly & Canvas.`,
        actions: [open(LINKS.c1p, 'Visit C1P Studio ↗︎')]
      })
    },
    {
      id: 'c1convert', w: 2,
      keys: ['convert', 'c1-convert', 'c1convert', 'pdf', 'converter', 'compress', 'word to pdf', 'file'],
      reply: () => ({
        text: `📄 <strong>C1-Convert</strong> — all-in-one browser utility to convert, compress & format PDF, Word, Excel, JPG and PNG. Privacy-first: zero retention, auto 30-minute purge, and no AI training on your files.`,
        actions: [open(LINKS.c1convert, 'Visit C1-Convert ↗︎')]
      })
    },
    {
      id: 'cctv', w: 2,
      keys: ['cctv', 'nvr', 'dvr', 'camera', 'cameras', 'surveillance', 'tri-phil', 'triphil', 'security'],
      reply: () => ({
        text: `📹 Ongoing CCTV work at <strong>Tri-Phil International Inc.</strong>: camera layout planning, coverage checks, NVR systems, coaxial & IP camera inspection, cable routing, site assessment, and technical documentation.`,
        actions: [go('work', 'See field work →')]
      })
    },
    {
      id: 'mec', w: 2,
      keys: ['mec', 'electrical', 'cable', 'diagram', 'documentation', 'quality'],
      reply: () => ({
        text: `🔌 At <strong>MEC</strong>, he was a Documentation & Quality Checker — checking cable conditions, documenting field activities, and preparing electrical & network diagrams (Excel, Word, PowerPoint) to support project completion.`,
        actions: [go('work', 'See field work →')]
      })
    },
    {
      id: 'learning',
      keys: ['learning', 'learn', 'studying', 'exploring', 'ollama', 'llm', 'cloud', 'react', 'next', 'pinag-aaralan'],
      reply: () => ({
        text: `Currently exploring: 🌐 Networking & Infrastructure · 🤖 AI & local LLMs (Ollama) · ⚙︎️ Systems & hardware · ⟨/⟩ React & Vite · ☁︎️ Cloud deployment (Cloudflare, Vercel, Railway) · 📹 CCTV & IT infrastructure.`,
        actions: [go('learning', 'Open the knowledge graph →')]
      })
    },
    {
      id: 'lab',
      keys: ['lab', 'game', 'games', 'play', 'laro', 'maglaro', 'experiment', 'experiments', 'bored', 'boring', 'naiinip'],
      reply: () => ({
        text: `🎮 The Lab has 9 experiments. Pick one and I'll launch it:`,
        actions: [tap('open-snake-btn', '🐍 Snake.exe'), tap('open-flappy-btn', '🐤 Flappy Engineer'), tap('open-runner-btn', '🏃 C1: Tech Runner'), tap('open-maze-btn', '🖱️ Mouse Maze'), tap('open-rng-btn', '🎰 RNG Vault'), open('typing-speed.html', '⌨️ Typing Test ↗︎'), open('code-quiz.html', '🧠 Code Quiz ↗︎'), open('logic-puzzles.html', '🧩 Logic Puzzles ↗︎')]
      })
    },
    { id: 'snake', w: 2, keys: ['snake'], reply: () => ({ text: '🐍 Launching Snake.exe… good luck!', actions: [tap('open-snake-btn', 'Play Snake.exe')], auto: 0 }) },
    { id: 'flappy', w: 2, keys: ['flappy', 'bird'], reply: () => ({ text: '🐤 Flappy Engineer — gravity is not your friend.', actions: [tap('open-flappy-btn', 'Play Flappy Engineer')], auto: 0 }) },
    { id: 'runner', w: 2, keys: ['runner', 'platformer', 'tech runner'], reply: () => ({ text: '🏃 C1: Tech Runner — 10 sectors of broken architecture. Restore the core!', actions: [tap('open-runner-btn', 'Play Tech Runner')], auto: 0 }) },
    { id: 'maze', w: 2, keys: ['maze', 'mouse maze'], reply: () => ({ text: '🖱️ Mouse Maze — steady hands only.', actions: [tap('open-maze-btn', 'Play Mouse Maze')], auto: 0 }) },
    { id: 'rng', w: 2, keys: ['rng', 'vault', 'slot', 'dice', 'random'], reply: () => ({ text: '🎰 RNG Vault — pure probability, zero real money.', actions: [tap('open-rng-btn', 'Open RNG Vault')], auto: 0 }) },
    { id: 'typing', w: 2, keys: ['typing', 'wpm', 'type test'], reply: () => ({ text: '⌨️ How fast can you type? Test your WPM & accuracy.', actions: [open('typing-speed.html', 'Typing Speed Test ↗︎')] }) },
    { id: 'quiz', w: 2, keys: ['quiz', 'trivia', 'code quiz'], reply: () => ({ text: '🧠 Code Quiz — JavaScript, web layout, SQL and debugging scenarios.', actions: [open('code-quiz.html', 'Take the Code Quiz ↗︎')] }) },
    {
      id: 'hire',
      keys: ['hire', 'hiring', 'available', 'availability', 'opportunity', 'opportunities', 'freelance', 'commission', 'open to', 'recruit', 'job offer', 'full time', 'full-time', 'collab', 'collaborate', 'pwede', 'raket', 'sideline', 'sidelines', 'part time', 'part-time'],
      reply: () => ({
        text: `<p>Not available for full-time hire right now. He's working as a Field Service Engineer at IPVCYX, a Lenovo field service center. 🙏</p>
<p>But he's <strong>open for sidelines</strong>:</p>
<ul><li>💻 Project builds: websites, web apps, systems</li><li>🎓 <strong>Capstone projects</strong>, any kind</li><li>📹 <strong>Big quotations</strong>, like enterprise CCTV installs</li></ul><p>Message him the details!</p>`,
        actions: [open(`mailto:${EMAIL}?subject=Sideline%20project%20inquiry`, '✉️ Inquire about a project'), ask('Capstone project', '🎓 Capstone'), ask('CCTV quotation for enterprise', '📹 CCTV quote'), { label: '⧉ Copy email', run: copyEmail }]
      })
    },
    {
      id: 'capstone', w: 2,
      keys: ['capstone', 'thesis', 'school project', 'system project', 'final project', 'website project', 'web project', 'project build', 'magpagawa', 'pagawa', 'pagawa ng'],
      reply: () => ({
        text: `<p>🎓 Yes, he takes <strong>capstone and project builds</strong>, any kind: web systems, mobile apps, databases, network setups.</p><p>Send him your title, scope, deadline, and budget so he can give you a quote.</p>`,
        actions: [open(`mailto:${EMAIL}?subject=Capstone%20%2F%20project%20inquiry`, '✉️ Send project details'), open(LINKS.facebook, 'Message on Facebook ↗︎')]
      })
    },
    {
      id: 'cctvquote', w: 3,
      keys: ['enterprise', 'quotation', 'cctv quote', 'cctv quotation', 'cctv install', 'cctv installation', 'installation', 'bidding', 'company cctv', 'warehouse', 'factory', 'building'],
      reply: () => ({
        text: `<p>📹 Open for <strong>big quotations</strong>, including <strong>enterprise CCTV</strong>: site inspection, camera layout & coverage planning, NVR/IP camera setup, cabling, and documentation.</p><p>Send the site location, rough number of cameras, and timeline.</p>`,
        actions: [open(`mailto:${EMAIL}?subject=CCTV%20quotation%20request`, '✉️ Request CCTV quotation'), go('work', 'See his CCTV work →')]
      })
    },
    {
      id: 'contact',
      keys: ['contact', 'email', 'mail', 'reach', 'message', 'number', 'phone', 'viber', 'call', 'socials', 'social', 'facebook', 'fb', 'linkedin', 'tiktok', 'github', 'kontak'],
      reply: () => ({
        text: `📬 <strong>${EMAIL}</strong><br>Also on GitHub, LinkedIn, Facebook, TikTok and Viber.`,
        actions: [{ label: '⧉ Copy email', run: copyEmail }, open(`mailto:${EMAIL}`, '✉️ Email'), open(LINKS.linkedin, 'LinkedIn ↗︎'), open(LINKS.github, 'GitHub ↗︎'), open(LINKS.facebook, 'Facebook ↗︎'), open(LINKS.viber, 'Viber ↗︎')]
      })
    },
    {
      id: 'resume', w: 2,
      keys: ['resume', 'cv', 'curriculum'],
      reply: () => ({ text: '📄 Here\'s Cyper\'s résumé (PDF).', actions: [open(LINKS.resume, 'Open résumé ↗︎')] })
    },
    {
      id: 'location',
      keys: ['where', 'saan', 'location', 'based', 'live', 'nakatira', 'cavite', 'philippines', 'city', 'address'],
      reply: () => ({ text: `📍 Based in <strong>Cavite, Philippines</strong> — currently working in General Trias. It's ${phTime()} there right now (PHT).` })
    },
    {
      id: 'time',
      keys: ['time', 'oras', 'anong oras', 'date', 'today'],
      reply: () => ({ text: `🕐 It's <strong>${phTime()}</strong> in the Philippines (PHT, UTC+8).` })
    },
    {
      id: 'dark', w: 2,
      keys: ['dark mode', 'dark', 'madilim', 'night mode'],
      reply: () => { setTheme('dark'); return { text: '🌙 Dark mode on. Easy on the eyes.' }; }
    },
    {
      id: 'light', w: 2,
      keys: ['light mode', 'light', 'maliwanag', 'day mode'],
      reply: () => { setTheme('light'); return { text: '☀︎️ Light mode on.' }; }
    },
    {
      id: 'activity',
      keys: ['contributions', 'commits', 'activity', 'open source', 'repo', 'repos', 'code'],
      reply: () => ({ text: '💻 He builds in the open — check the live GitHub contribution heatmap.', actions: [go('activity', 'See activity →'), open(LINKS.github, 'GitHub ↗︎')] })
    },
    {
      id: 'fieldlog',
      keys: ['field log', 'log', 'updates', 'news', 'latest', 'recent', 'bago'],
      reply: () => ({ text: '📝 The Field Log has his recent work, certifications, projects, and things he\'s learning.', actions: [go('field-log', 'Open Field Log →')] })
    },
    {
      id: 'mystery', w: 2,
      keys: ['???', 'mystery', 'secret', 'easter egg', 'hidden', 'sikreto'],
      reply: () => ({ text: '👁️ …you noticed the <code>???</code> button too. I\'m not allowed to talk about it. Click it yourself — if you dare.', actions: [tap('click-this-btn', 'Open ???')] })
    },
    /* ── IT troubleshooting quick tips ── */
    {
      id: 'slowpc', w: 2,
      keys: ['pc', 'laptop', 'computer', 'slow pc', 'slow laptop', 'laptop slow', 'computer slow', 'hang', 'nagha-hang', 'lag pc', 'freeze', 'freezing', 'bagal'],
      reply: () => ({
        text: `<p>🐢 Slow PC checklist:</p><ul><li>Restart (seriously, it helps).</li><li>Disable startup apps in Task Manager.</li><li>Free up storage — keep 15%+ free.</li><li>Run Windows Update & a malware scan.</li><li>Still on HDD? Upgrading to an SSD is the #1 speed boost.</li><li>Check RAM usage — 8 GB is the minimum these days.</li></ul>`
      })
    },
    {
      id: 'wifi', w: 2,
      keys: ['wifi', 'wi-fi', 'internet', 'slow', 'mabagal', 'no internet', 'walang internet', 'connection', 'connected', 'signal', 'lag'],
      reply: () => ({
        text: `<p>🔧 Quick fixes for slow / no internet:</p><ul><li>Restart the modem/router (unplug 30 seconds).</li><li>Test with another device — if lahat mabagal, ISP or router issue.</li><li>Forget & reconnect the Wi-Fi network.</li><li>Run <code>ipconfig /flushdns</code> then <code>ipconfig /renew</code> (Windows).</li><li>Move closer to the router or use the 5 GHz band.</li><li>Still bad? Run a speed test & call your ISP.</li></ul>`,
        actions: [ask('Laptop overheating'), ask('Printer offline')]
      })
    },
    {
      id: 'overheat', w: 2,
      keys: ['overheat', 'overheating', 'hot', 'mainit', 'init', 'fan', 'loud', 'maingay'],
      reply: () => ({
        text: `<p>🔥 Laptop overheating?</p><ul><li>Use it on a hard, flat surface — not on the bed or pillow.</li><li>Clean the vents/fan (compressed air).</li><li>Check Task Manager for a runaway app.</li><li>Update BIOS & drivers.</li><li>If it's 2+ years old, thermal paste repaste helps a lot — that's a job for a technician. 😉</li></ul>`
      })
    },
    {
      id: 'printer', w: 2,
      keys: ['printer', 'print', 'printing', 'mag-print', 'paper jam'],
      reply: () => ({
        text: `<p>🖨️ Printer offline / not printing:</p><ul><li>Check power, cable, or that it's on the same Wi-Fi.</li><li>Clear the print queue and restart the <em>Print Spooler</em> service.</li><li>Set it as default printer & uncheck “Use printer offline”.</li><li>Reinstall the latest driver from the manufacturer.</li></ul>`
      })
    },
    {
      id: 'bsod', w: 2,
      keys: ['blue screen', 'bsod', 'crash', 'crashing', 'restart', 'nagre-restart', 'boot', 'wont turn on', 'ayaw mag-on', 'dead'],
      reply: () => ({
        text: `<p>💀 Crashes / won't boot:</p><ul><li>Note the stop code on the blue screen — it tells you a lot.</li><li>Unplug new hardware/USB devices.</li><li>Boot into Safe Mode and roll back recent drivers or updates.</li><li>Run <code>sfc /scannow</code> and a memory test.</li><li>Won't power on at all? Try a different charger and do a hard reset (hold power 30s, battery out if possible).</li></ul><p>Persistent issues → time for an on-site diagnosis. 🛠️</p>`,
        actions: [ask('How do I contact Cyper?', 'Contact Cyper')]
      })
    },
    /* ── Small talk ── */
    {
      id: 'joke', w: 2,
      keys: ['joke', 'jokes', 'funny', 'biro', 'patawa', 'pick up line', 'banat', 'hugot'],
      reply: () => ({
        text: pick([
          'Why do network engineers never get lost? Kasi lagi silang may <em>route</em>. 🗺️',
          'Sana ako na lang yung Wi-Fi mo… para lagi mo akong hinahanap. 📶',
          'There are 10 types of people: those who understand binary and those who don\'t.',
          'I told my laptop I needed a break. Now it won\'t stop sending me Kit-Kat ads.',
          'Bakit malungkot ang computer? Kasi marami siyang <em>bytes</em> pero walang nag-<em>bite</em>. 🥲',
          'A SQL query walks into a bar, goes up to two tables and asks: “Can I join you?”',
          'Have you tried turning it off and on again? …Ay, sa relasyon pala ‘to. 💔'
        ]),
        actions: [ask('Another joke', 'Isa pa 😂')]
      })
    },
    {
      id: 'funfact',
      keys: ['fun fact', 'fact', 'trivia', 'random fact', 'did you know'],
      reply: () => ({
        text: pick([
          'The first computer “bug” was an actual moth stuck in a Harvard Mark II relay in 1947. 🦋',
          'A /24 subnet has 256 addresses but only 254 usable hosts — network & broadcast take two.',
          'The first webcam watched a coffee pot at Cambridge University so people knew if it was empty. ☕',
          'Cat6 cable can run 10 Gbps — but only up to around 55 meters.',
          'This whole site\'s 3D Career City is rendered live in your browser. Try dragging it!'
        ]),
        actions: [ask('Another fun fact')]
      })
    },
    {
      id: 'thanks',
      keys: ['thanks', 'thank you', 'ty', 'salamat', 'thx', 'tnx', 'appreciate', 'nice', 'cool', 'galing', 'astig', 'ayos'],
      reply: () => ({ text: pick(['Walang anuman! 😊 Anything else?', 'You\'re welcome! Ask away kung may iba pa.', 'Glad to help! 🙌']) })
    },
    {
      id: 'bye',
      keys: ['bye', 'goodbye', 'see you', 'paalam', 'ingat', 'later', 'sige'],
      reply: () => ({ text: 'Ingat! 👋 Kung may project ka for Cyper, don\'t be shy — <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.' })
    },
    {
      id: 'love',
      keys: ['love', 'mahal', 'crush', 'single', 'girlfriend', 'gf', 'jowa', 'taken'],
      reply: () => ({ text: '😅 Hala, personal na ‘yan. I only know about his work — for everything else, ikaw na mag-message sa kanya.' })
    },
    {
      id: 'salary', w: 2,
      keys: ['salary', 'rate', 'price', 'magkano', 'how much', 'sweldo', 'bayad', 'cost', 'quote'],
      reply: () => ({
        text: '💬 Rates depend on the scope: capstone, project builds, or enterprise CCTV. Send Cyper the details and he\'ll get back with a quote.',
        actions: [open(`mailto:${EMAIL}?subject=Quote%20request`, '✉️ Request a quote')]
      })
    }
  ];

  const SUGGESTIONS = ['Who is Cyper?', 'Projects', 'Skills', 'Certifications', 'Sidelines?', 'Capstone', 'CCTV quote', 'Contact'];

  /* ── Matching ── */
  function match(raw) {
    const q = norm(raw);
    if (!q) return null;

    // Subnet calc: "192.168.1.10/26" or "subnet 10.0.0.0 /8"
    const sm = raw.match(/(\d{1,3}(?:\.\d{1,3}){3})\s*\/\s*(\d{1,2})/);
    if (sm) {
      const r = subnet(sm[1], +sm[2]);
      if (r) return {
        text: `<p>🌐 <code>${esc(sm[1])}/${sm[2]}</code></p><ul><li>Network: <code>${r.network}</code></li><li>Broadcast: <code>${r.broadcast}</code></li><li>Mask: <code>${r.mask}</code></li><li>Usable: <code>${r.first}</code> – <code>${r.last}</code></li><li>Hosts: <strong>${r.usable.toLocaleString()}</strong> usable / ${r.total.toLocaleString()} total</li></ul>`,
        actions: [open('network-calculator.html', 'Full calculator ↗︎')]
      };
      return { text: 'Hmm, that doesn\'t look like a valid IPv4/CIDR. Try something like <code>192.168.1.0/24</code>.' };
    }

    // Simple math: "12 * 8"
    const mm = raw.toLowerCase().trim().match(/^(?:what is |ano ang |calc )?(-?\d+(?:\.\d+)?)\s*([+\-*x/])\s*(-?\d+(?:\.\d+)?)\??$/);
    if (mm) {
      const a = +mm[1], b = +mm[3];
      const res = { '+': a + b, '-': a - b, '*': a * b, x: a * b, '/': b ? a / b : NaN }[mm[2]];
      return { text: Number.isFinite(res) ? `🧮 ${mm[1]} ${mm[2]} ${mm[3]} = <strong>${+res.toFixed(6)}</strong>` : 'Division by zero? Nice try. 😏' };
    }

    const words = new Set(q.split(' '));
    let best = null, bestScore = 0;
    for (const it of INTENTS) {
      let score = 0;
      for (const k of it.keys) {
        if (k.includes(' ') || /[^a-z0-9]/.test(k)) { if (q.includes(k)) score += 2; }
        else if (words.has(k) || (k.length > 4 && q.includes(k))) score += 1;
      }
      score *= it.w || 1;
      if (score > bestScore) { best = it; bestScore = score; }
    }
    return best ? best.reply() : null;
  }

  function fallback() {
    return {
      text: pick([
        'Hmm, hindi ko pa alam ‘yan. 🤔 Try one of these, or ask Cyper directly:',
        'Sorry, I didn\'t catch that. Here are things I know about:',
        'Medyo lost ako dun. 😅 Maybe one of these?'
      ]),
      actions: [ask('What can you do?', 'What can you do?'), ask('Show me his projects', 'Projects'), { label: '⧉ Copy his email', run: copyEmail }]
    };
  }

  /* ── AI: ask the Worker, format its plain-text reply safely ── */
  function formatAI(raw) {
    const lines = esc(raw).split(/\n+/).map(l => l.trim()).filter(Boolean);
    // links first (never the domain part of an email), then emails
    const inline = t => t
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<![@\w.\/])((?:https?:\/\/)?(?:[\w-]+\.)+(?:app|dev|com|io|net|ph)(?:\/[\w\-./?=&%#]*)?)(?![\w@])/g,
        url => `<a href="${/^https?:/.test(url) ? url : 'https://' + url}">${url}</a>`)
      .replace(/\b([\w.+-]+@[\w-]+\.[\w.]+[a-z])\b/gi, '<a href="mailto:$1">$1</a>');
    let html = '', list = false;
    for (const l of lines) {
      const item = l.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);
      if (item) { if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(item[1])}</li>`; }
      else { if (list) { html += '</ul>'; list = false; } html += `<p>${inline(l)}</p>`; }
    }
    return html + (list ? '</ul>' : '');
  }
  const plainText = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  async function askAI(text) {
    if (!AI_ENDPOINT) return null;
    const turns = history.slice(-9, -1).map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: plainText(m.text).slice(0, 600) }));
    turns.push({ role: 'user', content: text.slice(0, 600) });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      const res = await fetch(AI_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: turns }), signal: ctrl.signal
      });
      if (res.status === 429) return { text: '<p>Medyo marami na tayong napag-usapan. 😅 Pahinga muna ako saglit, or <a href="mailto:' + EMAIL + '">email Cyper directly</a>.</p>' };
      if (!res.ok) return null;
      const data = await res.json();
      return data && data.reply ? { text: formatAI(data.reply) } : null;
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  /* ── Side-effect helpers ── */
  function copyEmail() {
    const done = () => addBot({ text: `✅ Copied <strong>${EMAIL}</strong> to your clipboard.` });
    if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, () => addBot({ text: `Couldn't copy — here it is: <strong>${EMAIL}</strong>` }));
    else addBot({ text: `Here it is: <strong>${EMAIL}</strong>` });
  }
  function setTheme(want) {
    const cur = document.documentElement.dataset.theme || 'dark';
    if (cur !== want) document.getElementById('theme-toggle')?.click();
  }

  /* ── DOM ── */
  const ICON_CHAT = '<svg class="cb-ic-chat" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
  const ICON_X = '<svg class="cb-ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
  const ICON_RESET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
  const ICON_MIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  const root = document.createElement('div');
  root.className = 'cb-root';
  root.innerHTML = `
    <section class="cb-panel" id="cb-panel" role="dialog" aria-label="Chat with C1 assistant" aria-modal="false">
      <header class="cb-head">
        <div class="cb-avatar" aria-hidden="true">C1</div>
        <div class="cb-title"><strong>C1 Assistant</strong><span><i class="cb-live"></i>${AI_ENDPOINT ? 'AI · asks about Cyper only' : 'Online · replies instantly'}</span></div>
        <button type="button" class="cb-hbtn" data-cb="reset" aria-label="Restart conversation" title="Restart">${ICON_RESET}</button>
        <button type="button" class="cb-hbtn" data-cb="close" aria-label="Minimize chat" title="Minimize">${ICON_MIN}</button>
      </header>
      <div class="cb-log" role="log" aria-live="polite"></div>
      <div class="cb-chips" aria-label="Suggested questions"></div>
      <form class="cb-form" autocomplete="off">
        <input class="cb-input" type="text" maxlength="300" placeholder="Ask about Cyper…" aria-label="Type your message">
        <button class="cb-send" type="submit" aria-label="Send" disabled>${ICON_SEND}</button>
      </form>
    </section>
    <button type="button" class="cb-fab" aria-controls="cb-panel" aria-expanded="false" aria-label="Open chat">
      ${ICON_CHAT}${ICON_X}
      <span class="cb-fab-badge" aria-hidden="true">1</span>
      <span class="cb-fab-tip" aria-hidden="true">Hi! Need help? 👋</span>
    </button>`;
  document.body.appendChild(root);

  const $ = s => root.querySelector(s);
  const fab = $('.cb-fab'), log = $('.cb-log'), chips = $('.cb-chips'), form = $('.cb-form'), input = $('.cb-input'), send = $('.cb-send');
  const badge = $('.cb-fab-badge'), tip = $('.cb-fab-tip');
  let history = [];
  let busy = false;
  let pressed = false; // set when a reply button asks a canned question

  function save() {
    try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-40))); } catch (e) {}
  }
  function load() {
    try { return JSON.parse(sessionStorage.getItem(STORE) || '[]'); } catch (e) { return []; }
  }

  function render(msg, animate) {
    const el = document.createElement('div');
    el.className = 'cb-msg ' + (msg.from === 'user' ? 'cb-user' : 'cb-bot');
    if (!animate) el.style.animation = 'none';
    el.innerHTML = msg.from === 'user' ? esc(msg.text) : msg.text;
    if (msg.actions && msg.actions.length) {
      const row = document.createElement('div');
      row.className = 'cb-actions';
      msg.actions.forEach(a => {
        const b = a.href ? document.createElement('a') : document.createElement('button');
        b.className = 'cb-act';
        b.textContent = a.label;
        if (a.href) {
          b.href = a.href;
          if (/^https?:|\.pdf$|\.html$/.test(a.href)) { b.target = '_blank'; b.rel = 'noopener'; }
        } else {
          b.type = 'button';
          b.addEventListener('click', () => { if (a.ask) { pressed = true; submit(a.ask); } else if (a.run) a.run(); });
        }
        row.appendChild(b);
      });
      el.appendChild(row);
    }
    // Links inside bot text open in a new tab
    el.querySelectorAll(':scope > a[href^="http"], p a[href^="http"], li a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function addUser(text) {
    const m = { from: 'user', text };
    history.push(m); save(); render(m, true);
  }
  function addBot(reply) {
    const m = { from: 'bot', text: reply.text, actions: reply.actions || [] };
    render(m, true);
    history.push({ from: 'bot', text: m.text, actions: m.actions.filter(a => a.href || a.ask) });
    save();
  }

  function typingStart() {
    const t = document.createElement('div');
    t.className = 'cb-msg cb-bot cb-typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    return () => t.remove();
  }
  function typing(ms) {
    const t = document.createElement('div');
    t.className = 'cb-msg cb-bot cb-typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    return new Promise(r => setTimeout(() => { t.remove(); r(); }, ms));
  }

  async function submit(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    input.value = ''; send.disabled = true;
    addUser(text);
    const local = match(text);
    const isTool = /\d{1,3}(?:\.\d{1,3}){3}\s*\/\s*\d{1,2}/.test(text) || /^(?:what is |ano ang |calc )?-?\d/.test(text.toLowerCase().trim());
    const fromButton = SUGGESTIONS.includes(text) || pressed;
    pressed = false;
    let reply = null;
    if (AI_ENDPOINT && !isTool && !fromButton && !(local && local.auto != null)) {
      const stop = typingStart();
      const ai = await askAI(text);
      stop();
      // keep the quick buttons from the matching local answer under the AI reply
      if (ai) reply = { text: ai.text, actions: local && local.actions ? local.actions.filter(a => a.href || a.ask || a.run).slice(0, 3) : [] };
    }
    if (!reply) {
      reply = local || fallback();
      const plain = reply.text.replace(/<[^>]+>/g, '');
      await typing(Math.min(350 + plain.length * 4, 1200));
    }
    addBot(reply);
    busy = false;
    if (reply.auto != null) setTimeout(() => reply.actions[reply.auto].run(), 500);
    if (fab.getAttribute('aria-expanded') === 'true') input.focus({ preventScroll: true });
  }

  function welcome() {
    log.innerHTML = '';
    const stamp = document.createElement('div');
    stamp.className = 'cb-stamp';
    stamp.textContent = 'Today · ' + phTime() + ' PHT';
    log.appendChild(stamp);
    addBot({
      text: `<p>${greetWord()}! 👋 I'm <strong>C1</strong>, Cyper's assistant.</p><p>Ask me anything about him: experience, projects, skills, certifications, or sidelines. Pwede rin Taglish!</p>`,
      actions: [ask('Who is Cyper?'), ask('Show me his projects', 'Projects'), ask('Is he available for sidelines?', 'Sidelines & quotes')]
    });
  }

  function open_() {
    document.documentElement.classList.add('cb-open');
    root.classList.add('cb-open');
    fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('aria-label', 'Close chat');
    badge.classList.remove('is-on'); tip.classList.remove('is-on');
    try { sessionStorage.setItem(STORE + '-seen', '1'); } catch (e) {}
    if (!log.children.length) welcome();
    if (!window.matchMedia('(pointer:coarse)').matches) setTimeout(() => input.focus({ preventScroll: true }), 200);
  }
  function close() {
    root.classList.remove('cb-open');
    document.documentElement.classList.remove('cb-open');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'Open chat');
  }

  /* ── Wire up ── */
  SUGGESTIONS.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'cb-chip'; b.textContent = s;
    b.addEventListener('click', () => submit(s));
    chips.appendChild(b);
  });

  fab.addEventListener('click', () => root.classList.contains('cb-open') ? close() : open_());
  root.querySelector('[data-cb="close"]').addEventListener('click', close);
  root.querySelector('[data-cb="reset"]').addEventListener('click', () => { history = []; save(); welcome(); });
  input.addEventListener('input', () => { send.disabled = !input.value.trim(); });
  form.addEventListener('submit', e => { e.preventDefault(); submit(input.value); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && root.classList.contains('cb-open')) { close(); fab.focus(); }
  });

  // Restore this tab's conversation
  const saved = load();
  if (saved.length) {
    const stamp = document.createElement('div');
    stamp.className = 'cb-stamp'; stamp.textContent = 'Earlier in this visit';
    log.appendChild(stamp);
    saved.forEach(m => render(m, false));
    history = saved;
  }

  // Gentle nudge once per visit
  let seen = false;
  try { seen = sessionStorage.getItem(STORE + '-seen') === '1'; } catch (e) {}
  if (!seen) {
    setTimeout(() => {
      if (root.classList.contains('cb-open')) return;
      badge.classList.add('is-on'); tip.classList.add('is-on');
      setTimeout(() => tip.classList.remove('is-on'), 6000);
    }, 8000);
  }
})();
