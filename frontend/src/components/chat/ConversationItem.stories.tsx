import type { Meta, StoryObj } from '@storybook/react';
import ConversationItem from './ConversationItem';
import type { Conversation } from '@/types';

const mockUser = {
  id: '1',
  email: 'john@example.com',
  username: 'johndoe',
  name: 'john doe',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockUser2 = {
  id: '2',
  email: 'jane@example.com',
  username: 'janedoe',
  name: 'jane doe',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockDirectConversation: Conversation = {
  id: '1',
  type: 'direct',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T10:30:00Z',
  members: [mockUser, mockUser2],
  lastMessage: {
    id: 'msg1',
    conversationId: '1',
    senderId: '2',
    content: 'hey, how are you doing?',
    messageType: 'text',
    createdAt: '2024-01-01T10:30:00Z',
    updatedAt: '2024-01-01T10:30:00Z',
    sender: mockUser2,
  },
};

const mockGroupConversation: Conversation = {
  id: '2',
  type: 'group',
  name: 'team chat',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T11:15:00Z',
  members: [mockUser, mockUser2, {
    id: '3',
    email: 'alice@example.com',
    username: 'alice',
    name: 'alice smith',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }],
  lastMessage: {
    id: 'msg2',
    conversationId: '2',
    senderId: '3',
    content: 'let\'s discuss the project requirements in today\'s meeting',
    messageType: 'text',
    createdAt: '2024-01-01T11:15:00Z',
    updatedAt: '2024-01-01T11:15:00Z',
  },
};

const mockConversationWithoutLastMessage: Conversation = {
  id: '3',
  type: 'direct',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  members: [mockUser, mockUser2],
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
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-zinc-800 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DirectConversation: Story = {
  args: {
    conversation: mockDirectConversation,
    isActive: false,
    onSelect: () => console.log('conversation selected'),
    currentUserId: '1',
  },
};

export const ActiveDirectConversation: Story = {
  args: {
    conversation: mockDirectConversation,
    isActive: true,
    onSelect: () => console.log('conversation selected'),
    currentUserId: '1',
  },
};

export const GroupConversation: Story = {
  args: {
    conversation: mockGroupConversation,
    isActive: false,
    onSelect: () => console.log('conversation selected'),
    currentUserId: '1',
  },
};

export const ActiveGroupConversation: Story = {
  args: {
    conversation: mockGroupConversation,
    isActive: true,
    onSelect: () => console.log('conversation selected'),
    currentUserId: '1',
  },
};

export const ConversationWithoutLastMessage: Story = {
  args: {
    conversation: mockConversationWithoutLastMessage,
    isActive: false,
    onSelect: () => console.log('conversation selected'),
    currentUserId: '1',
  },
};