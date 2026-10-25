import type { ReactNode } from 'react';
import './Stage.css';

/**
 * The first viewport as one frame: header, info strip and hero share it, so Peek's construction can run edge to
 * edge and the lattice can sit behind all three. It clips whatever runs past the screen's edges.
 */
export function Stage({ children }: { children: ReactNode }) {
  return <div className="stage">{children}</div>;
}
