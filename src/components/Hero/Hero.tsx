import type { CSSProperties } from 'react';
import { PeekDims, PeekSpec } from '../Peek/Peek';
import { Construction } from './Construction';
import { Isometric } from './Isometric';
import './Hero.css';

const ROLES = ['Engineering Leader', 'Frontend Architecture', 'Design Engineering', 'Developer Experience'];

/** Icons are 24-unit glyphs in the text colour; decorative, so the label stays each link's name. */
const SOCIAL = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/jarodtaylor',
    icon: (
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/jarodtaylor',
    icon: (
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57l-.02-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3Z" />
    ),
  },
  {
    label: '@jarodtaylor',
    href: 'https://x.com/jarodtaylor',
    icon: <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.6l5.24 6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3Z" />,
  },
  {
    label: 'Email',
    href: 'mailto:contact@jarodtaylor.com',
    icon: <path d="M2 4h20v16H2zM2 5l10 8 10-8" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />,
  },
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
        {/* The name's subtitle: what he does, in four roles. */}
        <ul className="roles" aria-label="Roles" style={box(1.5)} data-build>
          {ROLES.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>

        <div className="details">
          <p className="tagline" style={box(2)} data-build data-peek="side" data-spec="--type-lead" data-tpl="--type-lead · {lead} · lh {lead-lh}">
            I build the work <span className="tagline-accent">behind the work.</span>
          </p>
          <p className="bio" style={box(3)} data-build data-peek="side" data-spec="--type-body" data-tpl="--type-body · {body} · measure {measure}">
            Designer turned engineer turned engineering leader. For 18 years, I've built frontend platforms, design systems, and developer
            experiences. I've also led the teams behind them.
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
            {SOCIAL.map(({ label, href, icon }) => (
              <li key={label}>
                <a href={href}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                    {icon}
                  </svg>
                  {label}
                </a>
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
