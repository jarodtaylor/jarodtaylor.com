import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        // Plain Node unit tests. `.storybook/` is listed because Vitest's default glob skips dot-directories.
        test: { name: 'unit', include: ['scripts/**/*.test.ts', 'src/**/*.test.ts', '.storybook/**/*.test.ts'] },
      },
    ],
  },
});
