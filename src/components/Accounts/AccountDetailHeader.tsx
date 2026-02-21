import { Skeleton, Text, Title } from '@mantine/core';
import { AccountDetail, AccountResponse } from '@/types/account';
import { formatCurrency } from '@/utils/currency';

interface Props {
  account: AccountResponse | undefined;
  detail: AccountDetail | undefined;
  isLoading: boolean;
}

export function AccountDetailHeader({ account, detail, isLoading }: Props) {
  if (isLoading) {
    return <Skeleton height={60} mb="xl" />;
  }

  const sign = detail && detail.balanceChange >= 0 ? '+' : '';
  const periodLabel =
    detail && account
      ? `${sign}${formatCurrency(detail.balanceChange, account.currency)} · ${detail.periodStart} – ${detail.periodEnd}`
      : '';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 40,
      }}
    >
      <div>
        <Title order={4}>{account?.name}</Title>
        <Text size="xs" tt="uppercase" c="dimmed">
          {account?.accountType}
        </Text>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Title order={2}>
          {account ? formatCurrency(detail?.balance ?? 0, account.currency) : '—'}
        </Title>
        <Text size="sm" c="dimmed">
          {periodLabel}
        </Text>
      </div>
    </div>
  );
}
