import type { Meta, StoryObj } from '@storybook/react';
import UserDropdown from './UserDropdown';
import type { User } from '@/types';

const mockUser: User = {
  id: '1',
  email: 'john@example.com',
  username: 'johndoe',
  name: 'john doe',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const meta: Meta<typeof UserDropdown> = {
  title: 'Chat/UserDropdown',
  component: UserDropdown,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 bg-zinc-900 min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: mockUser,
    onStartDirectMessage: (userId: string) => console.log('start dm with:', userId),
    onClose: () => console.log('dropdown closed'),
    position: { x: 200, y: 200 },
  },
};

export const LongUsername: Story = {
  args: {
    user: {
      ...mockUser,
      name: 'john alexander smith-johnson',
      username: 'johnalexandersmithjohnson123',
    },
    onStartDirectMessage: (userId: string) => console.log('start dm with:', userId),
    onClose: () => console.log('dropdown closed'),
    position: { x: 200, y: 200 },
  },
};

export const NearRightEdge: Story = {
  args: {
    user: mockUser,
    onStartDirectMessage: (userId: string) => console.log('start dm with:', userId),
    onClose: () => console.log('dropdown closed'),
    position: { x: 1200, y: 200 },
  },
  parameters: {
    docs: {
      description: {
        story: 'dropdown positioned near right edge of screen - should adjust position automatically',
      },
    },
  },
};

export const NearBottomEdge: Story = {
  args: {
    user: mockUser,
    onStartDirectMessage: (userId: string) => console.log('start dm with:', userId),
    onClose: () => console.log('dropdown closed'),
    position: { x: 200, y: 800 },
  },
  parameters: {
    docs: {
      description: {
        story: 'dropdown positioned near bottom edge of screen - should adjust position automatically',
      },
    },
  },
};