// Option 3: pointer guides. Only sets state on <html>: data-guides while a mouse is over the stage, and
// --_gx / --_gy, snapped to the hero's real column edges (x) and the base unit (y). CSS draws everything.
(() => {
  const root = document.documentElement;
  const stage = document.querySelector('.stage');
  const hero = document.querySelector('.hero');
  if (!stage || !hero) return;
  let edges = [], unit = 8;

  function measure() {
    const cs = getComputedStyle(hero);
    const cols = cs.gridTemplateColumns.split(' ').map(parseFloat);
    const gap = parseFloat(cs.columnGap);
    let x = parseFloat(cs.paddingLeft);
    edges = cols.flatMap((c) => { const e = [x, x + c]; x += c + gap; return e; });
    const probe = document.createElement('i');
    probe.style.inlineSize = 'var(--space-inset-sm)';
    stage.append(probe); unit = probe.getBoundingClientRect().width || 8; probe.remove();
  }

  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const gx = edges.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a), edges[0] ?? x);
    root.style.setProperty('--_gx', `${gx}px`);
    root.style.setProperty('--_gy', `${Math.round(y / unit) * unit}px`);
    root.dataset.guides = '';
  });
  stage.addEventListener('pointerleave', () => delete root.dataset.guides);
  addEventListener('resize', measure);
  document.fonts.ready.then(measure);
  measure();
})();
