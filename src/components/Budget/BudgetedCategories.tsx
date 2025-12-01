import React, { useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { ActionIcon, Paper, Stack, Table, Title } from '@mantine/core';
import { deleteBudgetCategory, fetchBudgetCategories } from '@/api/budget';
import { BudgetCategoryResponse } from '@/types/budget';

interface BudgetedCategoriesFormProps {
  onBudgetCategoryDeleted?: () => void;
  refreshKey?: number;
}

export function BudgetedCategories({
  onBudgetCategoryDeleted,
  refreshKey,
}: BudgetedCategoriesFormProps) {
  const [budgetCategories, setBudgetCategories] = React.useState<BudgetCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchBudgetCategories()
      .then(setBudgetCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    await deleteBudgetCategory(id);
    onBudgetCategoryDeleted?.();
  };

  // <CategoryNameIcon category={budgetCategory.category} />

  const rows = budgetCategories.map((budgetCategory) => {
    const displayValue = budgetCategory.budgeted_value / 100;

    return (
      <Table.Tr key={budgetCategory.id}>
        <Table.Td align="center">{budgetCategory.category.name}</Table.Td>
        <Table.Td align="center">Outgoing</Table.Td>
        <Table.Td align="center">{displayValue}</Table.Td>
        <Table.Td align="center">
          <ActionIcon color="red" onClick={() => handleDelete(budgetCategory.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Paper shadow="md" radius="lg" p="xl" h="100%">
      <Stack>
        <Title order={2}>Budgeted Categories</Title>
        <Table>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
