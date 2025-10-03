import type { Meta, StoryObj } from '@storybook/react';
import UsersSection from './UsersSection';
import type { User } from '@/types';

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
  {
    id: '4',
    email: 'bob@example.com',
    username: 'bob',
    name: 'bob johnson',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const meta: Meta<typeof UsersSection> = {
  title: 'Chat/UsersSection',
  component: UsersSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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

export const WithMultipleUsers: Story = {
  args: {
    users: mockUsers,
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
};

export const SingleUser: Story = {
  args: {
    users: [mockUsers[0], mockUsers[1]], // Current user + one other user
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
};

export const EmptyUsersSection: Story = {
  args: {
    users: [mockUsers[0]], // Only current user
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
  parameters: {
    docs: {
      description: {
        story: 'users section with only current user - should render nothing',
      },
    },
  },
};

export const ManyUsers: Story = {
  args: {
    users: [
      ...mockUsers,
      {
        id: '5',
        email: 'charlie@example.com',
        username: 'charlie',
        name: 'charlie brown with a very long name that should truncate',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '6',
        email: 'david@example.com',
        username: 'david_with_very_long_username',
        name: 'david wilson',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
    currentUserId: '1',
    onStartDirectMessage: (userId: string) => console.log('start dm with user:', userId),
  },
  parameters: {
    docs: {
      description: {
        story: 'users section with many users, including names that should truncate',
      },
    },
  },
};