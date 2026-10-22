// Live contrast check: reads the background canvas under every text block for a few seconds, with the cursor parked
// first on the bio, then just past the end of the label row (where A's glow is closest to text), and reports the
// worst ratio per text color. Paste into the console, or:
//   agent-browser eval --stdin < tools/sample.js
(async () => {
  const hero = document.querySelector('.hero');
  const canvas = hero.querySelector('.field');
  const ctx = canvas.getContext('2d');
  const probe = (prop) => {
    const el = document.createElement('i');
    el.style.color = `var(${prop})`;
    document.body.append(el);
    const c = document.createElement('canvas').getContext('2d');
    c.fillStyle = getComputedStyle(el).color;
    c.fillRect(0, 0, 1, 1);
    el.remove();
    return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const bg = probe('--color-bg');
  const texts = { ink: ['.name', '.role', '.bio'], 'ink-muted': ['.loc'], accent: ['.tagline .hl'] };
  const colors = Object.fromEntries(Object.keys(texts).map((k) => [k, probe(`--color-${k}`)]));

  const bio = document.querySelector('.bio').getBoundingClientRect();
  const loc = document.querySelector('.loc').getBoundingClientRect();
  const spots = [[bio.left + bio.width * 0.4, bio.top + bio.height / 2], [loc.right + 120, loc.top + loc.height / 2]];

  const hr = hero.getBoundingClientRect();
  const dpr = canvas.width / hr.width;
  const worst = {};
  for (let n = 0; n < 24; n++) {
    const [cx, cy] = spots[n < 12 ? 0 : 1];
    hero.dispatchEvent(new PointerEvent('pointermove', { clientX: cx, clientY: cy, bubbles: true }));
    await new Promise((r) => setTimeout(r, 250));
    for (const [k, sels] of Object.entries(texts)) {
      for (const sel of sels) {
        const r = document.querySelector(sel).getBoundingClientRect();
        const x = Math.round((r.left - hr.left) * dpr), y = Math.round((r.top - hr.top) * dpr);
        const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
        const d = ctx.getImageData(x, y, w, h).data;
        let peak = bg, peakL = lum(bg);
        for (let i = 0; i < d.length; i += 4) {
          if (!d[i + 3]) continue;
          const a = d[i + 3] / 255;
          const px = [0, 1, 2].map((c) => d[i + c] * a + bg[c] * (1 - a));
          const l = lum(px);
          if (l > peakL) { peak = px; peakL = l; }
        }
        const cr = ratio(colors[k], peak);
        if (!worst[k] || cr < worst[k].ratio) worst[k] = { ratio: +cr.toFixed(2), over: sel, peak: peak.map(Math.round) };
      }
    }
  }
  return { bg: document.documentElement.dataset.bg, worst };
})();
