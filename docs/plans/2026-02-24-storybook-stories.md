# Storybook Stories — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a comprehensive, standardized suite of Storybook stories for every page and component in PiggyPulse, delivered in 10 sequential batches.

**Architecture:** Shared infrastructure in `src/stories/storyUtils.tsx` provides a standard decorator factory (QueryClient + BudgetProvider) and MSW handler helpers. All mock domain data lives exclusively in `src/mocks/budgetData.ts`. Each `.story.tsx` file is co-located with its component and imports only from these two shared locations.

**Tech Stack:** Storybook 8, MSW + msw-storybook-addon, React Query v5, Mantine v8, React Router v6, TypeScript

---

## Prerequisites

Before starting any batch, run:
```bash
yarn storybook --ci --smoke-test
```
Storybook must build with zero errors on the current branch before you touch anything.

After **every batch**, verify with:
```bash
yarn storybook --ci --smoke-test
```
Fix any errors before moving to the next batch.

---

## Task 0: Shared Infrastructure

**Files:**
- Create: `src/stories/storyUtils.tsx`
- Modify: `src/mocks/budgetData.ts`

### Step 1: Create `src/stories/storyUtils.tsx`

```tsx
import React, { ReactNode } from 'react';
import { Decorator } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse, delay } from 'msw';
import { BudgetProvider } from '@/context/BudgetContext';
import { Box } from '@mantine/core';

interface StoryDecoratorOptions {
  /** Include BudgetProvider (period selection context). Default: true */
  withBudgetProvider?: boolean;
  /** Wrap story in a padded Box. Default: true */
  padding?: boolean;
}

/**
 * Standard story decorator factory.
 * Always provides a fresh QueryClient and optionally BudgetProvider.
 *
 * Usage in meta:
 *   decorators: [createStoryDecorator()],
 *
 * Usage without BudgetProvider (e.g. Auth pages):
 *   decorators: [createStoryDecorator({ withBudgetProvider: false })],
 */
export const createStoryDecorator = (options: StoryDecoratorOptions = {}): Decorator => {
  const { withBudgetProvider = true, padding = true } = options;

  return (Story) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    const content = withBudgetProvider ? (
      <QueryClientProvider client={queryClient}>
        <BudgetProvider>
          {padding ? <Box p="xl"><Story /></Box> : <Story />}
        </BudgetProvider>
      </QueryClientProvider>
    ) : (
      <QueryClientProvider client={queryClient}>
        {padding ? <Box p="xl"><Story /></Box> : <Story />}
      </QueryClientProvider>
    );

    return content;
  };
};

/**
 * MSW handler shorthand helpers.
 * Use these in story parameters.msw.handlers to override specific endpoints.
 *
 * Example:
 *   parameters: {
 *     msw: {
 *       handlers: [mswHandlers.loading('/api/v1/accounts')],
 *     },
 *   },
 */
export const mswHandlers = {
  /** Returns data as JSON with a short realistic delay */
  success: (path: string, data: unknown, delayMs = 300) =>
    http.get(path, async () => {
      await delay(delayMs);
      return HttpResponse.json(data);
    }),

  /** Returns HTTP 500 to simulate a server error */
  error: (path: string, status = 500) =>
    http.get(path, () => new HttpResponse(null, { status })),

  /** Delays forever — shows loading state indefinitely */
  loading: (path: string) =>
    http.get(path, async () => {
      await delay('infinite');
      return HttpResponse.json(null);
    }),

  /** Returns an empty array */
  empty: (path: string) =>
    http.get(path, () => HttpResponse.json([])),

  /** Returns null (for single-resource endpoints) */
  emptyNull: (path: string) =>
    http.get(path, () => HttpResponse.json(null)),
};
```

### Step 2: Expand `src/mocks/budgetData.ts`

Append the following named exports to the **end** of the existing file. Do not remove or rename any existing exports — `handlers.ts` depends on them.

```ts
import { AccountManagementResponse, AccountContext, AccountDetail } from '@/types/account';
import { CategoryWithStats, BudgetedCategoryDiagnostic, UnbudgetedCategoryDiagnostic, CategoryManagementRow, CategoriesManagementListResponse } from '@/types/category';
import { VendorWithStats } from '@/types/vendor';
import { MonthlyBurnIn, MonthProgress, NetPosition, BudgetStability, SpentPerCategory } from '@/types/dashboard';
import { CategoryTargetsResponse } from '@/types/categoryTarget';

// ─── SHARED CURRENCY ────────────────────────────────────────────────────────

export const euroCurrency = {
  id: 'cur-1',
  name: 'Euro',
  symbol: '€',
  currency: 'EUR',
  decimalPlaces: 2,
};

export const usdCurrency = {
  id: 'cur-2',
  name: 'US Dollar',
  symbol: '$',
  currency: 'USD',
  decimalPlaces: 2,
};

// ─── NAMED ACCOUNT VARIANTS ──────────────────────────────────────────────────

export const mockCheckingAccount = mockAccounts[0];   // 'acc-1' Main Checking
export const mockSavingsAccount = mockAccounts[1];    // 'acc-2' Emergency Fund
export const mockCreditCardAccount = mockAccounts[2]; // 'acc-3' Credit Card
export const mockAllowanceAccount = mockAccounts[3];  // 'acc-4' Pocket Money
export const mockWalletAccount = mockAccounts[4];     // 'acc-5' Cash Wallet

export const mockArchivedAccount = {
  ...mockCheckingAccount,
  id: 'acc-archived',
  name: 'Old Bank Account',
  isArchived: true,
  balance: 0,
  transactionCount: 0,
};

export const mockAccountWithSpendLimit = {
  ...mockCheckingAccount,
  id: 'acc-spend-limit',
  name: 'Daily Spending',
  color: 'orange',
  spendLimit: 50000, // €500 limit
  balance: 32000,   // €320 remaining
};

export const mockAccountManagementList: AccountManagementResponse[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    accountType: 'Checking',
    color: 'blue',
    icon: 'wallet',
    currency: euroCurrency,
    balance: 145000,
    spendLimit: undefined,
    isArchived: false,
    nextTransferAmount: undefined,
    transactionCount: 23,
    canDelete: false,
    canAdjustBalance: true,
  },
  {
    id: 'acc-2',
    name: 'Emergency Fund',
    accountType: 'Savings',
    color: 'teal',
    icon: 'pig',
    currency: euroCurrency,
    balance: 500000,
    spendLimit: undefined,
    isArchived: false,
    nextTransferAmount: undefined,
    transactionCount: 2,
    canDelete: false,
    canAdjustBalance: true,
  },
  {
    id: 'acc-3',
    name: 'Credit Card',
    accountType: 'CreditCard',
    color: 'red',
    icon: 'creditCard',
    currency: euroCurrency,
    balance: -75000,
    spendLimit: undefined,
    isArchived: false,
    nextTransferAmount: undefined,
    transactionCount: 15,
    canDelete: false,
    canAdjustBalance: false,
  },
  {
    id: 'acc-archived',
    name: 'Old Bank Account',
    accountType: 'Checking',
    color: 'gray',
    icon: 'wallet',
    currency: euroCurrency,
    balance: 0,
    spendLimit: undefined,
    isArchived: true,
    nextTransferAmount: undefined,
    transactionCount: 0,
    canDelete: true,
    canAdjustBalance: false,
  },
];

export const mockAccountDetail: AccountDetail = {
  balance: 145000,
  balanceChange: 5000,
  inflows: 250000,
  outflows: 245000,
  net: 5000,
  periodStart: '2026-01-01',
  periodEnd: '2026-01-31',
};

export const mockAccountContext: AccountContext = {
  categoryImpact: [
    { categoryName: 'Food', amount: 45000, percentage: 4500 },
    { categoryName: 'Transport', amount: 25000, percentage: 2500 },
    { categoryName: 'Entertainment', amount: 15000, percentage: 1500 },
    { categoryName: 'Utilities', amount: 10000, percentage: 1000 },
    { categoryName: 'Other', amount: 5000, percentage: 500 },
  ],
  stability: {
    periodsClosedPositive: 10,
    periodsEvaluated: 12,
    avgClosingBalance: 135000,
    highestClosingBalance: 185000,
    lowestClosingBalance: 82000,
    largestSingleOutflow: 95000,
    largestSingleOutflowCategory: 'Rent',
  },
};

export const mockBalanceHistory = [
  { date: '2025-08-01', balance: 95000 },
  { date: '2025-09-01', balance: 108000 },
  { date: '2025-10-01', balance: 121000 },
  { date: '2025-11-01', balance: 115000 },
  { date: '2025-12-01', balance: 138000 },
  { date: '2026-01-01', balance: 140000 },
  { date: '2026-01-10', balance: 145000 },
];

// ─── NAMED CATEGORY VARIANTS ─────────────────────────────────────────────────

export const mockOutgoingCategory = mockCategories[0];  // Food
export const mockIncomingCategory = mockCategories[1];  // Salary
export const mockTransferCategory = mockCategories[2];  // Transfer

export const mockArchivedCategory = {
  ...mockOutgoingCategory,
  id: 'cat-archived',
  name: 'Old Expenses',
  isArchived: true,
};

export const mockCategoryWithStats: CategoryWithStats[] = [
  {
    ...mockOutgoingCategory,
    usedInPeriod: 42000,
    differenceVsAveragePercentage: -12,
    transactionCount: 8,
  },
  {
    ...mockIncomingCategory,
    usedInPeriod: 250000,
    differenceVsAveragePercentage: 0,
    transactionCount: 1,
  },
  {
    id: 'cat-out-2',
    name: 'Transport',
    icon: 'car',
    categoryType: 'Outgoing',
    color: '#4dabf7',
    parentId: null,
    isArchived: false,
    description: 'Daily commute and travel',
    usedInPeriod: 18500,
    differenceVsAveragePercentage: 23,
    transactionCount: 12,
  },
  {
    id: 'cat-out-3',
    name: 'Entertainment',
    icon: 'device-tv',
    categoryType: 'Outgoing',
    color: '#f783ac',
    parentId: null,
    isArchived: false,
    description: null,
    usedInPeriod: 9800,
    differenceVsAveragePercentage: -5,
    transactionCount: 4,
  },
];

export const mockBudgetedDiagnosticRows: BudgetedCategoryDiagnostic[] = [
  {
    id: 'cat-out-1',
    name: 'Food',
    color: '#ff6b9d',
    icon: 'cart',
    parentId: null,
    categoryType: 'Outgoing',
    isArchived: false,
    description: null,
    budgetedValue: 50000,
    actualValue: 42000,
    varianceValue: -8000,
    progressBasisPoints: 8400,
    recentClosedPeriods: [
      { periodId: 'p1', isOutsideTolerance: false },
      { periodId: 'p2', isOutsideTolerance: true },
      { periodId: 'p3', isOutsideTolerance: false },
    ],
  },
  {
    id: 'cat-out-2',
    name: 'Transport',
    color: '#4dabf7',
    icon: 'car',
    parentId: null,
    categoryType: 'Outgoing',
    isArchived: false,
    description: null,
    budgetedValue: 20000,
    actualValue: 18500,
    varianceValue: -1500,
    progressBasisPoints: 9250,
    recentClosedPeriods: [
      { periodId: 'p1', isOutsideTolerance: false },
      { periodId: 'p2', isOutsideTolerance: false },
      { periodId: 'p3', isOutsideTolerance: true },
    ],
  },
];

export const mockUnbudgetedDiagnosticRows: UnbudgetedCategoryDiagnostic[] = [
  {
    id: 'cat-out-3',
    name: 'Entertainment',
    color: '#f783ac',
    icon: 'device-tv',
    parentId: null,
    categoryType: 'Outgoing',
    isArchived: false,
    description: null,
    actualValue: 9800,
    shareOfTotalBasisPoints: 1200,
  },
];

export const mockCategoriesManagement: CategoriesManagementListResponse = {
  incoming: [
    {
      id: 'cat-in-1',
      name: 'Salary',
      icon: 'cash',
      categoryType: 'Incoming',
      color: '#00ffa3',
      parentId: null,
      isArchived: false,
      description: null,
      globalTransactionCount: 24,
      activeChildrenCount: 0,
    },
  ],
  outgoing: [
    {
      id: 'cat-out-1',
      name: 'Food',
      icon: 'cart',
      categoryType: 'Outgoing',
      color: '#ff6b9d',
      parentId: null,
      isArchived: false,
      description: null,
      globalTransactionCount: 120,
      activeChildrenCount: 2,
    },
    {
      id: 'cat-out-2',
      name: 'Transport',
      icon: 'car',
      categoryType: 'Outgoing',
      color: '#4dabf7',
      parentId: null,
      isArchived: false,
      description: 'Daily commute and travel',
      globalTransactionCount: 45,
      activeChildrenCount: 0,
    },
  ],
  archived: [
    {
      id: 'cat-archived',
      name: 'Old Expenses',
      icon: 'archive',
      categoryType: 'Outgoing',
      color: '#868e96',
      parentId: null,
      isArchived: true,
      description: null,
      globalTransactionCount: 12,
      activeChildrenCount: 0,
    },
  ],
};

// ─── NAMED TRANSACTION VARIANTS ──────────────────────────────────────────────

export const mockExpenseTransaction = initialTransactions[0];   // Groceries
export const mockIncomeTransaction = initialTransactions[1];    // January Salary
export const mockTransferTransaction = initialTransactions[2];  // Move to savings

// ─── NAMED VENDOR VARIANTS ───────────────────────────────────────────────────

export const mockVendorsWithStats: VendorWithStats[] = [
  {
    id: 'ven-1',
    name: 'Supermarket',
    description: 'Weekly grocery shopping',
    archived: false,
    transactionCount: 24,
    lastUsedAt: '2026-01-10',
  },
  {
    id: 'ven-2',
    name: 'Coffee Shop',
    description: undefined,
    archived: false,
    transactionCount: 8,
    lastUsedAt: '2026-01-12',
  },
  {
    id: 'ven-3',
    name: 'Gas Station',
    description: 'Fuel and car products',
    archived: false,
    transactionCount: 6,
    lastUsedAt: '2026-01-09',
  },
  {
    id: 'ven-archived',
    name: 'Old Store',
    description: undefined,
    archived: true,
    transactionCount: 2,
    lastUsedAt: '2025-06-01',
  },
];

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const mockMonthlyBurnIn: MonthlyBurnIn = {
  totalBudget: 200000,    // €2,000 budget
  spentBudget: 85000,     // €850 spent
  currentDay: 15,
  daysInPeriod: 30,
};

export const mockMonthProgress: MonthProgress = {
  currentDate: '2026-01-15',
  daysInPeriod: 31,
  remainingDays: 16,
  daysPassedPercentage: 48,
};

export const mockNetPosition: NetPosition = {
  totalNetPosition: 603500,
  changeThisPeriod: 19000,
  liquidBalance: 178500,
  protectedBalance: 500000,
  debtBalance: -75000,
  accountCount: 5,
};

export const mockBudgetStability: BudgetStability = {
  withinTolerancePercentage: 78,
  periodsWithinTolerance: 18,
  totalClosedPeriods: 23,
  recentClosedPeriods: [
    { periodId: 'p1', isOutsideTolerance: false },
    { periodId: 'p2', isOutsideTolerance: true },
    { periodId: 'p3', isOutsideTolerance: false },
    { periodId: 'p4', isOutsideTolerance: true },
    { periodId: 'p5', isOutsideTolerance: false },
    { periodId: 'p6', isOutsideTolerance: false },
  ],
};

export const mockSpentPerCategory: SpentPerCategory[] = [
  { categoryName: 'Food', budgetedValue: 50000, amountSpent: 42000, percentageSpent: 84 },
  { categoryName: 'Transport', budgetedValue: 20000, amountSpent: 18500, percentageSpent: 92 },
  { categoryName: 'Entertainment', budgetedValue: 15000, amountSpent: 9800, percentageSpent: 65 },
  { categoryName: 'Utilities', budgetedValue: 12000, amountSpent: 11200, percentageSpent: 93 },
  { categoryName: 'Health', budgetedValue: 10000, amountSpent: 3500, percentageSpent: 35 },
];

export const mockBudgetPerDay = [
  { accountName: 'Main Checking', date: '2026-01-01', balance: 140000 },
  { accountName: 'Main Checking', date: '2026-01-05', balance: 137000 },
  { accountName: 'Main Checking', date: '2026-01-10', balance: 145000 },
  { accountName: 'Main Checking', date: '2026-01-15', balance: 141000 },
];

// ─── CATEGORY TARGETS ────────────────────────────────────────────────────────

export const mockCategoryTargets: CategoryTargetsResponse = {
  periodId: 'per-1',
  periodName: 'January 2026',
  periodStartDate: '2026-01-01',
  periodEndDate: '2026-01-31',
  periodProgressPercent: 48,
  totalTargeted: 200000,
  totalCategories: 8,
  targetedCategories: 5,
  outgoingTargets: [
    {
      id: 'ct-1',
      categoryId: 'cat-out-1',
      categoryName: 'Food',
      categoryType: 'Outgoing',
      categoryIcon: 'cart',
      categoryColor: '#ff6b9d',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: 50000,
      previousTarget: 48000,
      isExcluded: false,
      exclusionReason: null,
      projectedVarianceBasisPoints: -500,
    },
    {
      id: 'ct-2',
      categoryId: 'cat-out-2',
      categoryName: 'Transport',
      categoryType: 'Outgoing',
      categoryIcon: 'car',
      categoryColor: '#4dabf7',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: 20000,
      previousTarget: 20000,
      isExcluded: false,
      exclusionReason: null,
      projectedVarianceBasisPoints: 200,
    },
    {
      id: 'ct-3',
      categoryId: 'cat-out-3',
      categoryName: 'Entertainment',
      categoryType: 'Outgoing',
      categoryIcon: 'device-tv',
      categoryColor: '#f783ac',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: null,
      previousTarget: 15000,
      isExcluded: false,
      exclusionReason: null,
      projectedVarianceBasisPoints: null,
    },
  ],
  incomingTargets: [
    {
      id: 'ct-4',
      categoryId: 'cat-in-1',
      categoryName: 'Salary',
      categoryType: 'Incoming',
      categoryIcon: 'cash',
      categoryColor: '#00ffa3',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: 250000,
      previousTarget: 250000,
      isExcluded: false,
      exclusionReason: null,
      projectedVarianceBasisPoints: 0,
    },
  ],
  excludedCategories: [
    {
      id: 'ct-5',
      categoryId: 'cat-tr-1',
      categoryName: 'Transfer',
      categoryType: 'Transfer',
      categoryIcon: 'repeat',
      categoryColor: '#00d4ff',
      isArchived: false,
      isParent: false,
      parentCategoryName: null,
      currentTarget: null,
      previousTarget: null,
      isExcluded: true,
      exclusionReason: 'Transfer categories are excluded from budget targets',
      projectedVarianceBasisPoints: null,
    },
  ],
};
```

### Step 3: Verify TypeScript compiles

```bash
yarn tsc --noEmit
```
Expected: no errors (or only pre-existing errors unrelated to new files).

### Step 4: Commit

```bash
git add src/stories/storyUtils.tsx src/mocks/budgetData.ts
git commit -m "feat(storybook): add shared story utilities and expand mock data"
```

---

## Task 1: Batch 1 — Foundations

**Context:** These are primitive UI components with no API calls. They use props directly (no MSW needed), so stories use `args` rather than MSW handlers. The `createStoryDecorator({ withBudgetProvider: false, padding: true })` is used since none of these components require BudgetProvider.

**Files to create:**
- `src/components/Utils/CurrencyValue.story.tsx`
- `src/components/Layout/Logo.story.tsx`
- `src/components/PulseIcon.story.tsx`
- `src/components/PulseLoader.story.tsx`
- `src/components/Utils/IconPicker.story.tsx`
- `src/components/ColorSchemeToggle/ColorSchemeToggle.story.tsx`
- `src/components/Layout/Navigation.story.tsx`
- `src/components/Layout/BottomNavigation.story.tsx`
- `src/components/Layout/UserMenu.story.tsx`
- `src/components/Layout/Sidebar.story.tsx`

### Step 1: Read relevant component files

Before writing each story, read the component to understand its props:
- `src/components/Utils/CurrencyValue.tsx` — props: `currency`, `cents`, `showSymbol?`, `currencySymbol?`
- `src/components/Layout/Logo.tsx`
- `src/components/PulseIcon.tsx`
- `src/components/PulseLoader.tsx`
- `src/components/Utils/IconPicker.tsx`
- `src/components/ColorSchemeToggle/ColorSchemeToggle.tsx`
- `src/components/Layout/Navigation.tsx`
- `src/components/Layout/BottomNavigation.tsx`
- `src/components/Layout/UserMenu.tsx`
- `src/components/Layout/Sidebar.tsx`

Use Serena's `find_symbol` with `include_body: false` to read the interface/props of each component.

### Step 2: Write `src/components/Utils/CurrencyValue.story.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { euroCurrency, usdCurrency } from '@/mocks/budgetData';
import { CurrencyValue } from './CurrencyValue';

const meta: Meta<typeof CurrencyValue> = {
  title: 'Components/Utils/CurrencyValue',
  component: CurrencyValue,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof CurrencyValue>;

export const Euro: Story = {
  args: { currency: euroCurrency, cents: 150000 },
};

export const Dollar: Story = {
  args: { currency: usdCurrency, cents: 250050 },
};

export const NegativeBalance: Story = {
  args: { currency: euroCurrency, cents: -75000 },
};

export const Zero: Story = {
  args: { currency: euroCurrency, cents: 0 },
};

export const LargeAmount: Story = {
  args: { currency: euroCurrency, cents: 1250099 },
};

export const NoCurrency: Story = {
  args: { currency: undefined, cents: 9999 },
};

export const WithoutSymbol: Story = {
  args: { currency: euroCurrency, cents: 50000, showSymbol: false },
};
```

### Step 3: Write stories for Logo, PulseIcon, PulseLoader

For each component, follow this template — reading the component source first to understand actual props:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/Layout/ComponentName',  // adjust path
  component: ComponentName,
  tags: ['autodocs'],
  decorators: [createStoryDecorator({ withBudgetProvider: false })],
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {};
// Add size/variant stories based on actual props found in component
```

### Step 4: Write `src/components/Utils/IconPicker.story.tsx`

IconPicker likely has a controlled `value`/`onChange` and possibly an `onClose`. Read the component and provide:
- `Default` — with a pre-selected icon
- `NoSelection` — with no initial value
- Interactive story using `args` + `argTypes: { onChange: { action: 'icon-changed' } }`

### Step 5: Write Navigation, BottomNavigation, UserMenu, Sidebar stories

These components likely use React Router (`useNavigate`, `useLocation`, `Link`). The global Storybook preview already wraps stories in `MemoryRouter`. Provide:
- `Default` — normal state
- `ActiveRoute` — use Storybook `parameters.reactRouter` or pass an `initialEntries` prop if supported

Read each component's props before writing.

For `UserMenu` and `Sidebar`, MSW handler for `/api/v1/users/me` is already in `handlers.ts` (global), so these should render without extra MSW setup.

### Step 6: Run Storybook smoke test

```bash
yarn storybook --ci --smoke-test
```
Expected: exits with code 0, no build errors.

### Step 7: Commit

```bash
git add src/components/Utils/CurrencyValue.story.tsx \
        src/components/Layout/Logo.story.tsx \
        src/components/PulseIcon.story.tsx \
        src/components/PulseLoader.story.tsx \
        src/components/Utils/IconPicker.story.tsx \
        src/components/ColorSchemeToggle/ColorSchemeToggle.story.tsx \
        src/components/Layout/Navigation.story.tsx \
        src/components/Layout/BottomNavigation.story.tsx \
        src/components/Layout/UserMenu.story.tsx \
        src/components/Layout/Sidebar.story.tsx
git commit -m "feat(storybook): add Batch 1 — foundation component stories"
```

---

## Task 2: Batch 2 — Auth

**Context:** Auth components do not need `BudgetProvider`. Use `createStoryDecorator({ withBudgetProvider: false, padding: false })` for full-page Auth layouts. MSW handlers for `/api/v1/users/me`, `/api/v1/auth/login`, `/api/v1/auth/logout` etc. are in `handlers.ts` globally; add per-story handlers only to override for error/loading scenarios.

**Files to create:**
- `src/components/Auth/AuthCard.story.tsx`
- `src/components/Auth/AuthLayout.story.tsx`
- `src/components/Auth/PasswordStrengthIndicator.story.tsx`
- `src/components/Auth/LoginPage.story.tsx`
- `src/components/Auth/ForgotPasswordPage.story.tsx`
- `src/components/Auth/ResetPasswordPage.story.tsx`
- `src/components/Auth/RegisterPage.story.tsx`
- `src/components/Auth/Emergency2FADisablePage.story.tsx`

### Step 1: Read component sources

Read these to understand props and API endpoints used:
- `src/components/Auth/AuthCard.tsx`
- `src/components/Auth/AuthLayout.tsx`
- `src/components/Auth/PasswordStrengthIndicator.tsx`
- `src/components/Auth/LoginPage.tsx`
- `src/components/Auth/ForgotPasswordPage.tsx`
- `src/components/Auth/ResetPasswordPage.tsx`
- `src/components/Auth/RegisterPage.tsx`
- `src/components/Auth/Emergency2FADisablePage.tsx`

Use Serena `find_symbol` with `include_body: false` first to get the component interface, then `include_body: true` only for the main component to see which API routes it calls.

### Step 2: Write stories following this pattern

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { createStoryDecorator } from '@/stories/storyUtils';
import { LoginPage } from './LoginPage';

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/Auth/Login',
  component: LoginPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ withBudgetProvider: false, padding: false })],
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};

export const LoginError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/v1/auth/login', () =>
          HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 })
        ),
      ],
    },
  },
};

export const LoginLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/v1/auth/login', async () => {
          await new Promise(() => {}); // infinite
        }),
      ],
    },
  },
};
```

For `PasswordStrengthIndicator`, it's a pure UI component — use `args` with different password strength values.

For page-level components, add:
- `Default` — blank form, ready to fill
- `SubmitError` / `LoginError` — API returns 401/400
- `SubmitLoading` — API hangs
- Any other meaningful states (e.g. `TwoFactorRequired` if login returns a 2FA challenge)

### Step 3: Run Storybook smoke test

```bash
yarn storybook --ci --smoke-test
```

### Step 4: Commit

```bash
git add src/components/Auth/*.story.tsx
git commit -m "feat(storybook): add Batch 2 — auth page stories"
```

---

## Task 3: Batch 3 — Dashboard

**Context:** Dashboard components require `BudgetProvider`. Most are data-driven via React Query + MSW. The "locked" state is triggered by the `/api/v1/budget_period/current` endpoint returning 404.

Key API endpoints used by Dashboard:
- `GET /api/v1/budget_period/current` — returns current period (or 404 for locked state)
- `GET /api/v1/dashboard/monthly-burn-in?periodId=...`
- `GET /api/v1/dashboard/month-progress?periodId=...`
- `GET /api/v1/dashboard/net-position?periodId=...`
- `GET /api/v1/dashboard/budget-stability`
- `GET /api/v1/dashboard/recent-transactions`
- `GET /api/v1/dashboard/spent-per-category`
- `GET /api/v1/dashboard/budget-per-day`
- `GET /api/v1/dashboard/total-assets`

**Files to create:**
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
- `src/components/Dashboard/Dashboard.story.tsx`

### Step 1: Read component sources

For each component, use Serena to read the interface first, then the body to understand which API calls it makes. Key: `Dashboard.tsx` is already read — it uses `useCurrentBudgetPeriod`, `useMonthlyBurnIn`, `useMonthProgress`, `useNetPosition`, `useBudgetStability`.

Read:
- `src/components/Dashboard/StatCard.tsx` — likely pure props
- `src/components/Dashboard/NetPositionCard.tsx`
- `src/components/Dashboard/RemainingBudgetCard.tsx`
- `src/components/Dashboard/BudgetStabilityCard.tsx`
- `src/components/Dashboard/MonthProgressCard.tsx`
- `src/components/Dashboard/MonthlyBurnRate.tsx`
- `src/components/Dashboard/BalanceOverTimeChart.tsx`
- `src/components/Dashboard/CategoriesChartCard.tsx`
- `src/components/Dashboard/TopCategoriesChart.tsx`
- `src/components/Dashboard/RecentActivityTable.tsx`
- `src/components/Dashboard/ActiveOverlayBanner.tsx`

### Step 2: Write stories for pure prop-driven components (StatCard, TopCategoriesChart, etc.)

For components that take all data as props (no internal API calls):

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator } from '@/stories/storyUtils';
import { mockBudgetStability } from '@/mocks/budgetData';
import { BudgetStabilityCard } from './BudgetStabilityCard';

const meta: Meta<typeof BudgetStabilityCard> = {
  title: 'Components/Dashboard/BudgetStabilityCard',
  component: BudgetStabilityCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof BudgetStabilityCard>;

export const Default: Story = {
  args: { stability: mockBudgetStability },
};

export const HighStability: Story = {
  args: {
    stability: { ...mockBudgetStability, withinTolerancePercentage: 100, periodsWithinTolerance: 12, totalClosedPeriods: 12 },
  },
};

export const LowStability: Story = {
  args: {
    stability: { ...mockBudgetStability, withinTolerancePercentage: 25, periodsWithinTolerance: 3, totalClosedPeriods: 12 },
  },
};

export const NoPeriods: Story = {
  args: {
    stability: { ...mockBudgetStability, totalClosedPeriods: 0, periodsWithinTolerance: 0, recentClosedPeriods: [] },
  },
};
```

### Step 3: Write stories for API-driven components (use MSW handlers)

For components that fetch their own data:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { mockNetPosition } from '@/mocks/budgetData';
import { NetPositionCard } from './NetPositionCard';

const meta: Meta<typeof NetPositionCard> = {
  title: 'Components/Dashboard/NetPositionCard',
  component: NetPositionCard,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
};

export default meta;
type Story = StoryObj<typeof NetPositionCard>;

export const Default: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.success('/api/v1/dashboard/net-position', mockNetPosition)] },
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/dashboard/net-position')] },
  },
};

export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/dashboard/net-position')] },
  },
};

export const NegativeNetPosition: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.success('/api/v1/dashboard/net-position', {
          ...mockNetPosition,
          totalNetPosition: -25000,
          changeThisPeriod: -8000,
          debtBalance: -200000,
          liquidBalance: 175000,
        }),
      ],
    },
  },
};
```

### Step 4: Write `src/components/Dashboard/Dashboard.story.tsx` (full page)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { mockMonthlyBurnIn, mockMonthProgress, mockNetPosition, mockBudgetStability, mockSpentPerCategory, mockBudgetPerDay, initialTransactions } from '@/mocks/budgetData';
import { Dashboard } from './Dashboard';

const meta: Meta<typeof Dashboard> = {
  title: 'Pages/Dashboard',
  component: Dashboard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [createStoryDecorator({ padding: false })],
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

// selectedPeriodId is required — pass 'per-1' for normal state
export const Default: Story = {
  args: { selectedPeriodId: 'per-1' },
};

export const Loading: Story = {
  args: { selectedPeriodId: 'per-1' },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.loading('/api/v1/dashboard/monthly-burn-in'),
        mswHandlers.loading('/api/v1/dashboard/month-progress'),
      ],
    },
  },
};

export const Error: Story = {
  args: { selectedPeriodId: 'per-1' },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.error('/api/v1/dashboard/monthly-burn-in'),
        mswHandlers.error('/api/v1/dashboard/month-progress'),
      ],
    },
  },
};

// Locked: no active period — triggered by null selectedPeriodId
export const LockedNoPeriodConfigured: Story = {
  args: { selectedPeriodId: null },
};

// Locked: period selected but API says not found
export const LockedNoActivePeriod: Story = {
  args: { selectedPeriodId: 'per-1' },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/budget_period/current', () =>
          new HttpResponse(null, { status: 404 })
        ),
      ],
    },
  },
};
```

### Step 5: Run Storybook smoke test

```bash
yarn storybook --ci --smoke-test
```

### Step 6: Commit

```bash
git add src/components/Dashboard/*.story.tsx
git commit -m "feat(storybook): add Batch 3 — dashboard stories"
```

---

## Task 4: Batch 4 — Accounts

**Context:** Accounts use `BudgetProvider`. Key API endpoints:
- `GET /api/v1/accounts` — list of accounts
- `GET /api/v1/accounts/:id` — single account detail
- `GET /api/v1/accounts/:id/context` — category impact + stability
- `GET /api/v1/accounts/:id/balance-history` — balance history points

**Files to create:**
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
- `src/components/Accounts/AccountsOverview.story.tsx`
- `src/components/Accounts/AccountsManagement.story.tsx`
- `src/components/Accounts/AccountDetailPage.story.tsx`

### Step 1: Read component sources

Read each component with Serena before writing its story. Focus on:
- What props does it accept?
- Does it make its own API calls, or does it receive data as props?

### Step 2: Write stories for pure components (StandardRangeBar, AllowanceRangeBar, BalanceHistoryChart)

These likely accept data as props — use `args`:

```tsx
// StandardRangeBar.story.tsx example
export const Default: Story = {
  args: { current: 80000, limit: 150000, currency: euroCurrency },
};
export const NearLimit: Story = {
  args: { current: 145000, limit: 150000, currency: euroCurrency },
};
export const OverLimit: Story = {
  args: { current: 160000, limit: 150000, currency: euroCurrency },
};
export const NoLimit: Story = {
  args: { current: 80000, limit: 0, currency: euroCurrency },
};
```

For `BalanceHistoryChart`, use `mockBalanceHistory` from budgetData.

### Step 3: Write stories for container components (AccountsOverview, AccountsManagement, AccountDetailPage)

These are full-page components. Pattern:

```tsx
// AccountsOverview.story.tsx
export const Default: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.success('/api/v1/accounts', mockAccounts)] },
  },
};
export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/accounts')] },
  },
};
export const Error: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.error('/api/v1/accounts')] },
  },
};
export const Empty: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.empty('/api/v1/accounts')] },
  },
};
export const OnlyCreditCards: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.success('/api/v1/accounts', [mockCreditCardAccount]),
      ],
    },
  },
};
export const WithArchivedAccounts: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.success('/api/v1/accounts', [...mockAccounts, mockArchivedAccount]),
      ],
    },
  },
};
```

For `AccountDetailPage`, it likely uses a route param (`:id`). Wrap with `MemoryRouter initialEntries={['/accounts/acc-1']}` if needed, or pass `accountId` as a prop (check the component source first).

### Step 4: Run smoke test and commit

```bash
yarn storybook --ci --smoke-test
git add src/components/Accounts/*.story.tsx
git commit -m "feat(storybook): add Batch 4 — accounts stories"
```

---

## Task 5: Batch 5 — Transactions

**Context:** Transactions components require `BudgetProvider`. Key API endpoints:
- `GET /api/v1/transactions` — paginated list
- `GET /api/v1/accounts` — for dropdowns
- `GET /api/v1/categories` — for dropdowns
- `GET /api/v1/vendors` — for dropdowns

**Files to create:**
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
- `src/components/Transactions/Transactions.story.tsx`

### Step 1: Read component sources

Use Serena to read each component. Pay special attention to:
- `TransactionsTable` — does it receive transactions as props or fetch them?
- `QuickAddTransaction` — form submission handlers
- `MobileTransactionCard` — from `src/components/Transactions/List/`
- `TransactionStats` — from `src/components/Transactions/Stats/`

### Step 2: Write badge stories (AccountBadge, CategoryBadge)

Pure prop-driven:

```tsx
// AccountBadge.story.tsx
export const Checking: Story = { args: { account: mockCheckingAccount } };
export const Savings: Story = { args: { account: mockSavingsAccount } };
export const CreditCard: Story = { args: { account: mockCreditCardAccount } };
export const Allowance: Story = { args: { account: mockAllowanceAccount } };
export const NoAccount: Story = { args: { account: null } };
```

```tsx
// CategoryBadge.story.tsx
export const Outgoing: Story = { args: { category: mockOutgoingCategory } };
export const Incoming: Story = { args: { category: mockIncomingCategory } };
export const Transfer: Story = { args: { category: mockTransferCategory } };
export const NoCategory: Story = { args: { category: null } };
```

### Step 3: Write form stories

For `QuickAddTransaction` and `EditTransactionForm`, both require accounts/categories/vendors loaded. Override the relevant endpoints:

```tsx
// Shared handlers for form stories
const formHandlers = [
  mswHandlers.success('/api/v1/accounts', mockAccounts),
  mswHandlers.success('/api/v1/categories', mockCategoryWithStats),
  mswHandlers.success('/api/v1/vendors', mockVendorsWithStats),
];

export const Default: Story = {
  parameters: { msw: { handlers: formHandlers } },
};
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        mswHandlers.loading('/api/v1/accounts'),
        mswHandlers.loading('/api/v1/categories'),
      ],
    },
  },
};
```

### Step 4: Write `Transactions.story.tsx` (full page)

```tsx
export const Default: Story = { parameters: { layout: 'fullscreen' } };
export const Loading: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [mswHandlers.loading('/api/v1/transactions')] },
  },
};
export const Error: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [mswHandlers.error('/api/v1/transactions')] },
  },
};
export const Empty: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [mswHandlers.empty('/api/v1/transactions')] },
  },
};
```

### Step 5: Run smoke test and commit

```bash
yarn storybook --ci --smoke-test
git add src/components/Transactions/**/*.story.tsx src/components/Transactions/*.story.tsx
git commit -m "feat(storybook): add Batch 5 — transaction stories"
```

---

## Task 6: Batch 6 — Categories

**Context:** Categories use `BudgetProvider`. Key API endpoints:
- `GET /api/v1/categories` — flat list with stats
- `GET /api/v1/categories/management` — management view (incoming/outgoing/archived)
- `GET /api/v1/categories/diagnostic` — budget diagnostic (budgeted/unbudgeted rows)

**Files to create:**
- `src/components/Categories/CategoryNameIcon.story.tsx`
- `src/components/Categories/CategoryStabilityDots.story.tsx`
- `src/components/Categories/CategoryCard.story.tsx`
- `src/components/Categories/BudgetedDiagnosticRow.story.tsx`
- `src/components/Categories/UnbudgetedDiagnosticList.story.tsx`
- `src/components/Categories/CategoryFormModal.story.tsx`
- `src/components/Categories/CategoriesTable.story.tsx`
- `src/components/Categories/CategoriesOverview.story.tsx`
- `src/components/Categories/CategoriesManagement.story.tsx`
- `src/components/Categories/CategoryDetailPage.story.tsx`

### Step 1: Read component sources with Serena

### Step 2: Write pure prop stories (CategoryNameIcon, CategoryStabilityDots, CategoryCard)

```tsx
// CategoryStabilityDots.story.tsx
export const AllGreen: Story = {
  args: {
    dots: [
      { periodId: 'p1', isOutsideTolerance: false },
      { periodId: 'p2', isOutsideTolerance: false },
      { periodId: 'p3', isOutsideTolerance: false },
    ],
  },
};
export const Mixed: Story = {
  args: {
    dots: mockBudgetStability.recentClosedPeriods,
  },
};
export const AllRed: Story = {
  args: {
    dots: [
      { periodId: 'p1', isOutsideTolerance: true },
      { periodId: 'p2', isOutsideTolerance: true },
    ],
  },
};
export const Empty: Story = { args: { dots: [] } };
```

### Step 3: Write page stories

```tsx
// CategoriesOverview.story.tsx
const diagnosticData = {
  periodSummary: { totalBudget: 200000, spentBudget: 85000, remainingBudget: 115000, daysInPeriod: 31, remainingDays: 16, daysPassedPercentage: 48 },
  budgetedRows: mockBudgetedDiagnosticRows,
  unbudgetedRows: mockUnbudgetedDiagnosticRows,
};

export const Default: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [mswHandlers.success('/api/v1/categories/diagnostic', diagnosticData)] },
  },
};
export const Loading: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [mswHandlers.loading('/api/v1/categories/diagnostic')] },
  },
};
export const Empty: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        mswHandlers.success('/api/v1/categories/diagnostic', {
          ...diagnosticData,
          budgetedRows: [],
          unbudgetedRows: [],
        }),
      ],
    },
  },
};
```

### Step 4: Run smoke test and commit

```bash
yarn storybook --ci --smoke-test
git add src/components/Categories/*.story.tsx
git commit -m "feat(storybook): add Batch 6 — category stories"
```

---

## Task 7: Batch 7 — Vendors

**Context:** Vendors use `BudgetProvider`. Key endpoint: `GET /api/v1/vendors` returns `VendorWithStats[]`.

**Files to create:**
- `src/components/Vendors/VendorCard.story.tsx`
- `src/components/Vendors/VendorFormModal.story.tsx`
- `src/components/Vendors/VendorDeleteModal.story.tsx`
- `src/components/Vendors/Vendors.story.tsx`

### Step 1: Read component sources with Serena

### Step 2: Write VendorCard stories

```tsx
export const Default: Story = { args: { vendor: mockVendorsWithStats[0] } };
export const WithDescription: Story = { args: { vendor: mockVendorsWithStats[0] } };
export const NoDescription: Story = { args: { vendor: mockVendorsWithStats[1] } };
export const Archived: Story = { args: { vendor: mockVendorsWithStats[3] } };
export const HighUsage: Story = {
  args: { vendor: { ...mockVendorsWithStats[0], transactionCount: 248 } },
};
```

### Step 3: Write VendorDeleteModal stories

The delete modal has a special error state — vendor in use (HTTP 409). Include:
```tsx
export const VendorInUse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.delete('/api/v1/vendors/:id', () =>
          HttpResponse.json(
            { status: 409, error: 'VENDOR_IN_USE', message: 'Vendor is used in 5 transactions', transactionCount: 5, vendorId: 'ven-1' },
            { status: 409 }
          )
        ),
      ],
    },
  },
};
```

### Step 4: Write Vendors.story.tsx (full page)

Standard Default/Loading/Error/Empty pattern.

### Step 5: Run smoke test and commit

```bash
yarn storybook --ci --smoke-test
git add src/components/Vendors/*.story.tsx
git commit -m "feat(storybook): add Batch 7 — vendor stories"
```

---

## Task 8: Batch 8 — Category Targets

**Context:** Requires `BudgetProvider`. Key endpoint: `GET /api/v1/category-targets?periodId=...` returns `CategoryTargetsResponse`.

**Files to create:**
- `src/components/CategoryTargets/CategoryTargetRow.story.tsx`
- `src/components/CategoryTargets/CategoryTargetTable.story.tsx`
- `src/components/CategoryTargets/ExcludedCategoriesTable.story.tsx`
- `src/components/CategoryTargets/CategoryTargets.story.tsx`

### Step 1: Read component sources with Serena

Check `CategoryTargetsContainer.tsx` to understand what API endpoint it calls and how it passes data to child components.

### Step 2: Write CategoryTargetRow stories

```tsx
export const WithTarget: Story = { args: { row: mockCategoryTargets.outgoingTargets[0] } };
export const NoTarget: Story = { args: { row: mockCategoryTargets.outgoingTargets[2] } };
export const Overbudget: Story = {
  args: {
    row: {
      ...mockCategoryTargets.outgoingTargets[0],
      projectedVarianceBasisPoints: 1500, // positive = over budget
    },
  },
};
export const IncomingCategory: Story = { args: { row: mockCategoryTargets.incomingTargets[0] } };
```

### Step 3: Write full page story

```tsx
// CategoryTargets.story.tsx
export const Default: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [/* endpoint for category targets */] },
  },
};
// Also: Loading, Error, Empty (no targets set), NoPeriod
```

Find the exact API endpoint URL by reading `CategoryTargetsContainer.tsx`.

### Step 4: Run smoke test and commit

```bash
yarn storybook --ci --smoke-test
git add src/components/CategoryTargets/*.story.tsx
git commit -m "feat(storybook): add Batch 8 — category targets stories"
```

---

## Task 9: Batch 9 — Settings

**Context:** Settings uses `BudgetProvider`. Multiple sub-sections each call different endpoints (profile, preferences, security, period-model). Global handlers in `handlers.ts` already cover all of these.

**Files to create:**
- `src/components/Settings/TwoFactorSetup.story.tsx`
- `src/components/Settings/SettingsPage.story.tsx`

### Step 1: Read component sources

Read `SettingsPage.tsx` and `TwoFactorSetup.tsx` with Serena to understand sections and API calls.

### Step 2: Write TwoFactorSetup stories

```tsx
export const Default: Story = {};  // 2FA not enabled (global handler returns enabled: false)

export const Enabled: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/two-factor/status', () =>
          HttpResponse.json({ enabled: true, hasBackupCodes: true, backupCodesRemaining: 8 })
        ),
      ],
    },
  },
};

export const SetupInProgress: Story = {
  // Shows QR code step — trigger by calling setup endpoint first
  parameters: {
    msw: {
      handlers: [
        http.get('/api/v1/two-factor/status', () =>
          HttpResponse.json({ enabled: false, hasBackupCodes: false, backupCodesRemaining: 0 })
        ),
        http.post('/api/v1/two-factor/setup', () =>
          HttpResponse.json({
            secret: 'JBSWY3DPEHPK3PXP',
            qrCode: 'data:image/png;base64,iVBORw0KGgo=',
            backupCodes: ['1234-5678', '8765-4321'],
          })
        ),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/two-factor/status')] },
  },
};
```

### Step 3: Write SettingsPage stories

```tsx
export const Default: Story = { parameters: { layout: 'fullscreen' } };

export const ProfileLoading: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [mswHandlers.loading('/api/v1/settings/profile')] },
  },
};

export const ProfileError: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [mswHandlers.error('/api/v1/settings/profile')] },
  },
};
```

### Step 4: Run smoke test and commit

```bash
yarn storybook --ci --smoke-test
git add src/components/Settings/*.story.tsx
git commit -m "feat(storybook): add Batch 9 — settings stories"
```

---

## Task 10: Batch 10 — Budget & Periods

**Context:** These components manage budget periods and overlays. Key endpoints:
- `GET /api/v1/budget_period` — list of periods
- `GET /api/v1/budget_period/current`
- `GET /api/v1/budget_period/schedule`
- `GET /api/v1/overlays`

**Files to create:**
- `src/components/BudgetPeriodSelector/BudgetPeriodSelector.story.tsx`
- `src/components/Overlays/OverlayCard.story.tsx`
- `src/components/Overlays/OverlayFormModal.story.tsx`
- `src/components/Periods/PeriodCard.story.tsx`
- `src/components/Periods/PeriodFormModal.story.tsx`
- `src/components/Periods/ScheduleSettingsModal.story.tsx`

### Step 1: Read component sources with Serena

Read each component to understand props and API dependencies.

### Step 2: Write BudgetPeriodSelector stories

```tsx
const mockPeriods = [
  { id: 'per-1', name: 'January 2026', startDate: '2026-01-01', endDate: '2026-01-31' },
  { id: 'per-2', name: 'February 2026', startDate: '2026-02-01', endDate: '2026-02-28' },
  { id: 'per-3', name: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31' },
];

export const Default: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.success('/api/v1/budget_period', mockPeriods)] },
  },
};
export const SinglePeriod: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.success('/api/v1/budget_period', [mockPeriods[0]])] },
  },
};
export const Empty: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.empty('/api/v1/budget_period')] },
  },
};
export const Loading: Story = {
  parameters: {
    msw: { handlers: [mswHandlers.loading('/api/v1/budget_period')] },
  },
};
```

### Step 3: Write Overlay stories

```tsx
// OverlayCard.story.tsx
const mockOverlay = {
  id: 'ovl-1',
  name: 'Holiday Bonus',
  amount: 50000,
  description: 'Extra income this month',
  appliedAt: '2026-01-15',
};

export const Positive: Story = { args: { overlay: { ...mockOverlay, amount: 50000 } } };
export const Negative: Story = { args: { overlay: { ...mockOverlay, amount: -25000, name: 'Car Repair' } } };
```

### Step 4: Write Period and Schedule stories

For modal stories (PeriodFormModal, ScheduleSettingsModal), these are controlled — check if they accept an `opened` prop:

```tsx
export const Open: Story = {
  args: { opened: true, onClose: () => {} },
  parameters: { msw: { handlers: [/* relevant endpoints */] } },
};
export const Loading: Story = {
  args: { opened: true, onClose: () => {} },
  parameters: { msw: { handlers: [mswHandlers.loading('/api/v1/budget_period')] } },
};
```

### Step 5: Run final smoke test and commit

```bash
yarn storybook --ci --smoke-test
git add src/components/BudgetPeriodSelector/*.story.tsx \
        src/components/Overlays/*.story.tsx \
        src/components/Periods/*.story.tsx
git commit -m "feat(storybook): add Batch 10 — budget and period stories"
```

---

## Final Verification

After all 10 batches:

```bash
yarn storybook --ci --smoke-test
```

Count story files:
```bash
find src -name '*.story.tsx' | wc -l
```
Expected: ~60+ story files.

Check TypeScript:
```bash
yarn tsc --noEmit
```

---

## Summary of Conventions (for every story file)

```tsx
// 1. Imports: meta types, story utilities, mock data, component
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';  // only if needed
import { createStoryDecorator, mswHandlers } from '@/stories/storyUtils';
import { mockXxx } from '@/mocks/budgetData';
import { ComponentName } from './ComponentName';

// 2. Meta: title, component, tags, decorator
const meta: Meta<typeof ComponentName> = {
  title: 'Pages/SectionName' | 'Components/Section/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  decorators: [createStoryDecorator()],
  // parameters: { layout: 'fullscreen' }  // pages only
};
export default meta;
type Story = StoryObj<typeof ComponentName>;

// 3. Stories: Default, Loading, Error, Empty, then variants
export const Default: Story = { ... };
export const Loading: Story = { ... };
export const Error: Story = { ... };
export const Empty: Story = { ... };
// Domain-specific variants follow
```

**Never:**
- Define inline mock objects for domain entities (use `budgetData.ts`)
- Use a different wrapper than `createStoryDecorator`
- Skip the `tags: ['autodocs']`
- Forget `layout: 'fullscreen'` for page-level stories
