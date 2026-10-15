/**
 * pnpm check:markup-invariance — one set of markup, many brands.
 *
 * For every built page, loaded under every brand (?brand=, the real head script): snapshot <body>,
 * switch to each other brand on the client, snapshot again. The markup must be identical and the
 * computed styles must differ (so the check can't pass because switching silently did nothing).
 *
 * Excluded by design, and disclosed in the Colophon:
 *   - <html data-brand>: the switch itself. Only <body> is snapshotted.
 *   - lazily injected font <link>s: they live in <head>, which isn't snapshotted.
 *   - the Remix control's own open/closed state: REMIX_UI_STATE attributes on [data-remix-ui] and its descendants.
 */
import { expect, test, type Page } from '@playwright/test';
import { brands, builtPages } from './site.ts';

const REMIX_UI_STATE = ['open', 'hidden', 'inert', 'aria-expanded', 'aria-pressed', 'aria-checked', 'data-state'];
const STYLE_PROPS = ['color', 'background-color', 'font-family', 'font-size', 'font-weight', 'padding', 'border', 'border-radius'];

test.skip(brands.length < 2, 'markup invariance needs at least two brands');

async function snapshot(page: Page) {
  return page.evaluate(
    ({ remixUiState, styleProps }) => {
      const body = document.body.cloneNode(true) as HTMLElement;
      for (const el of body.querySelectorAll('[data-remix-ui], [data-remix-ui] *'))
        for (const attr of remixUiState) el.removeAttribute(attr);
      const styles = [document.body, ...document.body.querySelectorAll('*')].map((el) => {
        const computed = getComputedStyle(el);
        return styleProps.map((prop) => computed.getPropertyValue(prop)).join('|');
      });
      // One tag per line so a failure prints a readable diff.
      return { html: body.outerHTML.replace(/></g, '>\n<'), styles: styles.join('\n') };
    },
    { remixUiState: REMIX_UI_STATE, styleProps: STYLE_PROPS },
  );
}

async function switchBrand(page: Page, brand: string) {
  await page.evaluate(async (name) => {
    document.documentElement.dataset.brand = name;
    // Let observers, islands and transitions react before snapshotting.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, brand);
}

for (const path of builtPages()) {
  for (const start of brands) {
    test(`${path} loaded as ${start}`, async ({ page }) => {
      await page.goto(`${path}?brand=${start}`);
      await expect(page.locator('html')).toHaveAttribute('data-brand', start);
      const before = await snapshot(page);

      for (const brand of brands.filter((b) => b !== start)) {
        await switchBrand(page, brand);
        const after = await snapshot(page);
        expect(after.html, `<body> markup changed when switching ${start} → ${brand} on ${path}`).toBe(before.html);
        expect(after.styles, `switching ${start} → ${brand} on ${path} changed no computed style`).not.toBe(before.styles);
      }
    });
  }
}
