import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/v2client';
import { buildNetPosition } from './accountsAdapter';
import { v2QueryKeys } from './queryKeys';
import { useEncryptedStore } from './useEncryptedStore';

export function useDashboardCurrentPeriod(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.currentPeriod(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/current-period', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useDashboardNetPosition(periodId: string) {
  // The `/dashboard/net-position` endpoint was retired in Phase 2c. The
  // equivalent figures are derived locally from the decrypted store.
  const store = useEncryptedStore(periodId);
  const data = useMemo(() => {
    if (!store.data) {
      return undefined;
    }
    return buildNetPosition(store.data);
  }, [store.data]);

  return {
    data,
    isLoading: store.isLoading,
    isError: store.isError,
    error: store.error,
    refetch: store.refetch,
  };
}

export function useDashboardNetPositionHistory(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.netPositionHistory(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/net-position-history', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useDashboardCurrentPeriodHistory(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.currentPeriodHistory(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/current-period-history', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useDashboardCashFlow(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.cashFlow(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/cash-flow', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useDashboardSpendingTrend(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.spendingTrend(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/spending-trend', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useDashboardTopVendors(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.topVendors(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/top-vendors', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useDashboardBudgetStability(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.budgetStability(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/budget-stability', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useDashboardFixedCategories(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.fixedCategories(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/fixed-categories', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}

export function useDashboardSubscriptions(periodId: string) {
  return useQuery({
    queryKey: v2QueryKeys.dashboard.subscriptions(periodId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/dashboard/subscriptions', {
        params: { query: { periodId } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!periodId,
  });
}
