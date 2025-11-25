import React from 'react';
import {
  IconBuildingBank,
  IconCar,
  IconCash,
  IconChartPie,
  IconCoins,
  IconCreditCard,
  IconHome,
  IconPigMoney,
  IconShoppingCart,
  IconWallet,
} from '@tabler/icons-react';

export const iconMap: Record<string, React.ComponentType<any>> = {
  wallet: IconWallet,
  creditCard: IconCreditCard,
  pigMoney: IconPigMoney,
  bank: IconBuildingBank,
  cash: IconCash,
  coins: IconCoins,
  chartPie: IconChartPie,
  home: IconHome,
  car: IconCar,
  cart: IconShoppingCart,
};

export const getIcon = (iconName: string, size = 20) => {
  const IconComponent = iconMap[iconName] || IconWallet; // Default fallback
  return React.createElement(IconComponent, { size });
};