import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { UnbudgetedDiagnosticList } from './UnbudgetedDiagnosticList';

const meta: Meta<typeof UnbudgetedDiagnosticList> = {
  title: 'Components/Categories/UnbudgetedDiagnosticList',
  component: UnbudgetedDiagnosticList,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof UnbudgetedDiagnosticList>;

export const Default: Story = {
  args: {
    rows: [
      { id: 'cat-1', name: 'Entertainment', icon: 'device-tv', color: '#f783ac', spentValue: 9800, sharePercentage: 12 },
      { id: 'cat-2', name: 'Subscriptions', icon: 'credit-card', color: '#74c0fc', spentValue: 4500, sharePercentage: 5.5 },
    ],
  },
};

export const Single: Story = {
  args: {
    rows: [
      { id: 'cat-1', name: 'Misc', icon: 'dots', color: '#ced4da', spentValue: 2300, sharePercentage: 3 },
    ],
  },
};

export const Empty: Story = {
  args: { rows: [] },
};
