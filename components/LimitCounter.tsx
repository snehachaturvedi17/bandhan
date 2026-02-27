/**
 * Bandhan AI - Daily Limit Counter Component
 * Displays remaining daily actions with progress bar and color-coded states
 *
 * Features:
 * - Progress bar visualization
 * - Color-coded states (green/orange/red)
 * - Countdown to reset
 * - Tooltip on hover
 * - Bilingual support (English/Hindi)
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Info,
  Clock,
  TrendingUp,
  Zap,
  Lock,
  Sparkles,
} from "lucide-react";
import { useDailyLimit, DailyLimitConfig } from "@/hooks/useDailyLimit";
import { PremiumUpsellModal } from "./PremiumUpsellModal";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface LimitCounterProps {
  config?: Partial<DailyLimitConfig>;
  variant?: "compact" | "default" | "expanded";
  showTooltip?: boolean;
  onLimitReached?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    profilesRemaining: "profiles remaining today",
    profileRemaining: "profile remaining today",
    chatsRemaining: "chats remaining today",
    chatRemaining: "chat remaining today",
    likesRemaining: "likes remaining today",
    likeRemaining: "like remaining today",
    resetsIn: "Resets in",
    unlimited: "Unlimited with Premium",
    upgradeTooltip: "Upgrade to Premium for unlimited profiles",
    limitReached: "Daily limit reached!",
    comeBackTomorrow: "Come back tomorrow at 12:00 AM IST",
    orUpgrade: "Or upgrade for unlimited access",
    peakHours: "Peak hours - SMS may be delayed",
  },
  hi: {
    profilesRemaining: "प्रोफ़ाइल आज शेष",
    profileRemaining: "प्रोफ़ाइल आज शेष",
    chatsRemaining: "चैट आज शेष",
    chatRemaining: "चैट आज शेष",
    likesRemaining: "लाइक आज शेष",
    likeRemaining: "लाइक आज शेष",
    resetsIn: "में रीसेट होगा",
    unlimited: "प्रीमियम के साथ असीमित",
    upgradeTooltip: "असीमित प्रोफ़ाइल के लिए प्रीमियम में अपग्रेड करें",
    limitReached: "दैनिक सीमा पहुंच गई!",
    comeBackTomorrow: "कल सुबह 12:00 बजे IST पर वापस आएं",
    orUpgrade: "या असीमित एक्सेस के लिए अपग्रेड करें",
    peakHours: "पीक आवर्स - एसएमएस में देरी हो सकती है",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress Bar Component
// ─────────────────────────────────────────────────────────────────────────────
function ProgressBar({
  percentage,
  colorState,
}: {
  percentage: number;
  colorState: "green" | "orange" | "red";
}) {
  const colorClasses = {
    green: "from-emerald-500 to-teal-500",
    orange: "from-amber-500 to-orange-500",
    red: "from-rose-500 to-red-500",
  };

  const bgColors = {
    green: "bg-emerald-500/20",
    orange: "bg-amber-500/20",
    red: "bg-rose-500/20",
  };

  return (
    <div
      className={cn(
        "w-full h-2 rounded-full overflow-hidden",
        bgColors[colorState],
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "h-full rounded-full bg-gradient-to-r",
          colorClasses[colorState],
        )}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip Component
// ─────────────────────────────────────────────────────────────────────────────
function LimitTooltip({
  isOpen,
  content,
}: {
  isOpen: boolean;
  content: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl glass-md border border-white/20 shadow-xl z-50"
        >
          <div className="text-sm text-white">{content}</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 glass-md border-r border-b border-white/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function LimitCounter({
  config = {},
  variant = "default",
  showTooltip = true,
  onLimitReached,
  className,
}: LimitCounterProps) {
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // Default config for profiles
  const fullConfig: DailyLimitConfig = {
    dailyLimit: config.dailyLimit || 5,
    storageKey: config.storageKey || "bandhan_daily_profiles",
    actionType: config.actionType || "profiles",
  };

  const {
    remaining,
    limit,
    isLimitReached,
    percentageRemaining,
    percentageUsed,
    timeUntilReset,
    colorState,
    increment,
    canPerformAction,
  } = useDailyLimit(fullConfig);

  const t = TRANSLATIONS[language];

  // Determine label based on remaining count
  const getLabel = () => {
    const actionType = fullConfig.actionType;

    if (actionType === "profiles") {
      return remaining === 1 ? t.profileRemaining : t.profilesRemaining;
    }
    if (actionType === "chats") {
      return remaining === 1 ? t.chatRemaining : t.chatsRemaining;
    }
    if (actionType === "likes") {
      return remaining === 1 ? t.likeRemaining : t.likesRemaining;
    }
    return t.profilesRemaining;
  };

  // Handle action attempt
  const handleActionAttempt = () => {
    if (canPerformAction()) {
      increment();
    } else {
      // Show upsell modal
      setShowUpsellModal(true);
      onLimitReached?.();
    }
  };

  // Variant styles
  const variantStyles = {
    compact: "h-8",
    default: "h-12",
    expanded: "h-auto p-4",
  };

  return (
    <>
      <div
        className={cn(
          "relative inline-flex items-center space-x-3",
          variantStyles[variant],
          className,
        )}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        {/* Tooltip */}
        {showTooltip && (
          <LimitTooltip
            isOpen={showTooltipState}
            content={
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-gold-400" />
                  <span className="font-semibold">{t.upgradeTooltip}</span>
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Unlimited profile views</span>
                  </li>
                  <li className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Advanced filters</span>
                  </li>
                  <li className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>See who liked you</span>
                  </li>
                </ul>
              </div>
            }
          />
        )}

        {/* Counter Display */}
        <div className="flex items-center space-x-2">
          {/* Count */}
          <div className="flex items-baseline space-x-1">
            <motion.span
              key={remaining}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={cn(
                "text-lg font-bold",
                colorState === "green" && "text-emerald-400",
                colorState === "orange" && "text-amber-400",
                colorState === "red" && "text-rose-400",
              )}
            >
              {remaining}
            </motion.span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-400">{limit}</span>
          </div>

          {/* Label */}
          <span className="text-xs text-gray-400 hidden sm:inline">
            {getLabel()}
          </span>
        </div>

        {/* Progress Bar (default and expanded variants) */}
        {variant !== "compact" && (
          <div className="w-24 sm:w-32">
            <ProgressBar percentage={percentageUsed} colorState={colorState} />
          </div>
        )}

        {/* Reset Timer */}
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>
            {t.resetsIn} {timeUntilReset}
          </span>
        </div>

        {/* Peak Hours Indicator */}
        {/* Uncomment if you want to show peak hours warning */}
        {/* isPeakHours && (
          <div className="flex items-center space-x-1 text-xs text-amber-400">
            <Info className="w-3 h-3" />
            <span className="hidden sm:inline">{t.peakHours}</span>
          </div>
        )} */}

        {/* Limit Reached Badge */}
        {isLimitReached && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-rose-500/20 border border-rose-500/30"
          >
            <Lock className="w-3 h-3 text-rose-400" />
            <span className="text-xs text-rose-300">{t.limitReached}</span>
          </motion.div>
        )}

        {/* Premium CTA (when limit is low or reached) */}
        {remaining <= 2 && !isLimitReached && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowUpsellModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-500/20 to-saffron-500/20 border border-gold-500/30 hover:border-gold-500/50 transition-colors"
          >
            <Crown className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs text-gold-300 hidden sm:inline">
              {t.unlimited}
            </span>
          </motion.button>
        )}
      </div>

      {/* Premium Upsell Modal */}
      <PremiumUpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        triggerSource="limit_reached"
        limitType={fullConfig.actionType as "profiles" | "chats" | "likes"}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Version (for header/navbar)
// ─────────────────────────────────────────────────────────────────────────────
export function LimitCounterCompact({
  config,
  className,
}: Omit<LimitCounterProps, "variant">) {
  return (
    <LimitCounter
      {...{ config, className }}
      variant="compact"
      showTooltip={false}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Expanded Version (for dedicated section)
// ─────────────────────────────────────────────────────────────────────────────
export function LimitCounterExpanded({
  config,
  onUpgrade,
  className,
}: Omit<LimitCounterProps, "variant"> & { onUpgrade?: () => void }) {
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const fullConfig: DailyLimitConfig = {
    dailyLimit: config?.dailyLimit || 5,
    storageKey: config?.storageKey || "bandhan_daily_profiles",
    actionType: config?.actionType || "profiles",
  };

  const {
    remaining,
    limit,
    isLimitReached,
    percentageUsed,
    timeUntilReset,
    colorState,
  } = useDailyLimit(fullConfig);

  const t = TRANSLATIONS[language];

  return (
    <>
      <div
        className={cn(
          "w-full p-4 rounded-2xl glass-md border border-white/10",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-gold-400" />
            <h3 className="text-sm font-semibold text-white">
              {language === "en" ? "Daily Limit" : "दैनिक सीमा"}
            </h3>
          </div>
          {isLimitReached && (
            <span className="px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs">
              {t.limitReached}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <ProgressBar percentage={percentageUsed} colorState={colorState} />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-baseline space-x-2">
            <span
              className={cn(
                "text-xl font-bold",
                colorState === "green" && "text-emerald-400",
                colorState === "orange" && "text-amber-400",
                colorState === "red" && "text-rose-400",
              )}
            >
              {remaining}
            </span>
            <span className="text-gray-400">/ {limit}</span>
            <span className="text-gray-500">{t.profilesRemaining}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              {t.resetsIn} {timeUntilReset}
            </span>
          </div>
        </div>

        {/* Upgrade CTA */}
        {isLimitReached && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUpsellModal(true)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white text-sm font-semibold hover:shadow-saffron-glow transition-shadow"
              >
                {language === "en" ? "Unlock Premium" : "प्रीमियम अनलॉक करें"}
              </button>
              <button
                onClick={onUpgrade}
                className="px-4 py-2.5 rounded-xl glass-sm border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-colors"
              >
                {language === "en" ? "Remind Tomorrow" : "कल याद दिलाएं"}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              {t.comeBackTomorrow}
            </p>
          </motion.div>
        )}
      </div>

      <PremiumUpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        triggerSource="limit_reached"
        limitType={fullConfig.actionType}
      />
    </>
  );
}

export default LimitCounter;
