import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { CreateAccountForm } from './CreateAccountForm';

const meta: Meta<typeof CreateAccountForm> = {
  title: 'Components/Accounts/CreateAccountForm',
  component: CreateAccountForm,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof CreateAccountForm>;

export const Default: Story = {
  args: {
    onAccountCreated: () => {},
  },
};
