/**
 * Story coverage: every `src/components/<Name>/` ships `<Name>.stories.tsx` with at least one named story export.
 * Proves a story exists, not that it was updated; that stays a review call. Pure: directory → story source in.
 */

/** Directories shown inside another component's story instead of their own: directory → covering story. */
export const COVERED_BY: Readonly<Record<string, string>> = {
  Peek: 'Hero', // Peek's columns and toggle only make sense inside the hero page assembly
};

export type MissingStory = { component: string; file: string; reason: 'missing' | 'no named story' };

export function missingStories(stories: Readonly<Record<string, string | null>>): MissingStory[] {
  const missing: MissingStory[] = [];
  for (const [component, source] of Object.entries(stories)) {
    if (Object.hasOwn(COVERED_BY, component)) continue;
    const file = `src/components/${component}/${component}.stories.tsx`;
    if (source === null) missing.push({ component, file, reason: 'missing' });
    else if (!/^export\s+(const|function)\s+\w+/m.test(source)) missing.push({ component, file, reason: 'no named story' });
  }
  return missing;
}
