import { useState } from 'react';
import { Grid, Stack } from '@mantine/core';
import { BudgetConfiguration } from '@/components/Budget/BudgetConfiguration';
import { BudgetDetails } from '@/components/Budget/BudgetDetails';
import { BudgetedCategories } from '@/components/Budget/BudgetedCategories';
import { UnbudgetedCategories } from '@/components/Budget/UnbudgetedCategories';

export function Budget() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBudgetCategoryCreated = () => {
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  const handleBudgetCategoryDeleted = () => {
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };
  return (
    <Stack>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <BudgetConfiguration />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <BudgetDetails />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <UnbudgetedCategories
            onBudgetCategoryCreated={handleBudgetCategoryCreated}
            key={refreshKey}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <BudgetedCategories
            onBudgetCategoryDeleted={handleBudgetCategoryDeleted}
            key={refreshKey}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
