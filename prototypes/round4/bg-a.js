// Background A, lattice field: the 60° triangular lattice the monogram is drawn on.
// Anchored to the mark: the outer triangle of the JT is exactly --field-pitch cells per side, so the lattice
// runs through the mark's real corners. The diagonals drift sideways one cell every --field-drift seconds
// (back into register each cycle); near the cursor, lines bend away and warm toward lime.
(window.JT_BG ||= {}).a = (ctx, s, env) => {
  const { w, h, t, mark: m, p } = s;
  const step = (575.65 * m.k) / env.num('--field-pitch');
  const row = (step * Math.sqrt(3)) / 2;
  const slope = 1 / Math.sqrt(3);
  const drift = ((t / env.num('--field-drift')) % 1) * step;
  const reach = env.px('--field-reach');
  const bend = env.num('--field-bend');

  // Push a point away from the cursor; strongest at the center, nothing past `reach`.
  const push = (x, y) => {
    const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy);
    if (d >= reach || d < 1) return [x, y];
    const f = ((1 - d / reach) ** 2 * bend * p.a) / d;
    return [x + dx * f, y + dy * f];
  };
  // Straight lines stay two points; only lines that pass near the cursor are subdivided so they can bend.
  const line = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const near = p && Math.abs((x1 - x0) * (y0 - p.y) - (x0 - p.x) * (y1 - y0)) / len < reach;
    if (!near) { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); return; }
    const n = Math.ceil(len / 12);
    ctx.moveTo(...push(x0, y0));
    for (let i = 1; i <= n; i++) ctx.lineTo(...push(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n));
  };

  ctx.beginPath();
  for (let y = m.y - Math.ceil(m.y / row) * row; y <= h; y += row) line(0, y, w, y);
  // Diagonals at ±60°, written as x = c ± (y - m.y) / √3 through the mark's top edge.
  const span = Math.max(m.y, h - m.y) * slope;
  const c0 = m.x + drift - Math.ceil((m.x + drift + span) / step) * step;
  for (let c = c0; c <= w + span; c += step) {
    line(c - m.y * slope, 0, c + (h - m.y) * slope, h);
    line(c + m.y * slope, 0, c - (h - m.y) * slope, h);
  }

  ctx.lineWidth = 1;
  if (p) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, reach);
    g.addColorStop(0, env.v('--field-hot'));
    g.addColorStop(1, env.v('--field-line'));
    ctx.strokeStyle = g;
  } else ctx.strokeStyle = env.v('--field-line');
  ctx.stroke();
};
