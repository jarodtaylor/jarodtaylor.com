/** Shared by the Playwright checks: every built page and every brand. */
import { existsSync, readdirSync } from 'node:fs';
import { brandsFromResolver } from '../scripts/brands.ts';

const dist = new URL('../dist/', import.meta.url);

export const brands = brandsFromResolver().all;

/** URL path of every HTML file in dist/: index.html → /, about/index.html → /about/, 404.html → /404.html. */
export function builtPages(): string[] {
  if (!existsSync(dist)) throw new Error('dist/ is missing. Run `pnpm build` before the Playwright checks.');
  return readdirSync(dist, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.html'))
    .map((file) => '/' + file.split('\\').join('/').replace(/(^|\/)index\.html$/, '$1'))
    .sort();
}
