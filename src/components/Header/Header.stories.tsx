import type { Meta, StoryObj } from '@storybook/react-vite';
import { BRAND_DEFAULT, tokenArgTypes } from '../../../.storybook/token-controls';
import { Stage } from '../Stage/Stage';
import { Header } from './Header';

type Args = { 'label-case': string; 'nav-align': string; 'menu-shape': string };

const meta = {
  title: 'Components/Header',
  args: { 'label-case': BRAND_DEFAULT, 'nav-align': BRAND_DEFAULT, 'menu-shape': BRAND_DEFAULT },
  argTypes: tokenArgTypes(['label-case', 'nav-align', 'menu-shape']),
  render: () => (
    <Stage>
      <Header />
    </Stage>
  ),
} satisfies Meta<Args>;

export default meta;

export const Default: StoryObj<Args> = {};

/** menu-shape only applies below the header's wide breakpoint, where the nav collapses into a menu. */
export const Phone: StoryObj<Args> = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
