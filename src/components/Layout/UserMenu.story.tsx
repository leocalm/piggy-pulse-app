import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { UserMenu } from './UserMenu';

const meta: Meta<typeof UserMenu> = {
  title: 'Components/Layout/UserMenu',
  component: UserMenu,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false, withAuthProvider: true })],
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

export const Sidebar: Story = {
  args: { variant: 'sidebar' },
};

export const Topbar: Story = {
  args: { variant: 'topbar' },
};

export const Default: Story = {};
