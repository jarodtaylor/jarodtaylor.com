import { PATHS, VIEWBOX } from '../../lib/monogram';
import './Header.css';

const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'Writing', href: '#writing' },
  { label: 'About', href: '#about' },
  { label: 'Colophon', href: '#colophon' },
  { label: 'Contact', href: 'mailto:contact@jarodtaylor.com' },
];

/**
 * Masthead: the monogram, the nav, and two tools on the right: Peek (shows the spec layer) and Remix (restyles the
 * site; links to the token lab until the Remix panel exists). Below 64rem every brand folds the nav into one menu:
 * the list is a popover opened by the icon button at the far right, so it works from the keyboard with no JS.
 * The button comes last in the DOM so the tab order matches what you see.
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
        <ul className="nav-list" id="nav-list" popover="auto">
          {NAV.map(({ label, href }) => (
            <li key={label}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      {/* Peek backstage: JS only (hidden without it); state lives on <html>. */}
      <button className="tool peek-toggle" type="button" aria-pressed="false" aria-label="Peek backstage" data-peek-toggle data-remix-ui>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="5.5" />
          <path d="M12 0v24M0 12h24" />
        </svg>
        <span className="tool-label" aria-hidden="true">
          Peek
        </span>
      </button>
      <a className="tool remix" href="/lab/" aria-label="Remix">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 6h18M3 12h18M3 18h18" />
          <circle cx="8" cy="6" r="2.25" />
          <circle cx="16" cy="12" r="2.25" />
          <circle cx="10" cy="18" r="2.25" />
        </svg>
        <span className="tool-label" aria-hidden="true">
          Remix
        </span>
      </a>
      <button className="nav-toggle" type="button" popoverTarget="nav-list" aria-label="Menu">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 8h18M3 16h18" />
        </svg>
      </button>
    </header>
  );
}
