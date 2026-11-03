import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        // Plain Node unit tests. `.storybook/` is listed because Vitest's default glob skips dot-directories.
        test: { name: 'unit', include: ['scripts/**/*.test.ts', 'src/**/*.test.ts', '.storybook/**/*.test.ts'] },
      },
      {
        // Every story becomes a render test, in a real Chromium: jsdom can't run the hero's canvas or style queries.
        extends: true,
        plugins: [storybookTest({ configDir: fileURLToPath(new URL('.storybook', import.meta.url)) })],
        test: {
          name: 'storybook',
          browser: { enabled: true, headless: true, provider: playwright({}), instances: [{ browser: 'chromium' }] },
        },
      },
      {
        // Behaviour that spans re-renders (brand switches, control flips, one story after another), which a story's
        // play function can't drive: portable stories mounted with React in one document.
        test: {
          name: 'workshop',
          include: ['.storybook/workshop.test.tsx'],
          setupFiles: ['.storybook/workshop.setup.ts'],
          browser: { enabled: true, headless: true, provider: playwright({}), instances: [{ browser: 'chromium' }] },
        },
      },
    ],
  },
});
