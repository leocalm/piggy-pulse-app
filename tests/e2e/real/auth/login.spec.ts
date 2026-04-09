import { expect, test } from '../../../fixtures/real.fixture';
import { RealAuthPage } from '../../../pages/real/auth.page';

test.describe('Login', () => {
  test('login with valid credentials redirects to dashboard or onboarding', async ({
    page,
    realUser,
  }) => {
    const authPage = new RealAuthPage(page);

    await authPage.login(realUser.email, realUser.password);
    await authPage.expectOnDashboardOrOnboarding();
  });

  test('login with wrong password shows an error message', async ({ page, realUser }) => {
    // Use page object login which handles cookie dismiss
    await page.goto('/auth/login');
    // Dismiss cookie banner (covers submit on mobile)
    await page
      .getByRole('region', { name: 'Cookie consent' })
      .getByRole('button', { name: 'Accept' })
      .click({ timeout: 2000 })
      .catch(() => {});

    await page.getByTestId('login-email').fill(realUser.email);
    await page.getByTestId('login-password').fill('wrong-password-that-does-not-match');
    await page.getByTestId('login-submit').click();

    // Expect an error notification or inline message to appear
    const errorLocator = page
      .getByRole('alert')
      .or(page.getByTestId('login-error'))
      .or(page.getByText(/invalid|incorrect|wrong|failed/i));

    await expect(errorLocator.first()).toBeVisible();

    // Should remain on the login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
