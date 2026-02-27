/**
 * Bandhan AI - Demo Mode Hook
 * Manages demo mode state and provides demo-specific functionality
 *
 * Features:
 * - URL parameter detection (?demo=true)
 * - localStorage persistence
 * - Demo user selection
 * - Demo mode banner visibility
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  isDemoMode,
  enableDemoMode,
  disableDemoMode,
  getMockCurrentUser,
  selectDemoUser,
  getDemoUsers,
  type MockUser,
} from "@/lib/mock-auth";
import { DEMO_USERS, type DemoUserProfile } from "@/data/demo-users";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface DemoModeState {
  /** Is demo mode active */
  isActive: boolean;
  /** Current demo user */
  currentUser: MockUser | null;
  /** All available demo users */
  availableUsers: DemoUserProfile[];
  /** Is demo banner visible */
  showBanner: boolean;
}

export interface DemoModeActions {
  /** Enable demo mode */
  enable: () => void;
  /** Disable demo mode */
  disable: () => void;
  /** Toggle demo mode */
  toggle: () => void;
  /** Select a demo user */
  selectUser: (userId: string) => MockUser | null;
  /** Hide demo banner */
  hideBanner: () => void;
  /** Show demo banner */
  showBanner: () => void;
}

export type DemoModeReturn = DemoModeState & DemoModeActions;

// ─────────────────────────────────────────────────────────────────────────────
// LocalStorage Keys
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  demoMode: "bandhan_demo_mode",
  demoBannerHidden: "bandhan_demo_banner_hidden",
  selectedDemoUser: "bandhan_selected_demo_user",
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────
export function useDemoMode(): DemoModeReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isActive, setIsActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  // Check for demo mode on mount and when URL changes
  useEffect(() => {
    // Check URL parameter
    const urlDemo = searchParams.get("demo") === "true";

    // Check localStorage
    const storedDemo = isDemoMode();

    // Check if banner was previously hidden
    const bannerHidden =
      localStorage.getItem(STORAGE_KEYS.demoBannerHidden) === "true";

    // Get stored user
    const storedUser = getMockCurrentUser();

    // Activate demo mode if URL param or stored
    if (urlDemo || storedDemo) {
      setIsActive(true);
      enableDemoMode();

      // Set current user
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    }

    // Set banner visibility
    setShowBanner(!bannerHidden && (urlDemo || storedDemo));
  }, [searchParams]);

  // Enable demo mode
  const enable = useCallback(() => {
    enableDemoMode();
    setIsActive(true);
    setShowBanner(true);
    localStorage.removeItem(STORAGE_KEYS.demoBannerHidden);

    // Add URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set("demo", "true");
    router.replace(url.toString());

    console.log("🎭 Demo mode enabled");
  }, [router]);

  // Disable demo mode
  const disable = useCallback(() => {
    disableDemoMode();
    setIsActive(false);
    setShowBanner(false);

    // Remove URL parameter
    const url = new URL(window.location.href);
    url.searchParams.delete("demo");
    router.replace(url.toString());

    console.log("🔒 Demo mode disabled");
  }, [router]);

  // Toggle demo mode
  const toggle = useCallback(() => {
    if (isActive) {
      disable();
    } else {
      enable();
    }
  }, [isActive, enable, disable]);

  // Select demo user
  const selectUser = useCallback((userId: string): MockUser | null => {
    const user = selectDemoUser(userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.selectedDemoUser, userId);
    }
    return user;
  }, []);

  // Hide banner
  const hideBanner = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(STORAGE_KEYS.demoBannerHidden, "true");
  }, []);

  // Show banner
  const showBannerFunc = useCallback(() => {
    setShowBanner(true);
    localStorage.removeItem(STORAGE_KEYS.demoBannerHidden);
  }, []);

  return {
    isActive,
    currentUser,
    availableUsers: DEMO_USERS,
    showBanner,
    enable,
    disable,
    toggle,
    selectUser,
    hideBanner,
    showBannerFunc,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions (non-hook)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if demo mode is active (without hook)
 */
export function checkDemoMode(): boolean {
  // Check URL (if in browser)
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("demo") === "true") {
      return true;
    }
  }

  // Check localStorage
  return isDemoMode();
}

/**
 * Get demo OTP for display
 */
export function getDemoOTP(): string {
  return "123456";
}

/**
 * Get demo credentials info
 */
export function getDemoCredentials(): {
  otp: string;
  phone: string;
  note: string;
} {
  return {
    otp: "123456",
    phone: "+91 98765 43210",
    note: "Use any Indian phone number. OTP is always 123456.",
  };
}

export default useDemoMode;
