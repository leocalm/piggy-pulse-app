import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Stack, UnstyledButton } from '@mantine/core';
import { EmptyState, LoadingState } from '@/components/Utils';
import { useCreateBudgetCategory } from '@/hooks/useCategories';
import { CategoryResponse } from '@/types/category';

interface UnbudgetedCategoriesProps {
  onCategoryAdded?: (id: string, initialValue: number) => void;
  categories: CategoryResponse[];
  isLoading: boolean;
}

export function UnbudgetedCategories({
  onCategoryAdded,
  categories,
  isLoading,
}: UnbudgetedCategoriesProps) {
  const { t } = useTranslation();
  const createMutation = useCreateBudgetCategory();

  const handleAdd = (categoryId: string) => {
    createMutation.mutate(
      { categoryId, budgetedValue: 0 },
      {
        onSuccess: (newBudgetCategory) => {
          onCategoryAdded?.(newBudgetCategory.id, 0);
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingState variant="inline" text={t('budget.unbudgetedCategories.loading')} />;
  }

  if (!categories || categories.length === 0) {
    return (
      <EmptyState
        variant="compact"
        icon="✅"
        title={t('budget.unbudgetedCategories.allBudgeted')}
        message="All categories have been assigned a budget."
      />
    );
  }

  return (
    <Stack gap="sm">
      {categories.map((category) => (
        <UnstyledButton
          key={category.id}
          onClick={() => handleAdd(category.id)}
          disabled={createMutation.isPending}
          style={{ width: '100%' }}
        >
          <Badge
            variant="light"
            color="blue"
            size="md"
            radius="md"
            leftSection={<span>➕</span>}
            style={{
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'flex-start',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (e.currentTarget) {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (e.currentTarget) {
                e.currentTarget.style.background = '';
                e.currentTarget.style.transform = '';
              }
            }}
            styles={{
              root: {
                textTransform: 'none',
                paddingLeft: 10,
                paddingRight: 12,
                fontSize: 13,
                fontWeight: 500,
              },
            }}
          >
            {category.icon} {category.name}
          </Badge>
        </UnstyledButton>
      ))}
    </Stack>
  );
}
