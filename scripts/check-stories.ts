/**
 * pnpm check:stories — every component directory has a story (see stories.ts for the rule and the covered-by map).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { missingStories } from './stories.ts';

const components = new URL('../src/components/', import.meta.url);
const dirs = readdirSync(components, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

const stories = Object.fromEntries(
  dirs.map((name) => {
    const file = new URL(`${name}/${name}.stories.tsx`, components);
    return [name, existsSync(file) ? readFileSync(file, 'utf8') : null];
  }),
);

const missing = missingStories(stories);
for (const { component, file, reason } of missing) {
  console.error(`✖ ${component}: ${reason === 'missing' ? `no story file at ${file}` : `${file} has no named story export`}`);
}

if (missing.length) {
  console.error(
    `\ncheck:stories failed: ${missing.length} component(s) without a story. Add a <Name>.stories.tsx with at least one named story, ` +
      'or list the directory in COVERED_BY in scripts/stories.ts if another story shows it.',
  );
  process.exit(1);
}
console.log(`check:stories passed (${dirs.length} component directories).`);
