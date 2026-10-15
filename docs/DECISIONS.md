# Decisions, open questions, to-dos

The project's memory. Updated the moment something is decided.
Full plan: [PLAN.md](PLAN.md) · Agent lessons: [../tasks/lessons.md](../tasks/lessons.md)

---

## 🔴 Jarod's to-dos

| # | To-do | Needed by |
|---|---|---|
| T1 | In Google Admin (Gmail → Authenticate email), click **Start authentication** | Now |
| T2 | Ask 3–5 former leaders (VP, Exec Director, CTO) for 1–3 sentence testimonials, with permission to use name, title, company | Phase 2 |
| T3 | Pick 2–4 About photos (candid or working) | Phase 2 |
| T4 | Make a list of the parts you like on each inspiration site (or just narrate during the walk) | Phase 1 |
| T5 | Case studies, on your own schedule (I can interview you when ready) | Later |

## 🟡 Open questions

| # | Question | Recommendation |
|---|---|---|
| Q4 | Remix UI pattern: panel, drawer, or command palette? | Decide in Phase 3 with a coded prototype |
| Q5 | Signature "wow" moment(s)? | Decide in Phase 1. Lead candidate: the brand switch itself |
| Q6 | Newsletter: yes or no? | Later |

## ✅ Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-13 | Ship in phases: Foundation → Design → v0 launch → Remix v1 → Storybook + Figma | Get off "coming soon" fast |
| 2026-10-13 | No calendar estimates. Phases are sized by scope and exit criteria | Agents work faster than human timelines |
| 2026-10-13 | Remix v1 changes tokens/CSS only. DOM order never changes | Keeps "0 lines of markup changed" literally true |
| 2026-10-13 | Hero layout variants are a later experiment and blog post | Out of v1 scope |
| 2026-10-13 | Wow vs perf is a trade-off we weigh case by case. Budget, not a hard Lighthouse 100. JS is OK when done right | Jarod's call, replacing an inherited agent constraint |
| 2026-10-13 | No target role, level, or location on the site | That's LinkedIn's job |
| 2026-10-13 | Résumé PDF: yes. Testimonials: yes | Recruiter conversion |
| 2026-10-13 | No headshot in the hero. Photos go in About | Hero photos feel cheesy |
| 2026-10-13 | Brand colors designed fresh. Nord, Catppuccin, Dracula are taste signals only | Avoid "VS Code theme" look |
| 2026-10-13 | Design in code, not image comps. Old Impeccable rounds deleted | Comp-first rounds all missed |
| 2026-10-13 | Pages: long homepage, /work, /workbench, /writing, /about, /colophon, /resume, 404. No contact page | Recruiter job done in one scroll |
| 2026-10-13 | Stack: Astro 7 + React (server-rendered), plain CSS with cascade layers, DTCG 2025.10 tokens + resolver, Terrazzo, Storybook 10 | See PLAN.md "Stack" |
| 2026-10-13 | `derive(knobs)` is one pure function, used at build time and in the browser later | Makes Remix v2 live knobs nearly free |
| 2026-10-13 | Never key CSS on a brand name. Layout switches use enumerated knob tokens + style queries | Keeps the token count honest |
| 2026-10-13 | Figma: Professional plan (confirmed). Sync via native DTCG import and/or Figma MCP script | Modes = brands |
| 2026-10-13 | Hosting: Cloudflare Workers static assets | Cloudflare's current recommendation |
| 2026-10-13 | DNS moves Route 53 → Cloudflare. Registrar stays DreamHost | Workers needs the zone on Cloudflare |
| 2026-10-13 | Email stays on Google Workspace. No Cloudflare Email Routing | Would break the inbox |
| 2026-10-13 | Added SPF + DMARC (monitor mode) in Cloudflare. DKIM pending (T1) | They were missing, which hurts deliverability |
| 2026-10-13 | Token build: Terrazzo emits aliases as `var()` references (spike passed) | Remix v2 works with no workaround |
| 2026-10-13 | Focus ring color is set per surface role, and contrast-checked at 3:1 | Ring was invisible on accent sections (1.94:1) |
| 2026-10-13 | Drop `preview.jarodtaylor.com` and anything else unused when DNS moves | Not needed |
| 2026-10-13 | Agents may commit freely on feature branches (pushes and PRs still go through Jarod) | Keep work checkpointed |
| 2026-10-13 | `.codex/` and `.cursor/` stay local (gitignored) | Personal tool config |
| 2026-10-14 | **Direction: Backstage.** Prototype 3 intensities (Whisper / Blueprint / Exposed) before locking. Edition + Threads become Remix candidates | Concept settled; execution is the open question |
| 2026-10-14 | Phase 1 prototypes are throwaway HTML in `prototypes/`, outside CI. The winner gets rebuilt on the token pipeline | Fast iteration without loosening guards |
| 2026-10-14 | Role line everywhere: **Engineering Leader \| Design Engineering, Frontend Systems & Developer Experience** (matches LinkedIn, with "Director of Engineering" changed to "Engineering Leader") | Old line undersold frontend/UI architecture/DX |
| 2026-10-13 | Generated tokens committed. Built CSS/JSON not committed | Reviewable diffs + Figma import |

## DNS cutover checklist (end of Phase 0)

- [x] Cloudflare zone created (pending). Nameservers: `jack.ns.cloudflare.com`, `jessica.ns.cloudflare.com`
- [x] Records copied: Google MX ×2. Added SPF + DMARC
- [x] Route 53 audited: apex, www, MX, plus `preview` subdomain (drop it)
- [x] DKIM TXT added (2026-10-14)
- [x] Worker deployed: `jarodtaylor-com` → jarodtaylor-com.jarodtaylor-com.workers.dev (2026-10-13)
- [x] Apex + www attached; www 301s to apex (2026-10-14)
- [x] Nameservers changed at DreamHost; site live (2026-10-14)
- [x] MX verified; test email sent and received (2026-10-14)
- [ ] Click "Start authentication" for DKIM in Google Admin (T1)
- [ ] After a couple clean weeks: DMARC `p=none` → `quarantine`
- [ ] Optional: delete the Route 53 zone and old CloudFront distributions (~$0.50/mo)
