import {
  BudgetCategoryRequest,
  BudgetCategoryResponse,
  BudgetRequest,
  BudgetResponse,
} from '@/types/budget';

export async function fetchBudget(): Promise<BudgetResponse[]> {
  const res = await fetch(`/api/budgets`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to fetch budget');
  }
  return res.json();
}

export async function createCategory(payload: BudgetRequest): Promise<BudgetResponse> {
  const res = await fetch(`/api/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to create budget');
  }
  return res.json();
}

export async function fetchBudgetCategories(): Promise<BudgetCategoryResponse[]> {
  const res = await fetch(`/api/budget-categories`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to fetch budget categories');
  }
  return res.json();
}

export async function createBudgetCategory(
  payload: BudgetCategoryRequest
): Promise<BudgetCategoryResponse> {
  const res = await fetch(`/api/budget-categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to create budget category');
  }
  return res.json();
}

export async function deleteBudgetCategory(id: string): Promise<void> {
  const res = await fetch(`/api/budget-categories/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to delete budget category');
  }
}
