# Overlays Page Visual Redesign (Design)

Date: 2026-03-04
Scope: `piggy-pulse-app` `/overlays`
Status: Approved

## 1. Objective

Redesign the Overlays page (`OverlaysPage`, `OverlayCard`) to match the design language
established by the PeriodsPage redesign. The functionality was already built; this is a
visual-only pass to bring it in line with the rest of the app.

Non-goals:
- No API or schema changes.
- No feature or behavior changes.
- No new data requirements (everything derived from the existing `Overlay` type).

## 2. Approach

In-place refactor of `OverlaysPage.tsx`, `OverlaysPage.module.css`, `OverlayCard.tsx`,
and `OverlayCard.module.css`. All hook calls, mutations, and callback props remain
unchanged.

## 3. Page Layout (`OverlaysPage`)

### Header
Replace the bare `<div>` title block with a `Group justify="space-between" align="flex-start"`
header row:
- Left: `Stack gap={4}` with `Title order={1}` + `Text c="dimmed"` subtitle.
- Right: `+ Create Overlay` button (always visible, not just in empty state).
- Mobile: header row stacks to a column via `className={classes.headerRow}`.

### Section containers
Each of the 3 sections (Active, Upcoming, Past) is wrapped in a `Paper withBorder radius="lg" p="lg"`
using the `.section` CSS class.

Active section gets a distinct container:
- Background: `linear-gradient(180deg, rgb(180, 122, 255, 0.05), transparent 45%)`
- Border color: `rgb(180, 122, 255, 0.3)`

Upcoming and Past sections use standard `var(--bg-card)` background.

### Section labels
Replace `Title order={3}` with `Text fw={600} tt="uppercase" size="xs" c="dimmed"` for
section headings, matching PeriodsPage small-uppercase label style. Count badge stays inline.

### Past section
Collapse toggle stays. The toggle button integrates into the section-container header row.

### Page root CSS
- `max-width: 1080px`, `padding: 24px` (desktop), `padding: 12px` (mobile ≤ 768px).

### Loading state
Use `min-height: 280px` on the loading container, centred.

### FAB
No changes.

## 4. Card Design (`OverlayCard`)

Switch from `Paper withBorder` to `Card withBorder` (matching PeriodCard).

### Zone 1 — Header
`Group justify="space-between" align="flex-start"`:
- Left: icon + name (`fw={700}`) stacked with date-range line (icon + dates + duration).
- Right: action icon buttons (view, edit, delete) — unchanged.

### Zone 2 — Progress (conditional on `totalCapAmount` existing)
Rendered between the header and footer:
- Amount row: spent amount left (large, monospace, bold) + `of {cap}` right (small, dimmed).
- Mantine `Progress` bar: `color="violet"` normally, `color="red"` when `spentAmount > totalCapAmount`.
- Label below bar: `€X remaining` (dimmed) or `€X over budget` (red) when overspent.

When no `totalCapAmount`: zone 2 is omitted entirely.

### Zone 3 — Footer meta row
Thin top border (`1px solid var(--border-subtle)`):
- Left: clock icon + timing label (days remaining / starts in / ended ago).
- Right: transaction count badge + inclusion mode badge.

Past cards: `opacity: 0.7` on the whole card.

### CSS accent line
`::before` pseudo-element on `.card`:
- `height: 3px`, positioned at top, `border-radius: 4px 4px 0 0`.
- Active cards: `linear-gradient(90deg, rgb(180, 122, 255), rgb(0, 212, 255))`, `opacity: 1`.
- Default/hover: same gradient, `opacity: 0` → `opacity: 1` on hover.
- Overspent: gradient `linear-gradient(90deg, rgb(255, 107, 157), rgb(255, 169, 64))`, `opacity: 1`.

## 5. Testing Strategy

Update `OverlaysPage.test.tsx` and `OverlayCard` tests where structural assertions are
impacted by the JSX changes. Preserve all behavior assertions unchanged.

## 6. Files Changed

- `src/components/Overlays/OverlaysPage.tsx`
- `src/components/Overlays/OverlaysPage.module.css`
- `src/components/Overlays/OverlayCard.tsx`
- `src/components/Overlays/OverlayCard.module.css`
- `src/components/Overlays/OverlaysPage.test.tsx` (structure assertions only)
