import type { Meta, StoryObj } from '@storybook/react';
import { CurrencyValue } from './CurrencyValue';

const meta: Meta<typeof CurrencyValue> = {
  title: 'Components/Utils/CurrencyValue',
  component: CurrencyValue,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CurrencyValue>;

const euroCurrency = {
  id: '1',
  name: 'Euro',
  symbol: '€',
  currency: 'EUR',
  decimalPlaces: 2,
};

const dollarCurrency = {
  id: '2',
  name: 'US Dollar',
  symbol: '$',
  currency: 'USD',
  decimalPlaces: 2,
};

const poundCurrency = {
  id: '3',
  name: 'British Pound',
  symbol: '£',
  currency: 'GBP',
  decimalPlaces: 2,
};

export const Euro: Story = {
  args: {
    currency: euroCurrency,
    value: 1500.0,
  },
};

export const Dollar: Story = {
  args: {
    currency: dollarCurrency,
    value: 2500.5,
  },
};

export const Pound: Story = {
  args: {
    currency: poundCurrency,
    value: 999.99,
  },
};

export const NoCurrency: Story = {
  args: {
    currency: undefined,
    value: 1234.56,
  },
};

export const ZeroValue: Story = {
  args: {
    currency: euroCurrency,
    value: 0,
  },
};

export const NegativeValue: Story = {
  args: {
    currency: dollarCurrency,
    value: -500.25,
  },
};
