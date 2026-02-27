"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  Clock,
  HandHeart,
  MessageCircleHeart,
  Cigarette,
  Wine,
  Moon,
  Smartphone,
  Home,
  PartyPopper,
  BatteryCharging,
  Church,
  MapPin,
  Building2,
  Plane,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Step = "love-languages" | "dealbreakers" | "weekend" | "vision";

interface LoveLanguage {
  id: string;
  label: string;
  labelHi: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Dealbreaker {
  id: string;
  label: string;
  labelHi: string;
  levels: string[];
}

interface WeekendOption {
  id: string;
  label: string;
  labelHi: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface VisionOption {
  id: string;
  label: string;
  labelHi: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const loveLanguages: LoveLanguage[] = [
  {
    id: "family-elders",
    label: "Caring for family elders",
    labelHi: "परिवार के बुजुर्गों की देखभाल",
    description:
      "Showing love through respect and care for parents/grandparents",
    icon: HandHeart,
  },
  {
    id: "quality-time",
    label: "Quality time together",
    labelHi: "एक साथ गुणवत्तापूर्ण समय",
    description: "Undivided attention and shared experiences",
    icon: Clock,
  },
  {
    id: "acts-of-service",
    label: "Acts of service",
    labelHi: "सेवा के कार्य",
    description: "Helping with tasks and responsibilities",
    icon: Users,
  },
  {
    id: "words-of-affirmation",
    label: "Words of affirmation",
    labelHi: "पुष्टि के शब्द",
    description: "Verbal appreciation and encouragement",
    icon: MessageCircleHeart,
  },
  {
    id: "physical-touch",
    label: "Physical touch",
    labelHi: "शारीरिक स्पर्श",
    description: "Holding hands, hugs, and affectionate gestures",
    icon: Heart,
  },
];

const dealbreakers: Dealbreaker[] = [
  {
    id: "smoking",
    label: "Smoking",
    labelHi: "धूम्रपान",
    levels: [
      "Dealbreaker",
      "Dislike but acceptable",
      "Don't mind",
      "I do it too",
    ],
  },
  {
    id: "drinking",
    label: "Drinking alcohol",
    labelHi: "शराब पीना",
    levels: [
      "Dealbreaker",
      "Occasional is fine",
      "Don't mind",
      "I enjoy it too",
    ],
  },
  {
    id: "late-night",
    label: "Late-night outings",
    labelHi: "देर रात बाहर जाना",
    levels: [
      "Never acceptable",
      "With friends/family",
      "Occasionally",
      "I do it too",
    ],
  },
  {
    id: "social-media",
    label: "Social media usage",
    labelHi: "सोशल मीडिया उपयोग",
    levels: [
      "Minimal preferred",
      "Moderate is fine",
      "Don't mind",
      "Very active myself",
    ],
  },
];

const weekendOptions: WeekendOption[] = [
  {
    id: "family-time",
    label: "Family time",
    labelHi: "परिवार के साथ समय",
    description: "Spending weekends with parents and relatives",
    icon: Home,
  },
  {
    id: "friends-outings",
    label: "Friends outings",
    labelHi: "दोस्तों के साथ आउटिंग",
    description: "Cafes, movies, or activities with friends",
    icon: PartyPopper,
  },
  {
    id: "solo-recharge",
    label: "Solo recharge",
    labelHi: "एकांत में रीचार्ज",
    description: "Quiet time at home for self-care",
    icon: BatteryCharging,
  },
  {
    id: "temple-gurdwara",
    label: "Temple/Gurdwara",
    labelHi: "मंदिर/गुरुद्वारा",
    description: "Spiritual visits and community service",
    icon: Church,
  },
];

const visionOptions: VisionOption[] = [
  {
    id: "hometown-settled",
    label: "Settled in hometown",
    labelHi: "गृहनगर में बस गए",
    description: "Living close to family with strong roots",
    icon: MapPin,
  },
  {
    id: "metro-career",
    label: "Metro career growth",
    labelHi: "मेट्रो में करियर विकास",
    description: "Building career in Bangalore/Mumbai/Delhi/etc.",
    icon: Building2,
  },
  {
    id: "abroad-migration",
    label: "Abroad migration",
    labelHi: "विदेश में प्रवास",
    description: "Planning to settle in US/UK/Canada/Australia",
    icon: Plane,
  },
  {
    id: "flexible",
    label: "Open to opportunities",
    labelHi: "अवसरों के लिए खुला",
    description: "Location depends on career/family needs",
    icon: Briefcase,
  },
];

const steps: { id: Step; label: string; labelHi: string }[] = [
  { id: "love-languages", label: "Love Languages", labelHi: "प्यार की भाषाएँ" },
  { id: "dealbreakers", label: "Dealbreakers", labelHi: "सौदेबाजी" },
  { id: "weekend", label: "Weekend", labelHi: "सप्ताहांत" },
  { id: "vision", label: "5-Year Vision", labelHi: "5 वर्ष की दृष्टि" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ValuesPersonalityPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("love-languages");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [loveLanguagesSelected, setLoveLanguagesSelected] = useState<string[]>(
    [],
  );
  const [dealbreakerLevels, setDealbreakerLevels] = useState<
    Record<string, number>
  >({});
  const [weekendSelected, setWeekendSelected] = useState<string[]>([]);
  const [visionSelected, setVisionSelected] = useState<string | null>(null);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const handleBack = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const toggleLoveLanguage = (id: string) => {
    setLoveLanguagesSelected((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const setDealbreakerLevel = (id: string, level: number) => {
    setDealbreakerLevels((prev) => ({ ...prev, [id]: level }));
  };

  const toggleWeekend = (id: string) => {
    setWeekendSelected((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    );
  };

  const selectVision = (id: string) => {
    setVisionSelected(id);
  };

  const canProceed = () => {
    switch (currentStep) {
      case "love-languages":
        return loveLanguagesSelected.length >= 1;
      case "dealbreakers":
        return Object.keys(dealbreakerLevels).length >= 2;
      case "weekend":
        return weekendSelected.length >= 1;
      case "vision":
        return visionSelected !== null;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const valuesData = {
        loveLanguages: loveLanguagesSelected,
        dealbreakers: dealbreakerLevels,
        weekendPreferences: weekendSelected,
        fiveYearVision: visionSelected,
      };

      // Store onboarding data
      const onboardingData = JSON.parse(
        localStorage.getItem("onboarding_data") || "{}",
      );
      onboardingData.values = valuesData;
      localStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/onboarding/complete");
    } catch (error) {
      console.error("Error saving values:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "love-languages":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-midnight-50 mb-2">
                How do you express and receive love?
              </h2>
              <p className="text-sm text-midnight-300">
                Select all that resonate with you
              </p>
              <p className="text-xs text-midnight-400 mt-1 hindi-text">
                आप प्यार कैसे व्यक्त करते हैं और प्राप्त करते हैं?
              </p>
            </div>

            <div className="space-y-3">
              {loveLanguages.map((lang, index) => {
                const Icon = lang.icon;
                const isSelected = loveLanguagesSelected.includes(lang.id);

                return (
                  <motion.button
                    key={lang.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => toggleLoveLanguage(lang.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border transition-all duration-200",
                      "flex items-center space-x-4 text-left",
                      isSelected
                        ? "bg-gradient-to-r from-rose-500/20 to-violet-500/20 border-rose-500/50"
                        : "bg-white/5 border-white/10 hover:border-white/20",
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "bg-gradient-to-br from-rose-500/30 to-violet-500/30"
                          : "bg-white/5",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          isSelected ? "text-rose-400" : "text-midnight-400",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium text-sm",
                          isSelected ? "text-midnight-50" : "text-midnight-200",
                        )}
                      >
                        {lang.label}
                      </p>
                      <p className="text-xs text-midnight-400 hindi-text">
                        {lang.labelHi}
                      </p>
                      <p className="text-xs text-midnight-500 mt-1">
                        {lang.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <p className="text-xs text-center text-midnight-500">
              Selected: {loveLanguagesSelected.length} of 5
            </p>
          </div>
        );

      case "dealbreakers":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-midnight-50 mb-2">
                What are your dealbreakers?
              </h2>
              <p className="text-sm text-midnight-300">
                Rate your tolerance for each behavior
              </p>
              <p className="text-xs text-midnight-400 mt-1 hindi-text">
                आपकी सौदेबाजी क्या हैं?
              </p>
            </div>

            <div className="space-y-4">
              {dealbreakers.map((breaker, index) => (
                <motion.div
                  key={breaker.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-sm rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {breaker.id === "smoking" && (
                      <Cigarette className="w-5 h-5 text-midnight-400" />
                    )}
                    {breaker.id === "drinking" && (
                      <Wine className="w-5 h-5 text-midnight-400" />
                    )}
                    {breaker.id === "late-night" && (
                      <Moon className="w-5 h-5 text-midnight-400" />
                    )}
                    {breaker.id === "social-media" && (
                      <Smartphone className="w-5 h-5 text-midnight-400" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-midnight-200">
                        {breaker.label}
                      </p>
                      <p className="text-xs text-midnight-400 hindi-text">
                        {breaker.labelHi}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {breaker.levels.map((level, levelIndex) => {
                      const isSelected =
                        dealbreakerLevels[breaker.id] === levelIndex;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            setDealbreakerLevel(breaker.id, levelIndex)
                          }
                          className={cn(
                            "w-full py-2.5 px-3 rounded-lg text-xs font-medium transition-all duration-200",
                            "flex items-center justify-between",
                            isSelected
                              ? "bg-gradient-to-r from-violet-500/30 to-saffron-500/30 text-midnight-50 border border-violet-500/50"
                              : "bg-white/5 text-midnight-300 border border-white/10 hover:border-white/20",
                          )}
                        >
                          <span>{level}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-violet-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-center text-midnight-500">
              Answered: {Object.keys(dealbreakerLevels).length} of{" "}
              {dealbreakers.length}
            </p>
          </div>
        );

      case "weekend":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-midnight-50 mb-2">
                How do you spend your weekends?
              </h2>
              <p className="text-sm text-midnight-300">
                Select your typical weekend activities
              </p>
              <p className="text-xs text-midnight-400 mt-1 hindi-text">
                आप अपने सप्ताहांत कैसे बिताते हैं?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {weekendOptions.map((option, index) => {
                const Icon = option.icon;
                const isSelected = weekendSelected.includes(option.id);

                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => toggleWeekend(option.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-200",
                      "flex flex-col items-center text-center space-y-3",
                      isSelected
                        ? "bg-gradient-to-br from-violet-500/20 to-saffron-500/20 border-violet-500/50"
                        : "bg-white/5 border-white/10 hover:border-white/20",
                    )}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        isSelected
                          ? "bg-gradient-to-br from-violet-500/30 to-saffron-500/30"
                          : "bg-white/5",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-7 h-7",
                          isSelected ? "text-violet-400" : "text-midnight-400",
                        )}
                      />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "font-medium text-sm",
                          isSelected ? "text-midnight-50" : "text-midnight-200",
                        )}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-midnight-400 hindi-text">
                        {option.labelHi}
                      </p>
                      <p className="text-xs text-midnight-500 mt-1">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <p className="text-xs text-center text-midnight-500">
              Selected: {weekendSelected.length} of 4
            </p>
          </div>
        );

      case "vision":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-midnight-50 mb-2">
                Where do you see yourself in 5 years?
              </h2>
              <p className="text-sm text-midnight-300">
                Select your long-term vision
              </p>
              <p className="text-xs text-midnight-400 mt-1 hindi-text">
                आप अपने आप को 5 साल में कहाँ देखते हैं?
              </p>
            </div>

            <div className="space-y-3">
              {visionOptions.map((option, index) => {
                const Icon = option.icon;
                const isSelected = visionSelected === option.id;

                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => selectVision(option.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border transition-all duration-200",
                      "flex items-center space-x-4 text-left",
                      isSelected
                        ? "bg-gradient-to-r from-saffron-500/20 to-violet-500/20 border-saffron-500/50"
                        : "bg-white/5 border-white/10 hover:border-white/20",
                    )}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "bg-gradient-to-br from-saffron-500/30 to-violet-500/30"
                          : "bg-white/5",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-7 h-7",
                          isSelected ? "text-saffron-400" : "text-midnight-400",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium text-sm",
                          isSelected ? "text-midnight-50" : "text-midnight-200",
                        )}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-midnight-400 hindi-text">
                        {option.labelHi}
                      </p>
                      <p className="text-xs text-midnight-500 mt-1">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-saffron-400 flex-shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 safe-top safe-bottom">
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
        className="relative z-10 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-500/20 to-violet-500/20 flex items-center justify-center border border-white/10">
              <Heart className="w-5 h-5 text-gradient-brand" />
            </div>
            <span className="text-sm font-medium text-midnight-300">
              Step 3 of 3
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-midnight-400">
              {currentStepIndex + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-saffron-500 to-violet-500 rounded-full"
          />
        </div>

        {/* Step Tabs */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() =>
                  index < currentStepIndex && setCurrentStep(step.id)
                }
                className={cn(
                  "flex flex-col items-center space-y-1",
                  index < currentStepIndex
                    ? "cursor-pointer"
                    : "cursor-default",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-saffron-500 to-violet-500 text-white"
                      : isCompleted
                        ? "bg-violet-500/30 text-violet-400"
                        : "bg-white/10 text-midnight-400",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] hidden sm:block",
                    isActive ? "text-midnight-200" : "text-midnight-500",
                  )}
                >
                  {step.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </motion.header>

      {/* Content */}
      <motion.main
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 pb-24"
      >
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </motion.main>

      {/* Footer Navigation */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 p-4 safe-bottom bg-gradient-to-t from-midnight-900 via-midnight-900/95 to-transparent"
      >
        <div className="max-w-md mx-auto flex items-center space-x-3">
          {/* Back Button */}
          <motion.button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            whileHover={{ scale: currentStepIndex === 0 ? 1 : 1.05 }}
            whileTap={{ scale: currentStepIndex === 0 ? 1 : 0.95 }}
            className={cn(
              "p-4 rounded-xl border transition-all duration-200",
              currentStepIndex === 0
                ? "border-white/5 bg-white/5 text-midnight-500 cursor-not-allowed"
                : "border-white/10 bg-white/10 text-midnight-200 hover:border-white/20",
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          {/* Next/Complete Button */}
          <motion.button
            onClick={currentStep === "vision" ? handleSubmit : handleNext}
            disabled={isSubmitting || !canProceed()}
            whileHover={{ scale: isSubmitting || !canProceed() ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting || !canProceed() ? 1 : 0.98 }}
            className={cn(
              "flex-1 py-4 rounded-xl font-semibold text-white",
              "flex items-center justify-center space-x-2",
              "transition-all duration-300",
              canProceed() && !isSubmitting
                ? "bg-gradient-to-r from-saffron-500 to-violet-500 hover:shadow-saffron-glow"
                : "bg-midnight-700/50 cursor-not-allowed opacity-50",
            )}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span>Completing...</span>
              </>
            ) : currentStep === "vision" ? (
              <>
                <span>Complete Profile</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.footer>
    </div>
  );
}
