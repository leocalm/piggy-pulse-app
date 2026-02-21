import { useState } from 'react';
import { AreaChart } from '@mantine/charts';
import { Paper, SegmentedControl, Skeleton, Text } from '@mantine/core';
import { useAccountBalanceHistory } from '@/hooks/useAccountBalanceHistory';
import { CurrencyResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';

type Range = 'period' | '30d' | '90d' | '1y';

interface Props {
  accountId: string;
  periodId: string | null;
  currency: CurrencyResponse | undefined;
}

export function BalanceHistoryChart({ accountId, periodId, currency }: Props) {
  const [range, setRange] = useState<Range>('period');
  const { data, isLoading } = useAccountBalanceHistory(accountId, range, periodId);

  const chartData = (data ?? []).map((p) => ({
    date: p.date,
    Balance: p.balance,
  }));

  return (
    <Paper withBorder p="md" mb="xl">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text fw={500}>Balance History</Text>
        <SegmentedControl
          size="xs"
          value={range}
          onChange={(v) => setRange(v as Range)}
          data={[
            { label: 'Period', value: 'period' },
            { label: '30d', value: '30d' },
            { label: '90d', value: '90d' },
            { label: '1y', value: '1y' },
          ]}
        />
      </div>
      {isLoading ? (
        <Skeleton height={260} />
      ) : (
        <AreaChart
          h={260}
          data={chartData}
          dataKey="date"
          series={[{ name: 'Balance', color: 'indigo.6' }]}
          curveType="linear"
          referenceLines={[{ y: 0, color: 'gray.4', label: '' }]}
          valueFormatter={(v) => (currency ? formatCurrency(v, currency) : String(v))}
        />
      )}
    </Paper>
  );
}
