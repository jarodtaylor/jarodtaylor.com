/**
 * The JT monogram, read from src/assets/jt-logo-icon.svg (the single source of its paths), plus the
 * geometry the hero figures need. Runs at build time: the mark is all straight segments, so every
 * derived line and timing is computed here and rendered into the page, never added by JS.
 */
import svg from '../assets/jt-logo-icon.svg?raw';

type Point = [number, number];

export const VIEWBOX = /viewBox="([^"]+)"/.exec(svg)![1]!;
export const [, , WIDTH, HEIGHT] = VIEWBOX.split(' ').map(Number) as [number, number, number, number];

/** The two filled paths, exactly as drawn. */
export const PATHS = [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]!);

/** Absolute vertices of a path made of M/L/H/V moves (any case) and Z. */
function vertices(d: string): Point[] {
  const out: Point[] = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of d.matchAll(/([MLHVZmlhvz])([^MLHVZmlhvz]*)/g)) {
    const n = (args!.match(/-?(?:\d+\.?\d*|\.\d+)/g) ?? []).map(Number);
    const rel = cmd === cmd!.toLowerCase();
    switch (cmd!.toUpperCase()) {
      case 'H':
        for (const v of n) out.push([(x = rel ? x + v : v), y]);
        break;
      case 'V':
        for (const v of n) out.push([x, (y = rel ? y + v : v)]);
        break;
      case 'M':
      case 'L':
        // A moveto's extra pairs are implicit linetos.
        for (let i = 0; i + 1 < n.length; i += 2) out.push([(x = rel ? x + n[i]! : n[i]!), (y = rel ? y + n[i + 1]! : n[i + 1]!)]);
        break;
    }
  }
  return out;
}

const OUTLINES = PATHS.map(vertices);

/** Every corner of the mark, once (a near-duplicate under one unit apart counts as the same corner). */
export const CORNERS: Point[] = OUTLINES.flat().filter(
  (p, i, all) => all.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1) === i,
);

/**
 * How far along its own outline (0 to 1) a corner sits, from the path's start. The outline is traced at
 * constant speed, so this fraction is when the pen reaches the corner.
 */
export function penFraction([px, py]: Point): number {
  let best = { gap: Infinity, at: 0 };
  for (const outline of OUTLINES) {
    const closed = [...outline, outline[0]!];
    const lengths = closed.slice(1).map((b, i) => Math.hypot(b[0] - closed[i]![0], b[1] - closed[i]![1]));
    const total = lengths.reduce((a, b) => a + b, 0);
    let walked = 0;
    lengths.forEach((len, i) => {
      const [ax, ay] = closed[i]!;
      const [bx, by] = closed[i + 1]!;
      const t = len ? Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / len ** 2)) : 0;
      const gap = Math.hypot(ax + t * (bx - ax) - px, ay + t * (by - ay) - py);
      if (gap < best.gap) best = { gap, at: (walked + t * len) / total };
      walked += len;
    });
  }
  return best.at;
}

/**
 * A construction line continued out of both ends, just past any screen edge: two paths that grow away from the mark.
 * The reach is kept short (2500 units clears the farthest corner from 390 to 2560 wide), so most of each path is on
 * screen and drawing or retracting it reads along its whole length instead of in its last few frames.
 */
export function bleed([x1, y1, x2, y2]: [number, number, number, number], reach = 2500): string[] {
  const k = reach / Math.hypot(x2 - x1, y2 - y1);
  const f = (n: number) => +n.toFixed(1);
  return [
    `M${x1} ${y1}L${f(x1 - (x2 - x1) * k)} ${f(y1 - (y2 - y1) * k)}`,
    `M${x2} ${y2}L${f(x2 + (x2 - x1) * k)} ${f(y2 + (y2 - y1) * k)}`,
  ];
}
