import type { ReactNode } from 'react';
import './SectionShell.css';

type Surface = 'default' | 'raised' | 'inverse' | 'accent';

interface SectionShellProps {
  title: string;
  /** Semantic surface role. Each brand decides what the role looks like. */
  surface?: Surface;
  /** Heading level for the title. Use 1 only for a page's lead section. */
  level?: 1 | 2;
  children: ReactNode;
}

export function SectionShell({ title, surface = 'default', level = 2, children }: SectionShellProps) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <section className={`section section--${surface}`}>
      <div className="section__inner">
        <Heading className="section__title">{title}</Heading>
        {children}
      </div>
    </section>
  );
}
