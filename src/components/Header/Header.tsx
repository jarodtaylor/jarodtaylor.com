import { PATHS, VIEWBOX } from '../../lib/monogram';
import './Header.css';

const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'Writing', href: '#writing' },
  { label: 'About', href: '#about' },
  { label: 'Colophon', href: '#colophon' },
];

/**
 * Masthead: the monogram, the nav, the Peek toggle and Let's talk.
 * One phone nav for every brand: the list is a popover opened by its button, so it works from the keyboard
 * with no JS. --header-nav-mode decides whether phones get the button (toggle) or the list as a second row (wrap).
 */
export function Header() {
  return (
    <header className="masthead">
      <a className="mark" href="/" aria-label="Jarod Taylor, home">
        <svg viewBox={VIEWBOX} aria-hidden="true" focusable="false">
          {PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </a>
      <nav className="nav" aria-label="Primary">
        <button className="nav-toggle" type="button" popoverTarget="nav-list">
          Menu
        </button>
        <ul className="nav-list" id="nav-list" popover="auto">
          {NAV.map(({ label, href }) => (
            <li key={label}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      {/* Peek backstage: shows the spec layer the page is built on. JS only (hidden without it); state lives on <html>. */}
      <button className="peek-toggle" type="button" aria-pressed="false" aria-label="Peek backstage" data-peek-toggle data-remix-ui>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="5.5" />
          <path d="M12 0v24M0 12h24" />
        </svg>
        <span className="peek-word" aria-hidden="true">
          Peek
        </span>
      </button>
      <a className="talk" href="mailto:contact@jarodtaylor.com">
        Let's talk
      </a>
    </header>
  );
}
