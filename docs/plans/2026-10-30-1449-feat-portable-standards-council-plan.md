---
title: Portable Standards and Review Council - Plan
type: feat
date: 2026-10-30
topic: portable-standards-council
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
---

# Portable Standards and Review Council - Plan

## Goal Capsule

- **Objective:** any agent, in any harness, started cold in a fresh clone, works on this repo by its standards from the first turn, and two site-specific review roles can be run by any model before a PR opens.
- **Product authority:** Jarod. This plan covers the pre-PR side of Q15. The CI last gate (AI reviewers in GitHub Actions, merge enforcement) and general cross-harness memory (agent-os) are not active scope.
- **Open blockers:** none.

---

## Product Contract

### Summary

The repo becomes the single place an agent learns how to work here: one canonical instructions file with thin per-harness pointers, Jarod's engineering rules moved in from his laptop, and a workflow that still makes sense without Claude-only skills. More standards become automatic checks every harness hits. Two review roles live as plain repo files, with `pnpm council` to run them locally.

### Problem Frame

The standards that keep this site coherent live partly in the repo and partly in places only one Claude Code install can see: Jarod's global instructions, per-project memory, handoffs, and the skills `docs/WORKFLOW.md` depends on. Several key repo files are still untracked. The instructions a cold agent reads first point it at Entire, a tool being dropped. As work goes async (a Codex session building a feature while Jarod works with Claude elsewhere), an agent from another harness arrives with habits from elsewhere, and a review after the fact can only catch part of the drift. Nothing has slipped yet; this closes the gap before it does.

### Key Decisions

- **Repo is the source of truth; review is the second net.** (session-settled: user-approved — chosen over making a portable council plus a CI-checked receipt the centrepiece: a cold agent must read the same rules before it starts, and the code's author can also write a receipt.) Governs R1–R6.
- **Standards become automatic checks before they become reviewer prompts.** Checks are free, instant, and run in every harness's CI. Governs R8.
- **Role specificity over model count.** A reviewer's role and instructions drive what it finds; one other-model pass (the existing Codex adversarial review) covers shared blind spots. (session-settled: user-directed — chosen over a four-model council: same-model reviewers with distinct roles diverge usefully.) Governs R9–R11.
- **Two roles now.** Design System & UX Purist; Frontend Architect & Core Web Vitals, which also covers hydration and islands. DX & Content Infrastructure joins in Phase 2. (session-settled: user-approved — chosen over three or four roles: there is little content infrastructure to review yet.) Governs R9.
- **No receipt or merge block in this plan.** (session-settled: user-approved — chosen over a CI-checked council receipt: the author can write it and it goes stale on every fix commit; enforcement belongs to the CI last gate, where reviewer ≠ author.) Governs R11.
- **Entire is out.** (session-settled: user-directed — chosen over keeping Entire optional: too expensive; repo docs replace its memory.) Governs R4.
- **Public signal, private noise.** Rules, decisions, plans, lessons and review roles are tracked and public. Working noise (handoffs, brainstorm and research scratch, review run output, back-and-forth) stays local and gitignored. (session-settled: user-directed — chosen over tracking everything: the public repo pulls the curtain back only on signal and decisions.) Governs R5, R6.
- **Engineering rules only go public.** Personal working style (CEO/CTO framing, reply length, model routing) stays on Jarod's machine. (session-settled: user-approved — chosen over moving everything, and over a private companion repo.) Governs R3.

### Requirements

**One source of truth**

- R1. `AGENTS.md` is the canonical instructions file. Every harness reaches it: natively where supported, otherwise through a thin pointer that adds only what that harness uniquely needs.
- R2. Every file a cold agent needs to follow the standards is tracked in git (today `AGENTS.md`, `docs/WORKFLOW.md` and `docs/plans/` are untracked).
- R3. Jarod's harness-neutral engineering rules (feature branches and PRs, root-cause fixes, verify before claiming done, simplicity first, log decisions, no calendar estimates) live in the repo.
- R4. Nothing a cold agent reads, and no tracked hook or config, depends on Entire.
- R5. A written rule says which files are public signal and which are private noise, so every agent sorts new files the same way.
- R6. Private noise has a local, gitignored home that survives day to day but is never committed.

**Workflow without skills**

- R7. `docs/WORKFLOW.md` describes each step in plain language an agent without Compound Engineering, Impeccable or Emil's skills can carry out by hand, alongside the skill that automates it.

**Automatic checks**

- R8. Standards that can be checked mechanically are enforced by `pnpm check` and CI, starting with two rules `CLAUDE.md` states but nothing checks today: an allowlist for `client:*` directives, and no scoped `<style>` blocks in `.astro` files. (Brand-keyed CSS is already caught by the tokens stylelint plugin.)

**Review roles**

- R9. Two review roles exist as harness-neutral repo files: Design System & UX Purist, and Frontend Architect & Core Web Vitals (including hydration and islands). Each names what it checks, where to be critical, and how to report.
- R10. Any model in any harness can perform a role from its file alone, with no skills installed.
- R11. `pnpm council` runs both roles locally against the current branch's diff, on Jarod's own Claude and Codex subscriptions, and writes findings to the private noise area. It is a convenience, not a merge gate.

### Acceptance Examples

- AE1. **Covers R1–R4, R7, R9, R10.** Given a fresh clone with no `~/.claude` and no installed skills, when a Codex session reads `AGENTS.md`, then it correctly explains the tokens-only rule and the three-brand rule, runs `pnpm check`, and performs the Design System & UX review by hand, without mentioning Entire.
- AE2. **Covers R8.** Given a PR that adds `client:load` to a component not on the allowlist, or a scoped `<style>` block to a page, then `pnpm check` and CI fail and name the file.
- AE3. **Covers R5, R6.** Given an agent creating a handoff or a review report, then the file lands in a gitignored location; given a new decision, then it lands in `docs/DECISIONS.md`.
- AE4. **Covers R11.** Given a branch with changes, when Jarod runs `pnpm council`, then both roles report findings on that diff and nothing is committed or posted.

### Scope Boundaries

- **The CI last gate** (Claude/Codex/Cursor/Copilot reviewing PRs in GitHub Actions) and any merge enforcement: its own brainstorm (Q15b; billing research is logged there).
- **General cross-harness memory and context sync:** agent-os.
- **DX & Content Infrastructure role:** Phase 2, when content collections and MDX arrive.
- **Uninstalling the Entire CLI and its local data** on Jarod's machine: Jarod's call; the plan lists the steps but runs none of the setup commands.
- **Committing handoffs:** they stay private noise.
- **Considered and not built: a per-run model override for `pnpm council`.** The role-to-model pairing is fixed in the script; editing it is cheap if a swap is ever wanted.

### Dependencies / Assumptions

- The Claude Code and Codex CLIs are installed and logged in on Jarod's machine for `pnpm council`; on another machine the role files are still usable by hand (R10).
- Codex, Cursor and Copilot read `AGENTS.md` natively; Claude Code needs an include from `CLAUDE.md` (KTD1, KTD2).

### Outstanding Questions

**Deferred to Planning**

- Where the public/private rule and the engineering rules live: inside `AGENTS.md` or a linked `docs/` file.
- Which further standards become checks beyond the two named in R8.
- How `pnpm council` invokes each CLI non-interactively, and where its reports go.
- Which `.impeccable/` and `.claude/` files are signal versus noise.

### Sources / Research

- `docs/DECISIONS.md` Q15 (the two-part council idea and the last-gate billing research).
- `CLAUDE.md`, `.claude/settings.json`, `.entire/agent-guide.md` (Entire dependencies).
- `docs/WORKFLOW.md` (skill-dependent loop), `tasks/lessons.md`, `docs/design/codex-review-brief.md` (template for a role file).
- `.github/workflows/ci.yml`, `package.json` `check:*` scripts, `stylelint.config.js` (existing mechanical guardrails).

---

## Planning Contract

Product Contract preservation: clarified, no scope change. R1 now says "natively where supported, otherwise a thin pointer" instead of naming Cursor and `GEMINI.md` pointers, because research showed Cursor reads `AGENTS.md` natively (KTD2). R2 no longer lists the Codex brief, which the role files replace (KTD6). R8's first two rules are confirmed by research (CLAUDE.md states "no `client:*` unless a component truly needs JS" and "no scoped `<style>` in `.astro` files"; nothing checks either today).

### Key Technical Decisions

- KTD1. **`AGENTS.md` is self-contained; `CLAUDE.md` is `@AGENTS.md` plus Claude-only notes.** Claude Code reads `AGENTS.md` only when no `CLAUDE.md` exists, so the include is required; other harnesses have no import mechanism, so `AGENTS.md` can't depend on includes. Codex truncates instructions at 32 KiB, so `AGENTS.md` stays well under that (today's `CLAUDE.md` is ~10 KiB). Governs R1.
- KTD2. **Per-harness pointers only where a harness doesn't read `AGENTS.md`.** Codex, Cursor and Copilot (cloud agent, CLI, GitHub.com review) read it natively. Gemini CLI's docs say it was replaced by Antigravity CLI on 2026-06-18: check Antigravity's current docs in U2 and add a pointer (e.g. `.gemini/settings.json` with `context.fileName: ["AGENTS.md"]`) only if a current tool needs one, logging the result in `docs/DECISIONS.md`. No `.cursor/rules/` or `copilot-instructions.md` duplicates. Governs R1.
- KTD3. **`.local/` is the one gitignored home for private noise**: `.local/handoffs/`, `.local/council/`, `.local/scratch/`. Harness-neutral, so any agent can use it; replaces `.claude/handoffs/`. Governs R5, R6.
- KTD4. **Entire is removed from everything tracked or read by agents; Entire's local data is gitignored, not deleted.** That means the `CLAUDE.md`/`AGENTS.md` include blocks, `.claude/settings.json` (only Entire hooks, so the file goes), and the obsolete `entire-cli` memory. Deleting `.entire/` and uninstalling the CLI stay Jarod's call. Governs R4.
- KTD5. **One new check, `check:astro`, scans `src/**/*.astro`** for `client:*` directives not on an allowlist (empty today) and for `<style>` blocks other than `is:inline`. It follows the `check-contrast.ts` split: pure logic module + Vitest test + thin CLI. Governs R8.
- KTD6. **Roles are `docs/review/<role>.md`, generalised from `docs/design/codex-review-brief.md`**: scope, ignore list, ordered review targets with "what to look for", and a report contract (file:line, failure scenario, fix, no nits). The PR-specific brief moves to `.local/`. Governs R9, R10.
- KTD7. **`pnpm council` runs each role once, on alternating models**: Design System & UX Purist on `claude -p`, Frontend Architect & Core Web Vitals on `codex exec`. Both read-only (`--tools Read,Grep,Glob` / `-s read-only`), fed the role file plus `git diff main...HEAD` on stdin, subscription auth (never `claude --bare`, which needs an API key). Claude runs with `--output-format json` and `is_error: true` counts as a failure; Codex is checked with `codex login status` first, so an auth error is never saved as a review. Output goes to `.local/council/<branch>-<short-sha>/<role>.md`. Governs R11. (session-settled: user-directed — role specificity over model count.)
- KTD8. **`CONTENT.md` and `IDEATION.md` are deleted once their content is confirmed elsewhere** (`docs/PLAN.md`, `docs/DECISIONS.md`, `src/content/`); anything not covered moves into the doc it belongs in first. (session-settled: user-directed — chosen over archiving them in a deprecated folder: Jarod keeps copies, and git history has them.)

### Sequencing

U1 (noise rules first, so later units know where files go) → U2 → U3 → U4 → U5 → U6 → U7. U4 needs U2 (it edits the rewritten `AGENTS.md`) but can run before U3.

---

## Implementation Units

### U1. Public/private rule and `.local/`

- **Goal:** every agent knows which files are public signal and which are private noise, and noise has a gitignored home.
- **Requirements:** R5, R6, AE3; KTD3.
- **Dependencies:** none.
- **Files:** `.gitignore`; `AGENTS.md` (a "Public signal, private noise" section); tracked noise removed from the index: `.impeccable/review/*.png`; `.impeccable/hook.cache.json` and `.impeccable/questions/` added to `.gitignore`; `.claude/handoffs/` contents moved to `.local/handoffs/`.
- **Approach:**
  1. The rule lists what is signal (rules, decisions, plans, lessons, review roles, design references the build depends on) and what is noise (handoffs, brainstorm/research scratch, review and council output, session state, screenshots), with `.local/` as the default for anything unsure.
  2. Update the handoff rule (now in `CLAUDE.md`, moving to `AGENTS.md` in U2) to `.local/handoffs/`.
- **Test scenarios:** Test expectation: none -- configuration and docs; verified by `git status` and `git check-ignore`.
- **Verification:** `git check-ignore` matches each noise path; `git ls-files` shows no `.impeccable/review/` PNGs; the existing handoff is readable at its new path.

### U2. `AGENTS.md` canonical, `CLAUDE.md` thin

- **Goal:** one complete instructions file any harness reads, with Claude-only material split off.
- **Requirements:** R1, R2, R3, R4, AE1; KTD1, KTD2, KTD4.
- **Dependencies:** U1.
- **Files:** `AGENTS.md` (rewrite), `CLAUDE.md` (rewrite), `.gemini/settings.json` (new, only if KTD2's check says so), `.claude/settings.json` (delete), `.gitignore` (`.entire/`), `tasks/lessons.md` (the Entire-review lesson heading reworded as a code-review lesson; its content stays).
- **Approach:**
  1. Move every harness-neutral section of today's `CLAUDE.md` into `AGENTS.md` (commands, architecture, token pipeline and rules, CSS rules, decisions log, three brands, workflow pointer, handoffs). Fix the stale "Vitest (`scripts/derive.test.ts`)" row: there are four test files (three under `scripts/`, plus `src/lib/monogram.test.ts`).
  2. Add an "Engineering rules" section from Jarod's global instructions, rephrased for any agent: feature branches named `<type>/<desc>`, PR-only to main, commit messages say why, read before editing, simplicity and minimal impact, prefer existing patterns, root-cause fixes, verify before claiming done (tests, types, behaviour diff vs main), stop and re-plan when an approach fails, verify APIs against current docs, no calendar estimates (scope and exit criteria), log decisions and close questions with a date, add a lesson to `tasks/lessons.md` after any correction. No personal working style (Product Contract decision: engineering rules only go public).
  3. `CLAUDE.md` becomes `@AGENTS.md` plus a short Claude-only section: where skills fit (`docs/WORKFLOW.md`), the `find-docs`/Context7 skill for doc lookups, plan mode for non-trivial work.
  4. Remove both Entire include blocks; delete `.claude/settings.json`; gitignore `.entire/`.
  5. Commit the previously untracked signal: `AGENTS.md`, `docs/WORKFLOW.md`, `docs/plans/`.
- **Patterns to follow:** today's `CLAUDE.md` structure and voice.
- **Test scenarios:** Test expectation: none -- documentation; U7 is the behavioural proof.
- **Verification:** `git grep -nE 'Entire|\.entire|entire (brain|hooks)' -- AGENTS.md CLAUDE.md docs/WORKFLOW.md docs/review .github package.json` finds nothing (history records in `docs/DECISIONS.md`, `tasks/lessons.md` and `docs/plans/` are exempt, as is the `.gitignore` line); `AGENTS.md` is under 32 KiB; a Claude Code session in the repo still loads the rules via the include.

### U3. `WORKFLOW.md` without skills

- **Goal:** each workflow step can be done by hand by an agent with no skills installed.
- **Requirements:** R7, AE1.
- **Dependencies:** U2.
- **Files:** `docs/WORKFLOW.md`.
- **Approach:**
  1. Add a "By hand" column to the loop table: what the step produces and the repo files or commands that do it (for example design review → `docs/review/design-system.md`; checks → `pnpm test && pnpm typecheck && pnpm check`; compound → a lesson in `tasks/lessons.md` and a row in `docs/DECISIONS.md`).
  2. Keep section 5 (skill output vs repo rules) as is: it is the most useful skill-free content.
  3. Mark sections 3–4 as "Claude with skills installed".
- **Test scenarios:** Test expectation: none -- documentation.
- **Verification:** every loop row has a non-skill path that names a repo file or command.

### U4. `check:astro`

- **Goal:** the two unchecked `.astro` rules fail CI when broken.
- **Requirements:** R8, AE2; KTD5.
- **Dependencies:** U2.
- **Files:** `scripts/astro-rules.ts`, `scripts/astro-rules.test.ts`, `scripts/check-astro.ts` (new); `package.json` (`check:astro`, added to `check`); `.github/workflows/ci.yml` (step with the static checks); `AGENTS.md` command table.
- **Approach:**
  1. `astro-rules.ts` takes file paths and contents, returns violations: a `client:` directive on a component not in the allowlist (an exported constant, empty today, with a comment on how to add one), or a `<style` tag without `is:inline`.
  2. `check-astro.ts` globs `src/**/*.astro`, prints `✖ <file>:<line> …` with a fix hint, exits 1 on any violation.
- **Patterns to follow:** `scripts/check-contrast.ts` + `scripts/contrast.ts` + `scripts/contrast.test.ts`.
- **Test scenarios:**
  - Covers AE2. A page with `<Hero client:load />` and an empty allowlist: one violation naming the file, line and component.
  - The same page with `Hero` on the allowlist: no violation.
  - A page with `<style>` (scoped): one violation; with `<style is:inline>`: none.
  - `client:` inside an HTML comment or a string in frontmatter is not flagged.
  - The current repo passes.
- **Verification:** `pnpm check:astro` passes on main; adding a scoped `<style>` to a page makes it fail with the file and line.

### U5. Review role files

- **Goal:** two roles any model can perform from the file alone.
- **Requirements:** R9, R10; KTD6.
- **Dependencies:** U2.
- **Files:** `docs/review/README.md` (how to run a role by hand: give a model the role file and the diff), `docs/review/design-system.md`, `docs/review/architecture.md` (new); `docs/design/codex-review-brief.md` moved to `.local/`.
- **Approach:**
  1. Each role: purpose, what it ignores (anything the checks already catch), ordered targets with what to look for, how to be critical, and the report contract.
  2. Design System & UX Purist: token-tier discipline beyond lint, component encapsulation, three-brand behaviour (the per-section "where would other brands differ" answer), a11y beyond axe (focus order, reduced motion, keyboard), DOM-order invariance intent.
  3. Frontend Architect & Core Web Vitals: hydration and islands (why each `client:*` earns its place), DOM size, bundle and asset pipeline, layout shift, routing, readable output settings, runtime JS lifecycles (listeners, observers, teardown).
  4. Each cites the `AGENTS.md` rules it enforces instead of restating them.
- **Patterns to follow:** `docs/design/codex-review-brief.md` (structure and report contract).
- **Test scenarios:** Test expectation: none -- prompts; U6 runs them and U7 proves a cold model can follow them.
- **Verification:** each role file stands alone (no skill names required) and names its report format.

### U6. `pnpm council`

- **Goal:** one command runs both roles on the current branch and saves the findings privately.
- **Requirements:** R11, AE4; KTD7.
- **Dependencies:** U1, U5.
- **Files:** `scripts/council.ts`, `scripts/council.test.ts` (new); `package.json` (`council`); `docs/review/README.md` (usage).
- **Approach:**
  1. Compute the diff against `main` (fail with a clear message on `main` or an empty diff).
  2. For each role, build the prompt (role file + diff + "report only, change nothing") and run its CLI read-only on subscription auth, in parallel.
  3. Write `.local/council/<branch>-<short-sha>/<role>.md` and print the paths; a missing or logged-out CLI fails that role with a hint and doesn't stop the other.
- **Execution note:** prove the CLI invocations by hand on a real branch before scripting them.
- **Patterns to follow:** `scripts/check-*.ts` (plain Node TS, `new URL` paths, clear exit codes).
- **Test scenarios:**
  - Prompt building: role file text and diff both appear, in that order, with the report-only instruction.
  - Output path: branch `feat/x` at sha `abc1234` → `.local/council/feat-x-abc1234/design-system.md`.
  - On `main` or with an empty diff: exits non-zero with a message, runs no CLI.
  - A role whose CLI is not on `PATH`: that role reports the hint; the other role's file is still written.
  - A CLI that reports an auth error (Claude `is_error: true`, or `codex login status` failing): that role fails with a login hint and writes no report.
- **Verification:** `pnpm council` on a feature branch writes two reports and changes no tracked file.

### U7. Cold-start proof and cleanup

- **Goal:** prove AE1 for real, and remove what the new setup replaces.
- **Requirements:** AE1; KTD4, KTD8.
- **Dependencies:** U2–U6.
- **Files:** `CONTENT.md`, `IDEATION.md` (delete after coverage check); `docs/DECISIONS.md` (log the result); Claude memory `entire-cli.md` (delete; machine-local, not in the repo).
- **Approach:**
  1. Check every substantive point in `CONTENT.md` and `IDEATION.md` against `docs/PLAN.md`, `docs/DECISIONS.md` and `src/content/`; move anything uncovered, then delete both.
  2. Prepare a throwaway clone outside the agent (`pnpm install --frozen-lockfile`, `pnpm exec playwright install chromium`). Run `codex exec -s workspace-write` there with `CODEX_HOME` pointed at a fresh temp directory holding only a copy of `~/.codex/auth.json`, so no global instructions, memories, hooks or MCP config load. The prompt asks it to explain the token rules and the three-brand rule from the repo alone, run `pnpm check`, and perform the Design System & UX Purist review on a sample diff by hand. Save the transcript, noting the isolated `CODEX_HOME`, to `.local/`.
  3. List the steps for Jarod to remove Entire locally (delete `.entire/`, uninstall the CLI, the repo's Gates setting). Don't run them.
- **Test scenarios:** Covers AE1. The cold Codex run states the tokens-only and three-brand rules correctly, runs the checks, produces a review in the role's report format, and never mentions Entire.
- **Verification:** the transcript shows all four; anything it got wrong becomes an `AGENTS.md` fix in the same PR.

---

## Verification Contract

| Gate | Command | Proves |
|---|---|---|
| Unit tests | `pnpm test` | `astro-rules`, `council` logic, existing tests |
| Types | `pnpm typecheck` | new scripts typecheck |
| Guardrails | `pnpm check` (now including `check:astro`) | R8, AE2, and nothing else regressed |
| Ignore rules | `git check-ignore` on each noise path; `git ls-files` | R5, R6, AE3 |
| Entire gone | the case-sensitive `git grep` in U2's Verification, over agent-read files and config | R4 |
| Council | `pnpm council` on a feature branch | R11, AE4 |
| Cold start | the U7 fresh-clone Codex run | AE1 |

---

## Definition of Done

- All gates pass locally and in CI.
- A fresh-clone Codex session meets AE1, and its transcript is saved under `.local/`.
- No agent-read instruction file, hook or config mentions Entire. History records (`docs/DECISIONS.md`, `tasks/lessons.md`, `docs/plans/`) are exempt.
- `docs/DECISIONS.md` logs the `.local/` convention, the Entire removal, and the `CONTENT.md`/`IDEATION.md` deletion.
- Jarod has the local Entire removal steps.
- No experimental code is left in the diff.
