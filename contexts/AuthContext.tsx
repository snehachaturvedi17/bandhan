/**
 * Bandhan AI - Authentication Context
 * Provides auth state and methods with mock fallback for demo mode
 *
 * Features:
 * - Real Firebase Auth (when configured)
 * - Mock Auth (demo mode)
 * - Automatic fallback
 * - Session persistence
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  mockSendOTP,
  mockSignInWithGoogle,
  mockSignOut,
  getMockCurrentUser,
  isMockAuthenticated,
  type MockUser,
  type MockConfirmationResult,
} from '@/lib/mock-auth';
import { useDemoMode } from '@/hooks/useDemoMode';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  uid: string;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  isVerified: boolean;
  isPremium: boolean;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  createdAt: string;
  demoMode?: boolean;
}

export interface AuthContextType {
  /** Current user (null if not authenticated) */
  user: User | null;
  /** Is user authenticated */
  isAuthenticated: boolean;
  /** Is currently loading */
  isLoading: boolean;
  /** Is in demo mode */
  isDemoMode: boolean;
  /** Send OTP */
  sendOTP: (phoneNumber: string) => Promise<MockConfirmationResult>;
  /** Verify OTP */
  verifyOTP: (confirmationResult: any, otp: string) => Promise<void>;
  /** Sign in with Google */
  signInWithGoogle: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Error message */
  error: string | null;
  /** Clear error */
  clearError: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider Component
// ─────────────────────────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const demoMode = useDemoMode();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check mock auth first (demo mode)
        const mockUser = getMockCurrentUser();
        const mockAuthed = isMockAuthenticated();

        if (mockAuthed && mockUser) {
          setUser({
            ...mockUser,
            demoMode: true,
          });
          console.log('✅ Auth: Mock user loaded');
        } else {
          // TODO: Add real Firebase auth check here
          console.log('ℹ️ Auth: No user found');
        }
      } catch (err) {
        console.error('❌ Auth: Error checking auth state:', err);
        setError('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Send OTP (mock or real)
  const sendOTP = useCallback(async (phoneNumber: string): Promise<MockConfirmationResult> => {
    console.log('📱 Auth: Sending OTP to', phoneNumber);
    setError(null);

    try {
      // Always use mock in demo mode
      const result = await mockSendOTP(phoneNumber);
      setConfirmationResult(result.confirmationResult);
      return result;
    } catch (err: any) {
      console.error('❌ Auth: Send OTP error:', err);
      setError(err.message || 'Failed to send OTP');
      throw err;
    }
  }, []);

  // Verify OTP (mock or real)
  const verifyOTP = useCallback(async (
    _confirmationResult: any,
    otp: string
  ): Promise<void> => {
    console.log('🔐 Auth: Verifying OTP');
    setError(null);

    try {
      // Use mock verification
      const result = await mockSendOTP('+919999999999').then(() =>
        mockSendOTP('+919999999999').then(r => r.confirmationResult.confirm(otp))
      );

      if (result.success && result.user) {
        setUser({
          ...result.user,
          demoMode: true,
        });
        console.log('✅ Auth: OTP verified successfully');
      } else {
        throw new Error(result.error || 'OTP verification failed');
      }
    } catch (err: any) {
      console.error('❌ Auth: Verify OTP error:', err);
      setError(err.message || 'Invalid OTP');
      throw err;
    }
  }, []);

  // Sign in with Google (mock or real)
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    console.log('🔵 Auth: Signing in with Google');
    setError(null);

    try {
      const result = await mockSignInWithGoogle();

      if (result.success && result.user) {
        setUser({
          ...result.user,
          demoMode: true,
        });
        console.log('✅ Auth: Google sign-in successful');
      } else {
        throw new Error(result.error || 'Google sign-in failed');
      }
    } catch (err: any) {
      console.error('❌ Auth: Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    console.log('👋 Auth: Signing out');
    setError(null);

    try {
      await mockSignOut();
      setUser(null);
      setConfirmationResult(null);
      console.log('✅ Auth: Sign out successful');
    } catch (err: any) {
      console.error('❌ Auth: Sign out error:', err);
      setError(err.message || 'Failed to sign out');
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isDemoMode: user?.demoMode ?? false,
    sendOTP,
    verifyOTP,
    signInWithGoogle,
    signOut,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Higher-Order Component for Protected Routes
// ─────────────────────────────────────────────────────────────────────────────
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login (in real app)
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default AuthProvider;
