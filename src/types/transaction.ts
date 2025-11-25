import { AccountResponse } from '@/types/account';
import { CategoryResponse } from '@/types/category';
import { Vendor, VendorRequest } from '@/types/vendor';

export const TRANSACTION_TYPES = ['Incoming', 'Outgoing', 'Transfer'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface TransactionResponse {
  id: string;
  description: string;
  value: number;
  occurredAt: Date;
  transactionType: TransactionType;
  category: CategoryResponse;
  fromAccount: AccountResponse;
  toAccount: AccountResponse | null;
  vendor: Vendor;
}

export interface TransactionRequest {
  description: string;
  value: number;
  occurredAt: string;
  transactionType: string;
  category: string;
  fromAccount: string;
  toAccount: string | undefined;
  vendor: VendorRequest;
}
