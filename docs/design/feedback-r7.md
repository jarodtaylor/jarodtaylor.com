# Feedback round 7: the three brands on one markup (2026-10-27)

This is Jarod's review of the Remix smoke-test build (`feat/remix-hero`, 4b2b2ac), written up with my recommendations. The screenshots are in [feedback/r7/](feedback/r7/).

Each item has a status:
- **Do**: agreed, just build it
- **Jarod**: needs his decision
- **Explore**: agents prototype options
- **Bug**: a defect to fix

## General (every brand)

| # | Feedback | Recommendation | Status |
|---|---|---|---|
| G1 | **Role line.** He wants all four roles to show: Engineering Leader, Frontend Architecture, Design Engineering, Developer Experience. He doesn't love the info-strip treatment, especially on mobile. Ideas: change the wording to "Engineering Leader \| Frontend Architecture, Design Engineering, & Developer Experience", use bullets, move it next to the name, or work it into the bio. | Have agents explore 3 or 4 placements with the copy in every brand. The bio option overlaps with G5. | Explore |
| G2 | **Clean & Sharp is his favourite.** Make it the default? | Yes. The default is one line in `tokens/resolver.json`, plus whose fonts get preloaded. Backstage-lite and Blocks become the Remix brands. | Do (Jarod ✓) |
| G3 | **Keep the brand choice across pages.** Today, clicking a nav link drops the choice and the page falls back to the default brand. | Store the choice in `sessionStorage`, so it lasts for the tab and is gone when the tab closes. `?brand=` in the URL still wins, so a shared link always shows the brand it names. The inline head script applies the choice before first paint, so nothing flashes. | Do |
| G4 | **Drop "Frisco, TX"** from the info strip, and the "·" before it. Location goes on About. | Agreed. Also update the location line in PRODUCT.md. | Do |
| G5 | **Socials:** an icon to the left of each label, labels in uppercase. X shows the X icon and "@jarodtaylor". Mail uses a mail icon. | Agreed. Use inline SVG icons that take the text colour. The icons are decorative, so the label stays the accessible name. | Do |
| G6 | **Bio rewrite.** The double "and" doesn't flow. His draft: "Designer turned engineer turned engineering leader. For 18 years, I've built frontend platforms, design systems, and developer experiences. I've also led the teams behind them." | His draft reads well and has no em-dashes, so use it. It also leads with frontend, which matches G1's ordering. | Do (Jarod ✓) |
| G7 | **Too many header buttons**, and a Remix button is coming. Options: Let's talk becomes a mail icon or a menu item; Peek and Remix stay as buttons with an icon and label, or icon-only. | Remove the Let's talk button. Add **Contact** to the nav, pointing at the homepage contact section (mailto until that section exists). The right side becomes **Peek** and **Remix**: icon and label on desktop, icon-only with an `aria-label` on phones. A slider icon for Remix. The Remix button reserves its slot now; the panel itself is still Phase 3 (Q4). | Do (Jarod ✓) |
| G8 | **Hamburger at tablet width** in every brand. 4 or 5 items won't fit, and Clean has no hamburger on phones at all. This resolves Q9. | One menu pattern for all brands below 64rem: a hamburger button with an icon only (its `aria-label` is "Menu") at the far right of the header, and a menu that slides out. Brands can still style it, e.g. Blocks as a card or full-height panel. | Do |

## Backstage-lite

| # | Feedback | Recommendation | Status |
|---|---|---|---|
| B1 | Refreshing doesn't replay the intro. | This is how it was built: the intro plays once per tab session so repeat visitors aren't made to wait, and `?intro` forces it. Jarod decides whether it should play on every load. | Keep once per tab (Jarod ✓) |
| B2 | **The background feels bare** next to Blocks (dots) and Clean (lattice). Maybe drop the extra lines around the monogram and add a subtle animated background. [01](feedback/r7/01.png) | Explore. A "backstage" ground should come from the system itself, e.g. faint column guides and a baseline grid at rest, made from the real space and type tokens. That's more on-concept than decoration. Explore alongside Blocks' layouts (K2). | Explore |
| B3 | **The construction lines that extend from the monogram still pop off** instead of transitioning out. The grid lines already retract by their height, so these should retract along their length too. | Bug. The last fix covered the column guides and the dims, but not the bleed lines. Check frame by frame against the prototype. | Bug |
| B4 | **Double line** on the left and right of the monogram, so the guides look misaligned. [02](feedback/r7/02.png) | Bug. The guide diagonals run a few units off the outline edges; the outline isn't exactly on the lattice. Snap each guide onto the edge it extends, or drop guides that duplicate an edge. | Bug |
| B5 | An ugly **"Skip to content"** button appears and disappears now and then. [03](feedback/r7/03.png) | The skip link is required for accessibility and should only show on keyboard focus. Find out why it shows at other times (e.g. a click, the intro moving focus, or a flash before the CSS loads). Then style it per brand so it looks intentional when it does show. | Bug |
| B6 | The monogram is almost invisible on phones. [04](feedback/r7/04.png) | That matches the prototype (it sits behind the name at 0.3 opacity). Revisit once B2 settles. | Explore (with B2) |
| B7 | The hamburger sits left of Peek and Let's talk, and shows the word "Menu". [05](feedback/r7/05.png) | Covered by G7 and G8: icon only, far right. | Do |
| B8 | Menu items just show and hide, with no transition. A slide-out would feel more polished. | Covered by G8: slide out from the right, with an instant cut under reduced motion. | Do |

## Building blocks

| # | Feedback | Recommendation | Status |
|---|---|---|---|
| K1 | Refreshing doesn't replay the animation. | Same decision as B1. | Keep once per tab (Jarod ✓) |
| K2 | **The layout is nearly the same as Backstage-lite**, just with different fonts, colours and figure animation. Keep the building-blocks concept and the animation, which he loves, but try other layouts. | Have agents explore 3 layouts. Each has to stay on the same markup, driven by tokens and enum knobs only. That's the real Remix test, and a good demo of "different site, same HTML". | Explore |
| K3 | The nav is right-aligned and crammed against the buttons. Ideas: always a full-height hamburger sliding in from the right, or centred with a playful hover that riffs on building blocks. | Include it in K2. Each layout proposes its own nav treatment, e.g. a block-snap hover. | Explore |

## Clean & Sharp

| # | Feedback | Recommendation | Status |
|---|---|---|---|
| C1 | He loves it: layout, fonts, colours. | This is the candidate default (G2). | — |
| C2 | On desktop the monogram rises above the header's bottom border. Drop it one lattice row. Mobile is fine. [06](feedback/r7/06.png) | Agreed. Change the knob for the mark's vertical offset on desktop, snapped to the lattice row height. | Do |
| C3 | No hamburger on phones. | Covered by G8. | Do |
