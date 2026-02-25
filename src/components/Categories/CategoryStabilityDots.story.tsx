import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CategoryStabilityDots } from './CategoryStabilityDots';

const meta: Meta<typeof CategoryStabilityDots> = {
  title: 'Components/Categories/CategoryStabilityDots',
  component: CategoryStabilityDots,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CategoryStabilityDots>;

export const AllStable: Story = {
  args: { history: [false, false, false] },
};

export const AllUnstable: Story = {
  args: { history: [true, true, true] },
};

export const Mixed: Story = {
  args: { history: [false, true, false] },
};

export const Partial: Story = {
  args: { history: [false] },
};
