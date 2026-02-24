import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Layout/Logo',
  component: Logo,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {};
