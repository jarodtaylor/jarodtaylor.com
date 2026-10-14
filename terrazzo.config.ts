import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import { brandsFromResolver } from './scripts/brands.ts';
import resolvedJson from './scripts/terrazzo-plugin-resolved-json.ts';

const brands = brandsFromResolver();

export default defineConfig({
  tokens: ['./tokens/resolver.json'],
  // Root, so one build can write into src/ (CSS) and public/ (JSON). Terrazzo never cleans outDir.
  outDir: './',
  plugins: [
    css({
      filename: 'src/styles/tokens.css',
      // One block per brand. The default brand also claims :root so the page is styled before any attribute is set.
      permutations: brands.all.map((brand) => {
        const selector = brand === brands.default ? `:root,\n  [data-brand="${brand}"]` : `[data-brand="${brand}"]`;
        return {
          input: { brand },
          prepare: (contents: string) => `@layer tokens {\n  ${selector} {\n    ${contents}\n  }\n}`,
        };
      }),
    }),
    resolvedJson({ dir: 'public/tokens', brands: brands.all }),
  ],
});
