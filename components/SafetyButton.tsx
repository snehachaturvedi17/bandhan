/**
 * Bandhan AI - Floating Safety Button
 * Always-visible emergency button for date safety
 *
 * Features:
 * - Red shield icon with subtle pulse animation
 * - Bottom-right corner (thumb-friendly)
 * - Haptic feedback on press
 * - Opens safety modal on click
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, Phone, Navigation, Clock } from 'lucide-react';
import { SafetyModal } from './SafetyModal';
import { ActiveSharingNotification } from './ActiveSharingNotification';
import { useActiveSharing } from '@/lib/location-tracking';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SafetyButtonProps {
  matchDetails?: {
    name: string;
    photoUrl?: string;
    chatHistory?: string;
  };
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    shareDate: 'Share My Date',
    activeSharing: 'Location Sharing Active',
    stopSharing: 'Stop Sharing',
    safetyTip: 'For safety only – not for surveillance',
    safetyTipHi: 'केवल सुरक्षा के लिए – निगरानी के लिए नहीं',
  },
  hi: {
    shareDate: 'अपनी डेट साझा करें',
    activeSharing: 'स्थान साझाकरण सक्रिय',
    stopSharing: 'साझाकरण बंद करें',
    safetyTip: 'केवल सुरक्षा के लिए – निगरानी के लिए नहीं',
    safetyTipHi: 'केवल सुरक्षा के लिए – निगरानी के लिए नहीं',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function SafetyButton({ matchDetails, className }: SafetyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const { isActive, remainingTime, stopSharing } = useActiveSharing();

  const t = TRANSLATIONS[language];

  // Haptic feedback on mount (if supported)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // Light haptic feedback
      navigator.vibrate?.(10);
    }
  }, []);

  const handlePress = () => {
    // Haptic feedback on press
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([10, 50, 10]);
    }

    if (isActive) {
      // If already sharing, show stop confirmation
      if (confirm('Stop sharing your location?')) {
        stopSharing();
      }
    } else {
      // Open safety modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Floating Safety Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn('fixed bottom-24 right-4 z-40 safe-bottom', className)}
      >
        {/* Active Sharing Notification (when sharing) */}
        <AnimatePresence>
          {isActive && (
            <ActiveSharingNotification
              remainingTime={remainingTime}
              onStop={stopSharing}
              language={language}
            />
          )}
        </AnimatePresence>

        {/* Safety Button */}
        <motion.button
          onClick={handlePress}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative w-14 h-14 rounded-full',
            'bg-gradient-to-br from-rose-500 to-red-600',
            'border-2 border-rose-400/50',
            'shadow-lg shadow-rose-500/30',
            'flex items-center justify-center',
            'hover:shadow-rose-500/50 hover:shadow-xl',
            'transition-all duration-300',
            isActive && 'from-emerald-500 to-green-600 border-emerald-400/50'
          )}
          aria-label={isActive ? t.activeSharing : t.shareDate}
        >
          {/* Pulse Animation (subtle, not annoying) */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={cn(
              'absolute inset-0 rounded-full',
              'bg-gradient-to-br from-rose-500 to-red-600',
              'blur-md',
              isActive && 'from-emerald-500 to-green-600'
            )}
          />

          {/* Icon */}
          {isActive ? (
            <Navigation className="relative z-10 w-6 h-6 text-white" />
          ) : (
            <ShieldAlert className="relative z-10 w-6 h-6 text-white" />
          )}

          {/* Active Indicator Dot */}
          {isActive && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white"
            />
          )}
        </motion.button>

        {/* Safety Tip Tooltip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <p className="text-[10px] text-gray-400 text-center">
            {language === 'en' ? t.safetyTip : t.safetyTipHi}
          </p>
        </motion.div>
      </motion.div>

      {/* Safety Modal */}
      <SafetyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        matchDetails={matchDetails}
        language={language}
      />

      {/* Language Toggle (optional, can be moved to settings) */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        className="fixed bottom-4 right-4 z-30 px-3 py-1.5 rounded-full glass-sm text-xs text-gray-400 hover:text-white transition-colors safe-bottom"
      >
        {language === 'en' ? 'हिंदी' : 'English'}
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Version (for smaller screens)
// ─────────────────────────────────────────────────────────────────────────────
export function SafetyButtonCompact({ className }: { className?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isActive, stopSharing } = useActiveSharing();

  return (
    <>
      <motion.button
        onClick={() => (isActive ? stopSharing() : setIsModalOpen(true))}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full',
          'bg-gradient-to-br from-rose-500 to-red-600',
          'border-2 border-rose-400/50',
          'shadow-lg shadow-rose-500/30',
          'flex items-center justify-center',
          isActive && 'from-emerald-500 to-green-600',
          className
        )}
      >
        {isActive ? (
          <Navigation className="w-5 h-5 text-white" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-white" />
        )}
      </motion.button>

      <SafetyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default SafetyButton;
