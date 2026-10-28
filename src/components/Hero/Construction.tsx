import type { CSSProperties } from 'react';
import { bleed, CORNERS, edgeGuides, HEIGHT, PATHS, penFraction, WIDTH } from '../../lib/monogram';

type Line = [number, number, number, number];

/** --_d orders a guide in the build: guides with the same step draw together. */
const v = (d: number): CSSProperties => ({ '--_d': d }) as CSSProperties;

const PAD = 40;
const L = -PAD;
const R = WIDTH + PAD;

/** The mark's construction: its triangle, the rows its horizontals sit on, and its slanted edges, each run past the mark. */
const ROWS = [0, 73.6, 93.2, 164.3, 333.9, 502.3];
/** One line per slanted edge, exactly on it; they draw in left to right over six steps. */
const EDGES = edgeGuides([L, L], [R, HEIGHT + PAD]);
const DIAGONALS = EDGES.map((g, i): [Line, number] => [g, Math.round((i * 5) / Math.max(1, EDGES.length - 1))]);
const AXIS: Line = [287.8, -40, 287.8, 542.3];
const GUIDES: [Line, number][] = [...ROWS.map((y, i): [Line, number] => [[L, y, R, y], i]), ...DIAGONALS, [AXIS, 6]];

const line = ([x1, y1, x2, y2]: Line) => `M${x1} ${y1}L${x2} ${y2}`;

/**
 * The monogram as the default hero figure: a line drawing over faint construction. Peek shows how it was built:
 * the construction draws, runs out past the mark to the screen's edges, and the outline is traced at constant speed
 * with each corner marked as the pen passes. Everything here is rendered at build time; JS only moves state on <html>.
 */
export function Construction() {
  return (
    <svg className="mono" viewBox={`${L} ${L} ${WIDTH + 2 * PAD} ${HEIGHT + 2 * PAD}`} aria-hidden="true" focusable="false">
      {/* Each guide continued from both of its ends, out past the screen edge. */}
      <g className="mono-bleed">
        {GUIDES.flatMap(([g, d]) => bleed(g).map((path) => <path key={path} pathLength={1} style={v(d)} d={path} />))}
      </g>
      <g className="mono-guides">
        <path className="g-tri" pathLength={1} style={v(-1)} d={`M0 0H${WIDTH}L287.8 498.5Z`} />
        {GUIDES.map(([g, d], i) => (
          <path key={i} className={g === AXIS ? 'g-axis' : 'g-guide'} pathLength={1} style={v(d)} d={line(g)} />
        ))}
      </g>
      <g className="mono-line">
        {PATHS.map((d) => (
          <path key={d} pathLength={1} d={d} />
        ))}
      </g>
      {/* The resting pen: a copy of the outline that a short dash of ink laps, slowly. */}
      <g className="mono-pen">
        {PATHS.map((d) => (
          <path key={d} pathLength={1} d={d} />
        ))}
      </g>
      <g className="mono-marks" fontSize="15">
        <path className="g-arc" pathLength={1} d="M256.85 450.35A60 60 0 0 1 316.85 450.35" />
        <text className="g-deg" x="286.85" y="434" textAnchor="middle">
          60°
        </text>
        <text className="g-size" x="590" y="-14" textAnchor="end">
          {WIDTH} × {HEIGHT}
        </text>
        {/* Each corner pops when the pen reaches it: --_f is how far along its outline it sits. */}
        <g className="g-pts">
          {CORNERS.map(([cx, cy]) => (
            <circle key={`${cx},${cy}`} cx={cx} cy={cy} r="3.5" style={{ '--_f': +penFraction([cx, cy]).toFixed(3) } as CSSProperties} />
          ))}
        </g>
      </g>
    </svg>
  );
}
