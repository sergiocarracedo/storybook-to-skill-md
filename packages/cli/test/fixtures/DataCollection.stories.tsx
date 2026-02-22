import type { Meta, StoryObj } from '@storybook/react';

import { DataCollection } from './DataCollection';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const sampleData: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
];

const columns = [
  { key: 'id' as const, header: 'ID' },
  { key: 'name' as const, header: 'Name' },
  { key: 'email' as const, header: 'Email' },
  { key: 'role' as const, header: 'Role' },
];

const meta: Meta<typeof DataCollection<User>> = {
  title: 'Components/Data Collection',
  component: DataCollection,
  tags: ['autodocs'],
  argTypes: {
    selectable: {
      description: 'Enable row selection with checkboxes',
      control: { type: 'boolean' },
    },
    pagination: {
      description: 'Enable pagination controls',
      control: { type: 'boolean' },
    },
    pageSize: {
      description: 'Number of items per page',
      control: { type: 'number' },
    },
    sortable: {
      description: 'Enable column sorting',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Show loading state',
      control: { type: 'boolean' },
    },
  },
  args: {
    data: sampleData,
    columns,
    selectable: false,
    pagination: false,
    pageSize: 10,
    sortable: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof DataCollection<User>>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: {
    selectable: true,
  },
};

export const WithPagination: Story = {
  args: {
    pagination: true,
    pageSize: 2,
  },
};

export const WithSorting: Story = {
  args: {
    sortable: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyMessage: 'No users found',
  },
};
