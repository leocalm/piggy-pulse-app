import { Paper, Text, useMantineColorScheme } from '@mantine/core';
import { TransactionsTable } from '@/components/Transactions/TransactionsTable';

export function RecentTransactionsCard() {
  const { colorScheme } = useMantineColorScheme();

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
        Recent Transactions
      </Text>
      <TransactionsTable />
    </Paper>
  );
}
