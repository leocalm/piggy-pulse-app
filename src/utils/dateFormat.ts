/** Formats an ISO date string as a short human-readable date (e.g. "Feb 15"). */
export function formatShortDate(isoDate: string, locale = 'en-US'): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/** Formats two ISO date strings as a range (e.g. "Feb 1 – Mar 1"). */
export function formatDateRange(start: string, end: string, locale = 'en-US'): string {
  return `${formatShortDate(start, locale)} \u2013 ${formatShortDate(end, locale)}`;
}

/** Formats an ISO date string as a long month + year (e.g. "February 2026"). */
export function formatMonthYear(isoDate: string, locale = 'en-US'): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/** Formats an ISO date string as an uppercased short date (e.g. "FEB 15"). */
export function formatUpperShortDate(isoDate: string, locale = 'en-US'): string {
  return formatShortDate(isoDate, locale).toUpperCase();
}
