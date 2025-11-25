import React from 'react';
import { Grid } from '@mantine/core';
import { BalanceLineChartCard } from '@/components/Dashboard/BalanceLineChartCard';
import { CategoriesChartCard } from '@/components/Dashboard/CategoriesChartCard';
import { MonthlyBurnRate } from '@/components/Dashboard/MonthlyBurnRate';
import { MonthProgress } from '@/components/Dashboard/MonthProgress';
import { RecentTransactionsCard } from '@/components/Dashboard/RecentTransactionsCard';
import { RemainingBudgetCard } from '@/components/Dashboard/RemainingBudgetCard';

interface DashboardProps {
  refreshKey?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ refreshKey }) => {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
        <RemainingBudgetCard />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
        <MonthProgress />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <MonthlyBurnRate spent={200} budget={1000} today={new Date()} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
        <BalanceLineChartCard />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
        <CategoriesChartCard />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
        <RecentTransactionsCard />
      </Grid.Col>
    </Grid>
  );
};
