/* ═══════════════════════════════════════════════════════════════════
   CAREER CITY — 3D MAP OF THE JOURNEY
   Three.js (lazy-loaded) · Isometric ortho camera · Drag to rotate
   Each building is a career stop, linked by animated network cables.
   Renders only while on screen; theme-aware; reduced-motion friendly.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const root = document.getElementById('career-city');
  if (!root) return;

  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

  const stage = document.getElementById('cc-stage');
  const canvas = document.getElementById('cc-canvas');
  const labelsEl = document.getElementById('cc-labels');
  const loadingEl = document.getElementById('cc-loading');
  const hintEl = document.getElementById('cc-hint');
  const el = id => document.getElementById(id);
  const panel = { step: el('cc-step'), period: el('cc-period'), role: el('cc-role'), org: el('cc-org'), desc: el('cc-desc'), tags: el('cc-tags') };

  const STOPS = [
    { id: 'lpu', short: 'LPU Cavite', period: '2022 — 2026', role: 'B.S. Information Technology', org: 'Lyceum of the Philippines University — Cavite',
      desc: 'Where it started. Programming, databases, networking, and IT systems — the fundamentals behind everything after.',
      tags: ['Programming', 'Databases', 'Networking', 'IT systems'], x: -7.5, z: 4, ext: [3.6, 2.8] },
    { id: 'paramount', short: 'Paramount Life', period: 'JAN — MAY 2026', role: 'IT Support Intern', org: 'Paramount Life & General Insurance Corporation',
      desc: 'First deployment in a real office. Device troubleshooting and support for day-to-day connectivity.',
      tags: ['Device troubleshooting', 'Connectivity', 'End-user support'], x: -1.5, z: -4, ext: [1.9, 1.9] },
    { id: 'lenovo', short: 'Lenovo / IPVCYX', period: 'AUG 2026 — PRESENT', role: 'Field Service Engineer', org: 'Lenovo / IPVCYX',
      desc: 'Current base of operations. Hardware diagnostics, laptop repairs, FRU replacement, and B2B technical support.',
      tags: ['Hardware diagnostics', 'FRU replacement', 'B2B support'], x: 5, z: 2.5, ext: [3.4, 2.3], current: true },
    { id: 'triphil', short: 'Tri-Phil Site', period: 'FIELD DEPLOYMENT', role: 'Site Assessment', org: 'Tri-Phil International',
      desc: 'Out on the ground. Site assessment, equipment inspection, and coordination with the field team at the facility.',
      tags: ['Site survey', 'Equipment inspection', 'Field team'], x: 9.5, z: -4.5, ext: [3.6, 2.7] }
  ];

  /* Career route: L-shaped cable runs between consecutive stops (x, z) */
  const ROUTES = [
    [[-7.5, 4], [-7.5, 0.35], [-1.5, 0.35], [-1.5, -4]],
    [[-1.1, -4], [-1.1, -0.35], [4.6, -0.35], [4.6, 2.5]],
    [[5.4, 2.5], [5.4, -1.0], [9.5, -1.0], [9.5, -4.5]]
  ];

  const PALETTE = {
    dark: {
      ground: '#1b1f19', groundSide: '#121410', grid: '#2a2f26', road: '#0e100c', roadLine: '#3c4434',
      hero: '#d6dacd', heroRoof: '#a9ae9f', filler: '#353c31', fillerRoof: '#2b3127', tree: '#56763b', lawn: '#2c4524',
      edgeHero: '#59604f', edgeFiller: '#22271f', lime: '#d5fb78', glow: '#ffcf7a', glowI: 1.25,
      hemiSky: '#dfe6ff', hemiGround: '#1a1d16', hemiI: 1.25, sunI: 2.1, additive: true
    },
    light: {
      ground: '#e6e3db', groundSide: '#d2cec4', grid: '#d6d2c8', road: '#cbc7bc', roadLine: '#f7f6f2',
      hero: '#ffffff', heroRoof: '#e9e7e1', filler: '#d5d1c7', fillerRoof: '#c9c5bb', tree: '#88ae60', lawn: '#bad59b',
      edgeHero: '#a19d94', edgeFiller: '#bdb9af', lime: '#4a8a14', glow: '#ffcf7a', glowI: 0.12,
      hemiSky: '#ffffff', hemiGround: '#bdb8ad', hemiI: 1.7, sunI: 2.5, additive: false
    }
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected = STOPS.findIndex(s => s.current);
  let selectHandler = null;

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
  el('cc-prev').addEventListener('click', () => select(selected - 1, true));
  el('cc-next').addEventListener('click', () => select(selected + 1, true));
  renderPanel(selected, false);

  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (_) { return false; }
  }

  function unsupported() {
    root.classList.add('cc-unsupported');
  }

  if (!hasWebGL()) { unsupported(); return; }

  /* Lazy boot: only fetch Three.js when the section approaches */
  let booted = false;
  const bootObs = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting) && !booted) {
      booted = true;
      bootObs.disconnect();
      import(THREE_URL).then(boot).catch(err => {
        console.warn('[Career City] 3D unavailable:', err);
        unsupported();
      });
    }
  }, { rootMargin: '600px 0px' });
  bootObs.observe(root);

  /* ═══════════════════════════════════════════════════════════════
     SCENE
     ═══════════════════════════════════════════════════════════════ */
  function boot(THREE) {
    const isLight = () => document.documentElement.dataset.theme === 'light';
    let pal = PALETTE[isLight() ? 'light' : 'dark'];

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (err) {
      unsupported();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
    camera.position.set(22, 19, 22);
    camera.lookAt(0, 2.2, 0);

    const city = new THREE.Group();
    scene.add(city);

    /* ─── Lights ─── */
    const hemi = new THREE.HemisphereLight(pal.hemiSky, pal.hemiGround, pal.hemiI);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight('#ffffff', pal.sunI);
    sun.position.set(-10, 22, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 });
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    /* ─── Seeded random (layout stays the same every visit) ─── */
    let seed = 20260804;
    const rand = () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    /* ─── Procedural facade textures (map + glowing windows) ─── */
    function facadeTexture(kind) {
      const N = 8, S = 32;
      const make = () => { const c = document.createElement('canvas'); c.width = c.height = N * S; return c; };
      const mapC = make(), emiC = make();
      const m = mapC.getContext('2d'), e = emiC.getContext('2d');
      m.fillStyle = '#ffffff'; m.fillRect(0, 0, N * S, N * S);
      e.fillStyle = '#000000'; e.fillRect(0, 0, N * S, N * S);
      for (let y = 0; y < N; y++) {
        const lit = rand();
        for (let x = 0; x < N; x++) {
          const on = rand() < (kind === 'bands' ? 0.32 + lit * 0.3 : 0.38);
          m.fillStyle = '#7d8579';
          e.fillStyle = on ? '#ffffff' : '#000000';
          if (kind === 'bands') {
            m.fillRect(x * S, y * S + 9, S, 15);
            e.fillRect(x * S + 1, y * S + 10, S - 2, 13);
          } else {
            m.fillRect(x * S + 8, y * S + 7, 16, 18);
            e.fillRect(x * S + 9, y * S + 8, 14, 16);
          }
        }
      }
      const toTex = (c, srgb) => {
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = 4;
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };
      return { map: toTex(mapC, true), emissive: toTex(emiC, false) };
    }
    const FACADES = { grid: facadeTexture('grid'), bands: facadeTexture('bands'), sparse: facadeTexture('grid') };

    /* ─── Material registry (recolored on theme change) ─── */
    const themed = [];
    function mat(role, opts) {
      const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0.02 }, opts));
      themed.push({ m, role });
      return m;
    }
    const M = {
      ground: mat('ground'), groundSide: mat('groundSide'), road: mat('road'),
      hero: mat('hero'), heroRoof: mat('heroRoof'), filler: mat('filler'), fillerRoof: mat('fillerRoof'),
      lawn: mat('lawn'), tree: mat('tree', { flatShading: true }),
      lime: mat('lime', { emissiveIntensity: 0.7 }), dark: new THREE.MeshStandardMaterial({ color: '#20241d', roughness: 0.6 })
    };
    const edgeFillerMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.9 });
    const gridMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 });
    const roadLineMat = new THREE.MeshBasicMaterial();

    function facadeMat(kind, w, h) {
      const f = FACADES[kind];
      const map = f.map.clone(), emi = f.emissive.clone();
      const rx = Math.max(w / 0.5 / 8, 0.125), ry = Math.max(h / 0.55 / 8, 0.125);
      map.repeat.set(rx, ry); emi.repeat.set(rx, ry);
      map.needsUpdate = emi.needsUpdate = true;
      return mat('facade', { map, emissiveMap: emi, roughness: kind === 'bands' ? 0.35 : 0.8, metalness: kind === 'bands' ? 0.15 : 0.02 });
    }

    /* ─── Building blocks ─── */
    const pickables = [];

    function addEdges(mesh, material) {
      const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), material);
      mesh.add(lines);
    }

    function box(parent, w, h, d, x, y, z, o = {}) {
      const g = new THREE.BoxGeometry(w, h, d);
      let material;
      if (o.facade) {
        const sx = facadeMat(o.facade, d, h), sz = facadeMat(o.facade, w, h);
        const roof = o.filler ? M.fillerRoof : M.heroRoof;
        material = [sx, sx, roof, roof, sz, sz];
      } else {
        material = o.material || (o.filler ? M.filler : M.hero);
      }
      const mesh = new THREE.Mesh(g, material);
      mesh.position.set(x, y + h / 2, z);
      mesh.castShadow = o.castShadow !== false;
      mesh.receiveShadow = true;
      if (o.edges) addEdges(mesh, o.edges);
      parent.add(mesh);
      return mesh;
    }

    function cyl(parent, r, h, x, y, z, o = {}) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(o.rTop ?? r, r, h, o.seg || 16), o.material || M.hero);
      mesh.position.set(x, y + h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (o.edges) addEdges(mesh, o.edges);
      parent.add(mesh);
      return mesh;
    }

    /* ─── Ground board ─── */
    const BW = 30, BD = 21;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(BW, 0.7, BD), [M.groundSide, M.groundSide, M.ground, M.groundSide, M.groundSide, M.groundSide]);
    slab.position.y = -0.35;
    slab.receiveShadow = true;
    city.add(slab);

    const gridPts = [];
    for (let x = -BW / 2; x <= BW / 2; x += 1.5) gridPts.push(x, 0.004, -BD / 2, x, 0.004, BD / 2);
    for (let z = -BD / 2; z <= BD / 2 + 0.01; z += 1.5) gridPts.push(-BW / 2, 0.004, z, BW / 2, 0.004, z);
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
    city.add(new THREE.LineSegments(gridGeo, gridMat));

    /* Roads: main avenue (z = 0) and cross street (x = 1.6) */
    const ROAD_W = 1.5;
    function road(w, d, x, z) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), M.road);
      r.position.set(x, 0.02, z);
      r.receiveShadow = true;
      city.add(r);
    }
    road(BW, ROAD_W, 0, 0);
    road(ROAD_W, BD, 1.6, 0);
    for (let x = -BW / 2 + 0.6; x < BW / 2; x += 1.4) {
      if (Math.abs(x - 1.6) < 1) continue;
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.01, 0.07), roadLineMat);
      dash.position.set(x, 0.045, 0);
      city.add(dash);
    }
    for (let z = -BD / 2 + 0.6; z < BD / 2; z += 1.4) {
      if (Math.abs(z) < 1) continue;
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.01, 0.6), roadLineMat);
      dash.position.set(1.6, 0.045, z);
      city.add(dash);
    }

    /* ─── Hero buildings (one per career stop) ─── */
    const growers = [];
    let beacon = null;
    const BUILDERS = { lpu: BUILDERS_LPU, paramount: BUILDERS_PARAMOUNT, lenovo: BUILDERS_LENOVO, triphil: BUILDERS_TRIPHIL };
    const heroes = STOPS.map((s, i) => {
      const g = new THREE.Group();
      g.position.set(s.x, 0, s.z);
      g.userData.stop = i;
      const edge = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.85 });
      const top = BUILDERS[s.id](g, edge);
      g.traverse(o => { if (o.isMesh) { o.userData.stop = i; pickables.push(o); } });
      city.add(g);
      growers.push({ obj: g, delay: 0.25 + i * 0.18, hero: true });
      return { group: g, edge, top };
    });

    /* Each builder returns the label anchor height */
    function BUILDERS_LPU(g, edge) {
      box(g, 5.2, 2.2, 2.2, 0, 0, -1, { facade: 'grid', edges: edge });
      box(g, 1.7, 1.8, 3.4, -2.7, 0, 0.6, { facade: 'grid', edges: edge });
      box(g, 1.7, 1.8, 3.4, 2.7, 0, 0.6, { facade: 'grid', edges: edge });
      box(g, 1.1, 4.2, 1.1, 0, 0, 0.15, { facade: 'sparse', edges: edge });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1, 4), M.heroRoof);
      roof.position.set(0, 4.7, 0.15);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      addEdges(roof, edge);
      g.add(roof);
      const clock = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), M.lime);
      clock.position.set(0, 3.5, 0.71);
      g.add(clock);
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.05, 2.2), M.lawn);
      lawn.position.set(0, 0.03, 1.5);
      lawn.receiveShadow = true;
      g.add(lawn);
      return 5.6;
    }
    function BUILDERS_PARAMOUNT(g, edge) {
      box(g, 3.4, 1.2, 3.4, 0, 0, 0, { facade: 'grid', edges: edge });
      box(g, 2.4, 5, 2.4, 0, 1.2, 0, { facade: 'bands', edges: edge });
      box(g, 1.8, 0.8, 1.8, 0, 6.2, 0, { material: M.heroRoof, edges: edge });
      box(g, 2.44, 0.12, 2.44, 0, 3.8, 0, { material: M.lime, castShadow: false });
      cyl(g, 0.05, 1.2, 0, 7, 0, { material: M.heroRoof, seg: 6 });
      return 8.3;
    }
    function BUILDERS_LENOVO(g, edge) {
      box(g, 5, 2.4, 3.2, 0.5, 0, 0.4, { facade: 'grid', edges: edge });
      box(g, 2.1, 4.6, 2.2, -2.3, 0, -0.7, { facade: 'grid', edges: edge });
      box(g, 5.04, 0.28, 3.24, 0.5, 2.1, 0.4, { material: M.lime, castShadow: false });
      for (let k = 0; k < 3; k++) box(g, 1, 1.4, 0.06, -0.8 + k * 1.35, 0, 2.02, { material: M.dark, castShadow: false });
      box(g, 0.7, 0.4, 0.7, 1.3, 2.4, 0, { material: M.heroRoof, edges: edge });
      box(g, 0.7, 0.4, 0.7, 2.3, 2.4, 0, { material: M.heroRoof, edges: edge });
      cyl(g, 0.06, 2.1, -2.3, 4.6, -0.7, { material: M.heroRoof, seg: 6 });
      const dish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), M.heroRoof);
      dish.position.set(-1.7, 5.1, -0.2);
      dish.rotation.set(-0.9, 0.6, 0);
      dish.castShadow = true;
      g.add(dish);
      beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: '#d5fb78' }));
      beacon.position.set(-2.3, 6.8, -0.7);
      g.add(beacon);
      return 7.5;
    }
    function BUILDERS_TRIPHIL(g, edge) {
      box(g, 4.6, 2, 3.2, 0.4, 0, 0, { facade: 'sparse', edges: edge });
      const tooth = new THREE.Shape();
      tooth.moveTo(0, 0); tooth.lineTo(1.15, 0); tooth.lineTo(1.15, 0.75); tooth.closePath();
      const toothGeo = new THREE.ExtrudeGeometry(tooth, { depth: 3.2, bevelEnabled: false });
      for (let k = 0; k < 4; k++) {
        const t = new THREE.Mesh(toothGeo, M.heroRoof);
        t.position.set(-1.9 + k * 1.15, 2, -1.6);
        t.castShadow = true;
        addEdges(t, edge);
        g.add(t);
      }
      cyl(g, 0.32, 5, 2, 0, -2.1, { rTop: 0.26, edges: edge });
      cyl(g, 0.3, 0.3, 2, 4.4, -2.1, { rTop: 0.29, material: M.lime });
      cyl(g, 0.6, 1.6, -2.9, 0, -0.7, { edges: edge });
      cyl(g, 0.6, 1.6, -2.9, 0, 0.8, { edges: edge });
      return 5.8;
    }

    /* ─── Filler city blocks + trees ─── */
    const blocked = (x, z, pad) => {
      if (Math.abs(z) < ROAD_W / 2 + pad || Math.abs(x - 1.6) < ROAD_W / 2 + pad) return true;
      return STOPS.some(s => Math.abs(x - s.x) < s.ext[0] + pad && Math.abs(z - s.z) < s.ext[1] + pad);
    };
    const treeSpots = [];
    for (let x = -13.2; x <= 13.3; x += 2.2) {
      for (let z = -8.8; z <= 8.9; z += 2.2) {
        const jx = x + (rand() - 0.5) * 0.4, jz = z + (rand() - 0.5) * 0.4;
        if (blocked(jx, jz, 1.0)) continue;
        const r = rand();
        if (r < 0.28) { treeSpots.push([jx, jz]); continue; }
        if (r < 0.36) continue;
        const w = 1 + rand() * 0.7, d = 1 + rand() * 0.7, h = 0.6 + Math.pow(rand(), 1.7) * 2.6;
        const b = new THREE.Group();
        b.position.set(jx, 0, jz);
        box(b, w, h, d, 0, 0, 0, { filler: true, edges: edgeFillerMat });
        city.add(b);
        growers.push({ obj: b, delay: rand() * 0.5, hero: false });
      }
    }
    // Trees around the LPU lawn and along the avenue
    [[-9.8, 6.4], [-5.2, 6.4], [-9.8, 2.2], [-5.2, 2.2], [-11.5, 1.6], [-12.6, 3.2], [0.1, 1.5], [3.1, -1.5], [12.5, 1.6], [7.6, 6.2]]
      .forEach(p => { if (!blocked(p[0], p[1], 0.15) || Math.abs(p[1]) > 1) treeSpots.push(p); });
    const treeGeo = new THREE.ConeGeometry(0.42, 1.1, 6);
    treeGeo.translate(0, 0.75, 0);
    const trees = new THREE.InstancedMesh(treeGeo, M.tree, treeSpots.length);
    const tmp = new THREE.Object3D();
    treeSpots.forEach((p, i) => {
      const s = 0.75 + rand() * 0.5;
      tmp.position.set(p[0], 0, p[1]);
      tmp.scale.set(s, s, s);
      tmp.rotation.y = rand() * Math.PI;
      tmp.updateMatrix();
      trees.setMatrixAt(i, tmp.matrix);
    });
    trees.castShadow = true;
    city.add(trees);

    /* ─── Network cables + data packets along the career route ─── */
    const cableMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 });
    const glowTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d');
      const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const packetMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false });
    const packets = [];
    const routePaths = ROUTES.map((pts, ri) => {
      const path = new THREE.CurvePath();
      for (let k = 0; k < pts.length - 1; k++) {
        path.add(new THREE.LineCurve3(new THREE.Vector3(pts[k][0], 0.08, pts[k][1]), new THREE.Vector3(pts[k + 1][0], 0.08, pts[k + 1][1])));
      }
      const tube = new THREE.Mesh(new THREE.TubeGeometry(path, 160, 0.05, 6, false), cableMat);
      city.add(tube);
      for (let p = 0; p < 3; p++) {
        const sp = new THREE.Sprite(packetMat);
        sp.scale.set(0.7, 0.7, 0.7);
        city.add(sp);
        packets.push({ sprite: sp, path, offset: p / 3 + ri * 0.11 });
      }
      return path;
    });

    /* Selection ring + beacon glow */
    const ringMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 64), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    city.add(ring);
    const beaconGlow = new THREE.Sprite(packetMat);
    beaconGlow.scale.set(1.6, 1.6, 1.6);
    beacon.parent.add(beaconGlow);
    beaconGlow.position.copy(beacon.position);

    /* ─── Theme ─── */
    function applyTheme() {
      pal = PALETTE[isLight() ? 'light' : 'dark'];
      for (const { m, role } of themed) {
        if (role === 'facade') {
          m.color.set(pal.hero);
          m.emissive.set(pal.glow);
          m.emissiveIntensity = pal.glowI;
        } else if (role === 'lime') {
          m.color.set(pal.lime);
          m.emissive.set(pal.lime);
        } else {
          m.color.set(pal[role]);
        }
      }
      heroes.forEach(h => h.edge.color.set(pal.edgeHero));
      edgeFillerMat.color.set(pal.edgeFiller);
      gridMat.color.set(pal.grid);
      roadLineMat.color.set(pal.roadLine);
      cableMat.color.set(pal.lime);
      packetMat.color.set(pal.lime);
      packetMat.blending = pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
      packetMat.needsUpdate = true;
      ringMat.color.set(pal.lime);
      beacon.material.color.set(pal.lime);
      hemi.color.set(pal.hemiSky);
      hemi.groundColor.set(pal.hemiGround);
      hemi.intensity = pal.hemiI;
      sun.intensity = pal.sunI;
      highlight();
      requestRender();
    }

    function highlight() {
      heroes.forEach((h, i) => {
        h.edge.color.set(i === selected ? pal.lime : pal.edgeHero);
        h.edge.opacity = i === selected ? 1 : 0.85;
      });
      const s = STOPS[selected];
      ring.position.x = s.x;
      ring.position.z = s.z;
      ringBase = Math.max(s.ext[0], s.ext[1]) + 0.5;
    }
    let ringBase = 3;

    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    /* ─── Camera sizing ─── */
    let W = 1, H = 1;
    function resize() {
      const r = stage.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      const aspect = W / H;
      const needW = aspect < 1.2 ? 23 : 29, needH = 17.5;
      const viewH = Math.max(needH, needW / aspect);
      camera.left = -viewH * aspect / 2;
      camera.right = viewH * aspect / 2;
      camera.top = viewH / 2;
      camera.bottom = -viewH / 2;
      camera.updateProjectionMatrix();
      requestRender();
    }
    new ResizeObserver(resize).observe(stage);

    /* ─── Rotation: drag, inertia, idle auto-rotate, focus on select ─── */
    let yaw = 0.35, yawVel = 0, targetYaw = null, lastInteract = 0;
    const AUTO_SPEED = 0.05; // rad/s

    function focusYaw(i) {
      const s = STOPS[i];
      const want = Math.PI / 4 - Math.atan2(s.x, s.z);
      let diff = want - yaw;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      targetYaw = yaw + diff;
    }

    selectHandler = (i, fromUser) => {
      highlight();
      if (fromUser) { lastInteract = performance.now(); focusYaw(i); }
      requestRender();
    };

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function pick(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(pickables, false)[0];
      return hit ? hit.object.userData.stop : -1;
    }

    let down = null;
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.cc-label')) return;
      down = { x: e.clientX, y: e.clientY, lastX: e.clientX, t: performance.now(), drag: false, id: e.pointerId };
      yawVel = 0; targetYaw = null;
    });
    stage.addEventListener('pointermove', e => {
      if (down && e.pointerId === down.id) {
        const dx = e.clientX - down.lastX;
        if (!down.drag && Math.abs(e.clientX - down.x) > 5 && Math.abs(e.clientX - down.x) > Math.abs(e.clientY - down.y)) {
          down.drag = true;
          stage.classList.add('dragging');
          try { stage.setPointerCapture(e.pointerId); } catch (_) {}
          if (hintEl) hintEl.style.opacity = '0';
        }
        if (down.drag) {
          yaw += dx * 0.0085;
          yawVel = dx * 0.0085 * 60;
          lastInteract = performance.now();
          requestRender();
        }
        down.lastX = e.clientX;
      } else if (e.pointerType === 'mouse') {
        const i = pick(e.clientX, e.clientY);
        stage.classList.toggle('hovering', i >= 0);
        labels.forEach((b, j) => b.classList.toggle('hover', j === i));
      }
    });
    const end = e => {
      if (!down || e.pointerId !== down.id) return;
      if (!down.drag && e.type === 'pointerup') {
        const i = pick(e.clientX, e.clientY);
        if (i >= 0) select(i, true);
      }
      stage.classList.remove('dragging');
      down = null;
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('pointerleave', () => { stage.classList.remove('hovering'); labels.forEach(b => b.classList.remove('hover')); });

    /* ─── Labels follow their buildings ─── */
    const v = new THREE.Vector3();
    function placeLabels(showProgress) {
      heroes.forEach((h, i) => {
        v.set(0, h.top * h.group.scale.y + 0.4, 0);
        h.group.localToWorld(v);
        v.project(camera);
        const x = Math.min(W - 60, Math.max(60, (v.x * 0.5 + 0.5) * W));
        const y = Math.min(H - 10, Math.max(70, (-v.y * 0.5 + 0.5) * H));
        labels[i].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-100%)`;
        labels[i].classList.toggle('shown', showProgress > 0.85);
      });
    }

    /* ─── Loop (runs only while visible) ─── */
    const easeOutBack = t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    let introStart = null, introDone = reducedMotion;
    if (introDone) growers.forEach(g => g.obj.scale.y = 1);
    else growers.forEach(g => g.obj.scale.y = 0.001);

    let running = false, inView = false, last = 0, dirty = true;
    function requestRender() { dirty = true; if (!running && inView && !document.hidden) frame(performance.now()); }

    function frame(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const t = now / 1000;

      // Intro: buildings rise from the board
      let intro = 1;
      if (!introDone) {
        if (introStart === null) introStart = now;
        const elapsed = (now - introStart) / 1000;
        let allDone = true;
        for (const g of growers) {
          const p = Math.min(1, Math.max(0, (elapsed - g.delay) / (g.hero ? 0.9 : 0.7)));
          if (p < 1) allDone = false;
          g.obj.scale.y = Math.max(0.001, easeOutBack(p));
        }
        intro = Math.min(1, elapsed / 1.2);
        if (allDone) introDone = true;
      }

      // Rotation
      if (!down || !down.drag) {
        if (targetYaw !== null) {
          yaw += (targetYaw - yaw) * Math.min(1, dt * 4);
          if (Math.abs(targetYaw - yaw) < 0.001) targetYaw = null;
        } else if (Math.abs(yawVel) > 0.01) {
          yaw += yawVel * dt;
          yawVel *= Math.pow(0.04, dt);
        } else if (!reducedMotion && now - lastInteract > 5000) {
          yaw += AUTO_SPEED * dt;
        }
      }
      city.rotation.y = yaw;

      // Packets + beacon + ring pulse
      if (!reducedMotion) {
        for (const p of packets) {
          const u = (t * 0.09 + p.offset) % 1;
          p.path.getPointAt(u, p.sprite.position);
          p.sprite.position.y = 0.12;
        }
        const pulse = (Math.sin(t * 3) + 1) / 2;
        beaconGlow.material.opacity = 1;
        beacon.scale.setScalar(0.85 + pulse * 0.3);
        beaconGlow.scale.setScalar(1.1 + pulse * 1.1);
        const rp = (t * 0.6) % 1;
        ring.scale.setScalar(ringBase * (0.92 + rp * 0.2));
        ringMat.opacity = 0.9 * (1 - rp);
      } else {
        for (const p of packets) { p.path.getPointAt(p.offset % 1, p.sprite.position); p.sprite.position.y = 0.12; }
        ring.scale.setScalar(ringBase);
      }

      renderer.render(scene, camera);
      placeLabels(introDone ? 1 : intro);
      dirty = false;

      const animating = !reducedMotion || !introDone || targetYaw !== null || Math.abs(yawVel) > 0.01;
      if (inView && !document.hidden && animating) {
        running = true;
        requestAnimationFrame(frame);
      } else {
        running = false;
        last = 0;
      }
    }

    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView && !running) { last = 0; requestAnimationFrame(frame); }
    }, { threshold: 0.01 }).observe(stage);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && inView && !running) { last = 0; requestAnimationFrame(frame); }
    });

    applyTheme();
    resize();
    loadingEl.classList.add('done');
  }
})();
