/**
 * Bandhan AI - Verification Badge System
 * Multi-tier trust badges that visually communicate verification levels
 *
 * Tiers:
 * - Bronze: Phone verified (respectable, not "basic")
 * - Silver: DigiLocker verified (identity confirmed)
 * - Gold: Video + DigiLocker (maximum trust)
 *
 * Design Principles:
 * - All badges look prestigious (no "unverified" label)
 * - Subtle animations (not distracting)
 * - Clear visual hierarchy
 * - Bilingual tooltips
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Award,
  Medal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Info,
  Sparkles,
  Crown,
  Video,
  IdCard,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type VerificationTier = 'bronze' | 'silver' | 'gold';

export interface VerificationBadgeProps {
  tier: VerificationTier;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
  onClick?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const BADGE_TRANSLATIONS = {
  en: {
    bronze: {
      label: 'Phone Verified',
      tooltip: 'Phone number verified via OTP',
      benefit: 'Basic matching enabled',
      description: 'This user has verified their phone number',
    },
    silver: {
      label: 'Identity Verified',
      tooltip: 'Identity verified via DigiLocker',
      benefit: 'Advanced filters unlocked',
      description: 'This user has verified their identity with DigiLocker',
    },
    gold: {
      label: 'Premium Verified',
      tooltip: 'Identity + face verified',
      benefit: 'Priority matching + 10% discount',
      description: 'This user has completed maximum verification',
    },
  },
  hi: {
    bronze: {
      label: 'फ़ोन सत्यापित',
      tooltip: 'फ़ोन नंबर OTP के माध्यम से सत्यापित',
      benefit: 'बुनियादी मिलान सक्षम',
      description: 'इस उपयोगकर्ता ने अपना फ़ोन नंबर सत्यापित किया है',
    },
    silver: {
      label: 'पहचान सत्यापित',
      tooltip: 'DigiLocker के माध्यम से पहचान सत्यापित',
      benefit: 'उन्नत फ़िल्टर अनलॉक',
      description: 'इस उपयोगकर्ता ने DigiLocker के साथ अपनी पहचान सत्यापित की है',
    },
    gold: {
      label: 'प्रीमियम सत्यापित',
      tooltip: 'पहचान + चेहरा सत्यापित',
      benefit: 'प्राथमिकता मिलान + 10% छूट',
      description: 'इस उपयोगकर्ता ने अधिकतम सत्यापन पूरा किया है',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Badge Configurations
// ─────────────────────────────────────────────────────────────────────────────
const BADGE_CONFIG = {
  bronze: {
    icon: Smartphone,
    gradient: 'from-amber-600 via-amber-500 to-amber-600',
    bgGradient: 'from-amber-500/20 to-amber-600/20',
    borderColor: 'border-amber-500/40',
    shadowColor: 'shadow-amber-500/20',
    textColor: 'text-amber-400',
    iconColor: 'text-amber-300',
    pulseColor: 'shadow-amber-500/30',
    order: 1,
  },
  silver: {
    icon: Award,
    gradient: 'from-gray-400 via-gray-300 to-gray-400',
    bgGradient: 'from-gray-400/20 to-gray-300/20',
    borderColor: 'border-gray-400/40',
    shadowColor: 'shadow-gray-400/20',
    textColor: 'text-gray-300',
    iconColor: 'text-gray-200',
    pulseColor: 'shadow-gray-400/30',
    order: 2,
  },
  gold: {
    icon: Medal,
    gradient: 'from-yellow-500 via-yellow-400 to-yellow-500',
    bgGradient: 'from-yellow-500/20 to-yellow-400/20',
    borderColor: 'border-yellow-500/40',
    shadowColor: 'shadow-yellow-500/20',
    textColor: 'text-yellow-400',
    iconColor: 'text-yellow-300',
    pulseColor: 'shadow-yellow-500/40',
    order: 3,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Size Configurations
// ─────────────────────────────────────────────────────────────────────────────
const SIZE_CONFIG = {
  sm: {
    container: 'w-5 h-5',
    icon: 'w-3 h-3',
    tooltip: 'text-xs',
  },
  md: {
    container: 'w-6 h-6',
    icon: 'w-4 h-4',
    tooltip: 'text-sm',
  },
  lg: {
    container: 'w-8 h-8',
    icon: 'w-5 h-5',
    tooltip: 'text-base',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip Component
// ─────────────────────────────────────────────────────────────────────────────
function BadgeTooltip({
  tier,
  language,
  children,
}: {
  tier: VerificationTier;
  language: 'en' | 'hi';
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const t = BADGE_TRANSLATIONS[language][tier];
  const config = BADGE_CONFIG[tier];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 10,
          scale: isVisible ? 1 : 0.95,
        }}
        transition={{ duration: 0.15 }}
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
          'pointer-events-none',
          isVisible ? 'visible' : 'invisible'
        )}
      >
        <div className={cn(
          'px-3 py-2 rounded-xl glass-md border border-white/20 shadow-xl whitespace-nowrap',
          SIZE_CONFIG.md.tooltip
        )}>
          <div className="flex items-center space-x-2 mb-1">
            <config.icon className={cn('w-4 h-4', config.iconColor)} />
            <span className="font-semibold text-white">{t.label}</span>
          </div>
          <p className="text-gray-300 text-xs">{t.tooltip}</p>
          <div className="mt-1.5 pt-1.5 border-t border-white/10">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span className="text-gold-300 text-xs">{t.benefit}</span>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 glass-md border-r border-b border-white/20" />
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Badge Component
// ─────────────────────────────────────────────────────────────────────────────
export function VerificationBadge({
  tier,
  size = 'md',
  showTooltip = true,
  className,
  onClick,
}: VerificationBadgeProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const config = BADGE_CONFIG[tier];
  const sizes = SIZE_CONFIG[size];
  const Icon = config.icon;

  const badgeContent = (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative rounded-full flex items-center justify-center',
        'bg-gradient-to-br',
        config.bgGradient,
        'border',
        config.borderColor,
        sizes.container,
        onClick && 'cursor-pointer hover:scale-110 transition-transform',
        className
      )}
      whileHover={onClick ? { scale: 1.1 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      {/* Shine effect for Gold badge */}
      {tier === 'gold' && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent"
        />
      )}

      {/* Subtle pulse for Gold badge */}
      {tier === 'gold' && (
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
            'bg-gradient-to-br',
            config.gradient,
            'blur-md',
            config.pulseColor
          )}
        />
      )}

      {/* Badge icon */}
      <Icon className={cn('relative z-10', sizes.icon, config.iconColor)} />
    </motion.div>
  );

  if (showTooltip) {
    return (
      <BadgeTooltip tier={tier} language={language}>
        {badgeContent}
      </BadgeTooltip>
    );
  }

  return badgeContent;
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge Group Component (for showing all earned badges)
// ─────────────────────────────────────────────────────────────────────────────
export function VerificationBadgeGroup({
  tiers,
  size = 'md',
}: {
  tiers: VerificationTier[];
  size?: 'sm' | 'md' | 'lg';
}) {
  // Sort by tier order
  const sortedTiers = [...tiers].sort(
    (a, b) => BADGE_CONFIG[b].order - BADGE_CONFIG[a].order
  );

  return (
    <div className="flex items-center space-x-1">
      {sortedTiers.map((tier) => (
        <VerificationBadge
          key={tier}
          tier={tier}
          size={size}
          showTooltip
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Badge (for inline use with names)
// ─────────────────────────────────────────────────────────────────────────────
export function VerificationBadgeInline({
  tier,
  className,
}: {
  tier: VerificationTier;
  className?: string;
}) {
  return (
    <VerificationBadge
      tier={tier}
      size="sm"
      showTooltip
      className={cn('inline-block align-middle', className)}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Large Badge (for profile headers)
// ─────────────────────────────────────────────────────────────────────────────
export function VerificationBadgeLarge({
  tier,
  showLabel = true,
  language = 'en',
}: {
  tier: VerificationTier;
  showLabel?: boolean;
  language?: 'en' | 'hi';
}) {
  const config = BADGE_CONFIG[tier];
  const t = BADGE_TRANSLATIONS[language][tier];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center space-x-2 px-3 py-1.5 rounded-full',
        'bg-gradient-to-r',
        config.bgGradient,
        'border',
        config.borderColor
      )}
    >
      <div className={cn(
        'relative rounded-full flex items-center justify-center',
        'bg-gradient-to-br',
        config.gradient,
        'w-8 h-8'
      )}>
        {tier === 'gold' && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent"
          />
        )}
        <Icon className="relative z-10 w-5 h-5 text-white" />
      </div>
      {showLabel && (
        <div>
          <p className={cn('text-sm font-semibold', config.textColor)}>
            {t.label}
          </p>
          <p className="text-xs text-gray-400">{t.benefit}</p>
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Verification Status Component (for profile settings)
// ─────────────────────────────────────────────────────────────────────────────
export function VerificationStatus({
  currentTier,
  onUpgrade,
}: {
  currentTier: VerificationTier | null;
  onUpgrade: (tier: VerificationTier) => void;
}) {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const tiers: { tier: VerificationTier; locked: boolean }[] = [
    { tier: 'bronze', locked: !currentTier || ['silver', 'gold'].includes(currentTier) ? false : currentTier !== 'bronze' },
    { tier: 'silver', locked: currentTier !== 'silver' && currentTier !== 'gold' },
    { tier: 'gold', locked: currentTier !== 'gold' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {language === 'en' ? 'Verification Status' : 'सत्यापन स्थिति'}
        </h3>
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="text-xs text-gray-400 hover:text-white"
        >
          {language === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      <div className="space-y-3">
        {tiers.map(({ tier, locked }) => {
          const config = BADGE_CONFIG[tier];
          const t = BADGE_TRANSLATIONS[language][tier];
          const Icon = config.icon;
          const isEarned = !locked;

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border transition-all',
                isEarned
                  ? cn('bg-gradient-to-r', config.bgGradient, config.borderColor)
                  : 'bg-white/5 border-white/10'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isEarned
                    ? cn('bg-gradient-to-br', config.gradient)
                    : 'bg-white/10'
                )}>
                  {isEarned ? (
                    <Icon className="w-5 h-5 text-white" />
                  ) : (
                    <Shield className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    isEarned ? 'text-white' : 'text-gray-500'
                  )}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-400">{t.description}</p>
                </div>
              </div>

              {isEarned ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <button
                  onClick={() => onUpgrade(tier)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-saffron-500 to-rose-500 text-white text-xs font-medium hover:shadow-saffron-glow transition-shadow"
                >
                  {language === 'en' ? 'Verify' : 'सत्यापित करें'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default VerificationBadge;
