import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { AccountsSummary } from './AccountsSummary';

const meta: Meta<typeof AccountsSummary> = {
  title: 'Components/Accounts/AccountsSummary',
  component: AccountsSummary,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof AccountsSummary>;

export const Default: Story = {
  args: {
    totalAssets: 645000,
    totalLiabilities: -75000,
    netWorth: 570000,
    accountCount: 5,
  },
};

export const NetNegative: Story = {
  args: {
    totalAssets: 50000,
    totalLiabilities: -120000,
    netWorth: -70000,
    accountCount: 2,
  },
};

export const NoAccounts: Story = {
  args: {
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    accountCount: 0,
  },
};
