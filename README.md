# jarodtaylor.com

Jarod Taylor's personal site and portfolio. Its signature feature is **Remix**: one set of markup, three brands (`clean`, `backstage`, `blocks`), driven only by design tokens. Astro 7, static output, hosted on Cloudflare Workers.

## Requirements

- Node 24 or later
- pnpm 11 (the version is pinned in `package.json`; `corepack enable` picks it up)

```sh
pnpm install
```

## Run the site

```sh
pnpm dev        # dev server at http://localhost:4321
```

Add `?brand=blocks` (or `backstage`, `clean`) to any URL to switch brands.

```sh
pnpm build      # static site in dist/
pnpm preview    # serve dist/ locally
```

Every command that needs tokens builds them first. Run `pnpm tokens` on its own after editing anything in `tokens/`.

## Run Storybook

```sh
pnpm storybook         # component workshop at http://localhost:6006
pnpm build-storybook   # static build in storybook-static/
```

Use the **Brand** dropdown in the toolbar to switch every story between brands. Each story's **Tokens** controls flip the layout and decoration choices its component reads; the markup never changes. Storybook is not published yet; it goes public at the v0 launch.

## Test and check

```sh
pnpm test           # unit tests
pnpm test:stories   # every story, plus brand and token behaviour, in Chromium
pnpm typecheck
pnpm check          # every guardrail CI runs: tokens, contrast, CSS rules, a11y, Storybook, Lighthouse
```

The browser checks need Chromium once: `pnpm exec playwright install chromium`. Run `pnpm test && pnpm typecheck && pnpm check` before opening a PR.

## Deploy

```sh
pnpm run deploy   # build, then publish dist/ to Cloudflare Workers (needs `wrangler login`); `pnpm deploy` is a different, built-in pnpm command
```

## Where to look next

- [`AGENTS.md`](AGENTS.md): the rules the site is built by, the full command table and the token pipeline. Every contributor, human or agent, starts here.
- [`docs/PLAN.md`](docs/PLAN.md): what is being built, phase by phase.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): what was decided, and why.
- [`docs/WORKFLOW.md`](docs/WORKFLOW.md): how a change goes from plan to merge.
