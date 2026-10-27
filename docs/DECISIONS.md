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
| T6 | Figma round-trip spike: import `tokens/knobs/{default,blocks,clean}.json` into one Variables collection (a mode per brand) via native DTCG import, export the modes, run `pnpm tokens`, diff. Then make role picks native Figma aliases once ramps are variables | Phase 4 |

## 🟡 Open questions

| # | Question | Recommendation |
|---|---|---|
| Q4 | Remix UI pattern: panel, drawer, or command palette? | Decide in Phase 3 with a coded prototype |
| Q5 | Signature "wow" moment(s)? | Decide in Phase 1. Lead candidate: the brand switch itself |
| Q6 | Newsletter: yes or no? | Later |
| Q7 | ✅ Doing it (2026-10-24). Was: if round 5 falls short, switch to Impeccable `/impeccable` new-work flow, **code-led** (`buildPath: code`, direction picker, Bolder hand), not comp-led | Decide after Jarod reviews round 5 |
| Q8 | ✅ Decided 2026-10-24 (see Decisions). Was: Figma → Terrazzo → CSS: which token tier does Figma author? Figma can't do derive() math | Figma authors the brand layer (knobs + role picks); derived ramps are pushed into Figma read-only; CI derives. Keep knobs Figma-importable now (px, sRGB, no composites) |
| Q9 | Tablet nav: 4 items + Let's talk already fill the header; a 5th item won't fit. Collapse into the menu at tablet widths? | Yes: move the existing popover menu breakpoint from 48rem to 64rem, with Let's talk inside the menu below that. Decide with the pixel-pushing pass |

## ✅ Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-26 | Finish-review fixes: blocks' intro was already on the prototype's clock (identical animation timings; the 1250 ms frame precedes the 1340 ms click in both), now clipped at the drawing's top edge so parts never cross the header. New knobs: enum `menu-shape` (panel\|card; blocks card), fluid `nav-gap`, `type.separator-gap.{pipe,dot}`, role `menu-shadow`. The cue hides while Peek is up; the spec card gets the page's ground over blocks' rail (Peek only). Skip intro sits centred on the floor from 48rem and is not shown on phones (a tap anywhere skips) | Reviewer's six findings; default pixel-unchanged |
| 2026-10-26 | Phone menu gets its own surface (`surface.menu.{bg,text,border,focus}`, roles `menu-bg`, `menu-text`, `menu-focus`). Blocks: paper with cobalt text, as in its prototype; default and clean keep their raised colours | Finish review; the menu no longer borrows the raised surface |
| 2026-10-26 | **Peek exit fixed:** the layer faded on the brand's out-easing (expo), so it was gone in ~200 ms and read as a pop. It now fades on the draw curve, and guide lines (columns, dim rules) don't fade at all: they retract along their length inside the leave window, in every brand. Peek dims now come from each display face's metrics (`type.metrics.display.{ascent,descender,cap}`). `info-layout` gains `stack-phone` (clean). Skip intro shows only for the peek intro | Jarod's bug report; lesson "guides grow and retract along their length" |
| 2026-10-24 | **Remix Step 7, clean live.** Two more enums: `font-smoothing` (auto\|antialiased) and `link-underline` (always\|hover). Peek in the columns layout: labels hang above, the spec card rises under the header. Default and blocks pixel-unchanged | Clean matches its prototype at 390/1440/2560 with knobs and enum-scoped CSS only. Known gap: the 48–64rem info strip stacks instead of one row |
| 2026-10-24 | **Remix Step 6, blocks live.** New knobs (all brands): enums `nav-align` (start\|center\|end), `menu-label` (text\|icon), `info-layout` (stack\|split); fluid `text-control`, `stack-gap`, `stack-gap-tight`, `rule-bleed`; `type.weight.nav`; `type.descent.display`; roles `separator`, `text-lead`. Role meanings settled: `text-quiet` = nav and socials, `text-muted` = info strip, `text-body` = bio (fixture updated). `hero-cue: icon` = corner arrow, wide only; `labelled` = in flow | Blocks matches its prototype at 390/1440/2560 with knobs and enum-scoped CSS only; default pixel-unchanged |
| 2026-10-24 | **Knob files are Figma-importable**: per-token `$type`, px dimensions (rem derived), seconds, number weights, one-name `fontFamily` + `type.fallback.<role>` string, string role picks / easings / enums; no descriptions; enum lists live only in `derive.ts`. Emitted CSS unchanged (tokens.css byte-identical) | Figma authors knobs; Figma's DTCG import accepts only color, px dimension, s duration, single fontFamily, number, string |
| 2026-10-24 | Remix Steps 4–5 built: **tokens extended** (fluid page-x, col-gap and rhythm surface as `space.*`; header-h, control-h, stage-h, mark-header, text-body/label/small, measure; `control` type role; `beat` duration; `text-body`, `rule-strong` roles; `line.strong`). Default `label` tracking → 0 (small print); controls carry the 0.08em | Steps 1–3 couldn't express the Backstage prototype within lint; added through knobs → semantic → component, not around the gate |
| 2026-10-24 | Breakpoint media queries carry `stylelint-disable-next-line unit-allowed-list -- shared breakpoint`; SVG rotations likewise (geometry). Stylelint 17's unit-allowed-list has no media-feature ignore option | Sanctioned escape hatch with a reason, instead of loosening the rule |
| 2026-10-24 | Hero runtime is `src/components/Hero/runtime.ts` (not `hero.ts`: macOS's case-insensitive FS resolves `./Hero` to it). 2.5 KB gzip | One module, well under 15 KB |
| 2026-10-24 | Never `display: none` an element whose descendants use a style query (Chromium skips re-evaluating them after a brand switch); take it out of flow instead | Found when switching default → clean → blocks left the isometric figure hidden |
| 2026-10-24 | Fonts: all 7 faces self-hosted in `public/fonts/` (Archivo, Martian Mono trimmed to used axes); metric-matched Arial fallbacks for the display and text faces | A5; CLS 0 on Lighthouse |
| 2026-10-24 | **Figma → Terrazzo → CSS:** Figma authors the brand layer (knobs + color role picks). Code owns the math: CI runs `derive()` → Terrazzo → gates. Derived ramps are pushed back into Figma as read-only swatches (Phase 4, Figma MCP). Knobs must stay Figma-importable (px form for sizes, sRGB, no composites); fluid sizes and CSS-only enums are Figma-excluded | Figma can't do derive() math; this keeps one source per tier |
| 2026-10-24 | **Brands live (merge Steps 2–3):** `tokens/knobs/{default,blocks,clean}.json` replace the placeholders; `alt` deleted. Every colour semantic aliases `{color.role.*}`; new semantic groups `graphic.*` (figure colours), `layout.*` (figure extent), `choice.*` (enums), `type.fluid.*`; new component files `header`, `hero`, `figure` (incl. `talk.*`, `spec.*`). Type gains a `lead` role (face pick display/text, weight, variation) plus per-role `leading` and `tracking` knobs. `surface.annotation` covers Peek labels. AA passes in all three brands with no role moved off its prototype colour | Tagline weights (500/700/420) and the display leading/tracking need tokens, or components can't match the prototypes under the tokens-only lint |
| 2026-10-24 | **Colour model (merge Step 1), confirmed by the CTO:** ramps on a fixed lightness ladder, with steps named L×1000 (`neutral.750` = L .75), 150–975 every .025. Four required ramps (neutral, accent, guide, redline), each with knobs hue, hue-shift, chroma, peak and taper. **Colour roles live in the knobs**: `color.role.<name>` is an alias to a ramp step, and the semantic tier aliases roles. Every brand defines the same role names | The prototypes put shared roles (muted text, on-accent) at different lightness and on different ramps in each brand, so one shared alias to a ramp step can't match all three. Fitted fixtures reproduce every prototype colour within ΔE00 1.11 |
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
| 2026-10-24 | Fable gate on the merge plan: 6 fixes folded in as amendments A1–A6 ([remix-merge-plan.md](design/remix-merge-plan.md)): build-time figure geometry + one hero module (invariance), N named color ramps (ΔE ≤ 2 to prototypes), fluid sizes as string tokens, self-host all fonts + metric fallbacks | Plan as written would have failed invariance, lint and palette fidelity |
| 2026-10-24 | **Lint loosened slightly:** `motion.*` tokens for timings; private `--_` props may do math over `var()` refs and unitless numbers. Raw colours, lengths, brand selectors stay banned | Peek/intro need helper math; rule keeps its purpose |
| 2026-10-24 | All three brands dark with the same composition is **intentional**. Light brand maybe later (Phase 3) | Jarod loves these three; figures, fonts and motion carry the difference |
| 2026-10-24 | **Remix merge plan approved** ([design/remix-merge-plan.md](design/remix-merge-plan.md)): rebuild straight in `src/` (that is the smoke test). Superset DOM: all 3 figures present, `--hero-figure` enum picks one. Figures `aria-hidden`. **Peek in all brands** (readouts under `[data-remix-ui]`). State on `<html>`. Breakpoints 48/64/112rem. Font roles display/text/label + axes token. `alt` brand replaced by `blocks` + `clean`. Fable gate first | Keeps each approved look faithful while the DOM stays identical; gates decide the architecture |
| 2026-10-24 | **Three brands locked** (tweaks may come later): **Backstage-lite** default (`prototypes/r6-backstage/`, R1 fonts), **Building blocks** (`r6-blocks/`) and **Clean and sharp** (`r6-clean/`) as Remix brands. Next: merge plan (one markup, three token sets) for approval, then build | Jarod: "This is good for now. Let's keep going" |
| 2026-10-24 | Round 6 tweaks: **info strip muted + smaller** in all brands: role on the left, right side `Frisco, TX · Open to new roles` with a status dot. Backstage-lite: text block bottom-left + monogram larger/centred on the right (Blocks layout), header logo / centred nav / actions, no Replay button. Blocks: fix SVG seam artifacts. Clean: keep Funnel Display/Sans | Jarod's review of the 3 sketches |
| 2026-10-24 | **Default brand: Backstage-lite** (tweaks from Jarod pending). Remix brands: Building blocks, Clean and sharp. **R1 fonts for the default only**; each Remix brand keeps its own type | Most on-message; type change makes Remix more impressive |
| 2026-10-24 | **Round 6 = best results. All 3 sketches become brands:** one default + 2 Remix demos (Backstage-lite, Building blocks, Clean and sharp). Same markup, tokens only | Jarod likes all three; it's exactly the Remix proof |
| 2026-10-24 | Fonts (provisional): **R1 = Archivo condensed + Schibsted Grotesk + Martian Mono** | Jarod's pick from the font study; revisit once seen in more contexts |
| 2026-10-24 | Feedback on Assembly Manual: the hero is **crammed**; the root cause is the inherited content lock. Proposed next: slim hero content + header/nav system, font pairing research, then 3 sketches on the same slim content (Backstage-lite, Building blocks, clean type + palette + subtle animation) | "Not a résumé"; wow on landing is the goal |
| 2026-10-24 | Impeccable round 1 (seed 2a2043ae): building **Assembly Manual** (instruction-booklet world, monogram assembles on load, isometric on the 60° grid, Remix = same parts, different model) in `prototypes/assembly/`. Contract: `.impeccable/surfaces/prototypes-assembly-index-html.md`. Target feel: systems thinker with personality; avoid generic, cold, busy | Jarod's pick from the direction round |
| 2026-10-24 | **Round 5 tabled as the benchmark** (best so far). Run Impeccable new-work, code-led, to test directions beyond Backstage before locking | "Better, for sure," but Jarod wants to see what else catches his eye |
| 2026-10-24 | Round 5: **the load intro is the peek layer** (lines grow linearly, never rotate), then everything fades except the **JT monogram**, which becomes the hero's resting visual. Canvas background options dropped. Design subagents stay on Opus | Jarod loved the peek reveal; one system for intro + peek |
| 2026-10-21 | **No three.js / GSAP.** Hand-written WebGL or canvas, ~2–4 KB per effect; motion only where it shows the work (Pier's discipline). Round 4 explores 3 hero backgrounds side by side (lattice, construction drift, token-derived) | Wow without the weight |
| 2026-10-21 | Round 3 feedback: **no boxed/centered sheet** (feels like 960px-grid era); use the full browser width like aarronwalter.com. Type scale too busy, doesn't flow. Drop location/time from the header. Keep the peek transition + monogram construction animation | Jarod's review of round 3 |
| 2026-10-21 | Next: **above-the-fold only** (round 4) until the hero is loved, then the sections below. Explore a load-in intro (scaffold builds the page, then fades out, like piergorelli.com) and a subtle living hero background | Nail the first impression first; it sets direction for the rest |
| 2026-10-20 | **Palette B (Chartreuse)** is the favorite: deep slate + acid lime | Jarod's pick from round 2 |
| 2026-10-20 | Round 2: **Exposed's condensed type**, **dark-first rich color**, wide-screen = extra width becomes backstage. 3 switchable palettes | Round 1 was drab and broke on 4K |
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
