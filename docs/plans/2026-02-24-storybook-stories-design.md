# Storybook Stories — Design Document

**Date:** 2026-02-24
**Branch:** feat/accounts-overview-storybook
**Scope:** Comprehensive Storybook coverage for all pages and components

---

## Problem

All existing `.story.tsx` files were deleted. They lacked consistent standards — each file used different wrapper patterns, mock data, and story naming. The goal is a fresh, standardized suite of stories covering every page and component.

---

## Approach: B + C (Fresh Start, Prioritized Batches)

- **Fresh start**: All stories written from scratch to a single standard
- **Batched delivery**: 10 batches delivered and reviewed sequentially
- **Approach B**: Shared story utilities + centralized mock data

---

## Shared Infrastructure

### `src/stories/storyUtils.tsx`

Single shared file providing:

```tsx
// Standard decorator factory
createStoryDecorator(options?: {
  withBudgetProvider?: boolean;  // default true
  padding?: boolean;             // default true
}): Decorator

// MSW handler shorthand helpers
mswHandlers = {
  success: (path: string, data: unknown) => RequestHandler,
  error: (path: string, status?: number) => RequestHandler,
  loading: (path: string) => RequestHandler,
  empty: (path: string) => RequestHandler,
}
```

Every story file imports `createStoryDecorator` and `mswHandlers` from this file. No other wrapper patterns permitted.

### `src/mocks/budgetData.ts` (expanded)

Named mock exports for every entity, with multiple realistic variants:

- **Accounts**: checking, savings, credit card, allowance, archived, negative balance, with spend limit
- **Categories**: budgeted, unbudgeted, with/without targets, income, expense
- **Transactions**: income, expense, transfer, pending, with/without vendor/category
- **Vendors**: with/without logo, linked to categories
- **Periods**: active, past, future, no active period
- **Dashboard stats**: normal, zero, negative, extreme values

---

## Story File Conventions

| Convention | Rule |
|------------|------|
| Location | Co-located with component (`ComponentName.story.tsx`) |
| Title format | `Pages/Dashboard`, `Components/Accounts/AccountCard` |
| Tags | `['autodocs']` on all meta objects |
| Decorator | Always use `createStoryDecorator()` from `storyUtils.tsx` |
| Mock data | Always import from `src/mocks/budgetData.ts` |
| MSW handlers | Per-story `parameters.msw.handlers` using `mswHandlers.*` helpers |

### Standard Story Exports Per Component

| Export | Description |
|--------|-------------|
| `Default` | Populated happy path |
| `Loading` | MSW infinite delay on relevant endpoint(s) |
| `Error` | MSW 500 on relevant endpoint(s) |
| `Empty` | MSW returns `[]` or `null` |
| *(variants)* | Meaningful domain states (e.g. `WithSpendLimit`, `Archived`, `NegativeBalance`) |

### Page-Level Extras

| Export | Description |
|--------|-------------|
| `FullPage` | Full page, `layout: 'fullscreen'`, all data loaded |
| `FullPageLoading` | Full page, all endpoints delayed infinite |
| `FullPageError` | Full page, primary endpoint returns 500 |
| `FullPageEmpty` | Full page, all endpoints return empty |
| `FullPageLocked` | **Dashboard only** — no active budget period |

### Auth Pages

Auth pages (`LoginPage`, `ForgotPasswordPage`, etc.) do not use `BudgetProvider`. They use only `QueryClient` wrapper.

---

## Batch Plan

### Batch 1: Foundations
**Files:**
- `src/components/Utils/CurrencyValue.story.tsx`
- `src/components/Layout/Logo.story.tsx`
- `src/components/PulseIcon.story.tsx` (or alongside `PulseIcon.tsx`)
- `src/components/PulseLoader.story.tsx`
- `src/components/Utils/IconPicker.story.tsx`
- `src/components/ColorSchemeToggle/ColorSchemeToggle.story.tsx`
- `src/components/Layout/Navigation.story.tsx`
- `src/components/Layout/BottomNavigation.story.tsx`
- `src/components/Layout/UserMenu.story.tsx`
- `src/components/Layout/Sidebar.story.tsx`

Also creates `src/stories/storyUtils.tsx` and expands `src/mocks/budgetData.ts`.

### Batch 2: Auth
**Files:**
- `src/components/Auth/AuthCard.story.tsx`
- `src/components/Auth/AuthLayout.story.tsx`
- `src/components/Auth/PasswordStrengthIndicator.story.tsx`
- `src/components/Auth/LoginPage.story.tsx`
- `src/components/Auth/ForgotPasswordPage.story.tsx`
- `src/components/Auth/ResetPasswordPage.story.tsx`
- `src/components/Auth/RegisterPage.story.tsx`
- `src/components/Auth/Emergency2FADisablePage.story.tsx`

### Batch 3: Dashboard
**Files:**
- `src/components/Dashboard/LockedDashboardCard.story.tsx` (extracted from Dashboard.tsx)
- `src/components/Dashboard/StatCard.story.tsx`
- `src/components/Dashboard/CurrentPeriodCard.story.tsx`
- `src/components/Dashboard/NetPositionCard.story.tsx`
- `src/components/Dashboard/RemainingBudgetCard.story.tsx`
- `src/components/Dashboard/BudgetStabilityCard.story.tsx`
- `src/components/Dashboard/MonthProgressCard.story.tsx`
- `src/components/Dashboard/MonthlyBurnRate.story.tsx`
- `src/components/Dashboard/BalanceOverTimeChart.story.tsx`
- `src/components/Dashboard/CategoriesChartCard.story.tsx`
- `src/components/Dashboard/TopCategoriesChart.story.tsx`
- `src/components/Dashboard/RecentActivityTable.story.tsx`
- `src/components/Dashboard/ActiveOverlayBanner.story.tsx`
- `src/components/Dashboard/Dashboard.story.tsx` (full page, incl. Locked)

### Batch 4: Accounts
**Files:**
- `src/components/Accounts/StandardRangeBar.story.tsx`
- `src/components/Accounts/AllowanceRangeBar.story.tsx`
- `src/components/Accounts/BalanceHistoryChart.story.tsx`
- `src/components/Accounts/PeriodFlow.story.tsx`
- `src/components/Accounts/AccountDetailHeader.story.tsx`
- `src/components/Accounts/AccountContextSection.story.tsx`
- `src/components/Accounts/AccountsSummary.story.tsx`
- `src/components/Accounts/AccountCard.story.tsx`
- `src/components/Accounts/AccountsTable.story.tsx`
- `src/components/Accounts/CreateAccountForm.story.tsx`
- `src/components/Accounts/EditAccountForm.story.tsx`
- `src/components/Accounts/AccountsOverview.story.tsx` (full page)
- `src/components/Accounts/AccountsManagement.story.tsx` (full page)
- `src/components/Accounts/AccountDetailPage.story.tsx` (full page)

### Batch 5: Transactions
**Files:**
- `src/components/Transactions/Table/AccountBadge.story.tsx`
- `src/components/Transactions/Table/CategoryBadge.story.tsx`
- `src/components/Transactions/Table/ActionButtons.story.tsx`
- `src/components/Transactions/Table/TransactionsTable.story.tsx`
- `src/components/Transactions/Form/SuggestionChips.story.tsx`
- `src/components/Transactions/Form/TransactionFormFields.story.tsx`
- `src/components/Transactions/Form/QuickAddTransaction.story.tsx`
- `src/components/Transactions/Form/EditTransactionForm.story.tsx`
- `src/components/Transactions/List/MobileTransactionCard.story.tsx`
- `src/components/Transactions/Stats/TransactionStats.story.tsx`
- `src/components/Transactions/TransactionFilters.story.tsx`
- `src/components/Transactions/BatchEntryRow.story.tsx`
- `src/components/Transactions/PageHeader.story.tsx`
- `src/components/Transactions/Transactions.story.tsx` (full page)

### Batch 6: Categories
**Files:**
- `src/components/Categories/CategoryNameIcon.story.tsx`
- `src/components/Categories/CategoryStabilityDots.story.tsx`
- `src/components/Categories/CategoryCard.story.tsx`
- `src/components/Categories/BudgetedDiagnosticRow.story.tsx`
- `src/components/Categories/UnbudgetedDiagnosticList.story.tsx`
- `src/components/Categories/CategoryFormModal.story.tsx`
- `src/components/Categories/CategoriesTable.story.tsx`
- `src/components/Categories/CategoriesOverview.story.tsx` (full page)
- `src/components/Categories/CategoriesManagement.story.tsx` (full page)
- `src/components/Categories/CategoryDetailPage.story.tsx` (full page)

### Batch 7: Vendors
**Files:**
- `src/components/Vendors/VendorCard.story.tsx`
- `src/components/Vendors/VendorFormModal.story.tsx`
- `src/components/Vendors/VendorDeleteModal.story.tsx`
- `src/components/Vendors/Vendors.story.tsx` (full page)

### Batch 8: Category Targets
**Files:**
- `src/components/CategoryTargets/CategoryTargetRow.story.tsx`
- `src/components/CategoryTargets/CategoryTargetTable.story.tsx`
- `src/components/CategoryTargets/ExcludedCategoriesTable.story.tsx`
- `src/components/CategoryTargets/CategoryTargets.story.tsx` (full page)

### Batch 9: Settings
**Files:**
- `src/components/Settings/TwoFactorSetup.story.tsx`
- `src/components/Settings/SettingsPage.story.tsx` (full page)

### Batch 10: Budget & Periods
**Files:**
- `src/components/BudgetPeriodSelector/BudgetPeriodSelector.story.tsx`
- `src/components/Overlays/OverlayCard.story.tsx`
- `src/components/Overlays/OverlayFormModal.story.tsx`
- `src/components/Periods/PeriodCard.story.tsx`
- `src/components/Periods/PeriodFormModal.story.tsx`
- `src/components/Periods/ScheduleSettingsModal.story.tsx`

---

## Mock Data Strategy

All mock data lives in `src/mocks/budgetData.ts`. Stories must not define their own inline mock objects for domain entities — only for local UI state (e.g. form values, selected IDs).

### Naming Convention for Mock Exports

```ts
// Accounts
export const mockAccounts: AccountResponse[]          // all variants
export const mockCheckingAccount: AccountResponse
export const mockSavingsAccount: AccountResponse
export const mockCreditCardAccount: AccountResponse
export const mockAllowanceAccount: AccountResponse
export const mockArchivedAccount: AccountResponse

// Categories
export const mockCategories: CategoryResponse[]
export const mockBudgetedCategory: CategoryResponse
export const mockUnbudgetedCategory: CategoryResponse
export const mockIncomeCategory: CategoryResponse

// Transactions
export const mockTransactions: TransactionResponse[]
export const mockExpenseTransaction: TransactionResponse
export const mockIncomeTransaction: TransactionResponse
export const mockTransferTransaction: TransactionResponse

// Others
export const mockVendors: Vendor[]
export const mockPeriods: Period[]
export const mockDashboardStats: DashboardStats
```

---

## Success Criteria

- [ ] Every story file follows the exact same wrapper/decorator pattern
- [ ] Every component has at minimum: `Default`, `Loading`, `Error`, `Empty` stories
- [ ] No inline mock data for domain entities in story files
- [ ] All page stories use `layout: 'fullscreen'`
- [ ] Storybook builds with zero errors after each batch
- [ ] No story imports from deleted/non-existent files
