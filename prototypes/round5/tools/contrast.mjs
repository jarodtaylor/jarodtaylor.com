// Contrast check for every text/surface pair in Palette B, round 5 hero.
// Parses the real [data-palette] block in styles.css, so it can never drift from the CSS.
// Text over the monogram: on a phone the mark sits behind the name at --mark-phone opacity, so the name (large text, 3:1)
// is checked against the mark's brightest ink, the lime outline, composited at that strength over --color-bg.
// Usage: node tools/contrast.mjs
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

const toLinear = (l, c, h) => {
  const a = c * Math.cos((h * Math.PI) / 180), b = c * Math.sin((h * Math.PI) / 180);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const [L, M, S] = [l_ ** 3, m_ ** 3, s_ ** 3];
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ].map((v) => Math.min(1, Math.max(0, v)));
};
const hex = (lin) => '#' + lin.map((v) => {
  const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.round(s * 255).toString(16).padStart(2, '0');
}).join('');
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [foreground, background, minimum, where]
const pairs = [
  ['ink', 'bg', 4.5, 'name, role, body, ghost button'],
  ['ink-muted', 'bg', 4.5, 'location, header links, skip intro'],
  ['accent', 'bg', 4.5, 'tagline accent, role separator'],
  ['on-accent', 'accent', 4.5, 'primary button'],
  ['bg', 'ink', 4.5, 'button hover'],
  ['ink', 'surface', 4.5, 'prototype controls'],
  ['ink-muted', 'surface', 4.5, 'prototype controls label'],
  ['guide-ink', 'bg', 4.5, 'Peek scale card, cap/baseline, monogram dimensions'],
  ['redline', 'bg', 4.5, 'type-size readout, 60° label'],
  ['on-redline', 'redline', 4.5, 'Peek spec labels, Peek toggle on'],
  ['ink', 'mark-phone', 3, 'name (large text) over the lime outline on a phone'],
  ['ink', 'mark-fill', 4.5, 'any text over the filled resting mark'],
  ['accent', 'bg', 3, 'focus ring, monogram outline (non-text)'],
];

const ok3 = (n, src) => {
  const m = src.match(new RegExp(`--color-${n}:\\s*oklch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)\\)`)) ||
    src.match(new RegExp(`--${n}:\\s*oklch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)(?:\\s*/\\s*([\\d.]+))?\\)`));
  return m.slice(1).map((v) => (v === undefined ? 1 : Number(v)));
};

let fails = 0;
for (const [, id, body] of css.matchAll(/\[data-palette="([abc])"\]\s*\{([^}]*)\}/g)) {
  const tokens = {};
  for (const [, name, l, c, h] of body.matchAll(/--color-([\w-]+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/g)) {
    tokens[name] = toLinear(l / 100, +c, +h);
  }
  const [ink, bg] = [ok3('ink', body), ok3('bg', body)];
    // The phone mark: lime outline at --mark-phone opacity, composited in linear light (conservative).
  const k = Number(css.match(/--mark-phone:\s*([\d.]+)/)[1]);
  tokens['mark-phone'] = tokens.accent.map((v, i) => v * k + tokens.bg[i] * (1 - k));
  // The filled resting mark: color-mix(in oklch, ink 7%, bg).
  const fm = ink.map((v, i) => v * 0.07 + bg[i] * 0.93);
  tokens['mark-fill'] = toLinear(fm[0] / 100, fm[1], fm[2]);
  console.log(`\nPalette ${id.toUpperCase()}`);
  console.log('  ' + ['bg', 'surface', 'accent', 'ink', 'mark-phone', 'mark-fill'].map((t) => `${t} ${hex(tokens[t])}`).join('  '));
  for (const [fg, bg, min, where] of pairs) {
    const r = ratio(tokens[fg], tokens[bg]);
    const ok = r >= min;
    if (!ok) fails++;
    console.log(`  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${fg} on ${bg}  ${where}`);
  }
}
console.log(fails ? `\n${fails} failing pair(s)` : '\nAll pairs pass');
process.exit(fails ? 1 : 0);
