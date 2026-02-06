import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mantine/core';
import { CategoryListSkeleton, EmptyState } from '@/components/Utils';
import { SpentPerCategory } from '@/types/dashboard';
import styles from './Dashboard.module.css';

interface TopCategoriesChartProps {
  data: SpentPerCategory[];
  isLoading?: boolean;
}

// Array of colors for category bars
const CATEGORY_COLORS = [
  { start: '#ff6b9d', end: '#ff8fb3' }, // danger/pink
  { start: '#ffa940', end: '#ffbd6b' }, // warning/orange
  { start: '#b47aff', end: '#d4a5ff' }, // purple
  { start: '#00ffa3', end: '#5eff74' }, // success/green
  { start: '#00d4ff', end: '#5ae1ff' }, // primary/cyan
];

export function TopCategoriesChart({ data, isLoading }: TopCategoriesChartProps) {
  const { t } = useTranslation();

  const maxSpent = useMemo(() => {
    // amountSpent comes in cents — convert to display value for calculations
    return Math.max(...data.map((item) => item.amountSpent / 100), 1);
  }, [data]);

  const formatCurrency = (valueInCents: number): string => {
    // valueInCents is in cents — reuse existing currency util
    // Importing here to keep top-level imports minimal
    const display = valueInCents / 100;
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(display);
  };

  if (isLoading) {
    return (
      <Stack gap="md">
        <CategoryListSkeleton count={5} />
      </Stack>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        variant="compact"
        icon="📊"
        title={t('states.empty.charts.noData')}
        message={t('states.empty.charts.message')}
      />
    );
  }

  return (
    <div className={styles.categoryBarContainer}>
      {data.map((category, index) => {
        const percentage = (category.amountSpent / maxSpent) * 100;
        const colors = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

        return (
          <div key={category.categoryName} className={styles.categoryItem}>
            <div className={styles.categoryName}>{category.categoryName}</div>
            <div className={styles.categoryBarWrapper}>
              <div
                className={styles.categoryBar}
                style={
                  {
                    width: `${percentage}%`,
                    '--bar-color': colors.start,
                    '--bar-color-end': colors.end,
                  } as React.CSSProperties
                }
              />
            </div>
            <div className={styles.categoryAmount}>{formatCurrency(category.amountSpent)}</div>
          </div>
        );
      })}
    </div>
  );
}
