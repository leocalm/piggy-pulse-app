import { useQuery } from '@tanstack/react-query';
import { fetchAccountContext } from '@/api/account';
import { queryKeys } from './queryKeys';

export const useAccountContext = (accountId: string, periodId: string | null, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.accountContext(accountId, periodId ?? ''),
    queryFn: () => fetchAccountContext(accountId, periodId!),
    enabled: enabled && Boolean(accountId && periodId),
  });
