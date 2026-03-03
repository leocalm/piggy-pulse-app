import { useState } from 'react';
import {
  Button,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { updatePeriodModel } from '@/api/settings';
import type { PeriodModelRequest, WeekendAdjustment } from '@/types/settings';

const DEFAULT_SCHEDULE = {
  startDay: 1,
  durationValue: 1,
  durationUnit: 'Month',
  generateAhead: 3,
  saturdayAdjustment: 'keep' as WeekendAdjustment,
  sundayAdjustment: 'keep' as WeekendAdjustment,
  namePattern: '{MONTH} {YEAR}',
};

interface Props {
  onComplete: () => void;
}

export function PeriodModelStep({ onComplete }: Props) {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);

  function set<K extends keyof typeof DEFAULT_SCHEDULE>(
    key: K,
    value: (typeof DEFAULT_SCHEDULE)[K]
  ) {
    setSchedule((prev) => ({ ...prev, [key]: value }));
  }

  async function handleContinue() {
    setIsLoading(true);
    try {
      const payload: PeriodModelRequest = {
        periodMode: 'automatic',
        periodSchedule: schedule,
      };
      await updatePeriodModel(payload);
      onComplete();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Stack mt="lg" gap="md">
      <Text size="sm" c="dimmed">
        Periods are how PiggyPulse slices your timeline for tracking. The default — monthly,
        starting on the 1st — works for most people.
      </Text>

      <Switch
        label="Customize"
        checked={isCustom}
        onChange={(e) => setIsCustom(e.currentTarget.checked)}
      />

      {isCustom && (
        <Stack gap="lg">
          {/* Start day */}
          <Stack gap={6}>
            <Text size="sm" fw={500}>
              Start day
            </Text>
            <Text size="xs" c="dimmed">
              The day of the month your period begins. Values above 28 are avoided to ensure the day
              exists in every month.
            </Text>
            <SimpleGrid cols={7} spacing={6} mt={4}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <UnstyledButton
                  key={day}
                  onClick={() => set('startDay', day)}
                  style={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 36,
                    borderRadius: theme.radius.sm,
                    fontSize: theme.fontSizes.sm,
                    fontWeight: schedule.startDay === day ? 600 : 400,
                    background:
                      schedule.startDay === day
                        ? theme.colors.cyan[6]
                        : isDark
                          ? theme.colors.dark[5]
                          : theme.colors.gray[1],
                    color:
                      schedule.startDay === day
                        ? theme.white
                        : isDark
                          ? theme.colors.dark[0]
                          : theme.colors.dark[7],
                    cursor: 'pointer',
                  })}
                >
                  {day}
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </Stack>

          {/* Duration + Generate ahead */}
          <SimpleGrid cols={2} spacing="sm">
            <NumberInput
              label="Period length"
              description="How many months each period spans. Most people use 1."
              min={1}
              max={12}
              value={schedule.durationValue}
              onChange={(v) => set('durationValue', Number(v))}
            />
            <NumberInput
              label="Periods to prepare"
              description="How many future periods to create in advance. 3 is a safe default."
              min={1}
              max={24}
              value={schedule.generateAhead}
              onChange={(v) => set('generateAhead', Number(v))}
            />
          </SimpleGrid>

          {/* Weekend adjustments */}
          <Stack gap={6}>
            <Text size="sm" fw={500}>
              Weekend shift
            </Text>
            <Text size="xs" c="dimmed">
              If the period start date falls on a weekend, PiggyPulse can shift it to the nearest
              weekday. This only affects when a period is recorded as starting — it does not change
              how long the period lasts.
            </Text>
            <SimpleGrid cols={2} spacing="sm" mt={4}>
              <Select
                label="If it lands on Saturday"
                data={[
                  { value: 'keep', label: 'Keep Saturday' },
                  { value: 'friday', label: 'Shift to Friday' },
                  { value: 'monday', label: 'Shift to Monday' },
                ]}
                value={schedule.saturdayAdjustment}
                onChange={(v) => set('saturdayAdjustment', (v ?? 'keep') as WeekendAdjustment)}
              />
              <Select
                label="If it lands on Sunday"
                data={[
                  { value: 'keep', label: 'Keep Sunday' },
                  { value: 'friday', label: 'Shift to Friday' },
                  { value: 'monday', label: 'Shift to Monday' },
                ]}
                value={schedule.sundayAdjustment}
                onChange={(v) => set('sundayAdjustment', (v ?? 'keep') as WeekendAdjustment)}
              />
            </SimpleGrid>
          </Stack>
        </Stack>
      )}

      <Group justify="flex-end" mt="md">
        <Button onClick={handleContinue} loading={isLoading}>
          Continue
        </Button>
      </Group>
    </Stack>
  );
}
