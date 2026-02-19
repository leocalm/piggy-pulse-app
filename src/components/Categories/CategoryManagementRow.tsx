/**
 * CategoryManagementRow - A single row in the categories management view
 * Shows category info, transaction count, status, and action buttons
 */
import { useTranslation } from 'react-i18next';
import { Badge, Button, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { CategoryManagementRow as CategoryManagementRowType } from '@/types/category';
import styles from './Categories.module.css';

export type CategoryManagementRowData = CategoryManagementRowType;

interface CategoryManagementRowProps {
  category: CategoryManagementRowData;
  isChild?: boolean;
  isArchived?: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onCreateSubcategory: () => void;
}

export function CategoryManagementRow({
  category,
  isChild = false,
  isArchived = false,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onCreateSubcategory,
}: CategoryManagementRowProps) {
  const { t } = useTranslation();

  const canDelete = category.globalTransactionCount === 0 && category.activeChildrenCount === 0;
  const canArchive = category.activeChildrenCount === 0;
  const canAddSubcategory = !isChild && !isArchived;

  const transactionCountText = t('categories.management.transactionCount', {
    count: category.globalTransactionCount,
  });

  return (
    <div className={`${styles.managementRow} ${isChild ? styles.childRow : ''}`}>
      <div className={styles.identity}>
        <div
          className={styles.categoryIcon}
          style={{ borderColor: category.color || 'var(--border-medium)' }}
        >
          {category.icon || '📁'}
        </div>
        <div className={styles.nameWrap}>
          <Text className={styles.categoryName}>{category.name}</Text>
          {category.description && (
            <Text className={styles.categoryDescription} title={category.description}>
              {category.description}
            </Text>
          )}
        </div>
      </div>

      <div className={styles.meta}>
        {/* Type chip - shown on parent rows in active sections, on all rows in Archived */}
        {(isArchived || !isChild) && (
          <Badge variant="light" size="sm" className={styles.typeChip}>
            {isArchived
              ? t('categories.management.typeLabel', { type: category.categoryType })
              : category.categoryType}
          </Badge>
        )}
        {/* Transaction count - muted */}
        <Text className={styles.txCount}>{transactionCountText}</Text>
        {/* Status */}
        <Text className={styles.status}>
          {isArchived
            ? t('categories.management.status.archived')
            : t('categories.management.status.active')}
        </Text>
      </div>

      <div className={styles.actions}>
        <Button
          variant="subtle"
          size="compact-sm"
          onClick={onEdit}
          className={styles.actionBtn}
        >
          {t('categories.management.actions.edit')}
        </Button>
        {isArchived ? (
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={onRestore}
            className={styles.actionBtn}
          >
            {t('categories.management.actions.restore')}
          </Button>
        ) : (
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={onArchive}
            disabled={!canArchive}
            className={styles.actionBtn}
          >
            {t('categories.management.actions.archive')}
          </Button>
        )}
        {canDelete && (
          <Button
            variant="subtle"
            size="compact-sm"
            color="red"
            onClick={onDelete}
            className={styles.actionBtn}
          >
            {t('categories.management.actions.delete')}
          </Button>
        )}
        {canAddSubcategory && (
          <Button
            variant="light"
            size="compact-sm"
            leftSection={<IconPlus size={14} />}
            onClick={onCreateSubcategory}
            className={styles.subcategoryBtn}
          >
            {t('categories.management.actions.subcategory')}
          </Button>
        )}
      </div>
    </div>
  );
}
