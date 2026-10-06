/* ═══════════════════════════════════════════════════════════════════
   KNOWLEDGE GRAPH — 3D network of what I'm currently learning
   Core → topic hubs → skill leaves, plus curved cross-links that
   explain how topics feed each other. Linked both ways with the
   learn-cards below. Three.js lazy-loaded; renders only on screen.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const root = document.getElementById('learn-graph');
  if (!root) return;

  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

  const TOPICS = [
    { id: 'net', name: 'Networking & Infrastructure', short: 'Networking',
      desc: 'Exploring VLANs, switching, IP addressing, Packet Tracer, and real-world network troubleshooting.',
      leaves: ['VLANs', 'Switching', 'IP addressing', 'Packet Tracer', 'Troubleshooting'] },
    { id: 'ai', name: 'AI & Local LLMs', short: 'AI & LLMs',
      desc: 'Experimenting with Ollama, local models, AI-assisted development, and practical AI integrations.',
      leaves: ['Ollama', 'Local models', 'AI-assisted dev', 'AI integrations'] },
    { id: 'sys', name: 'Systems & Hardware', short: 'Systems',
      desc: 'Learning deeper PC/laptop diagnostics, BIOS configuration, component compatibility, virtualization, and system troubleshooting.',
      leaves: ['Diagnostics', 'BIOS config', 'Compatibility', 'Virtualization'] },
    { id: 'web', name: 'Modern Web Development', short: 'Web Dev',
      desc: 'Building with React, Vite, APIs, deployment platforms, and interactive web applications.',
      leaves: ['React', 'Vite', 'APIs', 'Interactive apps'] },
    { id: 'cloud', name: 'Cloud & Deployment', short: 'Cloud',
      desc: 'Exploring production deployment, hosting, Cloudflare, Vercel, Railway, and backend infrastructure.',
      leaves: ['Cloudflare', 'Vercel', 'Railway', 'Backend infra'] },
    { id: 'cctv', name: 'CCTV & IT Infrastructure', short: 'CCTV & IT',
      desc: 'Developing practical knowledge in CCTV layouts, NVRs, IP cameras, cabling, and site inspection.',
      leaves: ['NVRs', 'IP cameras', 'Cabling', 'Site inspection'] }
  ];

  /* Why topics connect — shown in the panel */
  const LINKS = [
    ['net', 'cctv', 'IP cameras and NVRs live on the network'],
    ['net', 'cloud', 'DNS, routing, and hosting are network problems too'],
    ['net', 'sys', 'On site, hardware and network faults show up together'],
    ['sys', 'ai', 'Local models run on real hardware: RAM, GPU, VRAM'],
    ['ai', 'web', 'AI-assisted development and AI features inside apps'],
    ['web', 'cloud', 'What I build gets shipped, hosted, and scaled'],
    ['sys', 'cctv', 'NVRs and site devices are hardware to maintain'],
    ['sys', 'cloud', 'Virtualization is the bridge from a PC to the cloud']
  ];
  /* Skill-level bridges: a leaf that reaches into another topic */
  const BRIDGES = [['cctv', 'IP cameras', 'net'], ['cctv', 'Cabling', 'net'], ['ai', 'Ollama', 'sys'], ['web', 'APIs', 'cloud'], ['sys', 'Virtualization', 'cloud']];

  const ICON = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    net: ICON('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>'),
    ai: ICON('<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
    sys: ICON('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    web: ICON('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    cloud: ICON('<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>'),
    cctv: ICON('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
    core: ICON('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>')
  };

  const idx = id => TOPICS.findIndex(t => t.id === id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stage = document.getElementById('lg-stage');
  const canvas = document.getElementById('lg-canvas');
  const labelsEl = document.getElementById('lg-labels');
  const loadingEl = document.getElementById('lg-loading');
  const el = id => document.getElementById(id);
  const panel = { step: el('lg-step'), meta: el('lg-meta'), title: el('lg-title'), desc: el('lg-desc'), tags: el('lg-tags'), links: el('lg-links') };
  const cards = Array.from(document.querySelectorAll('#learning .learn-card'));

  let selected = -1;     // -1 = overview
  let hovered = -1;
  let onChange = null;

  /* ─── Panel (works before / without WebGL) ─── */
  function renderPanel() {
    const swap = [panel.meta, panel.title, panel.desc, panel.tags, panel.links];
    if (selected < 0) {
      const skills = TOPICS.reduce((n, t) => n + t.leaves.length, 0);
      panel.step.textContent = `${TOPICS.length} TOPICS · ${skills} SKILLS · ${LINKS.length} LINKS`;
      panel.meta.textContent = 'OVERVIEW';
      panel.title.textContent = 'Everything connects.';
      panel.desc.textContent = 'Tap a node, or any card below, to trace how each topic feeds the others.';
      panel.tags.replaceChildren();
      panel.links.replaceChildren();
    } else {
      const t = TOPICS[selected];
      const rel = LINKS.filter(l => l[0] === t.id || l[1] === t.id);
      panel.step.textContent = `NODE ${String(selected + 1).padStart(2, '0')} / ${String(TOPICS.length).padStart(2, '0')} · EXPLORING`;
      panel.meta.textContent = `${t.leaves.length} SKILLS · LINKED TO ${rel.length} TOPICS`;
      panel.title.textContent = t.name;
      panel.desc.textContent = t.desc;
      panel.tags.replaceChildren(...t.leaves.map(x => { const li = document.createElement('li'); li.textContent = x; return li; }));
      panel.links.replaceChildren(...rel.map(l => {
        const other = TOPICS[idx(l[0] === t.id ? l[1] : l[0])];
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = other.short;
        b.addEventListener('click', () => select(idx(other.id), true));
        li.append(b, document.createTextNode(' — ' + l[2]));
        return li;
      }));
    }
    if (!reducedMotion) swap.forEach(n => { n.classList.remove('cc-swap'); void n.offsetWidth; n.classList.add('cc-swap'); });
    labels.forEach((b, i) => { b.classList.toggle('active', i === selected); b.setAttribute('aria-pressed', String(i === selected)); });
    cards.forEach((c, i) => c.classList.toggle('lg-active', i === selected));
  }

  function select(i, fromUser) {
    selected = i;
    renderPanel();
    if (onChange) onChange(fromUser);
  }

  const labels = TOPICS.map((t, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cc-label shown';
    b.innerHTML = `<b>${i + 1}</b><span class="lg-ico">${ICONS[t.id] || ''}</span><span class="cc-label-name"></span>`;
    b.querySelector('.cc-label-name').textContent = t.short;
    b.setAttribute('aria-label', `${t.name}: show connections`);
    b.addEventListener('click', () => select(selected === i ? -1 : i, true));
    b.addEventListener('pointerenter', () => { hovered = i; if (onChange) onChange(false); });
    b.addEventListener('pointerleave', () => { hovered = -1; if (onChange) onChange(false); });
    labelsEl.appendChild(b);
    return b;
  });

  /* Cards below ↔ graph */
  cards.forEach((card, i) => {
    if (!TOPICS[i]) return;
    card.dataset.topic = TOPICS[i].id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${TOPICS[i].name}: highlight in the knowledge graph`);
    const activate = () => {
      select(i, true);
      const r = stage.getBoundingClientRect();
      if (r.bottom < 80 || r.top > innerHeight - 80) root.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    card.addEventListener('pointerenter', () => { hovered = i; if (onChange) onChange(false); });
    card.addEventListener('pointerleave', () => { hovered = -1; if (onChange) onChange(false); });
  });

  el('lg-prev').addEventListener('click', () => select(selected <= 0 ? TOPICS.length - 1 : selected - 1, true));
  el('lg-next').addEventListener('click', () => select((selected + 1) % TOPICS.length, true));
  el('lg-reset').addEventListener('click', () => select(-1, true));
  renderPanel();

  function hasWebGL() {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; }
  }
  if (!hasWebGL()) { stage.style.display = 'none'; root.style.gridTemplateColumns = '1fr'; return; }

  const bootObs = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    bootObs.disconnect();
    import(THREE_URL).then(boot).catch(err => {
      console.warn('[Knowledge Graph] 3D unavailable:', err);
      stage.style.display = 'none';
      root.style.gridTemplateColumns = '1fr';
    });
  }, { rootMargin: '600px 0px' });
  bootObs.observe(root);

  /* ═══════════════════════════════════════════════════════════════
     SCENE
     ═══════════════════════════════════════════════════════════════ */
  function boot(THREE) {
    // the stage is always deep-space dark, so the graph keeps its dark palette in both themes
    const isLight = () => false;
    const PAL = {
      dark: { lime: '#d5fb78', node: '#f0f1e9', dim: '#3a4133', line: '#d5fb78', leaf: '#a0a598', bg: '#07090a', additive: true, lineO: 0.55 },
      light: { lime: '#4a8a14', node: '#1a1d17', dim: '#cfcabe', line: '#4a8a14', leaf: '#5f6258', bg: '#efede7', additive: false, lineO: 0.6 }
    };
    let pal = PAL[isLight() ? 'light' : 'dark'];

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (_) { stage.style.display = 'none'; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(pal.bg, 24, 46);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 2.2, 18);
    camera.lookAt(0, 0.9, 0);

    const graph = new THREE.Group();
    scene.add(graph);

    /* Glow sprite texture */
    const glowTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.22, 'rgba(255,255,255,.65)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const spriteMats = [];
    const glowMat = (opacity) => {
      const m = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity });
      spriteMats.push(m);
      return m;
    };

    /* ─── Layout ─── */
    const R = 6.1;
    const hubPos = TOPICS.map((_, i) => {
      const a = (i / TOPICS.length) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * R, (i % 2 ? 1 : -1) * 2.7, Math.sin(a) * R);
    });
    const leafPos = TOPICS.map((t, i) => {
      const hub = hubPos[i];
      const dir = new THREE.Vector3(hub.x, 0, hub.z).normalize();
      const tan = new THREE.Vector3(-dir.z, 0, dir.x);
      const n = t.leaves.length;
      return t.leaves.map((_, k) => {
        const s = k - (n - 1) / 2;   // fan: a slight arc bowing away from the hub
        return hub.clone()
          .addScaledVector(dir, 2.15 - Math.abs(s) * 0.2)
          .addScaledVector(tan, s * 0.16)
          .add(new THREE.Vector3(0, s * 0.62, 0));
      });
    });

    /* ─── Core ─── */
    const coreMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), coreMat);
    const coreInnerMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 });
    const coreInner = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 0), coreInnerMat);
    const coreGlow = new THREE.Sprite(glowMat(0.7));
    coreGlow.scale.setScalar(4.2);
    graph.add(core, coreInner, coreGlow);

    /* ─── Hubs + leaves ─── */
    const hitTargets = [];
    const hubMeshes = [], hubGlows = [], hubMats = [];
    const leafMeshes = [];
    const hubGeo = new THREE.OctahedronGeometry(0.42, 0);
    const leafGeo = new THREE.SphereGeometry(0.11, 12, 8);
    const hitGeo = new THREE.SphereGeometry(0.75, 8, 6);
    const leafHitGeo = new THREE.SphereGeometry(0.32, 6, 4);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    TOPICS.forEach((t, i) => {
      const m = new THREE.MeshBasicMaterial({ transparent: true });
      hubMats.push(m);
      const hub = new THREE.Mesh(hubGeo, m);
      hub.position.copy(hubPos[i]);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.012, 6, 48), m);
      ring.rotation.x = Math.PI / 2;
      hub.add(ring);
      const glow = new THREE.Sprite(glowMat(0.5));
      glow.scale.setScalar(2.1);
      glow.position.copy(hubPos[i]);
      const hit = new THREE.Mesh(hitGeo, hitMat);
      hit.position.copy(hubPos[i]);
      hit.userData = { hub: i };
      graph.add(hub, glow, hit);
      hubMeshes.push(hub); hubGlows.push(glow); hitTargets.push(hit);

      leafPos[i].forEach((p, k) => {
        const lm = new THREE.MeshBasicMaterial({ transparent: true });
        const leaf = new THREE.Mesh(leafGeo, lm);
        leaf.position.copy(p);
        const lh = new THREE.Mesh(leafHitGeo, hitMat);
        lh.position.copy(p);
        lh.userData = { hub: i, leaf: k };
        const lg = new THREE.Sprite(glowMat(0.5));
        lg.position.copy(p);
        lg.scale.setScalar(0.55);
        graph.add(leaf, lh, lg);
        hitTargets.push(lh);
        leafMeshes.push({ mesh: leaf, mat: lm, glow: lg, hub: i, k });
      });
    });

    /* ─── Edges ─── */
    const edges = []; // { line, mat, kind, a, b, curve }
    function addEdge(curve, kind, a, b, segments) {
      const pts = curve.getPoints(segments);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = kind === 'bridge'
        ? new THREE.LineDashedMaterial({ transparent: true, dashSize: 0.18, gapSize: 0.14, depthWrite: false })
        : new THREE.LineBasicMaterial({ transparent: true, depthWrite: false });
      const line = new THREE.Line(geo, mat);
      if (kind === 'bridge') line.computeLineDistances();
      graph.add(line);
      const e = { line, mat, kind, a, b, curve };
      edges.push(e);
      return e;
    }
    const ORIGIN = new THREE.Vector3();
    const CORE_TOP = new THREE.Vector3(0, 1.15, 0);
    TOPICS.forEach((t, i) => {
      addEdge(new THREE.LineCurve3(ORIGIN, hubPos[i]), 'spoke', -1, i, 1);
      leafPos[i].forEach(p => addEdge(new THREE.LineCurve3(hubPos[i], p), 'leaf', i, i, 1));
    });
    LINKS.forEach(([a, b]) => {
      const A = hubPos[idx(a)], B = hubPos[idx(b)];
      const mid = A.clone().add(B).multiplyScalar(0.5);
      const ctrl = mid.clone().setLength(Math.max(mid.length(), 1) * 1.55 + 1.2);
      ctrl.y += 1.4;
      addEdge(new THREE.QuadraticBezierCurve3(A, ctrl, B), 'link', idx(a), idx(b), 40);
    });
    BRIDGES.forEach(([from, leafName, to]) => {
      const fi = idx(from), ti = idx(to);
      const P = leafPos[fi][TOPICS[fi].leaves.indexOf(leafName)];
      const T = hubPos[ti];
      const ctrl = P.clone().add(T).multiplyScalar(0.5);
      ctrl.y += 1.2;
      addEdge(new THREE.QuadraticBezierCurve3(P, ctrl, T), 'bridge', fi, ti, 28);
    });

    /* ─── Pulses travelling along spokes and links ─── */
    const pulses = [];
    edges.forEach((e, n) => {
      if (e.kind === 'leaf') return;
      const count = e.kind === 'link' ? 2 : 1;
      for (let k = 0; k < count; k++) {
        const s = new THREE.Sprite(glowMat(1));
        s.scale.setScalar(e.kind === 'spoke' ? 0.55 : 0.45);
        graph.add(s);
        pulses.push({ s, e, ei: n, off: (k / count) + n * 0.137, speed: e.kind === 'spoke' ? 0.32 : 0.18, dir: k % 2 ? -1 : 1 });
      }
    });

    const leafEdgeOf = TOPICS.map((_, i) => edges.findIndex(e => e.kind === 'leaf' && e.a === i));

    /* ─── Dust ─── */
    const dustGeo = new THREE.BufferGeometry();
    const dust = [];
    for (let i = 0; i < 420; i++) {
      const r = 6 + Math.random() * 12, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      dust.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.6, r * Math.sin(ph) * Math.sin(th));
    }
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3));
    const dustMat = new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.5, depthWrite: false });
    graph.add(new THREE.Points(dustGeo, dustMat));

    /* ─── Core label ─── */
    const coreLabel = document.createElement('span');
    coreLabel.className = 'lg-core';
    coreLabel.innerHTML = `${ICONS.core}<span>Knowledge</span>`;
    coreLabel.setAttribute('aria-hidden', 'true');
    labelsEl.appendChild(coreLabel);

    /* ─── Leaf labels (HTML) ─── */
    const leafLabels = leafMeshes.map(l => {
      const s = document.createElement('span');
      s.className = 'lg-leaf';
      s.textContent = TOPICS[l.hub].leaves[l.k];
      labelsEl.appendChild(s);
      return s;
    });

    /* ─── Highlight state ─── */
    const lerp = (a, b, t) => a + (b - a) * t;
    function focusOf() { return hovered >= 0 ? hovered : selected; }
    function related(i) {
      const set = new Set([i]);
      LINKS.forEach(([a, b]) => { if (idx(a) === i) set.add(idx(b)); if (idx(b) === i) set.add(idx(a)); });
      return set;
    }

    function applyTheme() {
      pal = PAL[isLight() ? 'light' : 'dark'];
      scene.fog.color.set(pal.bg);
      coreMat.color.set(pal.lime);
      coreInnerMat.color.set(pal.lime);
      dustMat.color.set(pal.leaf);
      spriteMats.forEach(m => { m.color.set(pal.lime); m.blending = pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending; m.needsUpdate = true; });
      edges.forEach(e => e.mat.color.set(pal.line));
      requestFrame();
    }
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    /* Smoothly eased per-frame targets */
    const hubLevel = TOPICS.map(() => 1);
    const edgeLevel = edges.map(() => 1);
    function targets() {
      const f = focusOf();
      const rel = f >= 0 ? related(f) : null;
      const hubT = TOPICS.map((_, i) => (f < 0 ? 1 : i === f ? 1.6 : rel.has(i) ? 0.95 : 0.25));
      const edgeT = edges.map(e => {
        if (f < 0) return e.kind === 'bridge' ? 0.35 : e.kind === 'leaf' ? 0.5 : 0.75;
        if (e.kind === 'spoke') return e.b === f ? 1 : 0.12;
        if (e.kind === 'leaf') return e.a === f ? 1 : 0.06;
        return e.a === f || e.b === f ? 1 : 0.06;
      });
      return { f, hubT, edgeT };
    }

    /* ─── Sizing ─── */
    let W = 1, H = 1, baseZ = 18, zoom = 1, zoomT = 1, engaged = false;
    function resize() {
      const r = stage.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      baseZ = Math.min(34, Math.max(19, 12.6 / (Math.tan(camera.fov * Math.PI / 360) * camera.aspect)));
      camera.position.z = baseZ * zoom;
      camera.updateProjectionMatrix();
      requestFrame();
    }
    new ResizeObserver(resize).observe(stage);

    /* ─── Rotation + interaction ─── */
    let yaw = 0.4, pitch = 0.3, yawVel = 0, targetYaw = null, lastInteract = 0;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function pick(x, y) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(hitTargets, false)[0];
      return hit ? hit.object.userData.hub : -1;
    }
    function focusYaw(i) {
      if (i < 0) return;
      const p = hubPos[i];
      const want = -Math.atan2(p.x, p.z);
      let d = want - yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      targetYaw = yaw + d;
    }
    onChange = fromUser => { if (fromUser) { lastInteract = performance.now(); focusYaw(selected); } requestFrame(); };

    let down = null;
    // Wheel zooms only after the graph is clicked, so page scrolling is never hijacked
    stage.addEventListener('wheel', e => {
      if (!engaged) return;
      e.preventDefault();
      zoomT = Math.min(1.35, Math.max(0.55, zoomT * (e.deltaY > 0 ? 1.08 : 0.92)));
      requestFrame();
    }, { passive: false });
    stage.addEventListener('pointerdown', () => { engaged = true; stage.classList.add('engaged'); });
    stage.addEventListener('pointerleave', () => { engaged = false; stage.classList.remove('engaged'); });
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.cc-label')) return;
      down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, drag: false, id: e.pointerId };
      yawVel = 0; targetYaw = null;
    });
    stage.addEventListener('pointermove', e => {
      if (down && e.pointerId === down.id) {
        if (!down.drag && Math.abs(e.clientX - down.x) > 5 && Math.abs(e.clientX - down.x) > Math.abs(e.clientY - down.y)) {
          down.drag = true;
          stage.classList.add('dragging');
          try { stage.setPointerCapture(e.pointerId); } catch (_) {}
        }
        if (down.drag) {
          const dx = e.clientX - down.lx, dy = e.clientY - down.ly;
          yaw += dx * 0.008;
          pitch = Math.max(-0.5, Math.min(0.6, pitch + dy * 0.004));
          yawVel = dx * 0.008 * 60;
          lastInteract = performance.now();
          requestFrame();
        }
        down.lx = e.clientX; down.ly = e.clientY;
      } else if (e.pointerType === 'mouse') {
        const i = pick(e.clientX, e.clientY);
        stage.classList.toggle('hovering', i >= 0);
        if (i !== hovered) { hovered = i; labels.forEach((b, j) => b.classList.toggle('hover', j === i)); requestFrame(); }
      }
    });
    const end = e => {
      if (!down || e.pointerId !== down.id) return;
      if (!down.drag && e.type === 'pointerup') {
        const i = pick(e.clientX, e.clientY);
        if (i >= 0) select(selected === i ? -1 : i, true);
      }
      stage.classList.remove('dragging');
      down = null;
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('pointerleave', () => {
      stage.classList.remove('hovering');
      if (hovered >= 0 && !cards.some(c => c.matches(':hover'))) { hovered = -1; labels.forEach(b => b.classList.remove('hover')); requestFrame(); }
    });

    /* ─── Labels ─── */
    const v = new THREE.Vector3();
    function project(pos) {
      v.copy(pos).applyMatrix4(graph.matrixWorld).project(camera);
      return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, z: v.z };
    }
    function placeLabels(f) {
      hubPos.forEach((p, i) => {
        const q = project(p);
        const x = Math.min(W - 54, Math.max(54, q.x)), y = Math.min(H - 16, Math.max(52, q.y - 26));
        labels[i].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;
        labels[i].style.opacity = f < 0 || hubLevel[i] > 0.5 ? '' : '0.35';
        labels[i].style.zIndex = String(Math.round((1 - q.z) * 1000));
      });
      const c = project(CORE_TOP);
      coreLabel.style.transform = `translate3d(${c.x.toFixed(1)}px,${(c.y - 26).toFixed(1)}px,0) translate(-50%,-100%)`;
      const wide = W >= 700;
      leafMeshes.forEach((l, n) => {
        const q = project(l.mesh.position);
        const h = project(hubPos[l.hub]);
        const right = q.x >= h.x;   // put the text on the outer side of the fan
        const lab = leafLabels[n];
        lab.style.transform = `translate3d(${(q.x + (right ? 12 : -12)).toFixed(1)}px,${q.y.toFixed(1)}px,0) translate(${right ? '0' : '-100%'},-50%)`;
        // back of the sphere fades; other topics dim while one is focused
        const depth = Math.min(1, Math.max(0.5, (0.985 - q.z) * 22));
        const show = wide ? (f < 0 || f === l.hub) : f === l.hub;
        lab.style.opacity = show ? (f === l.hub ? 1 : depth * 0.9).toFixed(2) : (wide ? '0.12' : '0');
        lab.classList.toggle('hot', f === l.hub);
      });
    }

    /* ─── Loop ─── */
    let running = false, inView = false, last = 0;
    function requestFrame() { if (!running && inView && !document.hidden) { last = 0; requestAnimationFrame(frame); } }

    function frame(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const t = now / 1000;
      const { f, hubT, edgeT } = targets();

      // Ease highlight levels
      let settling = false;
      const k = Math.min(1, dt * 7);
      hubT.forEach((tv, i) => { hubLevel[i] = lerp(hubLevel[i], tv, k); if (Math.abs(hubLevel[i] - tv) > 0.01) settling = true; });
      edgeT.forEach((tv, i) => { edgeLevel[i] = lerp(edgeLevel[i], tv, k); if (Math.abs(edgeLevel[i] - tv) > 0.01) settling = true; });

      // Rotation
      if (!down || !down.drag) {
        if (targetYaw !== null) {
          yaw += (targetYaw - yaw) * Math.min(1, dt * 3.5);
          if (Math.abs(targetYaw - yaw) < 0.001) targetYaw = null;
        } else if (Math.abs(yawVel) > 0.01) {
          yaw += yawVel * dt; yawVel *= Math.pow(0.04, dt);
        } else if (!reducedMotion && f < 0 && now - lastInteract > 4000) {
          yaw += 0.07 * dt;
        }
      }
      graph.rotation.set(pitch, yaw, 0);
      if (Math.abs(zoomT - zoom) > 0.001) {
        zoom += (zoomT - zoom) * Math.min(1, dt * 8);
        camera.position.z = baseZ * zoom;
        settling = true;
      }

      // Nodes
      const breathe = reducedMotion ? 0 : Math.sin(t * 1.6);
      core.rotation.y = reducedMotion ? 0 : t * 0.25;
      core.rotation.x = reducedMotion ? 0 : t * 0.12;
      coreGlow.scale.setScalar(4 + breathe * 0.3);
      hubMeshes.forEach((h, i) => {
        const L = hubLevel[i];
        h.scale.setScalar(0.75 + L * 0.35);
        h.rotation.y = reducedMotion ? 0 : t * 0.6 + i;
        hubMats[i].color.set(L > 1.2 ? pal.lime : pal.node);
        hubMats[i].opacity = Math.min(1, 0.25 + L * 0.6);
        hubGlows[i].material.opacity = Math.min(0.9, L * 0.35);
        hubGlows[i].scale.setScalar(1.4 + L * 0.9);
      });
      leafMeshes.forEach(l => {
        const L = edgeLevel[leafEdgeOf[l.hub]];
        l.mat.color.set(L > 0.9 ? pal.lime : pal.leaf);
        l.mat.opacity = Math.min(1, 0.2 + L);
        l.glow.material.opacity = Math.min(0.8, L * 0.7);
      });
      edges.forEach((e, i) => { e.mat.opacity = edgeLevel[i] * pal.lineO * (e.kind === 'link' ? 1.25 : 1); });

      // Pulses
      pulses.forEach(p => {
        const L = edgeLevel[p.ei];
        let u = reducedMotion ? p.off % 1 : (t * p.speed + p.off) % 1;
        if (p.dir < 0) u = 1 - u;
        p.e.curve.getPoint(u, p.s.position);
        p.s.material.opacity = 1;
        p.s.visible = L > 0.2;
        p.s.scale.setScalar((p.e.kind === 'spoke' ? 0.55 : 0.45) * (0.6 + L * 0.5));
      });

      renderer.render(scene, camera);
      placeLabels(f);

      const animating = !reducedMotion || settling || targetYaw !== null || Math.abs(yawVel) > 0.01;
      if (inView && !document.hidden && animating) { running = true; requestAnimationFrame(frame); }
      else running = false;
    }

    new IntersectionObserver(([e]) => { inView = e.isIntersecting; requestFrame(); }, { threshold: 0.01 }).observe(stage);
    document.addEventListener('visibilitychange', requestFrame);

    applyTheme();
    resize();
    loadingEl.classList.add('done');
  }
})();
