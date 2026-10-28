import { describe, expect, it } from 'vitest';
import { bleed, CORNERS, HEIGHT, PATHS, penFraction, WIDTH } from './monogram.ts';

describe('monogram geometry', () => {
  it('reads the two paths and the viewBox from the asset', () => {
    expect(PATHS).toHaveLength(2);
    expect([WIDTH, HEIGHT]).toEqual([575.65, 502.31]);
  });

  it('finds every corner once', () => {
    // 13 + 9 vertices; the J's 0.08-unit notch at (286.22, 164.31) is one corner.
    expect(CORNERS).toHaveLength(21);
    expect(CORNERS).toContainEqual([286.85, 502.31]);
  });

  it('times a corner by where the pen reaches it', () => {
    expect(penFraction([286.22, 164.31])).toBe(0);
    expect(penFraction([230.41, 73.72])).toBe(0);
    const tip = penFraction([286.85, 502.31]);
    expect(tip).toBeGreaterThan(0.5);
    expect(tip).toBeLessThan(1);
  });

  it('continues a line out of both ends', () => {
    expect(bleed([0, 0, 10, 0], 100)).toEqual(['M0 0L-100 0', 'M10 0L110 0']);
  });
});

describe('edge guides', () => {
  it('puts every slanted guide exactly on an outline edge', async () => {
    const { edgeGuides, CORNERS } = await import('./monogram.ts');
    const guides = edgeGuides([-40, -40], [615.65, 542.31]);
    expect(guides.length).toBeGreaterThan(4);
    for (const [x1, y1, x2, y2] of guides) {
      const len = Math.hypot(x2 - x1, y2 - y1);
      // At least two corners of the mark lie on each guide (the edge's own ends).
      const on = CORNERS.filter(([x, y]) => Math.abs((x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)) / len < 0.1);
      expect(on.length).toBeGreaterThanOrEqual(2);
    }
    // No two guides run as a near-double line.
    for (const [i, a] of guides.entries())
      for (const b of guides.slice(i + 1)) expect(Math.min(Math.abs(a[0] - b[0]), Math.abs(a[2] - b[2]))).toBeGreaterThanOrEqual(6);
  });
});
