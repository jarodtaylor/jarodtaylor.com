// The field behind the hero: the monogram's own lattice at page scale.
// The JT mark is cut from a downward equilateral triangle divided 14 times along each side;
// every stroke runs at 0°, 60° or 120° (41.1 across for every 71.2 down). Here that lattice
// fills the first viewport, the mark is drawn by the lattice inside it, and a slow ring
// of light leaves the mark every few seconds. Paused offscreen; one still frame under
// reduced motion.
(() => {
  const canvas = document.querySelector('.field');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;

  const MARK = [
    'M286.22 164.31h.08l-41.1-71.17H78.25l-27.43.18 41 70.99 112.27-.08 97.9 169.64-15.14 26.21-76.5-132.55-41.06 71.09 117.56 203.69 97.26-168.44z',
    'm230.41 73.72 26.52.12 138.66 240.14 41.05-71.11-97.57-169.02 195.02.25L575.65 0H0l40.31 73.45z',
  ];
  const SIDE = 575.65, DIV = 14, PERIOD = 9000, STEP = 0.02, FRAME = 33;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const css = getComputedStyle(document.documentElement);
  const colors = [css.getPropertyValue('--field-line').trim(), css.getPropertyValue('--field-mark').trim()];

  let edges, mark, cx, cy, reach, w, h, raf = 0, last = 0, visible = true;

  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);

    // Place the mark: large and bleeding off the right edge on wide screens, behind the top on phones.
    const phone = w < 720;
    const W = phone ? w * 1.2 : Math.min(w * 0.6, h * 1.25);
    const x0 = phone ? w - W * 0.88 : w - W * 0.9;
    const y0 = phone ? h * 0.2 : h * 0.06;
    const s = W / DIV, r = s * Math.sqrt(3) / 2;
    cx = x0 + W / 2; cy = y0 + W * 0.36;
    reach = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + s * 3;

    mark = new Path2D();
    const m = new DOMMatrix([W / SIDE, 0, 0, W / SIDE, x0, y0]);
    MARK.forEach((d) => mark.addPath(new Path2D(d), m));

    // Lattice vertices: row k at y0 + k·r, column j at x0 + (j + k/2)·s.
    // From each vertex: one edge right, one down-right, one down-left.
    const list = [];
    const k0 = Math.floor(-y0 / r) - 1, k1 = Math.ceil((h - y0) / r);
    for (let k = k0; k <= k1; k++) {
      const y = y0 + k * r, off = x0 + (k / 2) * s;
      const j0 = Math.floor(-off / s) - 1, j1 = Math.ceil((w - off) / s) + 1;
      for (let j = j0; j <= j1; j++) {
        const x = off + j * s;
        for (const [dx, dy] of [[s, 0], [s / 2, r], [-s / 2, r]]) {
          list.push(x, y, x + dx, y + dy, Math.hypot(x + dx / 2 - cx, y + dy / 2 - cy));
        }
      }
    }
    edges = new Float32Array(list);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1;
  }

  // Stroke every edge, grouped by quantised alpha so a frame is a dozen strokes, not thousands.
  function pass(color, base, gain, glowAt) {
    const groups = new Map();
    for (let e = 0; e < edges.length; e += 5) {
      const level = Math.round((base + glowAt(edges[e + 4]) * gain) / STEP);
      (groups.get(level) || groups.set(level, []).get(level)).push(e);
    }
    ctx.strokeStyle = color;
    groups.forEach((list, level) => {
      ctx.globalAlpha = level * STEP;
      ctx.beginPath();
      for (const e of list) { ctx.moveTo(edges[e], edges[e + 1]); ctx.lineTo(edges[e + 2], edges[e + 3]); }
      ctx.stroke();
    });
  }

  function draw(t) {
    // Ring radius grows over one period and fades as it travels; still frames have no ring.
    const p = t == null ? -1 : (t % PERIOD) / PERIOD;
    const ring = p * reach, band = reach * 0.06, fade = 1 - p;
    const glowAt = (d) => (p < 0 ? 0 : Math.exp(-(((d - ring) / band) ** 2)) * fade);
    ctx.clearRect(0, 0, w, h);
    pass(colors[0], 0.05, 0.2, glowAt);
    // Inside the mark the same lattice switches to the accent, so the monogram is made of its own grid.
    ctx.save();
    ctx.clip(mark);
    ctx.clearRect(0, 0, w, h);
    pass(colors[1], 0.22, 0.45, glowAt);
    ctx.restore();
    ctx.strokeStyle = colors[1];
    ctx.globalAlpha = 0.3;
    ctx.stroke(mark);
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (now - last < FRAME) return;
    last = now;
    draw(now);
  }

  function update() {
    cancelAnimationFrame(raf); raf = 0;
    if (still.matches) draw(null);
    else if (visible && !document.hidden) raf = requestAnimationFrame(tick);
  }

  let pending;
  new ResizeObserver(() => {
    clearTimeout(pending);
    pending = setTimeout(() => { layout(); still.matches ? draw(null) : draw(last); }, 80);
  }).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(canvas);
  document.addEventListener('visibilitychange', update);
  still.addEventListener('change', update);

  layout();
  update();
})();
