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
