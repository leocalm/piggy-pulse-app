import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { BottomNavigation } from './BottomNavigation';

const meta: Meta<typeof BottomNavigation> = {
  title: 'Components/Layout/BottomNavigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false, padding: false })],
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

/** Default — no active route (root path) */
export const Default: Story = {};

/** Active route: Dashboard */
export const ActiveDashboard: Story = {
  parameters: { initialEntries: ['/dashboard'] },
};

/** Active route: Transactions */
export const ActiveTransactions: Story = {
  parameters: { initialEntries: ['/transactions'] },
};

/** Active route: Periods */
export const ActivePeriods: Story = {
  parameters: { initialEntries: ['/periods'] },
};

/** Active route: Accounts (inside the More popover) */
export const ActiveAccounts: Story = {
  parameters: { initialEntries: ['/accounts'] },
};
