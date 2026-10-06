/* ─── Photo hover: CRT pixel-decode reveal + cursor-follow preview ─── */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEPS = [28, 16, 9, 5, 3];

  /* Pixel-decode overlay: draws the image blocky, then resolves to sharp */
  function makeDecoder(host, img) {
    const cv = document.createElement('canvas');
    cv.className = 'ph-decode';
    cv.setAttribute('aria-hidden', 'true');
    img.after(cv);
    const ctx = cv.getContext('2d');
    const small = document.createElement('canvas');
    const sctx = small.getContext('2d');
    let timer = 0;

    function coverRect(W, H) {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(W / iw, H / ih);
      const dw = iw * s, dh = ih * s;
      const pos = getComputedStyle(img).objectPosition.split(' ').map(v => parseFloat(v) / 100);
      const px = isNaN(pos[0]) ? .5 : pos[0], py = isNaN(pos[1]) ? .5 : pos[1];
      return [(W - dw) * px, (H - dh) * py, dw, dh];
    }

    function frame(px) {
      const W = img.clientWidth, H = img.clientHeight;
      if (!W || !H) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const sw = Math.max(1, Math.ceil(W / px)), sh = Math.max(1, Math.ceil(H / px));
      small.width = sw; small.height = sh;
      const [x, y, w, h] = coverRect(sw, sh);
      sctx.drawImage(img, x, y, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(small, 0, 0, sw, sh, 0, 0, sw * px * dpr, sh * px * dpr);
      cv.style.transform = getComputedStyle(img).transform;
    }

    return function run() {
      if (reduced || !img.complete || !img.naturalWidth) return;
      clearTimeout(timer);
      host.classList.remove('ph-glitch');
      void host.offsetWidth;
      host.classList.add('ph-glitch');
      cv.classList.remove('is-out');
      cv.classList.add('is-on');
      let i = 0;
      const tick = () => {
        if (i < STEPS.length) { frame(STEPS[i++]); timer = setTimeout(tick, 55); }
        else { cv.classList.add('is-out'); cv.classList.remove('is-on'); }
      };
      tick();
    };
  }

  function addLayers(host) {
    host.classList.add('ph-host');
    const img = host.querySelector(':scope > img');
    const scan = document.createElement('span'); scan.className = 'ph-scan';
    const glare = document.createElement('span'); glare.className = 'ph-glare';
    scan.setAttribute('aria-hidden', 'true'); glare.setAttribute('aria-hidden', 'true');
    img.after(scan, glare);
    host.addEventListener('pointermove', e => {
      const r = host.getBoundingClientRect();
      host.style.setProperty('--ph-mx', `${e.clientX - r.left}px`);
      host.style.setProperty('--ph-my', `${e.clientY - r.top}px`);
    });
    return img;
  }

  /* 1. Big photos: portrait + project cards get the decode reveal */
  document.querySelectorAll('.portrait, .field-photo').forEach(host => {
    const img = addLayers(host);
    if (!img) return;
    const decode = makeDecoder(host, img);
    host.addEventListener('pointerenter', decode);
  });

  /* 2. Small thumbnails: certificate cards + avatar get a cursor-follow preview */
  const float = document.createElement('div');
  float.className = 'ph-float';
  float.setAttribute('aria-hidden', 'true');
  float.innerHTML = '<div class="ph-float-frame"><img alt=""><span class="ph-scan"></span></div><div class="ph-float-tag"><span></span><span></span></div>';
  document.body.append(float);
  const fFrame = float.firstElementChild;
  const fImg = fFrame.querySelector('img');
  const [tagA, tagB] = float.querySelectorAll('.ph-float-tag span');
  const fDecode = makeDecoder(fFrame, fImg);

  let tx = 0, ty = 0, x = 0, y = 0, vx = 0, active = false, raf = 0;
  const loop = () => {
    const nx = x + (tx - x) * .18, ny = y + (ty - y) * .18;
    vx = vx * .8 + (nx - x) * .2;
    x = nx; y = ny;
    const rot = Math.max(-8, Math.min(8, vx * .6));
    float.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rot}deg)`;
    if (active || Math.abs(tx - x) > .5) raf = requestAnimationFrame(loop); else raf = 0;
  };
  const place = e => {
    const w = float.offsetWidth, h = float.offsetHeight;
    const gap = 26;
    tx = e.clientX + gap + w > innerWidth ? e.clientX - gap - w : e.clientX + gap;
    ty = Math.min(innerHeight - h - 12, Math.max(12, e.clientY - h / 2));
  };

  document.querySelectorAll('.cert-card, .identity-avatar-btn').forEach(el => {
    const thumb = el.querySelector('img');
    if (!thumb) return;
    const round = el.classList.contains('identity-avatar-btn');
    el.addEventListener('pointerenter', e => {
      float.classList.toggle('is-round', round);
      fImg.src = el.dataset.image || thumb.src;
      const date = el.querySelector('small');
      tagA.textContent = round ? 'cyper1van.jpg' : ((el.dataset.title || '').split(' — ')[1] || el.dataset.category || '');
      tagB.textContent = round ? '' : (date ? date.textContent : '');
      last = e;
      place(e);
      if (!active) { x = tx; y = ty; }
      active = true;
      float.classList.add('is-visible');
      if (!raf) raf = requestAnimationFrame(loop);
      const go = () => fDecode();
      fImg.complete ? go() : fImg.addEventListener('load', go, { once: true });
    });
    el.addEventListener('pointermove', e => { last = e; place(e); });
    el.addEventListener('pointerleave', hide);
  });
  let last = null;
  function hide() { active = false; float.classList.remove('is-visible'); }
  addEventListener('scroll', () => {
    if (!active || !last) return;
    const under = document.elementFromPoint(last.clientX, last.clientY);
    if (!under || !under.closest('.cert-card, .identity-avatar-btn')) hide();
  }, { passive: true });
})();
