import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokenArgs, tokenArgTypes } from '../../../.storybook/token-controls';
import { Stage } from '../Stage/Stage';
import { InfoStrip } from './InfoStrip';

type Args = { 'info-align': string };

const meta = {
  title: 'Components/InfoStrip',
  args: tokenArgs(['info-align']),
  argTypes: tokenArgTypes(['info-align']),
  render: () => (
    <Stage>
      <InfoStrip />
    </Stage>
  ),
} satisfies Meta<Args>;

export default meta;

export const Default: StoryObj<Args> = {};
