import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/v2client';
import { v2QueryKeys } from './queryKeys';

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
