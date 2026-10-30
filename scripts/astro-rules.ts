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

const keepNewlines = (s: string) => s.replace(/[^\n]/g, ' ');

/** A quoted attribute value, or a `{…}` expression with one level of nested braces (e.g. `style={{ … }}`). */
const VALUE = /"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}/g;
/** An opening tag; values may contain `<` and `>`, so they are matched whole. */
const OPENING_TAG = new RegExp(`<([A-Za-z][\\w.:-]*)((?:${VALUE.source}|[^>"'{])*)>`, 'g');

function blankPreservingLines(source: string): string {
  return source
    .replace(/^---[\s\S]*?\n---/, keepNewlines)
    .replace(/<!--[\s\S]*?-->/g, keepNewlines)
    .replace(/<script\b[\s\S]*?<\/script>/g, keepNewlines);
}

export function checkAstro(
  file: string,
  source: string,
  allowlist: Readonly<Record<string, string>> = CLIENT_ALLOWLIST,
): AstroViolation[] {
  const text = blankPreservingLines(source);
  const lineAt = (index: number) => text.slice(0, index).split('\n').length;
  const violations: AstroViolation[] = [];

  for (const m of text.matchAll(OPENING_TAG)) {
    const [, name, rawAttrs] = m as unknown as [string, string, string];
    const attrs = rawAttrs.replace(VALUE, keepNewlines);
    const line = lineAt(m.index);

    for (const d of attrs.matchAll(/(?:^|\s)client:(\w+)/g)) {
      if (Object.hasOwn(allowlist, name)) continue;
      violations.push({ file, line, kind: 'client-directive', detail: `${name} uses client:${d[1]}` });
    }
    if (name === 'style' && !/(?:^|\s)is:inline\b/.test(attrs)) {
      violations.push({ file, line, kind: 'scoped-style', detail: '<style> without is:inline' });
    }
  }

  // A tag the scan couldn't parse (deeper brace nesting) must still fail loudly, not pass silently.
  const unparsed = text.replace(OPENING_TAG, keepNewlines);
  for (const d of unparsed.matchAll(/\sclient:(\w+)/g)) {
    violations.push({ file, line: lineAt(d.index), kind: 'client-directive', detail: `(unknown) uses client:${d[1]}` });
  }

  return violations.sort((a, b) => a.line - b.line);
}
