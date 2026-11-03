import type { Meta, StoryObj } from '@storybook/react-vite';
import { BRAND_DEFAULT, tokenArgTypes } from '../../../.storybook/token-controls';
import { Stage } from './Stage';

type Args = { 'font-smoothing': string };

const meta = {
  title: 'Components/Stage',
  args: { 'font-smoothing': BRAND_DEFAULT },
  argTypes: tokenArgTypes(['font-smoothing']),
  render: () => (
    <Stage>
      <p>The first viewport as one frame. Its tokens set the height and how glyphs are rasterised.</p>
    </Stage>
  ),
} satisfies Meta<Args>;

export default meta;

export const Default: StoryObj<Args> = {};
