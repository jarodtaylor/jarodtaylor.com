---
title: Automatic PR reviewers are per-repo opt-ins
date: 2026-11-03
category: workflow-issues
module: GitHub PR review (Copilot, Codex, Claude)
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - Setting up, porting or debugging automatic Copilot, Codex or Claude reviews on a GitHub repo
  - A PR got no review from a bot you expected to run
  - Running `/install-github-app` in Claude Code
retire_when: "Copilot, Codex or the Claude GitHub app change how review is enabled or triggered; check each tool's current GitHub review docs"
tags: [pr-review, copilot, codex, claude-code-action, github-rulesets, github-actions]
---

# Automatic PR reviewers are per-repo opt-ins

## Context

PR #6 opened expecting Copilot, Codex and Claude to review it, because all three review every PR in the sibling repo `jarodtaylor/agent-os`. None did. Nothing was broken: each reviewer is enabled per repository, and this repo had never been enabled for any of them. Two more traps showed up while fixing it: the Claude reviewer only runs on PRs whose merge with `main` contains its workflow, and Codex's triggers aren't what its own help text suggests.

## Guidance

Treat each reviewer as its own per-repo switch, and check all three when porting the setup:

| Reviewer | What turns it on | When it runs |
|---|---|---|
| Copilot | A repository ruleset with a `copilot_code_review` rule (ruleset "Copilot review for default branch", with `review_on_push` and `review_draft_pull_requests`). A ruleset on another repo does nothing here | On every push to a PR targeting the default branch. An open PR picks it up on its next push |
| Codex | "Automatic review" for this repo in Codex cloud settings. Not visible or settable through `gh` | When a PR opens or a draft is marked ready; `@codex review` asks for one on demand. On #6 a later push also got a "New commits" review after a manual request, so don't rely on push behavior either way |
| Claude | `.github/workflows/claude-pr-review.yml` in the PR's merge ref, plus the `CLAUDE_CODE_OAUTH_TOKEN` repo secret (`claude setup-token`). The workflow passes the job's own `GITHUB_TOKEN` as `github_token`, so it doesn't need the Claude GitHub App | On `pull_request` events from this repo's own branches. The workflow's `if:` skips fork PRs, which get no secrets, so a skipped run on a fork PR is intended |

Check what's actually enabled before assuming a reviewer is broken:

```bash
gh api repos/OWNER/REPO/rulesets --jq '[.[] | .name]'   # Copilot ruleset present?
gh secret list -R OWNER/REPO                             # CLAUDE_CODE_OAUTH_TOKEN present?
git ls-tree --name-only origin/main .github/workflows/   # reviewer workflow on main (or in the PR's own diff)?
```

Codex's PR summary comment has a "Review trigger" column naming what fired each review ("PR opened", "Manual request", "New commits").

**`/install-github-app` adds more than a reviewer.** It opens a PR with two workflows. `claude.yml` runs on any `@claude` comment and carries out what the comment asks, using an action that can edit, commit and push. `claude-code-review.yml` is a second reviewer that uses the unpinned `anthropics/claude-code-action@v1`, the App's token and `id-token: write`. The action only acts for a commenter with write access to the repo (`checkWritePermissions`, unless `allowed_non_write_users` or `allowed_bots` widen it). An outsider's `@claude` starts the job, but the action rejects it before Claude runs. So the risk is an agent that edits code on your own team's say-so, not on a stranger's. The install step is still useful, because it sets the secret. Close its PR, or delete both files, when reviewers should only comment. Here PR #8 was merged by mistake and PR #9 removed both files.

## Why This Matters

- A missing reviewer looks exactly like a slow one. Waiting on a bot that was never enabled costs a settle window per PR and hides the gap.
- A reviewer workflow runs only on PRs whose merge with `main` contains it. PR #6 predated the workflow, so it never got a Claude review. PR #7 added the workflow and did review itself, but only after the secret existed. On PR #9, which deleted #8's duplicate reviewer, that duplicate didn't run. Order merges by what `main` will contain.
- The default `/install-github-app` output puts an agent that writes code one `@claude` comment away for anyone with write access, running on the owner's subscription token. That conflicts with "reviewers raise, Jarod and his agents fix".

## When to Apply

- Before opening the first PR you expect bots to review on a new or forked repo.
- When porting the agent-os setup to another repo.
- Whenever a PR is quiet and you're deciding whether to keep waiting for a review.

## Examples

PR #6 history (2026-10-30):

- Opened 21:23. Copilot, Codex and Claude: nothing. No rulesets, no secret, no workflow on this repo.
- About 21:36. Ruleset created. The next push got `review_requested: Copilot`, then `copilot_work_started` (4 findings).
- Codex was enabled after #6 opened, so its first review of #6 came from a `@codex review` request (2 findings). A push a few minutes later got another, triggered as "New commits".
- Claude never reviewed #6: `claude-pr-review.yml` lived only on PR #7's branch.
- PR #9, the first PR opened with everything on `main`: Copilot, Codex and one Claude review ran on the same commit with no prompting.

## Related

- `docs/DECISIONS.md` rows for 2026-10-30: "Automatic PR review, ported from agent-os" (Q15b) and the accepted public-repo token risk
- `.github/workflows/claude-pr-review.yml`: the comment-only reviewer, pinned to a commit SHA
- The original setup plan, in the agent-os repo (not this one): `jarodtaylor/agent-os` `docs/plans/2026-10-30-1306-feat-automated-pr-review-plan.md`
