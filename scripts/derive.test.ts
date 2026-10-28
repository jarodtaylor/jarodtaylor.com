import { readFileSync } from 'node:fs';
import Color from 'colorjs.io';
import { describe, expect, it } from 'vitest';
import { derive, toSrgbGamut, ENUMS, RAMP, RAMPS, type EnumKnob, type Knobs, type OklchColor } from './derive.ts';

const load = (brand: string): Knobs =>
  JSON.parse(readFileSync(new URL(`../tokens/knobs/${brand}.json`, import.meta.url), 'utf8'));

const brands = ['backstage', 'blocks', 'clean'] as const;

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
    expect(tokens.font.size.md.$value).toEqual({ value: knobs.type.base.$value.value / 16, unit: 'rem' });
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

  it.each(RAMPS)('%s ramp gets lighter at every step, at the lightness its step names', (name) => {
    const colors = values<OklchColor>(tokens.color[name]);
    expect(Object.keys(tokens.color[name])).toEqual(Object.keys(RAMP));
    colors.slice(1).forEach((c, i) => expect(c.components[0]).toBeGreaterThan(colors[i]!.components[0]));
    Object.entries(tokens.color[name]).forEach(([step, { $value }]) => expect($value.components[0]).toBe(Number(step) / 1000));
  });

  it.each(RAMPS)('every %s color is inside sRGB, with a matching hex fallback', (name) => {
    for (const color of values<OklchColor>(tokens.color[name])) {
      expect(oracleInSrgb(color), JSON.stringify(color)).toBe(true);
      const oracleHex = new Color('oklch', color.components).to('srgb').toString({ format: 'hex', collapse: false });
      expect(color.hex).toBe(oracleHex);
    }
  });

  it('passes every enumerated knob through', () => {
    for (const name of Object.keys(ENUMS) as EnumKnob[]) expect(tokens.knob[name].$value).toBe(knobs.enum[name].$value);
  });

  it('passes font roles, fluid sizes and motion through', () => {
    expect(tokens.font.variation.display.$value).toBe(knobs.type.variation.display.$value);
    expect(tokens.font.weight.label.$value).toBe(knobs.type.weight.label.$value);
    expect(tokens.font.family.lead.$value).toBe(`{font.family.${knobs.type.family.lead.$value}}`);
    expect(tokens.font.family.display.$value).toEqual([knobs.type.family.display.$value, ...knobs.type.fallback.display.$value.split(', ')]);
    expect(tokens.font.leading.lead.$value).toBe(knobs.type.leading.lead.$value);
    expect(tokens.font.tracking.display.$value).toBe(knobs.type.tracking.display.$value);
    expect(tokens.fluid['hero-display'].wide.$value).toBe(knobs.fluid['hero-display'].wide.$value);
    expect(tokens.fluid.$extensions).toEqual({ 'com.jarodtaylor.export': { figma: false } });
    expect(tokens.duration.base.$value).toEqual({ value: Math.round(knobs.motion.duration.base.$value.value * 1000), unit: 'ms' });
    expect(tokens.easing.out.$value.join(', ')).toBe(knobs.motion.easing.out.$value);
    expect(tokens.color.role.bg!.$value).toBe(`{color.${knobs.color.role.bg!.$value}}`);
  });
});

describe.each(brands)('%s knobs reproduce the approved prototype', (brand) => {
  const knobs = load(brand);
  const tokens = derive(knobs);
  const expected = JSON.parse(readFileSync(new URL('./fixtures/prototype-colors.json', import.meta.url), 'utf8'))[brand] as Record<
    string,
    string
  >;

  it('defines the same color roles as every other brand', () => {
    expect(Object.keys(knobs.color.role).filter((k) => !k.startsWith('$'))).toEqual(
      Object.keys(load('backstage').color.role).filter((k) => !k.startsWith('$')),
    );
  });

  /**
   * Pine, pine-deep and apricot (Clean) are outside sRGB, so no derived color can equal them. The
   * reference is what the prototype rendered on an sRGB screen: CSS Color 4 gamut mapping.
   */
  it.each(Object.keys(expected))('role %s is within ΔE00 2 of the prototype', (role) => {
    const [, ramp, step] = /^\{color\.([\w-]+)\.(\d+)\}$/.exec(tokens.color.role[role]!.$value)!;
    const derived = (tokens.color as unknown as Record<string, Record<string, { $value: OklchColor }>>)[ramp!]![step!]!.$value;
    const reference = new Color(expected[role]!).toGamut({ space: 'srgb', method: 'css' });
    expect(new Color('oklch', derived.components).deltaE2000(reference)).toBeLessThanOrEqual(2);
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
    const k = load('backstage');
    mutate(k);
    return () => derive(k);
  };

  it('rejects an unknown decoration value', () => {
    expect(broken((k) => (k.enum.decoration.$value = 'squiggles'))).toThrow(/enum\.decoration must be one of rules \| none/);
  });

  it.each(Object.keys(ENUMS) as EnumKnob[])('rejects an unknown %s value, and a missing one', (name) => {
    expect(broken((k) => (k.enum[name].$value = 'squiggles'))).toThrow(new RegExp(`enum\\.${name} must be one of`));
    expect(broken((k) => delete (k.enum as Partial<Knobs['enum']>)[name])).toThrow(new RegExp(`enum\\.${name} must be one of`));
  });

  it('accepts only knob types Figma imports: px dimensions, seconds, single family names', () => {
    expect(broken((k) => (k.type.base.$value = { value: 1, unit: 'rem' as 'px' }))).toThrow(/type\.base must be a px dimension/);
    expect(broken((k) => (k.type.family.display.$value = 'Archivo, sans-serif'))).toThrow(/type\.family\.display must be one font family/);
    expect(broken((k) => (k.type.fallback.label.$value = 'Menlo'))).toThrow(/type\.fallback\.label/);
  });

  it.each(['35vw', 'min(12.5vw, 21svh)', 'max(3.5rem, min(9.6vw, 19svh))', 'clamp(4.5rem, 0.6rem + 16.4vw, 32rem)', 'calc(100svh - 4rem)'])(
    'accepts the fluid length %s',
    (v) => {
      expect(broken((k) => (k.fluid['hero-display'].wide.$value = v))).not.toThrow();
    },
  );

  it.each(['12px', '2', 'var(--x)', 'min(12vw, 20svh', 'min(12vw), 20svh)', '12vw, 20svh', 'url(x.png)', ''])(
    'rejects the fluid length %j',
    (v) => {
      expect(broken((k) => (k.fluid['hero-lead'].phone.$value = v))).toThrow(/fluid\.hero-lead\.phone/);
    },
  );

  it.each(['normal', '"wdth" 62', '"wdth" 86, "opsz" 96'])('accepts the variation %j', (v) => {
    expect(broken((k) => (k.type.variation.display.$value = v))).not.toThrow();
  });

  it.each(['wdth 62', '"wdth"', '"wdth" 62,', 'bold'])('rejects the variation %j', (v) => {
    expect(broken((k) => (k.type.variation.text.$value = v))).toThrow(/type\.variation\.text/);
  });

  it('rejects a lead face that is not the display or text face', () => {
    for (const bad of ['label', '{font.family.text}', 'Georgia', ['Georgia', 'serif']])
      expect(broken((k) => (k.type.family.lead = { $value: bad as string }))).toThrow(/type\.family\.lead/);
  });

  it('rejects tracking that is not 0 or em, and leading out of range', () => {
    expect(broken((k) => (k.type.tracking.lead.$value = '-1px'))).toThrow(/type\.tracking\.lead/);
    expect(broken((k) => (k.type.leading.display.$value = 0))).toThrow(/type\.leading\.display/);
  });

  it('rejects a duration in px and an easing with x outside [0, 1]', () => {
    expect(broken((k) => (k.motion.duration.fast.$value = { value: 240, unit: 'ms' as 's' }))).toThrow(/motion\.duration\.fast/);
    for (const bad of ['1.2, 0, 0.5, 1', '0.1, 0, 0.5', 'ease-out'])
      expect(broken((k) => (k.motion.easing.pop.$value = bad))).toThrow(/motion\.easing\.pop/);
  });

  it('rejects a type ratio that would not grow', () => {
    expect(broken((k) => (k.type.ratio.$value = 1))).toThrow(/type\.ratio/);
  });

  it('rejects a role pick that is not a ramp step', () => {
    for (const bad of ['neutral.760', 'mauve.500', '#fff', '{color.neutral.750}'])
      expect(broken((k) => (k.color.role.bg = { $value: bad }))).toThrow(/color\.role\.bg must name a ramp step/);
  });

  it('rejects a missing ramp and an out-of-range peak', () => {
    expect(broken((k) => delete (k.color.ramp as Partial<Knobs['color']['ramp']>).guide)).toThrow(/color\.ramp\.guide\.hue/);
    expect(broken((k) => (k.color.ramp.neutral.peak.$value = 1))).toThrow(/color\.ramp\.neutral\.peak/);
  });

  it('rejects non-positive density', () => {
    expect(broken((k) => (k.space.density.$value = 0))).toThrow(/space\.density/);
  });
});
