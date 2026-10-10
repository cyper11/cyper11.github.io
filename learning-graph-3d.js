/* ═══════════════════════════════════════════════════════════════════
   KNOWLEDGE MAP — 3D constellation of what I'm currently learning
   knowledge.glb (core + six domain emblems on hex pads) · Three.js +
   bloom, lazy-loaded. Orbit · tap a domain to fly to it · packets run
   the links. Linked both ways with the learn-cards below. Follows the
   site theme: night constellation in dark, ink-on-paper in light.
   Renders only while on screen; reduced-motion friendly.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const root = document.getElementById('learn-graph');
  if (!root) return;

  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0';
  const MODULES = [
    CDN + '/+esm',
    CDN + '/examples/jsm/controls/OrbitControls.js/+esm',
    CDN + '/examples/jsm/loaders/GLTFLoader.js/+esm',
    CDN + '/examples/jsm/postprocessing/EffectComposer.js/+esm',
    CDN + '/examples/jsm/postprocessing/RenderPass.js/+esm',
    CDN + '/examples/jsm/postprocessing/UnrealBloomPass.js/+esm',
    CDN + '/examples/jsm/postprocessing/OutputPass.js/+esm',
    CDN + '/examples/jsm/environments/RoomEnvironment.js/+esm'
  ];
  const MODEL_URL = 'knowledge.glb?v=1';

  /* Order matches the domain index (1–6) baked into the model */
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

  const ICONS = {
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 12.5 9 5 9-5"/><path d="m3 17 9 4.5 9-4.5"/>',
    share: '<rect x="15" y="2.5" width="6" height="6"/><rect x="3" y="9" width="6" height="6"/><rect x="15" y="15.5" width="6" height="6"/><path d="m9 10.5 6-4M9 13.5l6 4"/>',
    cpu: '<rect x="5" y="5" width="14" height="14"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    gear: (() => {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a0 = i / 8 * Math.PI * 2;
        [[6.6, 0], [9.6, 0.17], [9.6, 0.41], [6.6, 0.58]].forEach(([r, f]) => {
          const a = a0 + f * Math.PI * 2 / 8;
          pts.push((12 + r * Math.cos(a)).toFixed(2) + ',' + (12 + r * Math.sin(a)).toFixed(2));
        });
      }
      const hex = [];
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; hex.push((12 + 2.8 * Math.cos(a)).toFixed(2) + ',' + (12 + 2.8 * Math.sin(a)).toFixed(2)); }
      return '<polygon points="' + pts.join(' ') + '"/><polygon points="' + hex.join(' ') + '"/>';
    })(),
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    cloud: '<path d="M4 18 2 14l3-4h4l2-4h5l3 4 3 3-2 5Z"/>',
    camera: '<path d="M3 6h12l4 4H3Z"/><path d="M15 10v3H5v-3"/><path d="M9 13v4H4"/><path d="M4 14.5v5"/>'
  };
  const icon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="miter" stroke-linecap="square" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  const HEX = '<svg viewBox="-20 -20 40 40"><polygon points="0,-17 14.7,-8.5 14.7,8.5 0,17 -14.7,8.5 -14.7,-8.5"></polygon></svg>';

  const idx = id => TOPICS.findIndex(t => t.id === id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad2 = n => String(n).padStart(2, '0');

  const el = id => document.getElementById(id);
  const stage = el('lg-stage');
  const canvas = el('lg-canvas');
  const labelsEl = el('lg-labels');
  const loadingEl = el('lg-loading');
  const panel = { step: el('lg-step'), meta: el('lg-meta'), title: el('lg-title'), desc: el('lg-desc'), links: el('lg-links') };
  const card = { box: el('lg-card'), k: el('lg-card-k'), v: el('lg-card-v'), chips: el('lg-chips') };
  const cards = Array.from(document.querySelectorAll('#learning .learn-card'));

  let selected = -1;     // -1 = overview (0-based topic index otherwise)
  let hovered = -1;
  let onSelect = null;   // set by the 3D scene

  /* ─── Panel + card (work before / without WebGL) ─── */
  function render() {
    const swap = [panel.meta, panel.title, panel.desc, panel.links];
    if (selected < 0) {
      const skills = TOPICS.reduce((n, t) => n + t.leaves.length, 0);
      panel.step.textContent = `${TOPICS.length} TOPICS · ${skills} SKILLS · ${LINKS.length} LINKS`;
      panel.meta.textContent = 'OVERVIEW';
      panel.title.textContent = 'Everything connects.';
      panel.desc.textContent = 'Tap a domain, or any card below, to trace how each topic feeds the others.';
      panel.links.replaceChildren();
      card.box.classList.add('off');
    } else {
      const t = TOPICS[selected];
      const rel = LINKS.filter(l => l[0] === t.id || l[1] === t.id);
      panel.step.textContent = `DOMAIN ${pad2(selected + 1)} / ${pad2(TOPICS.length)} · EXPLORING`;
      panel.meta.textContent = `${t.leaves.length} SKILLS · LINKED TO ${rel.length} TOPICS`;
      panel.title.textContent = t.name;
      panel.desc.textContent = t.desc;
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
      card.k.textContent = `Domain ${pad2(selected + 1)} / ${pad2(TOPICS.length)}`;
      card.v.textContent = t.short;
      card.chips.replaceChildren(...t.leaves.map(s => { const li = document.createElement('li'); li.className = 'km-chamfer'; li.textContent = s; return li; }));
      card.box.classList.remove('off');
    }
    if (!reducedMotion) swap.forEach(n => { n.classList.remove('cc-swap'); void n.offsetWidth; n.classList.add('cc-swap'); });
    cards.forEach((c, i) => c.classList.toggle('lg-active', i === selected));
  }

  function select(i, fromUser) {
    selected = i;
    render();
    if (onSelect) onSelect(fromUser);
  }
  function step(d) {
    const n = TOPICS.length;
    select(selected < 0 ? (d > 0 ? 0 : n - 1) : (selected + d + n) % n, true);
  }

  /* Cards below ↔︎ map */
  cards.forEach((c, i) => {
    if (!TOPICS[i]) return;
    c.dataset.topic = TOPICS[i].id;
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');
    c.setAttribute('aria-label', `${TOPICS[i].name}: show in the knowledge map`);
    const activate = () => {
      select(i, true);
      const r = stage.getBoundingClientRect();
      if (r.bottom < 80 || r.top > innerHeight - 80) root.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    };
    c.addEventListener('click', activate);
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    c.addEventListener('pointerenter', () => { hovered = i; });
    c.addEventListener('pointerleave', () => { hovered = -1; });
  });

  el('lg-prev').addEventListener('click', () => step(-1));
  el('lg-next').addEventListener('click', () => step(1));
  el('lg-reset').addEventListener('click', () => select(-1, true));
  el('lg-home').addEventListener('click', () => select(-1, true));
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Escape') select(-1, true);
  });
  {
    const skills = TOPICS.reduce((n, t) => n + t.leaves.length, 0);
    el('lg-sub').textContent = `${TOPICS.length} domains · ${skills} skills · drag to orbit`;
  }
  render();

  /* Hex tap ripple — pure DOM, so it works over the HUD too */
  stage.addEventListener('pointerdown', e => {
    if (reducedMotion) return;
    const r = stage.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'km-ripple';
    d.innerHTML = HEX;
    d.style.left = (e.clientX - r.left) + 'px';
    d.style.top = (e.clientY - r.top) + 'px';
    stage.appendChild(d);
    setTimeout(() => d.remove(), 750);
  });

  function unsupported(msg) {
    if (msg) {
      loadingEl.classList.add('err');
      el('lg-loader-t').textContent = msg;
      return;
    }
    stage.style.display = 'none';
  }
  function hasWebGL() {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; }
  }
  if (!hasWebGL()) { unsupported(); return; }

  /* Lazy boot: only fetch Three.js + the model when the section approaches */
  const bootObs = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    bootObs.disconnect();
    const model = fetch(MODEL_URL).then(r => {
      if (!r.ok) throw new Error('model ' + r.status);
      return r.arrayBuffer();
    });
    Promise.all([Promise.all(MODULES.map(u => import(u))), model])
      .then(([mods, buf]) => boot(mods, buf))
      .catch(err => {
        console.warn('[Knowledge Map] 3D unavailable:', err);
        unsupported();
      });
  }, { rootMargin: '600px 0px' });
  bootObs.observe(root);

  /* ═══════════════════════════════════════════════════════════════
     SCENE
     ═══════════════════════════════════════════════════════════════ */
  function boot(mods, buf) {
    const THREE = mods[0];
    const { OrbitControls } = mods[1];
    const { GLTFLoader } = mods[2];
    const { EffectComposer } = mods[3];
    const { RenderPass } = mods[4];
    const { UnrealBloomPass } = mods[5];
    const { OutputPass } = mods[6];
    const { RoomEnvironment } = mods[7];

    const HOME_TARGET = new THREE.Vector3(0, 1.2, 0);
    const motion = reducedMotion ? 0 : 1;

    /* Night constellation in dark mode, ink-on-paper in light mode.
       mat: per-material overrides for light (colour + emissive multiplier). */
    const THEMES = {
      dark: {
        bg: 0x090a08, aces: true, exposure: 1, sky: 0xb9c4d6, ground: 0x0c0e0b, hemi: 0.55, key: 0xe2e9ff, keyI: 1.5, rimI: 0.7, fillI: 0.25,
        bloom: 0.34, threshold: 0.9, accent: 0xc8f04a, boost: 1.5, hot: 0xeaffb0, hotBoost: 2.3, floorGain: 1, additive: true, stars: true, mat: {}
      },
      light: {
        bg: 0xefede7, aces: false, exposure: 1, sky: 0xffffff, ground: 0xc9c4b8, hemi: 1.15, key: 0xfff6e6, keyI: 1.7, rimI: 0.3, fillI: 0.35,
        bloom: 0.1, threshold: 1, accent: 0x4f9a10, boost: 1, hot: 0x24560a, hotBoost: 1, floorGain: 2.2, additive: false, stars: false,
        mat: {
          pad: { c: 0xdad6cc }, pad_side: { c: 0xb4afa3 }, metal_dark: { c: 0x50554b }, chip: { c: 0x2c3029 },
          leaf: { c: 0x8c9282, e: 0 }, accent: { c: 0x4f9a10, e: 0.12 }, rim: { c: 0x4f9a10, e: 0.1 }, accent_soft: { c: 0x6aa82e, e: 0.1 },
          core: { c: 0x7fd21e, e: 0.3 }, link: { c: 0x4f9a10, e: 0.12 }, link_dim: { c: 0xa9c98a, e: 0 },
          led_a: { c: 0x4f9a10, e: 0.4 }, led_b: { c: 0x4f9a10, e: 0.4 }, led_warm: { e: 0.5 }, rec: { e: 0.5 }
        }
      }
    };
    const isLight = () => document.documentElement.dataset.theme === 'light';
    let th = THEMES[isLight() ? 'light' : 'dark'];

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (_) { unsupported(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color();
    scene.fog = new THREE.FogExp2(0x000000, 0.0052);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 1500);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 12;
    controls.maxDistance = 240;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.enablePan = false;
    controls.enableZoom = false;          // zoom only once the map is engaged, so page scroll is never hijacked
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.4;
    controls.target.copy(HOME_TARGET);
    canvas.style.touchAction = 'pan-y';   // vertical swipes still scroll the page on phones

    const rotBtn = el('lg-rotate');
    rotBtn.setAttribute('aria-pressed', String(controls.autoRotate));
    rotBtn.addEventListener('click', () => {
      controls.autoRotate = !controls.autoRotate;
      rotBtn.setAttribute('aria-pressed', String(controls.autoRotate));
    });

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const hemi = new THREE.HemisphereLight(0xb9c4d6, 0x0c0e0b, 0.55);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xe2e9ff, 1.5);
    key.position.set(-30, 40, 30);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc8f04a, 0.7);
    rim.position.set(20, 12, -40);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffd7a0, 0.25);
    fill.position.set(30, 15, 25);
    scene.add(fill);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.34, 0.35, 0.9);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    let W = 1, H = 1;
    function resize() {
      const r = stage.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    function homeView() {
      const vf = THREE.MathUtils.degToRad(camera.fov);
      const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
      const dist = Math.max(19 / Math.tan(vf / 2), (camera.aspect < 0.8 ? 21 : 30) / Math.tan(hf / 2));
      const dir = new THREE.Vector3(0, 0.62, 1).normalize();
      return { pos: dir.multiplyScalar(dist).add(HOME_TARGET), target: HOME_TARGET.clone() };
    }

    /* ─── Camera tween (arcs over the core instead of cutting through it) ─── */
    let tween = null;
    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function flyTo(pos, target, dur = 1400) {
      if (reducedMotion) dur = 1;
      const lift = Math.min(18, camera.position.distanceTo(pos) * 0.22);
      tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, start: performance.now(), dur, lift };
    }
    controls.addEventListener('start', () => { tween = null; });

    /* ─── Starfield (dark only) ─── */
    const starMat = (() => {
      const n = 1800, pos = new Float32Array(n * 3), seed = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = 180 + Math.random() * 260;
        const s = Math.sqrt(1 - u * u);
        pos[i * 3] = r * s * Math.cos(a); pos[i * 3 + 1] = r * Math.abs(u) * 0.9 + 10; pos[i * 3 + 2] = r * s * Math.sin(a);
        seed[i] = Math.random();
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
      const m = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
        vertexShader: 'attribute float seed; uniform float uTime; uniform float uPx; varying float vA;' +
          'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);' +
          'float tw = 0.55 + 0.45 * sin(uTime * (0.5 + seed * 1.8) + seed * 40.0);' +
          'vA = tw * (0.3 + 0.7 * fract(seed * 7.31)); gl_PointSize = (1.0 + 1.8 * fract(seed * 3.17)) * uPx; }',
        fragmentShader: 'varying float vA; void main(){ gl_FragColor = vec4(vec3(0.86, 0.9, 0.8) * vA, 1.0); }',
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
      });
      const p = new THREE.Points(g, m);
      p.frustumCulled = false;
      scene.add(p);
      m.userData.points = p;
      return m;
    })();

    /* ─── Hex floor (shader). Outputs straight alpha so it works additive (dark) or over paper (light). ─── */
    const floorMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uGain: { value: 1 },
        uHub: { value: new THREE.Vector3() }, uHubOn: { value: 0 },
        uRip: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, 0, -99, 0)) }
      },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `
        uniform float uTime; uniform vec3 uColor; uniform float uGain; uniform vec3 uHub; uniform float uHubOn; uniform vec4 uRip[4];
        varying vec3 vW;
        const vec2 S = vec2(1.0, 1.7320508);
        vec4 hexC(vec2 p){ vec4 hc = floor(vec4(p, p - vec2(0.5, 1.0)) / S.xyxy) + 0.5;
          vec4 h = vec4(p - hc.xy * S, p - (hc.zw + 0.5) * S);
          return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, hc.xy) : vec4(h.zw, hc.zw + 0.5); }
        float hexD(vec2 p){ p = abs(p); return max(dot(p, S * 0.5), p.x); }
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          vec2 q = vW.xz / 2.6;
          vec4 h = hexC(q);
          float e = 0.5 - hexD(h.xy);
          float line = 1.0 - smoothstep(0.0, 0.03, e);
          float r = hexD(vW.xz / 1.0);
          float fade = smoothstep(52.0, 8.0, length(vW.xz));
          float wave = exp(-pow((r - mod(uTime * 8.0, 70.0)) / 2.0, 2.0));
          float flick = step(0.986, hash(h.zw + floor(uTime * 1.4)));
          float hub = uHubOn * exp(-pow(hexD((vW.xz - uHub.xz) / 1.0) / 3.6, 2.0));
          float rip = 0.0;
          for (int i = 0; i < 4; i++) {
            float age = uTime - uRip[i].z;
            if (age > 0.0 && age < 1.6) {
              float d = hexD(vW.xz - uRip[i].xy);
              rip += exp(-pow((d - age * 11.0) / 1.1, 2.0)) * (1.0 - age / 1.6) * uRip[i].w;
            }
          }
          float a = line * (0.04 + 0.22 * wave + 0.35 * hub + 0.6 * rip) + (flick * 0.025 + hub * 0.03 + rip * 0.03);
          gl_FragColor = vec4(uColor, clamp(a * fade * uGain, 0.0, 1.0));
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    scene.add(floorMesh);
    let ripIdx = 0;
    function floorRipple(x, z, strength = 1) {
      floorMat.uniforms.uRip.value[ripIdx].set(x, z, floorMat.uniforms.uTime.value, strength);
      ripIdx = (ripIdx + 1) % 4;
    }

    /* ─── 3D hex ripples + selection ring ─── */
    const accentMats = [];   // basic materials that take the theme accent
    const basic = opts => { const m = new THREE.MeshBasicMaterial(Object.assign({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }, opts)); accentMats.push(m); return m; };
    const ripplePool = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 6, 1, Math.PI / 2), basic({}));
      m.rotation.x = -Math.PI / 2;
      m.visible = false;
      scene.add(m);
      ripplePool.push({ mesh: m, t: 1, max: 1 });
    }
    function spawnRipple(point, size = 2.2) {
      const r = ripplePool.find(p => p.t >= 1) || ripplePool[0];
      r.mesh.position.set(point.x, point.y + 0.05, point.z);
      r.t = 0; r.max = size; r.mesh.visible = true;
    }
    const selMat = basic({});
    const selRing = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.17, 6, 1, Math.PI / 2), selMat);
    selRing.rotation.x = -Math.PI / 2;
    scene.add(selRing);

    const packetGeo = new THREE.OctahedronGeometry(0.15, 0);
    packetGeo.scale(1, 1, 2.8);
    const packetMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const packetHot = new THREE.MeshBasicMaterial({ toneMapped: false });
    let scanMats = null;   // CCTV scan cone { cone, edges }

    /* ─── Model ─── */
    const V = a => new THREE.Vector3(a[0], a[1], a[2]);
    const domains = [];
    const coreParts = {};
    const links = [];
    const packets = [];
    const mats = {};
    const themedMats = [];   // every GLB material (plus per-link clones) with its dark-mode snapshot
    const pickTargets = [];
    let floorY = -5.6, padR = 2.3, coreHot = false, ready = false;

    function snapshot(m, keyName) {
      m.userData.key = keyName;
      m.userData.dark = { c: m.color.clone(), ei: m.emissiveIntensity, env: m.metalness > 0.3 ? 0.55 : 0.2 };
      themedMats.push(m);
    }
    function firstMesh(o) { let m = null; o.traverse(c => { if (!m && c.isMesh) m = c; }); return m; }
    function tag(o, dom) { o.traverse(c => { c.userData.dom = dom; }); pickTargets.push(o); }

    function makePill(text, iconName, num, extra) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'km-pill km-chamfer' + (extra ? ' ' + extra : '');
      b.innerHTML = '<span class="km-pill-in">' + (num ? '<span class="n">' + num + '</span>' : '') + icon(iconName) + '<span class="t"></span></span>';
      b.querySelector('.t').textContent = text;
      labelsEl.appendChild(b);
      return b;
    }

    function addScanCone(rec, lens) {
      const h = 5.2;
      const geo = new THREE.ConeGeometry(1.7, h, 4, 1, true);
      geo.translate(0, -h / 2, 0);
      const coneMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
      const cone = new THREE.Mesh(geo, coneMat);
      const edgeMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35, depthWrite: false, toneMapped: false });
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      cone.raycast = () => {};
      edges.raycast = () => {};
      const g = new THREE.Group();
      g.add(cone, edges);
      g.position.copy(lens.lens);
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), lens.dir.clone().normalize());
      rec.em.add(g);
      scanMats = { cone: coneMat, edges: edgeMat };
      rec.scan = coneMat;
    }

    function setup(gltf) {
      const model = gltf.scene;
      scene.add(model);
      let info = null;
      model.traverse(o => { if (!info && o.userData && o.userData.domains) info = o.userData; });
      if (!info) throw new Error('map data missing from the model');
      floorY = info.floorY ?? floorY;
      padR = info.padR ?? padR;
      floorMesh.position.y = floorY + 0.03;
      const fl = model.getObjectByName('Floor');
      if (fl) fl.visible = false;

      const seen = new Set();
      model.traverse(o => {
        if (!o.isMesh || seen.has(o.material)) return;
        seen.add(o.material);
        const k = (o.material.name || '').replace(/^KM_/, '');   // Blender exports prefix names with KM_
        mats[k] = o.material;
        snapshot(o.material, k);
      });

      // core
      ['Core_Crystal', 'Core_Cage', 'Core_Halo_1', 'Core_Halo_2', 'Core_Layer_1', 'Core_Layer_2', 'Core_Layer_3'].forEach(n => {
        const o = model.getObjectByName(n);
        if (!o) return;
        coreParts[n] = { obj: o, speed: Number(o.userData.speed) || 0 };
        tag(o, 0);
      });
      const corePill = makePill('Knowledge', 'layers', null, 'core');
      corePill.setAttribute('aria-label', 'Knowledge core: show the full map');
      corePill.addEventListener('click', () => select(-1, true));
      corePill.addEventListener('pointerenter', () => { coreHot = true; });
      corePill.addEventListener('pointerleave', () => { coreHot = false; });
      coreParts.anchor = V(info.core ? info.core.anchor : [0, 8, 0]);
      coreParts.pill = corePill;

      // domains
      for (const D of info.domains) {
        const em = model.getObjectByName('Emblem_' + D.index + '_' + D.key);
        const hub = model.getObjectByName('Hub_' + D.index + '_' + D.key);
        if (!em || !hub) continue;
        const pivot = new THREE.Group();
        pivot.position.copy(em.position);
        scene.add(pivot);
        pivot.attach(em);
        const parts = [];
        model.traverse(o => { if (o.name && o.name.startsWith('EmblemPart_' + D.index + '_')) parts.push(o); });
        parts.forEach(p => pivot.attach(p));
        const leaves = D.leaves.map((L, k) => {
          const obj = model.getObjectByName('Leaf_' + D.index + '_' + k);
          const lab = document.createElement('div');
          lab.className = 'km-leaf';
          lab.textContent = L.label;
          lab.setAttribute('aria-hidden', 'true');
          labelsEl.appendChild(lab);
          if (obj) tag(obj, D.index);
          return { obj, baseY: obj ? obj.position.y : 0, el: lab, phase: Math.random() * 6.28, pos: V(L.pos), w: 0, dy: 0 };
        });
        const linkObj = model.getObjectByName('Link_core_' + D.index);
        const linkMesh = linkObj ? firstMesh(linkObj) : null;
        if (linkMesh) {
          const k = linkMesh.material.userData.key;
          linkMesh.material = linkMesh.material.clone();
          snapshot(linkMesh.material, k);
        }
        const t = TOPICS[D.index - 1];
        const pill = makePill(t ? t.short : D.label, D.icon, D.index);
        pill.setAttribute('aria-label', 'Open ' + (t ? t.name : D.label));
        pill.addEventListener('click', () => select(selected === D.index - 1 ? -1 : D.index - 1, true));
        pill.addEventListener('pointerenter', () => { hovered = D.index - 1; });
        pill.addEventListener('pointerleave', () => { hovered = -1; });
        const rec = {
          index: D.index, key: D.key, hub: V(D.hub), anchor: V(D.anchor), baseY: pivot.position.y,
          pivot, em, parts, leaves, linkMesh, pill, hot: 0, face: null, phase: D.index * 1.3
        };
        tag(hub, D.index); tag(pivot, D.index);
        const tr = model.getObjectByName('Traces_' + D.index);
        if (tr) tr.traverse(c => { c.userData.dom = D.index; });
        if (D.key === 'cctv' && em.userData.lens) addScanCone(rec, { lens: V(em.userData.lens), dir: V(em.userData.lens_dir) });
        domains.push(rec);
      }
      domains.sort((a, b) => a.index - b.index);

      // links + packets
      for (const L of info.links || []) {
        const pts = L.pts.map(V);
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
        const link = Object.assign({}, L, { pts, cum, total: cum[cum.length - 1] });
        links.push(link);
        const count = L.kind === 'main' ? 3 : 1;
        for (let k = 0; k < count; k++) {
          const mesh = new THREE.Mesh(packetGeo, packetMat);
          mesh.frustumCulled = false;
          scene.add(mesh);
          packets.push({
            link, mesh, s: link.total * (k / count) + Math.random() * 0.5,
            v: L.kind === 'main' ? 6.5 : (L.kind === 'ring' ? 3.2 : 2.6),
            dir: (L.kind === 'main' && k === 2) ? -1 : 1
          });
        }
      }
    }

    function pointAt(L, s, out) {
      s = Math.min(Math.max(s, 0), L.total);
      let lo = 0, hi = L.cum.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (L.cum[mid] < s) lo = mid; else hi = mid; }
      const seg = (L.cum[hi] - L.cum[lo]) || 1;
      return out.copy(L.pts[lo]).lerp(L.pts[hi], (s - L.cum[lo]) / seg);
    }

    /* ─── Theme ─── */
    function applyTheme() {
      th = THEMES[isLight() ? 'light' : 'dark'];
      scene.background.set(th.bg);
      scene.fog.color.set(th.bg);
      renderer.toneMapping = th.aces ? THREE.ACESFilmicToneMapping : THREE.LinearToneMapping;
      renderer.toneMappingExposure = th.exposure;
      hemi.color.set(th.sky); hemi.groundColor.set(th.ground); hemi.intensity = th.hemi;
      key.color.set(th.key); key.intensity = th.keyI;
      rim.color.set(th.accent); rim.intensity = th.rimI;
      fill.intensity = th.fillI;
      bloom.strength = th.bloom;
      bloom.threshold = th.threshold;
      const accent = new THREE.Color(th.accent);
      const blend = th.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      starMat.userData.points.visible = th.stars;
      floorMat.uniforms.uColor.value.copy(accent);
      floorMat.uniforms.uGain.value = th.floorGain;
      floorMat.blending = blend;
      floorMat.needsUpdate = true;
      accentMats.forEach(m => m.color.copy(accent));
      packetMat.color.copy(accent).multiplyScalar(th.boost);
      packetHot.color.set(th.hot).multiplyScalar(th.hotBoost);
      if (scanMats) {
        scanMats.cone.color.copy(accent);
        scanMats.cone.blending = blend;
        scanMats.cone.needsUpdate = true;
        scanMats.edges.color.copy(accent);
      }
      for (const m of themedMats) {
        const d = m.userData.dark;
        const o = th.mat[m.userData.key] || {};
        if (o.c !== undefined) m.color.set(o.c); else m.color.copy(d.c);
        m.userData.base = d.ei * (o.e ?? 1);
        m.emissiveIntensity = m.userData.base;
        m.envMapIntensity = d.env;
      }
    }
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    /* ─── Selection (driven by the shared state above) ─── */
    const byIndex = i => domains.find(d => d.index === i);
    onSelect = fromUser => {
      if (!ready) return;
      const D = selected >= 0 ? byIndex(selected + 1) : null;
      domains.forEach(d => { d.pill.classList.toggle('on', D === d); d.pill.setAttribute('aria-pressed', String(D === d)); });
      if (!fromUser) return;
      if (!D) {
        floorRipple(0, 0, 1.4);
        const h = homeView();
        flyTo(h.pos, h.target);
        return;
      }
      floorRipple(D.hub.x, D.hub.z, 1.2);
      spawnRipple(D.hub, padR * 2.6);
      const target = new THREE.Vector3(D.hub.x, D.hub.y - 0.6, D.hub.z);
      const out = new THREE.Vector3(D.hub.x, 0, D.hub.z).normalize();
      const side = new THREE.Vector3(-out.z, 0, out.x).multiplyScalar(0.35);
      const back = Math.max(1, 1.05 / camera.aspect);   // portrait phones need to stand further back
      const pos = target.clone().add(out.add(side).normalize().multiplyScalar(26 * back)).add(new THREE.Vector3(0, 13 * back, 0));
      flyTo(pos, target);
    };

    /* ─── Picking ─── */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    function setRay(x, y) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
    }
    function pick(x, y) {
      setRay(x, y);
      const hit = raycaster.intersectObjects(pickTargets, true).find(h => h.object.isMesh && h.object.visible);
      return hit ? { point: hit.point, dom: hit.object.userData.dom } : null;
    }
    let down = null, moveQueued = null, pointerHover = null;
    canvas.addEventListener('pointerdown', e => {
      down = { x: e.clientX, y: e.clientY };
      controls.enableZoom = true;
      stage.classList.add('engaged');
    });
    canvas.addEventListener('pointerup', e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 6) return;
      const hit = pick(e.clientX, e.clientY);
      if (hit) {
        spawnRipple(hit.point, 1.4);
        if (hit.dom === 0) select(-1, true);
        else if (hit.dom) select(selected === hit.dom - 1 ? -1 : hit.dom - 1, true);
        return;
      }
      floorPlane.constant = -floorY;
      const p = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(floorPlane, p)) floorRipple(p.x, p.z, 1);
    });
    canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') moveQueued = { x: e.clientX, y: e.clientY }; });
    stage.addEventListener('pointerleave', () => {
      moveQueued = null;
      if (pointerHover !== null) { pointerHover = null; hovered = -1; coreHot = false; }
      stage.classList.remove('hovering', 'engaged');
      controls.enableZoom = false;
    });

    /* ─── Loop (runs only while visible) ─── */
    const clock = new THREE.Clock(false);
    const proj = new THREE.Vector3();
    const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
    const leafItems = [];
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => domains.forEach(D => D.leaves.forEach(L => { L.w = 0; })));
    function lerpAngle(a, b, k) {
      const d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      return a + d * k;
    }
    function toScreen(v) {
      proj.copy(v).project(camera);
      return { x: (proj.x * 0.5 + 0.5) * W, y: (-proj.y * 0.5 + 0.5) * H, z: proj.z, behind: proj.z > 1 };
    }
    const CORE_NAMES = ['Core_Crystal', 'Core_Cage', 'Core_Halo_1', 'Core_Halo_2', 'Core_Layer_1', 'Core_Layer_2', 'Core_Layer_3'];

    let running = false, inView = false, introDone = false;
    function kick() {
      if (!running && ready && inView && !document.hidden) { running = true; clock.start(); requestAnimationFrame(frame); }
    }

    function frame() {
      if (!inView || document.hidden) { running = false; clock.stop(); return; }
      requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      floorMat.uniforms.uTime.value = t;
      starMat.uniforms.uTime.value = t;

      if (tween) {
        const k = Math.min(1, (performance.now() - tween.start) / tween.dur);
        const e = ease(k);
        camera.position.lerpVectors(tween.p0, tween.p1, e);
        camera.position.y += Math.sin(Math.PI * e) * tween.lift;
        controls.target.lerpVectors(tween.t0, tween.t1, e);
        if (k >= 1) tween = null;
      }
      controls.update();
      scene.fog.density = 0.42 / Math.max(20, camera.position.distanceTo(controls.target));

      if (moveQueued) {
        const hit = pick(moveQueued.x, moveQueued.y);
        moveQueued = null;
        const dom = hit ? (hit.dom ?? null) : null;
        if (dom !== pointerHover) {
          pointerHover = dom;
          hovered = dom ? dom - 1 : -1;
          coreHot = dom === 0;
          stage.classList.toggle('hovering', dom !== null);
        }
      }
      domains.forEach(d => d.pill.classList.toggle('hot', d.index - 1 === hovered));
      if (coreParts.pill) coreParts.pill.classList.toggle('hot', coreHot);

      // core
      const cp = coreParts;
      for (const n of CORE_NAMES) if (cp[n]) cp[n].obj.rotation.y += cp[n].speed * dt * motion;
      if (cp.Core_Cage) cp.Core_Cage.obj.rotation.x = 0.18 * Math.sin(t * 0.3) * motion;
      if (cp.Core_Crystal) {
        const s = 1 + (coreHot ? 0.08 : 0) + 0.03 * Math.sin(t * 2.2) * motion;
        const o = cp.Core_Crystal.obj;
        o.scale.setScalar(o.scale.x + (s - o.scale.x) * Math.min(1, dt * 8));
      }
      if (mats.core) mats.core.emissiveIntensity = mats.core.userData.base * (0.85 + 0.2 * Math.sin(t * 2.2) * motion);
      if (mats.led_a) mats.led_a.emissiveIntensity = mats.led_a.userData.base * (Math.sin(t * 5.0) > 0 ? 1 : 0.25);
      if (mats.led_b) mats.led_b.emissiveIntensity = mats.led_b.userData.base * (Math.sin(t * 3.3 + 1) > 0 ? 1 : 0.25);
      if (mats.rec) mats.rec.emissiveIntensity = mats.rec.userData.base * (Math.sin(t * 4.0) > 0 ? 1 : 0.15);

      // domains
      const act = selected >= 0 ? selected + 1 : null;
      const hov = hovered >= 0 ? hovered + 1 : null;
      const focus = act ?? hov;
      for (const D of domains) {
        const want = (D.index === hov ? 1 : 0) + (D.index === act ? 0.6 : 0);
        D.hot += (want - D.hot) * Math.min(1, dt * 7);
        const p = D.pivot;
        p.position.y = D.baseY + 0.18 * Math.sin(t * 1.2 + D.phase) * motion + D.hot * 0.35;
        p.scale.setScalar(1 + D.hot * 0.12);
        const faceT = Math.atan2(camera.position.x - p.position.x, camera.position.z - p.position.z);
        D.face = D.face === null ? faceT : lerpAngle(D.face, faceT, Math.min(1, dt * 2.5));
        switch (D.key) {
          case 'networking': p.rotation.y = t * 0.45 * motion; D.em.rotation.x = 0.28 * Math.sin(t * 0.6) * motion; break;
          case 'ai': p.rotation.y = D.face + 0.4 * Math.sin(t * 0.5) * motion; break;
          case 'systems':
            p.rotation.y = D.face + 0.25 * Math.sin(t * 0.5) * motion;
            D.em.rotation.z = t * 0.7 * motion;
            D.parts.forEach(q => { q.rotation.z = -t * 0.7 * (12 / 7) * motion + 0.12; });
            break;
          case 'webdev': p.rotation.y = D.face + 0.45 * Math.sin(t * 0.55) * motion; break;
          case 'cloud': p.rotation.y = t * 0.15 * motion; break;
          case 'cctv':
            p.rotation.y = D.face + 0.95 + 0.6 * Math.sin(t * 0.45) * motion;
            if (D.scan) D.scan.opacity = (th.additive ? 1 : 2) * (0.05 + 0.03 * Math.sin(t * 3));
            break;
        }
        const isFocus = focus === D.index;
        for (const L of D.leaves) {
          if (!L.obj) continue;
          L.obj.rotation.y += dt * 0.9 * motion;
          L.obj.position.y = L.baseY + 0.1 * Math.sin(t * 1.6 + L.phase) * motion;
          const s = isFocus ? 1.25 : 1;
          L.obj.scale.setScalar(L.obj.scale.x + (s - L.obj.scale.x) * Math.min(1, dt * 6));
        }
        if (D.linkMesh) {
          const m = D.linkMesh.material;
          const target = m.userData.base * (isFocus ? 2.4 : 1);
          m.emissiveIntensity += (target - m.emissiveIntensity) * Math.min(1, dt * 6);
        }
      }

      // selection ring + floor glow
      const F = focus ? byIndex(focus) : null;
      selMat.opacity += ((F ? 0.85 : 0) - selMat.opacity) * Math.min(1, dt * 6);
      floorMat.uniforms.uHubOn.value += ((F ? 1 : 0) - floorMat.uniforms.uHubOn.value) * Math.min(1, dt * 4);
      if (F) {
        selRing.position.set(F.hub.x, F.hub.y + 0.04, F.hub.z);
        selRing.scale.setScalar(padR * (1 + 0.03 * Math.sin(t * 3) * motion));
        floorMat.uniforms.uHub.value.copy(F.hub);
      }

      for (const r of ripplePool) {
        if (r.t >= 1) { r.mesh.visible = false; continue; }
        r.t = Math.min(1, r.t + dt / 0.9);
        const e = 1 - Math.pow(1 - r.t, 3);
        r.mesh.scale.setScalar(0.3 + e * r.max);
        r.mesh.material.opacity = 0.6 * (1 - r.t);
      }

      for (const P of packets) {
        const L = P.link;
        const hot = L.kind === 'main' && focus === L.b;
        P.s += P.v * dt * P.dir * motion * (hot ? 1.8 : 1);
        if (P.s > L.total) P.s -= L.total;
        if (P.s < 0) P.s += L.total;
        pointAt(L, P.s, tmpA);
        pointAt(L, P.s + 0.4 * P.dir, tmpB);
        P.mesh.position.copy(tmpA);
        P.mesh.lookAt(tmpB);
        const edge = Math.min(P.s, L.total - P.s);
        P.mesh.scale.setScalar(Math.min(1, edge / 1.2) * (hot ? 1.35 : 1));
        P.mesh.material = hot ? packetHot : packetMat;
      }

      composer.render();

      // labels
      if (cp.pill) {
        const s = toScreen(cp.anchor);
        cp.pill.classList.toggle('behind', s.behind);
        cp.pill.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px) translate(-50%,-100%)';
        cp.pill.style.zIndex = String(1000 - Math.round(s.z * 1000));
      }
      for (const D of domains) {
        tmpA.copy(D.anchor); tmpA.y += D.pivot.position.y - D.baseY + D.hot * 0.4;
        const s = toScreen(tmpA);
        D.pill.classList.toggle('behind', s.behind);
        D.pill.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px) translate(-50%,-100%)';
        D.pill.style.zIndex = String(1000 - Math.round(s.z * 1000));
        const hubS = toScreen(D.hub);
        const isFocus = focus === D.index;
        for (const L of D.leaves) {
          const ls = toScreen(L.obj ? L.obj.position : L.pos);
          L.el.classList.toggle('behind', ls.behind);
          L.el.classList.toggle('hot', isFocus);
          L.el.classList.toggle('dim', focus !== null && !isFocus);
          L.el.classList.toggle('show', isFocus);
          L.sx = ls.x; L.sy = ls.y; L.right = ls.x >= hubS.x; L.vis = !ls.behind;
          if (!L.w) L.w = L.el.offsetWidth;
          leafItems.push(L);
        }
      }
      // keep skill labels from stacking on top of each other
      const items = leafItems.filter(L => L.vis && L.w > 0);
      for (const L of items) { L.x0 = L.right ? L.sx - 6 : L.sx - 14 - L.w; L.x1 = L.right ? L.sx + 14 + L.w : L.sx + 6; L.oy = 0; }
      items.sort((a, b) => a.sy - b.sy);
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const a = items[i], b = items[j];
            if (a.x0 >= b.x1 || b.x0 >= a.x1) continue;
            const dy = (b.sy + b.oy) - (a.sy + a.oy);
            if (Math.abs(dy) >= 15) continue;
            const push = (15 - Math.abs(dy)) / 2;
            if (dy >= 0) { a.oy -= push; b.oy += push; } else { a.oy += push; b.oy -= push; }
          }
        }
      }
      for (const L of leafItems) {
        L.dy += ((L.oy || 0) - L.dy) * 0.25;
        L.el.style.transform = 'translate(' + (L.sx + (L.right ? 14 : -14)).toFixed(1) + 'px,' + (L.sy + L.dy).toFixed(1) + 'px) translate(' + (L.right ? '0' : '-100%') + ',-50%)';
      }
      leafItems.length = 0;
    }

    /* Intro: the camera swings in the first time the map is seen */
    function startIntro() {
      if (introDone) return;
      introDone = true;
      const home = homeView();
      if (reducedMotion) { camera.position.copy(home.pos); return; }
      camera.position.copy(home.pos.clone().sub(HOME_TARGET).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.9).multiplyScalar(1.6).add(new THREE.Vector3(0, 26, 0)));
      flyTo(home.pos, home.target, 2800);
      floorRipple(0, 0, 1.5);
      if (selected >= 0) onSelect(true);   // a card was picked before the map loaded
    }

    new GLTFLoader().parse(buf, '', gltf => {
      try { setup(gltf); } catch (err) {
        console.warn('[Knowledge Map]', err);
        unsupported('The map could not load.');
        return;
      }
      applyTheme();
      camera.position.copy(homeView().pos);
      controls.update();
      ready = true;
      loadingEl.classList.add('done');
      onSelect(false);
      new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView) startIntro();
        kick();
      }, { threshold: 0.01 }).observe(stage);
      document.addEventListener('visibilitychange', kick);
    }, err => {
      console.warn('[Knowledge Map] model parse failed:', err);
      unsupported('The map could not load.');
    });
  }
})();
