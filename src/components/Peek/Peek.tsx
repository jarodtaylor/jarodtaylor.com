import type { CSSProperties } from 'react';
import './Peek.css';

/**
 * Peek backstage: the spec layer the page is built on. These are its own parts; the redline boxes hang off
 * any element marked data-peek (its label is data-spec), and the hero's construction figure joins in.
 * Every part is aria-hidden: it describes the layout, it isn't content. Readout values are written by JS from
 * each brand's computed styles, so they sit under [data-remix-ui], which the markup-invariance check excludes.
 */

/** The column grid everything is set on, full height. Each column's edges draw down in turn. */
export function PeekColumns() {
  return (
    <div className="cols" aria-hidden="true" data-remix-ui>
      {Array.from({ length: 12 }, (_, i) => (
        <i key={i} style={{ '--_i': i } as CSSProperties} />
      ))}
    </div>
  );
}

/** The name's own measurements: cap height and baseline rules, and a size bar beside it. */
export function PeekDims() {
  return (
    <div className="dims" aria-hidden="true" data-remix-ui>
      <span className="dim dim--cap">
        <b>cap</b>
      </span>
      <span className="dim dim--base">
        <b>baseline</b>
      </span>
      <span className="dim dim--size">
        <b>
          <span data-readout="display">--</span> = --type-display
        </b>
      </span>
    </div>
  );
}

const SPEC_ROWS = [
  ['--type-display', 'display'],
  ['--type-lead', 'lead'],
  ['--type-body', 'body'],
  ['--type-label', 'label'],
  ['--type-family-display', 'face'],
  ['--page-x', 'page-x'],
  ['columns', 'cols'],
] as const;

/** The hero's whole type scale and grid, read live from the computed layout. Wide screens only. */
export function PeekSpec() {
  return (
    <dl className="spec" aria-hidden="true" data-remix-ui>
      <div className="spec-head" style={{ '--_r': 0 } as CSSProperties}>
        <dt>Hero scale</dt>
        <dd>3 steps + 1 label</dd>
      </div>
      {SPEC_ROWS.map(([term, readout], i) => (
        <div key={readout} style={{ '--_r': i + 1 } as CSSProperties}>
          <dt>{term}</dt>
          <dd data-readout={readout}>--</dd>
        </div>
      ))}
    </dl>
  );
}

/** Shown only while the intro plays. */
export function SkipIntro() {
  return (
    <button className="skip-intro" type="button" data-skip-intro>
      Skip intro
    </button>
  );
}
