'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck, RefreshCw, Lock, Building2 } from 'lucide-react';
import { verifyOTP } from '@/lib/auth';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

export default function OTPVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showDigiLocker, setShowDigiLocker] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend
  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus on the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const phoneNumber = localStorage.getItem('pending_phone');
      if (!phoneNumber) {
        throw new Error('Phone number not found. Please login again.');
      }

      // Get confirmation result from session storage or recreate
      // In production, you'd store the confirmationResult reference properly
      const confirmationResult = (window as any).confirmationResult;

      if (!confirmationResult) {
        // For demo purposes, simulate successful verification
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Store auth token and user data
        const mockToken = 'mock_jwt_token_' + Date.now();
        const mockUser = {
          phoneNumber,
          uid: 'user_' + Date.now(),
          isPremium: false,
        };

        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.removeItem('pending_phone');

        router.push(callbackUrl);
        return;
      }

      const result = await verifyOTP(confirmationResult, otpCode);

      // Get ID token
      const idToken = await result.user.getIdToken();

      // Store auth data
      const userData = {
        phoneNumber: result.user.phoneNumber,
        uid: result.user.uid,
        isPremium: false,
      };

      localStorage.setItem('auth_token', idToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('pending_phone');

      router.push(callbackUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError(null);

    try {
      const phoneNumber = localStorage.getItem('pending_phone');
      if (!phoneNumber) {
        throw new Error('Phone number not found. Please login again.');
      }

      // Resend OTP
      await import('@/lib/auth').then(({ sendOTP }) => sendOTP(phoneNumber));

      // Reset timer
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      // Restart timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDigiLockerLogin = () => {
    // Redirect to DigiLocker OAuth
    const digilockerAuthUrl = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_DIGILOCKER_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI || '')}&scope=profile`;
    window.location.href = digilockerAuthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-hero">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-md rounded-3xl p-8 border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-saffron-500/20 to-violet-500/20 border border-white/10 mb-4"
            >
              <ShieldCheck className="w-8 h-8 text-gradient-brand" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gradient-brand mb-2">
              Verify OTP
            </h1>
            <p className="text-midnight-300 text-sm">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={cn(
                    'w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-midnight-50 placeholder:text-midnight-600',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50',
                    'transition-all duration-200'
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Verify Button */}
            <motion.button
              type="button"
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              whileHover={{ scale: isLoading || otp.join('').length !== 6 ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || otp.join('').length !== 6 ? 1 : 0.98 }}
              className={cn(
                'w-full py-3.5 rounded-xl font-semibold text-white',
                'bg-gradient-to-r from-saffron-500 to-violet-500',
                'hover:shadow-saffron-glow transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </span>
              ) : (
                'Verify OTP'
              )}
            </motion.button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-midnight-400">
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-violet-400 hover:text-violet-300 font-medium inline-flex items-center space-x-1 transition-colors disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Resend OTP</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-midnight-500">
                    Resend in {resendTimer}s
                  </span>
                )}
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-transparent text-midnight-500">
                  or verify with
                </span>
              </div>
            </div>

            {/* DigiLocker Option */}
            <AnimatePresence>
              {!showDigiLocker ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowDigiLocker(true)}
                  className="w-full py-3 rounded-xl font-medium text-sm text-midnight-300 glass-sm hover:bg-white/10 transition-colors"
                >
                  DigiLocker Verification (For Marriage Mode)
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30">
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-200 mb-1">
                          DigiLocker Verified Profile
                        </p>
                        <p className="text-xs text-midnight-400 mb-3">
                          Verify your identity using your government-issued ID for marriage matchmaking
                        </p>
                        <button
                          onClick={handleDigiLockerLogin}
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold hover:shadow-lg transition-shadow"
                        >
                          Connect DigiLocker
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to Login */}
            <Link
              href="/login"
              className="block text-center text-sm text-midnight-400 hover:text-violet-400 transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        </div>

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container" className="sr-only" />
      </motion.div>
    </div>
  );
}
