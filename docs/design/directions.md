# Design directions (Phase 1, step 2)

Three directions to prototype in code. Each has a **different page topology**, so they should look different even in grayscale (the failure of the old comp rounds).
North star: **"This is Jarod. Definitely Jarod."** Sources: [inspiration.md](inspiration.md), IDEATION.md, CONTENT.md.

The two that aren't picked become **Remix candidates**. They stay candidates until the Phase 1 smoke test proves they can share the chosen markup.

---

## A. Backstage ⭐ recommended default

**Idea:** literally "the work behind the work." A polished front layer sits on top of a visible backstage: the grid, registration marks, spacing rhythm and token annotations the page is built on.

- **Topology:** layered. Full-bleed backstage plane (blueprint-style grid, crop marks at section corners) under "front sheets" that hold content. Pillars are **stacked, numbered sheets** that pile up as you scroll (gertix). Sticky section labels.
- **Definitely Jarod because:** his tagline, three design systems founded, and his job has always been the scaffolding that makes other people fast. The site shows its own scaffolding.
- **Ambient motion is made of:** **the site's own tokens.** Grid spacing *is* the spacing scale, line weight *is* the border knob. Idle: the grid breathes very slightly. On Remix, the backstage visibly re-measures itself (density changes → grid re-spaces). Real data, and only this site can have it.
- **Interactive moment:** **"Peek backstage."** Hover or focus a section and a redline overlay shows what it's made of (spacing, type step, token names). It's the IDEATION "Redline" idea used as an easter egg, not the whole page.
- **Imagery without photos:** line-art illustrations per pillar, drawn with tokens (stroke = border knob, color = accent role), so they Remix too.
- **5-second recruiter read:** huge name on the front sheet, role line, one-sentence bio, stats row (18 years · 12+ leading · 40-person global org · 3 design systems founded), Let's talk.
- **Risk:** it's about the work more than the person. Mitigated by voice, the About section, and the writing.

## B. Edition

**Idea:** he started in 2008 as an interface designer at **The Dallas Morning News**. The site is a modern editorial broadsheet: his name as the nameplate, his career as front-page stories, and the writing has an obvious home.

- **Topology:** multi-column editorial grid. Nameplate masthead, dateline ("FRISCO, TX"), asymmetric columns, heavy rules, pull quotes for testimonials, "above the fold" literally means something.
- **Definitely Jarod because:** newsroom origin, self-taught designer, and a writer now publishing. It carries the **personal** side better than A.
- **Ambient motion is made of:** **the site being built in public.** A slow wire ticker of real activity from the repo and the writing (latest commit, newest post, current workbench status). It's quiet, typographic and true.
- **Interactive moment:** **"Edition" switcher.** Remix framed as editions (morning, evening, special), a natural metaphor for re-skinning the same stories.
- **Imagery without photos:** typographic: drop caps, big numerals, rules, ink texture.
- **5-second recruiter read:** headline = role line, lede = bio, a "by the numbers" sidebar, contact in the masthead.
- **Risk:** literary tone could overshadow the engineering, so outcomes must stay prominent.

## C. Threads

**Idea:** "an ADHD brain running twenty threads at once" and "18 years, one throughline" (both from CONTENT.md). Many fine threads, one bold throughline that ties his story together.

- **Topology:** a single narrative spine. One continuous throughline runs down the page and links sections (hero → work → pillars → career → contact). The career section is the only true timeline: the thread splits by company, with real years.
- **Definitely Jarod because:** the most personal of the three. ADHD, systems as external executive function, and the same problem chased for 18 years with bigger leverage each time.
- **Ambient motion is made of:** **his career data.** Each thread is a real role, from start year to end year (2008 → today). Threads converge where roles overlap. Not decorative noise.
- **Interactive moment:** hover a thread to light up what it connects to (a role, its outcomes, a pillar).
- **Imagery without photos:** the threads themselves, plus line-art per pillar.
- **5-second recruiter read:** name, role line and bio sit at the start of the throughline; stats sit on it as the first "stops".
- **Risks:** must not read as Aarron Walter's line field (that's why ours is interactive, data-bound and tied to sections, not a background texture). Timeline motion stays *inside* the career section, never whole-page scroll hijacking.

---

## Not chosen as defaults (possible Remix alternates later)
- **Editor theme** (Catppuccin/Dracula vibe): works best as a Remix brand, not the default. That avoids the fake-terminal gimmick on first load.
- **Zen Garden, grown up:** belongs in the **Remix** framing itself (the Remix panel can nod to it explicitly).

## How prototypes get built (decision)
- Prototypes are **throwaway HTML/CSS in `prototypes/`**, outside `src/`. Never deployed, and the CI guards stay untouched (no loosening).
- Each covers the **hero + first section** at 390px and 1440px.
- The chosen direction gets **rebuilt properly on the token pipeline** in the smoke-test step. That rebuild is the real Remix test.
