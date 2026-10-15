import type { ReactNode } from 'react';
import './Button.css';

interface ButtonProps {
  children: ReactNode;
  /** Renders a link styled as a button when set. */
  href?: string;
}

export function Button({ children, href }: ButtonProps) {
  return href ? (
    <a className="button" href={href}>
      {children}
    </a>
  ) : (
    <button className="button" type="button">
      {children}
    </button>
  );
}
