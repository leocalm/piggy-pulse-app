import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/api/v2';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

export type CategoryTemplateResponse = components['schemas']['CategoryTemplateResponse'];

export function useOnboardingStatus() {
  return useQuery({
    queryKey: v2QueryKeys.onboarding.status(),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/onboarding/status');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useCategoryTemplates() {
  return useQuery({
    queryKey: v2QueryKeys.onboarding.templates(),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/onboarding/category-templates');
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useApplyTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      const { data, error } = await apiClient.POST('/onboarding/apply-template', {
        body: { templateId },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.categories.all() });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await apiClient.POST('/onboarding/complete');
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.onboarding.all() });
      queryClient.invalidateQueries({ queryKey: v2QueryKeys.auth.me() });
    },
  });
}
