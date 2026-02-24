import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {};

export const WithNavigateCallback: Story = {
  argTypes: { onNavigate: { action: 'navigated' } },
};
