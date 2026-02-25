import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { mockCheckingAccount, mockSavingsAccount, mockCreditCardAccount, mockAllowanceAccount } from '@/mocks/budgetData';
import { AccountBadge } from './AccountBadge';

const meta: Meta<typeof AccountBadge> = {
  title: 'Components/Transactions/AccountBadge',
  component: AccountBadge,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof AccountBadge>;

export const Checking: Story = {
  args: { account: mockCheckingAccount },
};

export const Savings: Story = {
  args: { account: mockSavingsAccount },
};

export const CreditCard: Story = {
  args: { account: mockCreditCardAccount },
};

export const Allowance: Story = {
  args: { account: mockAllowanceAccount },
};
