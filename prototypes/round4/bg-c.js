// Background C, token horizon: the spacing scale, laid out as depth.
// Source: the nine --space-* tokens (4, 8, 12, 16, 24, 32, 40, 64, 96 px). The scale is close to geometric, which
// is exactly how equal steps recede in perspective, so stacking the gaps smallest-first below a horizon reads as a
// floor running away from you. The horizon is the label row's hairline; the rays are the hero's own column edges,
// projected from a vanishing point at the monogram's center. Rules advance toward the viewer one spacing step
// every --field-advance seconds, so the floor is the spacing scale, measured out loud.
(window.JT_BG ||= {}).c = (ctx, s, env) => {
  const { w, h, t, mark: m, horizon: y0 } = s;
  const gaps = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => env.px(`--space-${i}`));
  const stops = gaps.reduce((acc, g) => [...acc, acc[acc.length - 1] + g], [0]);
  const scale = (h - y0) / stops[stops.length - 1];
  const yAt = (u) => {
    const i = Math.min(Math.floor(u), gaps.length - 1);
    return y0 + (stops[i] + gaps[i] * (u - i)) * scale;
  };
  const vx = m.x + 287.8 * m.k;
  const phase = (t / env.num('--field-advance')) % 1;

  ctx.lineWidth = 1;
  ctx.strokeStyle = env.v('--field-line');

  // Rules: fainter toward the horizon, so depth reads before any motion does.
  for (let i = 0; i < gaps.length; i++) {
    const u = i + phase;
    const y = yAt(u);
    ctx.globalAlpha = Math.min(1, 0.35 + u / 5);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Rays: every column edge of the hero grid, as it would meet the bottom of the frame, pulled back to the vanishing point.
  const cols = parseFloat(env.v('--cols'));
  const gap = parseFloat(getComputedStyle(document.querySelector('.hero')).columnGap);
  const col = (w - 2 * s.gridX - (cols - 1) * gap) / cols;
  const fan = 2.4;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  for (let j = -cols; j <= cols * 2; j++) {
    for (const x of [s.gridX + j * (col + gap), s.gridX + j * (col + gap) + col]) {
      const xb = vx + (x - vx) * fan;
      ctx.moveTo(vx, y0);
      ctx.lineTo(xb, h);
    }
  }
  // Fade the rays out toward the horizon so they meet it as a haze, not a starburst.
  const g = ctx.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0, 'transparent');
  g.addColorStop(0.5, env.v('--field-line'));
  ctx.strokeStyle = g;
  ctx.stroke();
};
