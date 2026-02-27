import { describe, expect, it } from 'vitest';
import { formatDateRange, formatMonthYear, formatShortDate } from './dateFormat';

describe('formatShortDate', () => {
  it('formats as "Feb 15"', () => {
    expect(formatShortDate('2026-02-15')).toBe('Feb 15');
  });

  it('formats as "May 1"', () => {
    expect(formatShortDate('2026-05-01')).toBe('May 1');
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
