# jarodtaylor.com: master plan

## Context

Jarod has 18 years of design systems, frontend platform, DX and engineering leadership work, and almost none of it is public. The domain says "coming soon," and he is mid job search, so every week without a site costs him.

The site has three jobs:
1. Tell a recruiter who he is in seconds.
2. Prove his design engineering craft instead of claiming it.
3. Host writing that LinkedIn and X posts can link to.

The signature feature is **Remix**: same markup, different tokens, completely different brand. It's a modern CSS Zen Garden. It's portfolio proof of the "~7 brands, one design system" claim, and the token pipeline runs Figma → DTCG → build → Storybook → site.

**Already decided:**
- Ship in phases.
- Remix v1 is token/CSS only. Component layout variants are a later experiment and a later blog post.
- Wow is wanted. Perf is a budget to spend wisely, not a perfect Lighthouse 100, and JS is fine when it's done right.
- No target role, level or location on the site. That's LinkedIn's job.
- Résumé PDF and testimonials are in.
- No hero headshot. Photos go in About.
- Brand colors get designed fresh, not taken from Nord.
- Design happens in code, not comp-first. Old Impeccable rounds are scrapped.
- Case-study content comes later. This plan nails design and architecture.

Lessons from this session are in `tasks/lessons.md`.

---

## Stack (verified against current docs, 2026-10-13)

| Layer | Choice | Why |
|---|---|---|
| Site | **Astro 7** static output, `@astrojs/react`. Pages and layouts are `.astro`. Design-system components are `.tsx`, rendered on the server. Islands only for Remix and any motion that needs JS. | Zero JS by default and clean HTML. React components give Storybook a first-class path. |
| Tokens | **W3C DTCG 2025.10** format plus the **Resolver module** (a `brand` modifier). | Both have been stable W3C CG reports since 2025-10-28. The resolver *is* the multi-brand spec. |
| Token build | **Terrazzo** (`@terrazzo/cli` 2.x). The CSS plugin uses `permutations` to emit `[data-brand="x"]` blocks. | It's the only tool with native support for 2025.10 resolvers. Style Dictionary 5.6 still has no resolver support (issue #1590 is open). |
| Styling | **Plain CSS**: cascade layers (`reset, tokens, base, components, utilities`), co-located per component, readable class names, consuming **only** component and semantic custom properties. No Tailwind, no CSS Modules hashes. | View-source is part of the portfolio. "Tokens, not framework" stays literally true. *(Override if you want Tailwind v4.)* |
| Components workshop | **Storybook 10** + `@storybook/react-vite` + `@storybook/addon-themes` (`withThemeByDataAttribute`, `attributeName: 'data-brand'`). | It's the standard path, and the brand toolbar comes from config alone. |
| Figma | Repo JSON is the **source of truth**. Figma Variables get it through **native DTCG import/export**, one mode per brand. | Native import shipped in late 2025. The REST API is Enterprise-only, so skip it. |
| Hosting | **Cloudflare Workers static assets** (`wrangler.jsonc`, `assets.directory: ./dist`, `not_found_handling: "404-page"`). Cloudflare Web Analytics. DNS moves from Route 53 to Cloudflare. **Email stays on Google Workspace (no Email Routing).** | Cloudflare now steers new projects to Workers over Pages. Static requests are free. |
| Content | Astro content collections: `posts` (MDX), `work`, `workbench`, `career`, `testimonials`, `pillars`. | One data source feeds the homepage, the pages, the résumé, RSS and JSON-LD. |

**Figma constraints to design around:**
- Native import accepts only sRGB/HSL colors, px dimensions and single-string font families. It doesn't take typography composites.
- Fix: the build emits a **Figma-flavored export** (sRGB fallbacks, flattened type tokens) next to the OKLCH CSS.
- Modes need the **Figma Professional plan or higher**.

---

## Token architecture (the core decision)

Three tiers, visible in the repo:

```
tokens/
  knobs/                 # TIER 1: the only thing a brand authors
    default.json         #   hue/chroma anchors, base size, scale ratio, density,
    <alt-1>.json         #   radius, border weight, font families, texture, motion personality
    <alt-2>.json
  generated/<brand>.json # TIER 1b: derived primitives (color ramps, type scale, space scale), never hand-edited
  semantic/*.json        # TIER 2: aliases → surface roles (surface, surface-inverse, surface-accent,
                         #   text-*, border-*), space steps, type steps, motion
  component/*.json       # TIER 3: what components consume (button.*, card.*, nav.*, section.*)
  resolver.json          # DTCG resolver: modifier "brand" → knobs + generated set per brand
scripts/derive.ts        # pure function: derive(knobs) → primitive tokens (DTCG JSON)
terrazzo.config.ts       # → src/styles/tokens.css  ([data-brand] blocks) + dist/tokens/<brand>.json
```

**Key move: derivation is one pure TS function, `derive(knobs)`.**
- DTCG aliases can't do math. Scales and ramps need math, and Figma can't do math either.
- So `derive.ts` turns knobs into concrete primitive tokens **at build time**. Terrazzo then compiles those, and Figma imports real values.
- The **same function** runs in the browser for **Remix v2 live knobs**. v2 becomes "call `derive()` and set custom properties." No second implementation and no refactor.
- Color is derived in **OKLCH**, with sRGB fallbacks emitted for Figma.

**Phase 0 spike: alias output.**
- Remix v2 needs the semantic and component tiers to come out as `var(--primitive)` references. If they're flattened to values, setting a primitive at runtime changes nothing downstream.
- Terrazzo's CSS docs don't say which it does.
- **Spike it first.** If it flattens, fall back to a small custom Terrazzo plugin, or emit the semantic and component layers ourselves from the resolved alias graph.

**Brands can differ in more than color:**
- Typography family and scale, spacing density, radius, border weight, texture or decoration.
- Grid templates and column counts through custom properties, plus decoration shown or hidden.
- **DOM order never changes.**
- Discrete layout and decoration choices are **enumerated knob tokens**, e.g. `--hero-layout: split | stacked` and `--decoration: rules | none`. Component CSS reacts to them with **container style queries**, Baseline since 2026-05.
- **Never key CSS on a brand's name.** No per-brand CSS anywhere, so the "{n} tokens changed" readout is the whole truth.
- Gotcha: a style query only styles *descendants* of the element that carries the property.
- Progressive extras go behind `@supports`.

**View-source cleanliness (Astro defaults work against it):**
- `compressHTML: false`. Astro 7's default `'jsx'` collapses whitespace.
- `scopedStyleStrategy: 'where'`, or better, no scoped `<style>` in `.astro` files at all. Component CSS lives in plain co-located `.css` files.
- `build.inlineStylesheets: 'never'`.
- Turn off Vite CSS minification (`vite.build.cssMinify`; check the exact value on vite.dev) and serve readable CSS. Gzip/brotli makes the size cost negligible.
- Hashed CSS filenames are fine and get cache headers. The *contents* are what people read.

**Fonts:**
- The default brand's fonts are self-hosted, subset, preloaded and fallback-metric-matched, so there's no layout shift.
- Alternate brand fonts load **only when that brand is activated**, so Remix costs the first paint nothing.

---

## Phases (scope and exit criteria, no calendar estimates)

### Phase 0: Foundation
- Run `git init` on a `feat/foundation` branch. Create the public GitHub repo `jarodtaylor/jarodtaylor.com`. *(Outward-facing: I'll confirm when we get there.)*
- Add a project `CLAUDE.md` with commands, conventions and token rules. Keep `tasks/lessons.md`.
- Delete `.impeccable/{decisions,mocks,questions}`. Set `.impeccable/config.json` to `buildPath: "code"`.
- Scaffold Astro 7 + React and the CSS layer structure. Set up Terrazzo with a resolver and **placeholder** knobs for 2 brands.
- Write `derive.ts` with unit tests.
- **Guardrail scripts (CI from day one):**
  - `check:contrast`: every brand × every surface role and text pair used must meet WCAG 2.2 AA.
  - `check:markup-invariance` (Playwright):
    - load each page, snapshot the `<body>` DOM, switch brand on the client, snapshot again, and diff
    - excluded: the root `data-brand` attribute, lazily injected font `<link>`s in `<head>`, and the Remix control's own open/closed state
    - those exclusions get disclosed honestly in the Colophon
  - `check:tokens-only`: lint component CSS for raw color, length or font values, and for any selector keyed on a brand name. Stylelint rule: only `var(--…)` from the semantic and component tiers.
  - `impeccable detect` fails the build on exit code 2, with the **design-system drift check off** (`--no-design-system`). Impeccable's DESIGN.md is single-brand, so it would flag alternate brands as drift. DESIGN.md becomes a **generated output** of the token pipeline, not a second source of truth.
  - axe via Playwright.
  - Lighthouse CI against the **budget** (below). It reports on every PR and fails only on a regression past a threshold, with a labeled override for deliberate wow-versus-perf trade-offs.
- Deploy a "coming soon, done right" page to Workers on the real domain, with Person JSON-LD and correct meta. Disambiguation starts helping immediately.
- **Exit:** CI is green on an empty shell with 2 placeholder brands switching, and the domain serves it over HTTPS.

### Phase 1: Design direction, in code
1. **Inspiration walk.** I drive a real browser through your 5 bookmarked sites, and you narrate what you like about each. I record what to borrow and what to avoid.
2. **Run Impeccable `init` and `shape`** to write PRODUCT.md and a direction contract.
   - **Explicitly no image comps.** `buildPath: code` alone doesn't stop image generation, so the brief and session instruction forbid comps.
   - Direction cards are palette, type and wireframe only.
3. **Three coded hero-plus-first-section prototypes**, real HTML/CSS at 390px and 1440px.
   - Each has a distinct page topology: they must look different even with color removed. That was the failure in the earlier rounds.
   - You review them in the browser. Pick, combine, or re-roll.
4. **Remix smoke test before freezing markup.** Build a rough second brand on the chosen markup. If it can't look like a *different site* using tokens alone, the markup is wrong. Fix it now, while it's cheap.
   - The **locked prototype and its screenshots** become the reference for critique and the finish review, in place of the "approved comp" Impeccable assumes.
5. **Lock the signature brand:**
   - palette (fresh, AA-verified)
   - type pairing
   - monogram/wordmark, favicon, manifest
   - motion personality
   - the one or two **signature wow moments** (below)
- **Exit:** an approved direction, default-brand knobs locked, markup proven Remix-able.

### Phase 2: v0 launch (base brand, real content)
- **Homepage**, one long scroll that does the whole recruiter job:
  - hero (name and location prominent, no photo)
  - selected work metrics
  - testimonials
  - the four writing pillars
  - latest writing
  - workbench teaser
  - career throughline
  - contact
- **/about** (photos live here), **/work** (index plus a "case studies coming" state built for growth), **/workbench**, **/writing** plus the post template, **/colophon** (first version), **/resume** (an HTML page with a print stylesheet, and a PDF generated from the same `career` collection at build time), and a designed **404**.
- **SEO and identity:**
  - Person JSON-LD with `sameAs`, BlogPosting schema, canonical URLs.
  - OG/Twitter meta, with OG images generated per page and post from the brand's tokens.
  - RSS and a sitemap.
- **Ops:** Cloudflare Web Analytics and preview deploys for every PR. Email stays on Google Workspace. Verify `contact@` with a real send and receive after the nameserver switch.
- **Launch content:** 1–2 posts. The flagship is "Building a Zen Garden in 2026: DTCG tokens, resolvers, and one set of markup." It also becomes the long form of the Colophon.
- **Exit:** live on jarodtaylor.com, all checks green, budget met.

### Phase 3: Remix v1
- **2 alternate brands**, designed in code. Each has to read as a different site, not a recolor. Every one passes `check:contrast`.
- **Remix control:** the UI pattern (panel, drawer or command palette) gets decided in this phase via a quick coded prototype. It stays secondary to the content.
- **Behavior:**
  - switching is shareable (`?brand=x`) and persists per visitor
  - the brand change animates with View Transitions, using `prefers-reduced-motion` fallbacks
  - alternate fonts load lazily
- **Change readout:** "{n} tokens changed · 0 lines of markup changed." The count is computed at build from the resolved token sets, and the second number is backed by the invariance test.
- **"What you just saw" explainer:** ties Remix to the business case ("this is how one system served ~7 Estée Lauder brands") and links to the Colophon post.
- **Token export:** each brand's resolved JSON is downloadable, which feeds OG images and slides.
- **Exit:** 3 brands live, the readout is accurate, everything is tested.

### Phase 4: Storybook + Figma backfill
- Storybook 10 for every `.tsx` component, with the brand toolbar via addon-themes. Deploy it to a subpath or subdomain, linked from the Colophon.
- Figma file: Variables collections with one mode per brand, plus core components bound to variables.
  - Two ways in:
    - native DTCG import of the Figma-flavored export (the manual path, good for showing the round trip in the Colophon)
    - a script using the **Figma MCP** (`use_figma`, Plugin API) that creates or updates collections, modes and variables straight from the resolved tokens. That makes sync repeatable, not drag-and-drop.
  - The MCP also lets us read Figma back (`get_variable_defs`) to check for drift between Figma and the repo.
- Document the round trip (Figma edit → export → PR → CI → live) in the README and the Colophon. That's blog post #2.
- **Exit:** a visitor can trace one token from Figma through Storybook to the live site.

### Later
- Remix v2: live knobs running `derive()` in the browser, with a contrast guard.
- Component layout variants experiment.
- Case studies, /now and /uses pages, and a newsletter decision.

---

## Motion and the performance budget

- **Budget instead of a Lighthouse 100 rule** (mobile, simulated):
  - LCP < 2.0s
  - CLS < 0.05
  - INP < 200ms
  - homepage initial JS ≤ ~40 KB gzip, Remix island excluded and loaded on interaction or idle
  - Lighthouse ≥ 95 in every category
- **CSS-first motion:** scroll-driven animations for *local* morphs, never page-hijacking scroll (your Apple rule). View Transitions for the brand switch and navigation. `@property` for animated tokens.
- **One or two signature moments**, chosen in Phase 1. Strong candidate: **the brand switch itself is the wow**, with layout, type and color morphing in a single transition.
- A WebGL or canvas moment is allowed only if it earns it: lazy, device-gated, with a static fallback.
- **Every heavy effect has to buy its weight:** each one is checked against the budget in CI, and you decide on any trade-off.

---

## Content gaps to fill (Jarod's action items, not blocking the build)
- Testimonials: ask 3–5 former VPs, executive directors or CTOs for 1–3 sentence quotes, with permission to use name, title and company.
- 2–4 About photos (candid or working, not studio-cheesy).
- ~~Confirm Figma plan~~ **Confirmed: Professional** (up to 10 modes per collection, which is plenty for brands). The Figma MCP server is connected too.
- **DNS migration** (decided 2026-10-13: Route 53 → Cloudflare; registrar stays DreamHost):
  - Zone `jarodtaylor.com` created in Cloudflare (pending). Nameservers: `jack.ns.cloudflare.com`, `jessica.ns.cloudflare.com`.
  - Records added: Google MX ×2, SPF `v=spf1 include:_spf.google.com ~all`, DMARC `p=none` (monitor only).
  - **Jarod:** check Route 53 for any records not visible publicly (subdomains, verification TXT). Generate the Google Workspace DKIM key (Admin → Gmail → Authenticate email) and send me the TXT value.
  - **Cutover:** at the Phase 0 deploy, attach the Worker custom domains (apex + www), then change the nameservers at DreamHost. After that, check MX and send a real test email. Move DMARC to `quarantine` once the reports look clean.
- Case studies, on your own schedule. A career interview is available whenever you want it.

---

## CE toolbelt checkpoint
- Scoping is done, so this is the checkpoint before building.
- **`ce-worktree`** fits Phase 0, for branch and worktree setup once git exists.
- **`ce-code-review`** fits each phase's PR.
- **`/ce-proof`** (manual) fits only if you want to share this plan with someone for review.
- No CE skill replaces Impeccable for the design phases.

## Model routing
- Phase 0 and Phase 2 build: implementation goes to Sonnet subagents. Opus subagents handle `derive.ts`, the resolver config and the invariance test, where correctness matters most.
- Phase 1 direction work: main loop on **Opus**. A one-shot **Fable** cold-read is a gate on the direction contract and the final brand before it's locked.

---

## Verification (end to end)
- `pnpm build` passes. `pnpm test` covers `derive()` (scales are monotonic, ramps are in gamut, knobs map to deterministic output).
- `check:contrast`, `check:markup-invariance`, `check:tokens-only`, `impeccable detect`, axe and Lighthouse CI all run in GitHub Actions on every PR.
- Playwright takes screenshots of every page × every brand × 390/1440, attached to each PR for visual review.
- Before launch: a keyboard-only walkthrough, reduced-motion walkthrough, JS-disabled content check (content readable, Remix hidden gracefully), a real email to `contact@`, Rich Results test for JSON-LD, and OG preview checks on LinkedIn and X.
- Phase gates: an `impeccable critique` + `audit` and a fresh-eyes finish review before each phase is called done.
