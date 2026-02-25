import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { AuthLayout } from './AuthLayout';

const meta: Meta<typeof AuthLayout> = {
  title: 'Components/Auth/AuthLayout',
  component: AuthLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ withBudgetProvider: false, padding: false })],
};

export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Default: Story = {};
