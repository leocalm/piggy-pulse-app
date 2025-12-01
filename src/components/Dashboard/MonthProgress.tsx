import React from 'react';
import {
  Group,
  NumberFormatter,
  Paper,
  Progress,
  Text,
  useMantineColorScheme,
} from '@mantine/core';

interface MonthProgressProps {
  refreshKey?: number;
}

export const MonthProgress: React.FC<MonthProgressProps> = ({ refreshKey }) => {
  const { colorScheme } = useMantineColorScheme();
  const date = new Date();
  const remainingDays = 10;
  const daysInCycle = 30;
  const progress = (100 * (daysInCycle - remainingDays)) / daysInCycle;

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
            Month Progress
          </Text>
          <Text size="lg" fw={600}>
            {date.toLocaleDateString()}
          </Text>
          <Text size="sm" c="dimmed">
            {remainingDays} days remaining
          </Text>
        </div>
        <div style={{ width: 140 }}>
          <Progress value={progress} radius="xl" size="xl" striped color="blue" />
          <Text mt={8} size="sm" c="blue">
            <NumberFormatter value={remainingDays} />
          </Text>
        </div>
      </Group>
    </Paper>
  );
};
