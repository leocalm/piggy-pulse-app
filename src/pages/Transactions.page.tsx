import { BasicAppShell } from '@/AppShell';
import { TransactionsTable } from '@/components/Transactions/TransactionsTable';

export function TransactionsPage() {
  return (
    <BasicAppShell>
      <TransactionsTable />
    </BasicAppShell>
  );
}
