import type { Meta, StoryObj } from '@storybook/react';
import CreateConversationModal from './CreateConversationModal';

const meta: Meta<typeof CreateConversationModal> = {
  title: 'Chat/CreateConversationModal',
  component: CreateConversationModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-zinc-900 p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClose: () => console.log('modal closed'),
    onCreateConversation: (data) => {
      console.log('create conversation:', data);
      return Promise.resolve();
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'modal for creating new conversations - supports both direct messages and group chats',
      },
    },
  },
};

export const GroupChatMode: Story = {
  args: {
    onClose: () => console.log('modal closed'),
    onCreateConversation: (data) => {
      console.log('create conversation:', data);
      return Promise.resolve();
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'modal in group chat mode - allows adding multiple members',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // You can add interactions here if needed
    // const canvas = within(canvasElement);
    // const groupButton = canvas.getByText('group chat');
    // await userEvent.click(groupButton);
  },
};