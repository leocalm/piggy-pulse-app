import { SimpleGrid, Skeleton, Text } from '@mantine/core';
import { AccountDetail, CurrencyResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';

interface Props {
  detail: AccountDetail | undefined;
  currency: CurrencyResponse | undefined;
  isLoading: boolean;
}

export function PeriodFlow({ detail, currency, isLoading }: Props) {
  if (isLoading) {
    return <Skeleton height={80} mb="xl" />;
  }

  const fmt = (cents: number) => (currency ? formatCurrency(cents, currency) : '—');

  const rows = [
    { label: 'Inflows', value: detail?.inflows ?? 0 },
    { label: 'Outflows', value: detail?.outflows ?? 0 },
    { label: 'Net', value: detail?.net ?? 0, bold: true },
  ];

  return (
    <div style={{ marginBottom: 36 }}>
      <Text size="xs" tt="uppercase" c="dimmed" mb="xs">
        Period Flow
      </Text>
      {rows.map(({ label, value, bold }) => (
        <SimpleGrid key={label} cols={2} style={{ marginBottom: 4 }}>
          <Text fw={bold ? 700 : undefined}>{label}</Text>
          <Text ta="right" fw={bold ? 700 : undefined}>
            {fmt(value)}
          </Text>
        </SimpleGrid>
      ))}
    </div>
  );
}
