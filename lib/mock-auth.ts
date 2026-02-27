/**
 * Bandhan AI - Mock Authentication Service
 * Simulates Firebase Auth for demo/testing without real API keys
 *
 * Features:
 * - Mock OTP sending/verification
 * - Demo user accounts
 * - Session persistence
 * - Realistic delays
 *
 * Demo Credentials:
 * - OTP: 123456 (always valid)
 * - Any Indian phone number (+91XXXXXXXXXX)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface MockUser {
  id: string;
  uid: string;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  isVerified: boolean;
  isPremium: boolean;
  verificationLevel: "bronze" | "silver" | "gold";
  createdAt: string;
  demoMode: boolean;
}

export interface MockAuthResult {
  success: boolean;
  user?: MockUser;
  token?: string;
  error?: string;
}

export interface MockConfirmationResult {
  confirmationResult: {
    confirm: (otp: string) => Promise<MockAuthResult>;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Delay Helper
// ─────────────────────────────────────────────────────────────────────────────
function mockDelay(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock OTP Storage
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_OTP = "123456";
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface StoredOTP {
  otp: string;
  phone: string;
  timestamp: number;
}

let storedOTP: StoredOTP | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Mock Auth Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send OTP (mock)
 * @param phoneNumber - Indian phone number (+91XXXXXXXXXX)
 * @returns Mock confirmation result
 */
export async function mockSendOTP(
  phoneNumber: string,
): Promise<MockConfirmationResult> {
  console.log("📱 MOCK: sendOTP called with", phoneNumber);

  // Validate phone number format
  const digits = phoneNumber.replace(/\D/g, "");
  if (!digits.startsWith("91") || digits.length !== 12) {
    await mockDelay(500);
    throw {
      code: "auth/invalid-phone-number",
      message: "Invalid Indian phone number. Must start with +91.",
    };
  }

  // Simulate network delay
  await mockDelay(1000);

  // Store OTP
  storedOTP = {
    otp: MOCK_OTP,
    phone: phoneNumber,
    timestamp: Date.now(),
  };

  console.log("✅ MOCK: OTP sent successfully:", MOCK_OTP);

  return {
    confirmationResult: {
      confirm: async (otp: string) => mockVerifyOTP(otp),
    },
  };
}

/**
 * Verify OTP (mock)
 * @param otp - 6-digit OTP code
 * @returns Auth result with user data
 */
export async function mockVerifyOTP(otp: string): Promise<MockAuthResult> {
  console.log("🔐 MOCK: verifyOTP called with", otp);

  // Simulate network delay
  await mockDelay(800);

  // Check OTP
  if (otp !== MOCK_OTP) {
    console.log("❌ MOCK: Invalid OTP");
    return {
      success: false,
      error: "Invalid OTP. Please use 123456 for demo.",
    };
  }

  // Check if OTP exists and not expired
  if (!storedOTP) {
    console.log("❌ MOCK: No OTP sent");
    return {
      success: false,
      error: "No OTP sent. Please request one first.",
    };
  }

  if (Date.now() - storedOTP.timestamp > OTP_EXPIRY_MS) {
    console.log("❌ MOCK: OTP expired");
    storedOTP = null;
    return {
      success: false,
      error: "OTP expired. Please request a new one.",
    };
  }

  // Create mock user
  const user: MockUser = {
    id: `demo_user_${Date.now()}`,
    uid: `mock_uid_${Date.now()}`,
    name: "Demo User",
    phone: storedOTP.phone,
    email: undefined,
    avatarUrl: undefined,
    isVerified: true,
    isPremium: false,
    verificationLevel: "bronze",
    createdAt: new Date().toISOString(),
    demoMode: true,
  };

  // Generate mock token
  const token = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

  // Store in localStorage
  localStorage.setItem("mock_auth_token", token);
  localStorage.setItem("mock_user", JSON.stringify(user));
  localStorage.setItem("demo_mode", "true");

  console.log("✅ MOCK: OTP verified successfully");
  console.log("👤 MOCK: User created:", user);

  // Clear stored OTP
  storedOTP = null;

  return {
    success: true,
    user,
    token,
  };
}

/**
 * Sign in with Google (mock)
 * @returns Mock auth result
 */
export async function mockSignInWithGoogle(): Promise<MockAuthResult> {
  console.log("🔵 MOCK: signInWithGoogle called");

  // Simulate network delay
  await mockDelay(1500);

  const user: MockUser = {
    id: `google_user_${Date.now()}`,
    uid: `mock_google_uid_${Date.now()}`,
    name: "Google Demo User",
    email: "demo@gmail.com",
    phone: "",
    avatarUrl: "https://ui-avatars.com/api/?name=Google+User&background=random",
    isVerified: true,
    isPremium: false,
    verificationLevel: "bronze",
    createdAt: new Date().toISOString(),
    demoMode: true,
  };

  const token = `mock_google_token_${Date.now()}`;

  // Store in localStorage
  localStorage.setItem("mock_auth_token", token);
  localStorage.setItem("mock_user", JSON.stringify(user));
  localStorage.setItem("demo_mode", "true");

  console.log("✅ MOCK: Google sign-in successful");

  return {
    success: true,
    user,
    token,
  };
}

/**
 * Sign out (mock)
 */
export async function mockSignOut(): Promise<void> {
  console.log("👋 MOCK: signOut called");

  // Simulate delay
  await mockDelay(300);

  // Clear localStorage
  localStorage.removeItem("mock_auth_token");
  localStorage.removeItem("mock_user");
  localStorage.removeItem("demo_mode");

  console.log("✅ MOCK: Sign out successful");
}

/**
 * Get current mock user
 */
export function getMockCurrentUser(): MockUser | null {
  try {
    const userStr = localStorage.getItem("mock_user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get mock auth token
 */
export function getMockAuthToken(): string | null {
  return localStorage.getItem("mock_auth_token");
}

/**
 * Check if in demo mode
 */
export function isDemoMode(): boolean {
  return localStorage.getItem("demo_mode") === "true";
}

/**
 * Enable demo mode
 */
export function enableDemoMode(): void {
  localStorage.setItem("demo_mode", "true");
  console.log("🎭 MOCK: Demo mode enabled");
}

/**
 * Disable demo mode
 */
export function disableDemoMode(): void {
  localStorage.removeItem("demo_mode");
  console.log("🔒 MOCK: Demo mode disabled");
}

/**
 * Check if mock user is authenticated
 */
export function isMockAuthenticated(): boolean {
  const token = getMockAuthToken();
  const user = getMockCurrentUser();
  return !!(token && user);
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo User Selection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Select a demo user profile
 */
export function selectDemoUser(userId: string): MockUser | null {
  console.log("👤 MOCK: selectDemoUser called with", userId);

  const demoUsers = getDemoUsers();
  const selectedUser = demoUsers.find((u) => u.id === userId);

  if (!selectedUser) {
    console.log("❌ MOCK: Demo user not found");
    return null;
  }

  // Store selected user
  localStorage.setItem("mock_user", JSON.stringify(selectedUser));
  localStorage.setItem("demo_mode", "true");

  console.log("✅ MOCK: Demo user selected:", selectedUser.name);

  return selectedUser;
}

/**
 * Get all demo users
 */
export function getDemoUsers(): MockUser[] {
  // Import demo users from data file
  const { DEMO_USERS } = require("@/data/demo-users");
  return DEMO_USERS;
}

/**
 * Get demo OTP for display
 */
export function getDemoOTP(): string {
  return MOCK_OTP;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Firebase Auth Wrapper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mock Firebase Auth object
 * Use this instead of real Firebase Auth in demo mode
 */
export const mockAuth = {
  sendOTP: mockSendOTP,
  verifyOTP: mockVerifyOTP,
  signInWithGoogle: mockSignInWithGoogle,
  signOut: mockSignOut,
  getCurrentUser: getMockCurrentUser,
  isDemoMode,
  enableDemoMode,
  disableDemoMode,
  isDemoAuthenticated: isMockAuthenticated,
  selectDemoUser,
  getDemoUsers,
};

export default mockAuth;
