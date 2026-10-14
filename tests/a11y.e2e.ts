/**
 * pnpm check:a11y — axe-core on every built page × every brand. Fails on serious or critical
 * WCAG 2.2 A/AA violations; moderate and minor ones are printed but don't fail.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { brands, builtPages } from './site.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const BLOCKING = ['serious', 'critical'];

for (const path of builtPages()) {
  for (const brand of brands) {
    test(`${path} as ${brand}`, async ({ page }) => {
      await page.goto(`${path}?brand=${brand}`);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();

      const report = violations.map(
        (v) => `[${v.impact}] ${v.id}: ${v.help} (${v.helpUrl})\n${v.nodes.map((n) => `    ${n.target.join(' ')}`).join('\n')}`,
      );
      if (report.length) console.log(`${path} as ${brand}:\n${report.join('\n')}`);

      const blocking = violations.filter((v) => BLOCKING.includes(v.impact ?? '')).map((v) => v.id);
      expect(blocking, `serious/critical axe violations on ${path} as ${brand}; details above`).toEqual([]);
    });
  }
}
