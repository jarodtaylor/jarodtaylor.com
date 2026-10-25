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

/**
 * Enumerated knobs: discrete layout and decoration choices that component CSS reads with
 * container style queries. Each knob file repeats its list in $extensions.com.jarodtaylor.enum
 * (for tools such as the Remix UI); validate() checks the two agree.
 */
export const ENUMS = {
  decoration: ['rules', 'none'],
  'hero-figure': ['construction', 'isometric', 'lattice'],
  'hero-layout': ['stack', 'name-over-details'],
  'hero-intro': ['peek', 'assemble', 'none'],
  'nav-mode': ['toggle', 'wrap'],
  'hero-cue': ['none', 'icon', 'labelled'],
  'talk-style': ['pill-fill', 'outline'],
  'label-case': ['upper', 'none'],
} as const;
export type EnumKnob = keyof typeof ENUMS;

export const FONT_ROLES = ['display', 'text', 'label'] as const;
type FontRole = (typeof FONT_ROLES)[number];

/** Fluid sizes are CSS expressions, one per shared breakpoint band: phone below 48rem, wide above. */
export const FLUID_SIZES = ['hero-display', 'hero-lead', 'hero-figure'] as const;
type FluidSize = (typeof FLUID_SIZES)[number];
const FLUID_BANDS = ['phone', 'wide'] as const;
type FluidBand = (typeof FLUID_BANDS)[number];

export const DURATIONS = ['fast', 'base', 'slow'] as const;
type DurationStep = (typeof DURATIONS)[number];
export const EASINGS = ['out', 'in', 'draw', 'pop'] as const;
type EasingName = (typeof EASINGS)[number];

type FontFamily = string | string[];
export interface Duration {
  value: number;
  unit: 'ms' | 's';
}
type CubicBezier = [number, number, number, number];

/** Shape of tokens/knobs/<brand>.json. Group-level $type/$description are allowed and ignored. */
export interface Knobs {
  color: {
    neutral: { hue: Token<number>; chroma: Token<number> };
    accent: { hue: Token<number>; chroma: Token<number> };
  };
  type: {
    base: Token<Dimension>;
    ratio: Token<number>;
    family: Record<FontRole, Token<FontFamily>>;
    weight: Record<FontRole, Token<number>>;
    /** A font-variation-settings value, e.g. `"wdth" 62`, or `normal`. */
    variation: Record<FontRole, Token<string>>;
  };
  space: { base: Token<Dimension>; density: Token<number> };
  shape: { radius: Token<Dimension>; 'border-width': Token<Dimension> };
  fluid: Record<FluidSize, Record<FluidBand, Token<string>>>;
  motion: { duration: Record<DurationStep, Token<Duration>>; easing: Record<EasingName, Token<CubicBezier>> };
  enum: Record<EnumKnob, Token<string>>;
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
    family: { $type: 'fontFamily' } & Record<FontRole, Leaf<FontFamily>>;
    weight: { $type: 'fontWeight' } & Record<FontRole, Leaf<number>>;
    variation: { $type: 'string' } & Record<FontRole, Leaf<string>>;
    size: { $type: 'dimension' } & Record<TypeStep, Leaf<Dimension>>;
    'line-height': { $type: 'number' } & Record<LineHeight, Leaf<number>>;
  };
  size: {
    space: { $type: 'dimension' } & Record<SpaceStep, Leaf<Dimension>>;
    radius: { $type: 'dimension' } & Record<RadiusStep, Leaf<Dimension>>;
    border: { $type: 'dimension' } & Record<BorderStep, Leaf<Dimension>>;
  };
  fluid: { $type: 'string'; $extensions: typeof NOT_FOR_FIGMA } & Record<FluidSize, Record<FluidBand, Leaf<string>>>;
  duration: { $type: 'duration' } & Record<DurationStep, Leaf<Duration>>;
  easing: { $type: 'cubicBezier' } & Record<EasingName, Leaf<CubicBezier>>;
  knob: { $type: 'string' } & { [K in EnumKnob]: Leaf<(typeof ENUMS)[K][number]> };
}

/** Figma variables can't hold CSS expressions; the Figma export skips groups carrying this. */
const NOT_FOR_FIGMA = { 'com.jarodtaylor.export': { figma: false } } as const;

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
      family: { $type: 'fontFamily', ...pick(FONT_ROLES, (r) => type.family[r].$value) },
      weight: { $type: 'fontWeight', ...pick(FONT_ROLES, (r) => type.weight[r].$value) },
      variation: { $type: 'string', ...pick(FONT_ROLES, (r) => type.variation[r].$value) },
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
    fluid: {
      $type: 'string',
      $extensions: NOT_FOR_FIGMA,
      ...(Object.fromEntries(FLUID_SIZES.map((f) => [f, pick(FLUID_BANDS, (b) => knobs.fluid[f][b].$value)])) as Record<
        FluidSize,
        Record<FluidBand, Leaf<string>>
      >),
    },
    duration: { $type: 'duration', ...pick(DURATIONS, (d) => ({ ...knobs.motion.duration[d].$value })) },
    easing: { $type: 'cubicBezier', ...pick(EASINGS, (e) => [...knobs.motion.easing[e].$value] as CubicBezier) },
    knob: { $type: 'string', ...pick(Object.keys(ENUMS) as EnumKnob[], (e) => knobs.enum[e].$value) } as Primitives['knob'],
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
  for (const r of FONT_ROLES) {
    const v = k.type?.family?.[r]?.$value;
    if (!(typeof v === 'string' ? v : Array.isArray(v) && v.length > 0)) errors.push(`type.family.${r} must be a font family`);
    num(`type.weight.${r}`, k.type?.weight?.[r]?.$value, (n) => n >= 1 && n <= 1000, 'in [1, 1000]');
    const axes = k.type?.variation?.[r]?.$value;
    if (typeof axes !== 'string' || !VARIATION.test(axes))
      errors.push(`type.variation.${r} must be normal or a list like "wdth" 62, "opsz" 96 (got ${JSON.stringify(axes)})`);
  }
  dim('space.base', k.space?.base?.$value, positive, '> 0');
  num('space.density', k.space?.density?.$value, positive, '> 0');
  dim('shape.radius', k.shape?.radius?.$value, (n) => n >= 0, '≥ 0');
  dim('shape.border-width', k.shape?.['border-width']?.$value, (n) => n >= 0, '≥ 0');
  for (const f of FLUID_SIZES) {
    for (const b of FLUID_BANDS) {
      const v = k.fluid?.[f]?.[b]?.$value;
      if (!isFluidLength(v))
        errors.push(`fluid.${f}.${b} must be a length in vw/svh/rem, optionally with clamp/min/max/calc (got ${JSON.stringify(v)})`);
    }
  }
  for (const d of DURATIONS) {
    const v = k.motion?.duration?.[d]?.$value;
    if (!v || (v.unit !== 'ms' && v.unit !== 's')) errors.push(`motion.duration.${d} must be an ms or s duration`);
    else num(`motion.duration.${d}`, v.value, (n) => n >= 0, '≥ 0');
  }
  for (const e of EASINGS) {
    const v = k.motion?.easing?.[e]?.$value;
    const ok = Array.isArray(v) && v.length === 4 && v.every(Number.isFinite) && [v[0], v[2]].every((x) => x >= 0 && x <= 1);
    if (!ok) errors.push(`motion.easing.${e} must be a cubic Bézier [x1, y1, x2, y2] with x in [0, 1] (got ${JSON.stringify(v)})`);
  }
  for (const [name, allowed] of Object.entries(ENUMS) as [EnumKnob, readonly string[]][]) {
    const knob = k.enum?.[name];
    if (!allowed.includes(knob?.$value as string))
      errors.push(`enum.${name} must be one of ${allowed.join(' | ')} (got ${JSON.stringify(knob?.$value)})`);
    const listed = (knob?.$extensions?.['com.jarodtaylor.enum'] as string[] | undefined)?.join(' | ');
    if (listed !== allowed.join(' | '))
      errors.push(`enum.${name} $extensions.com.jarodtaylor.enum must list ${allowed.join(' | ')} (got ${listed ?? 'nothing'})`);
  }

  if (errors.length) throw new Error(`Invalid knobs:\n  - ${errors.join('\n  - ')}`);
}

const VARIATION = /^(normal|"[a-zA-Z0-9]{4}" -?\d*\.?\d+(, "[a-zA-Z0-9]{4}" -?\d*\.?\d+)*)$/;

/**
 * A fluid length: numbers in vw, svh or rem (unitless ones only as factors), joined by
 * + - * / inside clamp(), min(), max() or calc(). At least one number must carry a unit.
 */
function isFluidLength(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  const tokens = v.match(/\d*\.?\d+(?:vw|svh|rem)?|clamp\(|min\(|max\(|calc\(|[(),+\-*/]|\s+|./g) ?? [];
  let depth = 0;
  for (const t of tokens) {
    if (t.endsWith('(')) depth++;
    else if (t === ')') depth--;
    else if (!/^(\d*\.?\d+(vw|svh|rem)?|[,+\-*/]|\s+)$/.test(t) || (t === ',' && depth === 0)) return false;
    if (depth < 0) return false;
  }
  return depth === 0 && tokens.some((t) => /\d(vw|svh|rem)$/.test(t));
}

function mapScale<K extends string, V, R>(scale: Record<K, V>, fn: (v: V) => R): Record<K, Leaf<R>> {
  const out = {} as Record<K, Leaf<R>>;
  for (const key of Object.keys(scale) as K[]) out[key] = { $value: fn(scale[key]) };
  return out;
}

function pick<K extends string, R>(keys: readonly K[], fn: (key: K) => R): Record<K, Leaf<R>> {
  const out = {} as Record<K, Leaf<R>>;
  for (const key of keys) out[key] = { $value: fn(key) };
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
