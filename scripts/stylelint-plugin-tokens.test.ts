import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';
import config from '../stylelint.config.js';

/** Lint one declaration in a component rule; returns the rule names that fired. */
const lint = async (decl: string): Promise<string[]> => {
  const { results } = await stylelint.lint({ code: `.x { ${decl} }`, config, codeFilename: 'src/components/X/X.css' });
  return results[0]!.warnings.map((w) => w.rule);
};

describe('private --_ props', () => {
  it.each([
    '--_bg: var(--surface-default-bg);',
    '--_bg: var(--surface-default-bg, var(--surface-raised-bg));',
    '--_delay: calc(var(--motion-duration-base) * 0.15);',
    '--_delay: calc(var(--motion-duration-base) * -1);',
    '--_size: clamp(var(--space-stack-sm), calc(var(--space-gutter) / 2), var(--space-section));',
    '--_size: min(var(--space-gutter), max(var(--space-stack-xs), var(--space-stack-sm)));',
    '--_mid: calc((var(--space-stack-sm) + var(--space-stack-lg)) / 2);',
  ])('accepts %s', async (decl) => {
    expect(await lint(decl)).toEqual([]);
  });

  it.each([
    ['a raw length in math', '--_size: calc(var(--space-gutter) + 2px);'],
    ['a raw duration in math', '--_delay: calc(var(--motion-duration-base) + 100ms);'],
    ['a bare number', '--_n: 2;'],
    ['a raw color', '--_bg: #fff;'],
    ['a primitive in math', '--_size: calc(var(--size-space-4) * 2);'],
    ['a literal fallback', '--_bg: var(--surface-default-bg, red);'],
    ['a non-math function', '--_bg: color-mix(in oklab, var(--surface-default-bg), var(--surface-default-text));'],
    ['a bare group outside math', '--_size: (var(--space-gutter));'],
  ])('rejects %s', async (_, decl) => {
    expect(await lint(decl)).toContain('tokens/tier-vars');
  });
});

describe('durations', () => {
  it('rejects a raw duration and accepts a motion token', async () => {
    expect(await lint('transition-duration: 200ms;')).toContain('unit-allowed-list');
    expect(await lint('transition-duration: var(--motion-duration-fast);')).toEqual([]);
  });
});
