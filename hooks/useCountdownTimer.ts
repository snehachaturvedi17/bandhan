/**
 * Bandhan AI - Persistent Countdown Timer Hook
 * Survives component re-renders and page navigation
 * Optimized for OTP resend timers in Indian network conditions
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface CountdownTimerOptions {
  /** Initial duration in seconds */
  duration: number;
  /** Unique key for localStorage persistence */
  storageKey: string;
  /** Callback when timer completes */
  onComplete?: () => void;
  /** Callback on each tick (receives remaining seconds) */
  onTick?: (remaining: number) => void;
  /** Auto-start timer on mount */
  autoStart?: boolean;
}

export interface CountdownTimerReturn {
  /** Remaining seconds */
  remaining: number;
  /** Whether timer is currently running */
  isActive: boolean;
  /** Whether timer has completed (reached 0) */
  isComplete: boolean;
  /** Formatted time string (e.g., "0:28" or "1:05") */
  formatted: string;
  /** Start the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset timer to initial duration */
  reset: () => void;
  /** Skip timer (set to 0 immediately) */
  skip: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_PREFIX = 'bandhan_timer_';

/**
 * Get stored timer data from localStorage
 */
function getStoredTimer(storageKey: string): {
  remaining: number;
  endTime: number | null;
} | null {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading timer from storage:', error);
    return null;
  }
}

/**
 * Store timer data to localStorage
 */
function storeTimer(
  storageKey: string,
  remaining: number,
  endTime: number | null
): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${storageKey}`,
      JSON.stringify({ remaining, endTime })
    );
  } catch (error) {
    console.error('Error storing timer to storage:', error);
  }
}

/**
 * Clear stored timer data
 */
function clearStoredTimer(storageKey: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${storageKey}`);
  } catch (error) {
    console.error('Error clearing timer from storage:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Format Helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Format seconds to MM:SS or M:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `0:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time with Hindi labels
 */
export function formatTimeHindi(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins} मिनट ${secs} सेकंड`;
  }
  return `${secs} सेकंड`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Persistent countdown timer hook
 * Survives re-renders, unmounts, and page navigation
 *
 * @param options - Timer configuration
 * @returns Timer controls and state
 *
 * @example
 * ```tsx
 * const { remaining, formatted, isActive, start, reset } = useCountdownTimer({
 *   duration: 30,
 *   storageKey: 'otp-resend',
 *   onComplete: () => console.log('Timer complete!'),
 *   autoStart: true,
 * });
 *
 * return (
 *   <div>
 *     {isActive ? (
 *       <span>Resend in {formatted}</span>
 *     ) : (
 *       <button onClick={start}>Resend OTP</button>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useCountdownTimer(options: CountdownTimerOptions): CountdownTimerReturn {
  const {
    duration,
    storageKey,
    onComplete,
    onTick,
    autoStart = true,
  } = options;

  // Refs for tracking timer state (persist across renders)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  // Update callback refs
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Initialize state from storage or default
  const initializeState = useCallback(() => {
    const stored = getStoredTimer(storageKey);

    if (stored && stored.endTime) {
      // Calculate remaining time from stored end time
      const now = Date.now();
      const calculatedRemaining = Math.max(0, Math.ceil((stored.endTime - now) / 1000));

      if (calculatedRemaining > 0) {
        return {
          remaining: calculatedRemaining,
          isActive: true,
          isComplete: false,
        };
      }
    }

    return {
      remaining: stored?.remaining ?? duration,
      isActive: false,
      isComplete: stored?.remaining === 0,
    };
  }, [storageKey, duration]);

  const [state, setState] = useState(() => initializeState());

  // Sync state with storage
  useEffect(() => {
    storeTimer(storageKey, state.remaining, state.isActive ? Date.now() + state.remaining * 1000 : null);
  }, [state.remaining, state.isActive, storageKey]);

  // Timer tick effect
  useEffect(() => {
    if (!state.isActive || state.remaining <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const newRemaining = prev.remaining - 1;

        if (newRemaining <= 0) {
          // Timer complete
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          clearStoredTimer(storageKey);
          onCompleteRef.current?.();
          return { remaining: 0, isActive: false, isComplete: true };
        }

        // Tick callback
        onTickRef.current?.(newRemaining);

        return { ...prev, remaining: newRemaining };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, storageKey]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart && !state.isActive && state.remaining > 0) {
      setState((prev) => ({ ...prev, isActive: true }));
    }
  }, [autoStart, state.isActive, state.remaining]);

  // Timer controls
  const start = useCallback(() => {
    if (state.remaining > 0) {
      setState((prev) => ({ ...prev, isActive: true, isComplete: false }));
    }
  }, [state.remaining]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isActive: false }));
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    clearStoredTimer(storageKey);
    setState({ remaining: duration, isActive: autoStart, isComplete: false });
  }, [storageKey, duration, autoStart]);

  const skip = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    clearStoredTimer(storageKey);
    setState({ remaining: 0, isActive: false, isComplete: true });
    onCompleteRef.current?.();
  }, [storageKey]);

  // Format time display
  const formatted = formatTime(state.remaining);

  return {
    remaining: state.remaining,
    isActive: state.isActive,
    isComplete: state.isComplete,
    formatted,
    start,
    pause,
    reset,
    skip,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Specialized OTP Timer Hook
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Specialized hook for OTP resend timers
 * Includes bilingual formatting and common OTP timer configurations
 */
export function useOTPResendTimer(
  duration: number = 30,
  language: 'en' | 'hi' = 'en'
): CountdownTimerReturn & {
  formattedHindi: string;
  resendLabel: { en: string; hi: string };
} {
  const timer = useCountdownTimer({
    duration,
    storageKey: 'otp-resend-timer',
    autoStart: true,
  });

  const resendLabel = {
    en: 'Resend OTP',
    hi: 'OTP पुनः भेजें',
  };

  return {
    ...timer,
    formattedHindi: formatTimeHindi(timer.remaining),
    resendLabel,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Clear all stored timers (useful on logout)
 */
export function clearAllTimers(): void {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(STORAGE_PREFIX)
  );
  keys.forEach((key) => localStorage.removeItem(key));
}

/**
 * Check if a specific timer exists
 */
export function hasTimer(storageKey: string): boolean {
  return getStoredTimer(storageKey) !== null;
}

/**
 * Get remaining time for a timer without starting it
 */
export function getTimerRemaining(storageKey: string, defaultDuration: number): number {
  const stored = getStoredTimer(storageKey);

  if (stored && stored.endTime) {
    const now = Date.now();
    return Math.max(0, Math.ceil((stored.endTime - now) / 1000));
  }

  return stored?.remaining ?? defaultDuration;
}

export default useCountdownTimer;
