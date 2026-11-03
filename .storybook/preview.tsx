import './layers.ts';
import '../src/styles/global.css';
import type { Preview } from '@storybook/react-vite';
import { brandGlobalTypes, brandInitialGlobals, withBrand } from './brand.tsx';

const preview: Preview = {
  globalTypes: brandGlobalTypes,
  initialGlobals: brandInitialGlobals,
  decorators: [withBrand],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: { order: ['Page', 'Components', ['Header', '*']] },
    },
  },
};

export default preview;
