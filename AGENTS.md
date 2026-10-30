<!-- entire-agent:begin -->
Read .entire/agent-guide.md for this repository's workflow, source inspection, and verification guidance.
@.entire/agent-guide.md
<!-- entire-agent:end -->

## Workflow
`docs/WORKFLOW.md` maps the default loop (Compound Engineering, with Impeccable and Emil Kowalski's skills at fixed steps). Project rules live in `CLAUDE.md`.

## Public signal, private noise
The repo is public. It shows the signal: what was decided and the rules the site is built by. Working noise stays on the machine that made it.

- **Signal (tracked):** instructions (`AGENTS.md`, `CLAUDE.md`), decisions (`docs/DECISIONS.md`), plans (`docs/PLAN.md`, `docs/plans/`), the workflow map (`docs/WORKFLOW.md`), lessons (`tasks/lessons.md`), review roles (`docs/review/`), and design references the build depends on (`.impeccable/config.json`, `.impeccable/decision/`, `.impeccable/surfaces/`, `prototypes/`).
- **Noise (gitignored, under `.local/`):** handoffs (`.local/handoffs/`), brainstorm and research scratch (`.local/scratch/`), review and council output (`.local/council/`), session transcripts and back-and-forth. Tool session state and screenshots (`.impeccable/review/`, `.impeccable/questions/`, `.impeccable/hook.cache.json`) are ignored where the tool writes them.
- **Unsure?** It's noise: put it in `.local/`. A decision found in noise goes into `docs/DECISIONS.md`; a lesson goes into `tasks/lessons.md`.

## Session handoffs
- Write every handoff to `.local/handoffs/YYYY-MM-DD-<slug>.md` (gitignored), never the `/tmp` default: a reboot wipes `/tmp`.
- On a resume with no source given, look in `.local/handoffs/` first and offer the newest.
