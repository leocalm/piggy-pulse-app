import { expect, test } from '../fixtures/auth.fixture';
import { selectMantineOptionByLabel } from '../helpers/ui-helpers';

test.describe('Accounts - Desktop', () => {
  test('creates and deletes an account', async ({ authenticatedPage }) => {
    const accountName = 'E2E Wallet Account';

    await authenticatedPage.goto('/accounts');
    await expect(authenticatedPage.getByRole('heading', { name: 'Accounts' })).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Add Account' }).click();

    await authenticatedPage.getByLabel('Account Name').fill(accountName);
    await selectMantineOptionByLabel(authenticatedPage, 'Type', /Wallet/i);
    const initialBalanceInput = authenticatedPage.getByRole('textbox', { name: 'Initial Balance' });
    await initialBalanceInput.click();
    await initialBalanceInput.press('Control+a');
    await initialBalanceInput.type('420.00');
    await authenticatedPage.getByRole('button', { name: 'Create Account' }).click();

    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.goto('/accounts');

    await expect(authenticatedPage.getByText(accountName)).toBeVisible();

    const deleteButtons = authenticatedPage.locator('button[title="Delete"]');
    const buttonCount = await deleteButtons.count();
    await deleteButtons.nth(buttonCount - 1).click();

    await expect(authenticatedPage.getByText(accountName)).not.toBeVisible();
  });
});
