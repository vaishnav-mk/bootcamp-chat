import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import ConversationSection from './ConversationSection';
import type { Conversation } from '@/types';

const mockUsers = [
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

const mockDirectConversations: Conversation[] = [
  {
    id: '1',
    type: 'direct',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T10:30:00Z',
    members: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      id: 'msg1',
      conversationId: '1',
      senderId: '2',
      content: 'hey, how are you doing?',
      messageType: 'text',
      createdAt: '2024-01-01T10:30:00Z',
      updatedAt: '2024-01-01T10:30:00Z',
    },
  },
  {
    id: '2',
    type: 'direct',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T09:15:00Z',
    members: [mockUsers[0], mockUsers[2]],
    lastMessage: {
      id: 'msg2',
      conversationId: '2',
      senderId: '3',
      content: 'thanks for the help yesterday!',
      messageType: 'text',
      createdAt: '2024-01-01T09:15:00Z',
      updatedAt: '2024-01-01T09:15:00Z',
    },
  },
];

const mockGroupConversations: Conversation[] = [
  {
    id: '3',
    type: 'group',
    name: 'team chat',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T11:15:00Z',
    members: mockUsers,
    lastMessage: {
      id: 'msg3',
      conversationId: '3',
      senderId: '2',
      content: 'let\'s schedule the meeting for tomorrow',
      messageType: 'text',
      createdAt: '2024-01-01T11:15:00Z',
      updatedAt: '2024-01-01T11:15:00Z',
    },
  },
  {
    id: '4',
    type: 'group',
    name: 'project updates',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T08:45:00Z',
    members: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      id: 'msg4',
      conversationId: '4',
      senderId: '1',
      content: 'deployed the latest changes to staging',
      messageType: 'text',
      createdAt: '2024-01-01T08:45:00Z',
      updatedAt: '2024-01-01T08:45:00Z',
    },
  },
];

const meta: Meta<typeof ConversationSection> = {
  title: 'Chat/ConversationSection',
  component: ConversationSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DndContext>
        <div className="w-80 bg-zinc-800 rounded-lg overflow-hidden">
          <Story />
        </div>
      </DndContext>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DirectMessages: Story = {
  args: {
    title: 'direct messages',
    conversations: mockDirectConversations,
    activeConversationId: '1',
    onConversationSelect: (id: string) => console.log('selected conversation:', id),
    currentUserId: '1',
  },
};

export const GroupChats: Story = {
  args: {
    title: 'group chats',
    conversations: mockGroupConversations,
    activeConversationId: null,
    onConversationSelect: (id: string) => console.log('selected conversation:', id),
    currentUserId: '1',
  },
};

export const EmptySection: Story = {
  args: {
    title: 'empty section',
    conversations: [],
    activeConversationId: null,
    onConversationSelect: (id: string) => console.log('selected conversation:', id),
    currentUserId: '1',
  },
  parameters: {
    docs: {
      description: {
        story: 'empty conversation section - should render nothing',
      },
    },
  },
};

export const ManyConversations: Story = {
  args: {
    title: 'many conversations',
    conversations: [
      ...mockDirectConversations,
      ...mockGroupConversations,
      {
        id: '5',
        type: 'direct',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T07:30:00Z',
        members: [mockUsers[0], mockUsers[2]],
      },
    ],
    activeConversationId: '3',
    onConversationSelect: (id: string) => console.log('selected conversation:', id),
    currentUserId: '1',
  },
};