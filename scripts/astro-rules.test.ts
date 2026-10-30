import { describe, expect, it } from 'vitest';
import { checkAstro } from './astro-rules.ts';

describe('checkAstro', () => {
  it('flags a client: directive on a component that is not allowlisted', () => {
    const src = '---\nimport Hero from "./Hero.tsx";\n---\n<main>\n  <Hero client:load />\n</main>\n';
    expect(checkAstro('src/pages/a.astro', src, {})).toEqual([
      { file: 'src/pages/a.astro', line: 5, kind: 'client-directive', detail: 'Hero uses client:load' },
    ]);
  });

  it('allows a client: directive on an allowlisted component', () => {
    expect(checkAstro('a.astro', '<Hero client:load />', { Hero: 'needs JS for X' })).toEqual([]);
  });

  it('flags a scoped <style> and allows <style is:inline>', () => {
    const v = checkAstro('a.astro', '<p>hi</p>\n<style>\n  p { color: red; }\n</style>\n', {});
    expect(v).toMatchObject([{ line: 2, kind: 'scoped-style' }]);
    expect(checkAstro('a.astro', '<style is:inline>p{}</style>', {})).toEqual([]);
  });

  it('ignores client: and <style> inside HTML comments and the frontmatter fence', () => {
    const src = '---\nconst a = "<Hero client:load />";\nconst b = "<style>";\n---\n<!-- <Hero client:load /> <style> -->\n<p>ok</p>\n';
    expect(checkAstro('a.astro', src, {})).toEqual([]);
  });
});
