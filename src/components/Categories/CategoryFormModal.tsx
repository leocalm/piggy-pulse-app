/**
 * CategoryFormModal - Modal/Drawer for creating and editing categories
 */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { FormOverlay } from '@/components/Overlays/FormOverlay';
import { CategoryManagementRow, CategoryRequest, CategoryType } from '@/types/category';

interface CategoryFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryRequest) => Promise<void>;
  category?: CategoryManagementRow | null;
  mode: 'create' | 'edit' | 'subcategory';
  parentCategory?: CategoryManagementRow | null;
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  categoryType: CategoryType;
  description: string | null;
}

const DEFAULT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

export function CategoryFormModal({
  opened,
  onClose,
  onSubmit,
  category,
  mode,
  parentCategory,
}: CategoryFormModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('Outgoing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      if (mode === 'edit' && category) {
        setName(category.name);
        setColor(category.color || DEFAULT_COLORS[0]);
        setIcon(category.icon || '');
        setDescription(category.description || '');
        setCategoryType(category.categoryType);
      } else if (mode === 'subcategory' && parentCategory) {
        setName('');
        setColor(DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
        setIcon('');
        setDescription('');
        setCategoryType(parentCategory.categoryType);
      } else {
        // Create mode
        setName('');
        setColor(DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
        setIcon('');
        setDescription('');
        setCategoryType('Outgoing');
      }
      setError(null);
    }
  }, [opened, mode, category, parentCategory]);

  const isDirty = useMemo(() => {
    if (mode === 'edit' && category) {
      return (
        name !== category.name ||
        color !== category.color ||
        icon !== (category.icon || '') ||
        description !== (category.description || '')
      );
    }
    return name.trim() !== '' || icon !== '' || description !== '';
  }, [mode, category, name, color, icon, description]);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      setError(t('categories.form.errors.nameMinLength'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        color,
        icon: icon.trim() || '📁',
        parentId: mode === 'subcategory' && parentCategory ? parentCategory.id : null,
        categoryType,
        description: description.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('categories.form.errors.submit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'edit':
        return t('categories.form.editTitle');
      case 'subcategory':
        return t('categories.form.subcategoryTitle');
      default:
        return t('categories.form.createTitle');
    }
  };

  return (
    <FormOverlay
      opened={opened}
      onClose={onClose}
      title={getTitle()}
      isDirty={isDirty}
      closeBlocked={isSubmitting}
    >
      <Stack gap="md">
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}

        {mode === 'subcategory' && parentCategory && (
          <TextInput
            label={t('categories.form.parentLabel')}
            value={parentCategory.name}
            readOnly
            disabled
          />
        )}

        <TextInput
          label={t('categories.form.nameLabel')}
          placeholder={t('categories.form.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          maxLength={80}
        />

        {(mode === 'create' || !category?.globalTransactionCount) && (
          <Select
            label={t('categories.form.typeLabel')}
            value={categoryType}
            onChange={(value) => setCategoryType(value as CategoryType)}
            data={[
              { value: 'Incoming', label: 'Incoming' },
              { value: 'Outgoing', label: 'Outgoing' },
            ]}
            disabled={mode === 'subcategory'}
          />
        )}

        {mode === 'edit' && category?.globalTransactionCount && category.globalTransactionCount > 0 && (
          <Text size="xs" c="dimmed">
            {t('categories.form.typeLocked')}
          </Text>
        )}

        <TextInput
          label={t('categories.form.iconLabel')}
          placeholder={t('categories.form.iconPlaceholder')}
          value={icon}
          onChange={(e) => setIcon(e.currentTarget.value)}
          maxLength={8}
        />

        <Textarea
          label={t('categories.form.descriptionLabel')}
          placeholder={t('categories.form.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          rows={2}
          maxLength={255}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {mode === 'edit' ? t('common.save') : t('categories.form.create')}
          </Button>
        </Group>
      </Stack>
    </FormOverlay>
  );
}
