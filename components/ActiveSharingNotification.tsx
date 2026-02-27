/**
 * Bandhan AI - Active Sharing Notification
 * Persistent notification showing active location sharing status
 *
 * Features:
 * - Countdown timer (2 hours max)
 * - "Stop Sharing" button
 * - Auto-dismiss when time expires
 * - Minimal, non-intrusive design
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Clock,
  X,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ActiveSharingNotificationProps {
  remainingTime: number; // in seconds
  onStop: () => void;
  language?: "en" | "hi";
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    activeSharing: "Location Sharing Active",
    sharingWith: "Sharing with {count} contact{plural}",
    timeRemaining: "Time remaining",
    stopSharing: "Stop Sharing",
    autoStop: "Auto-stops in",
    safetyNotice: "Your location is being shared for safety purposes",
    privacyNotice: "For safety only – not for surveillance",
    ended: "Location sharing ended",
    dataDeleted: "All location data has been deleted",
  },
  hi: {
    activeSharing: "स्थान साझाकरण सक्रिय",
    sharingWith: "{count} संपर्क{plural} के साथ साझा",
    timeRemaining: "शेष समय",
    stopSharing: "साझाकरण बंद करें",
    autoStop: "में स्वतः रुक जाएगा",
    safetyNotice: "आपका स्थान सुरक्षा उद्देश्यों के लिए साझा किया जा रहा है",
    privacyNotice: "केवल सुरक्षा के लिए – निगरानी के लिए नहीं",
    ended: "स्थान साझाकरण समाप्त",
    dataDeleted: "सभी स्थान डेटा हटा दिया गया है",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Format Time Helper
// ─────────────────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatTimeHindi(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours} घंटे ${minutes} मिनट`;
  }
  if (minutes > 0) {
    return `${minutes} मिनट ${secs} सेकंड`;
  }
  return `${secs} सेकंड`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function ActiveSharingNotification({
  remainingTime,
  onStop,
  language = "en",
  className,
}: ActiveSharingNotificationProps) {
  const t = TRANSLATIONS[language];
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEndedNotification, setShowEndedNotification] = useState(false);

  // Calculate progress (2 hours = 7200 seconds)
  const maxTime = 2 * 60 * 60; // 2 hours in seconds
  const progress = ((maxTime - remainingTime) / maxTime) * 100;

  // Determine urgency color
  const getUrgencyColor = () => {
    if (remainingTime > 3600) return "from-emerald-500 to-green-600"; // > 1 hour
    if (remainingTime > 600) return "from-amber-500 to-orange-600"; // > 10 min
    return "from-rose-500 to-red-600"; // < 10 min
  };

  const urgencyColor = getUrgencyColor();

  // Show ended notification when time expires
  useEffect(() => {
    if (remainingTime <= 0) {
      setShowEndedNotification(true);
      const timer = setTimeout(() => {
        setShowEndedNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [remainingTime]);

  const handleStop = () => {
    if (
      confirm(
        language === "en"
          ? "Stop sharing your location?"
          : "अपना स्थान साझा करना बंद करें?",
      )
    ) {
      onStop();
    }
  };

  return (
    <>
      {/* Main Notification */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={cn("mb-3", className)}
      >
        <div
          className={cn(
            "rounded-2xl overflow-hidden border border-white/10",
            "bg-gradient-to-r from-midnight-900/95 to-midnight-900/90",
            "backdrop-blur-md shadow-lg",
          )}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={cn("h-full bg-gradient-to-r", urgencyColor)}
            />
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="flex items-center space-x-3">
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  "bg-gradient-to-br",
                  urgencyColor,
                )}
              >
                <Navigation className="w-5 h-5 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">
                  {t.activeSharing}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    {language === "en" ? t.timeRemaining : t.timeRemaining}:{" "}
                    <span className="text-white font-mono">
                      {language === "en"
                        ? formatTime(remainingTime)
                        : formatTimeHindi(remainingTime)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Stop Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/30 transition-colors"
              >
                {language === "en" ? t.stopSharing : t.stopSharing}
              </motion.button>

              {/* Expand Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3 pt-3 border-t border-white/10"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span>{t.safetyNotice}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <AlertCircle className="w-3 h-3" />
                      <span>{t.privacyNotice}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Ended Notification */}
      <AnimatePresence>
        {showEndedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-3"
          >
            <div className="rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-900/90 to-emerald-950/90 backdrop-blur-md shadow-lg">
              <div className="p-3 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{t.ended}</p>
                  <p className="text-xs text-emerald-300">{t.dataDeleted}</p>
                </div>
                <button
                  onClick={() => setShowEndedNotification(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ActiveSharingNotification;
