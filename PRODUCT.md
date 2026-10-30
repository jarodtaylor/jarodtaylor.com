# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7 (static) + React components rendered server-side, plain CSS with cascade layers, DTCG 2025.10 tokens compiled by Terrazzo into `[data-brand]` custom properties. Hosted on Cloudflare Workers static assets. See `docs/PLAN.md`.

## Users

1. **Recruiters and hiring managers** (primary). Skimming in seconds. They need role, seniority, proof, availability, contact.
2. **Engineering and design leaders / peers.** Reading posts. They need substance and a reason to follow.
3. **Frontend and design engineers.** They will open dev tools and view source, and should be impressed by the craft.

## Product Purpose

Jarod Taylor's owned home on the web: portfolio, résumé and blog in one. He has 18 years of design systems, frontend platforms, developer experience and engineering leadership work, and almost none of it is public. The site must:
1. tell a recruiter who he is in seconds,
2. prove his design-engineering skill instead of claiming it, and
3. host writing that LinkedIn and X posts link to.

Success: recruiters and hiring managers reach out; peers follow the writing; engineers share the build.

## Positioning

"I build the work behind the work." Designer turned engineer turned engineering leader. The site is itself the proof: **Remix** restyles the whole site (type, spacing, shape, color, decoration) by swapping design tokens, with zero markup changes, a modern CSS Zen Garden. That's a live demo of how he ran one design system across ~7 brands at Estée Lauder.

## Content pillars

Leading engineering orgs · Design engineering and frontend systems · Developer experience · Learning AI in public.

## Evidence (only these claims)

- 18 years (since 2008). 12+ years leading teams.
- Founded design systems at three companies.
- Led a 40-person global org through Chapter 11 at JCPenney ($6M budget, replatformed a $1.5B eCommerce business).
- Tom Ford Beauty: Lighthouse performance 29 → 95.
- ~7 brands on one design system (Estée Lauder).
- New engineers to first PR in 1–2 days.
- Employers: Estée Lauder, JCPenney, Aetna, WellMatch, Teladoc, The Dallas Morning News.

## Voice

Humanized, direct, first person. **No em-dashes anywhere in site copy.** AI is framed as *learning in progress*, never expertise. He has ADHD and says so plainly.

## Brand commitments

- Role line: **Engineering Leader | Frontend Architecture, Design Engineering & Developer Experience**. In the hero the four roles are listed under the name (2026-10-28). Location: Frisco, TX, shown on About only, not in the hero.
- No headshot in the hero (photos only in About).
- No target role, level or location preferences on the site (that's LinkedIn's job).
- Direction: locked 2026-10-24; default changed 2026-10-27. Default brand **Clean and sharp** (`prototypes/r6-clean/`: pine + apricot, Funnel Display / Funnel Sans, 60° lattice). Remix brands: **Backstage-lite** (`prototypes/r6-backstage/`) and **Building blocks** (`prototypes/r6-blocks/`), each with its own fonts. All three run on one markup in `src/`; the prototypes are reference only. Round 7 feedback: `docs/design/feedback-r7.md`.

## Accessibility

WCAG 2.2 AA on every brand, verified automatically. Full keyboard support, visible focus, reduced-motion support.
