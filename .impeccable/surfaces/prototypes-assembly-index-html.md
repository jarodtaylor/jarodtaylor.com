---
version: 1
slug: "prototypes-assembly-index-html"
primary_target: "prototypes/assembly/index.html"
related_targets: []
---

# Surface: homepage first viewport (Assembly Manual prototype)

Scope: header + hero, first viewport only (100svh). Mode: Persuade. Throwaway prototype in `prototypes/assembly/`, compared against the Backstage benchmark `prototypes/round5/`.

Audience/job: recruiters and hiring managers decide in seconds that Jarod is a senior systems thinker with personality, then click "Let's talk" or "Read the writing". Engineers should admire the build. Jarod's answers: feel = "systems thinker, but with personality"; wrong = generic portfolio, too corporate/cold, too busy.

Constraints: exact copy from docs/design/prototype-brief.md (round 1 hero copy; no stats in the hero); full browser width, no boxed column; 390/1440/1920/2560; WCAG AA; no headshot; no em-dashes; no three.js/GSAP/libraries, hero JS ≤ ~15 KB gzip; reduced motion and no-JS show full content; all values as custom properties (ported to tokens later; markup must Remix).

## Direction contract

THESIS: Jarod builds the parts other teams assemble products from, so his site is the instruction booklet. It refuses the category default of a big name over a dark field with an ambient animation.

OWN-WORLD: Wordless building-set manual. Cool white page (not cream), ink line art, a committed cobalt field, brick yellow and signal red as part colors. Isometric line drawings on the monogram's own 60° grid, numbered steps, rounded parts-callout boxes with "1x" counts, set-box badges, dashed assembly lines with arrows.

STORY: The visitor reads "Jarod Taylor, 18+" like a set box, sees what he's built from (parts box), watches his mark assemble, and understands: systems builder, human, senior. They act on the next step: Let's talk / Read the writing.

FIRST VIEWPORT: Full-width Step 1 page. Top left: step number "1". Name as the set title at display scale across ~60% width with an "18+" box badge (18 years). Role line + Frisco, TX beneath. A parts-callout box holds the tagline and bio, with the three pills drawn as labeled parts. CTAs sit as the "next step" with an arrow, bottom left. Right ~40%: the JT monogram as isometric extruded parts, exploded along dashed axes, which slide together and click on load. Header: small monogram, socials, minimal.

FORM: Assembly Manual, position 3 of 7 on the ordered list (1 Standards Manual, 2 Modular synth patch bay, 3 Assembly manual, 4 Coach's playbook, 5 Stage manager's prompt book, 6 Type specimen, 7 Newspaper front page). Seed key 2a2043ae.
Signature interaction: the monogram's two parts travel in straight lines along their assembly axes and lock with a single saturated "click" beat; parts-box pieces drop in on their step. Motion grammar: linear travel with a small settle, arrows draw along their length, nothing spins.
Raises: structure is the only ornament (from Exposed Binding); one identical parts-callout module repeats on every step (from VU Meter Bridge); full saturation reserved for the click (from Manga Page); same grid and part scale on every step (from Botanical Folio).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
