'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PhoneInput, { Country, getCountryCallingCode } from 'react-phone-number-input';
import { Loader2, Shield, Globe, Smartphone, Lock } from 'lucide-react';
import { sendOTP } from '@/lib/auth';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import 'react-phone-number-input/style.css';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// Indian carriers for detection simulation
const INDIAN_CARRIERS = ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL', 'MTNL'] as const;
type Carrier = typeof INDIAN_CARRIERS[number];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedCarrier, setDetectedCarrier] = useState<Carrier | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Translations
  const t = {
    en: {
      title: 'Welcome Back',
      subtitle: 'Enter your phone number to continue',
      phoneLabel: 'Phone Number',
      sendOtp: 'Send OTP',
      sending: 'Sending OTP...',
      carrierMessage: (carrier: Carrier) => `OTP will be sent via ${carrier}`,
      termsText: 'By continuing, you agree to our',
      terms: 'Terms of Service',
      and: 'and',
      privacy: 'Privacy Policy',
      language: 'हिंदी',
    },
    hi: {
      title: 'वापस स्वागत है',
      subtitle: 'जारी रखने के लिए अपना फ़ोन नंबर दर्ज करें',
      phoneLabel: 'फ़ोन नंबर',
      sendOtp: 'OTP भेजें',
      sending: 'OTP भेजा जा रहा है...',
      carrierMessage: (carrier: Carrier) => `OTP ${carrier} के माध्यम से भेजा जाएगा`,
      termsText: 'जारी रखकर, आप हमारे',
      terms: 'सेवा की शर्तों',
      and: 'और',
      privacy: 'गोपनीयता नीति',
      language: 'English',
    },
  };

  const currentText = t[language];

  // Simulate carrier detection based on phone number prefix
  useEffect(() => {
    if (phoneNumber && phoneNumber.startsWith('+91')) {
      const numberPart = phoneNumber.slice(3);
      const firstDigit = numberPart.charAt(0);

      // Simple simulation based on first digit
      const carrierMap: Record<string, Carrier> = {
        '6': 'Jio',
        '7': 'Jio',
        '8': 'Airtel',
        '9': 'Vi (Vodafone Idea)',
      };

      const detected = carrierMap[firstDigit] || INDIAN_CARRIERS[Math.floor(Math.random() * INDIAN_CARRIERS.length)];
      setDetectedCarrier(detected);
    } else {
      setDetectedCarrier(null);
    }
  }, [phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    if (!phoneNumber.startsWith('+91') || phoneNumber.length !== 15) {
      setError('Please enter a valid Indian phone number');
      return;
    }

    setIsLoading(true);

    try {
      await sendOTP(phoneNumber);
      // Store phone number for OTP verification
      localStorage.setItem('pending_phone', phoneNumber);
      router.push(`/login/otp-verify?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
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
        {/* Language Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="absolute -top-12 right-0 flex items-center space-x-2 px-3 py-1.5 rounded-full glass-sm text-sm text-midnight-300 hover:text-violet-400 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{currentText.language}</span>
        </motion.button>

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
              <Shield className="w-8 h-8 text-gradient-brand" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gradient-brand mb-2">
              {currentText.title}
            </h1>
            <p className="text-midnight-300 text-sm">
              {currentText.subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-midnight-200">
                {currentText.phoneLabel}
              </label>
              <div className="relative">
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="Enter phone number"
                  className={cn(
                    'w-full px-4 py-3.5 pl-12 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-midnight-50 placeholder:text-midnight-400',
                    'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50',
                    'transition-all duration-200',
                    'PhoneInput--focus:border-violet-500/50'
                  )}
                />
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-400" />
              </div>

              {/* Carrier Detection Message */}
              {detectedCarrier && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-saffron-400 flex items-center space-x-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron-500" />
                  <span>{currentText.carrierMessage(detectedCarrier)}</span>
                </motion.p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
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
                  <span>{currentText.sending}</span>
                </span>
              ) : (
                currentText.sendOtp
              )}
            </motion.button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-midnight-400">
            {currentText.termsText}{' '}
            <Link href="/terms" className="text-violet-400 hover:underline">
              {currentText.terms}
            </Link>{' '}
            {currentText.and}{' '}
            <Link href="/privacy" className="text-violet-400 hover:underline">
              {currentText.privacy}
            </Link>
          </p>
        </div>

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container" className="sr-only" />
      </motion.div>
    </div>
  );
}
