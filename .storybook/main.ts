import type { StorybookConfig } from '@storybook/react-vite';

// Canvas only: no docs addon, so no Docs/autodocs pages. Docs mode renders several stories in one
// document, where <html> token overrides and two hero runtimes would collide.
const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.tsx'],
  addons: ['@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  // Fonts load from root-absolute /fonts/ URLs, as on the site.
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
};

export default config;
