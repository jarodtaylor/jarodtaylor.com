import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokenArgs, tokenArgTypes } from '../../../.storybook/token-controls';
import { Stage } from '../Stage/Stage';
import { Header } from './Header';

const KNOBS = ['label-case', 'nav-align', 'menu-shape'] as const;
type Args = Record<(typeof KNOBS)[number], string>;

const meta = {
  title: 'Components/Header',
  args: tokenArgs(KNOBS),
  argTypes: tokenArgTypes(KNOBS),
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
