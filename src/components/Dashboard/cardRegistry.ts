import type { ComponentType } from 'react';
import type { CardSize } from '@/types/dashboardLayout';
import { BudgetStabilityCardAdapter } from './adapters/BudgetStabilityCardAdapter';
import { CurrentPeriodCardAdapter } from './adapters/CurrentPeriodCardAdapter';
import { NetPositionCardAdapter } from './adapters/NetPositionCardAdapter';

export interface CardProps {
  selectedPeriodId: string | null;
  entityId?: string;
  size: CardSize;
}

export interface CardDefinition {
  cardType: string;
  component: ComponentType<CardProps>;
  defaultSize: CardSize;
  labelKey: string;
  requiresEntity: boolean;
  entityType?: 'account' | 'category' | 'vendor';
  requiresPeriod: boolean;
}

export const CARD_REGISTRY: Record<string, CardDefinition> = {
  current_period: {
    cardType: 'current_period',
    component: CurrentPeriodCardAdapter,
    defaultSize: 'full',
    labelKey: 'dashboard.cards.currentPeriod',
    requiresEntity: false,
    requiresPeriod: true,
  },
  budget_stability: {
    cardType: 'budget_stability',
    component: BudgetStabilityCardAdapter,
    defaultSize: 'half',
    labelKey: 'dashboard.cards.budgetStability',
    requiresEntity: false,
    requiresPeriod: false,
  },
  net_position: {
    cardType: 'net_position',
    component: NetPositionCardAdapter,
    defaultSize: 'half',
    labelKey: 'dashboard.cards.netPosition',
    requiresEntity: false,
    requiresPeriod: true,
  },
};
