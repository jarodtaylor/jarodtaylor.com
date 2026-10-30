# Review roles

Two reviewer roles any model can perform, in any harness, from the role file alone. No skills or plugins needed.

| Role | File | Looks at |
|---|---|---|
| Design System & UX Purist | [`design-system.md`](design-system.md) | Token-tier meaning, three-brand behaviour, DOM-order intent, component encapsulation, accessibility beyond axe |
| Frontend Architect & Core Web Vitals | [`architecture.md`](architecture.md) | Hydration and islands, runtime JS lifecycles, layout shift, assets and bundle, DOM size, routing and output settings |

Each role skips what `pnpm check` already enforces and reviews what a check can't see. Both report findings the same way: severity P0–P3, `file:line`, a failure scenario and a fix, or "No findings." The roles are a second net, not a merge gate: `AGENTS.md` and the checks come first.

## Running a role by hand

1. Give the model the role file and the diff: `git diff main...HEAD`.
2. Tell it to read `AGENTS.md` and the surrounding source as needed, report only, and change nothing.
3. Save its report under `.local/council/` (see below).

Any model works. Running the two roles on different models catches more than running one model twice.

## Where output goes

Review output is private noise (`AGENTS.md`, **Public signal, private noise**). It goes in `.local/council/`, which is gitignored, and is never committed. A finding that becomes a decision goes in `docs/DECISIONS.md`; one that becomes a rule goes in `tasks/lessons.md`.

## Running both roles: `pnpm council`

`pnpm council` runs both roles against the current branch's diff on local CLIs, read-only: Design System on Claude, Architecture on Codex. Reports go to `.local/council/<branch>-<short-sha>/<role>.md`. It's a convenience, not a merge gate.
