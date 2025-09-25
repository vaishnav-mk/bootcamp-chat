import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import DraggableConversation from './DraggableConversation';
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
];

const mockConversation: Conversation = {
  id: '1',
  type: 'direct',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T10:30:00Z',
  members: mockUsers,
  lastMessage: {
    id: 'msg1',
    conversationId: '1',
    senderId: '2',
    content: 'hey, how are you doing?',
    messageType: 'text',
    createdAt: '2024-01-01T10:30:00Z',
    updatedAt: '2024-01-01T10:30:00Z',
  },
};

const mockGroupConversation: Conversation = {
  id: '2',
  type: 'group',
  name: 'team chat',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T11:15:00Z',
  members: mockUsers,
  lastMessage: {
    id: 'msg2',
    conversationId: '2',
    senderId: '1',
    content: 'let\'s schedule the meeting for tomorrow',
    messageType: 'text',
    createdAt: '2024-01-01T11:15:00Z',
    updatedAt: '2024-01-01T11:15:00Z',
  },
};

const meta: Meta<typeof DraggableConversation> = {
  title: 'Chat/DraggableConversation',
  component: DraggableConversation,
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

export const DirectConversation: Story = {
  args: {
    conversation: mockConversation,
    isActive: false,
    onSelect: () => console.log('conversation selected'),
    currentUserId: '1',
  },
};

export const ActiveDirectConversation: Story = {
  args: {
    conversation: mockConversation,
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

export const DraggingState: Story = {
  args: {
    conversation: mockConversation,
    isActive: false,
    onSelect: () => console.log('conversation selected'),
    currentUserId: '1',
  },
  parameters: {
    docs: {
      description: {
        story: 'draggable conversation with drag handle visible - hover over the dots to see the grab cursor',
      },
    },
  },
};