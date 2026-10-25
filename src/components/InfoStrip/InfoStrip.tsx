import type { CSSProperties } from 'react';
import './InfoStrip.css';

/** The small print under the header: role on the left, location and availability on the right. */
export function InfoStrip() {
  return (
    <p
      className="info"
      style={{ '--_b': 0 } as CSSProperties}
      data-peek="below"
      data-spec="--type-small · sentence case" data-tpl="--type-small · {small} · sentence case">
      <span className="info-role">
        Engineering Leader <span className="info-sep">|</span> Design Engineering, Frontend Systems &amp; Developer Experience
      </span>
      <span className="info-place">
        Frisco, TX
        <span className="info-dot" aria-hidden="true">
          ·
        </span>
        <span className="status">
          <span className="status-dot" aria-hidden="true" />
          Open to new roles
        </span>
      </span>
    </p>
  );
}
