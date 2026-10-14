# jarodtaylor.com

Personal site and portfolio. The signature feature is **Remix**: one set of markup, many brands, driven only by design tokens. The full plan is in `docs/PLAN.md`. Read `tasks/lessons.md` at session start.

## Commands (pnpm, Node ≥ 24)

| Command | What it does |
|---|---|
| `pnpm dev` | `pnpm tokens`, then the Astro dev server |
| `pnpm build` | `pnpm tokens`, then `astro build` → `dist/` |
| `pnpm tokens` | `scripts/build-tokens.ts` (knobs → `tokens/generated/`), then `tz build` (→ `src/styles/tokens.css`, `public/tokens/<brand>.json`) |
| `pnpm test` | Vitest (`scripts/derive.test.ts`) |
| `pnpm typecheck` | `astro check` (covers `.astro`, `.ts`, `.tsx`) |
| `pnpm check` | Every guardrail below, fast first (builds in the middle). CI runs them as separate steps (`.github/workflows/ci.yml`) |
| `pnpm check:tokens-fresh` | Reruns `pnpm tokens`; fails if `tokens/generated/` changed (content compare, not git) |
| `pnpm check:contrast` | WCAG 2.2 AA for every brand × `surface.<role>.*` pair (`scripts/contrast.ts`). Needs `pnpm tokens` first |
| `pnpm check:tokens-only` | Stylelint (`stylelint.config.js` + `scripts/stylelint-plugin-tokens.ts`): no raw values, primitives or brand keys in CSS |
| `pnpm check:slop` | `impeccable detect --no-design-system src/` |
| `pnpm check:markup-invariance` / `check:a11y` | Playwright + axe on every page × brand in `dist/` (`tests/*.e2e.ts`). Needs `pnpm build` and `pnpm exec playwright install chromium` |
| `pnpm lighthouse` | Lighthouse CI on `dist/` (`lighthouserc.json`), local only: no upload (CI uploads to temporary public storage). Budgets warn; only a11y < 0.9 or CLS > 0.1 fail. PR label `perf-tradeoff` downgrades those too |

Run `pnpm test && pnpm typecheck && pnpm check` before committing.

## Architecture

- **Astro 7**, static output. Pages and layouts are `.astro`. Design-system components are React `.tsx` in `src/components/<Name>/`, rendered on the server. No `client:*` unless a component truly needs JS.
- **Content**: collections in `src/content.config.ts`. Posts are MDX in `src/content/posts/`; everything else is a JSON array in `src/content/data/`.
- **Hosting**: Cloudflare Workers static assets (`wrangler.jsonc`, no Worker script).

## Token pipeline

```
tokens/knobs/<brand>.json      TIER 1   the only thing a brand authors (DTCG)
  └─ scripts/derive.ts         pure derive(knobs) → primitives; no Node APIs (it will run in the browser)
tokens/generated/<brand>.json  TIER 1b  derived primitives, committed, never hand-edited
tokens/semantic/*.json         TIER 2   aliases only: surface roles, space, type, shape, decoration
tokens/component/*.json        TIER 3   aliases only: what components consume
tokens/resolver.json           DTCG Resolver 2025.10; the "brand" modifier is the single list of brands
terrazzo.config.ts             → src/styles/tokens.css + public/tokens/<brand>.json
```

- **Add a brand**: create `tokens/knobs/<name>.json` and add a `<name>` context to the `brand` modifier in `tokens/resolver.json`. The build fails if the two lists disagree.
- Aliases compile to `var(--…)` references, not flattened values, so setting a primitive at runtime cascades through the semantic and component tiers. Remix v2 depends on this.
- `derive()` clamps every color into sRGB. That keeps Terrazzo from emitting wide-gamut `@media` duplicates and makes the `hex` fallback exact.
- **Resolved per-brand JSON** for checkers, exports and the "{n} tokens changed" readout: `public/tokens/<brand>.json` (shipped at `dist/tokens/<brand>.json`). It's a flat map of `token.id → { $type, $value, aliasOf? }`. Colors carry `components` (OKLCH) and `hex`. For contrast, each `surface.<role>` group (`default | raised | inverse | accent`) holds `bg` plus the foregrounds used on it (`text`, `text-muted`, `link`, `border`, `focus`). `check:contrast` derives its pairs from this naming: every sibling of `bg` is text at 4.5:1, except `border` (decorative, skipped) and `focus` (3:1).
- `src/styles/tokens.css` and `public/tokens/` are build output and gitignored.

## Token rules (non-negotiable)

- Components consume **only** semantic or component custom properties (`--surface-*`, `--space-*`, `--type-*`, `--shape-*`, `--button-*`, `--card-*`, `--section-*`, …). Never primitives (`--color-*`, `--size-*`, `--font-*`, `--knob-*`), never raw colors, lengths or font names.
- Private per-component props use the `--_` prefix (e.g. `--_bg`) and may only be assigned from token vars.
- **Never key CSS on a brand name.** No `[data-brand="…"]` selectors outside the generated `tokens.css`. Brands differ only through tokens.
- Brands author knobs only. Semantic and component files are aliases only: no literal values.
- Discrete layout and decoration choices are enumerated knobs (e.g. `--section-decoration: rules | none`) that component CSS reads with `@container style(...)`. A style query only styles descendants of the element carrying the property.
- DOM order never changes between brands.

## CSS and view-source rules

- Plain CSS, co-located: `Button.tsx` imports `./Button.css`. Wrap component CSS in `@layer components { … }`. No Tailwind, no CSS Modules, no scoped `<style>` in `.astro` files.
- Layer order lives in `src/styles/layers.css` (`reset, tokens, base, components, utilities`). `Base.astro` inlines it at the top of `<head>` because bundle order isn't guaranteed. Don't redeclare it anywhere else.
- `astro.config.ts` keeps output readable: `compressHTML: false`, `build.inlineStylesheets: 'never'`, `vite.build.cssMinify: false`. Don't undo these.
- Brand switching: `?brand=<name>` sets `data-brand` on `<html>` before first paint (inline script in `Base.astro`).

## Verify docs

Verify every API and config against current docs before using it (`find-docs` skill / Context7). Don't trust training data for Astro, Terrazzo, DTCG, or Cloudflare.

## Decisions log
Every decision, open question, and to-do goes in `docs/DECISIONS.md` the moment it happens.
