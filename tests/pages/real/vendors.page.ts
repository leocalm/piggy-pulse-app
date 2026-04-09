import { expect, type Page } from 'playwright/test';

export class RealVendorsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/vendors');
    await expect(this.page).toHaveURL(/\/vendors/);
  }

  async createVendor(name: string): Promise<void> {
    await this.page.getByTestId('vendors-add-button').dispatchEvent('click');

    await expect(this.page.getByTestId('vendor-name-input')).toBeVisible();
    await this.page.getByTestId('vendor-name-input').fill(name);
    await this.page.getByTestId('vendor-form-submit').click();
    await expect(this.page.getByTestId('vendor-name-input')).not.toBeVisible();
  }
}
