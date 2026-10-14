/**
 * pnpm check:tokens-fresh — fails if tokens/generated/ is stale relative to tokens/knobs/.
 *
 * Compares file contents before and after `pnpm tokens` instead of asking git, so it gives the same
 * answer with no commits, untracked files, or a dirty tree. In CI the tree is the commit, so this is
 * exactly "the committed generated output matches its source".
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const dir = new URL('../tokens/generated/', import.meta.url);

const snapshot = (): Map<string, string> =>
  new Map(existsSync(dir) ? readdirSync(dir).map((f) => [f, readFileSync(new URL(f, dir), 'utf8')]) : []);

const before = snapshot();
execFileSync('pnpm', ['tokens'], { stdio: 'inherit' });
const after = snapshot();

const changed = [...new Set([...before.keys(), ...after.keys()])]
  .sort()
  .filter((f) => before.get(f) !== after.get(f))
  .map((f) => `  ${!before.has(f) ? 'added' : !after.has(f) ? 'removed' : 'changed'}: tokens/generated/${f}`);

if (changed.length) {
  console.error(
    `\ncheck:tokens-fresh failed: tokens/generated/ was stale and \`pnpm tokens\` rewrote it.\n${changed.join('\n')}\n` +
      'Commit the regenerated files (never hand-edit them; change tokens/knobs/<brand>.json instead).',
  );
  process.exit(1);
}
console.log('check:tokens-fresh passed.');
