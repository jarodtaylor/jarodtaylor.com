import './layers.ts';
import '../src/styles/global.css';
import type { Decorator, Preview } from '@storybook/react-vite';
import { brandGlobalTypes, brandInitialGlobals, withBrand } from './brand.tsx';
import { tokenStyle } from './token-controls.ts';

/** Writes the story's token controls onto <html>, where the :root brand rules and the hero runtime see them. */
const withTokens: Decorator = (Story, context) => {
  const { style } = document.documentElement;
  for (const [property, value] of Object.entries(tokenStyle(context.args))) {
    if (style.getPropertyValue(property) === (value ?? '')) continue; // unchanged: no mutation for the runtime to react to
    if (value === null) style.removeProperty(property);
    else style.setProperty(property, value);
  }
  return <Story />;
};

const preview: Preview = {
  globalTypes: brandGlobalTypes,
  initialGlobals: brandInitialGlobals,
  decorators: [withTokens, withBrand],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: { order: ['Page', 'Components', ['Header', '*']] },
    },
  },
};

export default preview;
