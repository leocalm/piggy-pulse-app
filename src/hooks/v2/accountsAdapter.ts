import type { components } from '@/api/v2';
import type { DecryptedAccount, DecryptedTransaction } from '@/lib/encryption';
import { countsAsBudgetExpense, type DecryptedStore } from './useEncryptedStore';

// The legacy v2 OpenAPI types describe account type as PascalCase
// (`Checking`, `CreditCard`, …) while the encrypted API returns lowercase
// (`checking`, `creditcard`, …). Every renderer still switches on the
// PascalCase variants, so the adapter mirrors the old DTO exactly.
export type LegacyAccountType = 'Checking' | 'Savings' | 'CreditCard' | 'Allowance' | 'Wallet';

const PASCAL_FOR: Record<DecryptedAccount['accountType'], LegacyAccountType> = {
  checking: 'Checking',
  savings: 'Savings',
  creditcard: 'CreditCard',
  wallet: 'Wallet',
  allowance: 'Allowance',
};

export type LegacyAccountSummary = components['schemas']['AccountSummaryResponse'];
export type LegacyAccountSummaryListResponse = components['schemas']['AccountSummaryListResponse'];

interface PeriodTxStats {
  count: number;
  netChange: number;
}

function aggregateTransactions(transactions: DecryptedTransaction[]): Map<string, PeriodTxStats> {
  const stats = new Map<string, PeriodTxStats>();
  const bump = (id: string, delta: number) => {
    const prev = stats.get(id) ?? { count: 0, netChange: 0 };
    prev.count += 1;
    prev.netChange += delta;
    stats.set(id, prev);
  };
  for (const tx of transactions) {
    // Outflow on the `from` side, inflow on the `to` side of a transfer.
    bump(tx.fromAccountId, -Math.abs(tx.amount));
    if (tx.toAccountId) {
      bump(tx.toAccountId, Math.abs(tx.amount));
    }
  }
  return stats;
}

// Builds a legacy AccountSummary from the decrypted store. Mirrors the
// fields the Rocket handler used to emit before Phase 2c retired it.
export function buildAccountSummary(
  account: DecryptedAccount,
  stats: Map<string, PeriodTxStats>
): LegacyAccountSummary {
  const s = stats.get(account.id) ?? { count: 0, netChange: 0 };
  return {
    id: account.id,
    name: account.name,
    color: account.color,
    type: PASCAL_FOR[account.accountType],
    status: account.status,
    currentBalance: account.currentBalance,
    netChangeThisPeriod: s.netChange,
    nextTransfer: null,
    balanceAfterNextTransfer:
      account.nextTransferAmount !== null
        ? account.currentBalance + account.nextTransferAmount
        : null,
    numberOfTransactions: s.count,
  };
}

export function buildAccountSummaries(store: DecryptedStore): LegacyAccountSummary[] {
  const stats = aggregateTransactions(store.transactions);
  return store.accounts.map((a) => buildAccountSummary(a, stats));
}

// Net-position aggregate used by the accounts header card + dashboard.
export interface NetPositionView {
  total: number;
  liquidAmount: number;
  protectedAmount: number;
  debtAmount: number;
  differenceThisPeriod: number;
  numberOfAccounts: number;
}

export function buildNetPosition(store: DecryptedStore): NetPositionView {
  const categoriesById = new Map(store.categories.map((c) => [c.id, c]));
  const accountsById = new Map(store.accounts.map((a) => [a.id, a]));

  const activeAccounts = store.accounts.filter((a) => a.status === 'active');
  let liquidAmount = 0;
  let protectedAmount = 0;
  let debtAmount = 0;
  for (const a of activeAccounts) {
    if (a.accountType === 'creditcard') {
      debtAmount += Math.abs(Math.min(0, a.currentBalance));
    } else if (a.accountType === 'savings') {
      protectedAmount += Math.max(0, a.currentBalance);
    } else {
      liquidAmount += Math.max(0, a.currentBalance);
    }
  }

  // Period delta: inflows (income) minus outflows that count toward the
  // budget (respecting the allowance-envelope rule).
  let inflow = 0;
  let outflow = 0;
  for (const tx of store.transactions) {
    const cat = tx.categoryId ? categoriesById.get(tx.categoryId) : undefined;
    if (cat?.type === 'income') {
      inflow += tx.amount;
    } else if (countsAsBudgetExpense(tx, categoriesById, accountsById)) {
      outflow += Math.abs(tx.amount);
    }
  }

  return {
    total: liquidAmount + protectedAmount - debtAmount,
    liquidAmount,
    protectedAmount,
    debtAmount,
    differenceThisPeriod: inflow - outflow,
    numberOfAccounts: activeAccounts.length,
  };
}

// Running balance series for the sparkline: starts at (currentBalance minus
// net change through the period) and steps through each transaction in date
// order. Produces the same `{ date, balance, transactionCount }` shape the
// old /balance-history endpoint emitted so consumers render without changes.
export interface BalanceHistoryPoint {
  date: string;
  balance: number;
  transactionCount: number;
}

export function buildBalanceHistory(
  accountId: string,
  store: DecryptedStore
): BalanceHistoryPoint[] {
  const account = store.accounts.find((a) => a.id === accountId);
  if (!account) {
    return [];
  }
  const relevant = store.transactions
    .filter((tx) => tx.fromAccountId === accountId || tx.toAccountId === accountId)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // Reconstruct the opening balance by reversing the period's net change.
  let net = 0;
  for (const tx of relevant) {
    const amount = Math.abs(tx.amount);
    if (tx.fromAccountId === accountId) {
      net -= amount;
    }
    if (tx.toAccountId === accountId) {
      net += amount;
    }
  }
  let running = account.currentBalance - net;

  const points: BalanceHistoryPoint[] = [];
  const countByDate = new Map<string, number>();
  for (const tx of relevant) {
    const amount = Math.abs(tx.amount);
    if (tx.fromAccountId === accountId) {
      running -= amount;
    }
    if (tx.toAccountId === accountId) {
      running += amount;
    }
    const prevCount = countByDate.get(tx.date) ?? 0;
    countByDate.set(tx.date, prevCount + 1);
    points.push({ date: tx.date, balance: running, transactionCount: prevCount + 1 });
  }
  return points;
}
