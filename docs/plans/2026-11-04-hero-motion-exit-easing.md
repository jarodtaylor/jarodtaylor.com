# Hero motion: one in-out easing for every Peek fade-out and label retract

- **Status**: TODO
- **Commit**: a6dd687
- **Severity**: HIGH (Blocks' Peek leave pops), MEDIUM (labels hang, then whip)
- **Category**: Easing & duration
- **Bucket**: hero fixes PR (`feat/hero-passes`). The mechanism is brand-agnostic; Blocks' value rides along
- **Estimated scope**: 3 knob files, `scripts/derive.ts`, `scripts/derive.test.ts`, `tokens/semantic/motion.json`, `src/components/Peek/Peek.css`. About 15 changed lines
- **Depends on**: `2026-11-04-hero-motion-part-release.md` must land first, or in the same PR. It removes the last other use of `--motion-easing-in`, which this plan retires.

## Problem

Three exits in the Peek layer use the wrong curve. All three break a rule this repo already wrote down:

- `docs/DECISIONS.md`, 2026-10-26: "**Peek exit fixed:** the layer faded on the brand's out-easing (expo), so it was gone in ~200 ms and read as a pop. It now fades on the draw curve…"
- `tasks/lessons.md`, 2026-10-26: "An exit fade on an expo-out curve reads as a pop… Fades out use an in-out curve."

**1. Blocks' Peek leave pops (the 2026-10-26 fix never held in Blocks).** The layer fade reads the brand's *draw* curve:

```css
/* src/components/Peek/Peek.css:64-68 — current */
:root[data-peek-state="leaving"] {
  --_layer: calc(0);

  transition: --_layer var(--_peek-leave) var(--figure-draw-easing) calc(var(--_beat) * 0.6);
}
```

`--figure-draw-easing` aliases `motion.easing.draw`. That's an in-out curve in clean and backstage (`"0.65, 0, 0.25, 1"`). Blocks' draw has been an **out** curve since 2026-10-24 (`tokens/knobs/blocks.json:217`: `"0.22, 0.7, 0.2, 1"`, 71% of the change in the first quarter; git log shows it unchanged since commit a27400d). So moving the fade onto draw on 2026-10-26 fixed clean and backstage but never fixed Blocks, which still has the pop that fix was meant to remove. Measured in Chromium, Blocks, `--_layer` after pressing Peek off (the fade starts after its 60 ms delay):

| ms | 0 | 69 | 136 | 186 | 253 | 303 |
|---|---|---|---|---|---|---|
| `--_layer` | 1.00 | 0.96 | **0.56** | 0.33 | 0.17 | 0.10 |

The draw curve is right for Blocks' *lines* (the rail, the columns), so the fix is not to change Blocks' draw. Fades need a curve of their own.

**2. Labels hang, then whip.** The labels retract into their boxes, and the name's `cap` / `baseline` labels fade, on `--motion-easing-in`. That curve is `"0.55, 0, 0.75, 0"` in clean and backstage, `"0.5, 0, 0.75, 0"` in Blocks: 6% of the change at half-time.

```css
/* src/components/Peek/Peek.css:209-213 — current */
/* Leaving, the labels retract into their box edges first (an ease-in, quick), then the lines fade. Text never
   fades through its own background: a half-transparent label reads as mud. */
:root[data-peek-state="leaving"] [data-peek]::after {
  transition: --_lab calc(var(--_peek-leave) * 0.5) var(--motion-easing-in);
}

/* src/components/Peek/Peek.css:391-394 — current */
:root[data-peek-state="leaving"] .dim b {
  opacity: 0;
  transition: opacity calc(var(--_peek-leave) * 0.4) var(--motion-easing-in);
}
```

Measured in backstage, after pressing Peek off: the tagline label's `--_lab` reads 1.00 → 0.98 → 0.92 at 0 / 109 / 159 ms, then 0.74 → 0.12 between 210 and 276 ms. The label sits still for about 150 ms, then snaps into the edge in the last 60 ms. The `cap` label's opacity likewise holds near 1 for 110 ms, then drops to 0 by 276 ms. Ease-in delays the very moment the eye is on. A fade-out on it breaks the lesson above.

## Target

One new easing step, `in-out`, replaces the unused-after-this-plan `in` step. Every brand gets the curve clean and backstage already use for their approved layer fade (`0.65, 0, 0.25, 1`). Clean's and backstage's layer fade therefore stays exactly as it is today. Blocks' fade is fixed, and the labels move on a curve that starts moving at once and lands softly.

```jsonc
// target — tokens/knobs/{clean,backstage,blocks}.json, motion.easing (line 216 replaced)
"in-out": { "$type": "string", "$value": "0.65, 0, 0.25, 1" },
```

```css
/* target — src/components/Peek/Peek.css */
:root[data-peek-state="leaving"] {
  --_layer: calc(0);

  transition: --_layer var(--_peek-leave) var(--motion-easing-in-out) calc(var(--_beat) * 0.6);
}

/* Leaving, the labels retract into their box edges first (in-out, quick), then the lines fade. Text never
   fades through its own background: a half-transparent label reads as mud. */
:root[data-peek-state="leaving"] [data-peek]::after {
  transition: --_lab calc(var(--_peek-leave) * 0.5) var(--motion-easing-in-out);
}

:root[data-peek-state="leaving"] .dim b {
  opacity: 0;
  transition: opacity calc(var(--_peek-leave) * 0.4) var(--motion-easing-in-out);
}
```

Line retracts that use `--figure-draw-easing` stay as they are: `Peek.css:105` (columns), `Peek.css:388` (dim rules) and `Hero.css:661` (construction guides). They are lines moving along their length, not fades, and the draw curve is each brand's character for lines.

## Repo conventions to follow

- **Knobs are Figma-importable** (`AGENTS.md`, Token pipeline): an easing knob is `{ "$type": "string", "$value": "x1, y1, x2, y2" }`, with no `$description`. The docs for knobs live in `scripts/derive.ts`.
- `scripts/derive.ts:133` is the **single list** of easing names. `derive()` emits each one (`:348`), and validation checks each one in every brand (`:422-427`). The semantic tier aliases each one by name (`tokens/semantic/motion.json:19-33`). Terrazzo emits `--easing-<name>` (primitive) and `--motion-easing-<name>` (semantic). Component CSS reads only the semantic `--motion-easing-*` (tokens-only rule).
- **After a rename, sweep the leftovers in the same commit** (`tasks/lessons.md`, 2026-10-28): doc comments, tests, `docs/DECISIONS.md` paths, unused tokens.
- Exemplar of the same alias shape: `tokens/semantic/motion.json:27-29` (`"draw": { "$value": "{easing.draw}" }`).

## Steps

1. **Check the dependency.** Run `grep -rn "motion-easing-in\b" src`. Only `src/components/Peek/Peek.css:212` and `:393` may match. If `src/components/Hero/Hero.css:851` still matches, STOP: land `2026-11-04-hero-motion-part-release.md` first.
2. **`scripts/derive.ts:133`**: change `export const EASINGS = ['out', 'in', 'draw', 'pop'] as const;` to `export const EASINGS = ['out', 'in-out', 'draw', 'pop'] as const;`. Directly above it, add a one-line doc comment in the file's voice: `/** in-out is for fades out and retracts (an exit on an out curve reads as a pop); draw is each brand's curve for lines; pop is reserved for spec marks struck by the pen, never UI. */`
3. **Knob files**: in each of `tokens/knobs/clean.json`, `tokens/knobs/backstage.json` and `tokens/knobs/blocks.json`, replace line 216 (the `"in": …` easing) with `"in-out": { "$type": "string", "$value": "0.65, 0, 0.25, 1" },`. Same value in all three.
4. **`tokens/semantic/motion.json:24-26`**: replace the `"in": { "$value": "{easing.in}" }` entry with `"in-out": { "$value": "{easing.in-out}" }`.
5. **`src/components/Peek/Peek.css`**: make the three edits in Target. Line 67: `var(--figure-draw-easing)` → `var(--motion-easing-in-out)`. Line 212: `var(--motion-easing-in)` → `var(--motion-easing-in-out)`, and in the comment at line 209 change "(an ease-in, quick)" to "(in-out, quick)". Line 393: `var(--motion-easing-in)` → `var(--motion-easing-in-out)`. Leave the comment at `Peek.css:98-99` and the other `--figure-draw-easing` uses alone.
6. **Tests, `scripts/derive.test.ts`**: nothing references `easing.in` today (line 79 checks `out`, line 229 checks `pop`). Add one assertion next to line 79: `expect(tokens.easing['in-out'].$value.join(', ')).toBe(knobs.motion.easing['in-out'].$value);`.
7. **Regenerate and sweep**: run `pnpm tokens`. `tokens/generated/*.json` changes (the `in` step becomes `in-out`). Commit those files, because `check:tokens-fresh` compares them. Then run `grep -rnE "easing[.-]in\b|easing\.in\"|'in'" scripts tokens src .storybook AGENTS.md docs/WORKFLOW.md`. It must return nothing that refers to the old step. Ignore `src/styles/tokens.css` (gitignored build output).
8. **Log it**: add a row to `docs/DECISIONS.md` (top of the decisions table, today's date): "**Easing `in` → `in-out`** (`0.65, 0, 0.25, 1`, every brand). Peek's fades and label retracts use it; draw stays each brand's curve for lines. Blocks' draw is an out curve, so the 2026-10-26 Peek-exit fix (fade on draw) never held in Blocks. Figma: the `motion/easing/in` variable is renamed `motion/easing/in-out`."

## Boundaries

- Do NOT change any `draw`, `out` or `pop` value in any brand.
- Do NOT change any duration or delay.
- Do NOT touch the line retracts (`Peek.css:105`, `Peek.css:388`, `Hero.css:661`) or anything in `src/components/Hero/` (that's the part-release plan).
- Do NOT add a component-tier token for this. Peek.css already reads `--motion-easing-*` directly, as at line 212.
- Do NOT hand-edit `tokens/generated/` or `src/styles/tokens.css`. Regenerate.
- If any line quoted above doesn't match (drift since a6dd687), STOP and report.

## Verification

- **Mechanical**: `pnpm test` (derive tests, including the new assertion), `pnpm typecheck`, `pnpm check:tokens-fresh`, `pnpm check:tokens-only`, then `pnpm build && pnpm check:hero-runtime && pnpm check:markup-invariance`. Everything passes. `grep -c "motion-easing-in-out" src/styles/tokens.css` is 3 or more (one per brand). `grep -c "motion-easing-in:" src/styles/tokens.css` is 0.
- **Feel check** (`pnpm dev`, 1440 wide, each of `?brand=clean`, `?brand=backstage`, `?brand=blocks`):
  - Press Peek, let it draw, press it again. The labels start sliding back into their boxes **at once** (no stall) and land softly. The layer then fades smoothly and evenly. In **Blocks** it no longer drops by half in the first ~70 ms.
  - Clean and backstage: the layer fade looks the same as before this change (same curve as their draw). Only the labels' retract differs.
  - DevTools Animations panel at 10%, Blocks: the `--_layer` fade's opacity drops evenly from the start, with no cliff at the start. The `cap` / `baseline` labels begin fading on the first frame.
  - Reduced motion (Rendering panel): Peek still opens and closes (the global reset in `src/styles/reset.css` makes it a cut, as today).
- **Done when**: no `motion-easing-in` remains anywhere, the three Peek exits read `--motion-easing-in-out`, and the Blocks leave no longer pops at 10% playback.
