/* ═══════════════════════════════════════════════════════════════════
   ANIMATED CONTOUR BACKGROUND (WebGL Simplex Noise Isolines)
   Adapted from brewed-ops/portfolio-template (landonorris technique)
   Aspect-corrected, mouse-velocity ripples, dark/light theme aware
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const canvas = document.getElementById('contour-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power'
  });

  if (!gl) {
    /* If WebGL is unsupported, hide the canvas gracefully */
    canvas.style.display = 'none';
    return;
  }

  /* ─── Shaders ─── */
  const vertSource = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragSource = `
    precision highp float;
    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMousePace;
    uniform float uAspect;
    uniform float uDarkMix; // 1.0 = dark theme (#111310), 0.0 = light theme

    // Ashima Arts / Ian McEwan simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    const float SCALE             = 0.68;
    const float NOISE_DETAIL      = 3.2;
    const float DISTORT_SCALE     = 0.52;
    const float DISTORT_INTENSITY = 0.48;
    const float CURSOR_SCALE      = 1.4;
    const float CURSOR_INTENSITY  = 0.045;

    void main() {
      vec2 uv = vUv;
      uv.x *= uAspect;

      vec2 mouse = uMouse * 0.5 + 0.5;
      mouse.x *= uAspect;

      float cursor = clamp(1.0 - distance(mouse, uv) * CURSOR_SCALE, 0.0, 1.0) * uMousePace;

      float noiseDistort = 0.5 + snoise(vec3(uv * DISTORT_SCALE, uTime * 0.08)) * 0.5;
      vec2 warpedUv = (uv + cursor * CURSOR_INTENSITY + noiseDistort * DISTORT_INTENSITY) * SCALE;
      float n = snoise(vec3(warpedUv, uTime * 0.22));

      float bands = (n * 0.5 + 0.5) * NOISE_DETAIL;
      float contour = fract(bands);
      float dist = abs(contour - 0.5);

      // Line thickness with smooth antialiasing
      float line = 1.0 - smoothstep(0.0, 0.065, dist);

      // Technical colors matching Cyper Ivan's palette:
      // Dark mode: #111310 background with subtle #d5fb78 lime / field terrain isolines
      vec3 bgDark   = vec3(0.067, 0.075, 0.063); // #111310
      vec3 lineDark = vec3(0.835, 0.984, 0.471); // #d5fb78 lime
      float lineDarkAlpha = 0.11;

      // Light mode: clean off-white with muted technical slate lines
      vec3 bgLight   = vec3(0.965, 0.965, 0.953); // #f6f6f3
      vec3 lineLight = vec3(0.24, 0.32, 0.20);
      float lineLightAlpha = 0.08;

      vec3 bg = mix(bgLight, bgDark, uDarkMix);
      vec3 lineCol = mix(lineLight, lineDark, uDarkMix);
      float lineAlpha = mix(lineLightAlpha, lineDarkAlpha, uDarkMix) * line;

      // Final composite with transparency so existing page styling remains intact
      gl_FragColor = vec4(lineCol, lineAlpha);
    }
  `;

  function createShader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vShader = createShader(gl.VERTEX_SHADER, vertSource);
  const fShader = createShader(gl.FRAGMENT_SHADER, fragSource);
  if (!vShader || !fShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  // Quad geometry covering [-1, 1]
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posAttr = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posAttr);
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uTimeLoc = gl.getUniformLocation(program, 'uTime');
  const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
  const uMousePaceLoc = gl.getUniformLocation(program, 'uMousePace');
  const uAspectLoc = gl.getUniformLocation(program, 'uAspect');
  const uDarkMixLoc = gl.getUniformLocation(program, 'uDarkMix');

  // Runtime state
  let width = 0;
  let height = 0;
  let mouse = { x: 0.5, y: 0.5 };
  let targetMouse = { x: 0.5, y: 0.5 };
  let mouseVelocity = 0;
  let lastMouseTime = performance.now();
  let lastMousePos = { x: 0.5, y: 0.5 };
  let isPageVisible = true;
  let rafId = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uAspectLoc) {
      gl.uniform1f(uAspectLoc, width / Math.max(1, height));
    }
  }

  function getDarkMix() {
    const theme = document.documentElement.dataset.theme;
    if (theme === 'light') return 0.0;
    return 1.0;
  }

  function onPointerMove(e) {
    const x = e.clientX / Math.max(1, width);
    const y = 1.0 - e.clientY / Math.max(1, height);
    targetMouse.x = x;
    targetMouse.y = y;

    const now = performance.now();
    const dt = Math.max(1, now - lastMouseTime) / 1000;
    const dx = x - lastMousePos.x;
    const dy = y - lastMousePos.y;
    const speed = Math.hypot(dx, dy) / dt;

    mouseVelocity = Math.min(1.0, mouseVelocity * 0.8 + speed * 0.15);
    lastMouseTime = now;
    lastMousePos.x = x;
    lastMousePos.y = y;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible && !rafId) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(render);
    }
  });

  // Enable alpha blending for subtle background lines
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  resize();

  let startTime = performance.now();
  let lastTime = startTime;

  function render(now) {
    if (!isPageVisible) {
      rafId = null;
      return;
    }

    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // Smooth mouse interpolation & velocity decay
    mouse.x += (targetMouse.x - mouse.x) * Math.min(1, dt * 6);
    mouse.y += (targetMouse.y - mouse.y) * Math.min(1, dt * 6);
    mouseVelocity = Math.max(0, mouseVelocity - dt * 1.8);

    const elapsed = prefersReduced ? 0 : (now - startTime) * 0.001;

    gl.uniform1f(uTimeLoc, elapsed);
    gl.uniform2f(uMouseLoc, mouse.x * 2.0 - 1.0, mouse.y * 2.0 - 1.0);
    gl.uniform1f(uMousePaceLoc, mouseVelocity);
    gl.uniform1f(uDarkMixLoc, getDarkMix());

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);
})();
