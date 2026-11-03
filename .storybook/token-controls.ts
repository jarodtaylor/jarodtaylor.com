/**
 * Live token controls: a story lists the enum knobs its component reads, and gets a control per knob that
 * overrides that token on <html>. Only token values change, never markup or props (brands differ only through
 * tokens). Pure logic here; the decorator in preview.tsx applies it.
 */
import type { ArgTypes } from '@storybook/react-vite';
import { ENUMS, type EnumKnob } from '../scripts/derive.ts';

/** "Brand default" writes nothing, so the selected brand's own value shows. */
export const BRAND_DEFAULT = 'brand default';

/**
 * Each enum knob → the leaf property its CSS or runtime reads (not the knob or choice tier above it), so an inline
 * value on <html> wins over the brand's. No generated map exists; the test keeps this one complete.
 */
export const TOKEN_PROPERTY: Record<EnumKnob, string> = {
  decoration: '--section-decoration',
  'hero-figure': '--hero-figure',
  'hero-layout': '--hero-layout',
  'hero-intro': '--hero-intro',
  'hero-cue': '--hero-cue',
  'label-case': '--header-control-label-case',
  'nav-align': '--header-nav-align',
  'info-align': '--header-info-align',
  'font-smoothing': '--choice-font-smoothing',
  'link-underline': '--choice-link-underline',
  'menu-shape': '--header-menu-shape',
  'hero-ground': '--hero-ground',
};

/** Initial args for a story's token controls: every knob at "brand default". */
export function tokenArgs<K extends EnumKnob>(keys: readonly K[]): Record<K, string> {
  return Object.fromEntries(keys.map((key) => [key, BRAND_DEFAULT])) as Record<K, string>;
}

export function tokenArgTypes(keys: readonly EnumKnob[]) {
  return Object.fromEntries(
    keys.map((key) => [
      key,
      {
        name: key,
        options: [BRAND_DEFAULT, ...ENUMS[key]],
        control: { type: ENUMS[key].length > 3 ? 'select' : 'radio' },
        table: { category: 'Tokens' },
      },
    ]),
  ) as Record<EnumKnob, ArgTypes[string] & { options: string[]; table: { category: string } }>;
}

export function tokenStyle(args: Record<string, unknown>): Record<string, string | null> {
  return Object.fromEntries(
    (Object.entries(TOKEN_PROPERTY) as [EnumKnob, string][]).map(([key, property]) => {
      const value = args[key];
      return [property, typeof value === 'string' && value !== BRAND_DEFAULT ? value : null];
    }),
  );
}
