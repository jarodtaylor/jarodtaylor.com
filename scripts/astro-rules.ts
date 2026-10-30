/**
 * The two .astro rules AGENTS.md states: no `client:*` unless a component truly needs JS, and no scoped
 * `<style>` (component CSS is co-located plain CSS in `@layer components`). Pure: file path + contents in, violations out.
 * Uses Astro's own parser, so comments, frontmatter, script bodies and nested expressions are never mistaken for markup.
 */
import { parse } from '@astrojs/compiler-rs';

/**
 * Components allowed to carry a `client:*` directive: component name → why it needs JS.
 * Empty today. To add one: `Carousel: 'drag-to-scroll needs pointer events'`.
 */
export const CLIENT_ALLOWLIST: Readonly<Record<string, string>> = {};

export type AstroViolation = {
  file: string;
  line: number;
  kind: 'client-directive' | 'scoped-style' | 'parse-error';
  detail: string;
};

type Node = { type?: string; start?: number; [key: string]: unknown };

function tagName(name: Node): string {
  if (name.type === 'JSXMemberExpression') return `${tagName(name.object as Node)}.${tagName(name.property as Node)}`;
  if (name.type === 'JSXNamespacedName') return `${tagName(name.namespace as Node)}:${tagName(name.name as Node)}`;
  return String(name.name);
}

function walk(node: unknown, visit: (n: Node) => void): void {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, visit));
  if (!node || typeof node !== 'object') return;
  visit(node as Node);
  for (const value of Object.values(node)) walk(value, visit);
}

export function checkAstro(
  file: string,
  source: string,
  allowlist: Readonly<Record<string, string>> = CLIENT_ALLOWLIST,
): AstroViolation[] {
  const lineAt = (index: number) => source.slice(0, index).split('\n').length;
  const { ast, diagnostics } = parse(source);

  // Later parse errors usually cascade from the first, so report that one.
  const error = diagnostics.find((d) => d.severity === 'error');
  if (error) return [{ file, line: error.labels[0]?.line ?? 1, kind: 'parse-error', detail: error.text }];

  const violations: AstroViolation[] = [];
  walk(ast, (n) => {
    if (n.type !== 'JSXOpeningElement') return;
    const name = tagName(n.name as Node);
    const attrs = (n.attributes as Node[]).filter((a) => a.type === 'JSXAttribute').map((a) => tagName(a.name as Node));
    const line = lineAt(n.start!);

    for (const attr of attrs) {
      if (attr.startsWith('client:') && !Object.hasOwn(allowlist, name)) {
        violations.push({ file, line, kind: 'client-directive', detail: `${name} uses ${attr}` });
      }
    }
    if (name === 'style' && !attrs.includes('is:inline')) {
      violations.push({ file, line, kind: 'scoped-style', detail: '<style> without is:inline' });
    }
  });

  return violations.sort((a, b) => a.line - b.line);
}
