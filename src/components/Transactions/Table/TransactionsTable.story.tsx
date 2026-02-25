import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { TransactionsTable } from './TransactionsTable';

const meta: Meta<typeof TransactionsTable> = {
  title: 'Pages/Transactions/TransactionsTable',
  component: TransactionsTable,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ padding: false })],
};

export default meta;
type Story = StoryObj<typeof TransactionsTable>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/transactions')] },
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/transactions')] },
  },
};

export const Empty: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.empty('/api/v1/transactions')] },
  },
};
