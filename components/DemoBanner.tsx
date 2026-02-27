/**
 * Bandhan AI - Demo Mode Banner
 * Displays when demo mode is active
 *
 * Features:
 * - Red banner at top of screen
 * - "DEMO MODE" indicator
 * - Demo credentials display
 * - Hide/Dismiss option
 * - Link to disable demo mode
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  X,
  Info,
  Smartphone,
  Key,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { getDemoOTP, getDemoCredentials } from '@/hooks/useDemoMode';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function DemoBanner() {
  const { isActive, disable, showBanner, hideBanner, availableUsers, selectUser, currentUser } =
    useDemoMode();
  const [isExpanded, setIsExpanded] = useState(false);

  const credentials = getDemoCredentials();

  if (!isActive || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] safe-top"
      >
        {/* Main Banner */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Demo Mode Indicator */}
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-300" />
                </motion.div>
                <div>
                  <p className="font-bold text-sm">
                    🎭 DEMO MODE
                  </p>
                  <p className="text-xs text-red-100">
                    Using mock data - No real authentication
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-2">
                {/* Expand Button */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title={isExpanded ? 'Collapse' : 'Expand demo info'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Hide Button */}
                <button
                  onClick={hideBanner}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Hide banner (can restore in settings)"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Disable Button */}
                <button
                  onClick={disable}
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium"
                >
                  Exit Demo
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-white/20">
                    {/* Demo Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* OTP Info */}
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Key className="w-4 h-4 text-yellow-300" />
                          <span className="text-sm font-semibold">Demo OTP</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="text-2xl font-mono bg-white/20 px-3 py-1 rounded">
                            {credentials.otp}
                          </code>
                        </div>
                        <p className="text-xs text-red-100 mt-2">
                          Use this OTP for any phone number
                        </p>
                      </div>

                      {/* Phone Info */}
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Smartphone className="w-4 h-4 text-yellow-300" />
                          <span className="text-sm font-semibold">Phone Number</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono bg-white/20 px-3 py-1 rounded">
                            {credentials.phone}
                          </code>
                        </div>
                        <p className="text-xs text-red-100 mt-2">
                          {credentials.note}
                        </p>
                      </div>
                    </div>

                    {/* Demo Users */}
                    <div className="bg-white/10 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm font-semibold">Demo Profiles</span>
                        <span className="text-xs text-red-100">
                          ({availableUsers.length} available)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableUsers.map((demoUser) => (
                          <button
                            key={demoUser.id}
                            onClick={() => selectUser(demoUser.id)}
                            className={cn(
                              'p-2 rounded-lg text-left transition-colors',
                              currentUser?.id === demoUser.id
                                ? 'bg-yellow-500/30 border border-yellow-400'
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                            )}
                          >
                            <p className="text-sm font-medium truncate">
                              {demoUser.name}
                            </p>
                            <p className="text-xs text-red-100 truncate">
                              {demoUser.age} • {demoUser.city}
                            </p>
                            <p className="text-xs text-red-200 truncate">
                              {demoUser.intent.replace('-', ' ')}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="flex items-start space-x-2 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                      <Info className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-100">
                        <p className="font-semibold mb-1">Demo Mode Features:</p>
                        <ul className="space-y-1">
                          <li>• No real phone numbers or OTPs required</li>
                          <li>• Pre-created demo profiles for testing</li>
                          <li>• All features unlocked for testing</li>
                          <li>• Data resets when you exit demo mode</li>
                          <li>• Perfect for presentations and testing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="h-4 bg-gradient-to-b from-red-500/50 to-transparent" />
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Version (for mobile)
// ─────────────────────────────────────────────────────────────────────────────
export function DemoBannerCompact() {
  const { isActive, disable, showBanner, hideBanner } = useDemoMode();

  if (!isActive || !showBanner) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] safe-top"
    >
      <div className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-300" />
              <span className="font-bold text-xs">DEMO MODE</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={hideBanner}
                className="p-1 rounded hover:bg-white/10"
              >
                <X className="w-3 h-3" />
              </button>
              <button
                onClick={disable}
                className="px-2 py-1 rounded bg-white/20 text-xs"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DemoBanner;
