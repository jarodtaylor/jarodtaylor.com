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
