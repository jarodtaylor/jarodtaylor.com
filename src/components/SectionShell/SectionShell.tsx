import type { ReactNode } from 'react';
import './SectionShell.css';

type Surface = 'default' | 'raised' | 'inverse' | 'accent';

interface SectionShellProps {
  title: string;
  /** Semantic surface role. Each brand decides what the role looks like. */
  surface?: Surface;
  children: ReactNode;
}

export function SectionShell({ title, surface = 'default', children }: SectionShellProps) {
  return (
    <section className={`section section--${surface}`}>
      <div className="section__inner">
        <h2 className="section__title">{title}</h2>
        {children}
      </div>
    </section>
  );
}
