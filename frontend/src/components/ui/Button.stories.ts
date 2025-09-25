import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    disabled: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'primary button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'secondary button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'ghost button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'danger button',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'disabled button',
    disabled: true,
  },
};

export const LongText: Story = {
  args: {
    variant: 'primary',
    children: 'this is a button with very long text to test wrapping behavior',
  },
};