import { Group, Paper, Progress, Text, useMantineColorScheme } from '@mantine/core';

type MonthlyBurnRateProps = {
  budget: number; // total monthly budget
  spent: number; // amount spent so far
  today: Date; // current date
};

export function MonthlyBurnRate({ budget, spent, today }: MonthlyBurnRateProps) {
  const { colorScheme } = useMantineColorScheme();

  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const dailyBurn = spent / currentDay; // actual burn per day
  const idealDailyBurn = budget / daysInMonth; // ideal to not overspend
  const projectedTotal = dailyBurn * daysInMonth; // projected total spending

  const burnRatePct = Math.min((dailyBurn / idealDailyBurn) * 100, 200);
  // 100% = on track, >100% = overspending pace

  const remainingDays = 5;
  const remainingDaysPct = 100 - (100 * remainingDays) / 30;

  return (
    <Paper
      radius="lg"
      p="lg"
      style={{
        background:
          colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
      }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={600} size="lg">
            Monthly burn rate
          </Text>

          <Text fw={700} size="xl">
            €{dailyBurn.toFixed(2)}{' '}
            <Text span size="sm" c="dimmed">
              / day
            </Text>
          </Text>

          <Text size="sm" c="dimmed" mt="xs">
            Ideal: €{idealDailyBurn.toFixed(2)} / day
          </Text>

          <Text size="sm" mt="xs">
            Projected end-of-month:{' '}
            <Text span fw={600}>
              €{projectedTotal.toFixed(2)}
            </Text>
          </Text>
        </div>

        <div style={{ width: 140 }}>
          <Progress
            value={burnRatePct}
            radius="xl"
            size="xl"
            striped
            color={burnRatePct > 100 ? 'red.6' : 'green.6'}
          />
          <Text mt={8} size="sm" c={burnRatePct > 100 ? 'red.6' : 'green.6'}>
            {Math.round(burnRatePct)}%
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
