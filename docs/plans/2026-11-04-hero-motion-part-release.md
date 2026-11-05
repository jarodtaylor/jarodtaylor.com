# Hero motion: the isometric parts snap home on an out curve, not ease-in

- **Status**: TODO
- **Commit**: a6dd687
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Bucket**: hero fixes PR (`feat/hero-passes`). The CSS is brand-agnostic, and only brands with `--hero-figure: isometric` (today Blocks) show it. The Blocks rethink may move or resize the figure, but shouldn't need to touch this rule.
- **Estimated scope**: 1 line (plus a comment word) in 1 CSS file
- **Blocks**: `2026-11-04-hero-motion-exit-easing.md` (that plan retires `--motion-easing-in` and needs this one landed first)

## Problem

Hovering the isometric figure eases its two parts a quarter edge apart along their rail. Leaving it should "snap back home" (the comment's words), but the return runs on ease-in:

```css
/* src/components/Hero/Hero.css:842-858 — current */
/* Hover: the parts ease a quarter edge apart along their rail (--_pull, set on each part), and snap back home.
   The figure is inert (pointer-events: none); only the isometric parts take the pointer back, so hidden figures
   and the empty field stay click-through. */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .build .assembly {
    pointer-events: auto;
  }

  .part {
    transition: translate calc(var(--_beat) * 2.4) var(--motion-easing-in);
  }

  .figure:hover .part {
    transition: translate calc(var(--_beat) * 7) var(--motion-easing-out);
    translate: var(--_pull);
  }
}
```

`--motion-easing-in` is `"0.5, 0, 0.75, 0"` in Blocks: 6% of the travel at half-time. Measured in Chromium, Blocks, 1440×900: hover the T part for 1.2 s, move the pointer away, then sample `.part-t`'s `translate` (the pull is `-10.28px -17.8px`):

| ms after leaving | 0 | 47 | 81 | 131 | 164 | 214 | 247 |
|---|---|---|---|---|---|---|---|
| x px | -10.28 | -10.25 | -10.09 | -9.28 | -7.93 | -3.51 | 0 |

The parts sit still for about 100 ms after the pointer leaves, then rush home in the last 80 ms. That reads as lag, then a lurch, not a snap. Ease-in on UI motion delays the moment the user is watching. The hover's response should start on the first frame.

The timing is already asymmetric (a slow 700 ms ease apart, a quick 240 ms return). That's right and stays: the deliberate gesture is slow, the system's answer is fast. Only the curve is wrong.

## Target

```css
/* target — src/components/Hero/Hero.css, inside the same @media block */
.part {
  transition: translate calc(var(--_beat) * 2.4) var(--motion-easing-out);
}
```

`--motion-easing-out` is `"0.16, 1, 0.3, 1"` in every brand: about 83% of the travel lands in the first quarter (60 ms), then it settles. The parts visibly start home the frame the pointer leaves, and land without a jolt. Same 240 ms duration (`--_beat` × 2.4, with `--_beat` = 100 ms).

## Repo conventions to follow

- Component CSS reads only semantic or component custom properties. `--motion-easing-out` is semantic and already used on the line below (`.figure:hover .part`). Exemplar: `src/components/Hero/Hero.css:855`.
- Hover motion is gated by `@media (hover: hover) and (prefers-reduced-motion: no-preference)`. Keep the rule inside that block.

## Steps

1. In `src/components/Hero/Hero.css` at line 851, change `var(--motion-easing-in)` to `var(--motion-easing-out)`. Nothing else on the line changes.
2. The comment at line 842 already says "snap back home". Leave it.
3. Run `grep -rn "motion-easing-in\b" src/components/Hero`. It must return nothing.

## Boundaries

- Do NOT change the hover-in transition (line 855), the duration, `--_pull`, or the media query.
- Do NOT touch the assemble intro animations (`Hero.css:860-919`).
- Do NOT edit tokens or knobs. The exit-easing plan owns retiring `easing.in`.
- If line 851 doesn't read as quoted (drift since a6dd687), STOP and report.

## Verification

- **Mechanical**: `pnpm check:tokens-only && pnpm typecheck && pnpm build && pnpm check:hero-runtime`. All pass.
- **Feel check** (`pnpm dev`, `/?brand=blocks`, 1440 wide, mouse):
  - Hover the figure until the parts have eased apart, then move off. The parts start back **immediately** and settle home in about a quarter second, with no hang.
  - Flick across the figure quickly (in and out under 300 ms). The parts reverse smoothly from wherever they are, because transitions retarget. No jump.
  - DevTools Animations panel at 10%: on hover-out, the `translate` transition's curve is front-loaded (most of the move early), not back-loaded.
  - Touch device or touch emulation: no hover motion at all (the `(hover: hover)` gate, unchanged).
- **Done when**: `Hero.css` has no `--motion-easing-in`, and the 10% playback shows the return starting on the first frame.
