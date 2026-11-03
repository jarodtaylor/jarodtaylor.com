import { describe, expect, it } from 'vitest';
import { COVERED_BY, missingStories } from './stories.ts';

describe('missingStories', () => {
  it('reports a component directory with no story file, naming the component and the expected path', () => {
    expect(missingStories({ Foo: null })).toEqual([{ component: 'Foo', file: 'src/components/Foo/Foo.stories.tsx', reason: 'missing' }]);
  });

  it('reports a story file with no named story export', () => {
    const source = "import { Foo } from './Foo';\nexport default { title: 'Components/Foo' };\n";
    expect(missingStories({ Foo: source })).toEqual([
      { component: 'Foo', file: 'src/components/Foo/Foo.stories.tsx', reason: 'no named story' },
    ]);
  });

  it('accepts a story file with a named export', () => {
    expect(missingStories({ Foo: 'export default {};\nexport const Default = {};\n' })).toEqual([]);
  });

  it('does not report a directory the covered-by map lists under another story', () => {
    expect(COVERED_BY.Peek).toBe('Hero');
    expect(missingStories({ Peek: null })).toEqual([]);
  });
});
