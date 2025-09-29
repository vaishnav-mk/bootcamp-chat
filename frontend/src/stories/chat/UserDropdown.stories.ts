import type { Meta, StoryObj } from '@storybook/react';
import UserDropdown from '../../components/chat/sidebar/UserDropdown';

const mockUser = {
  id: '1',
  name: 'Alice Johnson',
  username: 'alice.j',
  email: 'alice@example.com',
  avatar: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta: Meta<typeof UserDropdown> = {
  title: 'Chat/UserDropdown',
  component: UserDropdown,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: 'object',
    },
    position: {
      control: 'object',
    },
    onStartDirectMessage: { action: 'start direct message' },
    onClose: { action: 'close dropdown' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TopLeft: Story = {
  args: {
    user: mockUser,
    position: { x: 100, y: 100 },
    onStartDirectMessage: () => {},
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown positioned at top-left area of screen',
      },
    },
  },
};

export const Center: Story = {
  args: {
    user: mockUser,
    position: { x: 400, y: 300 },
    onStartDirectMessage: () => {},
    onClose: () => {},
  },
};

export const BottomRight: Story = {
  args: {
    user: mockUser,
    position: { x: 800, y: 600 },
    onStartDirectMessage: () => {},
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Dropdown positioned at bottom-right - should auto-adjust to stay in viewport',
      },
    },
  },
};

export const LongUserName: Story = {
  args: {
    user: {
      ...mockUser,
      name: 'Alexander Christopher Montgomery',
      username: 'alexander.christopher.montgomery',
      avatar: undefined,
    },
    position: { x: 300, y: 200 },
    onStartDirectMessage: () => {},
    onClose: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing with very long user name and username',
      },
    },
  },
};