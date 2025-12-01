import { Grid, Paper, Progress, Stack, Text, useMantineColorScheme } from '@mantine/core';

export function CategoriesChartCard() {
  const { colorScheme } = useMantineColorScheme();

  const data = [
    {
      category: 'Groceries',
      used: 70,
      color: 'yellow',
    },
    {
      category: 'Restaurants',
      used: 15,
      color: 'green',
    },
    {
      category: 'Dogs',
      used: 95,
      color: 'red',
    },
  ];

  const rows = data.map((item) => (
    <>
      <Grid>
        <Grid.Col span={{ base: 12, md: 12, lg: 2 }}>
          <Text>{item.category}</Text>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 12, lg: 10 }}>
          <Progress size="xl" value={item.used} color={item.color} />
        </Grid.Col>
      </Grid>
    </>
  ));

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
        Top Categories
      </Text>
      <Stack>{rows}</Stack>
    </Paper>
  );
}
