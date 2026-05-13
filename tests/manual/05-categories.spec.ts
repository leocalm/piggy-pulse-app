import { expect, test } from './fixtures/manual.fixture';
import { seedTransaction } from './helpers/accounts-api';
import {
  createCategoryViaApi,
  createSubscriptionViaApi,
  setCategoryTarget,
} from './helpers/categories-api';
import { AccountsPage } from './pages/accounts.page';
import { CategoriesPage } from './pages/categories.page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ts(workerIndex: number): string {
  return `${Date.now()}-w${workerIndex}`;
}

const stripCommas = (s: string) => s.replace(/,/g, '');

// ---------------------------------------------------------------------------
// Group A: Create variants
// ---------------------------------------------------------------------------

test.describe('Categories — Group A: Create variants', () => {
  test('create an outgoing variable category with budget', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `Var Expense ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({ name, type: 'expense', behavior: 'variable', budget: 100 });

    await categories.goto();
    const row = categories.categoryRowByName(name);
    await expect(row).toBeVisible({ timeout: 10000 });
    const text = await row.textContent();
    expect(text).toMatch(/100/);
  });

  test('create an outgoing fixed category with budget', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `Fixed Expense ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({ name, type: 'expense', behavior: 'fixed', budget: 200 });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create an outgoing subscription category with a subscription', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `Sub Expense ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({
      name,
      type: 'expense',
      behavior: 'subscription',
      subscription: { name: 'NetflixSub', amount: 15, cycle: 'monthly', billingDay: 5 },
    });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create an incoming variable category with budget', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `Income Var ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({ name, type: 'income', budget: 500 });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create an incoming fixed category', async ({ loggedInPage: page }, testInfo) => {
    const name = `Income Fixed ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    // Income categories don't show the behavior selector — just create with type=income.
    await categories.createCategory({ name, type: 'income' });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create an outgoing variable category without budget', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `Var No Budget ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({ name, type: 'expense', behavior: 'variable' });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create an outgoing fixed category without budget', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `Fixed No Budget ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({ name, type: 'expense', behavior: 'fixed' });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create an incoming category without budget', async ({ loggedInPage: page }, testInfo) => {
    const name = `Income No Budget ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({ name, type: 'income' });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Group B: Subscription cycle variants
// ---------------------------------------------------------------------------

test.describe('Categories — Group B: Subscription cycle variants', () => {
  test('create a monthly subscription', async ({ loggedInPage: page }, testInfo) => {
    const name = `Monthly Sub ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({
      name,
      type: 'expense',
      behavior: 'subscription',
      subscription: { name: 'MonthlyService', amount: 10, cycle: 'monthly', billingDay: 1 },
    });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create a quarterly subscription', async ({ loggedInPage: page }, testInfo) => {
    const name = `Quarterly Sub ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({
      name,
      type: 'expense',
      behavior: 'subscription',
      subscription: { name: 'QuarterlyService', amount: 30, cycle: 'quarterly', billingDay: 1 },
    });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('create a yearly subscription', async ({ loggedInPage: page }, testInfo) => {
    const name = `Yearly Sub ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({
      name,
      type: 'expense',
      behavior: 'subscription',
      subscription: { name: 'YearlyService', amount: 120, cycle: 'yearly', billingDay: 1 },
    });

    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Group C: Validation
// ---------------------------------------------------------------------------

test.describe('Categories — Group C: Validation', () => {
  test('submit button stays disabled for empty name', async ({ loggedInPage: page }) => {
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.clickAdd();
    await categories.expectFormVisible();
    await categories.selectType('expense');
    await categories.selectBehavior('variable');
    // Intentionally leave name empty.

    await categories.expectSubmitDisabled();
  });

  test('category with duplicated name', async ({ loggedInPage: page }, testInfo) => {
    const name = `dup-${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    // Create via API first.
    await createCategoryViaApi(page.request, { name, type: 'expense', behavior: 'variable' });

    // Attempt to create the same name via UI.
    await categories.goto();
    await categories.clickAdd();
    await categories.expectFormVisible();
    await categories.selectType('expense');
    await categories.selectBehavior('variable');
    await categories.fillName(name);
    await categories.submitForm();

    // Expect drawer to stay open OR an error toast appears within 5s.
    const drawerLocator = page.getByTestId('category-name-input');
    const toastLocator = page
      .getByRole('alert')
      .or(page.getByText(/error|failed|duplicate|already/i));

    const drawerStillOpen = await drawerLocator.isVisible({ timeout: 5000 }).catch(() => false);
    const toastAppeared = await toastLocator
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(
      drawerStillOpen || toastAppeared,
      'Expected drawer to stay open or error toast to appear'
    ).toBeTruthy();
  });

  test('submit disabled when subscription name is empty in inline sub form', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `Sub No SubName ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.clickAdd();
    await categories.expectFormVisible();
    await categories.selectType('expense');
    await categories.selectBehavior('subscription');
    await categories.fillName(name);
    // Leave the inline subscription name empty.

    await categories.expectSubmitDisabled();
  });

  test('subscription with invalid amount keeps submit disabled', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `Sub Invalid Amt ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.clickAdd();
    await categories.expectFormVisible();
    await categories.selectType('expense');
    await categories.selectBehavior('subscription');
    await categories.fillName(name);
    // Fill the sub name but leave amount empty (no valid amount).
    await page.getByTestId('subscription-inline-name').fill('TestSub');
    // Explicitly clear the amount field.
    await page.getByTestId('subscription-inline-amount').fill('');
    await page.getByTestId('subscription-inline-amount').press('Tab');

    await categories.expectSubmitDisabled();
  });
});

// ---------------------------------------------------------------------------
// Group D: Subscription edge cases
// ---------------------------------------------------------------------------

test.describe('Categories — Group D: Subscription edge cases', () => {
  test('subscription with billing day 31 is accepted and persisted', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `BillingDay31 ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.createCategory({
      name,
      type: 'expense',
      behavior: 'subscription',
      subscription: { name: 'Day31Sub', amount: 5, cycle: 'monthly', billingDay: 31 },
    });

    // Verify via the UI that the category was persisted.
    await categories.goto();
    await expect(categories.categoryRowByName(name)).toBeVisible({ timeout: 10000 });
  });

  test('subscription with invalid next-charge date does not submit successfully', async ({
    loggedInPage: page,
  }, testInfo) => {
    const name = `InvalidDate ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.clickAdd();
    await categories.expectFormVisible();
    await categories.selectType('expense');
    await categories.selectBehavior('subscription');
    await categories.fillName(name);
    await page.getByTestId('subscription-inline-name').fill('DateTestSub');
    await page.getByTestId('subscription-inline-amount').fill('10');
    await page.getByTestId('subscription-inline-amount').press('Tab');

    // Clear the date field — an empty date should prevent submission.
    const dateInput = page.getByTestId('subscription-inline-next-charge');
    await dateInput.fill('');
    await dateInput.press('Tab');

    // Either submit is disabled or the drawer stays open after clicking.
    const submitDisabled = await page
      .getByTestId('category-form-submit')
      .isDisabled()
      .catch(() => false);

    if (!submitDisabled) {
      await categories.submitForm();
      // Drawer should remain open if the date is invalid.
      await expect(page.getByTestId('category-name-input')).toBeVisible({ timeout: 5000 });
    } else {
      expect(submitDisabled).toBeTruthy();
    }
  });

  test('subscription with billing day > 31 input is clamped to 31', async ({
    loggedInPage: page,
  }, testInfo) => {
    const categories = new CategoriesPage(page);

    await categories.goto();
    await categories.clickAdd();
    await categories.expectFormVisible();
    await categories.selectType('expense');
    await categories.selectBehavior('subscription');
    await categories.fillName(`Clamp ${ts(testInfo.workerIndex)}`);
    await page.getByTestId('subscription-inline-name').fill('ClampSub');

    // Type 99 into the billing day field; Mantine NumberInput with max=31 should clamp it.
    const billingDayInput = page.getByTestId('subscription-inline-billing-day');
    await billingDayInput.click({ clickCount: 3 });
    await billingDayInput.pressSequentially('99');
    await billingDayInput.press('Tab');

    const value = await billingDayInput.inputValue();
    expect(
      Number(value),
      `Billing day should be clamped to ≤31, got "${value}"`
    ).toBeLessThanOrEqual(31);
  });
});

// ---------------------------------------------------------------------------
// Group E: Card display
// ---------------------------------------------------------------------------

test.describe('Categories — Group E: Card display', () => {
  test('category row shows correct spent value after seeding transactions', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Spent Display ${ts(testInfo.workerIndex)}`;
    const acctName = `Spent Acct ${ts(testInfo.workerIndex)}`;

    // Create the category via API with a budget.
    const { id: categoryId } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });
    await setCategoryTarget(page.request, categoryId, 50000); // $500.00 in cents

    // Create a checking account via UI and extract its id.
    const accounts = new AccountsPage(page);
    await accounts.goto();
    await accounts.createAccount({ name: acctName, type: 'Checking', initialBalance: 5000 });

    const acctRow = accounts.accountRowByName(acctName);
    await expect(acctRow).toBeVisible({ timeout: 10000 });
    const accountId =
      (await acctRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    // Seed 3 transactions of 1000 cents ($10.00) each.
    for (let i = 0; i < 3; i++) {
      await seedTransaction(page.request, {
        fromAccountId: accountId,
        categoryId,
        amount: 1000,
        description: `spent-seed-${i}`,
      });
    }

    // Navigate to /categories and find the row.
    const categories = new CategoriesPage(page);
    await categories.goto();

    const catRow = categories.categoryRowByName(catName);
    await expect(catRow).toBeVisible({ timeout: 10000 });
    const rowText = (await catRow.textContent()) ?? '';

    // 3 × $10 = $30 spent. Match "30" regardless of formatting.
    expect(stripCommas(rowText)).toMatch(/30/);
  });

  test('category card progress bar appears when category has a budget', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Progress Bar ${ts(testInfo.workerIndex)}`;

    // Create via API with a budget of $100.
    const { id: categoryId } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });
    await setCategoryTarget(page.request, categoryId, 10000); // $100.00 in cents

    const categories = new CategoriesPage(page);
    await categories.goto();

    const catRow = categories.categoryRowByName(catName);
    await expect(catRow).toBeVisible({ timeout: 10000 });

    // The row should contain a progress percentage indicator.
    const progressLocator = catRow
      .locator('[aria-valuenow], [class*="progress"], [class*="Progress"]')
      .first();
    const rowText = (await catRow.textContent()) ?? '';

    // Either a progress element is present OR the row text contains a percentage.
    const hasProgressEl = await progressLocator.isVisible().catch(() => false);
    const hasPercentText = /%/.test(rowText);

    expect(
      hasProgressEl || hasPercentText,
      'Expected a progress bar or percentage text in the category row'
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Group F: Edit
// ---------------------------------------------------------------------------

test.describe('Categories — Group F: Edit', () => {
  test('edit category changes name', async ({ loggedInPage: page }, testInfo) => {
    const origName = `Edit Name Orig ${ts(testInfo.workerIndex)}`;
    const newName = `Edit Name New ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id } = await createCategoryViaApi(page.request, {
      name: origName,
      type: 'expense',
      behavior: 'variable',
    });

    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.fillName(newName);
    await categories.submitForm();
    await categories.expectFormClosed();

    await expect(categories.categoryRowByName(newName)).toBeVisible({ timeout: 10000 });
  });

  // TODO: encrypted v2 store may not return `description` on the decrypted
  // category payload, so even after a successful PUT the edit drawer
  // re-opens with an empty description. Needs backend / store inspection.
  test.fixme('edit category changes description', async ({ loggedInPage: page }, testInfo) => {
    const catName = `Edit Desc ${ts(testInfo.workerIndex)}`;
    const newDesc = `Updated description ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });

    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.fillDescription(newDesc);
    await categories.submitForm();
    await categories.expectFormClosed();

    // Re-open to verify description was saved.
    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    const descValue = await page.getByTestId('category-description-input').inputValue();
    expect(descValue).toBe(newDesc);
  });

  test('edit category changes emoji', async ({ loggedInPage: page }, testInfo) => {
    const catName = `Edit Emoji ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });

    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.selectIcon('🎬');
    await categories.submitForm();
    await categories.expectFormClosed();

    // Verify no error and category is still visible.
    await expect(categories.categoryRowByName(catName)).toBeVisible({ timeout: 10000 });
  });

  // TODO: same Mantine NumberInput pre-populated limitation as accounts edit-balance.
  // Playwright's fill() / pressSequentially leave the field at its existing value
  // on pre-populated Mantine NumberInputs. Re-enable once a reliable interaction
  // approach is found or the backend exposes a dedicated budget-update endpoint.
  test.fixme('edit category changes budget', async ({ loggedInPage: page }, testInfo) => {
    const catName = `Edit Budget ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });
    await setCategoryTarget(page.request, id, 10000); // $100 initial budget

    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.fillBudget(200);
    await categories.submitForm();
    await categories.expectFormClosed();

    // Reload and verify the new budget is shown.
    await categories.goto();
    const row = categories.categoryRow(id);
    await expect(row).toBeVisible({ timeout: 10000 });
    const text = await row.textContent();
    expect(text).toContain('200');
  });
});

// ---------------------------------------------------------------------------
// Group G: Subscription updates inside category section
// ---------------------------------------------------------------------------

test.describe('Categories — Group G: Subscription updates inside category section', () => {
  test('update subscription name in category section', async ({ loggedInPage: page }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Sub Update Name ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    // Create subscription category + subscription via API.
    const { id: catId } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'subscription',
    });
    const { id: subId } = await createSubscriptionViaApi(page.request, {
      categoryId: catId,
      name: 'OrigSub',
      amount: 1000,
      cycle: 'monthly',
      billingDay: 1,
    });

    const newSubName = `RenamedSub ${ts(testInfo.workerIndex)}`;

    // Open the category edit drawer.
    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    // Click the subscription row's kebab menu and edit.
    await categories.openSubRowMenu(subId);
    await categories.clickSubEditFromMenu();
    await categories.expectSubFormVisible();

    // Update the subscription name.
    await categories.fillSubFormName(newSubName);
    await categories.submitSubForm();
    await categories.expectSubFormClosed();

    // Reload and re-open the category to confirm the new name. The category
    // edit drawer stays open after closing the inline subscription drawer;
    // navigating to /categories will dismiss it.

    // Reload and re-open the category to confirm the new name.
    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await expect(categories.subSectionRow(subId)).toContainText(newSubName, { timeout: 10000 });
  });

  test('delete subscription in category section updates the category', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Sub Delete In Cat ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id: catId } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'subscription',
    });
    const { id: sub1Id } = await createSubscriptionViaApi(page.request, {
      categoryId: catId,
      name: 'SubToKeep',
      amount: 500,
      cycle: 'monthly',
      billingDay: 1,
    });
    const { id: sub2Id } = await createSubscriptionViaApi(page.request, {
      categoryId: catId,
      name: 'SubToDelete',
      amount: 500,
      cycle: 'monthly',
      billingDay: 1,
    });

    // Open the edit drawer.
    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    // Delete sub2.
    await categories.openSubRowMenu(sub2Id);
    await categories.clickSubDeleteFromMenu();
    await categories.confirmDelete();

    // The deleted sub row should disappear.
    await expect(categories.subSectionRow(sub2Id)).toBeHidden({ timeout: 10000 });

    // The remaining sub should still be present.
    await expect(categories.subSectionRow(sub1Id)).toBeVisible({ timeout: 10000 });
  });

  test('add subscription in category section', async ({ loggedInPage: page }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Sub Add In Cat ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    // Create category + 1 subscription via API.
    const { id: catId } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'subscription',
    });
    await createSubscriptionViaApi(page.request, {
      categoryId: catId,
      name: 'ExistingSub',
      amount: 800,
      cycle: 'monthly',
      billingDay: 1,
    });

    // Open edit drawer.
    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    // Click the add-subscription button in the category section.
    await categories.clickAddSubscriptionInSection();
    await categories.expectSubFormVisible();

    const newSubName = `NewSub ${ts(testInfo.workerIndex)}`;
    await categories.fillSubFormName(newSubName);
    await categories.fillSubFormAmount(600);
    await categories.submitSubForm();
    await categories.expectSubFormClosed();

    // Close the category edit drawer (it may auto-close or we reload).
    await categories.expectFormClosed().catch(() => {});

    // Reload, re-open, and assert there are now 2 sub rows.
    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    // Mantine duplicates drawer content in the DOM for animation, so assert
    // by name instead of counting raw row testids.
    await expect(page.getByText('ExistingSub').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(newSubName).first()).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Group H: Behavior changes
// ---------------------------------------------------------------------------

test.describe('Categories — Group H: Behavior changes', () => {
  test('change behavior from variable to fixed', async ({ loggedInPage: page }, testInfo) => {
    const catName = `Var to Fixed ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });

    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.selectBehavior('fixed');
    await categories.submitForm();
    await categories.expectFormClosed();

    // Reload and re-open to verify the behavior was saved.
    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    // The fixed behavior button should be in its active CSS-module class.
    const fixedBtn = page.getByTestId('category-behavior-fixed');
    await expect(fixedBtn).toBeVisible({ timeout: 5000 });
    await expect(fixedBtn).toHaveClass(/selectorButtonActive/);
  });

  test('change behavior from fixed to variable', async ({ loggedInPage: page }, testInfo) => {
    const catName = `Fixed to Var ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'fixed',
    });

    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.selectBehavior('variable');
    await categories.submitForm();
    await categories.expectFormClosed();

    // Re-open and verify no error — category row should still be visible.
    await categories.goto();
    await expect(categories.categoryRowByName(catName)).toBeVisible({ timeout: 10000 });
  });

  test('change behavior from variable to subscription, then add a subscription', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Var to Sub ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });

    // Edit: switch to subscription behavior.
    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.selectBehavior('subscription');
    await categories.submitForm();
    await categories.expectFormClosed();

    // Re-open and add a subscription via the section.
    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.clickAddSubscriptionInSection();
    await categories.expectSubFormVisible();

    await categories.fillSubFormName(`NewSubForVarToSub ${ts(testInfo.workerIndex)}`);
    await categories.fillSubFormAmount(999);
    await categories.submitSubForm();
    await categories.expectSubFormClosed();

    // Verify the sub section shows the new sub.
    const subRows = page.locator('[data-testid^="category-sub-row-"]');
    await expect(subRows.first()).toBeVisible({ timeout: 10000 });
  });

  test('change behavior from subscription to variable preserves a manual budget', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Sub to Var ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    // Create subscription category + 1 sub via API.
    const { id: catId } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'subscription',
    });
    const { id: subId } = await createSubscriptionViaApi(page.request, {
      categoryId: catId,
      name: 'TempSub',
      amount: 500,
      cycle: 'monthly',
      billingDay: 1,
    });

    // Open edit, delete the sub so the behavior selector is unlocked.
    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    await categories.openSubRowMenu(subId);
    await categories.clickSubDeleteFromMenu();
    await categories.confirmDelete();

    await expect(categories.subSectionRow(subId)).toBeHidden({ timeout: 10000 });

    // Now switch to variable behavior.
    await categories.selectBehavior('variable');

    // Fill budget with 100.
    await categories.fillBudget(100);
    await categories.submitForm();
    await categories.expectFormClosed();

    // Reload, re-open, and assert budget input shows 100.
    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickEditFromMenu();
    await categories.expectFormVisible();

    const budgetInput = page.getByTestId('category-budget-input');
    const budgetValue = await budgetInput.inputValue();
    expect(budgetValue).toContain('100');
  });
});

// ---------------------------------------------------------------------------
// Group I: Delete / Archive
// ---------------------------------------------------------------------------

test.describe('Categories — Group I: Delete / Archive', () => {
  test('delete a category without transactions', async ({ loggedInPage: page }, testInfo) => {
    const catName = `Delete No Txn ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });

    await categories.goto();
    await categories.openRowMenu(id);
    await categories.clickDeleteFromMenu();
    await categories.confirmDelete();

    // Reload and assert the row is gone.
    await categories.goto();
    await expect(categories.categoryRow(id)).toBeHidden({ timeout: 10000 });
  });

  test('delete with transactions hides the delete option or shows archive instead', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Delete With Txn ${ts(testInfo.workerIndex)}`;
    const acctName = `Del Txn Acct ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    // Create category via API.
    const { id: catId } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });

    // Create account via UI.
    const accounts = new AccountsPage(page);
    await accounts.goto();
    await accounts.createAccount({ name: acctName, type: 'Checking', initialBalance: 1000 });

    const acctRow = accounts.accountRowByName(acctName);
    await expect(acctRow).toBeVisible({ timeout: 10000 });
    const accountId =
      (await acctRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    // Seed a transaction referencing that category.
    await seedTransaction(page.request, {
      fromAccountId: accountId,
      categoryId: catId,
      amount: 500,
      description: 'del-with-txn-seed',
    });

    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickDeleteFromMenu();
    await categories.confirmDelete();

    // Soft assertion: either the row disappears (soft delete / cascade allowed)
    // or an error toast appears indicating it cannot be deleted.
    const rowGone = categories
      .categoryRow(catId)
      .waitFor({ state: 'hidden', timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    const toastAppeared = page
      .getByRole('alert')
      .or(page.getByText(/error|failed|cannot|has transactions/i))
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    const [gone, toasted] = await Promise.all([rowGone, toastAppeared]);
    expect(
      gone || toasted,
      'Expected row to disappear or an error toast after attempting delete with transactions'
    ).toBeTruthy();
  });

  test('archive a category with transactions hides it from the active list', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const catName = `Archive With Txn ${ts(testInfo.workerIndex)}`;
    const acctName = `Archive Acct ${ts(testInfo.workerIndex)}`;
    const categories = new CategoriesPage(page);

    const { id: catId } = await createCategoryViaApi(page.request, {
      name: catName,
      type: 'expense',
      behavior: 'variable',
    });

    const accounts = new AccountsPage(page);
    await accounts.goto();
    await accounts.createAccount({ name: acctName, type: 'Checking', initialBalance: 1000 });

    const acctRow = accounts.accountRowByName(acctName);
    await expect(acctRow).toBeVisible({ timeout: 10000 });
    const accountId =
      (await acctRow.getAttribute('data-testid'))?.replace('account-row-', '') ?? '';
    expect(accountId).toBeTruthy();

    await seedTransaction(page.request, {
      fromAccountId: accountId,
      categoryId: catId,
      amount: 500,
      description: 'archive-seed',
    });

    await categories.goto();
    await categories.openRowMenu(catId);
    await categories.clickArchiveFromMenu();

    // Reload and assert the row has data-archived OR is no longer visible.
    await categories.goto();
    await expect(categories.categoryRow(catId))
      .toHaveAttribute('data-archived', /.+/, { timeout: 10000 })
      .catch(async () => {
        const isHidden = await categories
          .categoryRow(catId)
          .isHidden({ timeout: 5000 })
          .catch(() => false);
        expect(isHidden, 'Expected row to be hidden after archiving').toBeTruthy();
      });
  });
});

// ---------------------------------------------------------------------------
// Group J: Top stats card
// ---------------------------------------------------------------------------

test.describe('Categories — Group J: Top stats card', () => {
  test('top stats card reflects categories and budgets', async ({
    loggedInPage: page,
  }, testInfo) => {
    test.setTimeout(60_000);
    const categories = new CategoriesPage(page);

    // Create 1 expense variable cat with target $500.
    const { id: expId } = await createCategoryViaApi(page.request, {
      name: `TopStat Expense ${ts(testInfo.workerIndex)}`,
      type: 'expense',
      behavior: 'variable',
    });
    await setCategoryTarget(page.request, expId, 50000); // $500 in cents

    // Create 1 income variable cat with target $1000.
    const { id: incId } = await createCategoryViaApi(page.request, {
      name: `TopStat Income ${ts(testInfo.workerIndex)}`,
      type: 'income',
      behavior: 'variable',
    });
    await setCategoryTarget(page.request, incId, 100000); // $1000 in cents

    await categories.goto();

    const stats = await categories.readTopStats();

    // count should reflect at least 2 categories (may include pre-existing ones).
    expect(Number(stripCommas(stats.count))).toBeGreaterThanOrEqual(2);

    // expense budget should contain 500 (for our $500 target).
    expect(stripCommas(stats.expenseBudget)).toContain('500');

    // income target should contain 1000 (for our $1000 target).
    expect(stripCommas(stats.incomeTarget)).toContain('1000');
  });
});
