# Workflow map

Answers Q10–Q12 in `DECISIONS.md` (approved 2026-10-28). The default loop is Compound Engineering (CE). Impeccable and Emil Kowalski's skills plug into it at fixed steps. Repo rules (`CLAUDE.md`) beat every skill.

**Manual-only** (`disable-model-invocation`, so the agent can't start them): Jarod runs `/ce-polish`, `/ce-dogfood`, `/review-animations`, `/codex:adversarial-review`.

**Emil's skills** (all from github.com/emilkowalski/skills, installed in `~/.agents/skills`): `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `animation-performance`, `animation-vocabulary`, `apple-design`, `break-ui`, `prototype`, plus ones we won't use here (`animate-expo`, `write-swift`, `mobile-native`, `pick-ui-library`, `ask-sonner`).

**Name clash:** `/animate` is Emil's skill. `/impeccable animate` is Impeccable's. Always write the full name.

## 1. The loop

| Step | CE skill | Design / motion at this step | Output | Gate to next step |
|---|---|---|---|---|
| 0. Brainstorm (only if the what is unclear) | `ce-brainstorm` | `/impeccable shape` for any new surface or section: discovery interview, then a design brief with no code | Requirements doc + shape brief | Jarod approves the brief |
| 1. Plan | `ce-plan` | Name the Impeccable commands each unit will run. Motion units get a motion thesis (from `/impeccable animate`: focal moment, continuity, feedback, budget); `find-animation-opportunities` (read-only) lists what should and shouldn't move. `animation-vocabulary` names effects when briefing. For a new section inside the site, use `new-work` "extend an existing surface": no concept tournament, no DESIGN.md change | Plan in `docs/plans/` | Plan states brands touched, tokens added, checks to run |
| 2. Work | `ce-work` | Build with `/impeccable <command>` for the unit (`layout`, `typeset`, `colorize`, `adapt`, `harden`) and Emil `/animate` for each motion piece. Detector hook runs on every edit. Live tweaking: Jarod runs `/ce-polish` (dev server up, not on main), and inside it `/impeccable live` or `/impeccable generate` | Code on a feature branch | `pnpm test && pnpm typecheck && pnpm check` green. Each page checked at 390 / 1440 / 1920 / 2560 in all 3 brands |
| 3. Design review (new step, every UI PR; an agent runs it and Jarod sees only P0/P1) | none | `/impeccable critique <page>` (two isolated subagents + detector, saves a snapshot), then `/impeccable audit`. Motion changed: Jarod runs `/review-animations`. Frames drop: `animation-performance` | Critique snapshot in `.impeccable/critique/`, audit report | No open P0/P1 findings, or Jarod waives them |
| 4. Polish | none (`/ce-polish` if live work with Jarod) | `/impeccable polish` reads the critique snapshot as its backlog. `break-ui` for long names, empty lists, huge counts. `remove-animations` if motion feels like too much | Fix commits | Guardrails green again |
| 5. Simplify | `ce-simplify-code` | none (behaviour-preserving; must not change output CSS) | Tidy commit | Guardrails green |
| 6. Code review | `ce-code-review` | none. Design is already reviewed in step 3 | Review fixes | No open blocking findings |
| 7. Adversarial review | Jarod runs `/codex:adversarial-review` | Brief it like `docs/design/codex-review-brief.md` | Findings list | Material findings fixed or logged in DECISIONS |
| 8. Ship | `ce-commit-push-pr`, then `ce-resolve-pr-feedback` | none | PR | CI green |
| 9. Compound | `ce-compound` | Design lessons also go to `tasks/lessons.md` and DECISIONS | Learning under `<root>/solutions/` | none |

Notes:
- CE has no Impeccable hook of its own. `ce-work` only does a desktop + mobile browser check for UI. Steps 3 and 4 exist because of that gap.
- `ce-noslop` is for prose (posts, copy). It does not check UI.
- The toolbelt card marks `lfg` manual; the installed `lfg/SKILL.md` (3.33.1) has no flag. The installed copy wins; we don't use `lfg` here anyway.

## 2. Who owns what

| Area | Owner | Secondary / don't use | Why |
|---|---|---|---|
| Colour / palette | Token pipeline: knobs → `derive()` → `check:contrast` + ΔE fixture | `/impeccable colorize` for strategy only (roles, dosage, temperature). Its output becomes knob and role-pick edits | Brands differ only through knobs. Colorize emits literal colours |
| Typography | `/impeccable typeset` | `apple-design` (optical sizing, tracking, leading) | Typeset has a role-scale method plus a `--scope type` detector pass |
| Layout | `/impeccable layout` + `/impeccable adapt` | none | Covers rhythm, wide screens and DOM/visual-order checks |
| Motion design | Emil `/animate` for each piece | `/impeccable animate` only for the motion thesis and picking the signature moment. Don't use it to write the code | Emil's sequence is stricter and his Hard Rule 3 says extend the existing tokens |
| Motion review | Emil `/review-animations` (Jarod runs it) | `improve-animations` for a read-only audit of all motion | "Default to flagging" bar, aimed at a diff |
| Motion performance | Emil `animation-performance` | `/impeccable optimize` for images, fonts, bundle size. Lighthouse CI is the final word | Emil covers pipeline cost; Impeccable covers page load |
| Accessibility | Repo guardrails: axe, `check:contrast`, keyboard + reduced-motion walk | `/impeccable audit` (a11y score) | Guardrails run in CI; audit only reports |
| DESIGN.md | Generated from `public/tokens/<brand>.json` (PLAN Phase 0). Generator gets built in Phase 1 step 5 | Don't use `/impeccable document` or `impeccable-documenter` | Both write one brand's literal values. That's a second source of truth |
| Anti-slop | `impeccable detect` (`check:slop` + hook) and Impeccable's craft floor | `/impeccable critique` for what a detector can't see | Mechanical in CI, judgment in review |

## 3. What Impeccable gives us that we skipped last time

- **A critique of the hero.** `.impeccable/` has no `critique/` folder, so no snapshot exists. `/impeccable critique src/pages/index.astro` gives a scored review and a snapshot that `polish` uses as its backlog.
- **Palette strategy before hand-fitting ramps.** `/impeccable colorize` sets roles, dosage and temperature first. It also asks to check contrast in every state (hover, focus, overlays) and to simulate colour-vision deficiencies. Our gate only checks `surface.*` pairs.
- **A motion thesis before motion code.** `/impeccable animate` asks for one focal moment, the continuity and feedback jobs, and a budget, then a reduced-motion path that keeps state changes visible.
- **Variants in the browser instead of hand-rolled rounds.** `/impeccable generate 3 quieter <element>` or `/impeccable live` hot-swaps variants on the dev server and writes the accepted one back to source.
- **Targeted detector scopes.** `impeccable detect --json --scope type` and `--scope layout`, beside the full run.
- **A technical audit.** `/impeccable audit` scores a11y, performance, theming, responsive and anti-patterns.
- **A menu of next steps.** Bare `/impeccable` reads project signals and suggests the 2–3 commands worth running.

## 4. Proposed passes on the shipped hero (before Phase 1 step 5)

Proposal only, nothing run. Run each in all 3 brands, switching in sequence on one page (clean → backstage → blocks), not only fresh loads.

1. `/impeccable critique src/pages/index.astro`: baseline score and snapshot.
2. `/impeccable audit` on `src/components/{Hero,Peek,Stage,Header,InfoStrip}`.
3. `improve-animations deep` on the hero runtime and CSS. It is read-only and writes plans, not code.
4. `break-ui` on the header and hero: long names, missing data, zoom.
5. `/impeccable polish` on the hero. It works through the critique backlog and the chosen motion plans.
6. Jarod runs `/review-animations` on the polish diff.
7. `animation-performance`, only if the plotter or lattice canvases drop frames.

Left out: `impeccable-finish-reviewer`. It reviews against a direction contract. The only surface brief (`.impeccable/surfaces/`) is the superseded Assembly Manual prototype, not the shipped Remix hero. PLAN Phase 1 step 4 says the locked prototype and its screenshots are the critique and finish-review reference, so write a `surface-brief` for `src/pages/index.astro` from that first, then add the reviewer as step 8.

## 5. Conflicts with project rules

| Skill behaviour | Rule broken | Handling |
|---|---|---|
| Emil `/animate` takes curves and durations from his tables. `/impeccable animate` has its own timing table and `cubic-bezier(0.16, 1, 0.3, 1)` | Tokens-only CSS | New values become knobs (easing as `"x1, y1, x2, y2"`, durations in s) or `motion.*` semantic aliases. CSS reads `--motion-*`. Stylelint enforces it |
| Emil standard 7: animate transform and opacity only. Impeccable craft floor: reach for blur, clip-path, mask | They disagree with each other | Emil's `animation-performance` decides each effect against the PLAN budget. Record the call in DECISIONS |
| Emil standard 4: UI motion under 300 ms | Our hero intro and Peek run longer | His own "rare / first-time can have delight" tier covers a once-per-tab intro. Record it so a review doesn't block it |
| `/impeccable colorize`, `extract` write literal hex or OKLCH, or new token files | Brands author knobs only; semantic and component tiers are aliases | Turn the output into knob or role-pick edits. Update `scripts/fixtures/prototype-colors.json` when the ΔE match changes on purpose |
| `/impeccable document`, `impeccable-documenter` write single-brand DESIGN.md + `.impeccable/design.json` | One source of truth per tier | Don't run them. Generate DESIGN.md from the token build (to-do) |
| Design-system drift check in the detector | Flags the other two brands as drift | Keep `--no-design-system` (already in `check:slop`) |
| `live` / `generate` write raw HTML+CSS variants with markers into source; colorize variants use `var(--p-color-amount)` | Tokens-only CSS, readable output | Expect lint failures while markers are in. Same for copy edits written back by `impeccable-manual-edit-applier`. After accept, rewrite the variant in tokens. Switch all 3 brands before accepting: a variant that only works for one brand breaks Remix |
| Variants or polish that change markup for one look | DOM order invariant across brands | Any markup change ships to all brands. `check:markup-invariance` must pass. Never key on `[data-brand]` |
| Craft floor bans eyebrows. `Card` has an `eyebrow` prop (used in `lab.astro`) | Not a CLAUDE.md rule. Impeccable will push against it in craft-floor edits (unclear whether the detector flags it) | Drop the `eyebrow` prop |
| Emil's Framer Motion, `useSpring` and Tailwind sections | No client JS by default, no Tailwind | Not applicable. Use the CSS / WAAPI paths |
| `new-work` comp-led path, image comps, `impeccable-asset-producer` | Lesson: design in code, no comps. `buildPath: "code"` | Code-led only. Say "no image comps" in every Impeccable brief |
| `improve-animations` writes plans to `plans/` | CE plans live in `docs/plans/` | Point it at `docs/plans/` when invoking |
