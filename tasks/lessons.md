# Lessons — jarodtaylor.com

## 2026-10-13 — planning kickoff

- **Don't promote inherited agent constraints to hard requirements.** "Works with JS off" and "Lighthouse 100" came from a prior agent session, not Jarod. Real rule: wow is wanted; weigh each perf cost against the wow it buys. Ask where a constraint came from before treating it as binding.
- **No target role / level / location on the site.** That's LinkedIn's job. The site sells via proof, testimonials, and a downloadable résumé.
- **No hero headshot.** Photos belong in About, never dominating the homepage.
- **Design in code, not comp-first.** Two rounds of image-generated Impeccable comps all missed. Iterate on real HTML/CSS in the browser.
- **Nord/Catppuccin/Dracula are taste signals, not a brand spec.** Brand colors are to be designed fresh.

## 2026-10-13 — tooling gotchas

- **`astro preview` backgrounds itself when it detects an AI agent** (Astro 7). Playwright then sees an early exit while the old process holds the port. Use `astro preview --ignore-lock` in test servers.

## 2026-10-20 — prototype round 1 feedback

- **Test at wide viewports, not just 390/1440.** Jarod uses a 4K monitor (~2000–2560 CSS px). All three prototypes capped type size but let the grid stretch, leaving dead zones. Always check 390 / 1440 / 1920 / 2560, and every layout needs an explicit wide-screen strategy.
- **"Restraint" in a brief reads as monochrome to agents.** Jarod found all three drab. Specify a real color strategy (surface roles, color-blocked sections, a brand hue with presence), not "one accent used sparingly."

## 2026-10-21 — prototype round 3 feedback

- **No boxed, centered content column on wide screens.** A max-width sheet with dead side gutters reads as dated (960px-grid era) to Jarod. Content and composition should span the browser width (aarronwalter.com as reference); constrain line length per text block, not the page.
- **Fewer type sizes in the hero.** Too many competing steps = "too much on screen." Brief a strict hero type scale (about 3 steps) and a clear reading rhythm.

## 2026-10-24 — round 4/5 motion feedback

- **Guide lines grow along their length, never rotate in.** Jarod disliked rotating guides; linear draw (dashoffset / scale from an origin) reads as "being built."
- **Spec labels never fade through their own background;** retract them into the box edge (half-faded red labels look muddy).
- **When Jarod loves an on-demand effect, consider making it the first impression.** The peek reveal became the load intro in round 5.

## 2026-10-24 — hero content diet

- **Every round inherited the round-1 hero content lock** (name, role, location, tagline, bio, pills, 2 CTAs, socials). That lock, not the visual direction, made each hero feel crammed. Re-check content scope before re-briefing visuals: the hero only needs the wow + who he is; the homepage and header carry the rest.
- **Design the header/nav system with the hero**, not after. Utility info (role, location, Let's talk, socials) can live in small footprints around the header (piergorelli.com pattern).
