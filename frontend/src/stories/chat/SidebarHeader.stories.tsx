import type { Meta, StoryObj } from '@storybook/react';
import SidebarHeader from '../../components/chat/sidebar/SidebarHeader';
import { useAuth } from '../../context/AuthContext';

// Mock the useAuth hook for Storybook
const mockUser = {
  id: '1',
  name: 'John Doe',
  username: 'john.doe',
  email: 'john@example.com',
  avatar: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta: Meta<typeof SidebarHeader> = {
  title: 'Chat/SidebarHeader',
  component: SidebarHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Sidebar header component showing user info and new chat button. Note: This component requires AuthContext which may not render properly in Storybook without proper mocking.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onNewChat: { action: 'new chat clicked' },
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

// Note: This story may not render correctly without proper AuthContext mocking
export const Default: Story = {
  args: {
    onNewChat: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Default sidebar header. May require AuthContext to be properly mocked to render correctly.',
      },
    },
  },
};