import type { Meta, StoryObj } from '@storybook/react';
import MembersSidebar from './MembersSidebar';
import type { Conversation, User } from '@/types';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    username: 'johndoe',
    name: 'john doe',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'jane@example.com',
    username: 'janedoe',
    name: 'jane doe',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'alice@example.com',
    username: 'alice',
    name: 'alice smith',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockGroupConversation: Conversation = {
  id: '1',
  type: 'group',
  name: 'team chat',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T11:15:00Z',
  members: mockUsers,
  lastMessage: {
    id: 'msg1',
    conversationId: '1',
    senderId: '2',
    content: 'hey everyone!',
    messageType: 'text',
    createdAt: '2024-01-01T11:15:00Z',
    updatedAt: '2024-01-01T11:15:00Z',
  },
};

const mockDirectConversation: Conversation = {
  id: '2',
  type: 'direct',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T10:30:00Z',
  members: [mockUsers[0], mockUsers[1]],
  lastMessage: {
    id: 'msg2',
    conversationId: '2',
    senderId: '2',
    content: 'hey there!',
    messageType: 'text',
    createdAt: '2024-01-01T10:30:00Z',
    updatedAt: '2024-01-01T10:30:00Z',
  },
};

const mockGroupWithoutName: Conversation = {
  ...mockGroupConversation,
  id: '3',
  name: undefined,
};

const meta: Meta<typeof MembersSidebar> = {
  title: 'Chat/MembersSidebar',
  component: MembersSidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-96 bg-zinc-900">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GroupConversation: Story = {
  args: {
    conversation: mockGroupConversation,
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
};

export const GroupWithoutName: Story = {
  args: {
    conversation: mockGroupWithoutName,
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
  parameters: {
    docs: {
      description: {
        story: 'group conversation without a name',
      },
    },
  },
};

export const NoConversationSelected: Story = {
  args: {
    conversation: undefined,
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
  parameters: {
    docs: {
      description: {
        story: 'sidebar when no conversation is selected',
      },
    },
  },
};

export const DirectConversation: Story = {
  args: {
    conversation: mockDirectConversation,
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
  parameters: {
    docs: {
      description: {
        story: 'direct conversation - should not render sidebar (returns null)',
      },
    },
  },
};

export const EmptyGroupConversation: Story = {
  args: {
    conversation: {
      ...mockGroupConversation,
      members: [],
    },
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
  parameters: {
    docs: {
      description: {
        story: 'group conversation with no members',
      },
    },
  },
};