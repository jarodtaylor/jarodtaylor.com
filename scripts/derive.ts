/**
 * derive(knobs) → primitive tokens (DTCG 2025.10).
 *
 * DTCG aliases can't do math, and neither can Figma, so every ramp and scale
 * is computed here, once, from the handful of knobs a brand authors. The
 * output is concrete values that Terrazzo compiles and Figma can import.
 *
 * Colour model: four required OKLCH ramps (neutral, accent, guide, redline) on one shared ladder.
 * Steps are fixed lightness, named L × 1000: 150, 175, … 975. A brand sets each ramp's hue, hue-shift
 * (hue drift per unit L), peak chroma, peak (the L where chroma peaks) and taper (how fast chroma
 * falls toward black and white). Every step is clamped into sRGB. A brand then picks which step
 * plays each colour role (color.role.text-muted → {color.neutral.750}); the semantic tier aliases
 * roles, so it stays shared while brands put a role at different lightness or on a different ramp.
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

export const RAMPS = ['neutral', 'accent', 'guide', 'redline'] as const;
export type RampName = (typeof RAMPS)[number];

/** One OKLCH ramp. Chroma peaks at `peak` lightness and falls to zero at black and white. */
interface RampKnobs {
  hue: Token<number>;
  /** Degrees of hue per unit of lightness away from `peak`, so a ramp can warm or cool as it lightens. */
  'hue-shift': Token<number>;
  chroma: Token<number>;
  peak: Token<number>;
  /** Exponent on the chroma falloff: 0 keeps chroma flat, 1 is linear, above 1 drains it faster. */
  taper: Token<number>;
}

/** Faces a brand loads. */
export const FONT_ROLES = ['display', 'text', 'label'] as const;
type FontRole = (typeof FONT_ROLES)[number];
/** Type roles: each face's role, plus `lead` (the tagline), which borrows the display or text face. */
export const TYPE_ROLES = [...FONT_ROLES, 'lead'] as const;
type TypeRole = (typeof TYPE_ROLES)[number];

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
    ramp: Record<RampName, RampKnobs>;
    /**
     * Color roles: each brand picks the ramp step that plays a role, as an alias like {color.neutral.750}.
     * The semantic tier aliases roles, so it stays shared even though brands put muted text (say) at
     * different lightness or source it from different ramps. Every brand must define the same role names.
     */
    role: Record<string, Token<string>>;
  };
  type: {
    base: Token<Dimension>;
    ratio: Token<number>;
    /** `lead` is an alias to the face it borrows: {font.family.display} or {font.family.text}. */
    family: Record<FontRole, Token<FontFamily>> & { lead: Token<string> };
    weight: Record<TypeRole, Token<number>>;
    /** A font-variation-settings value, e.g. `"wdth" 62`, or `normal`. */
    variation: Record<TypeRole, Token<string>>;
    /** Unitless line-height. */
    leading: Record<TypeRole, Token<number>>;
    /** letter-spacing in em, e.g. -0.02em, or 0. */
    tracking: Record<TypeRole, Token<string>>;
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
  color: { $type: 'color'; role: Record<string, Leaf<string>> } & Record<RampName, Record<RampStep, Leaf<OklchColor>>>;
  font: {
    family: { $type: 'fontFamily' } & Record<FontRole, Leaf<FontFamily>> & { lead: Leaf<string> };
    weight: { $type: 'fontWeight' } & Record<TypeRole, Leaf<number>>;
    variation: { $type: 'string' } & Record<TypeRole, Leaf<string>>;
    leading: { $type: 'number' } & Record<TypeRole, Leaf<number>>;
    tracking: { $type: 'string' } & Record<TypeRole, Leaf<string>>;
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

/**
 * Ramp step → OKLCH lightness. Steps are named by lightness × 1000 (`neutral.760` is L 0.76), every
 * 0.025 from 0.15 to 0.975: fine enough that any color a brand designs is within ΔE00 2 of a step.
 */
export const RAMP: Record<string, number> = Object.fromEntries(
  Array.from({ length: 34 }, (_, i) => [String(150 + 25 * i), round(0.15 + 0.025 * i, 3)]),
);
export type RampStep = string;

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
      ...(Object.fromEntries(RAMPS.map((name) => [name, ramp(color.ramp[name])])) as Record<RampName, Record<RampStep, Leaf<OklchColor>>>),
      role: Object.fromEntries(
        Object.entries(color.role)
          .filter(([name]) => !name.startsWith('$'))
          .map(([name, t]) => [name, { $value: t.$value }]),
      ),
    },
    font: {
      family: { $type: 'fontFamily', ...pick(FONT_ROLES, (r) => type.family[r].$value), lead: { $value: type.family.lead.$value } },
      weight: { $type: 'fontWeight', ...pick(TYPE_ROLES, (r) => type.weight[r].$value) },
      variation: { $type: 'string', ...pick(TYPE_ROLES, (r) => type.variation[r].$value) },
      leading: { $type: 'number', ...pick(TYPE_ROLES, (r) => type.leading[r].$value) },
      tracking: { $type: 'string', ...pick(TYPE_ROLES, (r) => type.tracking[r].$value) },
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

  for (const name of RAMPS) {
    const r = k.color?.ramp?.[name];
    num(`color.ramp.${name}.hue`, r?.hue?.$value, (n) => n >= 0 && n < 360, 'in [0, 360)');
    num(`color.ramp.${name}.hue-shift`, r?.['hue-shift']?.$value, (n) => Math.abs(n) <= 180, 'in [-180, 180]');
    num(`color.ramp.${name}.chroma`, r?.chroma?.$value, (n) => n >= 0 && n <= 0.4, 'in [0, 0.4]');
    num(`color.ramp.${name}.peak`, r?.peak?.$value, (n) => n > 0 && n < 1, 'in (0, 1)');
    num(`color.ramp.${name}.taper`, r?.taper?.$value, (n) => n >= 0 && n <= 4, 'in [0, 4]');
  }
  if (!k.color?.role || typeof k.color.role !== 'object') errors.push('color.role must be a group of role aliases');
  for (const [name, t] of Object.entries(k.color?.role ?? {})) {
    if (name.startsWith('$')) continue;
    const [, rampName, step] = /^\{color\.([\w-]+)\.(\d+)\}$/.exec(String(t?.$value)) ?? [];
    if (!RAMPS.includes(rampName as RampName) || !(step! in RAMP))
      errors.push(`color.role.${name} must alias a ramp step like {color.neutral.750} (got ${JSON.stringify(t?.$value)})`);
  }
  dim('type.base', k.type?.base?.$value, positive, '> 0');
  num('type.ratio', k.type?.ratio?.$value, (n) => n > 1, '> 1');
  for (const r of FONT_ROLES) {
    const v = k.type?.family?.[r]?.$value;
    if (!(typeof v === 'string' ? v : Array.isArray(v) && v.length > 0)) errors.push(`type.family.${r} must be a font family`);
  }
  if (!/^\{font\.family\.(display|text)\}$/.test(String(k.type?.family?.lead?.$value)))
    errors.push(`type.family.lead must be {font.family.display} or {font.family.text} (got ${JSON.stringify(k.type?.family?.lead?.$value)})`);
  for (const r of TYPE_ROLES) {
    num(`type.leading.${r}`, k.type?.leading?.[r]?.$value, (n) => n > 0 && n <= 3, 'in (0, 3]');
    const tracking = k.type?.tracking?.[r]?.$value;
    if (typeof tracking !== 'string' || !/^(0|-?\d*\.?\d+em)$/.test(tracking))
      errors.push(`type.tracking.${r} must be 0 or an em length like -0.02em (got ${JSON.stringify(tracking)})`);
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
 * Chroma falls off linearly (to the power `taper`) from `peak` to zero at black and white, where sRGB
 * has no room for it anyway; the hue drifts by `hue-shift` per unit of lightness away from `peak`.
 */
function ramp(knobs: RampKnobs): Record<RampStep, Leaf<OklchColor>> {
  const hue = knobs.hue.$value;
  const shift = knobs['hue-shift'].$value;
  const chroma = knobs.chroma.$value;
  const peak = knobs.peak.$value;
  const taper = knobs.taper.$value;
  const out = {} as Record<RampStep, Leaf<OklchColor>>;
  for (const [step, l] of Object.entries(RAMP)) {
    const falloff = l > peak ? (1 - l) / (1 - peak) : l / peak;
    const h = (((hue + shift * (l - peak)) % 360) + 360) % 360;
    out[step] = { $value: toSrgbGamut(l, chroma * falloff ** taper, h) };
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
