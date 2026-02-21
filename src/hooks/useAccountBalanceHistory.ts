import { useQuery } from '@tanstack/react-query';
import { fetchAccountBalanceHistory } from '@/api/account';
import { queryKeys } from './queryKeys';

export const useAccountBalanceHistory = (
  accountId: string,
  range: 'period' | '30d' | '90d' | '1y',
  periodId?: string | null
) =>
  useQuery({
    queryKey: queryKeys.accountBalanceHistory(accountId, range, periodId ?? undefined),
    queryFn: () => fetchAccountBalanceHistory(accountId, range, periodId ?? undefined),
    enabled: Boolean(accountId) && (range !== 'period' || Boolean(periodId)),
  });
