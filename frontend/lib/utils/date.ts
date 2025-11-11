/**
 * Date Utility Functions
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

/**
 * Format date to localized string
 */
export const formatDate = (date: string | Date, format: string = 'DD MMM YYYY'): string => {
  return dayjs(date).format(format);
};

/**
 * Format datetime to localized string
 */
export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD MMM YYYY HH:mm');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

/**
 * Check if date is expired
 */
export const isExpired = (date: string | Date): boolean => {
  return dayjs(date).isBefore(dayjs());
};

/**
 * Check if date is expiring soon (within days)
 */
export const isExpiringSoon = (date: string | Date, days: number = 7): boolean => {
  return dayjs(date).isBefore(dayjs().add(days, 'day')) && !isExpired(date);
};
