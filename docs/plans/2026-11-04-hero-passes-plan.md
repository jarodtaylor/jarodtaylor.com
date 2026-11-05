# Hero passes (Phase 1 step 5, first)

The working list for the hero passes in `docs/WORKFLOW.md` §4. A fresh session starts here: tick items as they land, and log each decision in `docs/DECISIONS.md`.

- **Branch:** `feat/hero-passes` (the fixes PR); the Blocks rethink gets its own branch.
- **Run every pass in all 3 brands**, switching in sequence on one page (clean → backstage → blocks) by `?brand=` and live (`document.documentElement.dataset.brand`), at 390 and 1440 at least.
- **Local evidence** (gitignored): critique report `.impeccable/critique/2026-11-04T22-51-17Z__src-pages-index-astro.md`, screenshots `.impeccable/critique/screens/`. If they're gone (another machine), the summary below is enough.

## Baseline (critique, 2026-11-04)

20/32 (Persuade surface, H7/H10 n/a). Detector: 0 findings on hero markup; `--easing-pop` flagged as bounce easing.

| # | Issue | Where it goes |
|---|---|---|
| C1 | Phone/tablet controls: Peek, Remix, Menu are 36px icon-only; socials 35px. Target ≥ 44px; tool labels inside the menu panel (same DOM) | Fixes PR |
| C2 | Intro flag: Clean (no intro) runs `settle()` → `seen()` (`src/components/Hero/runtime.ts`), so Backstage/Blocks intros never play in that tab. **Decided: once per brand per tab** | Fixes PR |
| C3 | Stale state after a live brand switch (backstage → blocks left the cue label visible once; an amber glow only after live switches). Add a live-switch test per brand pair to `check:hero-runtime`, then fix the cause | Fixes PR |
| C4 | Blocks composition: figure outweighs the name; dead space at 900; EMAIL below the fold at 390 | Blocks rethink |
| C5 | Dead nav links and "Selected work ↓" go to empty anchors | Phase 2, as each section ships |
| C6 | Proof (employers, metrics) | **Not in the hero** (Jarod, 2026-11-04): the micro-bio carries the gist; accomplishments come in the sections below as the home page grows |

Minor, folded into the fixes PR or polish: Peek labels collide (390 `--type-body` tag; 1440 "cap" vs "columns 12"); unrounded `575.65 × 502.31` readout; Clean focus outline has no offset; menu has no scrim or visible close and its lower 60% is empty; Blocks Contact crammed against Peek; header and roles stay small at 2560; Blocks intro pieces cross the nav text; meta description says "Frisco, TX"; no favicon (step 5 owns it).

## Order

Steps in the same row run in parallel.

1. [x] `/impeccable critique` (baseline above)
2. [ ] In parallel, all read-only, findings appended to the tables here:
   - `/impeccable audit` on `src/components/{Hero,Peek,Stage,Header,InfoStrip}`
   - `improve-animations deep` on the hero runtime and CSS (plans into `docs/plans/`); decides `--easing-pop`
   - `break-ui` on the header and hero (long names, missing data, zoom), report only
3. [ ] **Fixes PR** (`/impeccable adapt`, `/impeccable harden`): C1–C3, plus brand-agnostic findings from step 2 that the Blocks rethink won't touch. Simplify → code review → adversarial review → ship
4. [ ] **Blocks rethink** (`/impeccable shape`, code-led, no image comps), own unit. Same markup as the other brands: a DOM change ships to all three, otherwise knobs and enums only. Fixes C4
5. [ ] `/impeccable polish` across all 3 brands; Jarod runs `/review-animations` on the diff
6. [ ] `animation-performance`, only if the plotter or lattice canvases drop frames
7. [ ] Re-run `/impeccable critique` to compare with 20/32

## Step 2 findings

_Appended as each pass returns._
