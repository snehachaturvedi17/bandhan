/**
 * Bandhan AI - Verification Progress Tracker
 * Shows user's verification journey with incentives for each tier
 *
 * Features:
 * - Visual progress bar (0/3, 1/3, 2/3, 3/3)
 * - Incentive cards for each tier
 * - Step-by-step verification wizard
 * - Celebration animations on completion
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Award,
  Medal,
  CheckCircle2,
  Lock,
  Gift,
  TrendingUp,
  Crown,
  ArrowRight,
  Shield,
  Video,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { VerificationTier } from "./VerificationBadge";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface VerificationProgressProps {
  currentTier: VerificationTier | null;
  completedSteps: ("phone" | "digilocker" | "video")[];
  onVerify: (step: "phone" | "digilocker" | "video") => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    title: "Verification Progress",
    subtitle: "Complete verifications to unlock benefits",
    stepsComplete: "{{completed}}/{{total}} verifications complete",
    nextStep: "Next: {{step}}",
    incentives: "Your Benefits",
    phone: {
      title: "Phone Verification",
      description: "Verify your phone number via OTP",
      benefit: "5 bonus profile views",
      cta: "Verify Phone",
    },
    digilocker: {
      title: "DigiLocker Verification",
      description: "Verify identity with government ID",
      benefit: "10% premium discount",
      cta: "Connect DigiLocker",
    },
    video: {
      title: "Video Selfie",
      description: "Quick selfie for liveness detection",
      benefit: "Priority in match suggestions",
      cta: "Record Selfie",
    },
    completed: "Completed",
    locked: "Locked",
    claim: "Claim Benefit",
    claimed: "Claimed",
  },
  hi: {
    title: "सत्यापन प्रगति",
    subtitle: "लाभ अनलॉक करने के लिए सत्यापन पूरा करें",
    stepsComplete: "{{completed}}/{{total}} सत्यापन पूर्ण",
    nextStep: "अगला: {{step}}",
    incentives: "आपके लाभ",
    phone: {
      title: "फ़ोन सत्यापन",
      description: "OTP के माध्यम से फ़ोन नंबर सत्यापित करें",
      benefit: "5 बोनस प्रोफ़ाइल दृश्य",
      cta: "फ़ोन सत्यापित करें",
    },
    digilocker: {
      title: "DigiLocker सत्यापन",
      description: "सरकारी ID के साथ पहचान सत्यापित करें",
      benefit: "10% प्रीमियम छूट",
      cta: "DigiLocker कनेक्ट करें",
    },
    video: {
      title: "वीडियो सेल्फी",
      description: "लाइवनेस डिटेक्शन के लिए त्वरित सेल्फी",
      benefit: "मैच सुझावों में प्राथमिकता",
      cta: "सेल्फी रिकॉर्ड करें",
    },
    completed: "पूर्ण",
    locked: "लॉक",
    claim: "लाभ दावा करें",
    claimed: "दावा किया गया",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Step Configuration
// ─────────────────────────────────────────────────────────────────────────────
const STEP_CONFIG = {
  phone: {
    tier: "bronze" as VerificationTier,
    icon: Smartphone,
    gradient: "from-amber-500 to-amber-600",
  },
  digilocker: {
    tier: "silver" as VerificationTier,
    icon: BadgeCheck,
    gradient: "from-gray-400 to-gray-500",
  },
  video: {
    tier: "gold" as VerificationTier,
    icon: Video,
    gradient: "from-yellow-500 to-yellow-600",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress Bar Component
// ─────────────────────────────────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full rounded-full bg-gradient-to-r from-saffron-500 via-violet-500 to-rose-500"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Card Component
// ─────────────────────────────────────────────────────────────────────────────
function StepCard({
  step,
  isCompleted,
  isNext,
  isLocked,
  onVerify,
  language,
}: {
  step: "phone" | "digilocker" | "video";
  isCompleted: boolean;
  isNext: boolean;
  isLocked: boolean;
  onVerify: () => void;
  language: "en" | "hi";
}) {
  const config = STEP_CONFIG[step];
  const t = TRANSLATIONS[language][step];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all",
        isCompleted
          ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
          : isLocked
            ? "bg-white/5 border-white/10 opacity-60"
            : "bg-white/5 border-white/20",
      )}
    >
      <div className="flex items-start space-x-4">
        {/* Step Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            isCompleted
              ? "bg-gradient-to-br from-emerald-500 to-teal-500"
              : isLocked
                ? "bg-white/10"
                : cn("bg-gradient-to-br", config.gradient),
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-white" />
          ) : isLocked ? (
            <Lock className="w-5 h-5 text-gray-500" />
          ) : (
            <Icon className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4
              className={cn(
                "text-sm font-semibold",
                isCompleted ? "text-emerald-400" : "text-white",
              )}
            >
              {t.title}
            </h4>
            {isNext && (
              <span className="px-2 py-0.5 rounded-full bg-saffron-500/20 text-saffron-400 text-xs">
                {language === "en" ? "Next" : "अगला"}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-2">{t.description}</p>

          {/* Benefit */}
          <div className="flex items-center space-x-1.5 mb-3">
            <Gift className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs text-gold-300">{t.benefit}</span>
          </div>

          {/* Action Button */}
          {isLocked ? (
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-white/5 text-gray-500 text-sm cursor-not-allowed flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{TRANSLATIONS[language].locked}</span>
            </button>
          ) : isCompleted ? (
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{TRANSLATIONS[language].completed}</span>
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onVerify}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-saffron-500 to-rose-500 text-white text-sm font-medium hover:shadow-saffron-glow transition-shadow flex items-center space-x-2"
            >
              <span>{t.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Incentive Card Component
// ─────────────────────────────────────────────────────────────────────────────
function IncentiveCard({
  tier,
  isUnlocked,
  isClaimed,
  onClaim,
  language,
}: {
  tier: VerificationTier;
  isUnlocked: boolean;
  isClaimed: boolean;
  onClaim: () => void;
  language: "en" | "hi";
}) {
  const config = {
    bronze: {
      icon: Smartphone,
      gradient: "from-amber-500/20 to-amber-600/20",
      borderColor: "border-amber-500/30",
      benefit: "5 bonus profile views",
      benefitHi: "5 बोनस प्रोफ़ाइल दृश्य",
    },
    silver: {
      icon: Award,
      gradient: "from-gray-400/20 to-gray-500/20",
      borderColor: "border-gray-400/30",
      benefit: "10% premium discount",
      benefitHi: "10% प्रीमियम छूट",
    },
    gold: {
      icon: Medal,
      gradient: "from-yellow-500/20 to-yellow-600/20",
      borderColor: "border-yellow-500/30",
      benefit: "Priority matching + 15% discount",
      benefitHi: "प्राथमिकता मिलान + 15% छूट",
    },
  };

  const tierConfig = config[tier];
  const Icon = tierConfig.icon;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "p-3 rounded-xl border transition-all",
        isUnlocked
          ? cn("bg-gradient-to-br", tierConfig.gradient, tierConfig.borderColor)
          : "bg-white/5 border-white/10 opacity-50",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isUnlocked
                ? cn("bg-gradient-to-br", tierConfig.gradient.slice(0, -3))
                : "bg-white/10",
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                isUnlocked ? "text-white" : "text-gray-500",
              )}
            />
          </div>
          <div>
            <p
              className={cn(
                "text-xs font-medium",
                isUnlocked ? "text-white" : "text-gray-500",
              )}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
            </p>
            <p className="text-xs text-gray-400">
              {language === "en" ? tierConfig.benefit : tierConfig.benefitHi}
            </p>
          </div>
        </div>

        {isUnlocked && !isClaimed && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClaim}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-saffron-500 to-rose-500 text-white text-xs font-medium"
          >
            {language === "en" ? "Claim" : "दावा"}
          </motion.button>
        )}

        {isClaimed && (
          <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
            {language === "en" ? "Claimed" : "दावा किया गया"}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function VerificationProgress({
  currentTier,
  completedSteps,
  onVerify,
}: VerificationProgressProps) {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [claimedBenefits, setClaimedBenefits] = useState<VerificationTier[]>(
    [],
  );

  const t = TRANSLATIONS[language];
  const completedCount = completedSteps.length;
  const progress = (completedCount / 3) * 100;

  const getNextStep = (): "phone" | "digilocker" | "video" | null => {
    if (!completedSteps.includes("phone")) return "phone";
    if (!completedSteps.includes("digilocker")) return "digilocker";
    if (!completedSteps.includes("video")) return "video";
    return null;
  };

  const nextStep = getNextStep();

  const handleClaim = (tier: VerificationTier) => {
    setClaimedBenefits((prev) => [...prev, tier]);
    // In production, apply the benefit here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{t.title}</h3>
          <p className="text-sm text-gray-400">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="px-3 py-1.5 rounded-lg glass-sm text-xs text-gray-400 hover:text-white transition-colors"
        >
          {language === "en" ? "हिंदी" : "English"}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {t.stepsComplete.replace(
              "{{completed}}/{{total}}",
              `${completedCount}/3`,
            )}
          </span>
          <span className="text-white font-semibold">
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar progress={progress} />
      </div>

      {/* Verification Steps */}
      <div className="space-y-3">
        <StepCard
          step="phone"
          isCompleted={completedSteps.includes("phone")}
          isNext={nextStep === "phone"}
          isLocked={false}
          onVerify={() => onVerify("phone")}
          language={language}
        />
        <StepCard
          step="digilocker"
          isCompleted={completedSteps.includes("digilocker")}
          isNext={nextStep === "digilocker"}
          isLocked={!completedSteps.includes("phone")}
          onVerify={() => onVerify("digilocker")}
          language={language}
        />
        <StepCard
          step="video"
          isCompleted={completedSteps.includes("video")}
          isNext={nextStep === "video"}
          isLocked={!completedSteps.includes("digilocker")}
          onVerify={() => onVerify("video")}
          language={language}
        />
      </div>

      {/* Incentives Section */}
      <div className="pt-4 border-t border-white/10">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>{t.incentives}</span>
        </h4>
        <div className="space-y-2">
          <IncentiveCard
            tier="bronze"
            isUnlocked={completedSteps.includes("phone")}
            isClaimed={claimedBenefits.includes("bronze")}
            onClaim={() => handleClaim("bronze")}
            language={language}
          />
          <IncentiveCard
            tier="silver"
            isUnlocked={completedSteps.includes("digilocker")}
            isClaimed={claimedBenefits.includes("silver")}
            onClaim={() => handleClaim("silver")}
            language={language}
          />
          <IncentiveCard
            tier="gold"
            isUnlocked={completedSteps.includes("video")}
            isClaimed={claimedBenefits.includes("gold")}
            onClaim={() => handleClaim("gold")}
            language={language}
          />
        </div>
      </div>

      {/* Completion Celebration */}
      {completedCount === 3 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-gold-500/20 to-yellow-500/20 border border-gold-500/30 text-center"
        >
          <Crown className="w-8 h-8 text-gold-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">
            {language === "en"
              ? "🎉 Maximum verification achieved!"
              : "🎉 अधिकतम सत्यापन प्राप्त!"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {language === "en"
              ? "You now have priority in all match suggestions"
              : "अब आपको सभी मैच सुझावों में प्राथमिकता मिलेगी"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default VerificationProgress;
