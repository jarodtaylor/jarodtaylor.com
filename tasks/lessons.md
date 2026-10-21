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
