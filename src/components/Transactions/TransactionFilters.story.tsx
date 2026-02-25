import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { mockAccounts, mockCategories, initialVendors } from '@/mocks/budgetData';
import { TransactionFilters } from './TransactionFilters';

const meta: Meta<typeof TransactionFilters> = {
  title: 'Components/Transactions/TransactionFilters',
  component: TransactionFilters,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof TransactionFilters>;

export const Default: Story = {
  args: {
    filters: { direction: 'all' },
    onChange: () => {},
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
  },
};

export const WithFiltersActive: Story = {
  args: {
    filters: {
      direction: 'Outgoing',
      accountIds: ['acc-1'],
      categoryIds: ['cat-out-1'],
    },
    onChange: () => {},
    accounts: mockAccounts,
    categories: mockCategories,
    vendors: initialVendors,
  },
};
