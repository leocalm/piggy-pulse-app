import { ReferenceLine } from 'recharts';
import { LineChart } from '@mantine/charts';
import { Paper, Text, useMantineColorScheme } from '@mantine/core';

export function BalanceLineChartCard() {
  const { colorScheme } = useMantineColorScheme();

  const data = [
    { date: '2025-01-01', ING: 1200, Amex: 1000 },
    { date: '2025-01-05', ING: 1400, Amex: 500 },
    { date: '2025-01-10', ING: 1350, Amex: 100 },
    { date: '2025-01-15', ING: 1600, Amex: 300 },
    { date: '2025-01-20', ING: 1550, Amex: 1000 },
    { date: '2025-01-25', ING: 1800, Amex: 2000 },
    { date: '2025-01-30', ING: 1950, Amex: 2100 },
  ];

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="lg"
      style={{
        background:
          colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
      }}
      h={380}
    >
      <Text fw={600} size="lg" mb="md">
        Balance Over Time
      </Text>

      <LineChart
        h={300}
        data={data}
        dataKey="date"
        withLegend
        series={[
          { name: 'ING', color: 'orange' },
          { name: 'Amex', color: 'blue' },
        ]}
        gridAxis="x"
        curveType="monotone"
      >
        <ReferenceLine y={0} stroke="transparent" ifOverflow="extendDomain" />
      </LineChart>
    </Paper>
  );
}
