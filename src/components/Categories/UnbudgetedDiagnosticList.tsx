import { useTranslation } from 'react-i18next';
import { Group, Text } from '@mantine/core';
import { CurrencyValue } from '@/components/Utils/CurrencyValue';
import styles from './Categories.module.css';

export interface UnbudgetedDiagnosticItem {
  id: string;
  name: string;
  icon: string;
  color?: string;
  spentValue: number;
  sharePercentage: number;
}

interface UnbudgetedDiagnosticListProps {
  rows: UnbudgetedDiagnosticItem[];
}

export function UnbudgetedDiagnosticList({ rows }: UnbudgetedDiagnosticListProps) {
  const { t } = useTranslation();

  const sortedRows = [...rows].sort((left, right) => right.spentValue - left.spentValue);

  if (sortedRows.length === 0) {
    return (
      <Text className={styles.unbudgetedEmpty} data-testid="unbudgeted-empty-state">
        {t('categories.diagnostics.empty.unbudgeted')}
      </Text>
    );
  }

  return (
    <div className={styles.unbudgetedList}>
      {sortedRows.map((row) => (
        <article
          key={row.id}
          className={styles.unbudgetedRow}
          data-testid={`unbudgeted-row-${row.id}`}
        >
          <Group gap={4} wrap="nowrap" className={styles.unbudgetedInline}>
            <Text className={styles.unbudgetedName} component="span">
              {row.name}
            </Text>
            <Text className={styles.unbudgetedAmount} component="strong">
              <CurrencyValue cents={row.spentValue} />
            </Text>
            <Text className={styles.unbudgetedShare} component="span">
              {`(${row.sharePercentage.toFixed(1)}%)`}
            </Text>
          </Group>
        </article>
      ))}
    </div>
  );
}
