import React from 'react';
import {
  Group,
  NumberFormatter,
  Paper,
  RingProgress,
  Text,
  useMantineColorScheme,
} from '@mantine/core';

interface RemainingBudgetCardProps {
  refreshKey?: number;
}

export const RemainingBudgetCard: React.FC<RemainingBudgetCardProps> = ({ refreshKey }) => {
  const amountBudgeted: number = 100000 / 100;
  const leftToSpend: number = 80000 / 100;
  const currencySymbol: string = '€';
  const spent = amountBudgeted - leftToSpend;
  const used = (100 * spent) / amountBudgeted;
  const { colorScheme } = useMantineColorScheme();
  const color = used < 50 ? 'green' : used < 75 ? 'blue' : 'red';

  const data = [
    {
      value: used,
      color,
    },
  ];

  return (
    <Paper
      shadow="md"
      radius="lg"
      p="lg"
      h="100%"
      style={{
        background:
          colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
      }}
    >
      <Group justify="space-between" align="center">
        <div>
          <Text size="lg" fw={600}>
            Remaining budget
          </Text>
          <Text size="xl" fw={700}>
            <NumberFormatter
              value={leftToSpend}
              decimalScale={2}
              decimalSeparator=","
              thousandSeparator="."
              fixedDecimalScale
              prefix={currencySymbol}
            />
          </Text>

          <Text size="sm" c="dimmed">
            You’ve spent{' '}
            <NumberFormatter
              value={spent}
              decimalScale={2}
              decimalSeparator=","
              thousandSeparator="."
              fixedDecimalScale
              prefix={currencySymbol}
            />{' '}
            of{' '}
            <NumberFormatter
              value={amountBudgeted}
              decimalScale={2}
              decimalSeparator=","
              thousandSeparator="."
              fixedDecimalScale
              prefix={currencySymbol}
            />
          </Text>
        </div>

        <RingProgress
          sections={data}
          thickness={16}
          roundCaps
          label={
            <Text c={color} fw={700} ta="center" size="xl">
              {used}%
            </Text>
          }
        />
      </Group>
    </Paper>
  );
};
