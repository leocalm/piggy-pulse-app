import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, fetchCategories } from '@/api/category';
import { CategoryRequest } from '@/types/category';

// Hook for fetching
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'], // Unique key for caching
    queryFn: fetchCategories,
  });
};

// Hook for deleting
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      // Automatically refresh the list after delete
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Hook for creating
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newCategory: CategoryRequest) => createCategory(newCategory),
    onSuccess: () => {
      // Automatically refresh the list after create
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
