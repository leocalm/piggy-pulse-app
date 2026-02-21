import { useQuery } from '@tanstack/react-query';
import { fetchAccountDetail } from '@/api/account';
import { queryKeys } from './queryKeys';

export const useAccountDetail = (accountId: string, periodId: string | null) =>
  useQuery({
    queryKey: queryKeys.accountDetail(accountId, periodId ?? ''),
    queryFn: () => fetchAccountDetail(accountId, periodId!),
    enabled: Boolean(accountId && periodId),
  });
