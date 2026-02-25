import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { ActionButtons } from './ActionButtons';

const meta: Meta<typeof ActionButtons> = {
  title: 'Components/Transactions/ActionButtons',
  component: ActionButtons,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof ActionButtons>;

export const Default: Story = {
  args: {
    onEdit: () => {},
    onDelete: () => {},
  },
};
