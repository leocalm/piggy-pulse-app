import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { BalanceOverTimeChart } from './BalanceOverTimeChart';

const meta: Meta<typeof BalanceOverTimeChart> = {
  title: 'Components/Dashboard/BalanceOverTimeChart',
  component: BalanceOverTimeChart,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof BalanceOverTimeChart>;

const mockData = [
  { date: '2025-08-01', balance: 95000 },
  { date: '2025-09-01', balance: 108000 },
  { date: '2025-10-01', balance: 121000 },
  { date: '2025-11-01', balance: 115000 },
  { date: '2025-12-01', balance: 138000 },
  { date: '2026-01-01', balance: 140000 },
  { date: '2026-01-10', balance: 145000 },
];

export const Default: Story = {
  args: { data: mockData },
};

export const Declining: Story = {
  args: {
    data: [
      { date: '2025-08-01', balance: 200000 },
      { date: '2025-09-01', balance: 185000 },
      { date: '2025-10-01', balance: 162000 },
      { date: '2025-11-01', balance: 148000 },
      { date: '2025-12-01', balance: 130000 },
      { date: '2026-01-01', balance: 110000 },
    ],
  },
};

export const SinglePoint: Story = {
  args: {
    data: [{ date: '2026-01-15', balance: 145000 }],
  },
};

export const Empty: Story = {
  args: { data: [] },
};
