/**
 * Bandhan AI - IST Timezone Utilities
 * Handles all date/time operations in Indian Standard Time (IST)
 * IST = UTC+5:30
 */

import { format, parseISO, differenceInSeconds, addDays } from 'date-fns';
import { toZonedTime, format as tzFormat } from 'date-fns-tz';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
export const IST_TIMEZONE = 'Asia/Kolkata';
export const IST_OFFSET_HOURS = 5.5;

// ─────────────────────────────────────────────────────────────────────────────
// Core Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current time in IST
 * @returns Date object representing current IST time
 */
export function getISTNow(): Date {
  return toZonedTime(new Date(), IST_TIMEZONE);
}

/**
 * Get today's date at midnight IST (start of day)
 * @returns Date object for today 00:00:00 IST
 */
export function getISTToday(): Date {
  const now = getISTNow();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Get tomorrow's date at midnight IST
 * @returns Date object for tomorrow 00:00:00 IST
 */
export function getISTTomorrow(): Date {
  const today = getISTToday();
  return addDays(today, 1);
}

/**
 * Get next reset time (next midnight IST)
 * @returns Date object for next reset
 */
export function getNextResetTime(): Date {
  const now = getISTNow();
  const todayMidnight = getISTToday();

  // If current time is before midnight (which it always is),
  // next reset is tomorrow midnight
  return getISTTomorrow();
}

/**
 * Calculate seconds until next reset
 * @returns Number of seconds until midnight IST
 */
export function getSecondsUntilReset(): number {
  const now = getISTNow();
  const nextReset = getNextResetTime();
  return differenceInSeconds(nextReset, now);
}

/**
 * Format time remaining until reset
 * @returns Formatted string like "4h 23m" or "23m"
 */
export function formatTimeUntilReset(): string {
  const seconds = getSecondsUntilReset();

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format time remaining with Hindi translation
 * @param language - 'en' or 'hi'
 * @returns Formatted string in specified language
 */
export function formatTimeUntilResetLocalized(language: 'en' | 'hi' = 'en'): string {
  const seconds = getSecondsUntilReset();

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (language === 'hi') {
    if (hours > 0) {
      return `${hours} घंटे ${minutes} मिनट`;
    }
    return `${minutes} मिनट`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Check if a timestamp is from today (IST)
 * @param timestamp - Unix timestamp or Date string
 * @returns true if timestamp is from today IST
 */
export function isTodayIST(timestamp: number | string): boolean {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  const zonedDate = toZonedTime(date, IST_TIMEZONE);
  const today = getISTToday();

  return (
    zonedDate.getFullYear() === today.getFullYear() &&
    zonedDate.getMonth() === today.getMonth() &&
    zonedDate.getDate() === today.getDate()
  );
}

/**
 * Get storage key for today's date (resets daily)
 * @returns String key like "2024-01-15"
 */
export function getTodayStorageKey(): string {
  const now = getISTNow();
  return tzFormat(now, 'yyyy-MM-dd', { timeZone: IST_TIMEZONE });
}

/**
 * Get full storage key with prefix
 * @param prefix - Key prefix (e.g., 'bandhan_limits')
 * @returns Full storage key
 */
export function getStorageKey(prefix: string = 'bandhan_limits'): string {
  return `${prefix}_${getTodayStorageKey()}`;
}

/**
 * Format IST date for display
 * @param date - Date to format
 * @param formatStr - Format string (default: 'dd MMM yyyy, hh:mm a')
 * @returns Formatted date string
 */
export function formatISTDate(
  date: Date = new Date(),
  formatStr: string = 'dd MMM yyyy, hh:mm a'
): string {
  const zonedDate = toZonedTime(date, IST_TIMEZONE);
  return tzFormat(zonedDate, formatStr, { timeZone: IST_TIMEZONE });
}

/**
 * Get current hour in IST (0-23)
 * @returns Current hour in IST
 */
export function getISTHour(): number {
  const now = getISTNow();
  return now.getHours();
}

/**
 * Check if current time is peak hours in India
 * Peak hours: 10AM-12PM and 6PM-9PM (when SMS delivery may be slower)
 * @returns true if current time is peak hours
 */
export function isPeakHours(): boolean {
  const hour = getISTHour();
  return (hour >= 10 && hour < 12) || (hour >= 18 && hour < 21);
}

/**
 * Get greeting based on IST time
 * @param language - 'en' or 'hi'
 * @returns Appropriate greeting
 */
export function getISTGreeting(language: 'en' | 'hi' = 'en'): string {
  const hour = getISTHour();

  if (language === 'hi') {
    if (hour >= 5 && hour < 12) return 'शुभ प्रभात';
    if (hour >= 12 && hour < 17) return 'शुभ दोपहर';
    if (hour >= 17 && hour < 21) return 'शुभ संध्या';
    return 'शुभ रात्रि';
  }

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

// ─────────────────────────────────────────────────────────────────────────────
// Countdown Timer Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get formatted countdown to reset
 * @returns Object with hours, minutes, seconds
 */
export function getCountdownToReset(): { hours: number; minutes: number; seconds: number } {
  const seconds = getSecondsUntilReset();

  return {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

/**
 * Format countdown for display (e.g., "04:23:45")
 * @returns Formatted countdown string
 */
export function formatCountdownToReset(): string {
  const { hours, minutes, seconds } = getCountdownToReset();

  return [hours, minutes, seconds]
    .map((val) => val.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Format countdown localized
 * @param language - 'en' or 'hi'
 * @returns Formatted countdown string
 */
export function formatCountdownLocalized(language: 'en' | 'hi' = 'en'): string {
  const { hours, minutes } = getCountdownToReset();

  if (language === 'hi') {
    if (hours > 0) {
      return `${hours} घंटे ${minutes} मिनट में रीसेट होगा`;
    }
    return `${minutes} मिनट में रीसेट होगा`;
  }

  if (hours > 0) {
    return `Resets in ${hours}h ${minutes}m`;
  }
  return `Resets in ${minutes}m`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export default {
  getISTNow,
  getISTToday,
  getISTTomorrow,
  getNextResetTime,
  getSecondsUntilReset,
  formatTimeUntilReset,
  formatTimeUntilResetLocalized,
  isTodayIST,
  getTodayStorageKey,
  getStorageKey,
  formatISTDate,
  getISTHour,
  isPeakHours,
  getISTGreeting,
  getCountdownToReset,
  formatCountdownToReset,
  formatCountdownLocalized,
  IST_TIMEZONE,
  IST_OFFSET_HOURS,
};
