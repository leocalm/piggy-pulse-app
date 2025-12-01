import { Paper, Stack, Title, Text } from '@mantine/core';


export function BudgetDetails() {
  return (
    <Paper shadow="md" radius="lg" p="xl" h="100%">
      <Stack align='flex-start'>
        <Title order={2}>Budget Details</Title>
        <Text>Total Incoming: 1000</Text>
        <Text>Total Outgoing: 1000</Text>
        <Text>Difference: 0</Text>
      </Stack>
    </Paper>
  );
}