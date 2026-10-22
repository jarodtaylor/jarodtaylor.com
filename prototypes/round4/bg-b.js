// Background B, construction drift: the monogram's own edges, extended into lines across the hero.
// Every edge of the two JT paths lies on one of three directions (0°, 60°, 120°). Each edge becomes an endless
// construction line, repeated every triangle height. The field slides sideways one mark-width per --field-drift × 7
// seconds: the level lines hold (they are the mark's bands), the diagonals pass through and come back into register.
// Every --field-trace-every seconds a run of the mark's real outline traces in lime, and the construction line
// through its leading edge lights up for a moment.
(() => {
  // Vertices of the two paths in src/assets/jt-logo-icon.svg (absolute, viewBox units).
  const polys = [
    [286.3, 164.31, 245.2, 93.14, 78.25, 93.14, 50.82, 93.32, 91.82, 164.31, 204.09, 164.23, 301.99, 333.87,
      286.85, 360.08, 210.35, 227.53, 169.29, 298.62, 286.85, 502.31, 384.11, 333.87],
    [230.41, 73.72, 256.93, 73.84, 395.59, 313.98, 436.64, 242.87, 339.07, 73.85, 534.09, 74.1, 575.65, 0, 0, 0,
      40.31, 73.45],
  ].map((v) => v.reduce((pts, n, i) => (i % 2 ? pts[pts.length - 1].push(n) : pts.push([n]), pts), []));

  const T = (575.65 * Math.sqrt(3)) / 2; // the outer triangle's height: one repeat of the pattern
  const families = [0, 1, 2].map((i) => {
    const a = (i * Math.PI) / 3;
    return { d: [Math.cos(a), Math.sin(a)], n: [-Math.sin(a), Math.cos(a)], offs: [] };
  });
  const edges = [];
  for (const pts of polys) {
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 2) return;
      const ang = ((Math.atan2(b[1] - a[1], b[0] - a[0]) % Math.PI) + Math.PI) % Math.PI;
      const f = families[Math.round(ang / (Math.PI / 3)) % 3];
      const off = (((f.n[0] * a[0] + f.n[1] * a[1]) % T) + T) % T;
      if (!f.offs.some((o) => Math.abs(o - off) < 3)) f.offs.push(off);
      edges.push({ a, b, len, f, off: f.n[0] * a[0] + f.n[1] * a[1] });
    });
  }

  // Draw one infinite line {n · p = off} (mark units) across the canvas.
  const lineAt = (ctx, s, f, off) => {
    const { mark: m, w, h } = s;
    const big = (w + h) / m.k;
    const cx = f.n[0] * off, cy = f.n[1] * off;
    ctx.moveTo(m.x + (cx - f.d[0] * big) * m.k, m.y + (cy - f.d[1] * big) * m.k);
    ctx.lineTo(m.x + (cx + f.d[0] * big) * m.k, m.y + (cy + f.d[1] * big) * m.k);
  };

  (window.JT_BG ||= {}).b = (ctx, s, env) => {
    const { w, h, t, mark: m } = s;
    const shift = ((t / (env.num('--field-drift') * 7)) % 1) * 575.65; // sideways, in mark units
    // The range of n · p the canvas covers, per family, so the repeats fill it exactly.
    const corners = [[0, 0], [w, 0], [0, h], [w, h]].map(([x, y]) => [(x - m.x) / m.k, (y - m.y) / m.k]);

    ctx.beginPath();
    for (const f of families) {
      const dots = corners.map(([x, y]) => f.n[0] * x + f.n[1] * y);
      const lo = Math.min(...dots), hi = Math.max(...dots);
      const sh = shift * f.n[0];
      for (const o of f.offs) {
        for (let k = Math.floor((lo - o - sh) / T); o + sh + k * T <= hi; k++) lineAt(ctx, s, f, o + sh + k * T);
      }
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = env.v('--field-line');
    ctx.stroke();

    // The trace: a run of four consecutive outline edges, drawn over 1.2 s, held, then faded.
    const every = env.num('--field-trace-every');
    const cycle = Math.floor(t / every);
    const u = (t % every) / 1.2;
    const fade = Math.min(1, Math.max(0, 3 - u)); // drawn by 1.2 s, held to 2.4 s, gone by 3.6 s
    if (fade <= 0 || !s.figure) return; // phones have no figure to trace, and the text covers the frame
    const poly = polys[cycle % 2];
    const start = (cycle * 5) % poly.length;
    const run = [0, 1, 2, 3, 4].map((i) => poly[(start + i) % poly.length]);
    const total = run.slice(1).reduce((sum, q, i) => sum + Math.hypot(q[0] - run[i][0], q[1] - run[i][1]), 0);
    let left = total * (1 - (1 - Math.min(1, u)) ** 3);
    const at = ([x, y]) => [m.x + x * m.k, m.y + y * m.k];

    ctx.globalAlpha = fade;
    ctx.beginPath();
    ctx.moveTo(...at(run[0]));
    let lead = 0;
    for (let i = 1; i < run.length && left > 0; i++) {
      const a = run[i - 1], b = run[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const k = Math.min(1, left / len);
      ctx.lineTo(...at([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]));
      left -= len;
      lead = i - 1;
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = env.v('--field-trace');
    ctx.stroke();

    // The construction line through the leading edge, lit while the trace is on it.
    const e = edges.find((x) => x.a === run[lead]);
    if (e) {
      ctx.globalAlpha = fade * 0.5;
      ctx.beginPath();
      lineAt(ctx, s, e.f, e.off);
      ctx.lineWidth = 1;
      ctx.strokeStyle = env.v('--field-hot');
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
})();
