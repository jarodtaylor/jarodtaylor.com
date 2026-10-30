/**
 * pnpm check:astro — the .astro rules from AGENTS.md (see astro-rules.ts): no un-allowlisted `client:*`, no scoped `<style>`.
 */
import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkAstro, type AstroViolation } from './astro-rules.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const files = globSync('src/**/*.astro', { cwd: root }).sort();
const hints: Record<AstroViolation['kind'], string> = {
  'client-directive': 'Render it on the server, or add the component to CLIENT_ALLOWLIST in scripts/astro-rules.ts with a reason.',
  'scoped-style': 'Move the CSS to a co-located .css file wrapped in @layer components.',
  'parse-error': 'Astro could not parse this file; fix the markup so the rules can be checked.',
};

let failed = 0;
for (const file of files) {
  for (const v of checkAstro(file, readFileSync(root + file, 'utf8'))) {
    console.error(`✖ ${v.file}:${v.line} ${v.detail}. ${hints[v.kind]}`);
    failed++;
  }
}

if (failed) {
  console.error(`\ncheck:astro failed: ${failed} problem(s).`);
  process.exit(1);
}
console.log(`check:astro passed (${files.length} .astro files).`);
