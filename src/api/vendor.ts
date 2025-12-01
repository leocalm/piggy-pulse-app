import { Vendor } from '@/types/vendor';

export async function fetchVendors(): Promise<Vendor[]> {
  const res = await fetch(`/api/vendors`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to fetch vendors');
  }
  return res.json();
}

export async function createVendor(payload: Vendor): Promise<Vendor> {
  const res = await fetch(`/api/vendors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to create vendor');
  }
  return res.json();
}

export async function deleteVendor(id: string): Promise<void> {
  const res = await fetch(`/api/vendors/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to delete vendor');
  }
}
