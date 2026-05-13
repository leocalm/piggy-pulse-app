import { expect, type APIRequestContext } from 'playwright/test';
import { e2eEnv } from '../../setup/env';

export type CategoryType = 'expense' | 'income';
export type CategoryBehavior = 'fixed' | 'variable' | 'subscription';
export type SubscriptionCycle = 'monthly' | 'quarterly' | 'yearly';

export interface CreateCategoryApiOpts {
  name: string;
  type?: CategoryType;
  behavior?: CategoryBehavior;
  icon?: string;
  color?: string;
  description?: string;
}

export interface CreateSubscriptionApiOpts {
  categoryId: string;
  name: string;
  /** Amount in cents (e.g., 1000 = $10.00) */
  amount: number;
  cycle?: SubscriptionCycle;
  billingDay?: number;
  nextChargeDate?: string;
  vendorId?: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  type: CategoryType;
  behavior?: CategoryBehavior;
  budgeted?: number;
  actual?: number;
}

/**
 * Creates a category via the API proxy and returns its id.
 */
export async function createCategoryViaApi(
  pageRequest: APIRequestContext,
  opts: CreateCategoryApiOpts
): Promise<{ id: string }> {
  const res = await pageRequest.post(`${e2eEnv.baseUrl}/v2/categories`, {
    data: {
      name: opts.name,
      type: opts.type ?? 'expense',
      behavior: opts.behavior ?? 'variable',
      icon: opts.icon ?? '🛒',
      color: opts.color ?? '#6B8FD4',
      ...(opts.description !== undefined ? { description: opts.description } : {}),
    },
  });

  if (!res.ok()) {
    throw new Error(`createCategoryViaApi failed: ${res.status()} ${await res.text()}`);
  }

  const body = (await res.json()) as { id: string };
  return { id: body.id };
}

/**
 * Sets (or updates) the budget target for a category.
 * Attempts POST first; if the server returns a conflict (duplicate), it
 * falls back to GET then PUT on the existing target.
 */
export async function setCategoryTarget(
  pageRequest: APIRequestContext,
  categoryId: string,
  valueCents: number
): Promise<void> {
  const postRes = await pageRequest.post(`${e2eEnv.baseUrl}/v2/targets`, {
    data: { categoryId, value: valueCents },
  });

  if (postRes.ok()) {
    return;
  }

  // On duplicate/conflict, look up the existing target and update it.
  const listRes = await pageRequest.get(`${e2eEnv.baseUrl}/v2/targets`);
  expect(listRes.ok(), `GET /v2/targets failed: ${await listRes.text()}`).toBeTruthy();

  const listBody = await listRes.json();
  const items: Array<{ id: string; categoryId: string }> = Array.isArray(listBody)
    ? listBody
    : (listBody.data ?? []);

  const existing = items.find((t) => t.categoryId === categoryId);
  if (!existing) {
    throw new Error(
      `setCategoryTarget: POST failed (${postRes.status()}) and no existing target found for category ${categoryId}`
    );
  }

  const putRes = await pageRequest.put(`${e2eEnv.baseUrl}/v2/targets/${existing.id}`, {
    data: { value: valueCents },
  });

  if (!putRes.ok()) {
    throw new Error(`setCategoryTarget PUT failed: ${putRes.status()} ${await putRes.text()}`);
  }
}

/**
 * Creates a subscription linked to a category via the API proxy.
 * Amount should be provided in cents.
 */
export async function createSubscriptionViaApi(
  pageRequest: APIRequestContext,
  opts: CreateSubscriptionApiOpts
): Promise<{ id: string }> {
  const today = new Date().toISOString().slice(0, 10);

  const res = await pageRequest.post(`${e2eEnv.baseUrl}/v2/subscriptions`, {
    data: {
      categoryId: opts.categoryId,
      name: opts.name,
      billingAmount: opts.amount,
      billingCycle: opts.cycle ?? 'monthly',
      billingDay: opts.billingDay ?? 1,
      nextChargeDate: opts.nextChargeDate ?? today,
      ...(opts.vendorId !== undefined ? { vendorId: opts.vendorId } : {}),
    },
  });

  if (!res.ok()) {
    throw new Error(`createSubscriptionViaApi failed: ${res.status()} ${await res.text()}`);
  }

  const body = (await res.json()) as { id: string };
  return { id: body.id };
}

/**
 * Deletes a category via the API proxy.
 */
export async function deleteCategoryViaApi(
  pageRequest: APIRequestContext,
  id: string
): Promise<void> {
  const res = await pageRequest.delete(`${e2eEnv.baseUrl}/v2/categories/${id}`);

  if (!res.ok()) {
    throw new Error(`deleteCategoryViaApi failed: ${res.status()} ${await res.text()}`);
  }
}

/**
 * Returns all categories for the current user.
 * Handles both plain-array and paginated `{ data: [] }` response shapes.
 */
export async function getCategoriesViaApi(
  pageRequest: APIRequestContext
): Promise<CategorySummary[]> {
  const res = await pageRequest.get(`${e2eEnv.baseUrl}/v2/categories`);
  expect(res.ok(), `GET /v2/categories failed: ${await res.text()}`).toBeTruthy();

  const body = await res.json();
  const items: CategorySummary[] = Array.isArray(body) ? body : (body.data ?? []);
  return items;
}
