import { defineConfig, devices } from '@playwright/test';

// Checks run against the static build (`pnpm build` first), served by `astro preview` on a dedicated port
// so a running dev server is never mistaken for the build. --ignore-lock keeps it in the foreground:
// Astro otherwise backgrounds the server when it detects an AI agent, and Playwright would lose it.
const port = 4329;

export default defineConfig({
  testDir: './tests',
  testMatch: '*.e2e.ts', // not *.spec.ts: Vitest would pick those up
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL: `http://localhost:${port}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec astro preview --port ${port} --ignore-lock`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: false,
  },
});
