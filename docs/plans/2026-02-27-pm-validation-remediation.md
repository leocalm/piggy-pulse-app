# PM Validation Remediation — Full Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all open issues from `PM_VALIDATION.md` — ~120 UI discrepancies found by comparing the live app against the `designs/v1` canonical specs.

**Architecture:** Work proceeds in two phases: (1) cross-cutting systemic fixes that affect many pages (currency formatting, date formatting, shared layout components), then (2) page-by-page fixes in dependency order. Each page task is self-contained and can be assigned to a parallel agent.

**Tech Stack:** React 19, TypeScript, Mantine v8, CSS Modules, react-i18next, CurrencyValue utility

**Design specs location:** `/Volumes/T7/opt/piggy-pulse/piggy-pulse/designs/v1/` (served at `http://localhost:8001`)

---

## Phase 1: Cross-Cutting Systemic Fixes

These fixes resolve issues that appear on multiple pages. Do them first to avoid duplicate work.

---

### Task 1: Currency Display — Remove Trailing `.00` (Clean Values)

**Issues resolved:** D-05, A-02, AM-03, C-03, C-07, CT-03 (currency symbol part)

**Problem:** CurrencyValue renders `€884.00` — design uses clean values like `€884`. Also all amounts show unnecessary `.00` when the value has no fractional cents.

**Files:**
- Modify: `src/utils/currency.ts` — `formatCurrencyValue()` function
- Modify: `src/utils/currency.test.ts` — add tests for clean formatting
- Modify: `src/components/Utils/CurrencyValue.tsx` — add `clean` prop (default `true`)
- Modify: `src/components/Utils/CurrencyValue.test.ts`

**Implementation:**

**Step 1: Write failing tests for clean formatting**

In `src/utils/currency.test.ts`, add tests:
```typescript
describe('formatCurrencyValue with clean option', () => {
  it('removes trailing .00 for whole amounts', () => {
    expect(formatCurrencyValue(88400, 2, 'en-US', { clean: true })).toBe('884');
  });
  it('keeps decimals when fractional', () => {
    expect(formatCurrencyValue(88450, 2, 'en-US', { clean: true })).toBe('884.50');
  });
  it('still formats normally when clean is false', () => {
    expect(formatCurrencyValue(88400, 2, 'en-US', { clean: false })).toBe('884.00');
  });
});
```

**Step 2: Run tests — expect FAIL**

Run: `yarn vitest src/utils/currency.test.ts`

**Step 3: Implement clean formatting in `formatCurrencyValue`**

Add an optional `options` parameter with `clean?: boolean` to `formatCurrencyValue`. When `clean` is true and the fractional part is all zeros, strip the decimal separator and trailing zeros.

**Step 4: Update CurrencyValue component**

Add a `clean` prop (default `true`) to `CurrencyValueProps`. Pass it through to `formatCurrencyValue`. This makes all existing usages automatically clean.

**Step 5: Run tests — expect PASS**

Run: `yarn vitest src/utils/currency.test.ts`

**Step 6: Run full test suite to catch regressions**

Run: `yarn vitest`
Fix any snapshot or assertion failures caused by the default change.

**Step 7: Commit**

```
feat(currency): strip trailing .00 from clean currency values

Resolves: D-05, A-02, AM-03, C-03, C-07
```

---

### Task 2: Date Formatting — Human-Readable Short Dates

**Issues resolved:** T-03, AD-02, AD-06, AD-07, CT-02, PM-07

**Problem:** Dates display as ISO `2026-02-13` — design uses readable short format like `Feb 15`, `May 1 – May 31`, `February 2026`.

**Files:**
- Create: `src/utils/dateFormat.ts` — centralized date formatting helpers
- Create: `src/utils/dateFormat.test.ts`

**Implementation:**

**Step 1: Write failing tests**

```typescript
// src/utils/dateFormat.test.ts
import { formatShortDate, formatDateRange, formatMonthYear } from './dateFormat';

describe('formatShortDate', () => {
  it('formats as "Feb 15"', () => {
    expect(formatShortDate('2026-02-15')).toBe('Feb 15');
  });
});

describe('formatDateRange', () => {
  it('formats as "Feb 1 – Mar 1"', () => {
    expect(formatDateRange('2026-02-01', '2026-03-01')).toBe('Feb 1 – Mar 1');
  });
});

describe('formatMonthYear', () => {
  it('formats as "February 2026"', () => {
    expect(formatMonthYear('2026-02-01')).toBe('February 2026');
  });
});
```

**Step 2: Run tests — expect FAIL**

**Step 3: Implement date formatters**

```typescript
// src/utils/dateFormat.ts
export function formatShortDate(isoDate: string, locale = 'en-US'): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function formatDateRange(start: string, end: string, locale = 'en-US'): string {
  return `${formatShortDate(start, locale)} – ${formatShortDate(end, locale)}`;
}

export function formatMonthYear(isoDate: string, locale = 'en-US'): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export function formatUpperShortDate(isoDate: string, locale = 'en-US'): string {
  return formatShortDate(isoDate, locale).toUpperCase();
}
```

**Step 4: Run tests — expect PASS**

**Step 5: Commit**

```
feat(utils): add human-readable date formatting helpers

Resolves: T-03, AD-02, AD-06, AD-07, CT-02, PM-07
```

---

### Task 3: Shared Amount Sign Formatting

**Issues resolved:** T-04, C-09, A-03

**Problem:** Amounts missing explicit +/− sign. Design requires all amounts show directional sign. Positive values need leading `+`.

**Files:**
- Modify: `src/utils/currency.ts` — add `showSign` option to `formatCurrencyValue`
- Modify: `src/utils/currency.test.ts`

**Implementation:**

**Step 1: Write failing tests**

```typescript
describe('formatCurrencyValue with showSign', () => {
  it('adds + to positive values', () => {
    expect(formatCurrencyValue(32000, 2, 'en-US', { showSign: true })).toBe('+320.00');
  });
  it('keeps - on negative values', () => {
    expect(formatCurrencyValue(-2500, 2, 'en-US', { showSign: true })).toBe('-25.00');
  });
  it('shows 0 without sign', () => {
    expect(formatCurrencyValue(0, 2, 'en-US', { showSign: true })).toBe('0.00');
  });
});
```

**Step 2: Run tests — expect FAIL**

**Step 3: Implement in `formatCurrencyValue`**

When `options.showSign` is true and value > 0, prepend `+`.

**Step 4: Run tests — expect PASS**

**Step 5: Commit**

```
feat(currency): add showSign option for directional amounts

Resolves: T-04, C-09, A-03
```

---

## Phase 2: Page-by-Page Fixes

Each task below is a self-contained page fix. Tasks can be executed in parallel (independent agents).

**Important:** For each task, the implementer MUST open the design HTML at `http://localhost:8001` and compare with the live app at `http://localhost:5173` (or `http://localhost`) to verify fixes visually.

---

### Task 4: Dashboard Fixes

**Issues:** D-01, D-02, D-03, D-04, D-05 (done in Task 1), D-06, D-07

**Files:**
- Modify: `src/components/Dashboard/Dashboard.tsx`
- Modify: `src/components/Dashboard/CurrentPeriodCard.tsx` — D-01 (add progress bar), D-06 (null state)
- Modify: `src/components/Dashboard/NetPositionCard.tsx` — D-04 (last updated line)
- Modify: `src/components/Dashboard/BudgetStabilityCard.tsx` — D-07 (minimum data state)
- Modify: Layout/topbar component — D-02 (scope chip)

**Design spec:** `http://localhost:8001/dashboard/piggypulse-dashboard.html`

**Detailed steps for each issue:**

**D-01: Progress bar inside Current Period card**
- Open `CurrentPeriodCard.tsx` and add a Mantine `Progress` bar showing period elapsed percentage
- The percentage should be calculated from `(daysElapsed / totalDays) * 100`
- Position it inside the card below the date range

**D-02: "Scope: All accounts" chip in topbar**
- This is a cross-page feature — add a `ScopeChip` component to the layout topbar, left of the period selector
- For now it should be read-only displaying "All accounts"
- Files: create `src/components/Layout/ScopeChip.tsx`, modify topbar/header component

**D-03: Card order — swap Net Position and Budget Stability**
- In `Dashboard.tsx`, find the grid layout and swap the order of `NetPositionCard` and `BudgetStabilityCard`

**D-04: Net Position "Last updated Xh ago" line**
- Add a small text line at the bottom of `NetPositionCard` showing relative time since last update
- Use `lastUpdated` from the API response if available, or current period's last transaction date

**D-06: Empty/null state for Current Period when no budget configured**
- When budget is `null` or `0`, show a meaningful empty state instead of "of €0.00"
- E.g., "No budget set" or omit the "of" line entirely

**D-07: Budget Stability minimum-data state**
- When fewer than 3 closed periods exist, show explanatory text like "Needs 3+ closed periods for stability data"

**Commit:**
```
fix(dashboard): align with design spec — progress bar, card order, empty states

Resolves: D-01, D-02, D-03, D-04, D-06, D-07
```

---

### Task 5: Transactions Page Fixes

**Issues:** T-01, T-02, T-03 (done in Task 2), T-04 (done in Task 3), T-05, T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-14, T-15, T-16, T-17, T-18, T-19, T-20, T-21, T-22

**Design spec:** `http://localhost:8001/transactions/piggypulse-transactions.html`

**This is the largest page with 20+ issues. Split into sub-tasks:**

**Sub-task 5A: Desktop Quick Add Modal Fix (T-01, T-21, T-22)**
- The modal's form fields are truncated to single letters on desktop
- Root cause likely: Select components inside a narrow modal with insufficient `minWidth`
- Fix: ensure the modal has adequate width (e.g., `500px`), form fields use full width, dropdowns render option text (not just emoji)

**Sub-task 5B: i18n / Label Fixes (T-02, T-05, T-14, T-15, T-16)**
- T-02: Batch entry "Done" button shows raw key `states.done` → add missing i18n key in `src/locales/en.json` and `pt.json`
- T-05: Remove page subtitle that's not in the design
- T-14: Add "(optional)" hint to vendor filter label
- T-15: Column headers — add `text-transform: uppercase` in CSS
- T-16: Mobile drawer — remove redundant double heading

**Sub-task 5C: Amount and Date Formatting (T-03, T-04)**
- Already resolved by Tasks 2 and 3
- Wire in `formatShortDate` for transaction dates in the table
- Wire in `showSign` for amount display in transaction rows

**Sub-task 5D: Feature Gaps (T-06, T-07, T-08, T-09, T-10, T-11, T-12)**
- T-06: Add scope dropdown to page header (re-use `ScopeChip` from Task 4)
- T-07: Single-account variant — when filtered to one account, add a "Running Balance" column to the table
- T-08: Direction filter tabs — evaluate if these are ahead-of-spec or need removal; check design
- T-09: Batch entry — replace checkmark icon with "Save" text button
- T-10: Batch entry "Done" button — change from primary filled to secondary outline style
- T-11: Add allowance spending badge to applicable transaction rows
- T-12: Add directional arrow (→/←) to transfer rows

**Sub-task 5E: Empty State (T-18)**
- Implement an empty state for the transactions table: illustration/icon, "No transactions yet" heading, CTA to add first transaction

**Sub-task 5F: Edge Cases (T-19, T-20)**
- T-19: Verify batch sticky defaults (date + account persist) — test manually
- T-20: Verify transfer From ≠ To validation — add client-side check if missing

**Commit after each sub-task.**

---

### Task 6: Accounts Overview Fixes

**Issues:** A-01, A-02 (done in Task 1), A-03 (done in Task 3), A-04, A-05, A-06, A-07, A-08, A-09, A-10, A-11, A-12, A-13, A-14

**Design spec:** `http://localhost:8001/accounts/piggypulse-accounts.html`

**Key fixes:**

**A-01/A-13: "Savings" → "Protected"**
- Search for "Savings" string in account type mapping and replace with "Protected"
- Files: likely in `AccountsSummary.tsx` or the type mapping utility

**A-04: Remove Low/High labels + "within range" sentence**
- In `StandardRangeBar.tsx` or `AllowanceRangeBar.tsx`, remove the text labels and the "Current is within range" sentence
- Range should be communicated only by the dot position on the bar

**A-05: "Updated: 2h ago" chip**
- Same as D-04 — add relative time chip to topbar

**A-06: Remove tooltip icon next to "NET POSITION"**
- Remove the `ℹ` icon from `AccountsSummary.tsx`

**A-07: "Net change this period" → "This Period"**
- Label change in allowance card component

**A-08: "Balance after next transfer" → "Projected After Transfer"**
- Label change in allowance card component

**A-09: Segmented Net Position bar by type**
- Change the single-color bar in `AccountsSummary.tsx` to a segmented bar with different colors for Liquid/Protected/Debt

**A-10: "30-day closing balance range" → "30d closing balance range"**
- String change

**A-11: Mobile period selector**
- Cross-page issue — ensure period selector renders on mobile

**A-12: Mobile tab spacing**
- Add CSS padding/margin between Overview/Management tabs and subtitle

**A-14: Mobile slider visibility**
- Increase track contrast on dark background at mobile widths

**Commit:**
```
fix(accounts): align overview with design — labels, range bar, layout

Resolves: A-01, A-04, A-05, A-06, A-07, A-08, A-09, A-10, A-11, A-12, A-13, A-14
```

---

### Task 7: Account Detail Fixes

**Issues:** AD-01, AD-02 (done in Task 2), AD-03, AD-04, AD-05, AD-06, AD-07, AD-08, AD-09, AD-M01 through AD-M06

**Design spec:** `http://localhost:8001/account-detail/piggypulse-account-detail.html`

**Key fixes:**

**AD-01: Raw subtype → human-readable type**
- Map `CHECKING` → `LIQUID ACCOUNT`, `SAVINGS` → `PROTECTED ACCOUNT`, etc.
- Create a `getAccountTypeLabel(subtype: string): string` utility or use existing mapping

**AD-03: "STABILITY" → "STABILITY CONTEXT"**
- String change in `AccountContextSection.tsx`

**AD-04: Remove Y-axis + X-axis date labels from Balance History chart**
- In `BalanceHistoryChart.tsx`, hide axis labels/ticks for a cleaner chart

**AD-05: Add breadcrumb navigation**
- Replace bare `←` with `Accounts > Account Name` breadcrumb
- Modify `AccountDetailHeader.tsx`

**AD-06/AD-07: Date formatting in transaction table**
- Wire in `formatShortDate` and `formatUpperShortDate` from Task 2

**AD-08: Color-highlight inflow amounts**
- Add accent color to positive amounts in the transaction table

**AD-09: Allowance badge**
- Same as T-11

**AD-M01: Mobile header alignment**
- Change balance + net change from center to right-aligned on mobile

**AD-M02: Mobile transaction table adaptation**
- At mobile widths, switch to card layout or reduce columns from 5

**AD-M03: Mobile chart X-axis overlap**
- Reduce number of X-axis labels or rotate them at mobile width

**AD-M04: Mobile context section spacing**
- Fix excessive blank space between sections

**AD-M05: Mobile period selector**
- Cross-page — same as A-11

**AD-M06: Mobile chart toggle sizing**
- Increase tap target size for Period/30d/90d/1y tabs

**Commit:**
```
fix(account-detail): align with design — type labels, chart, breadcrumbs, mobile

Resolves: AD-01 through AD-M06
```

---

### Task 8: Account Management Fixes

**Issues:** AM-01, AM-02, AM-03 (done in Task 1), AM-04, AM-05, AM-06, AM-07, AM-08, AM-M01 through AM-M05

**Design spec:** `http://localhost:8001/accounts-management/piggypulse-accounts-management.html`

**Key fixes:**

**AM-01: Subtitle on Management tab**
- Change subtitle to "Define and manage your financial accounts" when on Management tab

**AM-02: Compact single-row account card layout**
- Redesign account cards from tall vertical stacks to horizontal rows: icon+name left, balance+status middle, buttons right

**AM-04: ARCHIVED section**
- Group archived accounts under a dedicated "ARCHIVED" section with greyed status

**AM-05: Conditional Delete button**
- Only show Delete on accounts with 0 transactions; hide it otherwise

**AM-06: Edit drawer missing fields**
- Add: Description field, Currency field, "Adjust Starting Balance" action, locked-field explanatory text

**AM-07: Edit drawer subtitle**
- Change to "Name and description are editable. Type remains immutable."

**AM-08: Edit drawer → centered modal**
- Change from inline drawer to centered modal dialog

**AM-M01: Mobile card density**
- Reduce card height significantly on mobile

**AM-M02: Mobile Add Account button separation**
- Add visual separation from tab row

**AM-M03: Mobile Type field disabled**
- Make Type dropdown visually disabled/greyed on mobile Edit modal

**AM-M04: Currency selector in New Account**
- Add Currency dropdown to Create Account form

**AM-M05: Archive confirmation dialog**
- Add confirmation step before archiving

**Commit:**
```
fix(account-management): align with design — card layout, modals, lifecycle

Resolves: AM-01 through AM-M05
```

---

### Task 9: Categories Overview Fixes

**Issues:** C-01, C-02, C-03 (done in Task 1), C-04, C-05, C-06, C-07 (done in Task 1), C-08, C-09 (done in Task 3), C-10, C-M01 through C-M05

**Design spec:** `http://localhost:8001/categories/piggypulse-categories.html`

**Key fixes:**

**C-01: Scope filter chip**
- Add scope chip (re-use from Task 4/D-02)

**C-02: Extra Targets tab**
- Evaluate: is this ahead-of-spec? If no design exists, flag it or hide the tab. Check with user if needed.

**C-04: Subtitle — "Stability (last 3 closed periods)"**
- Change "BUDGETED CATEGORIES" subtitle to include stability context

**C-05: "Projected at current pace: $X" line**
- Add forward projection calculation and display on each category row

**C-06: "% Used" → "Used" / "Budget" → "Budgeted"**
- Fix column header labels

**C-08: Unbudgeted category format**
- Ensure format matches design: "Category $amount (X%)"

**C-10: Progress bar overflow treatment**
- When >100%, add visual overflow indicator (e.g., different color segment beyond bar end)

**C-M01–M05: Mobile layout fixes**
- Improve card stacking, category zone separation, tab spacing, period selector, variance color

**Commit:**
```
fix(categories-overview): align with design — labels, projections, mobile

Resolves: C-01, C-02, C-04, C-05, C-06, C-08, C-10, C-M01 through C-M05
```

---

### Task 10: Categories Management Fixes

**Issues:** CM-01, CM-02, CM-03, CM-04, CM-07, CM-08, CM-09, CM-10, CM-11, CM-12, CM-13, CM-14, CM-M01 through CM-M06

**Design spec:** `http://localhost:8001/category-management/piggypulse-categories-management.html`

**Key fixes:**

**CM-02: Desktop Add Category button**
- Show full `+ Add Category` text label on desktop (not bare `+` icon)

**CM-03: Remove TYPE badge**
- Remove `TYPE: INCOME` / `TYPE: SPENDING` badges from category rows — type is conveyed by section heading

**CM-08: Edit modal Type field — make immutable**
- Disable the Type dropdown when category has transactions; add greyed visual state

**CM-09: Remove stray `0` from Edit modal**
- Find the raw transaction count leaking into the form and remove it

**CM-11: Modal presentation — centered modal**
- Change from bottom sheet to centered modal dialog

**CM-12: Add constraint notes**
- Add: "Type cannot be changed after the first transaction exists." and "Re-parenting is available only when transaction count is 0."

**CM-13: Empty state for Management tab**
- Add empty state: icon, "No categories defined yet." heading, description, "Add Category" CTA

**CM-14: Conditional Delete button**
- Only show Delete on categories with 0 transactions; use Archive for others

**CM-M01: Mobile modal sizing**
- Fix bottom sheet empty space (same root cause as V-M01)

**CM-M02–M06: Other mobile fixes**
- Period selector, search clear button, archive button state, discard confirmation, targets tab

**Commit:**
```
fix(categories-management): align with design — modals, lifecycle, empty state

Resolves: CM-01 through CM-M06
```

---

### Task 11: Vendors Management Fixes

**Issues:** V-01, V-02, V-03, V-04, V-05, V-06, V-07, V-08, V-M01 through V-M05

**Design spec:** `http://localhost:8001/vendors-management/piggypulse-vendors-management.html`

**Key fixes:**

**V-01: Section header "(4)" → "(ALPHABETICAL)"**
- Replace count with sort label

**V-02: Show description in list rows**
- Add vendor description text below vendor name in list

**V-03: Transaction count format — "1 tx" + pluralization fix**
- Use compact "X tx" format; fix "0 transaction" → "0 tx"

**V-04: "+ Add Vendor" button label**
- Add `+` prefix to button text

**V-05: Add Vendor modal subtitle**
- Add contextual subtitle

**V-06: "Save Vendor" → "Create" on Add modal**
- Differentiate create vs edit primary button labels

**V-07: Archived vendor status label**
- Show dimmed "Archived" text in archived rows

**V-08: "Vendor Name" → "Name" in modals**
- Simplify label

**V-M01: Mobile modal sizing**
- Fix bottom sheet rendering with ~50% empty space — set `max-height` or use modal component

**V-M02: Mobile discard confirmation**
- Reduce from full-screen takeover to small overlay

**V-M03: Mobile action buttons**
- Consider overflow menu or swipe-to-reveal

**V-M04: Mobile Add Vendor button**
- Separate from h1

**V-M05: Search bar clear button**
- Add `×` clear button

**Commit:**
```
fix(vendors): align with design — labels, descriptions, mobile modals

Resolves: V-01 through V-M05
```

---

### Task 12: Settings Page Fixes

**Issues:** ST-01 through ST-22, ST-M01 through ST-M06

**Design spec:** `http://localhost:8001/settings/piggypulse-settings.html`

**This is a large task. Split into sub-tasks:**

**Sub-task 12A: Layout — Sections Sidebar (ST-02)**
- Add sticky left sidebar navigation for desktop: Profile, Security, Period Model, Preferences, Data & Export, Danger Zone
- This is the highest-impact settings fix

**Sub-task 12B: Copy/Label Fixes (ST-01, ST-03, ST-05, ST-06, ST-07, ST-10, ST-14, ST-16, ST-18)**
- Various string and label changes

**Sub-task 12C: Profile Section (ST-04, ST-05, ST-06)**
- Remove avatar, add (read-only) label, show ISO code instead of symbol

**Sub-task 12D: Security Section (ST-07, ST-08, ST-09, ST-10)**
- Add "Manage Security" button
- Show device name, country, relative time for sessions
- Add session detail privacy note

**Sub-task 12E: Period Model Section (ST-11, ST-12)**
- Add missing fields: Start day, Duration, Generate ahead, Weekend rule, Name pattern
- Add informational note

**Sub-task 12F: Preferences (ST-13, ST-14, ST-15)**
- Remove or flag Language selector (not in design)
- Remove sub-description from compact mode
- Add informational note about preview behavior

**Sub-task 12G: Data & Export (ST-17, ST-19)**
- Add "Request account data copy" option
- Use full-width text buttons instead of compact chips

**Sub-task 12H: Danger Zone (ST-20, ST-21, ST-22)**
- Add "Transactions remain intact." to Reset Structure description
- Add "requires typed confirmation: DELETE" to Delete Account description
- Change buttons to plain outline style, remove icons

**Sub-task 12I: Mobile Fixes (ST-M01 through ST-M06)**
- ALL CAPS section labels
- Action buttons at bottom of sections
- Consolidate session rows
- Remove inline Change Password / Enable 2FA buttons
- Left-align Save Preferences

**Commit after each sub-task.**

---

### Task 13: Period Management Fixes

**Issues:** PM-01 through PM-17, PM-M01 through PM-M05

**Design spec:** `http://localhost:8001/period-management/piggypulse-period-management.html`

**Key fixes:**

**PM-01/PM-02: Title "Budget Periods" → "Periods", subtitle → "Time windows that help you track patterns"**
- String changes in `PeriodsPage.tsx`

**PM-03/PM-04: Button layout**
- Move "Create Period" and add "Edit Schedule" to top-right of page header (standard pattern)

**PM-06: Financial summary on Current Period card**
- Add Incoming/Outgoing/Net amounts to `PeriodCard.tsx` for the current period

**PM-07: Period card title format**
- Use `formatMonthYear` from Task 2 instead of "Feb/26"

**PM-08: Labelled text buttons instead of icon-only**
- Replace icon buttons with "View details" / "Edit targets" text buttons

**PM-09: Remove Delete from current period**
- Conditionally hide delete action on active/current periods

**PM-11: Simplify Create Period modal**
- Reduce from advanced sections to simple 3-field form: Period name, Start date, End date + info note

**PM-13: Schedule modal → centered modal**
- Change from bottom sheet to centered modal

**PM-15: Single Weekend Rule dropdown**
- Combine Saturday/Sunday dropdowns into one "Weekend rule" dropdown

**PM-M01: Mobile compact button**
- Replace full-width "Create Period" with compact `+` icon button top-right

**PM-M02: Mobile overflow menu**
- Add `...` more button for secondary actions

**PM-M03/PM-M04: ALL CAPS section labels + "(TIME WINDOW ENDED)" qualifier**
- String and style changes

**PM-M05: Upcoming periods disclaimer**
- Add note: "Future periods may change. Future-dated transactions will appear in the appropriate period based on date."

**Commit:**
```
fix(periods): align with design — layout, card content, modals, mobile

Resolves: PM-01 through PM-M05
```

---

### Task 14: Category Targets Fixes

**Issues:** CT-01 through CT-08

**Design spec:** No canonical design — validate against internal consistency.

**Key fixes:**

**CT-01: Remove trailing period from subtitle**
- String change

**CT-02: ISO date → human-readable**
- Wire in `formatDateRange` from Task 2

**CT-03: `$` prefix → `€` (use configured currency)**
- Amount inputs should use the configured currency symbol from global state, not hardcoded `$`

**CT-04: Remove duplicated "Mark as excluded" note**
- Show the note only once after the last section

**CT-05: Hide keyboard shortcut hint on mobile**
- Wrap in a media query or `useMediaQuery` check

**CT-06: Archived category — suppress interactive controls**
- Instead of a disabled input, show a clean read-only state matching the archive pattern elsewhere

**CT-07: "0.0%" → "0%"**
- Format whole-number percentages without decimals

**CT-08: Remove redundant "None" label**
- Rely on subtitle/placeholder instead

**Commit:**
```
fix(category-targets): align with app conventions — currency, dates, mobile

Resolves: CT-01 through CT-08
```

---

## Execution Order

**Recommended order (dependencies):**

1. **Task 1** — Currency formatting (systemic, unblocks all pages)
2. **Task 2** — Date formatting (systemic, unblocks all pages)
3. **Task 3** — Sign formatting (systemic)
4. **Tasks 4–14** — Page-by-page (can be parallelized)

**Parallel groups for page tasks:**
- Group A: Tasks 4 (Dashboard), 5 (Transactions), 14 (Category Targets)
- Group B: Tasks 6 (Accounts), 7 (Account Detail)
- Group C: Tasks 8 (Account Management), 10 (Categories Management), 11 (Vendors)
- Group D: Tasks 9 (Categories Overview), 12 (Settings), 13 (Periods)

---

## Withdrawn Issues (no action needed)

- T-13: Inline confirmation IS implemented — withdrawn
- CM-05: Design matches live — withdrawn
- CM-06: Design matches live — withdrawn

## Issues NOT addressed in this plan

- D-08: Mobile bottom nav + period drawer — needs real device testing, cannot be verified via browser
- T-17: Mobile period selector — needs real device verification
- T-19: Batch sticky defaults — needs manual verification after implementation
- T-20: Transfer From ≠ To validation — needs manual verification

---

## Total Issue Count

| Section | Total | Withdrawn | Actionable |
|---------|-------|-----------|------------|
| Dashboard | 8 | 0 | 8 |
| Transactions | 22 | 1 | 21 |
| Accounts | 14 | 0 | 14 |
| Account Detail | 15 | 0 | 15 |
| Account Management | 15 | 0 | 15 |
| Categories Overview | 15 | 0 | 15 |
| Categories Management | 16 | 2 | 14 |
| Vendors | 15 | 0 | 15 |
| Settings | 25 | 0 | 25 |
| Periods | 22 | 0 | 22 |
| Category Targets | 8 | 0 | 8 |
| **Total** | **175** | **3** | **172** |
