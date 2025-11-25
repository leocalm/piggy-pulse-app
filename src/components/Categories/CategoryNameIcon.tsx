import React from 'react';
import { Group } from '@mantine/core';
import { CategoryResponse } from '@/types/category';
import { getIcon } from '@/utils/IconMap';

export function CategoryNameIcon({ category }: { category: CategoryResponse }) {
  return (
    <Group>
      {getIcon(category.icon, 20)}
      {category.name}
    </Group>
  );
}
