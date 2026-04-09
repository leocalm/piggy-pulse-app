import { expect, type Page } from 'playwright/test';

export class RealOnboardingPage {
  constructor(private readonly page: Page) {}

  async skipToEnd(): Promise<void> {
    await expect(this.page).toHaveURL(/\/onboarding/);

    // Dismiss cookie banner if it's blocking
    await this.page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 3000 })
      .catch(() => {});
    await this.page.waitForTimeout(300);

    // Click through onboarding steps until we reach the dashboard.
    for (let i = 0; i < 10; i++) {
      if (!this.page.url().includes('/onboarding')) {
        break;
      }

      // Currency step: select Euro if the currency list is visible
      const euroOption = this.page.getByText('Euro', { exact: true });
      if (await euroOption.isVisible({ timeout: 500 }).catch(() => false)) {
        await euroOption.click();
      }

      // Try each button in priority order
      for (const testId of ['onboarding-go-to-dashboard', 'onboarding-skip', 'onboarding-next']) {
        const btn = this.page.getByTestId(testId);
        if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
          await btn.click();
          break;
        }
      }
      await this.page.waitForTimeout(500);
    }
  }

  async expectOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  }
}
