# Prototype brief: Backstage × 3 intensities

The shared, binding brief for the three Phase 1 prototypes. Read with `PRODUCT.md`, `docs/design/directions.md` (section A), `docs/design/inspiration.md`.

## The concept

"I build the work behind the work." A polished **front layer** of content sits on a visible **backstage**: the grid, registration/crop marks, spacing rhythm and token annotations the page is built from.

## The three variants (same content, different treatment)

| Variant | Folder | Backstage visibility |
|---|---|---|
| **Whisper** | `prototypes/whisper/` | Barely there: hairline grid, a few crop marks. Restraint does the talking. "Peek backstage" reveals the system on interaction. |
| **Blueprint** | `prototypes/blueprint/` | Clearly present: the grid, measurements and stacked "sheets" are always visible but quiet. Feels like a precise spec that's also beautiful. |
| **Exposed** | `prototypes/exposed/` | Loud and structural: the scaffolding *is* the aesthetic. Editorial scale, bold rules, annotations as graphic elements. Still recruiter-clear. |

They must differ in **layout/topology and type**, not only in how visible the grid is. Each picks its own type pairing and palette (fresh, not Nord/Catppuccin/Dracula, no AI-slop defaults).

## Scope: hero + first section

**Hero (exact copy, no em-dashes):**
- Name: **Jarod Taylor** (huge; the hero's anchor; no photo)
- Role line: **Engineering Leader | Design Engineering, Frontend Systems & Developer Experience**
- Location: **Frisco, TX**
- Headline/tagline: **I build the work behind the work.**
- Bio: "Designer turned engineer turned engineering leader. For 18 years I've built design systems, frontend platforms, and developer experience that make whole engineering orgs faster, and led the teams that build them."
- Actions: **Read the writing** (primary) · **Let's talk** (mailto:contact@jarodtaylor.com)
- Social links: LinkedIn (linkedin.com/in/jarodtaylor), GitHub (github.com/jarodtaylor), X (x.com/jarodtaylor), Email
- **Stats row** (only these): 18 years building for the web · 12+ years leading teams · 40-person global org · 3 design systems founded

**First section: the four pillars** as stacked, numbered sheets (01–04) that pile up on scroll (`position: sticky`, no JS):
- **Leading engineering orgs** (Experience): Growing leaders, building culture, and keeping teams steady through acquisitions, bankruptcy, and reorgs. The parts of the job that don't show up on the org chart.
- **Design engineering and frontend systems** (Experience): Design systems, design-to-code pipelines, and frontend performance. What it takes to build a system people actually adopt, and what changes now that AI can generate UI.
- **Developer experience** (Experience): Docs, tooling, and onboarding that make a whole org faster. Like letting engineers run local changes against real production data instead of mocks, or getting a new hire to a first PR in a day or two.
- **Learning AI in public** (Learning out loud): What I'm trying with AI agents, what works, and what breaks. A lab notebook, not a playbook.
- Section heading: "Four topics. Three I've done for years, one I'm learning out loud."
- Each pillar gets a **line-art SVG illustration** (inline SVG, stroke-only, stroke color and width from CSS custom properties so it can Remix later). No photos, no stock, no emoji icons.

## Required behaviors

1. **Ambient backstage motion:** subtle, adds depth, made from the page's own system (grid spacing = the spacing scale, line weight = border weight). CSS-first. Must stop under `prefers-reduced-motion`.
2. **"Peek backstage" interaction:** hover/focus a block → a redline overlay shows what it's made of (spacing values, type step, token names). Keyboard-accessible. Restrained.
3. One **local** scroll effect at most besides the sticky sheets (e.g. text fill). Never page-hijacking scroll.
4. Full browser width; great at **390px and 1440px**; no horizontal scroll.
5. WCAG AA contrast; visible focus; semantic landmarks; real `<h1>`.

## Build rules

- Throwaway, standalone: `prototypes/<variant>/index.html` + `styles.css` (+ tiny inline JS only if truly needed). No build step, no framework, no npm deps. Google Fonts allowed for prototypes.
- Write all values as CSS custom properties at the top (`--space-*`, `--type-*`, `--line-*`, `--color-*`), since the winner gets ported to the token pipeline.
- **No image generation, no comps, no mock images.** Design in code only.
- Don't touch anything outside your variant folder.
- Produce screenshots: `prototypes/<variant>/shot-390.png` and `shot-1440.png` (full page).

---

# Round 2 brief (2026-10-20)

**Feedback on round 1:** didn't love any, didn't hate any. All three were **too drab** (near-monochrome) and **broke on wide screens** (4K: type capped while the grid stretched, leaving dead zones).

**Jarod's picks:** **Exposed's condensed type** · **Dark-first, rich color.**

## Build: `prototypes/exposed-dark/`

Start from `prototypes/exposed/` (copy, don't modify it). Keep what worked: condensed heavy name, structural rules, cap/baseline annotations, pill keywords, stats strip, sticky numbered sheets, line-art, peek backstage, stepped scanline.

### Must change
1. **Dark-first, rich color.** A deep background (not pure black) with a saturated brand hue that has real presence, in the spirit of aarronwalter.com's dark + lime and the editor themes Jarod likes (Catppuccin/Dracula/Nord as taste, never copied). Use **surface roles**: at least one full-color `surface-accent` block (e.g. the stats strip or one sheet) and a lighter/inverse surface somewhere, so the page has rhythm, not one flat field.
2. **Three palette options, switchable** via a small "Palette A/B/C" control that swaps only CSS custom properties on `<html>` (a mini Remix; zero markup changes). Make them meaningfully different hue families (e.g. warm, cool, one surprising). All must pass AA (compute it).
3. **Wide-screen strategy (the on-concept one):** content lives on a front "sheet" with a sensible max width; **the extra width on big monitors becomes backstage**: the grid, measurement rules and annotations extend into it, so a wider screen shows more scaffolding, never dead space. Type stays fluid up to the sheet max. Nothing stranded at the far edges.
4. Hero must work as one composition at every width: bio stays near the headline, stats in or near the first viewport at 1440×900.
5. Fix the stat wording: "40" + "person global org" without a dangling hyphen.

### Verify
Check **390, 1440, 1920 and 2560** px (screenshot each: `shot-390.png`, `shot-1440.png`, `shot-1920.png`, `shot-2560.png`, first viewport + full page for 1440), plus each palette at 1440 (`palette-a.png`, etc.). Reduced motion, keyboard, contrast computed.

---

# Round 3 brief (2026-10-20)

**Feedback on round 2 (Exposed Dark):** "pretty unique," but **too busy**: the backstage is always on (labels, dimension lines, token panels, grid everywhere, scanline). **Palette B (Chartreuse)** is the favorite. Hero is too horizontal.

## Build: `prototypes/round3/` (start from a copy of `prototypes/exposed-dark/`)

1. **Calm by default, backstage on demand.**
   - Default: no annotation text anywhere (no cap/baseline labels, no dimension lines, no token panels, no `top = …` formulas). The grid is very faint and lives mainly in the backstage margins. Scanline: remove it, or make it nearly subliminal.
   - **"Peek backstage"** toggle (and hover/focus on a block) turns on the full spec layer: measurements, cap/baseline, margin panels with live token values. The reveal is the wow moment.
2. **Vertical hero, full viewport.** One tall composition (`min-height: 100svh`), stacked in reading order: **name → role line + location → tagline → bio → CTAs → social links**. No side-by-side bio. The name may be smaller than round 2; it only has to stay the anchor. Must compose well at 1440×900 and at 2560×1440.
3. **Stats move out of the hero** into the next section, given room to breathe (still the lime accent block is fine).
4. **Palette B only.** Remove the palette switcher (Remix UI is designed in Phase 3). Keep the palette as custom properties.
5. **JT monogram** at `src/assets/jt-logo-icon.svg` (two filled paths, viewBox 0 0 575.65 502.31). Use it: (a) small in the header (replacing the "JT" text), color from tokens; (b) one larger, very subtle placement that, in peek mode, **reveals its construction lines** (stroke outline, grid/angle guides) so the mark shows how it was built. Inline it; don't alter its geometry.
6. Keep: condensed type, pills, sticky numbered pillar sheets with line art, lime color blocks, inverse sheet 04, wide-screen backstage margins (quiet by default).

### Verify
390, 1440, 1920, 2560 (first viewport + full page at 1440 and 2560), default AND peek-on states (`peek-1440.png`, `peek-2560.png`). Keyboard, reduced motion, contrast (reuse `tools/contrast.mjs`).

---

# Round 4 brief (2026-10-21): above the fold only

**Feedback on round 3:** liked the calm default and *loved* the peek transition, especially the monogram drawing its construction lines. Disliked: the **boxed, centered sheet** with dead side gutters (dated, "960px grid days"); **type sizes** (too much on screen, doesn't flow); location/time in the header.

**Scope:** the first viewport only (header + hero, `100svh`). Nothing below the fold. We nail this, then it sets the language for every other section.

## Build: `prototypes/round4/` (start from a copy of `prototypes/round3/`; keep palette B, Archivo condensed, the inline monogram + its construction geometry)

1. **Full browser width.** No max-width sheet, no backstage side gutters. The composition spans the viewport like aarronwalter.com: gutters scale with the viewport (e.g. `clamp()` on vw), the name scales with viewport width, and only *text blocks* get a max line length (`ch`). Must feel intentional at 390, 1440, 1920 and 2560 (Jarod is on 4K). No dead zones: the open area is where the background lives.
2. **Strict hero type scale: 3 steps + 1 label.** Display (name) → lead (tagline "I build the work behind the work.", "behind the work." in lime) → body (bio). Plus one small label style (mono or caps) for the role line and "Frisco, TX". Nothing else. Clear reading rhythm with generous, consistent vertical spacing.
3. **Less on screen.** Hero = name, role line + Frisco, TX (label), tagline, bio (keep the pills), 2 CTAs. Social links move to the header (compact) or out of the hero entirely. Header: monogram left, socials + "Peek backstage" right. **No location/time in the header.**
4. **Load-in intro ("the build").** On first load the page constructs itself from the monogram's 60° geometry, then the scaffolding fades out, leaving the calm page + living background. Ours must grow from **Jarod's mark and lattice**, not generic labeled layout boxes (piergorelli.com does those; we must not look like a copy). Suggested beat: lattice lines draw out from the mark → monogram constructs (guides → outline → fill) → hairline guides snap to the hero blocks → text settles → guides fade. About 2 s total. Rules:
   - The name is visible at first paint (it's the LCP). Other blocks may reveal, all visible by ~1.2 s.
   - Skippable (any key, click, scroll, or a "Skip" control). Plays once per session (`sessionStorage` in try/catch).
   - `prefers-reduced-motion`: no intro, content immediately. No JS: full content, no intro.
   - It's the same visual language as "Peek backstage," which stays (reworked for full width) as the on-demand version.
5. **Living hero background: 3 options, switchable** via a small dev control (`A / B / C` + "Replay intro"), swapping only which background runs. Each must come from something real, not decoration:
   - **A. Lattice field:** the 60° triangular lattice the monogram is built on, very faint, drifting slowly; lines near the cursor bend or brighten subtly.
   - **B. Construction drift:** the monogram's own construction lines extended across the viewport, slowly sliding; now and then a segment traces in lime along the mark's real edges.
   - **C. Your pick, from the system:** something derived from the tokens (e.g. spacing/type-scale rhythm as a receding field). Explain the source in a comment.
   - All three: subtle (never compete with the text; text contrast must still pass AA over it), confined to the hero, paused when offscreen or the tab is hidden, DPR capped at 2, static frame under reduced motion.
6. **Motion and JS budget (Pier's discipline).** **No three.js, no GSAP, no libraries.** Hand-written WebGL fragment shader or canvas 2D, ~2–4 KB per background; intro is CSS/SVG first with minimal JS. Total hero JS target ≤ 15 KB gzip. Every effect earns its place; drop anything that costs without meaning.

## Verify
- Screenshots (settled state): background A at 390, 1440, 1920, 2560; B and C at 1440 and 2560 (`bg-a-1440.png` …). Intro mid-sequence frames at 1440 (`intro-1.png`, `intro-2.png`, `intro-3.png`). Peek at 2560.
- Reduced motion, keyboard, skip works, no horizontal scroll, contrast computed (reuse `tools/contrast.mjs`, including text over the brightest background frame).
- Report gzip size of each JS file.

---

# Round 5 brief (2026-10-24): the intro IS the peek

**Feedback on round 4:** okay, but could be much better. The intro's guide lines **rotate in**; they should **grow linearly** (draw from a point along their length). The small set of horizontal + vertical guides is weaker than the **full "Peek backstage" layer**, which Jarod loves (redline boxes, token labels, cap/baseline, 12-col grid, hero-scale card, monogram construction with vertices, 60° and 575.65 × 502.31).

## Build: `prototypes/round5/` (copy of round4)
1. **The load intro = the peek layer animating in, then out.** Lines draw linearly (stroke-dashoffset / scaleX from an origin, never rotation). Choreograph it: grid columns draw → monogram construction lines draw → monogram outline traces + vertices pop → redline boxes and token labels appear on each text block → hero-scale card types in → hold briefly → **everything fades out except the JT monogram**.
2. **The monogram is the resting state.** Remove the A/B/C background options and the canvas backgrounds. Prototype control offers two resting states to compare: (1) monogram as lime/blue **line drawing** (construction kept faint), (2) monogram as the faint **filled** mark with a very faint lattice. Plus Replay.
3. Peek backstage button replays the same layer on demand (the same code path, so intro and peek are one system).
4. Keep all round 4 rules: name visible at first paint, skippable, once per session, reduced motion = no intro, no JS = full content, no libraries, JS small. Keep total intro under ~3 s including the hold.
5. Polish bar: this should feel like a precise, cinematic reveal, not a busy one. Easing and stagger matter more than quantity. Make the label/box appearance feel engineered (e.g. boxes draw their perimeter, labels slide out of their box edge).

## Verify
Intro frames at 1440 and 2560 (`intro-1..4.png`), both resting states at 1440/2560/390, peek at 2560. Reduced motion, keyboard, skip, no horizontal scroll, JS gzip sizes.
