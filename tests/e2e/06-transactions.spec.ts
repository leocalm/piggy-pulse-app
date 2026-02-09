import { expect, test } from '../fixtures/auth.fixture';

test.describe('Transactions - Desktop', () => {
  test('creates and deletes a transaction', async ({ authenticatedPage, page }) => {
    const description = `E2E Grocery Purchase ${Date.now()}`;

    await authenticatedPage.goto('/transactions');
    await expect(authenticatedPage.getByRole('heading', { name: 'Transactions' })).toBeVisible();

    const createResponse = await authenticatedPage.evaluate(
      async (payload) => {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });

        return { status: response.status };
      },
      {
        description,
        amount: 1850,
        occurred_at: '2026-02-09',
        category_id: 'category-2',
        from_account_id: 'account-1',
        to_account_id: null,
        vendor_id: 'vendor-1',
      }
    );
    expect(createResponse.status).toBe(201);
    await authenticatedPage.reload();
    await expect(authenticatedPage.getByRole('heading', { name: 'Transactions' })).toBeVisible();

    const transactionRow = authenticatedPage.locator('tr').filter({ hasText: description }).first();
    await expect(transactionRow).toBeVisible();

    page.once('dialog', (dialog) => {
      void dialog.accept();
    });

    await transactionRow.getByRole('button', { name: '🗑️' }).click();
    await authenticatedPage.reload();
    await expect(authenticatedPage.getByRole('heading', { name: 'Transactions' })).toBeVisible();

    await expect(transactionRow).not.toBeVisible();
  });
});
