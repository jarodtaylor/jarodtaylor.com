# Remix smoke test: three brands from one markup

The master plan is in `docs/PLAN.md` and was not changed. This file covers Phase 1, step 4.

## Context

- Jarod locked three brands on 2026-10-24:
  - **Backstage-lite** is the default (`prototypes/r6-backstage/`).
  - **Building blocks** (`r6-blocks/`) and **Clean and sharp** (`r6-clean/`) are Remix brands.
- Each prototype has its own markup. Remix needs **one** markup, restyled only by tokens.
- Per the 2026-10-14 decision, the winner is rebuilt on the real token pipeline in `src/`, and that rebuild **is** the smoke test. So there is no merged throwaway prototype.
- Scope: the header, the info strip and the hero (first viewport) at 390, 1440 and 2560. Sections below the fold come later.
- **Done when:** `/?brand=default|blocks|clean` matches each approved prototype, and every gate passes:
  - markup invariance
  - contrast
  - tokens-only lint
  - a11y
  - Lighthouse budget

## Decisions this plan makes (logged in DECISIONS.md on approval)

1. **Superset figure DOM.** All three figures are always in the page, and the knob `--hero-figure: construction | isometric | lattice` shows one of them through a container style query.
   - The three figures are `svg.mono`, `svg.build` and `canvas.field`.
   - This keeps each approved look pixel-faithful. Redrawing them as one shared SVG would be a redesign and need another review round.
   - Hidden figures cost only a few KB of SVG.
2. **Every figure is `aria-hidden`.** The `h1` carries the name, because ARIA is DOM and has to be the same in every brand.
3. **Peek works in all brands** (Jarod, 2026-10-24).
   - The readouts show each brand's own tokens.
   - The readout values are written by JS, so they would change the DOM per brand. They live under `[data-remix-ui]`, which the invariance test already strips, and the Colophon says so.
4. **Runtime state goes on `<html>`, never in `<body>`.** That covers `data-peek-state`, `.intro`, `.building` and `.settling`.
5. **One breakpoint set: 48rem, 64rem and 112rem.**
   - Media queries can't read tokens, so each brand's layout differences become enum knobs read inside these breakpoints.
   - Blocks used 60rem and Clean used 720/1100/1800px. Both get re-fitted to this set.
6. **Enum knobs**, each with `$extensions.com.jarodtaylor.enum`, validated in `derive()`:
   - `hero-figure`: `construction | isometric | lattice`
   - `hero-layout`: `stack` (Backstage, Blocks) | `name-over-details` (Clean)
   - `hero-intro`: `peek | assemble | none`
   - `nav-mode`: `toggle | wrap`. There is one phone nav element, a `popover` with a button. `wrap` hides the button and lays the list out as a second row.
   - `hero-cue`: `none | icon | labelled`
   - `talk-style`: `pill-fill | outline`
   - `label-case`: `upper | none`
   - Layout reflow through enum knobs is the v1 mechanism the master plan names. It doesn't contradict the "hero layout variants are later" decision, because that decision meant layout variants that change the DOM.
7. **The DOM always carries the superset.** That means:
   - the tagline accent `<span>`
   - the name split into two spans
   - the status dot as a real span
   - the `.details` wrapper
   - the cue link
   - the Peek toggle, plus the `.cols` / `.dims` / `dl.spec` markup
8. **Fonts have three roles: `display`, `text` and `label`.**
   - The current `body/display/mono` roles are renamed.
   - Each role gets a family, a weight, and one `font-variation-settings` token. The default value is `normal`, and it carries axes such as `wdth` and `opsz`.
   - The default brand's fonts (Archivo, Schibsted Grotesk, Martian Mono) are self-hosted, subset and preloaded.
   - The Blocks fonts (Bricolage, Atkinson Next) and the Clean fonts (Funnel Display and Sans) are injected lazily as `<link>`s when that brand turns on. The invariance test already excludes those links.
9. **One sessionStorage key (`jt-intro`) and one reduced-motion policy.**
   - With reduced motion there is no intro and no ambient motion: the pen lap, the hover pull-apart and the ring pulse are all off.
   - Peek still works with reduced motion, as an instant cut.
10. **The placeholder `alt` brand is replaced** by `blocks` and `clean`.

## Build steps (each step ends green on `pnpm test && pnpm typecheck && pnpm check`)

**Step 0: Fable cold-read gate**
- This is the adversarial gate that was due before the brand lock.
- A `model: fable` subagent reads this plan, the three prototypes and the token rules, then returns blocking risks only.
- Any plan changes it causes come back to Jarod before Step 1.

**Step 1: Extend `derive()` and the knob schema** (Opus subagent; `scripts/derive.ts`, `derive.test.ts`)
- Map every prototype color to the nearest ramp step first.
  - If lime, cobalt or apricot miss, add accent and neutral **lightness anchor** knobs.
  - Add the extra roles the brands need, e.g. Blocks' paper side faces and Backstage's guide color, as `figure.*` semantic roles.
- Fluid sizing is the largest hidden scope.
  - Stylelint allows only `%` and `fr` in component CSS, so values like `min(12.5vw, 21svh)` need knobs (display vw share, svh cap, figure share). `derive()` turns those knobs into `clamp()`/`min()` primitives, and they surface as `hero.*` semantic tokens.
  - Unit tests check that the output is deterministic and monotonic.
- Add the font roles, axes and enum validation.

**Step 2: Three knob files and the resolver** (`tokens/knobs/{default,blocks,clean}.json`, `tokens/resolver.json`)
- Delete `alt.json`.
- Run `pnpm tokens`.
- `check:contrast` runs **before any styling**, on the risky pairs, e.g. `#a9bcec` on `#1633b1` and apricot text on pine. If a pair fails, fix the knob, and tell Jarod if the change is visible.

**Step 3: Semantic and component tokens** (`tokens/semantic/*.json`, plus a new `tokens/component/{header,hero,figure}.json`)
- These are aliases only.

**Step 4: Components, default brand only** (Opus subagent)
- Build:
  - `src/components/Header/`: mark, nav and phone popover, Peek toggle, Let's talk
  - `InfoStrip/`
  - `Hero/`: name, tagline, bio, socials, cue and the three figures
  - `Peek/`: the spec layer
- Commit the untracked `src/assets/jt-logo-icon.svg` as the single source of the monogram paths.
- Rewrite `src/pages/index.astro` to use these components.
- Reference: `prototypes/r6-backstage/` and its `shot-1440.png`. It must match at 390, 1440 and 2560.

**Step 5: Hero JS** (`src/components/Hero/hero.ts`, one small island or a plain module script)
- It reads `--hero-figure` and `--hero-intro` from computed style and dynamically imports one module: `construction.ts` (pen, bleed lines, vertex timing), `isometric.ts` (build skip and finish) or `lattice.ts` (the canvas).
- A MutationObserver on `html[data-brand]` tears down the running module and starts the right one.
- Peek's state machine is shared by all brands.
- Budget: ≤ 15 KB gzip in total, and no-JS shows the full content.

**Step 6: Add the `blocks` brand.** This is the first real Remix test.
- Only knob values and enum-scoped CSS are allowed.
- If something can't be done that way, **stop**, and fix the markup or tokens rather than adding per-brand CSS.

**Step 7: Add the `clean` brand.** Same rules as Step 6.

**Step 8: Wrap up**
- Run a finish review against all three prototypes, at 390, 1440 and 2560.
- Update `PRODUCT.md` and `DECISIONS.md`.
- Leave the Colophon note on the `[data-remix-ui]` exclusions as a to-do.

The brand switcher stays as the existing `?brand=` picker in `lab.astro`. The real Remix UI (Q4) is still Phase 3.

## Files touched

- `scripts/derive.ts`, `scripts/derive.test.ts`
- `tokens/knobs/*`, `tokens/resolver.json`, `tokens/semantic/*`, `tokens/component/*`
- `src/components/{Header,InfoStrip,Hero,Peek}/`, `src/pages/index.astro`, `src/layouts/Base.astro` (font preload and lazy font links)
- `public/fonts/`
- `src/assets/jt-logo-icon.svg`
- Not committed: `.impeccable/questions/`.

## Branch

Use a new branch, `feat/remix-hero`, cut from `feat/design-direction` so the prototypes stay as reference. Pushes and PRs go through Jarod.

## Verification

- All gates pass: `pnpm test && pnpm typecheck && pnpm check`, which covers invariance, contrast, tokens-only, slop, a11y and Lighthouse.
- Playwright screenshots of each brand × 390/1440/2560, put side by side with each prototype's screenshots for Jarod.
- Manual checks:
  - switching brands live in the page (MutationObserver re-init)
  - `?intro`
  - reduced motion
  - JS disabled
  - keyboard only, including the phone popover nav and the Peek toggle
- Bundle check: the hero JS stays within budget, and each brand's figure module loads only when that brand is active.

## CE checkpoint

- `ce-worktree` isn't needed because a plain branch is enough.
- `ce-code-review` fits at the PR.
- Nothing else fits.

## Model routing

- Main loop: Opus.
- Steps 1, 4 and 5 go to Opus subagents, because correctness matters most there.
- Steps 2–3 go to Sonnet.
- Step 0 goes to Fable, for the gate.
