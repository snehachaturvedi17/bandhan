/**
 * Bandhan AI - Translation Hook
 * Shorthand hook for accessing translations
 *
 * Usage:
 * const { t, language, setLanguage, toggleLanguage } = useTranslation();
 *
 * // In JSX:
 * <h1>{t('auth.welcome')}</h1>
 * <p>{t('onboarding.step_of', { current: 1, total: 3 })}</p>
 */

'use client';

import { useContext } from 'react';
import { LanguageContext, Language, TranslationData } from '@/contexts/LanguageContext';

// ─────────────────────────────────────────────────────────────────────────────
// Main Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useTranslation() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error(
      'useTranslation must be used within a LanguageProvider. ' +
      'Wrap your app with <LanguageProvider> in the root layout.'
    );
  }

  const { language, setLanguage, toggleLanguage, t, isLoading, isRTL, fontClass } = context;

  return {
    /** Current language: 'en' or 'hi' */
    language,

    /** Set language explicitly */
    setLanguage,

    /** Toggle between English and Hindi */
    toggleLanguage,

    /** Translation function */
    t,

    /** Loading state (while translations are being fetched) */
    isLoading,

    /** RTL support flag (currently false for both English and Hindi) */
    isRTL,

    /** Font class for Tailwind CSS */
    fontClass,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Translation Function with Type Safety
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get translation with optional parameter interpolation
 *
 * @param key - Dot-notation key (e.g., 'auth.welcome')
 * @param params - Optional parameters for interpolation
 * @returns Translated string
 *
 * @example
 * t('common.loading') // "Loading..."
 * t('onboarding.step_of', { current: 1, total: 3 }) // "Step 1 of 3"
 * t('time.minutes_ago', { min: 5 }) // "5 minutes ago"
 */
export function useT() {
  const { t } = useTranslation();
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// Language-Specific Hooks
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Check if current language is Hindi
 */
export function useIsHindi(): boolean {
  const { language } = useTranslation();
  return language === 'hi';
}

/**
 * Check if current language is English
 */
export function useIsEnglish(): boolean {
  const { language } = useTranslation();
  return language === 'en';
}

// ─────────────────────────────────────────────────────────────────────────────
// Translation Component (for JSX)
// ─────────────────────────────────────────────────────────────────────────────
interface TProps {
  k: string;
  params?: Record<string, string | number>;
  className?: string;
  component?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li' | 'a';
  children?: React.ReactNode;
}

/**
 * Translation component for inline JSX usage
 *
 * @example
 * <T k="auth.welcome" component="h1" className="text-xl" />
 * <T k="onboarding.step_of" params={{ current: 1, total: 3 }} />
 */
export function T({ k, params, className, component: Component = 'span', children }: TProps) {
  const { t } = useTranslation();
  const translation = t(k, params);

  return (
    <Component className={className}>
      {translation}
      {children}
    </Component>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pluralization Helper
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get pluralized translation based on count
 *
 * @param key - Base translation key
 * @param count - Number for pluralization
 * @param params - Additional parameters
 *
 * @example
 * pluralize('notification', 1) // "1 notification"
 * pluralize('notification', 5) // "5 notifications"
 */
export function usePluralize() {
  const { t, language } = useTranslation();

  return (key: string, count: number, params?: Record<string, string | number>): string => {
    // Hindi pluralization is different from English
    // For simplicity, we use the same pattern for now
    const pluralKey = count === 1 ? key : `${key}_plural`;
    const translation = t(pluralKey, { ...params, count });

    // If plural key doesn't exist, fall back to singular with count
    if (translation === pluralKey) {
      return t(key, { ...params, count });
    }

    return translation;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Number Formatting
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Format numbers according to language locale
 *
 * @example
 * formatNumber(1234567) // "1,234,567" (en) or "12,34,567" (hi)
 */
export function useFormatNumber() {
  const { language } = useTranslation();

  return (number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(
      language === 'hi' ? 'hi-IN' : 'en-IN',
      options
    ).format(number);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Formatting
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Format dates according to language locale
 *
 * @example
 * formatDate(new Date()) // "January 15, 2024" (en) or "15 जनवरी, 2024" (hi)
 */
export function useFormatDate() {
  const { language } = useTranslation();

  return (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    return new Intl.DateTimeFormat(
      language === 'hi' ? 'hi-IN' : 'en-IN',
      options
    ).format(dateObj);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Relative Time Formatting
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Format relative time (e.g., "5 minutes ago")
 * Uses translations from the time namespace
 *
 * @example
 * formatRelative(Date.now() - 300000) // "5 minutes ago"
 */
export function useFormatRelativeTime() {
  const { t, language } = useTranslation();

  return (date: Date | string | number): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) {
      return t('time.just_now');
    } else if (diffMins < 60) {
      return t('time.minutes_ago', { min: diffMins });
    } else if (diffHours < 24) {
      return t('time.hours_ago', { hours: diffHours });
    } else if (diffDays < 7) {
      return t('time.days_ago', { days: diffDays });
    } else if (diffWeeks < 4) {
      return t('time.weeks_ago', { weeks: diffWeeks });
    } else if (diffMonths < 12) {
      return t('time.months_ago', { months: diffMonths });
    } else {
      return t('time.years_ago', { years: diffYears });
    }
  };
}

export default useTranslation;
