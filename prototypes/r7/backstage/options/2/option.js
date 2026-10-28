// Option 2: Plotter. Paints the hero's existing <canvas class="field"> (unused by the construction figure).
// The grid is read from the hero's computed layout, so every line is a real gutter of the 4 / 12 column grid
// and every row one module (column + gutter) down. A plotter head walks it gutter to gutter, along the lines
// only, leaving a trail that fades. Off-screen or hidden: paused. Reduced motion: one static frame.
(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('canvas.field');
  const ctx = canvas?.getContext('2d');
  if (!hero || !ctx) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const tok = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const SPEED = 0.07; // px per ms: unhurried, like a pen plotter
  const PAUSE = 1400;
  const TRAIL = 7000; // ms for a stroke of trail to fade out

  let w = 0, h = 0, xs = [], ys = [], ink = {}, font = '';
  let head = { c: 0, r: 0 }, path = [], seg = 0, segAt = 0, trail = [], raf = 0, last = 0, on = true;

  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = getComputedStyle(hero);
    const cols = cs.gridTemplateColumns.split(' ').map(parseFloat);
    const gap = parseFloat(cs.columnGap), left = parseFloat(cs.paddingLeft), top = parseFloat(cs.paddingTop);
    const p = cols[0] + gap;
    xs = [left]; cols.forEach((c, i) => xs.push(left + i * p + c + (i < cols.length - 1 ? gap / 2 : 0)));
    ys = []; for (let y = top; y <= h - top + 1; y += p) ys.push(y);
    ink = { grid: tok('--spec-guide'), pen: tok('--figure-guide-ink'), head: tok('--figure-mark') };
    font = `${w < 768 ? 10 : 12}px ${tok('--spec-font-family')}`;
    head = { c: xs.length - 2, r: 0 }; path = []; trail = [];
  }

  // The next stop favours the figure's side of the sheet, away from the text block (bottom left).
  function plan(now) {
    const n = xs.length, m = ys.length;
    let c, r;
    do { c = Math.floor(Math.random() * n); r = Math.floor(Math.random() * m); }
    while ((c < n * 0.5 && r > m * 0.35) || (c === head.c && r === head.r));
    const turn = Math.random() < 0.5 ? { c, r: head.r } : { c: head.c, r };
    path = [head, turn, { c, r }].map((q) => ({ x: xs[q.c], y: ys[q.r], ...q }));
    seg = 0; segAt = now + PAUSE;
  }

  function cross(x, y, s) { ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); }

  function frame(now) {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;
    // The sheet: faint gutter lines, a cross where each meets a module row.
    ctx.strokeStyle = ink.grid; ctx.globalAlpha = 0.05; ctx.beginPath();
    xs.forEach((x) => { ctx.moveTo(x, 0); ctx.lineTo(x, h); });
    ys.forEach((y) => { ctx.moveTo(0, y); ctx.lineTo(w, y); });
    ctx.stroke();
    ctx.globalAlpha = 0.28; ctx.beginPath();
    xs.forEach((x) => ys.forEach((y) => cross(x, y, 5)));
    ctx.stroke();

    let pos = { x: xs[head.c], y: ys[head.r] };
    if (now != null) {
      if (!path.length) plan(now);
      const a = path[seg], b = path[seg + 1];
      if (now > segAt && b) {
        const len = Math.hypot(b.x - a.x, b.y - a.y), t = Math.min(1, (now - segAt) / (len / SPEED || 1));
        pos = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        trail.push({ x: pos.x, y: pos.y, at: now });
        if (t === 1) { seg++; segAt = now; if (seg === path.length - 1) { head = path[seg]; path = []; } }
      } else pos = a;
      // Trail: the pen's line, fading by age.
      trail = trail.filter((q) => now - q.at < TRAIL);
      ctx.strokeStyle = ink.pen;
      for (let i = 1; i < trail.length; i++) {
        const q = trail[i], o = trail[i - 1];
        if (q.at - o.at > 200) continue;
        ctx.globalAlpha = 0.55 * (1 - (now - q.at) / TRAIL);
        ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
    // The head: a registration target, and where it sits on the grid.
    ctx.globalAlpha = 0.9; ctx.strokeStyle = ink.head; ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2); cross(pos.x, pos.y, 10); ctx.stroke();
    const c = xs.indexOf(pos.x), r = ys.indexOf(pos.y);
    if (c >= 0 && r >= 0) {
      ctx.globalAlpha = 0.7; ctx.fillStyle = ink.pen; ctx.font = font;
      ctx.fillText(`g${String(c).padStart(2, '0')} · m${String(r).padStart(2, '0')}`, pos.x + 14, pos.y - 10);
    }
  }

  function tick(now) { raf = requestAnimationFrame(tick); if (now - last < 33) return; last = now; frame(now); }
  function run() {
    cancelAnimationFrame(raf); raf = 0;
    if (still.matches) frame(null);
    else if (on && !document.hidden) raf = requestAnimationFrame(tick);
  }

  let t = 0;
  new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { layout(); run(); if (still.matches) frame(null); }, 80); }).observe(canvas);
  new IntersectionObserver(([e]) => { on = !!e?.isIntersecting; run(); }).observe(canvas);
  document.addEventListener('visibilitychange', run);
  still.addEventListener('change', run);
  document.fonts.ready.then(() => { layout(); run(); });
})();
