import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IconPicker } from './IconPicker';

const meta: Meta<typeof IconPicker> = {
  title: 'Components/Utils/IconPicker',
  component: IconPicker,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IconPicker>;

const InteractiveWrapper = (args: { value: string; label?: string }) => {
  const [value, setValue] = useState(args.value);

  return <IconPicker value={value} onChange={setValue} label={args.label} />;
};

export const Default: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    value: 'IconHome',
  },
};

export const WithLabel: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    value: 'IconShoppingCart',
    label: 'Choose an icon',
  },
};

export const FoodIcon: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    value: 'IconToolsKitchen2',
  },
};

export const MoneyIcon: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    value: 'IconCurrencyDollar',
  },
};
