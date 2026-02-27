export function formatShortDate(isoDate: string, locale = 'en-US'): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function formatDateRange(start: string, end: string, locale = 'en-US'): string {
  return `${formatShortDate(start, locale)} \u2013 ${formatShortDate(end, locale)}`;
}

export function formatMonthYear(isoDate: string, locale = 'en-US'): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export function formatUpperShortDate(isoDate: string, locale = 'en-US'): string {
  return formatShortDate(isoDate, locale).toUpperCase();
}
