/**
 * Bandhan AI - Production OTP Verification Component
 * Indian-specific optimizations for PhonePe/Paytm-grade OTP flow
 *
 * Features:
 * - 6-digit OTP with auto-focus and auto-tab
 * - Persistent 30-second resend timer
 * - Carrier-specific SMS tips (Jio/Airtel/Vi)
 * - Bilingual error messages (English/Hindi)
 * - TRAI compliance disclaimer
 * - Phishing warning
 * - Retry limit tracking
 * - Success animation
 * - Screen reader accessible
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Smartphone,
  MessageSquare,
  Info,
  Eye,
  EyeOff,
  Lock,
  Timer,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  detectCarrier,
  getCarrierSmsTip,
  TRAI_DISCLAIMER,
} from "@/lib/carrier-detection";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface OTPInputProps {
  /** Phone number for display and carrier detection */
  phoneNumber: string;
  /** Callback when OTP is successfully verified */
  onVerify: (otp: string) => Promise<void>;
  /** Callback when resend is requested */
  onResend: () => Promise<void>;
  /** Initial language preference */
  language?: "en" | "hi";
  /** OTP length (default 6 for India) */
  otpLength?: number;
  /** Resend timer duration in seconds */
  resendTimer?: number;
  /** Maximum retry attempts before lockout */
  maxRetries?: number;
  /** OTP expiry time in minutes */
  expiryMinutes?: number;
}

interface OTPFormData {
  digits: { value: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Messages (Bilingual)
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  invalidOTP: {
    en: "Invalid OTP. Please check and try again.",
    hi: "अमान्य OTP। कृपया जांचें और पुनः प्रयास करें।",
  },
  otpExpired: {
    en: "OTP has expired. Please request a new one.",
    hi: "OTP समाप्त हो गया है। कृपया नया अनुरोध करें।",
  },
  networkError: {
    en: "Network error. Please check your connection and try again.",
    hi: "नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।",
  },
  tooManyAttempts: {
    en: "Too many failed attempts. Please request a new OTP.",
    hi: "बहुत सारे विफल प्रयास। कृपया नया OTP अनुरोध करें।",
  },
  otpNotReceived: {
    en: "OTP not received? Try these troubleshooting steps:",
    hi: "OTP नहीं मिला? ये ट्रबलशूटिंग चरण आज़माएं:",
  },
  phishingWarning: {
    en: "⚠️ Bandhan NEVER asks for your OTP. Never share with anyone.",
    hi: "⚠️ बंधन कभी भी आपका OTP नहीं पूछता। किसी के साथ साझा न करें।",
  },
  retryAttemptsRemaining: {
    en: (attempts: number) => `${attempts} attempts remaining`,
    hi: (attempts: number) => `${attempts} प्रयास शेष`,
  },
  lastAttempt: {
    en: "⚠️ Last attempt remaining",
    hi: "⚠️ अंतिम प्रयास शेष",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function OTPInput({
  phoneNumber,
  onVerify,
  onResend,
  language = "en",
  otpLength = 6,
  resendTimer = 30,
  maxRetries = 3,
  expiryMinutes = 5,
}: OTPInputProps) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHi, setErrorHi] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showResendTips, setShowResendTips] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [languageState, setLanguageState] = useState<"en" | "hi">(language);

  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carrier detection
  const carrier = detectCarrier(phoneNumber);
  const carrierSmsTip = carrier.smsTips[languageState];
  const carrierTroubleshooting = carrier.troubleshooting[languageState];

  // Countdown timer for resend
  const {
    remaining,
    isActive,
    isComplete: isTimerComplete,
    formatted,
    reset: resetTimer,
  } = useCountdownTimer({
    duration: resendTimer,
    storageKey: `otp-resend-${phoneNumber}`,
    autoStart: true,
    onComplete: () => {
      // Timer complete - enable resend button
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OTPFormData>({
    defaultValues: {
      digits: Array.from({ length: otpLength }, () => ({ value: "" })),
    },
    mode: "onChange",
  });

  const digits = watch("digits");
  const isComplete = digits.every((d) => d.value !== "");

  // ───────────────────────────────────────────────────────────────────────────
  // Handlers
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Handle digit input with auto-tab
   */
  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      // Only allow single digit
      const digit = value.replace(/\D/g, "").slice(-1);

      setValue(`digits.${index}.value`, digit);
      setError(null);
      setErrorHi(null);

      // Auto-tab to next input
      if (digit && index < otpLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all digits filled
      if (digit && index === otpLength - 1) {
        // Small delay for better UX
        setTimeout(() => {
          const otp = digits
            .map((d, i) => (i === index ? digit : d.value))
            .join("");
          handleSubmitOTP(otp);
        }, 150);
      }
    },
    [digits, otpLength],
  );

  /**
   * Handle backspace with auto-back
   */
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[index].value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      // Handle paste
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        navigator.clipboard.readText().then((pasted) => {
          const otpDigits = pasted.replace(/\D/g, "").slice(0, otpLength);
          otpDigits.split("").forEach((digit, i) => {
            if (i < otpLength) {
              setValue(`digits.${i}.value`, digit);
            }
          });
          // Focus on last filled or next empty
          const nextIndex = Math.min(otpDigits.length, otpLength - 1);
          inputRefs.current[nextIndex]?.focus();
        });
      }
    },
    [digits, otpLength],
  );

  /**
   * Handle OTP verification
   */
  const handleSubmitOTP = async (otp?: string) => {
    const otpValue = otp || digits.map((d) => d.value).join("");

    if (otpValue.length !== otpLength) {
      setError(ERROR_MESSAGES.invalidOTP.en);
      setErrorHi(ERROR_MESSAGES.invalidOTP.hi);
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrorHi(null);

    try {
      await onVerify(otpValue);
      setIsVerified(true);
      resetTimer();
    } catch (err: unknown) {
      const errorMessage = err as {
        userMessage?: string;
        userMessageHi?: string;
        message?: string;
      };

      // Increment retry count
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      // Check if max retries exceeded
      if (newRetryCount >= maxRetries) {
        setError(ERROR_MESSAGES.tooManyAttempts.en);
        setErrorHi(ERROR_MESSAGES.tooManyAttempts.hi);
        // Reset form
        reset();
        inputRefs.current[0]?.focus();
      } else {
        // Show error with retry count
        const remaining = maxRetries - newRetryCount;
        if (remaining === 1) {
          setError(
            `${ERROR_MESSAGES.invalidOTP.en} ${ERROR_MESSAGES.lastAttempt.en}`,
          );
          setErrorHi(
            `${ERROR_MESSAGES.invalidOTP.hi} ${ERROR_MESSAGES.lastAttempt.hi}`,
          );
        } else {
          setError(
            `${ERROR_MESSAGES.invalidOTP.en} (${ERROR_MESSAGES.retryAttemptsRemaining.en(remaining)})`,
          );
          setErrorHi(
            `${ERROR_MESSAGES.invalidOTP.hi} (${ERROR_MESSAGES.retryAttemptsRemaining.hi(remaining)})`,
          );
        }
        // Reset form for retry
        reset();
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResend = async () => {
    if (!isComplete || isTimerComplete) return;

    setIsLoading(true);
    setError(null);
    setErrorHi(null);
    setRetryCount(0);

    try {
      await onResend();
      resetTimer();
      reset();
      inputRefs.current[0]?.focus();
      setShowResendTips(false);
    } catch (err: unknown) {
      const errorMessage = err as {
        userMessage?: string;
        userMessageHi?: string;
        message?: string;
      };
      setError(errorMessage.userMessage || ERROR_MESSAGES.networkError.en);
      setErrorHi(errorMessage.userMessageHi || ERROR_MESSAGES.networkError.hi);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle language
   */
  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "en" ? "hi" : "en"));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Shield className="w-8 h-8 text-saffron-500" />
          </motion.div>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">
          {languageState === "en" ? "Verify OTP" : "OTP सत्यापित करें"}
        </h2>
        <p className="text-sm text-gray-400">
          {languageState === "en"
            ? `Enter the 6-digit code sent to ${phoneNumber}`
            : `6-अंकीय कोड दर्ज करें जो ${phoneNumber} पर भेजा गया है`}
        </p>
      </div>

      {/* Carrier SMS Tip */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 rounded-xl bg-saffron-500/10 border border-saffron-500/20"
      >
        <div className="flex items-start space-x-2">
          <MessageSquare className="w-4 h-4 text-saffron-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-saffron-200">{carrierSmsTip}</p>
        </div>
      </motion.div>

      {/* OTP Input Fields */}
      <form onSubmit={handleSubmit(() => handleSubmitOTP())}>
        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {Array.from({ length: otpLength }).map((_, index) => (
            <motion.input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[index].value}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading || isVerified}
              aria-label={
                languageState === "en"
                  ? `Digit ${index + 1} of ${otpLength}`
                  : `${otpLength} में से अंक ${index + 1}`
              }
              className={clsx(
                "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl",
                "bg-white/5 border-2 transition-all duration-200",
                "text-white placeholder-gray-600",
                "focus:outline-none focus:border-saffron-500 focus:bg-white/10",
                errors.digits?.[index]
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 hover:border-white/20",
                isLoading && "opacity-50 cursor-not-allowed",
                isVerified && "border-emerald-500/50 bg-emerald-500/10",
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </div>

        {/* Loading Spinner */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center mb-6"
            >
              <div className="flex items-center space-x-2 text-saffron-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-5 h-5" />
                </motion.div>
                <span className="text-sm">
                  {languageState === "en"
                    ? "Verifying..."
                    : "सत्यापित हो रहा है..."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence>
          {isVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-center mb-6"
            >
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-sm font-medium">
                  {languageState === "en"
                    ? "Verified successfully!"
                    : "सफलतापूर्वक सत्यापित!"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && !isVerified && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <div className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-300">{error}</p>
                  {errorHi && languageState === "hi" && (
                    <p className="text-xs text-red-400 mt-1">{errorHi}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isComplete || isLoading || isVerified}
          whileHover={{
            scale: !isComplete || isLoading || isVerified ? 1 : 1.02,
          }}
          whileTap={{
            scale: !isComplete || isLoading || isVerified ? 1 : 0.98,
          }}
          className={clsx(
            "w-full py-3.5 rounded-xl font-semibold text-white mb-4",
            "transition-all duration-300",
            isComplete && !isLoading && !isVerified
              ? "bg-gradient-to-r from-saffron-500 to-rose-500 hover:shadow-saffron-glow"
              : "bg-gray-700/50 cursor-not-allowed opacity-50",
          )}
        >
          {isLoading
            ? languageState === "en"
              ? "Verifying..."
              : "सत्यापित हो रहा है..."
            : isVerified
              ? languageState === "en"
                ? "Verified!"
                : "सत्यापित!"
              : languageState === "en"
                ? "Verify OTP"
                : "OTP सत्यापित करें"}
        </motion.button>
      </form>

      {/* Resend Section */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-400 mb-2">
          {languageState === "en"
            ? "Didn't receive the code?"
            : "कोड नहीं मिला?"}{" "}
          {isActive ? (
            <span className="text-gray-500">
              {languageState === "en" ? "Resend in" : "में पुनः भेजें"}{" "}
              {formatted}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-saffron-400 hover:text-saffron-300 font-medium inline-flex items-center space-x-1 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {languageState === "en" ? "Resend OTP" : "OTP पुनः भेजें"}
              </span>
            </button>
          )}
        </p>

        {/* Resend Tips Toggle */}
        <button
          onClick={() => setShowResendTips(!showResendTips)}
          className="text-xs text-gray-500 hover:text-gray-400 inline-flex items-center space-x-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>
            {languageState === "en"
              ? "Troubleshooting tips"
              : "ट्रबलशूटिंग टिप्स"}
          </span>
          {showResendTips ? (
            <motion.span
              initial={{ rotate: 0 }}
              animate={{ rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              ▲
            </motion.span>
          ) : (
            <span>▼</span>
          )}
        </button>

        {/* Resend Tips */}
        <AnimatePresence>
          {showResendTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left"
            >
              <p className="text-xs text-gray-300 mb-2">
                {languageState === "en"
                  ? ERROR_MESSAGES.otpNotReceived.en
                  : ERROR_MESSAGES.otpNotReceived.hi}
              </p>
              <ul className="space-y-1.5">
                {carrierTroubleshooting.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-saffron-400 mt-0.5">•</span>
                    <span className="text-xs text-gray-400">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phishing Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4"
      >
        <div className="flex items-start space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-amber-200 font-medium">
              {ERROR_MESSAGES.phishingWarning.en}
            </p>
            <p className="text-xs text-amber-300/70 mt-0.5">
              {ERROR_MESSAGES.phishingWarning.hi}
            </p>
          </div>
        </div>
      </motion.div>

      {/* TRAI Compliance Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-xs text-gray-500"
      >
        <div className="flex items-start space-x-2">
          <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-400">
              {TRAI_DISCLAIMER.en.heading}
            </p>
            <p className="mt-1">{TRAI_DISCLAIMER.en.content}</p>
            <p className="mt-1 text-gray-600">{TRAI_DISCLAIMER.hi.content}</p>
          </div>
        </div>
      </motion.div>

      {/* Expiry Notice */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-1.5 text-xs text-gray-500">
          <Timer className="w-3.5 h-3.5" />
          <span>
            {languageState === "en"
              ? `OTP expires in ${expiryMinutes} minutes`
              : `OTP ${expiryMinutes} मिनट में समाप्त हो जाता है`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export default OTPInput;
