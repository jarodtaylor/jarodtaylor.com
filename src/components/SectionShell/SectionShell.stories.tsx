import type { Meta, StoryObj } from '@storybook/react-vite';
import { BRAND_DEFAULT, tokenArgTypes } from '../../../.storybook/token-controls';
import { Stage } from '../Stage/Stage';
import { SectionShell } from './SectionShell';

type Args = { title: string; surface: 'default' | 'raised' | 'inverse' | 'accent'; level: 1 | 2; decoration: string };

const meta = {
  title: 'Components/SectionShell',
  args: { title: 'What I write about', surface: 'default', level: 2, decoration: BRAND_DEFAULT },
  argTypes: {
    title: { control: 'text' },
    surface: { control: 'radio', options: ['default', 'raised', 'inverse', 'accent'] },
    level: { control: 'radio', options: [1, 2] },
    ...tokenArgTypes(['decoration']),
  },
  render: ({ title, surface, level }) => (
    <Stage>
      <SectionShell title={title} surface={surface} level={level}>
        <p>Four topics. Three I've done for years, one I'm learning out loud.</p>
      </SectionShell>
    </Stage>
  ),
} satisfies Meta<Args>;

export default meta;

export const Default: StoryObj<Args> = {};
export const Raised: StoryObj<Args> = { args: { surface: 'raised' } };
