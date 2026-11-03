import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stage } from '../Stage/Stage';
import { Card } from './Card';

type Args = { title: string; body: string };

const meta = {
  title: 'Components/Card',
  args: {
    title: 'Design engineering and frontend systems',
    body: 'Design systems, design-to-code pipelines, and frontend performance.',
  },
  argTypes: { title: { control: 'text' }, body: { control: 'text' } },
  render: ({ title, body }) => (
    <Stage>
      <Card title={title}>
        <p>{body}</p>
      </Card>
    </Stage>
  ),
} satisfies Meta<Args>;

export default meta;

export const Default: StoryObj<Args> = {};
