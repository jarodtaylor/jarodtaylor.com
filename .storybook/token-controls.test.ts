import { readFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ENUMS } from '../scripts/derive.ts';
import { BRAND_DEFAULT, TOKEN_PROPERTY, tokenArgTypes, tokenStyle } from './token-controls.ts';

const root = new URL('..', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');

describe('TOKEN_PROPERTY', () => {
  it('maps every ENUMS key, so a new enum without a mapping fails here by name', () => {
    expect(Object.keys(ENUMS).filter((key) => !(key in TOKEN_PROPERTY))).toEqual([]);
  });

  it('maps each key to a property tokens.css declares and some component CSS reads', () => {
    const tokens = read('src/styles/tokens.css');
    const componentCss = globSync('src/components/**/*.css', { cwd: fileURLToPath(root) })
      .map((file) => read(file))
      .join('\n');
    for (const [key, property] of Object.entries(TOKEN_PROPERTY)) {
      expect(tokens, `${key}: ${property} not declared in tokens.css`).toContain(`${property}:`);
      expect(componentCss, `${key}: ${property} not read by any component CSS`).toContain(property);
    }
  });
});

describe('tokenArgTypes', () => {
  it('puts "brand default" first, then exactly that enum’s values', () => {
    const argTypes = tokenArgTypes(['hero-layout', 'decoration']);
    expect(argTypes['hero-layout']!.options).toEqual([BRAND_DEFAULT, ...ENUMS['hero-layout']]);
    expect(argTypes.decoration!.options).toEqual([BRAND_DEFAULT, ...ENUMS.decoration]);
    expect(argTypes.decoration!.table.category).toBe('Tokens');
  });
});

describe('tokenStyle', () => {
  it('sets the leaf property for a chosen value and clears it when set back to brand default', () => {
    expect(tokenStyle({ 'hero-layout': 'stack' })['--hero-layout']).toBe('stack');
    expect(tokenStyle({ 'hero-layout': BRAND_DEFAULT })['--hero-layout']).toBeNull();
  });

  it('clears every mapped property the args leave unset, and ignores non-token args', () => {
    const style = tokenStyle({ label: 'Hello' });
    expect(Object.keys(style).sort()).toEqual(Object.values(TOKEN_PROPERTY).sort());
    expect(Object.values(style).every((value) => value === null)).toBe(true);
  });
});
