/* ═══════════════════════════════════════════════════════════════════
   CAREER CITY — 3D MAP OF THE JOURNEY
   Night-time city model (career-city.glb) · Three.js + bloom, lazy-loaded
   Orbit · zoom once engaged · tap a landmark · neon pulse walks the route.
   Renders only while on screen; reduced-motion friendly.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const root = document.getElementById('career-city');
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
  const MODEL_URL = 'career-city.glb?v=1';

  const stage = document.getElementById('cc-stage');
  const canvas = document.getElementById('cc-canvas');
  const labelsEl = document.getElementById('cc-labels');
  const loadingEl = document.getElementById('cc-loading');
  const hintEl = document.getElementById('cc-hint');
  const el = id => document.getElementById(id);
  const routeEl = el('cc-route');
  const rotateEl = el('cc-rotate');
  const resetEl = el('cc-reset');
  const panel = { step: el('cc-step'), period: el('cc-period'), role: el('cc-role'), org: el('cc-org'), desc: el('cc-desc'), tags: el('cc-tags') };

  /* Order matches the landmark index (1–6) baked into the model */
  const STOPS = [
    { id: 'lpu', short: 'LPU Cavite', period: '2022 — 2026', role: 'B.S. Information Technology', org: 'Lyceum of the Philippines University — Cavite',
      desc: 'Where it started. Programming, databases, networking, and IT systems — the fundamentals behind everything after.',
      tags: ['Programming', 'Databases', 'Networking', 'IT systems'] },
    { id: 'paramount', short: 'Paramount Life', period: 'JAN — MAY 2026', role: 'IT Support Intern', org: 'Paramount Life & General Insurance Corporation',
      desc: 'First deployment in a real office. Device troubleshooting and support for day-to-day connectivity.',
      tags: ['Device troubleshooting', 'Connectivity', 'End-user support'] },
    { id: 'lenovo', short: 'Lenovo / IPVCYX', period: 'AUG 2026 — PRESENT', role: 'Field Service Engineer', org: 'Lenovo / IPVCYX',
      desc: 'Current base of operations. Hardware diagnostics, laptop repairs, FRU replacement, and B2B technical support.',
      tags: ['Hardware diagnostics', 'FRU replacement', 'B2B support'], current: true },
    { id: 'mec', short: 'MEC Building', period: 'FIELD DEPLOYMENT', role: 'Cabling & Electrical', org: 'MEC Building — with IPVCYX',
      desc: 'Structured cabling audits and equipment inspections. Electrical and network diagrams, cable quality checks, and documentation for client handover.',
      tags: ['Structured cabling', 'Quality inspection', 'Network diagrams'] },
    { id: 'triphil', short: 'Tri-Phil Site', period: 'FIELD DEPLOYMENT', role: 'Site Assessment', org: 'Tri-Phil International',
      desc: 'Out on the ground. Site assessment, equipment inspection, and coordination with the field team at the facility.',
      tags: ['Site survey', 'Equipment inspection', 'Field team'] },
    { id: 'biofuel', short: 'Cavite Biofuel', period: 'CCTV · PRE-BIDDING', role: 'CCTV Pre-bid Site Visit', org: 'Cavite Biofuel — Magallanes, Cavite',
      desc: 'Pre-bid site visit for a proposed CCTV system: walked the plant, warehouse, and tank farm to plan camera coverage, mounting points, and cable routes before the bid.',
      tags: ['CCTV', 'Pre-bidding', 'Site survey', 'Camera coverage'] }
  ];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected = STOPS.findIndex(s => s.current);
  let selectHandler = null;
  let resetHandler = null;
  let rotationHandler = null;
  let autoRotate = !reducedMotion;

  /* ─── Panel + labels work even before WebGL is ready ─── */
  function renderPanel(i, animate) {
    const s = STOPS[i];
    panel.step.textContent = `STOP ${String(i + 1).padStart(2, '0')} / ${String(STOPS.length).padStart(2, '0')}${s.current ? ' · CURRENT' : ''}`;
    panel.period.textContent = s.period;
    panel.role.textContent = s.role;
    panel.org.textContent = s.org;
    panel.desc.textContent = s.desc;
    panel.tags.replaceChildren(...s.tags.map(t => { const li = document.createElement('li'); li.textContent = t; return li; }));
    if (animate && !reducedMotion) {
      [panel.period, panel.role, panel.org, panel.desc, panel.tags].forEach(n => {
        n.classList.remove('cc-swap'); void n.offsetWidth; n.classList.add('cc-swap');
      });
    }
    labels.forEach((b, j) => {
      b.classList.toggle('active', j === i);
      b.setAttribute('aria-pressed', String(j === i));
    });
    routeButtons.forEach((b, j) => {
      b.classList.toggle('active', j === i);
      b.setAttribute('aria-pressed', String(j === i));
    });
    root.dataset.stop = s.id;
  }

  function select(i, fromUser) {
    selected = (i + STOPS.length) % STOPS.length;
    renderPanel(selected, true);
    if (selectHandler) selectHandler(selected, fromUser);
  }

  const labels = STOPS.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cc-label';
    b.innerHTML = `<b>${i + 1}</b><span class="cc-label-name"></span>`;
    b.querySelector('.cc-label-name').textContent = s.short;
    b.setAttribute('aria-label', `${s.short}: ${s.role}, ${s.period}`);
    b.addEventListener('click', () => select(i, true));
    labelsEl.appendChild(b);
    return b;
  });
  const routeButtons = STOPS.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cc-route-stop';
    b.innerHTML = `<span class="cc-route-dot">${String(i + 1).padStart(2, '0')}</span><span class="cc-route-copy"><strong></strong><small></small></span>`;
    b.querySelector('strong').textContent = s.short;
    b.querySelector('small').textContent = s.current ? 'Aug 2026 — Present' : s.period;
    b.setAttribute('aria-label', `Explore ${s.short}, ${s.period}`);
    b.addEventListener('click', () => select(i, true));
    routeEl.appendChild(b);
    return b;
  });
  function setRotation(enabled) {
    autoRotate = enabled && !reducedMotion;
    rotateEl.setAttribute('aria-pressed', String(autoRotate));
    rotateEl.textContent = autoRotate ? 'Pause rotation' : 'Auto-rotate';
    if (rotationHandler) rotationHandler();
  }
  rotateEl.addEventListener('click', () => setRotation(!autoRotate));
  resetEl.addEventListener('click', () => {
    select(STOPS.findIndex(s => s.current), false);
    if (resetHandler) resetHandler();
  });
  if (reducedMotion) { rotateEl.disabled = true; rotateEl.title = 'Rotation disabled by your reduced-motion preference'; }
  el('cc-prev').addEventListener('click', () => select(selected - 1, true));
  el('cc-next').addEventListener('click', () => select(selected + 1, true));
  setRotation(autoRotate);
  renderPanel(selected, false);

  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (_) { return false; }
  }

  function unsupported() {
    root.classList.add('cc-unsupported');
    rotateEl.disabled = resetEl.disabled = true;
  }

  if (!hasWebGL()) { unsupported(); return; }

  /* Lazy boot: only fetch Three.js + the model when the section approaches */
  let booted = false;
  const bootObs = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && !booted) {
      booted = true;
      bootObs.disconnect();
      const model = fetch(MODEL_URL).then(r => {
        if (!r.ok) throw new Error('model ' + r.status);
        return r.arrayBuffer();
      });
      Promise.all([Promise.all(MODULES.map(u => import(u))), model])
        .then(([mods, buf]) => boot(mods, buf))
        .catch(err => {
          console.warn('[Career City] 3D unavailable:', err);
          unsupported();
        });
    }
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

    const NEON = 0xc6ff3d;
    const HOME_TARGET = new THREE.Vector3(0, 4.5, 0);
    const RING_R = [7.6, 5.9, 5.3, 5.6, 7.0, 6.4];
    const GLOW_SCALE = { neon: 0.38, neon_soft: 0.7, lamp: 0.45, head: 0.5, tail: 0.5, beacon: 0.55, flare: 0.5, win_lit: 0.8, water: 0.8 };
    /* Night city in dark mode, daytime city in light mode */
    const THEMES = {
      dark: { bg: 0x07090b, aces: true, exposure: 0.95, sky: 0xa3b6d9, ground: 0x121417, hemi: 0.5, sun: 0xcad8ff, sunI: 1.6, warmI: 0.35,
        bloom: 0.55, threshold: 0.92, accent: NEON, accentBoost: 2.2, glow: {} },
      light: { bg: 0xefede7, aces: false, exposure: 1, sky: 0xffffff, ground: 0xb9b4a8, hemi: 1.15, sun: 0xfff3dc, sunI: 1.9, warmI: 0.45,
        bloom: 0.16, threshold: 1, accent: 0x4f9a10, accentBoost: 1,
        glow: { win_lit: 0.08, win_dim: 0.1, lamp: 0.08, head: 0.3, tail: 0.4, neon: 0.55, neon_soft: 0.45, beacon: 0.6, flare: 0.7, water: 0.35 } }
    };
    const isLight = () => document.documentElement.dataset.theme === 'light';

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
      unsupported();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color();
    scene.fog = new THREE.Fog(0x000000, 120, 320);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 800);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 14;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.enablePan = false;
    controls.enableZoom = false;          // zoom only once the map is engaged, so page scroll is never hijacked
    controls.autoRotateSpeed = 0.55;
    controls.autoRotate = autoRotate;
    controls.target.copy(HOME_TARGET);
    canvas.style.touchAction = 'pan-y';   // vertical swipes still scroll the page on phones

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const hemi = new THREE.HemisphereLight(0xa3b6d9, 0x121417, 0.5);
    scene.add(hemi);
    const moon = new THREE.DirectionalLight(0xcad8ff, 1.6);
    moon.position.set(-32, 52, 22);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    Object.assign(moon.shadow.camera, { left: -36, right: 36, top: 36, bottom: -36, near: 10, far: 150 });
    moon.shadow.bias = -0.0004;
    moon.shadow.normalBias = 0.03;
    moon.shadow.camera.updateProjectionMatrix();
    scene.add(moon);
    const warm = new THREE.DirectionalLight(0xffc98a, 0.35);
    warm.position.set(30, 18, -26);
    scene.add(warm);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.38, 0.92);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ─── Camera framing + tweens ─── */
    let W = 1, H = 1;
    function homeView() {
      const vf = THREE.MathUtils.degToRad(camera.fov);
      const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
      const dist = Math.max(22 / Math.tan(vf / 2), 27 / Math.tan(hf / 2));
      const dir = new THREE.Vector3(-1, 0.86, 1).normalize();
      return { pos: dir.multiplyScalar(dist).add(HOME_TARGET), target: HOME_TARGET.clone() };
    }
    let tween = null;
    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function flyTo(pos, target, dur = 1200) {
      if (reducedMotion) dur = 1;
      tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, start: performance.now(), dur };
    }
    controls.addEventListener('start', () => {
      tween = null;
      if (autoRotate) setRotation(false);
      if (hintEl) hintEl.style.opacity = '0';
    });

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

    /* ─── Effects: selection ring, tap shockwaves, route pulse ─── */
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(NEON), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
    const selRing = new THREE.Mesh(new THREE.RingGeometry(0.965, 1, 128), ringMat);
    selRing.rotation.x = -Math.PI / 2;
    scene.add(selRing);
    let ringScale = 1;

    const ripples = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 64),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(NEON).multiplyScalar(1.4), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
      m.rotation.x = -Math.PI / 2;
      m.visible = false;
      scene.add(m);
      ripples.push({ mesh: m, t: 1, max: 1 });
    }
    function spawnRipple(point, size) {
      const r = ripples.find(p => p.t >= 1) || ripples[0];
      r.mesh.position.set(point.x, point.y + 0.06, point.z);
      r.t = 0; r.max = size; r.mesh.visible = true;
    }

    const trail = [];
    for (let i = 0; i < 16; i++) {
      const k = 1 - i / 16;
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(i === 0 ? 0xf2ffd0 : NEON).multiplyScalar(i === 0 ? 3.2 : 2.2), transparent: true, opacity: k, toneMapped: false, depthWrite: false });
      const m = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.24 : 0.17 * k + 0.04, 14, 10), mat);
      m.position.y = -99;
      m.userData.head = i === 0;
      scene.add(m);
      trail.push(m);
    }
    let route = [], routeLen = [0], routeTotal = 0;
    function routePoint(s, out) {
      if (!routeTotal) return out.set(0, -99, 0);
      s = ((s % routeTotal) + routeTotal) % routeTotal;
      let i = 1;
      while (i < routeLen.length && routeLen[i] < s) i++;
      const a = route[i - 1], b = route[i];
      const seg = routeLen[i] - routeLen[i - 1] || 1;
      return out.copy(a).lerp(b, (s - routeLen[i - 1]) / seg);
    }

    /* ─── Model ─── */
    const landmarks = [];   // by stop index: { obj, baseY, lift, anchor }
    const cars = [];
    const pins = [];
    const neonMats = [];
    const glowMats = [];    // { m, night } — emissive strength tuned per theme
    let city = null, hovered = -1;

    function applyTheme() {
      const th = THEMES[isLight() ? 'light' : 'dark'];
      scene.background.set(th.bg);
      scene.fog.color.set(th.bg);
      renderer.toneMapping = th.aces ? THREE.ACESFilmicToneMapping : THREE.LinearToneMapping;
      renderer.toneMappingExposure = th.exposure;
      hemi.color.set(th.sky);
      hemi.groundColor.set(th.ground);
      hemi.intensity = th.hemi;
      moon.color.set(th.sun);
      moon.intensity = th.sunI;
      warm.intensity = th.warmI;
      bloom.strength = th.bloom;
      bloom.threshold = th.threshold;
      const accent = new THREE.Color(th.accent);
      ringMat.color.copy(accent);
      ripples.forEach(r => r.mesh.material.color.copy(accent).multiplyScalar(th.accentBoost * 0.64));
      trail.forEach(m => {
        if (m.userData.head && th.accentBoost > 1) m.material.color.set(0xf2ffd0).multiplyScalar(3.2);
        else m.material.color.copy(accent).multiplyScalar(th.accentBoost);
      });
      for (const g of glowMats) g.m.emissiveIntensity = g.night * (th.glow[g.m.name] ?? 1);
      for (const n of neonMats) n.base = n.m.emissiveIntensity;
    }
    new MutationObserver(() => { applyTheme(); kick(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    applyTheme();

    new GLTFLoader().parse(buf, '', gltf => {
      const model = gltf.scene;
      scene.add(model);
      city = model.getObjectByName('CareerCity') || model;
      const info = city.userData || {};
      const seen = new Set();
      model.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          const m = o.material;
          if (!seen.has(m)) {
            seen.add(m);
            m.envMapIntensity = m.metalness > 0.3 ? 0.2 : 0.12;
            if (GLOW_SCALE[m.name]) m.emissiveIntensity *= GLOW_SCALE[m.name];
            if (m.emissive && m.emissiveIntensity > 0) glowMats.push({ m, night: m.emissiveIntensity });
            if (m.name === 'neon' || m.name === 'neon_soft') neonMats.push({ m, base: m.emissiveIntensity });
          }
        }
        if (/^Car_\d/.test(o.name)) {
          let d = o.userData.drive;
          if (typeof d === 'string') { try { d = JSON.parse(d); } catch (_) { d = null; } }
          if (d) cars.push({ obj: o, d, speed: Number(o.userData.speed) || 2.8 });
        }
        if (/^Pin_\d/.test(o.name)) pins.push({ obj: o, y: o.position.y, phase: pins.length * 1.1 });
      });
      for (const L of info.landmarks || []) {
        const obj = model.getObjectByName(L.node);
        if (!obj || !STOPS[L.index - 1]) continue;
        landmarks[L.index - 1] = { obj, baseY: obj.position.y, lift: 0, anchor: new THREE.Vector3().fromArray(L.anchor) };
      }
      route = (info.route || []).map(p => new THREE.Vector3().fromArray(p).add(new THREE.Vector3(0, 0.14, 0)));
      for (let i = 1; i < route.length; i++) routeLen.push(routeLen[i - 1] + route[i].distanceTo(route[i - 1]));
      routeTotal = routeLen[routeLen.length - 1] || 0;
      applyTheme();

      camera.position.copy(homeView().pos);
      controls.update();
      loadingEl.classList.add('done');
      if (inView) startIntro();
      kick();
    }, err => {
      console.warn('[Career City] model failed:', err);
      unsupported();
    });

    /* ─── Selection ─── */
    function focusStop(i) {
      const L = landmarks[i];
      if (!L) return;
      const target = new THREE.Vector3(L.anchor.x, Math.max(2, L.anchor.y * 0.42), L.anchor.z);
      const dir = camera.position.clone().sub(controls.target).normalize();
      dir.y = Math.max(dir.y, 0.45);
      dir.normalize();
      const dist = THREE.MathUtils.clamp(L.anchor.y * 2.1 + 18, 32, 64) * (W < 600 ? 1.35 : 1);
      flyTo(target.clone().add(dir.multiplyScalar(dist)), target);
      spawnRipple(new THREE.Vector3(L.obj.position.x, L.baseY, L.obj.position.z), RING_R[i] * 1.6);
    }
    selectHandler = (i, fromUser) => {
      if (fromUser) { setRotation(false); focusStop(i); }
      kick();
    };
    rotationHandler = () => { controls.autoRotate = autoRotate; kick(); };
    resetHandler = () => {
      const h = homeView();
      flyTo(h.pos, h.target);
      kick();
    };

    /* ─── Picking ─── */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function stopOf(o) {
      while (o && o.userData.landmark === undefined) o = o.parent;
      return o ? o.userData.landmark - 1 : -1;
    }
    function pick(clientX, clientY, all) {
      if (!city) return null;
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const targets = all ? [city] : landmarks.filter(Boolean).map(l => l.obj).concat(pins.map(p => p.obj));
      const hit = raycaster.intersectObjects(targets, true).find(h => h.object.isMesh && h.object.visible);
      return hit ? { point: hit.point, stop: stopOf(hit.object) } : null;
    }
    function setHover(i) {
      if (i === hovered) return;
      hovered = i;
      stage.classList.toggle('hovering', i >= 0);
      labels.forEach((b, j) => b.classList.toggle('hover', j === i));
    }

    let down = null, moveQueued = null;
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
      const hit = pick(e.clientX, e.clientY, true);
      if (!hit) return;
      if (hit.stop >= 0) select(hit.stop, true);
      else spawnRipple(hit.point, 1.6);
      kick();
    });
    canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') moveQueued = { x: e.clientX, y: e.clientY }; });
    stage.addEventListener('pointerleave', () => {
      moveQueued = null;
      setHover(-1);
      controls.enableZoom = false;
      stage.classList.remove('engaged');
    });

    /* ─── Labels follow their landmarks ─── */
    const proj = new THREE.Vector3();
    function placeLabels(show) {
      const visible = [], points = [];
      labels.forEach((b, i) => {
        const L = landmarks[i];
        let onScreen = false;
        if (L) {
          proj.copy(L.anchor);
          proj.y += L.lift;
          proj.project(camera);
          onScreen = proj.z < 1 && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05;
        }
        b.classList.toggle('shown', show && onScreen);
        if (!onScreen) return;
        visible.push(i);
        points.push({ x: (proj.x * 0.5 + 0.5) * W, y: (-proj.y * 0.5 + 0.5) * H - 10, width: b.offsetWidth, height: b.offsetHeight, priority: i === selected });
      });
      window.CareerCityLayout(points, W, H).forEach(({ x, y }, k) => {
        labels[visible[k]].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-100%)`;
      });
    }

    /* ─── Intro: the camera drops in the first time the city is seen ─── */
    let introStarted = false, labelsOn = false;
    function startIntro() {
      if (introStarted) return;
      introStarted = true;
      if (reducedMotion) { labelsOn = true; return; }
      const home = homeView();
      camera.position.copy(home.pos.clone().sub(HOME_TARGET).multiplyScalar(1.7).add(new THREE.Vector3(0, 30, 0)));
      flyTo(home.pos, home.target, 2600);
      setTimeout(() => { labelsOn = true; }, 1400);
    }

    /* ─── Loop (runs only while visible) ─── */
    const clock = new THREE.Clock(false);
    const motion = reducedMotion ? 0 : 1;
    let running = false, inView = false, routeS = 0;
    function kick() {
      if (!running && inView && !document.hidden) { running = true; clock.start(); requestAnimationFrame(frame); }
    }

    function frame() {
      if (!inView || document.hidden) { running = false; clock.stop(); return; }
      requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (tween) {
        const k = Math.min(1, (performance.now() - tween.start) / tween.dur);
        const e = ease(k);
        camera.position.lerpVectors(tween.p0, tween.p1, e);
        controls.target.lerpVectors(tween.t0, tween.t1, e);
        if (k >= 1) tween = null;
      }
      controls.update();

      if (moveQueued) {
        const hit = pick(moveQueued.x, moveQueued.y, false);
        moveQueued = null;
        setHover(hit ? hit.stop : -1);
      }

      // landmarks lift on hover / select
      landmarks.forEach((l, i) => {
        if (!l) return;
        const want = (i === hovered ? 0.45 : 0) + (i === selected ? 0.25 : 0);
        l.lift += (want - l.lift) * Math.min(1, dt * 8);
        l.obj.position.y = l.baseY + l.lift;
      });
      // selection ring follows the hovered or selected stop
      const fi = hovered >= 0 ? hovered : selected;
      const fl = landmarks[fi];
      ringMat.opacity += ((fl ? 0.85 : 0) - ringMat.opacity) * Math.min(1, dt * 6);
      if (fl) {
        selRing.position.set(fl.obj.position.x, fl.baseY + 0.07, fl.obj.position.z);
        const want = RING_R[fi] * (1 + 0.03 * Math.sin(t * 3) * motion);
        ringScale += (want - ringScale) * Math.min(1, dt * 7);
        selRing.scale.setScalar(ringScale);
      }
      for (const r of ripples) {
        if (r.t >= 1) { r.mesh.visible = false; continue; }
        r.t = Math.min(1, r.t + dt / 0.9);
        const e = 1 - Math.pow(1 - r.t, 3);
        r.mesh.scale.setScalar(0.3 + e * r.max);
        r.mesh.material.opacity = 0.85 * (1 - r.t);
      }
      for (const n of neonMats) n.m.emissiveIntensity = n.base * (0.88 + 0.12 * Math.sin(t * 2.2) * motion + 0.12 * (1 - motion));
      for (const p of pins) {
        p.obj.position.y = p.y + Math.sin(t * 1.8 + p.phase) * 0.22 * motion;
        p.obj.rotation.y += dt * 1.2 * motion;
      }
      if (motion) for (const c of cars) {
        const ax = c.d.axis;
        c.obj.position[ax] += c.d.dir * c.speed * dt;
        if (c.obj.position[ax] > c.d.max) c.obj.position[ax] = c.d.min;
        if (c.obj.position[ax] < c.d.min) c.obj.position[ax] = c.d.max;
      }
      routeS += dt * 7 * motion;
      trail.forEach((m, i) => routePoint(routeS - i * 0.42, m.position));

      composer.render();
      placeLabels(labelsOn && !!city);
    }

    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView && city) startIntro();
      kick();
    }, { threshold: 0.01 }).observe(stage);
    document.addEventListener('visibilitychange', kick);
  }
})();
