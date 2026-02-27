/**
 * Bandhan AI - Daily Limit Management Hook
 * Handles daily action limits with IST timezone reset
 *
 * Features:
 * - Tracks actions per day (resets at midnight IST)
 * - Persists to localStorage
 * - Provides remaining count and percentage
 * - Handles limit enforcement
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getISTNow,
  getSecondsUntilReset,
  formatTimeUntilReset,
  formatTimeUntilResetLocalized,
  getStorageKey,
  isPeakHours,
} from '@/lib/ist-timezone';
import {
  trackLimitReached,
  trackLimitCounterView,
  trackLimitExceedAttempt,
} from '@/lib/analytics';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface DailyLimitConfig {
  /** Maximum actions allowed per day */
  dailyLimit: number;
  /** Storage key prefix */
  storageKey: string;
  /** Action type for analytics */
  actionType: 'profiles' | 'chats' | 'likes' | 'views';
}

export interface DailyLimitState {
  /** Number of actions used today */
  used: number;
  /** Daily limit */
  limit: number;
  /** Remaining actions */
  remaining: number;
  /** Percentage used (0-100) */
  percentageUsed: number;
  /** Percentage remaining (0-100) */
  percentageRemaining: number;
  /** Whether limit has been reached */
  isLimitReached: boolean;
  /** Seconds until reset */
  secondsUntilReset: number;
  /** Formatted time until reset */
  timeUntilReset: string;
  /** Formatted time until reset (Hindi) */
  timeUntilResetHi: string;
  /** Color state for UI */
  colorState: 'green' | 'orange' | 'red';
  /** Is currently peak hours in India */
  isPeakHours: boolean;
}

export interface DailyLimitActions {
  /** Increment action count */
  increment: () => boolean;
  /** Decrement action count (for undo) */
  decrement: () => void;
  /** Reset count (admin only) */
  reset: () => void;
  /** Check if action is allowed */
  canPerformAction: () => boolean;
  /** Get current state */
  getState: () => DailyLimitState;
}

export type DailyLimitReturn = DailyLimitState & DailyLimitActions;

// ─────────────────────────────────────────────────────────────────────────────
// Default Configurations
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_LIMITS: Record<string, DailyLimitConfig> = {
  profiles: {
    dailyLimit: 5,
    storageKey: 'bandhan_daily_profiles',
    actionType: 'profiles',
  },
  chats: {
    dailyLimit: 10,
    storageKey: 'bandhan_daily_chats',
    actionType: 'chats',
  },
  likes: {
    dailyLimit: 20,
    storageKey: 'bandhan_daily_likes',
    actionType: 'likes',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────
interface StoredLimitData {
  count: number;
  date: string; // ISO date string for the day this count is for
  timestamp: number; // Unix timestamp of last update
}

function getStoredData(storageKey: string): StoredLimitData | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading limit data from storage:', error);
    return null;
  }
}

function storeData(storageKey: string, data: StoredLimitData): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing limit data:', error);
  }
}

function clearStoredData(storageKey: string): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing limit data:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────
function getColorState(percentageRemaining: number): 'green' | 'orange' | 'red' {
  if (percentageRemaining >= 50) return 'green';
  if (percentageRemaining >= 20) return 'orange';
  return 'red';
}

function getUserSegment(): 'free' | 'premium' | 'trial' {
  if (typeof localStorage === 'undefined') return 'free';

  try {
    const user = localStorage.getItem('user');
    if (!user) return 'free';

    const userData = JSON.parse(user);
    if (userData.isPremium) return 'premium';
    if (userData.isTrial) return 'trial';
    return 'free';
  } catch {
    return 'free';
  }
}

function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof navigator === 'undefined') return 'desktop';

  const userAgent = navigator.userAgent;

  if (/tablet/i.test(userAgent)) return 'tablet';
  if (/mobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Hook
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Manage daily action limits with IST timezone reset
 *
 * @param config - Limit configuration
 * @returns State and actions for managing daily limits
 *
 * @example
 * ```tsx
 * const {
 *   remaining,
 *   limit,
 *   isLimitReached,
 *   timeUntilReset,
 *   colorState,
 *   increment,
 *   canPerformAction,
 * } = useDailyLimit({
 *   dailyLimit: 5,
 *   storageKey: 'bandhan_daily_profiles',
 *   actionType: 'profiles',
 * });
 *
 * // In component:
 * <div>
 *   <p>{remaining}/{limit} profiles remaining today</p>
 *   <button
 *     onClick={() => {
 *       if (canPerformAction()) {
 *         increment();
 *         // Perform action
 *       }
 *     }}
 *   >
 *     View Profile
 *   </button>
 * </div>
 * ```
 */
export function useDailyLimit(config: DailyLimitConfig): DailyLimitReturn {
  const { dailyLimit, storageKey, actionType } = config;

  // Get today's storage key (changes daily)
  const fullStorageKey = getStorageKey(storageKey);

  // State
  const [used, setUsed] = useState<number>(0);
  const [secondsUntilReset, setSecondsUntilReset] = useState<number>(
    getSecondsUntilReset()
  );
  const [lastCheckedDate, setLastCheckedDate] = useState<string>(
    getISTNow().toISOString()
  );

  // Initialize from storage
  useEffect(() => {
    const stored = getStoredData(fullStorageKey);
    const todayKey = getStorageKey(''); // Just the date part

    if (stored && stored.date === todayKey) {
      // Data is from today, use it
      setUsed(stored.count);
    } else {
      // Data is from previous day or doesn't exist, reset
      setUsed(0);
      storeData(fullStorageKey, {
        count: 0,
        date: todayKey,
        timestamp: Date.now(),
      });
    }

    setLastCheckedDate(new Date().toISOString());
  }, [fullStorageKey]);

  // Update countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newSeconds = getSecondsUntilReset();
      setSecondsUntilReset(newSeconds);

      // Check if we've crossed into a new day
      const todayKey = getStorageKey('');
      const stored = getStoredData(fullStorageKey);

      if (stored && stored.date !== todayKey) {
        // New day, reset count
        setUsed(0);
        storeData(fullStorageKey, {
          count: 0,
          date: todayKey,
          timestamp: Date.now(),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [fullStorageKey]);

  // Track limit counter view (once per session)
  useEffect(() => {
    const hasTrackedView = sessionStorage.getItem(
      `${storageKey}_view_tracked`
    );

    if (!hasTrackedView) {
      trackLimitCounterView(dailyLimit - used, dailyLimit);
      sessionStorage.setItem(`${storageKey}_view_tracked`, 'true');
    }
  }, [used, dailyLimit, storageKey]);

  // Calculate derived values
  const remaining = Math.max(0, dailyLimit - used);
  const percentageUsed = Math.round((used / dailyLimit) * 100);
  const percentageRemaining = Math.round((remaining / dailyLimit) * 100);
  const isLimitReached = remaining <= 0;
  const colorState = getColorState(percentageRemaining);
  const timeUntilReset = formatTimeUntilReset();
  const timeUntilResetHi = formatTimeUntilResetLocalized('hi');
  const isPeak = isPeakHours();

  // Actions
  const increment = useCallback((): boolean => {
    if (used >= dailyLimit) {
      // Limit reached, track attempt
      trackLimitExceedAttempt(actionType);
      return false;
    }

    const newCount = used + 1;
    setUsed(newCount);

    // Store updated count
    storeData(fullStorageKey, {
      count: newCount,
      date: getStorageKey(''),
      timestamp: Date.now(),
    });

    // Track if limit just reached
    if (newCount >= dailyLimit) {
      trackLimitReached({
        limit_type: actionType,
        daily_limit: dailyLimit,
        used_count: newCount,
        remaining_count: 0,
        percentage_used: 100,
        time_of_day: getISTNow().getHours().toString(),
        is_peak_hours: isPeak,
        user_segment: getUserSegment(),
        device_type: getDeviceType(),
      });
    }

    return true;
  }, [used, dailyLimit, fullStorageKey, actionType, isPeak]);

  const decrement = useCallback(() => {
    if (used <= 0) return;

    const newCount = used - 1;
    setUsed(newCount);

    storeData(fullStorageKey, {
      count: newCount,
      date: getStorageKey(''),
      timestamp: Date.now(),
    });
  }, [used, fullStorageKey]);

  const reset = useCallback(() => {
    setUsed(0);
    clearStoredData(fullStorageKey);
  }, [fullStorageKey]);

  const canPerformAction = useCallback((): boolean => {
    return used < dailyLimit;
  }, [used, dailyLimit]);

  const getState = useCallback((): DailyLimitState => ({
    used,
    limit: dailyLimit,
    remaining,
    percentageUsed,
    percentageRemaining,
    isLimitReached,
    secondsUntilReset,
    timeUntilReset,
    timeUntilResetHi,
    colorState,
    isPeakHours: isPeak,
  }), [
    used,
    dailyLimit,
    remaining,
    percentageUsed,
    percentageRemaining,
    isLimitReached,
    secondsUntilReset,
    timeUntilReset,
    timeUntilResetHi,
    colorState,
    isPeak,
  ]);

  return {
    used,
    limit: dailyLimit,
    remaining,
    percentageUsed,
    percentageRemaining,
    isLimitReached,
    secondsUntilReset,
    timeUntilReset,
    timeUntilResetHi,
    colorState,
    isPeakHours: isPeak,
    increment,
    decrement,
    reset,
    canPerformAction,
    getState,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Specialized Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for profile view limits (default: 5/day)
 */
export function useProfileLimit(): DailyLimitReturn {
  return useDailyLimit(DEFAULT_LIMITS.profiles);
}

/**
 * Hook for chat limits (default: 10/day)
 */
export function useChatLimit(): DailyLimitReturn {
  return useDailyLimit(DEFAULT_LIMITS.chats);
}

/**
 * Hook for like limits (default: 20/day)
 */
export function useLikeLimit(): DailyLimitReturn {
  return useDailyLimit(DEFAULT_LIMITS.likes);
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if user has reached daily limit (without hook)
 */
export function checkDailyLimit(
  storageKey: string = 'bandhan_daily_profiles',
  dailyLimit: number = 5
): { canPerform: boolean; used: number; remaining: number } {
  const fullStorageKey = getStorageKey(storageKey);
  const stored = getStoredData(fullStorageKey);
  const todayKey = getStorageKey('');

  if (!stored || stored.date !== todayKey) {
    return { canPerform: true, used: 0, remaining: dailyLimit };
  }

  const used = stored.count;
  const remaining = dailyLimit - used;

  return {
    canPerform: remaining > 0,
    used,
    remaining,
  };
}

/**
 * Get all limit data for dashboard
 */
export function getAllLimitsData(): Record<string, DailyLimitState> {
  const result: Record<string, DailyLimitState> = {};

  for (const [key, config] of Object.entries(DEFAULT_LIMITS)) {
    const fullStorageKey = getStorageKey(config.storageKey);
    const stored = getStoredData(fullStorageKey);
    const todayKey = getStorageKey('');

    const used = stored && stored.date === todayKey ? stored.count : 0;
    const remaining = config.dailyLimit - used;

    result[key] = {
      used,
      limit: config.dailyLimit,
      remaining,
      percentageUsed: Math.round((used / config.dailyLimit) * 100),
      percentageRemaining: Math.round((remaining / config.dailyLimit) * 100),
      isLimitReached: remaining <= 0,
      secondsUntilReset: getSecondsUntilReset(),
      timeUntilReset: formatTimeUntilReset(),
      timeUntilResetHi: formatTimeUntilResetLocalized('hi'),
      colorState: getColorState(Math.round((remaining / config.dailyLimit) * 100)),
      isPeakHours: isPeakHours(),
    };
  }

  return result;
}

export default useDailyLimit;
