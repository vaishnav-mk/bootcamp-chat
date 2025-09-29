import type { Meta, StoryObj } from '@storybook/react';
import ConversationTypeToggle from '../../components/chat/modals/ConversationTypeToggle';

const meta: Meta<typeof ConversationTypeToggle> = {
  title: 'Chat/ConversationTypeToggle',
  component: ConversationTypeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    conversationType: {
      control: 'select',
      options: ['direct', 'group'],
    },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DirectSelected: Story = {
  args: {
    conversationType: 'direct',
    onChange: () => {},
  },
};

export const GroupSelected: Story = {
  args: {
    conversationType: 'group',
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    conversationType: 'direct',
  },
  parameters: {
    docs: {
      description: {
        story: 'Toggle between direct message and group chat options. Click to see the toggle behavior.',
      },
    },
  },
};