import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stage } from '../Stage/Stage';
import { Button } from './Button';

type Args = { label: string; href: string };

const meta = {
  title: 'Components/Button',
  args: { label: 'Read the writing', href: '' },
  argTypes: {
    label: { name: 'Text', control: 'text' },
    href: { name: 'Link (empty renders a <button>)', control: 'text' },
  },
  render: ({ label, href }) => (
    <Stage>
      <Button href={href || undefined}>{label}</Button>
    </Stage>
  ),
} satisfies Meta<Args>;

export default meta;

export const AsButton: StoryObj<Args> = {};
export const AsLink: StoryObj<Args> = { args: { href: '/writing/' } };
