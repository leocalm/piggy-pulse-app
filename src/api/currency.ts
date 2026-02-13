import { CurrencyResponse } from '@/types/account';
import { apiGet } from './client';

export async function fetchCurrencyByCode(code: string): Promise<CurrencyResponse> {
  return apiGet<CurrencyResponse>(`/api/currency/${code}`);
}

export async function fetchCurrencies(): Promise<CurrencyResponse[]> {
  return apiGet<CurrencyResponse[]>('/api/currency/');
}
