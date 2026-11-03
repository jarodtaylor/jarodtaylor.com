import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokenArgs, tokenArgTypes } from '../../../.storybook/token-controls';
import { Stage } from './Stage';

type Args = { 'font-smoothing': string };

const meta = {
  title: 'Components/Stage',
  args: tokenArgs(['font-smoothing']),
  argTypes: tokenArgTypes(['font-smoothing']),
  render: () => (
    <Stage>
      <p>The first viewport as one frame. Its tokens set the height and how glyphs are rasterised.</p>
    </Stage>
  ),
} satisfies Meta<Args>;

export default meta;

export const Default: StoryObj<Args> = {};
