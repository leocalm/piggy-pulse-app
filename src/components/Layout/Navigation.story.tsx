import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { Navigation } from './Navigation';

const meta: Meta<typeof Navigation> = {
  title: 'Components/Layout/Navigation',
  component: Navigation,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof Navigation>;

export const Default: Story = {};

export const WithNavigateCallback: Story = {
  argTypes: { onNavigate: { action: 'navigated' } },
};
