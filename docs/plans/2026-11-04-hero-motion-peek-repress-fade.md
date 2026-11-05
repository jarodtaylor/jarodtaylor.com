# Hero motion: Peek pressed again while it leaves must redraw at full strength

- **Status**: TODO
- **Commit**: a6dd687
- **Severity**: HIGH
- **Category**: Interruptibility
- **Bucket**: hero fixes PR (`feat/hero-passes`), brand-agnostic
- **Estimated scope**: 1 CSS file (2 small rules), 1 e2e test added

## Problem

Peek is a toggle on `<html>`: `data-peek-state` goes `arm` → `on` when pressed, `leaving` when pressed again, then is removed (`src/components/Hero/runtime.ts:48-64`). While leaving, the custom property `--_layer` fades from 1 to 0 on `:root`, and every Peek part reads `opacity: var(--_layer)`.

```css
/* src/components/Peek/Peek.css:46-50 — current */
@property --_layer {
  syntax: "<number>";
  inherits: true;
  initial-value: 1;
}

/* src/components/Peek/Peek.css:64-68 — current */
:root[data-peek-state="leaving"] {
  --_layer: calc(0);

  transition: --_layer var(--_peek-leave) var(--figure-draw-easing) calc(var(--_beat) * 0.6);
}
```

If you press Peek again during the leave, `show()` sets `arm`, flushes, sets `on` (`runtime.ts:48-54`). The arm rule turns transitions off for the descendants only:

```css
/* src/components/Peek/Peek.css:513-516 — current */
/* Arm: no transitions, so every part snaps back to undrawn before it draws again. */
:root[data-peek-state="arm"] :is(.cols i, .dim, .dim b, .spec div, [data-peek]::before, [data-peek]::after) {
  transition: none;
}
```

Nothing cancels the `--_layer` transition running on `:root` itself, and Chromium lets it run to the end. Measured in Chromium (backstage, 1440×900) by pressing Peek, waiting for it to draw, pressing, then pressing again 150 ms later:

| ms after re-press | 0 | 300 | 700 |
|---|---|---|---|
| `--_layer` | 0.97 | **0.06** | 1.00 (snaps) |

So the new build draws in almost invisibly for about half a second, and then the whole layer pops to full opacity mid-choreography. Pressed again 400 ms into the leave, it starts at 0.16 and pops to 1 at around 300 ms. A deliberate replay turns into a flicker. This is the one place in Peek where pressing it again is visibly broken.

Toggling the press-again replay off, so the build carries on from where the leave got to, is out of scope. The comment at `runtime.ts:47` documents that every show starts from arm on purpose ("lets the intro and the button share one choreography").

The same leftover transition also outlives `settle()` (`runtime.ts:117-126`). Its `.settling` rule (`Peek.css:563-567`) matches `:root.settling *`, which skips `:root`. At rest every Peek part is undrawn, so nothing shows today. It's the same bug, though, and the fix is the same selector.

## Target

`:root` itself has no transitions while armed or settling, so `--_layer` lands on 1 in the same frame:

```css
/* target — src/components/Peek/Peek.css, next to the existing arm rule */
/* Arm: no transitions, so every part snaps back to undrawn before it draws again. :root too: a re-press during
   the leave must cancel the --_layer fade still running there, or the new build draws at the old fade's opacity. */
:root[data-peek-state="arm"],
:root[data-peek-state="arm"] :is(.cols i, .dim, .dim b, .spec div, [data-peek]::before, [data-peek]::after) {
  transition: none;
}
```

```css
/* target — src/components/Peek/Peek.css, the settling rule */
:root.settling,
:root.settling *,
:root.settling *::before,
:root.settling *::after {
  transition: none !important;
}
```

This was checked before the plan was written: the rule `:root[data-peek-state="arm"] { transition: none; }` was injected into the running page, and the same re-press sequence then read `--_layer` = 1.00 at 0, 19, 102, 302 and 701 ms.

## Repo conventions to follow

- Component CSS lives inside `@layer components { … }` in the component's own file. Both rules above are already in `src/components/Peek/Peek.css`. Edit them in place, don't add a new block.
- `transition: none` is the repo's existing way to reset a state (e.g. `src/components/Hero/Hero.css:576-579`). It isn't a raw value, so Stylelint's tokens-only rule allows it.
- Comments say why, in full sentences, in the repo's voice (see the existing comment above the arm rule).

## Steps

1. In `src/components/Peek/Peek.css`, replace the arm rule at lines 513-516 with the first target block above: the comment, then `:root[data-peek-state="arm"],` added as the first selector in the list.
2. In the same file, replace the settling rule at lines 562-567 with the second target block above, adding `:root.settling,` as the first selector. Keep its comment ("One frame without transitions, so a skip lands on the resting state instead of animating to it.").
3. In `tests/hero-runtime.e2e.ts`, add this test after the `'clean: no intro, and the Peek toggle opens and closes Peek'` test:

   ```ts
   test('Peek pressed again while it leaves redraws at full strength', async ({ page }) => {
     await page.goto('/?brand=backstage');
     const toggle = page.locator('[data-peek-toggle]');
     await toggle.click();
     await expect(html(page)).toHaveAttribute('data-peek-state', 'on');
     await page.waitForTimeout(2_000); // let the build land
     // The two timed presses run in the page, so test-runner latency can't push the re-press past the leave.
     const { was, layer } = await page.evaluate(async () => {
       const root = document.documentElement;
       const button = document.querySelector<HTMLElement>('[data-peek-toggle]')!;
       const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
       button.click(); // start leaving
       await wait(150); // mid-fade
       const was = root.dataset.peekState;
       button.click(); // press again
       await wait(300); // where the bug read 0.06
       return { was, layer: Number(getComputedStyle(root).getPropertyValue('--_layer')) };
     });
     expect(was).toBe('leaving');
     expect(layer).toBeGreaterThan(0.99);
   });
   ```

   (`html` is the helper already defined at the top of the file. `toggle` is used only for the first, untimed press.)

## Boundaries

- Do NOT touch `src/components/Hero/runtime.ts`. The fix is CSS only. (Fallback, only if the mechanical check in Verification fails: in `show()` at `runtime.ts:48-54`, add `root.getAnimations().forEach((a) => a.cancel());` as the first line after `stop();`, and say in the PR why the CSS alone wasn't enough.)
- Do NOT change any duration, easing or the leave choreography.
- Do NOT change markup.
- Do NOT add `[data-brand]` selectors.
- If the lines quoted above don't match what you find (drift since a6dd687), STOP and report. Don't improvise.

## Verification

- **Mechanical**: `pnpm test && pnpm typecheck`, then `pnpm check:tokens-only`, then `pnpm build && pnpm check:hero-runtime`. Everything passes, including the new test.
- **Feel check** (`pnpm dev`, then open `/?brand=backstage` at 1440 wide):
  - Press Peek and let it draw. Press it (the layer starts leaving), then press it again within about 0.3 s. The columns, boxes and labels redraw from nothing **at full strength**, with no faint redraw and no pop half a second in.
  - Repeat at `/?brand=clean` and `/?brand=blocks`. Same result: the bug is brand-agnostic.
  - Normal use is unchanged: press, let it draw, press, let it leave fully. Same choreography as before.
  - DevTools Animations panel at 10%: on the re-press, no `--_layer` transition is left on `html`.
- **Done when**: the new e2e test passes, and the re-press feel check shows no faint redraw in all three brands.
