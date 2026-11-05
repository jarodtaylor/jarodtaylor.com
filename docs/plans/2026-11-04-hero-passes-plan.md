# Hero passes (Phase 1 step 5, first)

The working list for the hero passes in `docs/WORKFLOW.md` §4. A fresh session starts here: tick items as they land, and log each decision in `docs/DECISIONS.md`.

- **Branch:** `feat/hero-passes` (the fixes PR); the Blocks rethink gets its own branch.
- **Run every pass in all 3 brands**, switching in sequence on one page (clean → backstage → blocks) by `?brand=` and live (`document.documentElement.dataset.brand`), at 390 and 1440 at least.
- **Local evidence** (gitignored): critique report `.impeccable/critique/2026-11-04T22-51-17Z__src-pages-index-astro.md`, screenshots `.impeccable/critique/screens/`. If they're gone (another machine), the summary below is enough.

## Baseline (critique, 2026-11-04)

20/32 (Persuade surface, H7/H10 n/a). Detector: 0 findings on hero markup; `--easing-pop` flagged as bounce easing.

| # | Issue | Where it goes |
|---|---|---|
| C1 | Phone/tablet controls: Peek, Remix, Menu are 36px icon-only; socials 35px. Target ≥ 44px; tool labels inside the menu panel (same DOM) | A11y PR (#15) |
| C1b | Jarod, 2026-11-04: Peek and Remix stay icon-only in the phone header bar (44px). **Also** show them in the phone menu panel, apart from the nav links, button-like, icon + word, so the menu teaches what the header icons mean. Same DOM in every brand, hidden from 64rem. Needs `runtime.ts` to drive more than one Peek toggle (shared `aria-pressed`) and the menu to close when Peek opens | Follow-up PR after the two fixes PRs |
| C2 | Intro flag: Clean (no intro) runs `settle()` → `seen()` (`src/components/Hero/runtime.ts`), so Backstage/Blocks intros never play in that tab. **Decided: once per brand per tab** | Runtime PR (#14) |
| C3 | Stale state after a live brand switch (backstage → blocks left the cue label visible once; an amber glow only after live switches). Add a live-switch test per brand pair to `check:hero-runtime`, then fix the cause | Runtime PR (#14) |
| C4 | Blocks composition: figure outweighs the name; dead space at 900; EMAIL below the fold at 390 | Blocks rethink |
| C5 | Dead nav links and "Selected work ↓" go to empty anchors | Phase 2, as each section ships |
| C6 | Proof (employers, metrics) | **Not in the hero** (Jarod, 2026-11-04): the micro-bio carries the gist; accomplishments come in the sections below as the home page grows |

Minor, folded into the fixes PR or polish: Peek labels collide (390 `--type-body` tag; 1440 "cap" vs "columns 12"); unrounded `575.65 × 502.31` readout; Clean focus outline has no offset; menu has no scrim or visible close and its lower 60% is empty; Blocks Contact crammed against Peek; header and roles stay small at 2560; Blocks intro pieces cross the nav text; meta description says "Frisco, TX"; no favicon (step 5 owns it).

## Order

Steps in the same row run in parallel.

1. [x] `/impeccable critique` (baseline above)
2. [x] In parallel, all read-only, findings appended to the tables here:
   - `/impeccable audit` on `src/components/{Hero,Peek,Stage,Header,InfoStrip}`
   - `improve-animations deep` on the hero runtime and CSS (plans into `docs/plans/`); decides `--easing-pop`
   - `break-ui` on the header and hero (long names, missing data, zoom), report only
3. [ ] **Fixes PRs**, split in two: #14 `fix/hero-runtime` (C2, C3, M1–M5, M9, A2, A9) and #15 `fix/hero-a11y` (C1, A1, A4–A6, A10, A11, B2, B7, B8, M8). Each: (`/impeccable adapt`, `/impeccable harden`): C1–C3, plus brand-agnostic findings from step 2 that the Blocks rethink won't touch. Simplify → code review → adversarial review → ship
4. [ ] **Blocks rethink** (`/impeccable shape`, code-led, no image comps), own unit. Same markup as the other brands: a DOM change ships to all three, otherwise knobs and enums only. Fixes C4
5. [ ] `/impeccable polish` across all 3 brands; Jarod runs `/review-animations` on the diff
6. [ ] `animation-performance`, only if the plotter or lattice canvases drop frames
7. [ ] Re-run `/impeccable critique` to compare with 20/32

## Step 2 findings

_Appended as each pass returns._

### improve-animations deep (2026-11-04)

Plans written: `2026-11-04-hero-motion-peek-repress-fade.md` (M1), `2026-11-04-hero-motion-part-release.md` (M4), `2026-11-04-hero-motion-exit-easing.md` (M2, M3). Part-release lands before exit-easing (hard dependency). Frame times fine (p95 ≤ 17.6 ms at 1440 and 2560): step 6 not needed now. `--easing-pop` kept, limited (DECISIONS 2026-11-04).

| # | Sev | What | Where | Fix | Goes to |
|---|---|---|---|---|---|
| M1 | High | Re-pressing Peek during its leave brings it back near-invisible, then it pops (root `--_layer` fade keeps running; arm rule only stops descendants) | `Peek.css:64-68`, `:513-516`; `runtime.ts:48-54` | Plan: peek-repress-fade | Runtime PR (#14) |
| M2 | High | Blocks' Peek leave fade pops: it fades on the draw curve, and Blocks' draw is an out curve, so the 2026-10-26 Peek exit fix never held in Blocks | `Peek.css:67`; `blocks.json:217` | Plan: exit-easing (`in` → `in-out` knob, `0.65, 0, 0.25, 1`) | Runtime PR (#14) |
| M3 | Med | Peek labels retract and cap/baseline labels fade on ease-in: they hang, then snap | `Peek.css:212`, `:393` | Plan: exit-easing | Runtime PR (#14) |
| M4 | Med | Isometric parts return on ease-in when the pointer leaves: lag, then lurch | `Hero.css:851` | Plan: part-release (`--motion-easing-out`) | Runtime PR (#14) |
| M5 | Med | A live brand switch lands at two speeds: 24 colour transitions tween 160–460 ms while the rest cuts | `runtime.ts:522-527`; `Header.css:62,85,111-114`; `Hero.css:175-177` | Add the `settling` class in `onRootChange`'s `data-brand` branch before `start()`, drop it after two frames; C3 test asserts no running transitions | Runtime PR (#14) |
| M6 | Low | Blocks' card menu slides in from off-screen instead of growing from its trigger | `Header.css:217-233`, `:266-280` | Origin top-right, small scale + fade | Blocks rethink |
| M7 | Low | Reduced motion kills every transition, opacity and colour too, so Peek is a hard cut; `ms()` ≈ 0 under it | `reset.css:44-54`; `runtime.ts:20-27` | Keep gentle fades under reduced motion | Polish |
| M8 | Low | Header tool hover isn't gated by `(hover: hover) and (pointer: fine)` (sticks after a tap); Peek icon hover rotation 600 ms | `Header.css:135-142`, `:165-176` | Copy the gate from `Hero.css:845` | A11y PR (#15) |
| M9 | Low | During the intro's leave, keys and pointer can't skip but the Skip button can | `runtime.ts:137-141` | Make them consistent | Runtime PR (#14) |

C3 root cause: the cue label goes stale only on backstage → blocks, a Chromium style-query bug under `display: none` (`.cue` is `display: none` under `hero-cue: none`, `Hero.css:295-306`, `:343-349`). Fix: take `.cue` out of flow instead of hiding it, as the figure does. The amber glow didn't reproduce.

C2 interaction: `intro-arm.js` can read `data-brand` (the brand script runs first) for a per-brand key. `onRootChange` calls `settle()` → `seen()` after `data-brand` changed, so with per-brand keys it would mark the new brand seen without playing its intro: mark only the brand whose intro actually ran. A live switch never starts an intro (keep).

### break-ui (2026-11-04)

Nothing breaks with today's data (fixed name, 4 roles, 5 nav links) in any brand from 320 to 2560 or at 200%/400% zoom. Realistic changes: roles, bio, socials, nav. Screenshots `.impeccable/critique/screens/break-*.png`.

| # | Sev | Where | What | Fix | Goes to |
|---|---|---|---|---|---|
| B1 | P1 | blocks 768+ | The solid figure already sits under the last role ("DEVELOPER EXPERIENCE" over the orange shape); a 5th role makes it worse. Backstage milder | Cap the roles row to the text column, or a figure left-edge token | Blocks rethink |
| B2 | P1 | all, 320–390, 400% zoom | `.roles li` is `white-space: nowrap` (`Hero.css:131`): a 40–55 char role clips and widens the row | Wrap below 48rem (`overflow-wrap: anywhere`, `min-inline-size: 0`); nowrap only from 48rem | A11y PR (#15) |
| B3 | P2 | Peek, clean 1024/1440 | "Hero scale" panel sits over the name; cap rule strikes `--page-x`, "cap" hits "cols" | No room below the name at 1440×900 (roles, then socials); above it fits only at ≥ 900 tall. Needs a layout call Jarod sees | Polish |
| B4 | P2 | Peek, blocks 768+ | Scroll cue overlaps the Hero scale panel | Move panel or cue under a Peek-only token | Blocks rethink |
| B6 | P3 | all 768+ | `.name` nowrap from 48rem (`Hero.css:75-77`) clips a wider name. Not realistic | Skipped: `overflow-wrap` can't act under the one-line `nowrap`, and dropping that breaks the one-line name | Skipped |
| B7 | P3 | blocks, backstage 768+ | `.tagline` nowrap from 48rem (`Hero.css:217-219`) runs under the figure at ~120 chars | Wrap with `text-wrap: balance` and a max-inline-size | A11y PR (#15) |
| B8 | P3 | 320 | A 35–60 char handle widens the social row (backstage) | `overflow-wrap: anywhere` on `.social a` | A11y PR (#15) |
| B9 | P3 | backstage 1440, text 200% | Contact overlaps Peek (CSS-emulated; real Chrome font-size likely folds the nav) | Verify with real font-size setting first | A11y PR (#15), verify |

Held up: zoom, 320px, 2560, 7 roles (except B1), missing bio/socials/status, menu popover, Peek readouts. Not real risks: RTL, Japanese, emoji (B11), bio/social box touching at text 200% (B5, B10).

### Impeccable audit (2026-11-04)

18/20 (a11y 3, perf 4, responsive 3, theming 4, integrity 4). Detector 0, `check:contrast` passes, axe only two moderates. Screenshots `.impeccable/critique/screens/audit-*.png`.

| # | Sev | Where | What | Fix | Goes to |
|---|---|---|---|---|---|
| A1 | P1 | all, phone menu | Tabbing out of the open menu leaves the popover up and focus moves behind it (WCAG 2.4.11); clean 390 hides GitHub and the handle. `Header.tsx:29,58`, `Header.css:203-284` | `hidePopover()` on a `focusout` that leaves `#nav-list` | A11y PR (#15) |
| A2 | P1 | backstage (`--hero-ground: plotter`), 390 | Plotter head, trail and `gNN · mNN` label walk through the bio (~9 s of every 36 s; worst pixel 1.34:1). `plan()` excludes by column fraction only (`runtime.ts:363-376`) | Reject any route whose stops, L-shaped segments or readout cross the text boxes (`.name-block`, `.roles`, `.tagline`, `.bio`, `.social`; `.stack` spans the whole grid); hold for a pause when none is clear | Runtime PR (#14) |
| A3 | P2 | backstage lead and name, blocks name | Viewport-only sizes ignore the user's font-size setting (WCAG 1.4.4): `backstage.json:195-196,200` (`35vw`, `min(12.5vw, 21svh)`, `min(2.6vw, 4.4svh)`); blocks' `max(3.5rem, …)` floor never binds | Add a rem term in the knobs (`clamp(Xrem, Yrem + Nvw, Zrem)`) | A11y PR (#15) (backstage lead); blocks name → Blocks rethink |
| A4 | P2 | clean 1440 | Lattice lines inside the mark cross the bio (worst pixel 2.15:1); in-mark alphas hard-coded (`runtime.ts:255,260`) | Knob for the in-mark alpha, or the name's halo on `.details` under `@container style(--hero-figure: lattice)` | A11y PR (#15) |
| A5 | P2 | all | 404 has no h1 and no header (`404.astro:7`, SectionShell renders h2) | SectionShell level prop; add `<Header/>` | A11y PR (#15) |
| A6 | P3 | all | "Open to new roles" sits outside every landmark (`index.astro:24`) | Move it inside `<header>` or `<main>` (same DOM for all brands) | A11y PR (#15) |
| A7 | P3 | backstage, blocks | Clean's two font preloads (~35 KB) download in every brand (`Base.astro:59`) | Preload from the brand script, or accept | A11y PR (#15), optional |
| A8 | P3 | blocks 390 | Menu items 33px tall (others 46–47) | Blocks menu-item inset knob | Blocks rethink |
| A9 | P3 | backstage 1440 | Plotter label at `pos.x+14` clips at the right edge (`runtime.ts:441-448`) | Flip left when there's no room | Runtime PR (#14), with A2 |
| A10 | P3 | code | Dead `opacity: 0.3` with a stale comment (`Hero.css:411`, overridden at `:672`) | Delete | A11y PR (#15) |
| A11 | P3 | all | X link is named "@jarodtaylor" with no platform; Remix doesn't say it goes to /lab/ | Visually hidden "X"; "Remix (token lab)" | A11y PR (#15) |

Critique items: C1 confirmed (36×36 tools in clean/backstage at 390, blocks 47; socials 35–36px; backstage mark 23×36). C2 confirmed. **C3 not reproduced at rest** across all 6 brand pairs: the test should switch mid-intro and mid-Peek. "Clean focus outline has no offset" **refuted** (2px everywhere, `base.css:46`).

Works: reduced motion (no intro, still canvases, Peek lands), reflow at 320 and 400% zoom, keyboard and skip link, 60 fps with ≤ 4.1% main-thread busy and canvases pausing off-screen, forced colors, one h1 and aria-hidden figures. Not checked: canvas cost at DPR 2, a real screen reader, zoom on a 1920 screen.

## Follow-ups found while building the fixes

- **Clean header at 200% text on a 390 screen** cuts Menu off (header 408px; blocks 469px, which goes to the Blocks rethink). Already true on `main`.
- **A3 (backstage type ignores the reader's font size) is not fixed: #15 tried rem floors, and review found they broke the short-screen `svh` cap and grew the type at 768–1023px, so it was reverted.** The exact fix is `calc(<today's value> + 1rem - 16px)`: identical at 16px, follows the font everywhere, keeps the cap. It needs `derive.ts` to accept px in fluid lengths. Jarod's call. Browser zoom already scales this text.
- **B6** (a wider name clips from 48rem) skipped: wrapping would break the one-line name. **B7** partial: a 120-character tagline wraps but still reaches the figure (measure ≈ 1020px in backstage at 1440).
- **`check:hero-runtime` takes ~1.6 min** (was ~20 s): the plotter pixel scans and the live-switch matrix's extra page loads. Caching `restingCue` per brand would cut it without weakening the tests.
- **C1b** (Peek and Remix also in the phone menu) after both fixes PRs merge.

