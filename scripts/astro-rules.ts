/**
 * The two .astro rules AGENTS.md states: no `client:*` unless a component truly needs JS, and no scoped
 * `<style>` (component CSS is co-located plain CSS in `@layer components`). Pure: file path + contents in, violations out.
 */

/**
 * Components allowed to carry a `client:*` directive: component name → why it needs JS.
 * Empty today. To add one: `Carousel: 'drag-to-scroll needs pointer events'`.
 */
export const CLIENT_ALLOWLIST: Readonly<Record<string, string>> = {};

export type AstroViolation = {
  file: string;
  line: number;
  kind: 'client-directive' | 'scoped-style';
  detail: string;
};

/** Blank out the frontmatter fence and HTML comments, keeping newlines so line numbers survive. */
function blank(source: string): string {
  const keepNewlines = (s: string) => s.replace(/[^\n]/g, ' ');
  return source
    .replace(/^---[\s\S]*?\n---/, keepNewlines)
    .replace(/<!--[\s\S]*?-->/g, keepNewlines);
}

export function checkAstro(
  file: string,
  source: string,
  allowlist: Readonly<Record<string, string>> = CLIENT_ALLOWLIST,
): AstroViolation[] {
  const text = blank(source);
  const lineAt = (index: number) => text.slice(0, index).split('\n').length;
  const violations: AstroViolation[] = [];

  for (const m of text.matchAll(/\sclient:(\w+)/g)) {
    const tags = [...text.slice(0, m.index).matchAll(/<([A-Za-z][\w.:-]*)/g)];
    const name = tags.at(-1)?.[1] ?? '(unknown)';
    if (name in allowlist) continue;
    violations.push({ file, line: lineAt(m.index), kind: 'client-directive', detail: `${name} uses client:${m[1]}` });
  }

  for (const m of text.matchAll(/<style\b([^>]*)>/g)) {
    if (/\bis:inline\b/.test(m[1]!)) continue;
    violations.push({ file, line: lineAt(m.index), kind: 'scoped-style', detail: '<style> without is:inline' });
  }

  return violations.sort((a, b) => a.line - b.line);
}
