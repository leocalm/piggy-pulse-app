import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAccountTransactions } from '@/api/account';
import { AccountTransactionsPage } from '@/types/account';
import { queryKeys } from './queryKeys';

export const useAccountTransactions = (
  accountId: string,
  periodId: string | null,
  txType: 'all' | 'in' | 'out' = 'all'
) =>
  useInfiniteQuery<
    AccountTransactionsPage,
    Error,
    { pages: AccountTransactionsPage[] },
    readonly string[],
    string | null
  >({
    queryKey: queryKeys.accountTransactions(accountId, periodId ?? '', txType),
    queryFn: ({ pageParam }) =>
      fetchAccountTransactions(accountId, periodId!, txType, pageParam ?? undefined),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    enabled: Boolean(accountId && periodId),
  });
