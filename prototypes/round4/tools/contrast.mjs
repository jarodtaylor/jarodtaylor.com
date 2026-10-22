// Contrast check for every text/surface pair in Palette B, round 4 hero.
// Text over the living background is checked against the brightest pixel any background can put under it:
// every field ink composited over --color-bg at the strength it can reach under the reading column
// (its own alpha × --field-read, the mask hero.js applies under the text). B's lime trace is not here: it only
// ever runs along the monogram's edges, outside the reading column, and is skipped on phones where there is no figure.
// tools/sample.js checks the live canvas under every text block as well.
// Parses the real [data-palette] block in styles.css, so it can never drift from the CSS.
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
  ['ink', 'impression', 4.5, 'any text over the resting monogram'],
  ['ink', 'surface', 4.5, 'prototype controls'],
  ['ink-muted', 'surface', 4.5, 'prototype controls label'],
  ['guide-ink', 'bg', 4.5, 'build guide labels, Peek scale card, cap/baseline'],
  ['redline', 'bg', 4.5, 'type-size readout, 60° label (peek)'],
  ['on-redline', 'redline', 4.5, 'peek labels, peek toggle on'],
  ['ink', 'field-line', 4.5, 'body text over a lattice line'],
  ['ink', 'field-hot', 4.5, 'body text over the cursor glow (brightest A)'],
  ['ink-muted', 'field-hot', 4.5, 'location over the cursor glow, or B\'s lit construction line'],
  ['accent', 'field-line', 4.5, 'tagline accent over a lattice line'],
  ['accent', 'field-hot', 3, 'tagline accent (large text) over the cursor glow'],
  ['accent', 'bg', 3, 'focus ring, monogram outline (non-text)'],
];

const ok3 = (n, src) => {
  const m = src.match(new RegExp(`--color-${n}:\\s*oklch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)\\)`)) ||
    src.match(new RegExp(`--${n}:\\s*oklch\\(([\\d.]+)%\\s+([\\d.]+)\\s+([\\d.]+)(?:\\s*/\\s*([\\d.]+))?\\)`));
  return m.slice(1).map((v) => (v === undefined ? 1 : Number(v)));
};

const read = Number(css.match(/--field-read:\s*([\d.]+)/)[1]);
let fails = 0;
for (const [, id, body] of css.matchAll(/\[data-palette="([abc])"\]\s*\{([^}]*)\}/g)) {
  const tokens = {};
  for (const [, name, l, c, h] of body.matchAll(/--color-([\w-]+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/g)) {
    tokens[name] = toLinear(l / 100, +c, +h);
  }
  // --color-impression = color-mix(in oklch, ink 5.5%, bg): mix the OKLCH channels the same way.
  const [ink, bg] = [ok3('ink', body), ok3('bg', body)];
  const mix = ink.map((v, i) => v * 0.055 + bg[i] * 0.945);
  tokens.impression = toLinear(mix[0] / 100, mix[1], mix[2]);
  // Field inks carry alpha: composite them over --color-bg in linear light, as the canvas does.
  for (const f of ['field-line', 'field-hot']) {
    const [l, c, h, a] = ok3(f, body);
    const fg = toLinear(l / 100, c, h);
    const k = a * read;
    tokens[f] = fg.map((v, i) => v * k + tokens.bg[i] * (1 - k));
  }
  console.log(`\nPalette ${id.toUpperCase()}`);
  console.log('  ' + ['bg', 'surface', 'accent', 'ink', 'field-line', 'field-hot'].map((t) => `${t} ${hex(tokens[t])}`).join('  '));
  for (const [fg, bg, min, where] of pairs) {
    const r = ratio(tokens[fg], tokens[bg]);
    const ok = r >= min;
    if (!ok) fails++;
    console.log(`  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${fg} on ${bg}  ${where}`);
  }
}
console.log(fails ? `\n${fails} failing pair(s)` : '\nAll pairs pass');
process.exit(fails ? 1 : 0);
