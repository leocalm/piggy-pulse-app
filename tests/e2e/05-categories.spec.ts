import { expect, test } from '../fixtures/auth.fixture';

test.describe('Categories - Desktop', () => {
  test('supports filtering and deleting categories', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/categories');
    await expect(authenticatedPage.getByRole('heading', { name: 'Categories' })).toBeVisible();

    await authenticatedPage.getByRole('tab', { name: /Income/ }).click();
    await expect(authenticatedPage.getByText('Salary')).toBeVisible();

    await authenticatedPage.getByRole('tab', { name: /Spending/ }).click();
    await expect(authenticatedPage.getByText('Groceries')).toBeVisible();

    await authenticatedPage.getByRole('tab', { name: /All/ }).click();

    const deleteButtons = authenticatedPage.getByRole('button', { name: '🗑️' });
    const beforeCount = await deleteButtons.count();
    await deleteButtons.first().click();
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.goto('/categories');
    await expect(authenticatedPage.getByRole('button', { name: '🗑️' })).toHaveCount(
      beforeCount - 1
    );
  });
});
