import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { BudgetPeriodSelector } from './BudgetPeriodSelector';

const meta: Meta<typeof BudgetPeriodSelector> = {
  title: 'Components/BudgetPeriodSelector/BudgetPeriodSelector',
  component: BudgetPeriodSelector,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof BudgetPeriodSelector>;

const periods = [
  { id: 'per-1', name: 'January 2026', startDate: '2026-01-01', endDate: '2026-01-31' },
  { id: 'per-2', name: 'February 2026', startDate: '2026-02-01', endDate: '2026-02-28' },
  { id: 'per-3', name: 'December 2025', startDate: '2025-12-01', endDate: '2025-12-31' },
];

export const Default: Story = {
  render: () => {
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>('per-2');
    return (
      <BudgetPeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={setSelectedPeriodId}
      />
    );
  },
};

export const NoPeriods: Story = {
  render: () => {
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    return (
      <BudgetPeriodSelector
        periods={[]}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={setSelectedPeriodId}
      />
    );
  },
};

export const NoSelection: Story = {
  render: () => {
    const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
    return (
      <BudgetPeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={setSelectedPeriodId}
      />
    );
  },
};
