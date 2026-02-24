import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { IconPicker } from './IconPicker';

const meta: Meta<typeof IconPicker> = {
  title: 'Components/Utils/IconPicker',
  component: IconPicker,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
  argTypes: {
    onChange: { action: 'icon-changed' },
  },
};

export default meta;
type Story = StoryObj<typeof IconPicker>;

export const Default: Story = {
  args: { value: 'wallet' },
};

export const NoSelection: Story = {
  args: { value: '' },
};

export const WithLabel: Story = {
  args: { value: 'cart', label: 'Choose an icon' },
};
