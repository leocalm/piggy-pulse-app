import { expect, test } from '../fixtures/auth.fixture';

test.describe('Dashboard - Desktop', () => {
  test('shows key widgets and links to transactions', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');

    await expect(
      authenticatedPage.getByRole('heading', { name: 'Financial Dashboard' })
    ).toBeVisible();

    await expect(authenticatedPage.getByText('Remaining Budget')).toBeVisible();
    await expect(authenticatedPage.getByText('Total Assets')).toBeVisible();
    await expect(authenticatedPage.getByText('Avg. Daily Spend')).toBeVisible();
    await expect(authenticatedPage.getByText('Month Progress')).toBeVisible();

    await expect(authenticatedPage.getByText('Recent Activity')).toBeVisible();
    await expect(authenticatedPage.getByText('Grocery Store')).toBeVisible();

    await authenticatedPage.getByRole('link', { name: 'View all' }).click();
    await expect(authenticatedPage).toHaveURL(/\/transactions$/);
  });
});
