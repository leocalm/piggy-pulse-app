import { expect, test } from '../fixtures/auth.fixture';

test.describe('Budget Periods - Desktop', () => {
  test('creates, edits, and deletes a period', async ({ authenticatedPage }) => {
    const createdName = 'E2E March 2026';
    const updatedName = 'E2E March 2026 Updated';

    await authenticatedPage.goto('/periods');
    await expect(authenticatedPage.getByRole('heading', { name: 'Budget Periods' })).toBeVisible();

    await authenticatedPage.getByRole('button', { name: 'Create Period' }).first().click();

    const periodDialog = authenticatedPage.getByRole('dialog').first();
    await periodDialog.getByLabel('Start Date').fill('2026-03-01');
    await periodDialog.getByLabel('Period Name').fill(createdName);
    await periodDialog.getByRole('button', { name: 'Create Period' }).click();

    await expect(authenticatedPage.getByText(createdName)).toBeVisible();

    const upcomingPeriods = authenticatedPage
      .locator('section')
      .filter({ hasText: 'Upcoming Periods' });
    await upcomingPeriods.getByLabel('Edit period').last().click();

    const editDialog = authenticatedPage.getByRole('dialog').first();
    await editDialog.getByLabel('Period Name').fill(updatedName);
    await editDialog.getByRole('button', { name: 'Save Changes' }).click();

    await expect(authenticatedPage.getByText(updatedName)).toBeVisible();

    await upcomingPeriods.getByLabel('Delete period').last().click();

    const deleteDialog = authenticatedPage.getByRole('dialog').first();
    await deleteDialog.getByRole('button', { name: 'Delete' }).click();

    await expect(deleteDialog).not.toBeVisible();
    await expect(authenticatedPage.getByText('No upcoming periods found.')).toBeVisible();
  });
});
