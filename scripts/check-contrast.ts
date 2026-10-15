/**
 * pnpm check:contrast — WCAG 2.2 AA for every brand × every surface pair (see contrast.ts for the convention).
 * Reads the resolved per-brand JSON that `pnpm tokens` writes to public/tokens/.
 */
import { existsSync, readFileSync } from 'node:fs';
import { brandsFromResolver } from './brands.ts';
import { contrastPairs, type ResolvedTokens } from './contrast.ts';

let failed = 0;

for (const brand of brandsFromResolver().all) {
  const file = new URL(`../public/tokens/${brand}.json`, import.meta.url);
  if (!existsSync(file)) {
    console.error(`✖ public/tokens/${brand}.json is missing. Run \`pnpm tokens\` first.`);
    process.exit(1);
  }
  const { tokens } = JSON.parse(readFileSync(file, 'utf8')) as { tokens: ResolvedTokens };
  const { pairs, errors } = contrastPairs(tokens);

  for (const error of errors) {
    console.error(`✖ ${brand}: ${error}`);
    failed++;
  }
  for (const { fg, bg, ratio, min } of pairs) {
    const ok = ratio >= min;
    if (!ok) failed++;
    const line = `${ok ? '✓' : '✖'} ${brand}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1 (needs ${min}:1)`;
    (ok ? console.log : console.error)(line);
  }
}

if (failed) {
  console.error(`\ncheck:contrast failed: ${failed} problem(s). Fix the knobs in tokens/knobs/<brand>.json or the surface aliases in tokens/semantic/color.json.`);
  process.exit(1);
}
console.log('\ncheck:contrast passed.');
