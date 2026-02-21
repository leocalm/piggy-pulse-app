import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ActionIcon, Container } from '@mantine/core';
import { fetchAccount } from '@/api/account';
import { useBudgetPeriodSelection } from '@/context/BudgetContext';
import { queryKeys } from '@/hooks/queryKeys';
import { useAccountDetail } from '@/hooks/useAccountDetail';
import { AccountContextSection } from './AccountContextSection';
import { AccountDetailHeader } from './AccountDetailHeader';
import { AccountTransactions } from './AccountTransactions';
import { BalanceHistoryChart } from './BalanceHistoryChart';
import { PeriodFlow } from './PeriodFlow';

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedPeriodId } = useBudgetPeriodSelection();

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: queryKeys.account(id!),
    queryFn: () => fetchAccount(id!),
    enabled: !!id,
  });

  const { data: detail, isLoading: detailLoading } = useAccountDetail(id!, selectedPeriodId);

  return (
    <Container size="lg" py="xl">
      <ActionIcon variant="subtle" mb="md" onClick={() => navigate('/accounts')}>
        ←
      </ActionIcon>

      <AccountDetailHeader
        account={account}
        detail={detail}
        isLoading={accountLoading || detailLoading}
      />

      <BalanceHistoryChart
        accountId={id!}
        periodId={selectedPeriodId}
        currency={account?.currency}
      />

      <PeriodFlow detail={detail} currency={account?.currency} isLoading={detailLoading} />

      <AccountContextSection
        accountId={id!}
        periodId={selectedPeriodId}
        currency={account?.currency}
      />

      <AccountTransactions
        accountId={id!}
        periodId={selectedPeriodId}
        currency={account?.currency}
      />
    </Container>
  );
}
