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

  it('names the tag that carries the directive, not markup quoted in another attribute', () => {
    const src = `<Card data-x={'<Hero>'} title="<Hero>"\n  client:load />`;
    expect(checkAstro('a.astro', src, { Hero: 'needs JS' })).toEqual([
      { file: 'a.astro', line: 1, kind: 'client-directive', detail: 'Card uses client:load' },
    ]);
  });

  it('ignores <style> and client: inside <script> contents', () => {
    const src = '<script>\n  const markup = "<style>p{}</style><Hero client:load />";\n</script>\n<p>ok</p>\n<style>\n</style>\n';
    expect(checkAstro('a.astro', src, {})).toMatchObject([{ line: 5, kind: 'scoped-style' }]);
  });
});
