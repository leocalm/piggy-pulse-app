import { expect, type Locator, type Page } from 'playwright/test';

export type CategoryType = 'income' | 'expense';
export type CategoryBehavior = 'fixed' | 'variable' | 'subscription';

export interface InlineSubscriptionOpts {
  name: string;
  amount: number | string;
  cycle?: string;
  billingDay?: number | string;
  nextChargeDate?: string;
}

export interface CreateCategoryOpts {
  name: string;
  type: CategoryType;
  behavior?: CategoryBehavior;
  description?: string;
  icon?: string;
  budget?: number | string;
  subscription?: InlineSubscriptionOpts;
}

export interface TopStats {
  expenseBudget: string;
  incomeTarget: string;
  totalSpent: string;
  count: string;
  unbudgeted: string;
}

export class CategoriesPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/categories');
    await expect(this.page.getByTestId('categories-add-button')).toBeVisible({ timeout: 15000 });
  }

  async clickAdd(): Promise<void> {
    await this.page.getByTestId('categories-add-button').click();
  }

  async selectType(type: CategoryType): Promise<void> {
    await this.page.getByTestId(`category-type-${type}`).click();
  }

  async selectBehavior(behavior: CategoryBehavior): Promise<void> {
    await this.page.getByTestId(`category-behavior-${behavior}`).click();
  }

  async fillName(name: string): Promise<void> {
    await this.page.getByTestId('category-name-input').fill(name);
  }

  async fillDescription(desc: string): Promise<void> {
    await this.page.getByTestId('category-description-input').fill(desc);
  }

  async selectIcon(emoji: string): Promise<void> {
    await this.page.getByTestId('category-icon-grid').getByText(emoji).first().click();
  }

  async fillBudget(value: number | string): Promise<void> {
    await this.clearAndType(this.page.getByTestId('category-budget-input'), String(value));
  }

  private async clearAndType(input: Locator, value: string): Promise<void> {
    // Mantine NumberInput wraps react-number-format which intercepts user
    // input, so Locator.fill() / pressSequentially can be inconsistent on
    // pre-populated fields. Drive the native input setter + dispatch the
    // input event the way React's synthetic-event system expects.
    await input.evaluate((el: HTMLInputElement, val: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      setter?.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await input.press('Tab');
  }

  async submitForm(): Promise<void> {
    await this.page.getByTestId('category-form-submit').click();
  }

  async expectFormVisible(): Promise<void> {
    // Mantine Drawer keeps the root in the DOM and lazy-mounts its content,
    // so assert on a field inside the form instead of the root testid.
    await expect(this.page.getByTestId('category-name-input')).toBeVisible({ timeout: 10000 });
  }

  async expectFormClosed(): Promise<void> {
    await expect(this.page.getByTestId('category-name-input')).toBeHidden({ timeout: 15000 });
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.page.getByTestId('category-form-submit')).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.page.getByTestId('category-form-submit')).toBeEnabled();
  }

  async fillInlineSubscription(opts: InlineSubscriptionOpts): Promise<void> {
    await this.clearAndType(this.page.getByTestId('subscription-inline-name'), opts.name);
    await this.clearAndType(
      this.page.getByTestId('subscription-inline-amount'),
      String(opts.amount)
    );
    if (opts.cycle !== undefined) {
      await this.selectMantineOption(
        this.page.getByTestId('subscription-inline-cycle'),
        this.cycleLabel(opts.cycle)
      );
    }
    if (opts.billingDay !== undefined) {
      await this.clearAndType(
        this.page.getByTestId('subscription-inline-billing-day'),
        String(opts.billingDay)
      );
    }
    if (opts.nextChargeDate !== undefined) {
      await this.page.getByTestId('subscription-inline-next-charge').fill(opts.nextChargeDate);
    }
  }

  async createCategory(opts: CreateCategoryOpts): Promise<void> {
    await this.clickAdd();
    await this.expectFormVisible();

    await this.selectType(opts.type);

    if (opts.behavior !== undefined) {
      await this.selectBehavior(opts.behavior);
    }

    await this.fillName(opts.name);

    if (opts.description !== undefined) {
      await this.fillDescription(opts.description);
    }

    if (opts.icon !== undefined) {
      await this.selectIcon(opts.icon);
    }

    if (opts.budget !== undefined) {
      await this.fillBudget(opts.budget);
    }

    if (opts.subscription !== undefined && opts.behavior === 'subscription') {
      await this.fillInlineSubscription(opts.subscription);
    }

    await this.submitForm();
    await this.expectFormClosed();
  }

  categoryRow(id: string): Locator {
    return this.page.getByTestId(`category-row-${id}`);
  }

  categoryRowByName(name: string): Locator {
    return this.page.locator(`[data-testid^="category-row-"]:has-text("${name}")`).first();
  }

  async openRowMenu(id: string): Promise<void> {
    await this.page.getByTestId(`category-row-${id}-menu`).click();
  }

  async clickEditFromMenu(): Promise<void> {
    await this.page.getByTestId('category-menu-edit').click();
  }

  async clickArchiveFromMenu(): Promise<void> {
    await this.page.getByTestId('category-menu-archive').click();
  }

  async clickUnarchiveFromMenu(): Promise<void> {
    await this.page.getByTestId('category-menu-unarchive').click();
  }

  async clickDeleteFromMenu(): Promise<void> {
    await this.page.getByTestId('category-menu-delete').click();
  }

  async isDeleteMenuItemVisible(): Promise<boolean> {
    // Note: Playwright's isVisible() does NOT wait — its timeout arg is ignored.
    // Use waitFor to actually wait for the portal-rendered menu item to mount.
    return this.page
      .getByTestId('category-menu-delete')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }

  async isArchiveMenuItemVisible(): Promise<boolean> {
    return this.page
      .getByTestId('category-menu-archive')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }

  async isUnarchiveMenuItemVisible(): Promise<boolean> {
    return this.page
      .getByTestId('category-menu-unarchive')
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }

  async confirmDelete(): Promise<void> {
    // Mantine Modal lazy-mounts its content, so wait on the confirm button.
    await expect(this.page.getByTestId('confirm-delete-confirm')).toBeVisible({ timeout: 5000 });
    await this.page.getByTestId('confirm-delete-confirm').click();
    await expect(this.page.getByTestId('confirm-delete-confirm')).toBeHidden({ timeout: 10000 });
  }

  async cancelDelete(): Promise<void> {
    await this.page.getByTestId('confirm-delete-cancel').click();
  }

  async readRowText(id: string): Promise<string> {
    return (await this.categoryRow(id).textContent()) ?? '';
  }

  async readTopStats(): Promise<TopStats> {
    const read = async (testId: string): Promise<string> =>
      (await this.page.getByTestId(testId).textContent()) ?? '';

    return {
      expenseBudget: await read('categories-stat-expense-budget'),
      incomeTarget: await read('categories-stat-income-target'),
      totalSpent: await read('categories-stat-total-spent'),
      count: await read('categories-stat-count'),
      unbudgeted: await read('categories-stat-unbudgeted'),
    };
  }

  // ---------------------------------------------------------------------------
  // Subscription section helpers (only valid when editing a subscription category)
  // ---------------------------------------------------------------------------

  subSectionRow(subId: string): Locator {
    return this.page.getByTestId(`category-sub-row-${subId}`);
  }

  async openSubRowMenu(subId: string): Promise<void> {
    await this.page.getByTestId(`category-sub-row-${subId}-menu`).click();
  }

  async clickSubEditFromMenu(): Promise<void> {
    await this.page.getByTestId('category-sub-menu-edit').click();
  }

  async clickSubCancelFromMenu(): Promise<void> {
    await this.page.getByTestId('category-sub-menu-cancel').click();
  }

  async clickSubDeleteFromMenu(): Promise<void> {
    await this.page.getByTestId('category-sub-menu-delete').click();
  }

  async clickAddSubscriptionInSection(): Promise<void> {
    await this.page.getByTestId('category-sub-add-button').click();
  }

  // ---------------------------------------------------------------------------
  // SubscriptionFormDrawer helpers
  // ---------------------------------------------------------------------------

  async expectSubFormVisible(): Promise<void> {
    // Assert on an inner field to avoid lazy-mount false positives on the root.
    await expect(this.page.getByTestId('subscription-form-name')).toBeVisible({ timeout: 10000 });
  }

  async expectSubFormClosed(): Promise<void> {
    await expect(this.page.getByTestId('subscription-form-name')).toBeHidden({ timeout: 15000 });
  }

  async fillSubFormName(name: string): Promise<void> {
    await this.page.getByTestId('subscription-form-name').fill(name);
  }

  async fillSubFormAmount(amount: number | string): Promise<void> {
    await this.clearAndType(this.page.getByTestId('subscription-form-amount'), String(amount));
  }

  async selectSubFormCycle(cycle: 'monthly' | 'quarterly' | 'yearly'): Promise<void> {
    await this.selectMantineOption(
      this.page.getByTestId('subscription-form-cycle'),
      this.cycleLabel(cycle)
    );
  }

  async fillSubFormBillingDay(day: number | string): Promise<void> {
    await this.clearAndType(this.page.getByTestId('subscription-form-billing-day'), String(day));
  }

  async fillSubFormNextCharge(date: string): Promise<void> {
    await this.page.getByTestId('subscription-form-next-charge').fill(date);
  }

  async selectSubFormVendor(name: string): Promise<void> {
    // Mantine Select — click the input to open the dropdown, then pick the option.
    const input = this.page.getByTestId('subscription-form-vendor');
    await input.click();
    await this.page.getByRole('option', { name }).click();
  }

  async submitSubForm(): Promise<void> {
    await this.page.getByTestId('subscription-form-submit').click();
  }

  private async selectMantineOption(input: Locator, optionLabel: string): Promise<void> {
    // Mantine v8 Select is a combobox-style input. Click to open, then click
    // the matching option in the portal-rendered listbox.
    await input.click();
    await this.page.getByRole('option', { name: optionLabel }).first().click();
  }

  private cycleLabel(cycle: 'monthly' | 'quarterly' | 'yearly'): string {
    // i18n key v2:subscriptions.form.cycles.* — these are the visible labels.
    return cycle === 'monthly' ? 'Monthly' : cycle === 'quarterly' ? 'Quarterly' : 'Yearly';
  }
}
