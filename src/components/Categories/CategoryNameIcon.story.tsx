import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { mockOutgoingCategory, mockIncomingCategory } from '@/mocks/budgetData';
import { CategoryNameIcon } from './CategoryNameIcon';

const meta: Meta<typeof CategoryNameIcon> = {
  title: 'Components/Categories/CategoryNameIcon',
  component: CategoryNameIcon,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoryNameIcon>;

export const Outgoing: Story = {
  args: { category: mockOutgoingCategory },
};

export const Incoming: Story = {
  args: { category: mockIncomingCategory },
};
