"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  Flower2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

type IntentType =
  | "marriage-soon"
  | "serious-relationship"
  | "friendship-networking"
  | "healing-space";

interface IntentOption {
  id: IntentType;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  gradient: string;
  iconColor: string;
}

const intentOptions: IntentOption[] = [
  {
    id: "marriage-soon",
    icon: Sparkles,
    title: "Marriage within 1-2 years",
    titleHi: "1-2 वर्षों में विवाह",
    description: "Ready to find your life partner and start a family soon",
    descriptionHi:
      "अपने जीवनसाथी को खोजने और जल्द ही परिवार शुरू करने के लिए तैयार",
    gradient: "from-saffron-500/20 to-rose-500/20",
    iconColor: "text-saffron-500",
  },
  {
    id: "serious-relationship",
    icon: Heart,
    title: "Serious relationship with marriage potential",
    titleHi: "विवाह की संभावना के साथ गंभीर संबंध",
    description: "Looking for deep connection that could lead to marriage",
    descriptionHi: "गहरा संबंध खोज रहे हैं जो विवाह तक ले जा सकता है",
    gradient: "from-violet-500/20 to-rose-500/20",
    iconColor: "text-violet-500",
  },
  {
    id: "friendship-networking",
    icon: Users,
    title: "Friendship / Networking",
    titleHi: "मित्रता / नेटवर्किंग",
    description: "Building meaningful connections within the community",
    descriptionHi: "समुदाय के भीतर सार्थक संबंध बनाना",
    gradient: "from-violet-500/20 to-blue-500/20",
    iconColor: "text-violet-400",
  },
  {
    id: "healing-space",
    icon: Flower2,
    title: "Healing space",
    titleHi: "उपचार की जगह",
    description: "Taking time to heal and grow before committing",
    descriptionHi:
      "प्रतिबद्ध होने से पहले खुद को ठीक करने और बढ़ने का समय लेना",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
];

export default function IntentSelectionPage() {
  const router = useRouter();
  const [selectedIntent, setSelectedIntent] = useState<IntentType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (intentId: IntentType) => {
    setSelectedIntent(intentId);
  };

  const handleContinue = () => {
    if (!selectedIntent) return;

    setIsAnimating(true);

    // Store intent selection
    const onboardingData = JSON.parse(
      localStorage.getItem("onboarding_data") || "{}",
    );
    onboardingData.intent = selectedIntent;
    localStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

    // Navigate to next step
    setTimeout(() => {
      router.push("/onboarding/preferences");
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero px-4 py-8 safe-top safe-bottom">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-8"
      >
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
            <Sparkles className="w-5 h-5 text-gradient-brand" />
          </div>
          <span className="text-sm font-medium text-midnight-300">
            Step 1 of 5
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient-brand mb-2">
          What brings you to Bandhan?
        </h1>
        <p className="text-midnight-300 text-sm sm:text-base">
          Choose what best describes your journey
        </p>
        <p className="text-midnight-400 text-xs mt-1 hindi-text">
          बताएं कि आप बंधन में क्यों आए हैं
        </p>
      </motion.header>

      {/* Intent Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 flex-1 flex flex-col justify-center"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {intentOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedIntent === option.id;

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  "relative cursor-pointer rounded-2xl p-5 sm:p-6 transition-all duration-300",
                  "border-2 backdrop-blur-sm",
                  isSelected
                    ? "border-saffron-500 bg-gradient-to-br " + option.gradient
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
                )}
              >
                {/* Selection Indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", duration: 0.4 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r from-saffron-500 to-rose-500 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl mb-4 flex items-center justify-center",
                    "bg-gradient-to-br",
                    option.gradient,
                    "border border-white/10",
                  )}
                >
                  <Icon className={cn("w-6 h-6", option.iconColor)} />
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-semibold text-midnight-50 mb-1">
                  {option.title}
                </h3>

                {/* Hindi Title */}
                <p className="text-xs text-midnight-400 mb-2 hindi-text">
                  {option.titleHi}
                </p>

                {/* Description */}
                <p className="text-sm text-midnight-300 mb-1">
                  {option.description}
                </p>

                {/* Hindi Description */}
                <p className="text-xs text-midnight-400 hindi-text">
                  {option.descriptionHi}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative z-10 mt-8"
      >
        <motion.button
          onClick={handleContinue}
          disabled={!selectedIntent || isAnimating}
          whileHover={{ scale: !selectedIntent ? 1 : 1.02 }}
          whileTap={{ scale: !selectedIntent ? 1 : 0.98 }}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-white",
            "flex items-center justify-center space-x-2",
            "transition-all duration-300",
            selectedIntent
              ? "bg-gradient-to-r from-saffron-500 to-violet-500 hover:shadow-saffron-glow"
              : "bg-midnight-700/50 cursor-not-allowed opacity-50",
          )}
        >
          {isAnimating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <span>Continuing...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Progress Hint */}
        <p className="text-center text-xs text-midnight-500 mt-4">
          You can change this anytime in settings
        </p>
        <p className="text-center text-xs text-midnight-600 mt-1 hindi-text">
          आप इसे सेटिंग्स में कभी भी बदल सकते हैं
        </p>
      </motion.footer>
    </div>
  );
}
