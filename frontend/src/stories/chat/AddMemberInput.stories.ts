import type { Meta, StoryObj } from '@storybook/react';
import AddMemberInput from '../../components/chat/modals/AddMemberInput';

const meta: Meta<typeof AddMemberInput> = {
  title: 'Chat/AddMemberInput',
  component: AddMemberInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
    },
    conversationType: {
      control: 'select',
      options: ['direct', 'group'],
    },
    disabled: {
      control: 'boolean',
    },
    isSearching: {
      control: 'boolean',
    },
    onChange: { action: 'value changed' },
    onAdd: { action: 'add member' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DirectMessage: Story = {
  args: {
    value: '',
    conversationType: 'direct',
    disabled: false,
    isSearching: false,
    onChange: () => {},
    onAdd: () => {},
  },
};

export const GroupChat: Story = {
  args: {
    value: '',
    conversationType: 'group',
    disabled: false,
    isSearching: false,
    onChange: () => {},
    onAdd: () => {},
  },
};

export const WithValue: Story = {
  args: {
    value: 'john.doe',
    conversationType: 'group',
    disabled: false,
    isSearching: false,
    onChange: () => {},
    onAdd: () => {},
  },
};

export const Searching: Story = {
  args: {
    value: 'searching...',
    conversationType: 'group',
    disabled: false,
    isSearching: true,
    onChange: () => {},
    onAdd: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state when searching for a user',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    value: 'cannot.add',
    conversationType: 'group',
    disabled: true,
    isSearching: false,
    onChange: () => {},
    onAdd: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state (e.g., when max members reached)',
      },
    },
  },
};