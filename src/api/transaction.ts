import { createVendor } from '@/api/vendor';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';

export async function fetchTransactions(): Promise<TransactionResponse[]> {
  return [
    {
      id: 't1',
      description: 'bla',
      value: 10000,
      occurredAt: new Date(),
      transactionType: 'Incoming',
      category: {
        id: 'c1',
        name: 'Cat 1',
        category_type: 'Incoming',
        color: 'red',
        icon: 'wallet',
        parent_id: null,
      },
      fromAccount: {
        id: 'f1',
        name: 'ING',
        color: 'orange',
        icon: 'cart',
        account_type: 'Checking',
        currency: {
          id: 'c1',
          name: 'Euro',
          symbol: '€',
          currency: 'EUR',
          decimal_places: 2,
        },
        balance: 100,
      },
      toAccount: null,
      vendor: {
        id: 'v1',
        name: 'Vendor 1',
      },
    },
    {
      id: 't2',
      description: 'asdasdadadasd',
      value: 12345,
      occurredAt: new Date(),
      transactionType: 'Outgoing',
      category: {
        id: 'c1',
        name: 'Groceries',
        category_type: 'Outgoing',
        color: 'red',
        icon: 'cart',
        parent_id: null,
      },
      fromAccount: {
        id: 'f1',
        name: 'ING',
        color: 'orange',
        icon: 'cart',
        account_type: 'Checking',
        currency: {
          id: 'c1',
          name: 'Euro',
          symbol: '€',
          currency: 'EUR',
          decimal_places: 2,
        },
        balance: 100,
      },
      toAccount: null,
      vendor: {
        id: 'v2',
        name: 'Vendor 2',
      },
    },
  ];
}

export async function createTransaction(
  transaction: TransactionRequest
): Promise<TransactionResponse> {
  if (!transaction.vendor?.id) {
    await createVendor(transaction.vendor);
  }

  console.log('Creating transaction ', transaction);

  return {
    id: 't3',
    description: 'adasd',
    value: 23245,
    occurredAt: new Date(),
    transactionType: 'Incoming',
    category: {
      id: 'c1',
      name: 'Cat 1',
      category_type: 'Incoming',
      color: 'red',
      icon: 'wallet',
      parent_id: null,
    },
    fromAccount: {
      id: 'f1',
      name: 'ING',
      color: 'orange',
      icon: 'cart',
      account_type: 'Checking',
      currency: {
        id: 'c1',
        name: 'Euro',
        symbol: '€',
        currency: 'EUR',
        decimal_places: 2,
      },
      balance: 100,
    },
    toAccount: null,
    vendor: {
      id: 'v1',
      name: 'Vendor 1',
    },
  };
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  console.log('Deleting transaction ', transactionId);
}
