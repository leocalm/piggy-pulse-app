import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '@mantine/core';
import { createStoryDecorator } from '@/stories/storyUtils';
import { AuthCard } from './AuthCard';

const meta: Meta<typeof AuthCard> = {
  title: 'Components/Auth/AuthCard',
  component: AuthCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof AuthCard>;

export const Default: Story = {
  args: {
    children: <Text>Card content goes here</Text>,
  },
};

export const WithTagline: Story = {
  args: {
    tagline: 'Track your spending, grow your savings',
    children: <Text>Card content goes here</Text>,
  },
};
