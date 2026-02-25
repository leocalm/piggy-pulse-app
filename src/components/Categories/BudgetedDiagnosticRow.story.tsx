import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { BudgetedDiagnosticRow } from './BudgetedDiagnosticRow';

const meta: Meta<typeof BudgetedDiagnosticRow> = {
  title: 'Components/Categories/BudgetedDiagnosticRow',
  component: BudgetedDiagnosticRow,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof BudgetedDiagnosticRow>;

export const UnderBudget: Story = {
  args: {
    id: 'cat-out-1',
    name: 'Food',
    icon: 'cart',
    color: '#ff6b9d',
    budgetedValue: 50000,
    spentValue: 42000,
    varianceValue: -8000,
    progressPercentage: 84,
    stabilityHistory: [false, true, false],
  },
};

export const OverBudget: Story = {
  args: {
    id: 'cat-out-2',
    name: 'Transport',
    icon: 'car',
    color: '#4dabf7',
    budgetedValue: 20000,
    spentValue: 24000,
    varianceValue: 4000,
    progressPercentage: 120,
    stabilityHistory: [true, true, false],
  },
};

export const NearLimit: Story = {
  args: {
    id: 'cat-out-3',
    name: 'Utilities',
    icon: 'bolt',
    color: '#ffd43b',
    budgetedValue: 15000,
    spentValue: 14500,
    varianceValue: -500,
    progressPercentage: 97,
    stabilityHistory: [false, false, false],
  },
};
