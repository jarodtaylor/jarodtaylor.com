import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jarodtaylor.com',
  integrations: [react(), mdx()],

  // View-source is part of the portfolio: keep HTML and CSS human-readable.
  compressHTML: false,
  // Belt and braces: no scoped <style> in .astro files, but if one slips in it adds no specificity.
  scopedStyleStrategy: 'where',
  build: { inlineStylesheets: 'never' },
  vite: { build: { cssMinify: false } },
});
