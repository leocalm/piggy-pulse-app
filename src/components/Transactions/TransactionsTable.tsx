import React, { useEffect, useMemo, useState } from 'react';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Autocomplete, NumberInput, Table, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { fetchAccounts } from '@/api/account';
import { fetchCategories } from '@/api/category';
import { createTransaction, deleteTransaction, fetchTransactions } from '@/api/transaction';
import { fetchVendors } from '@/api/vendor';
import { CategoryNameIcon } from '@/components/Categories/CategoryNameIcon';
import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { TransactionRequest, TransactionResponse } from '@/types/transaction';
import { Vendor } from '@/types/vendor';

interface TransactionsTableProps {
  refreshKey?: number;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ refreshKey }) => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<Partial<TransactionRequest>>({
    description: '',
    value: 0,
    occurredAt: '',
    transactionType: undefined,
    category: '',
    fromAccount: '',
    toAccount: '',
    vendor: { name: '' },
  });
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchCategories()
      .then(setCategories)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    setLoading(true);
    fetchTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    setLoading(true);
    fetchAccounts()
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchVendors()
      .then(setVendors)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const vendorsByName = useMemo(() => {
    return new Map(vendors.map((v) => [v.name, v]));
  }, [vendors]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      description: '',
      value: 0,
      occurredAt: '',
      transactionType: undefined,
      category: '',
      fromAccount: '',
      toAccount: '',
      vendor: { name: '' },
    },
  });

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();

    const created = await createTransaction(newTransaction as TransactionRequest);
    setTransactions((prev) => [...prev, created]);
    setNewTransaction({
      description: '',
      value: 0,
      occurredAt: '',
      transactionType: undefined,
      category: '',
      fromAccount: '',
      toAccount: '',
      vendor: { name: '' },
    });
  };

  const rows = transactions.map((transaction) => {
    const displayValue = transaction.value / 100;

    return (
      <Table.Tr key={transaction.id}>
        <Table.Td>{transaction.occurredAt.toISOString()}</Table.Td>
        <Table.Td>{transaction.description}</Table.Td>
        <Table.Td>
          <CategoryNameIcon category={transaction.category} />
        </Table.Td>
        <Table.Td>
          {transaction.fromAccount.currency.symbol}
          &nbsp;
          {displayValue}
        </Table.Td>
        <Table.Td>{transaction.fromAccount.name}</Table.Td>
        <Table.Td>{transaction.toAccount ? transaction.toAccount.name : '-'}</Table.Td>
        <Table.Td>{transaction.vendor ? transaction.vendor.name : ' '}</Table.Td>
        <Table.Td align="right">
          <ActionIcon color="red" onClick={() => handleDelete(transaction.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // @ts-ignore
  return (
    <form onSubmit={handleSaveNew}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Occurred At</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Value</Table.Th>
            <Table.Th>From Account</Table.Th>
            <Table.Th>To Account</Table.Th>
            <Table.Th>Vendor</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows}
          <Table.Tr>
            <Table.Td>
              <TextInput
                placeholder="Occurred At"
                value={newTransaction.occurredAt}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, occurredAt: e.target.value })
                }
                size="sm"
                variant="unstyled"
              />
            </Table.Td>
            <Table.Td>
              <TextInput
                placeholder="Description"
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, description: e.target.value })
                }
                size="sm"
                variant="unstyled"
              />
            </Table.Td>
            <Table.Td>
              <Autocomplete
                placeholder="Category"
                data={[...categories.map((category) => category.name)]}
                selectFirstOptionOnChange
                autoSelectOnBlur
                value={newTransaction.category}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, category: e ? e : undefined })
                }
                variant="unstyled"
              />
            </Table.Td>
            <Table.Td>
              <NumberInput
                placeholder="Amount"
                leftSection="€"
                hideControls
                value={newTransaction.value}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    value: typeof e === 'number' ? e : undefined,
                  })
                }
                variant="unstyled"
              />
            </Table.Td>
            <Table.Td>
              <Autocomplete
                placeholder="From Account"
                data={[...accounts.map((account) => account.name)]}
                selectFirstOptionOnChange
                autoSelectOnBlur
                value={newTransaction.fromAccount}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, fromAccount: e ? e : undefined })
                }
                variant="unstyled"
              />
            </Table.Td>
            <Table.Td>
              <Autocomplete
                placeholder="To Account"
                data={[...accounts.map((account) => account.name)]}
                selectFirstOptionOnChange
                autoSelectOnBlur
                value={newTransaction.toAccount}
                clearable
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, toAccount: e ? e : undefined })
                }
                variant="unstyled"
              />
            </Table.Td>
            <Table.Td>
              <Autocomplete
                placeholder="Vendor"
                data={vendors.map((vendor) => vendor.name)}
                selectFirstOptionOnChange
                autoSelectOnBlur
                value={newTransaction.vendor?.name || ''}
                clearable
                onChange={(val) => {
                  const existingVendor = vendorsByName.get(val);
                  // You can now efficiently access the ID: existingVendor?.id
                  setNewTransaction({
                    ...newTransaction,
                    vendor: {
                      name: val ? val : '',
                      id: existingVendor?.id,
                    },
                  });
                }}
                variant="unstyled"
              />
            </Table.Td>
            <Table.Td align="right">
              <ActionIcon color="green" type="submit" component="button">
                <IconCheck size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </form>
  );
};
