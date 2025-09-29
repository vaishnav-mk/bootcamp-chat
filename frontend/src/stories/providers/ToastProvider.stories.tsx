import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider } from '../../components/providers/ToastProvider';
import toast from 'react-hot-toast';

const meta: Meta<typeof ToastProvider> = {
  title: 'Providers/ToastProvider',
  component: ToastProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ToastDemo = () => {
  return (
    <div className="p-8 space-y-4 bg-zinc-900 text-white min-h-screen">
      <h2 className="text-xl font-bold mb-4">Toast Notifications Demo</h2>
      <div className="space-y-2">
        <button
          onClick={() => toast.success('Operation completed successfully!')}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-2"
        >
          Success Toast
        </button>
        <button
          onClick={() => toast.error('Something went wrong!')}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded mr-2"
        >
          Error Toast
        </button>
        <button
          onClick={() => toast('Just a regular message')}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mr-2"
        >
          Default Toast
        </button>
        <button
          onClick={() => toast.loading('Loading...', { duration: 2000 })}
          className="bg-zinc-600 hover:bg-zinc-700 px-4 py-2 rounded mr-2"
        >
          Loading Toast
        </button>
      </div>
      <p className="text-zinc-400 text-sm mt-4">
        Click the buttons above to see different toast notification styles.
        Toasts will appear in the top-right corner.
      </p>
      <ToastProvider />
    </div>
  );
};

export const Default: Story = {
  render: () => <ToastDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Toast provider component that handles all toast notifications. Click the buttons to see different toast types.',
      },
    },
  },
};