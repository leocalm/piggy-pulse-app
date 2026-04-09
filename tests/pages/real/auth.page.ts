import { expect, type Page } from 'playwright/test';

export class RealAuthPage {
  constructor(private readonly page: Page) {}

  async register(name: string, email: string, password: string): Promise<void> {
    await this.page.goto('/auth/register');
    await expect(this.page.getByText('Create your account')).toBeVisible();
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByLabel('Confirm password').fill(password);
    // Accept Terms of Service checkbox (required to enable submit)
    await this.page.getByRole('checkbox').check();
    await this.page.getByTestId('register-submit').click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.goto('/auth/login');
    await this.page.getByTestId('login-email').fill(email);
    await this.page.getByTestId('login-password').fill(password);
    await this.page.getByTestId('login-submit').click();
  }

  async logout(): Promise<void> {
    await this.page.getByTestId('user-section').click();
    await this.page.getByTestId('user-logout-button').click();
  }

  async expectOnDashboardOrOnboarding(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(dashboard|onboarding)/);
  }

  async expectOnLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }
}
