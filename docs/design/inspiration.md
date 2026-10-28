# Inspiration walk (Phase 1, step 1)

What Jarod liked or disliked on each site, in his words where possible. This feeds the design brief.

---

## 1. aarronwalter.com

**Liked**
- Subtle background animation. The idea, not the exact lines: it "adds a little more depth."
- Full browser width, and how well it holds up responsively.
- Big name as the hero, no photo, short bio, social links.
- Typography with a designer's eye. (Display: F37 Lineca. Body: Aktiv Grotesk.)
- Overall aesthetic: restrained, confident, crafted. Not the specific colors or fonts.
- Colophon page explaining how the site was designed and built.

**Not taking**
- Exact palette and fonts. No copying.

**Worth stealing (my notes)**
- **The animation means something.** It's real radio data from the first pulsar ever discovered (the Joy Division *Unknown Pleasures* dataset), animated at the pulsar's actual period. Decoration with a story. Our version should also come from something real: the tokens themselves, his career data, or the Remix system.
- Designed in the browser with Claude Code, not Figma. Same approach as ours, and the colophon says so openly.
- The canvas animation is turned off under `prefers-reduced-motion`.
- Work shown as a numbered list (01–05) with role and years on the right. Hover turns the name to the accent color.
- Their cost: a Next.js site with about 10 JS bundles. We get the same feel for less.

## 2. product.inc (Alex Zapadenko)

**Liked**
- Different from the standard personal site.
- **At-a-glance stats row:** years of experience, years in leadership, largest org, etc. (They count up on scroll, which is why the screenshot showed zeros.)
- Experience shown as a **timeline**, an interesting take.

**Disliked**
- Far busier than he wants (11,000px+ page, lots of sections).

**Worth stealing (my notes)**
- A stats row fits his real numbers: 18 years, 12+ leading, 40-person global org, 3 design systems founded, ~7 brands on one system.
- Seasonal theming plus a light/dark toggle is a cousin of Remix. Proof that visitors enjoy a site that changes its skin.
- The banner "ships rough on purpose and gets better in public" matches his "learning in public" angle.

## 3. gertix.studio (German tech agency)

**Liked**
- Subtle scroll effects. Unique without being loud.
- **Grid lines + registration marks**, perfectly on-brand for what they sell.
- **Pill keywords inside sentences.** "Tagging" that doesn't read like SEO keyword cramming.
- **Stacked, numbered service panels.** He immediately pictured his **four pillars** this way.
- Cinematic video hero.
- Footer with two hands that react to the mouse: a clever, playful touch.
- The lesson he took: creative branding that fits the owner. Not something to copy.

**Worth stealing (my notes)**
- Visible scaffolding (grid, crop marks) is the "Backstage / Redline" idea from IDEATION.md done tastefully. It's a natural fit for "the work behind the work."
- Scroll-driven text fill = a local scroll effect, which is the kind he likes (vs. page hijacking). CSS scroll-driven animations can do this with no JS.
- Type pairing: a mono for labels + a geometric display face. Technical and editorial at once.
- Stacked panels: `position: sticky` cards. Cheap, no JS, and one fits each pillar.
- The reactive footer hands = one memorable interactive moment at the end. Our version should tie to his story.

## 4. arturospatino.com (product designer, Italy)

**Liked**
- About page: lots of good content.
- Section headers go sticky while you're inside that section.
- **Animated line-art illustrations** on the four service cards (concentric circles, nested cube, tiled rectangles, isometric shape). The real reason for the bookmark.

**The real problem this points to (important)**
- Designers fill their sites with screenshots and photos of their work. **Jarod won't have much of that** (enterprise work, internal tools, a leader's outcomes). He needs visual interest that isn't photos.

**Worth stealing (my notes)**
- **Line-art SVG illustrations, drawn from tokens.** Stroke width = the border-weight knob, color = the accent role, corners = the radius knob, motion = the motion knob. They'd **Remix with the brand** for free, which no screenshot can do. That turns his "no imagery" gap into a showcase for the token system.
- One illustration per pillar: the four pillars fit the four-card pattern, or the stacked panels from gertix.
- Sticky section headers: CSS `position: sticky`, no JS.
- Two-tone headline (key words strong, the rest muted): a cheap way to add emphasis.
- Live local time + city in the header: a tiny human touch ("Frisco, TX · 9:14 PM").

## 5. eddy-naboulet.dev (front-end/WebGL dev, France)

**Liked**
- The concept: the whole site is a retro OS (boot screen, desktop, "apps", theme switcher). It stands out from every other site.

**Disliked**
- Too complicated for a recruiter. Nothing specific to borrow.

**Worth stealing (my notes)**
- Career facts as system data ("[ OK ] design memory … 15 years") is witty. One small moment like that, not a whole OS.
- Confirms the IDEATION.md warning: a full-site gimmick costs recruiter clarity.

---

## Synthesis: the north star

> **"This is Jarod. Definitely Jarod."** Not a cookie-cutter personal site. Recruiter-clear in seconds, with one or two ideas you remember.

**Patterns Jarod responded to across all five**
1. Ambient background motion that adds depth, ideally *meaning something* (Aarron's pulsar data).
2. Full browser width, strong responsive behavior.
3. Big name, no hero photo, short bio, social links.
4. Typography with a designer's eye.
5. Visible structure: grid lines, registration marks (gertix).
6. Local scroll effects only: text fills, stacked panels, sticky headers. Never page hijacking.
7. Pillars as stacked, numbered panels.
8. Pill tags inside sentences.
9. At-a-glance stats row + timeline-style experience.
10. Non-photo imagery: line-art illustrations, ideally token-driven so they Remix.
11. One playful interactive moment (reactive footer hands).
12. Branding that fits the owner (gertix's grid for a systems agency, Eddy's OS for a WebGL dev).

**What to avoid**
- Busy, very long pages (product.inc).
- Full-site gimmicks a recruiter has to decode (eddy-naboulet).
- Hero portraits.
