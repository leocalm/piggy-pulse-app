import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { SuggestionChips } from './SuggestionChips';

const meta: Meta<typeof SuggestionChips> = {
  title: 'Components/Transactions/SuggestionChips',
  component: SuggestionChips,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof SuggestionChips>;

export const Default: Story = {
  args: {
    suggestions: [
      { vendor: 'Supermarket', amount: 4500, categoryId: 'cat-out-1' },
      { vendor: 'Coffee Shop', amount: 350, categoryId: 'cat-out-3' },
      { vendor: 'Gas Station', amount: 6000, categoryId: 'cat-out-2' },
    ],
    onSelect: () => {},
  },
};

export const Empty: Story = {
  args: {
    suggestions: [],
    onSelect: () => {},
  },
};

export const SingleSuggestion: Story = {
  args: {
    suggestions: [{ vendor: 'Supermarket', amount: 4500, categoryId: 'cat-out-1' }],
    onSelect: () => {},
  },
};
