# Thoughts, notes, open questions for jarodtaylor.com

**Companion file:** `CONTENT.md`

---

## Problem

Jarod has 18 years of strong, relevant work (design systems, frontend platforms, developer experience, engineering leadership) and almost none of it is public. His domain has said "coming soon" for years. Searching his name mostly shows other Jarod/Jared Taylors, including one he must never be confused with.

He needs one owned home on the web that:
1. tells a recruiter or hiring manager who he is in seconds,
2. proves his design engineering and frontend systems skill instead of just claiming it, and
3. gives him a place to publish writing that LinkedIn and X posts can link to.

## Audience

1. **Recruiters and hiring managers** (primary). Skimming. Need: role, seniority, proof, availability, contact.
2. **Engineering and design leaders / peers.** Reading posts. Need: substance, a reason to follow.
3. **Frontend and design engineers.** Will open dev tools and view source. Need: to be impressed by the craft.

## Positioning

> Designer turned engineer turned engineering leader. For 18 years I've built the work behind the work: design systems, frontend platforms, and developer experience that make whole engineering orgs faster. I've also led the teams that build them, through acquisitions, a bankruptcy, and more reorgs than I can count. These days I'm learning AI the way I learned everything else: hands-on, in public, with an ADHD brain running twenty threads at once.

**Four content pillars:** Leading engineering orgs · Design engineering and frontend systems · Developer experience · Learning AI in public.
**Honesty rule:** AI is framed as *learning in progress*, never as expertise. Don't add claims that aren't in `CONTENT.md`.

## Pages

Should this be a single page site? Homepage and Blog? Or best to have standard pages? If standard pages for growth reasons, initial thoughts:

* Homepage
* About
* Blog
* Work/Projects/Case Studies? A place where I can do case studies because as a leader at 3 different Fortune 500 I've delivered design systems and component libraries. This was done before the industry was even talking about design systems, tokens, etc. I also will have my personal projects/repos (mainly AI or Design System related) so I'm not sure if this belongs on the same page or something separate? 
* Is Contact Me even necessary anymore, or as part of the About Me (and in the footer) I have links to my Email, LinkedIn, Twitter/X, etc? 
* Colophon? This site will be like a portfolio piece, so why not have a page giving the details of how it was designed and built. Very similar to what this guy did: https://aarronwalter.com/colophon

## Ideas for the site

This is not exhaustive. Any new ideas we can come up with should be captured.

### Design System Driven

I'm an engineering leader with more than a decade of experience building Design Systems, Component Libraries, and Teams that build/curate them at Fortune 500 companies (enterprise companies). This site should demonstrate that. 

* **Tokens live in W3C Design Tokens (DTCG) JSON** in the repo, compiled to CSS. This is the source of truth that Figma Variables sync with. Brands should map cleanly to Figma Variable *modes*. Here are some Figma articles:

  * [Design token architecture: Structuring tokens for scale](https://www.figma.com/resource-library/design-token-architecture/)
  * [Design tokens: How to sync design and code in Figma](https://www.figma.com/resource-library/design-tokens/)
* **Design-system components are React (`.tsx`), rendered by Astro.** Pages and layouts stay `.astro`; reusable UI (buttons, tags, cards, nav, section shells, the Remix control) is React so standard `@storybook/react-vite` works with no community plugins.
  - Components render **server-side to static HTML by default** (no `client:*` directive). React ships to the browser only for islands that truly need it, so the zero-JS and Lighthouse targets still hold.
  - Component styles are **plain CSS, Tailwind, or CSS Modules) that consume tokens only**. No CSS-in-JS runtime, no hard-coded values. This keeps the "tokens, not framework" story honest.

* I want to show off the design system, tokens, and engineering side of my experience. So, the idea is one set of markup, completely restyled (not just themed colors, etc. but layout, component changes, spacing, typography, etc) all driven by the token system. A little modern take on the classic 2003 CSS Zen Garden which I actually learned from! My goal is to demonstrate the site from Figma -> Design Tokens (Style Dictionary, or another alternative) -> Storybook -> Website driven by the design system and tokens. We can always backfill Figma and Storybook once we've landed on the brand, design etc. on the website. 

* Initial goal would be at least **3 curated brands**: the default brand plus 2 alternates. They must differ in *more than color*: typography, type scale, spacing density, shape/radius, borders, and texture should all be able to change. 

* Maybe not v1 but I'd be curious if we could go beyond tokens and even toggle component configurations. For example, let's say we have a Hero on the page with text on the left, an eyebrow, paragraph and a graphic or image on the right. A component built correctly would allow a simple toggle to change the layout of that Hero. Again, this is just an idea, but could be something we explore AFTER v1 of the Remix system. 

* Tiered token architecture, visible in the source:

  - **Base/knob tier:** the few inputs a brand sets (e.g. base size, scale ratio, density, radius, border weight, fonts, palette).
  - **Semantic tier:** derived meanings (background, text, accent, spacing steps, type steps).
  - **Component tier:** what components consume.
  - Contrasting sections use **semantic surface roles** (e.g. `surface`, `surface-inverse`, `surface-accent`), never hard-coded colors. Each brand decides what each role looks like, and a future dark mode stays possible without a refactor.
  - A brand sets **only** the base tier. Everything else is derived. This is what makes Remix v2 (live knobs) possible later, so design for it now.
  - While remixing, the visitor can see *what changed*: which tokens changed and that zero markup did (e.g. "14 tokens changed · 0 lines of markup changed").
  - Switching brands transitions smoothly and respects `prefers-reduced-motion`.
  - All brands pass WCAG 2.2 AA contrast on every surface role used on the page. Verify automatically (a script or test), not by eye.
  - The chosen brand's tokens must be exportable (e.g. JSON) so the same values drive social graphics, OG images, and slides outside the site.

  ### 

## Quality bar (non-functional requirements)

This is a design engineer's site; the bar is the point.

| Area | Requirement |
|---|---|
| Performance | Lighthouse 100 in Performance, Accessibility, Best Practices, SEO on Home and the post template (mobile). Jarod's own work took Tom Ford from 29 to 95; his site can't do worse. |
| Accessibility | WCAG 2.2 AA. Full keyboard navigation, visible focus, semantic landmarks, skip link, reduced-motion support. |
| JavaScript | Minimal. Content pages work with JS off. Only the Remix needs JS. |
| Fonts | Self-hosted, subset, no layout shift. |
| Responsive | Excellent from 360px to wide desktop. No horizontal scroll. |
| Source quality | Clean, readable HTML and CSS in view-source. The public repo has a README that explains the token architecture. It's a portfolio piece, not just a repo. |
| Copy | Humanized. My voice. No em-dashes anywhere in site copy. |



## SEO and identity

- Title and meta description as given in `CONTENT.md`.
- JSON-LD `Person` schema with `name`, `jobTitle`, `address` (Frisco, TX), `url`, and `sameAs` (LinkedIn, X, GitHub). This is the main tool for separating Jarod from other Jarod/Jared Taylors in search.
- `BlogPosting` schema on posts.
- OG and Twitter card meta on every page.
- Favicon set and web manifest that match the brand.

## "Doesn't look AI-generated"

We'll be using [Impeccable Style](https://impeccable.style/llms.txt) handles AI-slop detection during the build. Site-specific notes only:

## Infrastructure

- Host on **Cloudflare Pages** with the custom domain `jarodtaylor.com` (apex + `www` redirect), HTTPS.
- Preview deploys for every branch/PR.
- **Cloudflare Web Analytics** (cookieless, no consent banner).
- Public GitHub repo (`jarodtaylor/jarodtaylor.com` or similar). The footer's "View source" links here.
- `contact@jarodtaylor.com` must actually deliver (e.g. Cloudflare Email Routing). Verify before launch.
- CI runs the build, contrast checks (R-R9), and a Lighthouse budget check on every PR.
- Stack: **Astro** (static output) with React components for the design system. Blog via Astro content collections. Constraints: minimal client JS, clean view-source.

## Design (Look and Feel)

I don't want the typical cookie cutter "AI Slop" layout and design look and feel. It should be exciting and engaging but still clean enough that our Remix system will work.

* Should have extra polish with modern things like microinteractions, non-jarring animations (subtle using things like three.js, motion.dev, reactbits, etc)
* Scrolling effects are great, but not when the entire flow of the site requires you to scroll as it animates. That annoys me. Thank you, Apple! Ugh. I do like scroll effects when certain things on the page may change or morph, but not the entire damn page. 
* I want the site to have personality. A personality that matches me and my experience. 

### Design ideas (optional starting points, not requirements)

- **Redline.** The site as a design handoff: spec annotations, measurement callouts, and selection boxes, as if the page is documenting itself. Speaks directly to design engineering.
- **Editor theme.** The site feels like a beautifully themed code editor (where Catppuccin, Dracula, and Nord live) without becoming a fake terminal gimmick.
- **Backstage.** Literally "the work behind the work": a polished front layer with the scaffolding, grid, or wireframe peeking through behind it.
- **Zen Garden, grown up.** A strongly typographic, editorial take that nods to the early-2000s CSS craft era, modernized.
- **Timeline**. A clever design that walks through the 18 years of my experience (this would be leveraging more scroll effects, most likely)
- Any other ideas???????
- I do have a few sites that I've bookmarked. Just for ideas/inspiration, but some of it is just PARTS of the site, not the entire thing. We can walk through them. Make sure if you're viewing these you're viewing them in a real browser so you can actually click around and view the design, interactive parts, etc. 
  - https://aarronwalter.com/
  - https://www.product.inc/
  - https://gertix.studio/
  - https://www.arturospatino.com/
  - https://eddy-naboulet.dev/

## Open questions

1. Token build tooling (e.g. Style Dictionary or similar) to compile the DTCG JSON  to CSS.
2. Which 2 directions become the Remix alternates?
3. Remix UI pattern (panel, drawer, inline, command palette). Must stay secondary to the content
4. Brand colors? I'm thinking of the Nord theme. Not from a light or dark mode perspective. I don't want the design to be constrained to only light or only dark. We can create (Remix) a theme that is fully dark mode, if necessary. I'm [thinking of the palettes that Nord uses in general](https://www.nordtheme.com/docs/colors-and-palettes) would be a nice solid brand (my base brand).
