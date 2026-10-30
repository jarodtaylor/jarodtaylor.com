# jarodtaylor.com

Personal site and portfolio. The signature feature is **Remix**: one set of markup, many brands, driven only by design tokens. The full plan is in `docs/PLAN.md`. Read `tasks/lessons.md` at session start.

This file is the canonical instructions for every agent, in any harness. It is self-contained: don't rely on includes or on anything outside the repo.

## Commands (pnpm, Node ≥ 24)

| Command | What it does |
|---|---|
| `pnpm dev` | `pnpm tokens`, then the Astro dev server |
| `pnpm build` | `pnpm tokens`, then `astro build` → `dist/` |
| `pnpm tokens` | `scripts/build-tokens.ts` (knobs → `tokens/generated/`), then `tz build` (→ `src/styles/tokens.css`, `public/tokens/<brand>.json`) |
| `pnpm test` | Vitest: every `*.test.ts` (`scripts/` and `src/lib/`) |
| `pnpm typecheck` | `astro check` (covers `.astro`, `.ts`, `.tsx`) |
| `pnpm check` | Every guardrail below, fast first (builds in the middle, Lighthouse last). CI runs them as separate steps (`.github/workflows/ci.yml`) |
| `pnpm check:tokens-fresh` | Reruns `pnpm tokens`; fails if `tokens/generated/` changed (content compare, not git) |
| `pnpm check:contrast` | WCAG 2.2 AA for every brand × `surface.<role>.*` pair (`scripts/contrast.ts`). Needs `pnpm tokens` first |
| `pnpm check:tokens-only` | Stylelint (`stylelint.config.js` + `scripts/stylelint-plugin-tokens.ts`): no raw values, primitives or brand keys in CSS |
| `pnpm check:slop` | `impeccable detect --no-design-system src/` |
| `pnpm check:markup-invariance` / `check:a11y` | Playwright + axe on every page × brand in `dist/` (`tests/*.e2e.ts`). Needs `pnpm build` and `pnpm exec playwright install chromium` |
| `pnpm lighthouse` | Lighthouse CI on `dist/` (`lighthouserc.json`), local only: no upload (CI uploads to temporary public storage). Budgets warn; only a11y < 0.9 or CLS > 0.1 fail. PR label `perf-tradeoff` downgrades those too |

Run `pnpm test && pnpm typecheck && pnpm check` before committing.

## Engineering rules

- **Branches and PRs.** Never commit to `main`. Work on a feature branch named `<type>/<short-description>` (e.g. `feat/storybook`, `fix/peek-exit`). Everything reaches `main` through a PR.
- **Commit messages say why**, not what. Stage and commit only the files your change owns.
- **Read before editing.** No change without reading the code it touches and the patterns around it.
- **Simplicity first.** The smallest change that solves the problem; touch only what's necessary. Prefer the patterns already in the repo over "better" ones.
- **Root causes, not band-aids.** No temporary fixes. If a fix feels hacky, step back and find the clean one.
- **Verify before claiming done.** Run the tests, typecheck and the relevant checks; compare behaviour against `main` when it matters. Report failures as they are.
- **Stop and re-plan when an approach fails.** After two failed fixes for the same problem, stop patching, name the assumption both relied on, and check it.
- **Verify APIs against current docs.** Don't trust training data for Astro, Terrazzo, DTCG, Cloudflare or any library. Look up the current docs before using an API or config option.
- **No calendar estimates.** Phase work by scope and exit criteria, never by days or weeks.
- **Log decisions.** Every decision, open question and to-do goes in `docs/DECISIONS.md` the moment it happens; close a question with the date it was answered.
- **Learn from corrections.** After any correction, add the pattern to `tasks/lessons.md` so it doesn't recur.

## Architecture

- **Astro 7**, static output. Pages and layouts are `.astro`. Design-system components are React `.tsx` in `src/components/<Name>/`, rendered on the server. No `client:*` unless a component truly needs JS.
- **Content**: collections in `src/content.config.ts`. Posts are MDX in `src/content/posts/`; everything else is a JSON array in `src/content/data/`.
- **Hosting**: Cloudflare Workers static assets (`wrangler.jsonc`, no Worker script).

## Token pipeline

```
tokens/knobs/<brand>.json      TIER 1   the only thing a brand authors (DTCG, Figma-importable)
  └─ scripts/derive.ts         pure derive(knobs) → primitives; no Node APIs (it will run in the browser)
tokens/generated/<brand>.json  TIER 1b  derived primitives, committed, never hand-edited
tokens/semantic/*.json         TIER 2   aliases only: surface roles, graphic, space, type, shape, motion, layout, choice
tokens/component/*.json        TIER 3   aliases only: what components consume
tokens/resolver.json           DTCG Resolver 2025.10; the "brand" modifier is the single list of brands
terrazzo.config.ts             → src/styles/tokens.css + public/tokens/<brand>.json
```

- **Add a brand**: create `tokens/knobs/<name>.json` and add a `<name>` context to the `brand` modifier in `tokens/resolver.json`. The build fails if the two lists disagree.
- **Colour ramps**: four required ramps (`neutral`, `accent`, `guide`, `redline`) on one fixed-lightness ladder. Steps are named L×1000, `150`–`975` every 25 (`color.neutral.750` is L 0.75), plus a white endpoint `1000` (L 0.9999, `#ffffff`) for light brands' grounds. A brand sets 5 knobs per ramp in `color.ramp.<name>`: `hue`, `hue-shift`, `chroma`, `peak` and `taper`.
- **Knobs are Figma-importable** (Figma authors knobs; code owns derive()). Every token has its own `$type`, only from Figma's DTCG import set: dimensions in px (derive emits base sizes in rem), durations in s (emitted in ms), weights as `number`, `fontFamily` as one name (the rest of the stack is the `type.fallback.<role>` string), everything else as `string` (role picks, easings `"x1, y1, x2, y2"`, enums, fluid sizes, axes). No `$description`s in knob files: Figma export drops them, so docs live in `derive.ts`.
- **Colour roles**: a brand picks the step for each role in `color.role`, as a string (`"text-muted": { "$type": "string", "$value": "neutral.750" }`). derive() emits it as an alias (`--color-role-text-muted: var(--color-neutral-750)`). The semantic tier aliases `{color.role.*}`, never ramp steps, so it stays shared. `pnpm tokens` fails, naming the brand and the role, if a pick isn't a real step or a brand lacks a role another brand has.
- **Brands**: `backstage` (Backstage-lite), `blocks` (light) and `clean`, the default (`tokens/resolver.json`). Their ramps were fitted to the approved prototypes. `scripts/fixtures/prototype-colors.json` holds the prototype colours their roles must match within ΔE00 2 (`derive.test.ts`); AA wins over that match.
- Aliases compile to `var(--…)` references, not flattened values, so setting a primitive at runtime cascades through the semantic and component tiers. Remix v2 depends on this.
- `derive()` clamps every color into sRGB. That keeps Terrazzo from emitting wide-gamut `@media` duplicates and makes the `hex` fallback exact.
- **Resolved per-brand JSON** for checkers, exports and the "{n} tokens changed" readout: `public/tokens/<brand>.json` (shipped at `dist/tokens/<brand>.json`). It's a flat map of `token.id → { $type, $value, aliasOf? }`. Colors carry `components` (OKLCH) and `hex`. For contrast, each `surface.<role>` group (`default | raised | inverse | accent | annotation`) holds `bg` plus the foregrounds used on it (`text`, `text-muted`, `link`, `border`, `focus`, …). `check:contrast` derives its pairs from this naming: every sibling of `bg` is text at 4.5:1, except `border` (decorative, skipped) and `focus` (3:1).
- `src/styles/tokens.css` and `public/tokens/` are build output and gitignored.

## Token rules (non-negotiable)

- Components consume **only** semantic or component custom properties (`--surface-*`, `--space-*`, `--type-*`, `--shape-*`, `--button-*`, `--card-*`, `--section-*`, …). Never primitives (`--color-*`, `--size-*`, `--font-*`, `--knob-*`), never raw colors, lengths or font names.
- Private per-component props use the `--_` prefix (e.g. `--_bg`) and may only be assigned from token vars, or `calc`/`clamp`/`min`/`max` math over token vars and unitless numbers (e.g. `calc(var(--motion-duration-base) * 0.15)`).
- **Never key CSS on a brand name.** No `[data-brand="…"]` selectors outside the generated `tokens.css`. Brands differ only through tokens.
- Brands author knobs only. Semantic and component files are aliases only: no literal values.
- Discrete layout and decoration choices are enumerated knobs (e.g. `--section-decoration: rules | none`) that component CSS reads with `@container style(...)`. A style query only styles descendants of the element carrying the property.
- DOM order never changes between brands.

## CSS and view-source rules

- Plain CSS, co-located: `Button.tsx` imports `./Button.css`. Wrap component CSS in `@layer components { … }`. No Tailwind, no CSS Modules, no scoped `<style>` in `.astro` files.
- Layer order lives in `src/styles/layers.css` (`reset, tokens, base, components, utilities`). `Base.astro` inlines it at the top of `<head>` because bundle order isn't guaranteed. Don't redeclare it anywhere else.
- `astro.config.ts` keeps output readable: `compressHTML: false`, `build.inlineStylesheets: 'never'`, `vite.build.cssMinify: false`. Don't undo these.
- Brand switching: `?brand=<name>` sets `data-brand` on `<html>` before first paint (inline script in `Base.astro`).

## Three brands

`clean` leads: every PR brings it to approval quality. `backstage` and `blocks` ride along with considered values taken from their brand sheets, never placeholders. Each section's plan answers "where would the other brands lay this out differently?" and logs the answer in `docs/DECISIONS.md`. The alt brands get dedicated passes before v0 launch and at the start of Phase 3.

## Workflow

`docs/WORKFLOW.md` is the map of the default loop: each step, what it produces, who owns colour, type, layout and motion, and how design-tool output is turned into tokens. Read it before starting any unit of work. Every step can be done by hand; skills (Compound Engineering, Impeccable, Emil Kowalski's) automate them where installed. Review roles any model can perform live in `docs/review/`.

## Public signal, private noise

The repo is public. It shows the signal: what was decided and the rules the site is built by. Working noise stays on the machine that made it.

- **Signal (tracked):** instructions (`AGENTS.md`, `CLAUDE.md`), decisions (`docs/DECISIONS.md`), plans (`docs/PLAN.md`, `docs/plans/`), the workflow map (`docs/WORKFLOW.md`), lessons (`tasks/lessons.md`), review roles (`docs/review/`), and design references the build depends on (`.impeccable/config.json`, `.impeccable/decision/`, `.impeccable/surfaces/`, `prototypes/`).
- **Noise (gitignored, under `.local/`):** handoffs (`.local/handoffs/`), brainstorm and research scratch (`.local/scratch/`), review and council output (`.local/council/`), session transcripts and back-and-forth. Tool session state and screenshots (`.impeccable/review/`, `.impeccable/questions/`, `.impeccable/hook.cache.json`) are ignored where the tool writes them.
- **Unsure?** It's noise: put it in `.local/`. A decision found in noise goes into `docs/DECISIONS.md`; a lesson goes into `tasks/lessons.md`.

## Session handoffs

- Write every handoff to `.local/handoffs/YYYY-MM-DD-<slug>.md` (gitignored), never `/tmp`: a reboot wipes it.
- On a resume with no source given, look in `.local/handoffs/` first and offer the newest.
