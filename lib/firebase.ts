/**
 * Bandhan AI - Firebase Authentication Module
 * Optimized for Indian SMS OTP authentication
 * Region: asia-south1 (Mumbai)
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration (India Region - asia-south1)
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  // India-specific configuration
  // Firebase automatically routes to nearest region (asia-south1 for India)
};

// ─────────────────────────────────────────────────────────────────────────────
// Firebase App Initialization (Singleton Pattern)
// ─────────────────────────────────────────────────────────────────────────────
let app: FirebaseApp;
let auth: Auth;

function initializeFirebase(): FirebaseApp {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(app);
    // Set persistence for Indian networks (may have intermittent connectivity)
    // Note: In v9+, persistence is indexedDB by default for web
  }
  return auth;
}

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  initializeFirebase();
  getFirebaseAuth();
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface OTPResult {
  success: boolean;
  confirmationResult?: ConfirmationResult;
  error?: AuthError;
}

export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Indian Carrier Detection
// ─────────────────────────────────────────────────────────────────────────────
const INDIAN_CARRIERS = [
  { prefix: ['6', '7'], name: 'Jio' },
  { prefix: ['7', '8', '9'], name: 'Airtel' },
  { prefix: ['7', '8', '9'], name: 'Vi (Vodafone Idea)' },
  { prefix: ['6', '7', '8', '9'], name: 'BSNL' },
  { prefix: ['9'], name: 'MTNL' },
] as const;

function detectIndianCarrier(phoneNumber: string): string | null {
  // Extract digits after +91
  const digits = phoneNumber.replace(/\D/g, '');
  if (!digits.startsWith('91') || digits.length !== 12) {
    return null;
  }

  const firstDigit = digits.charAt(2);

  // Simple carrier detection based on first digit
  // Note: This is approximate; MNP (Mobile Number Portability) makes exact detection difficult
  if (['6', '7'].includes(firstDigit)) return 'Jio';
  if (['8'].includes(firstDigit)) return 'Airtel';
  if (['9'].includes(firstDigit)) return 'Vi (Vodafone Idea)';

  return 'Unknown Carrier';
}

// ─────────────────────────────────────────────────────────────────────────────
// reCAPTCHA Setup
// ─────────────────────────────────────────────────────────────────────────────
let recaptchaVerifier: RecaptchaVerifier | null = null;

function getRecaptchaVerifier(authInstance: Auth): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(authInstance, 'recaptcha-container', {
      size: 'invisible',
      callback: (response: string) => {
        console.log('reCAPTCHA solved:', response);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        recaptchaVerifier = null;
      },
      'error-callback': (error: Error) => {
        console.error('reCAPTCHA error:', error);
        recaptchaVerifier = null;
      },
    });
  }
  return recaptchaVerifier;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Message Mapping for Indian Users
// ─────────────────────────────────────────────────────────────────────────────
function getAuthErrorMessage(errorCode: string): AuthError {
  const errorMessages: Record<string, Omit<AuthError, 'code'>> = {
    'auth/invalid-phone-number': {
      message: 'The phone number format is invalid.',
      userMessage: 'Invalid phone number format. Please enter a valid 10-digit Indian mobile number with +91 prefix.',
    },
    'auth/missing-phone-number': {
      message: 'Phone number is required.',
      userMessage: 'Please enter your phone number.',
    },
    'auth/quota-exceeded': {
      message: 'SMS quota exceeded.',
      userMessage: 'Too many OTP requests. Please try again after 30 seconds or use a different number.',
    },
    'auth/too-many-requests': {
      message: 'Too many attempts.',
      userMessage: 'Too many attempts. Please try again after 15 minutes.',
    },
    'auth/operation-not-allowed': {
      message: 'Phone authentication is not enabled.',
      userMessage: 'Phone authentication is currently unavailable. Please try again later.',
    },
    'auth/captcha-check-failed': {
      message: 'reCAPTCHA verification failed.',
      userMessage: 'Security verification failed. Please refresh the page and try again.',
    },
    'auth/invalid-verification-code': {
      message: 'Invalid OTP code.',
      userMessage: 'Invalid OTP. Please check and enter the correct 6-digit code.',
    },
    'auth/code-expired': {
      message: 'OTP has expired.',
      userMessage: 'OTP has expired. Please request a new one.',
    },
    'auth/network-request-failed': {
      message: 'Network error.',
      userMessage: 'Network error. Please check your internet connection and try again.',
    },
    'auth/requires-recent-login': {
      message: 'Recent login required.',
      userMessage: 'Please login again to continue.',
    },
    'auth/credential-already-in-use': {
      message: 'Phone number already registered.',
      userMessage: 'This phone number is already registered. Please login instead.',
    },
    'auth/account-exists-with-different-credential': {
      message: 'Account exists with different login method.',
      userMessage: 'This phone number is linked to a different login method. Please use that instead.',
    },
  };

  const errorInfo = errorMessages[errorCode] || {
    message: 'Authentication failed.',
    userMessage: 'Authentication failed. Please try again.',
  };

  return {
    code: errorCode,
    ...errorInfo,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Phone Number Validation for Indian Numbers
// ─────────────────────────────────────────────────────────────────────────────
function validateIndianPhoneNumber(phoneNumber: string): { valid: boolean; error?: string } {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Check for +91 prefix
  if (!cleaned.startsWith('+91')) {
    return {
      valid: false,
      error: 'Indian numbers must start with +91',
    };
  }

  // Check total length (+91 + 10 digits = 12 characters)
  if (cleaned.length !== 13) {
    return {
      valid: false,
      error: 'Phone number must be 10 digits after +91',
    };
  }

  // Check if remaining digits are valid Indian mobile format
  const numberPart = cleaned.substring(3);
  if (!/^[6-9]\d{9}$/.test(numberPart)) {
    return {
      valid: false,
      error: 'Invalid Indian mobile number. Must start with 6, 7, 8, or 9.',
    };
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send OTP to Indian phone number
 * @param phoneNumber - Phone number with +91 prefix (e.g., +919876543210)
 * @returns Promise<OTPResult> with success status and confirmation result
 *
 * @example
 * const result = await sendOTP('+919876543210');
 * if (result.success) {
 *   // OTP sent, store result.confirmationResult for verification
 * } else {
 *   // Handle error with result.error.userMessage
 * }
 */
export async function sendOTP(phoneNumber: string): Promise<OTPResult> {
  try {
    // Validate phone number format
    const validation = validateIndianPhoneNumber(phoneNumber);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          code: 'auth/invalid-phone-number',
          message: validation.error || 'Invalid phone number',
          userMessage: validation.error || 'Please enter a valid Indian phone number with +91 prefix.',
        },
      };
    }

    const authInstance = getFirebaseAuth();

    // Ensure reCAPTCHA container exists
    if (!document.getElementById('recaptcha-container')) {
      const container = document.createElement('div');
      container.id = 'recaptcha-container';
      container.className = 'sr-only';
      document.body.appendChild(container);
    }

    // Get or create reCAPTCHA verifier
    const verifier = getRecaptchaVerifier(authInstance);

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(
      authInstance,
      phoneNumber,
      verifier
    );

    // Detect carrier for user feedback
    const carrier = detectIndianCarrier(phoneNumber);
    console.log(`OTP sent via ${carrier || 'SMS gateway'}`);

    return {
      success: true,
      confirmationResult,
    };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    const authError = getAuthErrorMessage(firebaseError.code || 'auth/unknown-error');

    console.error('Send OTP Error:', {
      code: authError.code,
      message: authError.message,
      carrier: detectIndianCarrier(phoneNumber),
    });

    return {
      success: false,
      error: authError,
    };
  }
}

/**
 * Verify OTP code
 * @param confirmationResult - Result from sendOTP function
 * @param otp - 6-digit OTP code entered by user
 * @returns Promise<UserCredential> on success
 *
 * @example
 * const credential = await verifyOTP(confirmationResult, '123456');
 * // User is now signed in
 */
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<UserCredential> {
  try {
    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      throw {
        code: 'auth/invalid-verification-code',
        message: 'OTP must be 6 digits',
      };
    }

    const result = await confirmationResult.confirm(otp);

    // Store auth token in localStorage for persistence
    const idToken = await result.user.getIdToken();
    localStorage.setItem('auth_token', idToken);
    localStorage.setItem('user', JSON.stringify({
      uid: result.user.uid,
      phoneNumber: result.user.phoneNumber,
      email: result.user.email,
      displayName: result.user.displayName,
    }));

    return result;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    const authError = getAuthErrorMessage(firebaseError.code || 'auth/unknown-error');

    console.error('Verify OTP Error:', authError);

    throw authError;
  }
}

/**
 * Sign in with Google OAuth
 * @returns Promise<UserCredential> on success
 *
 * @example
 * const credential = await signInWithGoogle();
 * // User is now signed in with Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const authInstance = getFirebaseAuth();
    const provider = new GoogleAuthProvider();

    // Customize Google sign-in for Indian users
    provider.setCustomParameters({
      // Prompt for consent each time for security
      prompt: 'select_account',
      // Hindi locale option (can be extended)
      hl: 'en',
    });

    // Add scopes if needed
    provider.addScope('email');
    provider.addScope('profile');

    const result = await signInWithPopup(authInstance, provider);

    // Store auth token
    const idToken = await result.user.getIdToken();
    localStorage.setItem('auth_token', idToken);
    localStorage.setItem('user', JSON.stringify({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      provider: 'google',
    }));

    return result;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };

    // Handle common Google sign-in errors
    if (firebaseError.code === 'auth/popup-closed-by-user') {
      throw {
        code: 'auth/popup-closed-by-user',
        message: 'Sign-in popup was closed.',
        userMessage: 'Sign-in was cancelled. Please try again.',
      };
    }

    if (firebaseError.code === 'auth/account-exists-with-different-credential') {
      throw {
        code: 'auth/account-exists-with-different-credential',
        message: 'Account exists with different login method.',
        userMessage: 'This email is already registered with a different login method. Please use phone OTP instead.',
      };
    }

    throw {
      code: firebaseError.code || 'auth/unknown-error',
      message: firebaseError.message || 'Google sign-in failed.',
      userMessage: 'Google sign-in failed. Please try again or use phone OTP.',
    };
  }
}

/**
 * Sign out user
 * @returns Promise<void>
 *
 * @example
 * await signOut();
 * // User is now signed out
 */
export async function signOut(): Promise<void> {
  try {
    const authInstance = getFirebaseAuth();
    await firebaseSignOut(authInstance);

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('pending_phone');
    localStorage.removeItem('confirmation_result');

    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    // Still clear local storage even if Firebase sign out fails
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    throw error;
  }
}

/**
 * Get current authenticated user
 * @returns User | null
 *
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   // User is signed in
 * }
 */
export function getCurrentUser(): User | null {
  const authInstance = getFirebaseAuth();
  return authInstance.currentUser;
}

/**
 * Get Firebase ID token (force refresh if needed)
 * @param forceRefresh - Force token refresh
 * @returns Promise<string | null>
 *
 * @example
 * const token = await getIdToken(true);
 * // Use token for API calls
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Get ID token error:', error);
    return null;
  }
}

/**
 * Listen for auth state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 *
 * @example
 * const unsubscribe = onAuthStateChange((user) => {
 *   if (user) {
 *     // User is signed in
 *   } else {
 *     // User is signed out
 *   }
 * });
 *
 * // Later, call unsubscribe() to stop listening
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const authInstance = getFirebaseAuth();
  return onAuthStateChanged(authInstance, callback);
}

/**
 * Check if user is authenticated
 * @returns boolean
 *
 * @example
 * if (isAuthenticated()) {
 *   // Proceed with authenticated action
 * }
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Resend OTP (with cooldown check)
 * @param phoneNumber - Phone number to resend OTP
 * @param lastSentTime - Timestamp when last OTP was sent
 * @returns Promise<OTPResult>
 *
 * @example
 * const result = await resendOTP('+919876543210', Date.now() - 35000);
 * // Can resend if 30 seconds have passed
 */
export async function resendOTP(
  phoneNumber: string,
  lastSentTime: number
): Promise<OTPResult> {
  const cooldownPeriod = 30000; // 30 seconds
  const timeElapsed = Date.now() - lastSentTime;

  if (timeElapsed < cooldownPeriod) {
    const remainingTime = Math.ceil((cooldownPeriod - timeElapsed) / 1000);
    return {
      success: false,
      error: {
        code: 'auth/cooldown-active',
        message: `Please wait ${remainingTime} seconds before resending OTP.`,
        userMessage: `Please wait ${remainingTime} seconds before requesting a new OTP.`,
      },
    };
  }

  return sendOTP(phoneNumber);
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export { app, auth };
export default auth;
