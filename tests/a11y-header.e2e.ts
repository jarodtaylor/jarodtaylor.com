/**
 * Part of pnpm check:a11y: the phone header's touch targets (WCAG 2.5.8, kept at 44px) and the folded menu, which
 * closes when Tab leaves it so focus never lands behind the open panel (WCAG 2.4.11).
 */
import { expect, test } from '@playwright/test';
import { brands } from './site.ts';

const TARGET = 44;

for (const brand of brands) {
  test(`phone header targets are at least ${TARGET}px as ${brand}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/?brand=${brand}`);
    const sizes = await page.evaluate(() =>
      ['.mark', '.peek-toggle', '.tool.remix', '.nav-toggle', '.social a'].flatMap((sel) =>
        [...document.querySelectorAll(sel)].map((el) => {
          const r = el.getBoundingClientRect();
          return { sel, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
        }),
      ),
    );
    const small = sizes.filter(({ sel, w, h }) => h < TARGET || (sel !== '.social a' && w < TARGET));
    expect(small, 'targets under 44px (socials are checked for height only: their width is the text)').toEqual([]);
  });

  test(`Tab out of the open phone menu closes it as ${brand}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/?brand=${brand}`);
    const menu = page.locator('#nav-list');
    await page.locator('.nav-toggle').click();
    await expect(menu).toBeVisible();

    await menu.locator('a').last().focus();
    await page.keyboard.press('Tab');
    await expect(menu).toBeHidden();
    expect(await page.evaluate(() => document.querySelector('#nav-list')!.contains(document.activeElement))).toBe(false);
  });

  test(`touch tablet nav links are at least ${TARGET}px tall as ${brand}`, async ({ browser }) => {
    const { baseURL } = test.info().project.use;
    const context = await browser.newContext({ baseURL, viewport: { width: 1180, height: 820 }, hasTouch: true });
    const page = await context.newPage();
    await page.goto(`/?brand=${brand}`);
    const heights = await page.evaluate(() => [...document.querySelectorAll('#nav-list a')].map((a) => a.getBoundingClientRect().height));
    expect(heights.length).toBeGreaterThan(0);
    expect(heights.filter((h) => h < 44), 'inline nav links under 44px on a touch screen').toEqual([]);
    await context.close();
  });
}

test('the header nav on a missing page leads back to the homepage', async ({ page }) => {
  await page.goto('/no-such-page/');
  await page.locator('#nav-list a', { hasText: 'Work' }).evaluate((a: HTMLAnchorElement) => a.click());
  await expect(page).toHaveURL(/\/#work$/);
});
