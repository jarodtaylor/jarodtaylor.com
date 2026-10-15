import { readFileSync } from 'node:fs';

/** Brands declared by the "brand" modifier in tokens/resolver.json, the single list of brands. */
export function brandsFromResolver(): { default: string; all: string[] } {
  const resolver = JSON.parse(readFileSync(new URL('../tokens/resolver.json', import.meta.url), 'utf8'));
  const modifier = resolver.modifiers?.brand;
  if (!modifier?.contexts) throw new Error('tokens/resolver.json has no "brand" modifier');
  const all = Object.keys(modifier.contexts);
  return { default: modifier.default ?? all[0], all };
}
