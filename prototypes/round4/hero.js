// Hero: Peek, the build (load-in), the background runner, live readouts, prototype controls.
// The three backgrounds live in bg-a.js, bg-b.js, bg-c.js; each registers one draw(ctx, scene) on window.JT_BG.
(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // Peek backstage: one switch for the whole spec layer. Escape puts it away.
  const toggle = document.querySelector('[data-peek-toggle]');
  const setPeek = (on) => {
    toggle.setAttribute('aria-pressed', String(on));
    root.toggleAttribute('data-peek-on', on);
  };
  toggle.addEventListener('click', () => setPeek(toggle.getAttribute('aria-pressed') !== 'true'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.hasAttribute('data-peek-on')) setPeek(false); });

  // Live readouts: Peek prints the computed type scale and grid, so it can never drift from the CSS.
  const px = (n) => Math.round(parseFloat(n)) + 'px';
  const readouts = () => {
    const size = (sel) => getComputedStyle(document.querySelector(sel)).fontSize;
    const hs = getComputedStyle(hero);
    const vals = {
      display: px(size('.name')),
      lead: px(size('.tagline')),
      body: px(size('.bio')),
      label: px(size('.ident')),
      rhythm: px(getComputedStyle(document.querySelector('.tagline')).marginTop),
      'page-x': px(hs.paddingLeft),
      cols: `${hs.getPropertyValue('--cols').trim()} × gap ${px(hs.columnGap)}`,
    };
    $$('[data-readout]').forEach((el) => { el.textContent = vals[el.dataset.readout]; });
  };

  // Background runner ---------------------------------------------------------
  // One canvas, one loop. Paused offscreen and in hidden tabs; one still frame under reduced motion.
  const canvas = hero.querySelector('.field');
  const ctx = canvas.getContext('2d');
  const scene = { t: 0, w: 0, h: 0, p: null };
  let onscreen = true;
  let raf = 0;
  const t0 = performance.now();
  const aim = { x: 0, y: 0, on: 0 };

  // Read every number and color the canvases use from the custom properties at the top of styles.css.
  const cs = () => getComputedStyle(root);
  const env = {
    v: (n) => cs().getPropertyValue(n).trim(),
    num: (n) => parseFloat(env.v(n)),
    px: (n) => { const s = env.v(n); return parseFloat(s) * (s.endsWith('rem') ? parseFloat(cs().fontSize) : 1); },
  };

  // Where the monogram sits, in hero pixels: origin of its 575.65 × 502.31 box and units-to-px scale.
  // On a phone there is no figure, so the mark is placed where it would sit: off to the right, half out of frame.
  const layout = () => {
    const hr = hero.getBoundingClientRect();
    const mono = hero.querySelector('.mono');
    const mr = mono.getBoundingClientRect();
    scene.figure = mr.width > 0;
    if (mr.width) {
      const k = mr.width / 655.65;
      scene.mark = { x: mr.left - hr.left + 40 * k, y: mr.top - hr.top + 40 * k, k };
    } else {
      const k = (hr.width * 0.95) / 575.65;
      scene.mark = { x: hr.width * 0.45, y: hr.height * 0.42, k };
    }
    // The reading column: where the text ends, so the background can step back under it.
    const blocks = $$('.stack > *').map((el) => el.getBoundingClientRect().right - hr.left);
    scene.readX = mr.width ? Math.max(...blocks) : hr.width;
    scene.horizon = document.querySelector('.ident').getBoundingClientRect().top - hr.top;
    scene.gridX = parseFloat(getComputedStyle(hero).paddingLeft);
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    scene.w = hero.clientWidth;
    scene.h = hero.clientHeight;
    canvas.width = Math.round(scene.w * dpr);
    canvas.height = Math.round(scene.h * dpr);
    scene.dpr = dpr;
    layout();
    readouts();
    draw();
  };

  const draw = () => {
    const fn = (window.JT_BG || {})[root.dataset.bg];
    ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, scene.w, scene.h);
    if (!fn) return;
    // The pointer eases in and out, so bends grow and relax instead of popping.
    aim.on += ((scene.target ? 1 : 0) - aim.on) * 0.08;
    if (scene.target) { aim.x += (scene.target.x - aim.x) * 0.12; aim.y += (scene.target.y - aim.y) * 0.12; }
    scene.p = aim.on > 0.01 ? { x: aim.x, y: aim.y, a: aim.on } : null;
    fn(ctx, scene, env);
    // Step back under the text: full strength in the open area, --field-read under the reading column.
    const read = env.num('--field-read');
    const g = ctx.createLinearGradient(scene.readX - 40, 0, scene.readX + 160, 0);
    g.addColorStop(0, `rgba(0,0,0,${read})`);
    g.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, scene.w, scene.h);
  };

  const loop = (now) => {
    scene.t = (now - t0) / 1000;
    draw();
    raf = requestAnimationFrame(loop);
  };
  const run = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (reduce.matches) { scene.t = 0; draw(); return; }
    if (onscreen && !document.hidden) raf = requestAnimationFrame(loop);
  };

  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([e]) => { onscreen = e.isIntersecting; run(); }).observe(hero);
  document.addEventListener('visibilitychange', run);
  reduce.addEventListener('change', run);
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    if (!scene.target) { aim.x = e.clientX - r.left; aim.y = e.clientY - r.top; }
    scene.target = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  hero.addEventListener('pointerleave', () => { scene.target = null; });
  document.fonts.ready.then(resize);

  // The build ----------------------------------------------------------------
  // CSS owns every beat (styles.css, "The build"); this only measures where the guides land and keeps the clock.
  //   0.00 s  the monogram's lattice draws out from the mark
  //   0.25 s  its outline traces in lime
  //   0.35 s  hairline guides swing in at 60° and snap level onto each hero block
  //   0.50 s  blocks settle onto their guides, one every 80 ms (all visible by ~1.2 s)
  //   0.85 s  the mark's fill comes up to its resting impression
  //   1.20 s  the background fades in
  //   1.30 s  scaffolding fades out
  //   2.20 s  done: classes removed, the calm page is the end state
  const build = hero.querySelector('.build');
  const skipBtn = document.querySelector('[data-skip-intro]');
  const skipOn = ['keydown', 'pointerdown', 'wheel', 'touchmove', 'scroll'];
  let clock = 0;

  const guides = () => {
    const hr = hero.getBoundingClientRect();
    const name = document.querySelector('.name').getBoundingClientRect();
    const x = name.left - hr.left + parseFloat(getComputedStyle(document.querySelector('.name')).fontSize) * 0.035;
    const lands = [
      ['baseline', name.bottom - hr.top],
      ...$$('[data-build]', hero).map((el) => [el.dataset.guide, el.getBoundingClientRect().top - hr.top]),
    ];
    const lines = lands.map(([label, y], i) => {
      const g = document.createElement('i');
      g.className = 'guide';
      g.style.cssText = `--y:${y}px;--x:${x}px;--at:${0.35 + i * 0.07}s;--out:${1.3 + i * 0.04}s`;
      if (label) g.append(Object.assign(document.createElement('b'), { textContent: label }));
      return g;
    });
    const v = document.createElement('i');
    v.className = 'guide guide--v';
    v.style.cssText = `--x:${x}px;--at:0.3s;--out:1.4s`;
    build.replaceChildren(v, ...lines);
    $$('[data-build]', hero).forEach((el, i) => el.style.setProperty('--at', `${0.5 + i * 0.08}s`));
  };

  const finish = () => {
    clearTimeout(clock);
    skipOn.forEach((t) => removeEventListener(t, finish, true));
    try { sessionStorage.setItem('jt-intro', '1'); } catch {}
    // One frame without transitions, so nothing "un-draws" on the way back to the calm default.
    root.classList.add('settling');
    root.classList.remove('intro', 'intro-run');
    build.replaceChildren();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('settling')));
  };

  const start = () => {
    root.classList.add('intro');
    const go = () => {
      if (!root.classList.contains('intro')) return;
      guides();
      root.classList.add('intro-run');
      skipOn.forEach((t) => addEventListener(t, finish, { capture: true, passive: true }));
      clock = setTimeout(finish, 2200);
    };
    // Guides land on real edges, so wait for the real fonts (capped, so a slow font never holds the page).
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(go);
  };

  skipBtn.addEventListener('click', finish);
  if (root.classList.contains('intro')) start();

  // Prototype controls ---------------------------------------------------------
  const picks = $$('[data-bg-pick]');
  const pick = (id) => {
    root.dataset.bg = id;
    picks.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.bgPick === id)));
    const u = new URL(location.href);
    u.searchParams.set('bg', id);
    history.replaceState(null, '', u);
    draw();
  };
  picks.forEach((b) => b.addEventListener('click', () => pick(b.dataset.bgPick)));
  pick(root.dataset.bg);
  document.querySelector('[data-replay]').addEventListener('click', (e) => {
    e.stopPropagation();
    if (reduce.matches) return;
    finish();
    requestAnimationFrame(() => requestAnimationFrame(start));
  });
})();
