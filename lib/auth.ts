import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (singleton pattern)
function initFirebase() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = initFirebase();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (client-side only)
export const analytics = typeof window !== 'undefined' && isSupported()
  ? getAnalytics(app)
  : null;

// ─────────────────────────────────────────────────────────────────────────────
// OTP Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send OTP to phone number using Firebase Phone Auth
 * @param phoneNumber - Phone number with country code (e.g., +919876543210)
 * @param containerId - DOM element ID for reCAPTCHA (default: 'recaptcha-container')
 * @returns ConfirmationResult for verification
 */
export async function sendOTP(
  phoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> {
  try {
    // Setup reCAPTCHA verifier (only needed once per page load)
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        containerId,
        {
          size: 'invisible',
          callback: (response: any) => {
            console.log('reCAPTCHA solved:', response);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            (window as any).recaptchaVerifier = null;
          },
          'error-callback': (error: any) => {
            console.error('reCAPTCHA error:', error);
            (window as any).recaptchaVerifier = null;
          },
        }
      );
    }

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      (window as any).recaptchaVerifier
    );

    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Verify OTP code
 * @param confirmationResult - Result from sendOTP
 * @param otp - 6-digit OTP code
 * @returns User credential on success
 */
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  otp: string
) {
  try {
    const result = await confirmationResult.confirm(otp);
    return result;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Get user-friendly error messages for Firebase Auth errors
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-phone-number': 'Please enter a valid phone number.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/quota-exceeded': 'Too many attempts. Please try again later.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/operation-not-allowed': 'Phone authentication is not enabled.',
    'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
    'auth/invalid-verification-code': 'Invalid OTP. Please try again.',
    'auth/code-expired': 'OTP has expired. Please request a new one.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/requires-recent-login': 'Please login again to continue.',
  };

  return errorMessages[errorCode] || 'Authentication failed. Please try again.';
}

/**
 * Sign out user
 */
export async function signOut() {
  try {
    const { signOut: firebaseSignOut } = await import('firebase/auth');
    await firebaseSignOut(auth);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Get Firebase ID token
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  return await user.getIdToken(forceRefresh);
}

export default auth;
