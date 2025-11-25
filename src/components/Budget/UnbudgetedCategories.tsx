import React, { useEffect, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { ActionIcon, Group, NumberInput, Paper, Stack, Table, Title } from '@mantine/core';
import { createBudgetCategory } from '@/api/budget';
import { fetchCategories } from '@/api/category';
import { CategoryNameIcon } from '@/components/Categories/CategoryNameIcon';
import { CategoryResponse } from '@/types/category';

interface UnbudgetedCategoriesProps {
  onBudgetCategoryCreated?: () => void;
  refreshKey?: number;
}

export function UnbudgetedCategories({
  onBudgetCategoryCreated,
  refreshKey,
}: UnbudgetedCategoriesProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCategories()
      .then(setCategories)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [refreshKey]);
  const [values, setValues] = useState<Record<string, number | undefined>>({});

  const handleValueChange = (categoryId: string, floatValue: number | undefined) => {
    if (typeof floatValue !== 'number' || Number.isNaN(floatValue)) {
      setValues((prev) => ({ ...prev, [categoryId]: undefined }));
      return;
    }
    const cents = Math.round(floatValue * 100);
    setValues((prev) => ({ ...prev, [categoryId]: cents }));
  };

  const handleSubmit = async (categoryId: string) => {
    const cents = values[categoryId];
    if (cents == null) {
      return;
    }
    await createBudgetCategory({
      category_id: categoryId,
      budgeted_value: cents,
    });

    onBudgetCategoryCreated?.();
  };

  const rows = categories.map((category: CategoryResponse) => {
    const cents = values[category.id];
    const displayValue = typeof cents === 'number' ? cents / 100 : undefined;

    return (
      <Table.Tr key={category.id}>
        <Table.Td align="center">
          <CategoryNameIcon category={category} />
        </Table.Td>
        <Table.Td align="center">{category.category_type}</Table.Td>
        <Table.Td align="center">
          <Group justify="center">
            <NumberInput
              placeholder="Amount"
              value={displayValue}
              onValueChange={({ floatValue }) => handleValueChange(category.id, floatValue)}
              thousandSeparator
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
            />
            <ActionIcon
              color="green"
              onClick={() => handleSubmit(category.id)}
              aria-label="Submit budget category"
              disabled={values[category.id] == null}
            >
              <IconCheck size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Paper shadow="md" radius="lg" p="xl" h="100%">
      <Stack>
        <Title order={2}>Unbudgeted Categories</Title>
        <Table>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
