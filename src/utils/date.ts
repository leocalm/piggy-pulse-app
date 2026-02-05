import dayjs from 'dayjs';

/**
 * Formats a date for API submission.
 * @param date - The date to format (Date object, string, or dayjs instance)
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForApi = (date: Date | string | dayjs.Dayjs | null): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Formats a date for display in the UI.
 * @param date - The date to format (Date object, string, or dayjs instance)
 * @returns Date string in MMM D, YYYY format (e.g., "Jan 15, 2024")
 */
export const formatDisplayDate = (date: Date | string | dayjs.Dayjs): string => {
  return dayjs(date).format('MMM D, YYYY');
};

/**
 * Gets the current date in YYYY-MM-DD format for API use.
 * @returns Current date string in YYYY-MM-DD format
 */
export const getCurrentDateForApi = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

/**
 * Checks if a date is valid.
 * @param date - The date to validate
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (date: Date | string | dayjs.Dayjs): boolean => {
  return dayjs(date).isValid();
};
