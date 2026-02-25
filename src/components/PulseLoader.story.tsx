import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { PulseLoader } from './PulseLoader';

const meta: Meta<typeof PulseLoader> = {
  title: 'Components/PulseLoader',
  component: PulseLoader,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof PulseLoader>;

export const Loading: Story = {
  args: { state: 'loading' },
};

export const Success: Story = {
  args: { state: 'success' },
};

export const Error: Story = {
  args: { state: 'error' },
};

export const Large: Story = {
  args: { state: 'loading', size: 64 },
};

export const CustomColor: Story = {
  args: { state: 'loading', color: '#ff6b9d' },
};
