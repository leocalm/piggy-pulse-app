import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@mantine/core';
import { createStoryDecorator } from '@/stories/storyUtils';
import { PageHeader } from './PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/Transactions/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Transactions',
    subtitle: 'January 2026',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Transactions',
    subtitle: 'January 2026',
    actions: <Button size="sm">Add Transaction</Button>,
  },
};

export const NoSubtitle: Story = {
  args: {
    title: 'All Transactions',
  },
};
