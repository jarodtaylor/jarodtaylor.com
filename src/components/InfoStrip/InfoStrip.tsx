import type { CSSProperties } from 'react';
import './InfoStrip.css';

/** The small print under the header: availability. (The roles moved under the name.) */
export function InfoStrip() {
  return (
    <p
      className="info"
      style={{ '--_b': 0 } as CSSProperties}
      data-peek="below"
      data-spec="--type-small · sentence case"
      data-tpl="--type-small · {small} · sentence case"
    >
      <span className="status">
        <span className="status-dot" aria-hidden="true" />
        Open to new roles
      </span>
    </p>
  );
}
