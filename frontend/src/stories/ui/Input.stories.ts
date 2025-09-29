import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../components/ui/Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'enter text here...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'password',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'disabled input',
    disabled: true,
    value: 'disabled value',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'placeholder text',
    defaultValue: 'preset value',
  },
};