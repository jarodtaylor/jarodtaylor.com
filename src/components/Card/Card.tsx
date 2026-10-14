import type { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  title: string;
  /** Small label above the title, e.g. a status. */
  eyebrow?: string;
  children: ReactNode;
}

export function Card({ title, eyebrow, children }: CardProps) {
  return (
    <article className="card">
      {eyebrow && <p className="card__eyebrow">{eyebrow}</p>}
      <h3 className="card__title">{title}</h3>
      <div className="card__body">{children}</div>
    </article>
  );
}
