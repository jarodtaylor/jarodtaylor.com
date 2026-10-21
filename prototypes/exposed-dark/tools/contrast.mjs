// Contrast check for every text/surface pair in every palette.
// Parses the real [data-palette] blocks in styles.css, so it can never drift from the CSS.
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
  ['ink', 'bg', 4.5, 'body, name, role'],
  ['ink', 'surface', 4.5, 'sheet 01/03 body'],
  ['ink', 'backstage', 4.5, 'margin slug heads'],
  ['ink-muted', 'bg', 4.5, 'location, palette label, colophon'],
  ['ink-muted', 'backstage', 4.5, 'margin slug labels'],
  ['accent', 'bg', 4.5, 'tagline accent, role separator, pill border'],
  ['bg', 'ink', 4.5, 'button hover'],
  ['on-accent', 'accent', 4.5, 'stats numbers, primary button, sheet 02'],
  ['on-accent-muted', 'accent', 4.5, 'stat labels, sheet 02 annotation'],
  ['on-inverse', 'inverse', 4.5, 'sheet 04 body'],
  ['on-inverse-muted', 'inverse', 4.5, 'sheet 04 annotation'],
  ['inverse-accent', 'inverse', 4.5, 'sheet 04 tag'],
  ['guide-ink', 'bg', 4.5, 'cap/baseline, span-dim, colophon code'],
  ['guide-ink', 'surface', 4.5, 'sheet 01/03 math annotation'],
  ['guide-ink', 'backstage', 4.5, 'margin values, backstage dims'],
  ['redline', 'bg', 4.5, 'type-size readout'],
  ['on-redline', 'redline', 4.5, 'peek labels, peek toggle on'],
  ['accent', 'bg', 3, 'focus ring (non-text)'],
  ['guide', 'bg', 3, 'crop marks, dimension lines (non-text)'],
  ['redline', 'surface', 3, 'art highlight (non-text)'],
];

let fails = 0;
for (const [, id, body] of css.matchAll(/\[data-palette="([abc])"\]\s*\{([^}]*)\}/g)) {
  const tokens = {};
  for (const [, name, l, c, h] of body.matchAll(/--color-([\w-]+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/g)) {
    tokens[name] = toLinear(l / 100, +c, +h);
  }
  tokens['accent-ink'] = tokens.accent;
  console.log(`\nPalette ${id.toUpperCase()}`);
  console.log('  ' + ['bg', 'surface', 'accent', 'inverse', 'ink', 'guide', 'redline'].map((t) => `${t} ${hex(tokens[t])}`).join('  '));
  for (const [fg, bg, min, where] of pairs) {
    const r = ratio(tokens[fg], tokens[bg]);
    const ok = r >= min;
    if (!ok) fails++;
    console.log(`  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${fg} on ${bg}  ${where}`);
  }
}
console.log(fails ? `\n${fails} failing pair(s)` : '\nAll pairs pass');
process.exit(fails ? 1 : 0);
