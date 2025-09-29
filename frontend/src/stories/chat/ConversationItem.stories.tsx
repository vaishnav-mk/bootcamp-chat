import type { Meta, StoryObj } from '@storybook/react';
import ConversationItem from '../../components/chat/conversation/ConversationItem';

const mockConversation = {
  id: '1',
  type: 'direct' as const,
  name: 'Alice Johnson',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: '2',
  members: [
    {
      id: '1',
      name: 'Current User',
      username: 'current.user',
      email: 'current@example.com',
      avatar: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Alice Johnson',
      username: 'alice.j',
      email: 'alice@example.com',
      avatar: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  lastMessage: {
    id: '1',
    content: 'Hello! How are you doing today?',
    senderId: '2',
    conversationId: '1',
    messageType: 'text' as const,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
};

const mockGroupConversation = {
  ...mockConversation,
  id: '2',
  type: 'group' as const,
  name: 'Team Discussion',
  members: [
    ...mockConversation.members,
    {
      id: '3',
      name: 'Bob Smith',
      username: 'bob.s',
      email: 'bob@example.com',
      avatar: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  lastMessage: {
    ...mockConversation.lastMessage,
    content: 'Let\'s discuss the upcoming project deadline',
    messageType: 'text' as const,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
};

const meta: Meta<typeof ConversationItem> = {
  title: 'Chat/ConversationItem',
  component: ConversationItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isActive: {
      control: 'boolean',
    },
    onSelect: { action: 'conversation selected' },
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-zinc-800">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DirectMessageActive: Story = {
  args: {
    conversation: mockConversation,
    isActive: true,
    currentUserId: '1',
    onSelect: () => {},
  },
};

export const DirectMessageInactive: Story = {
  args: {
    conversation: mockConversation,
    isActive: false,
    currentUserId: '1',
    onSelect: () => {},
  },
};

export const GroupChatActive: Story = {
  args: {
    conversation: mockGroupConversation,
    isActive: true,
    currentUserId: '1',
    onSelect: () => {},
  },
};

export const GroupChatInactive: Story = {
  args: {
    conversation: mockGroupConversation,
    isActive: false,
    currentUserId: '1',
    onSelect: () => {},
  },
};

export const NoLastMessage: Story = {
  args: {
    conversation: {
      ...mockConversation,
      lastMessage: undefined,
    },
    isActive: false,
    currentUserId: '1',
    onSelect: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Conversation item without any messages yet',
      },
    },
  },
};

export const LongMessagePreview: Story = {
  args: {
    conversation: {
      ...mockConversation,
      lastMessage: {
        ...mockConversation.lastMessage!,
        content: 'This is a very long message that should be truncated when displayed in the conversation preview to avoid breaking the layout and ensure it fits nicely within the allocated space.',
        messageType: 'text' as const,
      },
    },
    isActive: false,
    currentUserId: '1',
    onSelect: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how long messages are truncated in the preview',
      },
    },
  },
};