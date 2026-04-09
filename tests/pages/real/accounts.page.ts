import { expect, type Page } from 'playwright/test';

export class RealAccountsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/accounts');
    await expect(this.page).toHaveURL(/\/accounts/);
  }

  async createAccount(name: string, type: string, balance: string): Promise<void> {
    // Try the testid button first, then fall back to any visible "Add" button
    // Dismiss the hint banner if visible (it can block clicks on mobile)
    const hintClose = this.page
      .locator('[data-testid="accounts-empty-state"]')
      .locator('..')
      .getByRole('button', { name: /close|dismiss|×/i });
    await hintClose.click({ timeout: 1000 }).catch(() => {});

    const addButton = this.page.getByTestId('accounts-add-button');
    const emptyStateCta = this.page.getByRole('button', { name: /add.*account/i }).first();
    const target = (await addButton.isVisible({ timeout: 2000 }).catch(() => false))
      ? addButton
      : emptyStateCta;
    await target.dispatchEvent('click');

    // Wait for drawer content to appear
    await expect(this.page.getByTestId('account-name-input')).toBeVisible();

    // Select account type by clicking the matching button/option
    await this.page.getByRole('button', { name: type }).click();

    await this.page.getByTestId('account-name-input').fill(name);
    await this.page.getByTestId('account-balance-input').fill(balance);
    await this.page.getByTestId('account-form-submit').click();

    // Wait for drawer to close
    await expect(this.page.getByTestId('account-name-input')).not.toBeVisible();
  }

  async getNetPosition(): Promise<string> {
    const el = this.page.getByTestId('account-net-position-value');
    return (await el.textContent()) ?? '';
  }
}
