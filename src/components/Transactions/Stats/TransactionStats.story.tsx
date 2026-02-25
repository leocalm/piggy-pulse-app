import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { TransactionStats } from './TransactionStats';

const meta: Meta<typeof TransactionStats> = {
  title: 'Components/Transactions/TransactionStats',
  component: TransactionStats,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof TransactionStats>;

export const Default: Story = {
  args: {
    income: 250000,
    expenses: 85000,
    balance: 165000,
  },
};

export const NetNegative: Story = {
  args: {
    income: 100000,
    expenses: 180000,
    balance: -80000,
  },
};

export const Zeroes: Story = {
  args: {
    income: 0,
    expenses: 0,
    balance: 0,
  },
};
