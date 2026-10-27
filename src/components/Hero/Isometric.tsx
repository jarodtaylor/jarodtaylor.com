import type { CSSProperties } from 'react';
import { PATHS } from '../../lib/monogram';

type Point = [number, number];

/** Half a lattice edge (41.12) back along the lattice's 300° axis: the part is seen from above, as it sits on a table. */
const DEPTH: Point = [20.56, -35.61];
const back = ([x, y]: Point): Point => [+(x + DEPTH[0]).toFixed(2), +(y + DEPTH[1]).toFixed(2)];

/** A side face: an outline edge of the mark and the same edge pushed back. */
const side = (a: Point, b: Point) => {
  const [c, d] = [back(b), back(a)];
  return `M${a.join(' ')}L${b.join(' ')}L${c.join(' ')}L${d.join(' ')}Z`;
};

/** The outline edges that face up or up-right, per part, each becoming a side face (h: lit top, d: shaded right). */
const T_SIDES: [face: string, a: Point, b: Point][] = [
  ['d', [436.64, 242.87], [339.07, 73.85]],
  ['h', [575.65, 0], [0, 0]],
];
const J_SIDES: [face: string, a: Point, b: Point][] = [
  ['d', [286.85, 360.08], [210.35, 227.53]],
  ['h', [245.2, 93.14], [50.82, 93.32]],
  ['d', [384.11, 333.87], [245.2, 93.14]],
];
const [J, T] = PATHS as [string, string];

/** Where each part starts (three lattice edges up or down the rail) and how far hover pulls it (a quarter edge). */
const T_MOTION = { '--_from': '-123.36px -213.67px', '--_pull': '-10.28px -17.8px' } as CSSProperties;
const J_MOTION = { '--_from': '123.36px 213.67px', '--_pull': '10.28px 17.8px' } as CSSProperties;

/**
 * The monogram built from its two parts, seen in isometric on the mark's own 60° lattice. The front faces are the mark's
 * own paths; the side faces are its edges pushed back. Drawing order is the hidden-line removal: side faces of both
 * parts, then both fronts. The parts slide together along the 60° rail they share (the J's right edge, the T's
 * diagonal), three lattice edges of travel, and lock where the two tips meet. The rail runs the full page.
 */
export function Isometric() {
  return (
    <svg className="build" viewBox="-10 -45.61 616.21 557.92" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="build-lattice" width="41.12" height="71.22" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="2" />
          <circle cx="41.12" cy="0" r="2" />
          <circle cx="20.56" cy="35.61" r="2" />
          <circle cx="0" cy="71.22" r="2" />
          <circle cx="41.12" cy="71.22" r="2" />
        </pattern>
        {/* The lattice is the drafting surface under the mark, so it fades out from the joint rather than papering the page. */}
        <radialGradient id="build-lattice-fade" gradientUnits="userSpaceOnUse" cx="339.85" cy="237.32" r="900">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="build-lattice-mask" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="6000" height="6000">
          <rect x="-3000" y="-3000" width="6000" height="6000" fill="url(#build-lattice-fade)" />
        </mask>
        {/* The parts travel in from outside the mark; clipped at the drawing's top edge, they never cross the header. */}
        <clipPath id="build-clip">
          <rect x="-3000" y="-45.61" width="6000" height="6000" />
        </clipPath>
        <mask id="build-rail-reveal" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="6000" height="6000">
          <path className="rail-draw" pathLength={1} d="M339.85 237.32L-1160.15 -2360.76" />
          <path className="rail-draw" pathLength={1} d="M339.85 237.32L1839.85 2835.4" />
        </mask>
      </defs>

      <rect className="lattice" x="-3000" y="-3000" width="6000" height="6000" fill="url(#build-lattice)" mask="url(#build-lattice-mask)" />
      <path className="rail" mask="url(#build-rail-reveal)" d="M-1160.15 -2360.76L1839.85 2835.4" />

      {/* The click settles around the joint, where the two tips meet. */}
      <g className="assembly" clipPath="url(#build-clip)" style={{ transformBox: 'view-box', transformOrigin: '339.85px 237.32px' }}>
        <g className="part part-t" style={T_MOTION}>
          {T_SIDES.map(([face, a, b]) => (
            <path key={a.join()} className={`face face-${face}`} d={side(a, b)} />
          ))}
        </g>
        <g className="part part-j" style={J_MOTION}>
          {J_SIDES.map(([face, a, b]) => (
            <path key={a.join()} className={`face face-${face}`} d={side(a, b)} />
          ))}
        </g>
        <g className="part part-t" style={T_MOTION}>
          <path className="face face-front" d={T} />
        </g>
        <g className="part part-j" style={J_MOTION}>
          <path className="face face-front" d={J} />
        </g>
      </g>

      {/* Assembly arrows (while building): each starts at its part and points along the rail to the joint. */}
      <g className="arrow">
        <path className="arrow-shaft" pathLength={1} d="M269.85 116.08L316.85 197.49" />
        <path className="arrow-head" d="M329.85 220L303.59 200.52L326.11 187.52Z" />
      </g>
      <g className="arrow">
        <path className="arrow-shaft" pathLength={1} d="M412.35 362.9L365.35 281.49" />
        <path className="arrow-head" d="M352.35 258.97L356.09 291.45L378.61 278.45Z" />
      </g>

      {/* The click: three strokes on the lattice's dual axes, from the joint outward. */}
      <g className="click">
        <path pathLength={1} d="M415.83 308.93L447.01 290.93" />
        <path pathLength={1} d="M415.83 338.93L447.01 356.93" />
        <path pathLength={1} d="M389.85 353.93L389.85 389.93" />
      </g>
    </svg>
  );
}
