import { readFileSync } from 'node:fs';
import Color from 'colorjs.io';
import { describe, expect, it } from 'vitest';
import { derive, toSrgbGamut, RAMP, type Knobs, type OklchColor } from './derive.ts';

const load = (brand: string): Knobs =>
  JSON.parse(readFileSync(new URL(`../tokens/knobs/${brand}.json`, import.meta.url), 'utf8'));

const brands = ['default', 'alt'] as const;

/** Leaf $values of a token group, in key order, excluding $-prefixed group metadata. */
const values = <T>(group: object): T[] =>
  Object.entries(group)
    .filter(([k]) => !k.startsWith('$'))
    .map(([, v]) => (v as { $value: T }).$value);

/** colorjs.io as an independent oracle; epsilon 0 is stricter than Terrazzo's default check. */
const oracleInSrgb = ({ components }: OklchColor) =>
  new Color('oklch', components).inGamut('srgb', { epsilon: 0 });

describe.each(brands)('derive(%s knobs)', (brand) => {
  const knobs = load(brand);
  const tokens = derive(knobs);

  it('is deterministic and does not mutate its input', () => {
    const before = JSON.stringify(knobs);
    expect(JSON.stringify(derive(knobs))).toBe(JSON.stringify(tokens));
    expect(JSON.stringify(derive(structuredClone(knobs)))).toBe(JSON.stringify(tokens));
    expect(JSON.stringify(knobs)).toBe(before);
  });

  it('produces a strictly increasing type scale anchored on the base size', () => {
    const sizes = values<{ value: number; unit: string }>(tokens.font.size);
    sizes.slice(1).forEach((s, i) => expect(s.value).toBeGreaterThan(sizes[i]!.value));
    expect(tokens.font.size.md.$value).toEqual(knobs.type.base.$value);
  });

  it('produces a strictly increasing space scale', () => {
    const steps = values<{ value: number }>(tokens.size.space).map((d) => d.value);
    steps.slice(1).forEach((s, i) => expect(s).toBeGreaterThan(steps[i]!));
  });

  it('produces non-decreasing radius and border steps', () => {
    const { sm, md, lg } = tokens.size.radius;
    expect(sm.$value.value).toBeLessThanOrEqual(md.$value.value);
    expect(md.$value.value).toBeLessThanOrEqual(lg.$value.value);
    expect(tokens.size.border.thin.$value.value).toBeLessThanOrEqual(tokens.size.border.thick.$value.value);
  });

  it.each(['neutral', 'accent'] as const)('%s ramp gets darker at every step, at the knob hue', (name) => {
    const colors = values<OklchColor>(tokens.color[name]);
    expect(colors).toHaveLength(Object.keys(RAMP).length);
    colors.slice(1).forEach((c, i) => expect(c.components[0]).toBeLessThan(colors[i]!.components[0]));
    colors.forEach((c) => expect(c.components[2]).toBe(knobs.color[name].hue.$value));
  });

  it.each(['neutral', 'accent'] as const)('every %s color is inside sRGB, with a matching hex fallback', (name) => {
    for (const color of values<OklchColor>(tokens.color[name])) {
      expect(oracleInSrgb(color), JSON.stringify(color)).toBe(true);
      const oracleHex = new Color('oklch', color.components).to('srgb').toString({ format: 'hex', collapse: false });
      expect(color.hex).toBe(oracleHex);
    }
  });

  it('passes the enumerated decoration knob through', () => {
    expect(tokens.knob.decoration.$value).toBe(knobs.decoration.$value);
  });
});

describe('toSrgbGamut', () => {
  it('clamps out-of-gamut chroma into sRGB at every hue and lightness, keeping L and H', () => {
    for (let h = 0; h < 360; h += 15) {
      for (const l of Object.values(RAMP)) {
        const color = toSrgbGamut(l, 0.4, h);
        expect(oracleInSrgb(color), `L=${l} H=${h}`).toBe(true);
        expect(color.components[0]).toBe(l);
        expect(color.components[2]).toBe(h);
        expect(color.components[1]).toBeLessThan(0.4);
      }
    }
  });

  it('leaves in-gamut colors untouched', () => {
    expect(toSrgbGamut(0.6, 0.05, 250).components).toEqual([0.6, 0.05, 250]);
  });

  it('gives up as little chroma as possible', () => {
    const { components } = toSrgbGamut(0.62, 0.4, 30);
    const nudged = new Color('oklch', [components[0], components[1] + 0.002, components[2]]);
    expect(nudged.inGamut('srgb', { epsilon: 0 })).toBe(false);
  });
});

describe('validation', () => {
  const broken = (mutate: (k: Knobs) => void) => {
    const k = load('default');
    mutate(k);
    return () => derive(k);
  };

  it('rejects an unknown decoration value', () => {
    expect(broken((k) => (k.decoration.$value = 'squiggles'))).toThrow(/decoration must be one of rules \| none/);
  });

  it('rejects a type ratio that would not grow', () => {
    expect(broken((k) => (k.type.ratio.$value = 1))).toThrow(/type\.ratio/);
  });

  it('rejects non-positive density', () => {
    expect(broken((k) => (k.space.density.$value = 0))).toThrow(/space\.density/);
  });
});
