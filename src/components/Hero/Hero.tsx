import type { CSSProperties } from 'react';
import { PeekDims, PeekSpec } from '../Peek/Peek';
import { Construction } from './Construction';
import { Isometric } from './Isometric';
import './Hero.css';

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/jarodtaylor' },
  { label: 'GitHub', href: 'https://github.com/jarodtaylor' },
  { label: 'X', href: 'https://x.com/jarodtaylor' },
  { label: 'Email', href: 'mailto:contact@jarodtaylor.com' },
];

/** Order in the Peek build (--_b) for each redline box. */
const box = (b: number): CSSProperties => ({ '--_b': b }) as CSSProperties;

/**
 * The first viewport: the name, one line about the work, a short bio and socials, and the brand's figure.
 * The DOM is the superset every brand needs; tokens decide what shows and where:
 *   --hero-figure  construction | isometric | lattice   which of the three figures shows (all aria-hidden)
 *   --hero-layout  stack | name-over-details            the details under the name, or in columns below it
 *   --hero-cue     none | icon | labelled               the scroll cue
 * data-tpl holds each Peek label's template; runtime.ts fills data-spec from it with the brand's computed values.
 */
export function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <canvas className="field" aria-hidden="true" />
      <figure className="figure" aria-hidden="true">
        <Construction />
        <Isometric />
      </figure>

      <div className="stack">
        <div
          className="name-block"
          style={box(1)}
          data-peek
          data-spec="h1 · --type-display"
          data-tpl="h1 · --type-display · {display} · lh {display-lh}"
        >
          <h1 className="name">
            <span>Jarod</span> <span>Taylor</span>
          </h1>
          <PeekDims />
        </div>

        <div className="details">
          <p className="tagline" style={box(2)} data-build data-peek="side" data-spec="--type-lead" data-tpl="--type-lead · {lead} · lh {lead-lh}">
            I build the work <span className="tagline-accent">behind the work.</span>
          </p>
          <p className="bio" style={box(3)} data-build data-peek="side" data-spec="--type-body" data-tpl="--type-body · {body} · measure {measure}">
            Designer turned engineer turned engineering leader. For 18 years I've built design systems, frontend platforms, and developer
            experience, and led the teams that build them.
          </p>
          <ul
            className="social"
            style={box(4)}
            aria-label="Elsewhere"
            data-build
            data-peek="side-below"
            data-spec="--type-label"
            data-tpl="--type-label · {label}"
          >
            {SOCIAL.map(({ label, href }) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a className="cue" href="#work">
        <span className="cue-label">Selected work</span>
        <svg viewBox="0 0 16 40" aria-hidden="true" focusable="false">
          <path className="cue-shaft" pathLength={1} d="M8 1V31" />
          <path className="cue-head" d="M8 39L2.2 29H13.8Z" />
        </svg>
      </a>

      <PeekSpec />
    </section>
  );
}
