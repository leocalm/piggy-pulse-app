import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

const meta: Meta<typeof PasswordStrengthIndicator> = {
  title: 'Components/Auth/PasswordStrengthIndicator',
  component: PasswordStrengthIndicator,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof PasswordStrengthIndicator>;

export const Null: Story = {
  args: { result: null },
};

export const VeryWeak: Story = {
  args: {
    result: {
      score: 0,
      feedback: 'This password is too short.',
      suggestions: ['Add more characters', 'Use a mix of letters and numbers'],
      isStrong: false,
    },
  },
};

export const Weak: Story = {
  args: {
    result: {
      score: 1,
      feedback: 'This password is weak.',
      suggestions: ['Add uppercase letters', 'Include symbols'],
      isStrong: false,
    },
  },
};

export const Fair: Story = {
  args: {
    result: {
      score: 2,
      feedback: 'This password is fair.',
      suggestions: ['Consider adding a symbol'],
      isStrong: false,
    },
  },
};

export const Strong: Story = {
  args: {
    result: {
      score: 3,
      feedback: 'Good password.',
      suggestions: [],
      isStrong: true,
    },
  },
};

export const VeryStrong: Story = {
  args: {
    result: {
      score: 4,
      feedback: 'Excellent password.',
      suggestions: [],
      isStrong: true,
    },
  },
};
