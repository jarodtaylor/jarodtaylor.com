/**
 * Stylelint rules that enforce the token rules in CLAUDE.md. Used by `pnpm check:tokens-only`.
 *
 *   tokens/tier-vars       every var(--x) and style-query property must be a semantic or component token
 *                          (or a private --_ prop). Primitives and unknown names (typos) are rejected.
 *                          Declaring a custom property is allowed only for private --_ props: redefining
 *                          a token in component CSS would fork it per component.
 *   tokens/no-brand-keys   no selector, @container/@scope/@supports condition, or style query keyed on the brand.
 *
 * The allowed names come from the token sources themselves (the semantic and component sets in
 * tokens/resolver.json), so a new token is usable as soon as it exists. No build step needed.
 */
import { readFileSync } from 'node:fs';
import stylelint, { type Rule } from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const tokensDir = new URL('../tokens/', import.meta.url);
const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, tokensDir), 'utf8'));

/** DTCG token ids in a file: dotted paths to every node with a $value. */
function tokenIds(node: Record<string, unknown>, path: string[] = []): string[] {
  if ('$value' in node) return [path.join('.')];
  return Object.entries(node)
    .filter(([key, child]) => !key.startsWith('$') && child && typeof child === 'object')
    .flatMap(([key, child]) => tokenIds(child as Record<string, unknown>, [...path, key]));
}

const resolver = readJson('resolver.json');
const tierSources: { $ref: string }[] = [...resolver.sets.semantic.sources, ...resolver.sets.component.sources];
const allowed = new Set(tierSources.flatMap(({ $ref }) => tokenIds(readJson($ref))).map((id) => `--${id.replaceAll('.', '-')}`));
// Primitive groups are whatever derive() emits (color, size, font, knob, …); named only for a clearer message.
const primitiveGroups = Object.keys(readJson('generated/default.json')).filter((key) => !key.startsWith('$'));

const tierVars = 'tokens/tier-vars';
const tierMessages = ruleMessages(tierVars, {
  primitive: (name: string) =>
    `"${name}" is a primitive. Components consume only semantic or component tokens (--surface-*, --space-*, --type-*, --button-*, …).`,
  declared: (name: string) => `Declares "${name}". Component CSS may only declare private --_ props; tokens live in tokens/.`,
  unknown: (name: string) =>
    `"${name}" is not a semantic or component token. Add it to tokens/semantic or tokens/component, or use a private --_ prop.`,
});

const tierVarsRule: Rule = (primary) => (root, result) => {
  if (!validateOptions(result, tierVars, { actual: primary, possible: [true] })) return;

  const check = (text: string, pattern: RegExp, node: Parameters<typeof report>[0]['node']) => {
    for (const [, name] of text.matchAll(pattern)) {
      if (!name || name.startsWith('--_') || allowed.has(name)) continue;
      const isPrimitive = primitiveGroups.some((group) => name.startsWith(`--${group}-`));
      report({
        result,
        ruleName: tierVars,
        node,
        word: name,
        message: isPrimitive ? tierMessages.primitive(name) : tierMessages.unknown(name),
      });
    }
  };

  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--') && !decl.prop.startsWith('--_'))
      report({ result, ruleName: tierVars, node: decl, word: decl.prop, message: tierMessages.declared(decl.prop) });
    check(decl.value, /var\(\s*(--[\w-]+)/g, decl);
  });
  // Style queries name the property bare: @container style(--section-decoration: rules).
  root.walkAtRules((atRule) => check(atRule.params, /(--[\w-]+)/g, atRule));
};
tierVarsRule.ruleName = tierVars;
tierVarsRule.messages = tierMessages;
tierVarsRule.meta = { url: 'https://github.com/jarodtaylor/jarodtaylor.com/blob/main/CLAUDE.md#token-rules-non-negotiable' };

const noBrandKeys = 'tokens/no-brand-keys';
const brandMessages = ruleMessages(noBrandKeys, {
  rejected: (where: string) =>
    `${where} is keyed on the brand. Brands differ only through tokens; generated tokens.css is the only place data-brand may appear.`,
});
const brandKey = /data-brand|--brand\b/;

const noBrandKeysRule: Rule = (primary) => (root, result) => {
  if (!validateOptions(result, noBrandKeys, { actual: primary, possible: [true] })) return;
  root.walkRules((rule) => {
    if (brandKey.test(rule.selector))
      report({ result, ruleName: noBrandKeys, node: rule, message: brandMessages.rejected(`Selector "${rule.selector}"`) });
  });
  root.walkAtRules((atRule) => {
    if (brandKey.test(atRule.params))
      report({ result, ruleName: noBrandKeys, node: atRule, message: brandMessages.rejected(`@${atRule.name} ${atRule.params}`) });
  });
};
noBrandKeysRule.ruleName = noBrandKeys;
noBrandKeysRule.messages = brandMessages;
noBrandKeysRule.meta = tierVarsRule.meta;

export default [createPlugin(tierVars, tierVarsRule), createPlugin(noBrandKeys, noBrandKeysRule)];
