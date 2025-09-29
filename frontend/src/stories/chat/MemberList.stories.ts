import type { Meta, StoryObj } from '@storybook/react';
import MemberList from '../../components/chat/modals/MemberList';

const mockUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    username: 'alice.j',
  },
  {
    id: '2',
    name: 'Bob Smith', 
    username: 'bobsmith',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    username: 'charlie.b',
  },
];

const meta: Meta<typeof MemberList> = {
  title: 'Chat/MemberList',
  component: MemberList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    members: {
      control: 'object',
    },
    onRemoveMember: { action: 'remove member' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMembers: Story = {
  args: {
    members: mockUsers,
    onRemoveMember: () => {},
  },
};

export const SingleMember: Story = {
  args: {
    members: [mockUsers[0]],
    onRemoveMember: () => {},
  },
};

export const ManyMembers: Story = {
  args: {
    members: [
      ...mockUsers,
      {
        id: '4',
        name: 'David Wilson',
        username: 'david.w',
      },
      {
        id: '5',
        name: 'Emma Davis',
        username: 'emma.davis',
      },
      {
        id: '6',
        name: 'Frank Miller',
        username: 'frank.m',
      },
    ],
    onRemoveMember: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the list behaves with many members (scroll behavior)',
      },
    },
  },
};

export const EmptyList: Story = {
  args: {
    members: [],
    onRemoveMember: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty member list - component returns null and renders nothing',
      },
    },
  },
};