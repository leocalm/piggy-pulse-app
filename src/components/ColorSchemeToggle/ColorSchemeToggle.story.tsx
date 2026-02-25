import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { ColorSchemeToggle } from './ColorSchemeToggle';

const meta: Meta<typeof ColorSchemeToggle> = {
  title: 'Components/ColorSchemeToggle',
  component: ColorSchemeToggle,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof ColorSchemeToggle>;

export const Default: Story = {};
