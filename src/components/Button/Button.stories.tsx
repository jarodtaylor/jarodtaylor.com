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
      {/* In normal flow, as on /lab: Stage is a grid, which would stretch the button to the viewport's width. */}
      <p>
        <Button href={href || undefined}>{label}</Button>
      </p>
    </Stage>
  ),
} satisfies Meta<Args>;

export default meta;

export const AsButton: StoryObj<Args> = {};
export const AsLink: StoryObj<Args> = { args: { href: '/writing/' } };
