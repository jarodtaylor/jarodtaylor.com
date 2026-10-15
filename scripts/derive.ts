/**
 * derive(knobs) → primitive tokens (DTCG 2025.10).
 *
 * DTCG aliases can't do math, and neither can Figma, so every ramp and scale
 * is computed here, once, from the handful of knobs a brand authors. The
 * output is concrete values that Terrazzo compiles and Figma can import.
 *
 * This module must stay pure and dependency-free: no Node APIs, no imports.
 * It runs at build time (scripts/build-tokens.ts) and, later, in the browser
 * for Remix v2 live knobs.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Dimension {
  value: number;
  unit: 'px' | 'rem';
}

interface Token<T> {
  $type?: string;
  $value: T;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

export const DECORATIONS = ['rules', 'none'] as const;
export type Decoration = (typeof DECORATIONS)[number];

type FontFamily = string | string[];

/** Shape of tokens/knobs/<brand>.json. Group-level $type/$description are allowed and ignored. */
export interface Knobs {
  color: {
    neutral: { hue: Token<number>; chroma: Token<number> };
    accent: { hue: Token<number>; chroma: Token<number> };
  };
  type: {
    base: Token<Dimension>;
    ratio: Token<number>;
    family: { body: Token<FontFamily>; display: Token<FontFamily>; mono: Token<FontFamily> };
    weight: { body: Token<number>; display: Token<number> };
  };
  space: { base: Token<Dimension>; density: Token<number> };
  shape: { radius: Token<Dimension>; 'border-width': Token<Dimension> };
  decoration: Token<string>;
}

export interface OklchColor {
  colorSpace: 'oklch';
  /** [L 0–1, C ≥ 0, H degrees] */
  components: [number, number, number];
  alpha: number;
  /** sRGB fallback (DTCG 2025.10 `hex`), consumed by the Figma export. */
  hex: string;
}

type Leaf<T> = { $value: T };

export interface Primitives {
  color: {
    $type: 'color';
    neutral: Record<RampStep, Leaf<OklchColor>>;
    accent: Record<RampStep, Leaf<OklchColor>>;
  };
  font: {
    family: { $type: 'fontFamily'; body: Leaf<FontFamily>; display: Leaf<FontFamily>; mono: Leaf<FontFamily> };
    weight: { $type: 'fontWeight'; body: Leaf<number>; display: Leaf<number> };
    size: { $type: 'dimension' } & Record<TypeStep, Leaf<Dimension>>;
    'line-height': { $type: 'number' } & Record<LineHeight, Leaf<number>>;
  };
  size: {
    space: { $type: 'dimension' } & Record<SpaceStep, Leaf<Dimension>>;
    radius: { $type: 'dimension' } & Record<RadiusStep, Leaf<Dimension>>;
    border: { $type: 'dimension' } & Record<BorderStep, Leaf<Dimension>>;
  };
  knob: {
    decoration: { $type: 'string'; $value: Decoration };
  };
}

// ---------------------------------------------------------------------------
// Scales
// ---------------------------------------------------------------------------

/** Ramp step → OKLCH lightness. Strictly decreasing; 0 is the lightest. */
export const RAMP = {
  '0': 0.995,
  '50': 0.97,
  '100': 0.935,
  '200': 0.88,
  '300': 0.8,
  '400': 0.71,
  '500': 0.62,
  '600': 0.54,
  '700': 0.46,
  '800': 0.38,
  '900': 0.29,
  '950': 0.22,
} as const;
export type RampStep = keyof typeof RAMP;

/** Type step → exponent on the modular scale. */
export const TYPE_SCALE = { xs: -2, sm: -1, md: 0, lg: 1, xl: 2, '2xl': 3, '3xl': 4, '4xl': 5, '5xl': 6 } as const;
type TypeStep = keyof typeof TYPE_SCALE;

/** Space step → multiple of (base × density). */
export const SPACE_SCALE = {
  '1': 0.25,
  '2': 0.5,
  '3': 0.75,
  '4': 1,
  '5': 1.5,
  '6': 2,
  '7': 3,
  '8': 4,
  '9': 6,
  '10': 8,
} as const;
type SpaceStep = keyof typeof SPACE_SCALE;

const LINE_HEIGHT = { tight: 1.1, snug: 1.3, normal: 1.55 } as const;
type LineHeight = keyof typeof LINE_HEIGHT;

type RadiusStep = 'sm' | 'md' | 'lg' | 'full';
type BorderStep = 'thin' | 'thick';

// ---------------------------------------------------------------------------
// derive()
// ---------------------------------------------------------------------------

export function derive(knobs: Knobs): Primitives {
  validate(knobs);

  const { color, type, space, shape } = knobs;

  return {
    color: {
      $type: 'color',
      neutral: ramp(color.neutral.hue.$value, color.neutral.chroma.$value),
      accent: ramp(color.accent.hue.$value, color.accent.chroma.$value),
    },
    font: {
      family: {
        $type: 'fontFamily',
        body: { $value: type.family.body.$value },
        display: { $value: type.family.display.$value },
        mono: { $value: type.family.mono.$value },
      },
      weight: {
        $type: 'fontWeight',
        body: { $value: type.weight.body.$value },
        display: { $value: type.weight.display.$value },
      },
      size: {
        $type: 'dimension',
        ...mapScale(TYPE_SCALE, (exp) => scaleDim(type.base.$value, type.ratio.$value ** exp)),
      },
      'line-height': { $type: 'number', ...mapScale(LINE_HEIGHT, (v) => v) },
    },
    size: {
      space: {
        $type: 'dimension',
        ...mapScale(SPACE_SCALE, (m) => scaleDim(space.base.$value, m * space.density.$value)),
      },
      radius: {
        $type: 'dimension',
        sm: { $value: scaleDim(shape.radius.$value, 0.5) },
        md: { $value: scaleDim(shape.radius.$value, 1) },
        lg: { $value: scaleDim(shape.radius.$value, 2) },
        full: { $value: { value: 9999, unit: 'px' } },
      },
      border: {
        $type: 'dimension',
        thin: { $value: scaleDim(shape['border-width'].$value, 1) },
        thick: { $value: scaleDim(shape['border-width'].$value, 2) },
      },
    },
    knob: {
      decoration: { $type: 'string', $value: knobs.decoration.$value as Decoration },
    },
  };
}

function validate(k: Knobs): void {
  const errors: string[] = [];
  const num = (path: string, v: unknown, ok: (n: number) => boolean, rule: string) => {
    if (typeof v !== 'number' || !Number.isFinite(v) || !ok(v)) errors.push(`${path} must be ${rule} (got ${JSON.stringify(v)})`);
  };
  const dim = (path: string, d: Dimension | undefined, ok: (n: number) => boolean, rule: string) => {
    if (!d || (d.unit !== 'px' && d.unit !== 'rem')) errors.push(`${path} must be a px or rem dimension`);
    else num(path, d.value, ok, rule);
  };
  const positive = (n: number) => n > 0;

  for (const ramp of ['neutral', 'accent'] as const) {
    num(`color.${ramp}.hue`, k.color?.[ramp]?.hue?.$value, (n) => n >= 0 && n < 360, 'in [0, 360)');
    num(`color.${ramp}.chroma`, k.color?.[ramp]?.chroma?.$value, (n) => n >= 0 && n <= 0.4, 'in [0, 0.4]');
  }
  dim('type.base', k.type?.base?.$value, positive, '> 0');
  num('type.ratio', k.type?.ratio?.$value, (n) => n > 1, '> 1');
  for (const f of ['body', 'display', 'mono'] as const) {
    const v = k.type?.family?.[f]?.$value;
    if (!(typeof v === 'string' ? v : Array.isArray(v) && v.length > 0)) errors.push(`type.family.${f} must be a font family`);
  }
  for (const w of ['body', 'display'] as const) {
    num(`type.weight.${w}`, k.type?.weight?.[w]?.$value, (n) => n >= 1 && n <= 1000, 'in [1, 1000]');
  }
  dim('space.base', k.space?.base?.$value, positive, '> 0');
  num('space.density', k.space?.density?.$value, positive, '> 0');
  dim('shape.radius', k.shape?.radius?.$value, (n) => n >= 0, '≥ 0');
  dim('shape.border-width', k.shape?.['border-width']?.$value, (n) => n >= 0, '≥ 0');
  if (!DECORATIONS.includes(k.decoration?.$value as Decoration)) {
    errors.push(`decoration must be one of ${DECORATIONS.join(' | ')} (got ${JSON.stringify(k.decoration?.$value)})`);
  }

  if (errors.length) throw new Error(`Invalid knobs:\n  - ${errors.join('\n  - ')}`);
}

function mapScale<K extends string, V, R>(scale: Record<K, V>, fn: (v: V) => R): Record<K, Leaf<R>> {
  const out = {} as Record<K, Leaf<R>>;
  for (const key of Object.keys(scale) as K[]) out[key] = { $value: fn(scale[key]) };
  return out;
}

function scaleDim(d: Dimension, factor: number): Dimension {
  return { value: round(d.value * factor, 4), unit: d.unit };
}

function round(n: number, places: number): number {
  const p = 10 ** places;
  // `+ 0` normalizes -0 so output JSON is stable.
  return Math.round(n * p) / p + 0;
}

// ---------------------------------------------------------------------------
// Color: OKLCH ramps, clamped into sRGB
// ---------------------------------------------------------------------------

/**
 * Chroma tapers toward the light and dark ends, where sRGB has little room
 * anyway, so ramps stay smooth instead of hitting the gamut wall abruptly.
 */
function taper(l: number): number {
  return Math.max(0.25, 1 - ((l - 0.6) / 0.45) ** 2);
}

function ramp(hue: number, chroma: number): Record<RampStep, Leaf<OklchColor>> {
  const out = {} as Record<RampStep, Leaf<OklchColor>>;
  for (const step of Object.keys(RAMP) as RampStep[]) {
    out[step] = { $value: toSrgbGamut(RAMP[step], chroma * taper(RAMP[step]), hue) };
  }
  return out;
}

/**
 * Reduce chroma (keeping L and H) until the color fits sRGB, then round.
 * Rounding is checked too, so the serialized value is what's in gamut.
 * Every primitive being in sRGB means Terrazzo emits one declaration per
 * color, with no wide-gamut @media duplicates, and the hex fallback is exact.
 */
export function toSrgbGamut(l: number, c: number, h: number): OklchColor {
  const L = round(l, 4);
  const H = round(h, 2);
  let C = round(c, 4);

  if (!inSrgb(L, C, H)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      if (inSrgb(L, mid, H)) lo = mid;
      else hi = mid;
    }
    C = Math.floor(lo * 1e4) / 1e4;
    while (C > 0 && !inSrgb(L, C, H)) C = round(C - 0.0001, 4);
  }

  return { colorSpace: 'oklch', components: [L, C, H], alpha: 1, hex: toHex(oklchToLinearSrgb(L, C, H)) };
}

/** Inward margin on linear sRGB channels, so other converters agree it's in gamut. */
const GAMUT_MARGIN = 1e-4;

export function inSrgb(l: number, c: number, h: number): boolean {
  return oklchToLinearSrgb(l, c, h).every((v) => v >= GAMUT_MARGIN && v <= 1 - GAMUT_MARGIN);
}

/** OKLCH → linear sRGB (Björn Ottosson's OKLab matrices). */
export function oklchToLinearSrgb(l: number, c: number, h: number): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

function toHex(rgb: [number, number, number]): string {
  return (
    '#' +
    rgb
      .map((v) => {
        const encoded = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
        return Math.round(Math.min(1, Math.max(0, encoded)) * 255)
          .toString(16)
          .padStart(2, '0');
      })
      .join('')
  );
}
