import type { Decorator } from '@storybook/react-vite';
import resolver from '../tokens/resolver.json';

const { contexts, default: defaultBrand } = resolver.modifiers.brand;
export const brands = Object.keys(contexts);

export const brandGlobalTypes = {
  brand: {
    description: 'Brand: the same markup, different tokens',
    toolbar: { title: 'Brand', icon: 'paintbrush', items: brands, dynamicTitle: true },
  },
};
export const brandInitialGlobals = { brand: defaultBrand };

function scrubHtml(): void {
  const html = document.documentElement;
  html.removeAttribute('style');
  html.removeAttribute('data-peek-state');
  html.classList.remove('js', 'intro', 'building', 'settling');
}

let lastStoryId: string | undefined;

/**
 * Sets data-brand on <html> synchronously, before the story renders, so the hero runtime starts under the right
 * brand (@storybook/addon-themes sets it in an effect, after the first render). Scrubs <html> only when the story
 * changes, never on an args or brand change, so token overrides persist across brand switches.
 */
export const withBrand: Decorator = (Story, context) => {
  if (context.id !== lastStoryId) {
    scrubHtml();
    lastStoryId = context.id;
  }
  const brand = context.globals.brand as string;
  const next = brands.includes(brand) ? brand : defaultBrand;
  // Rewriting the same value still queues a mutation record, which the hero runtime reads as a brand switch.
  if (document.documentElement.dataset.brand !== next) document.documentElement.dataset.brand = next;
  return <Story />;
};
