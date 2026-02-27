/**
 * Bandhan AI - Demo Instructions Modal
 * Step-by-step guide for presenters
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Users,
  MessageCircle,
  Shield,
  CheckCircle2,
  Keyboard,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Step {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  tips: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Steps
// ─────────────────────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: 1,
    icon: Users,
    title: 'Select a Demo Account',
    titleHi: 'डेमो खाता चुनें',
    description:
      'Choose from 4 pre-created demo profiles. Each has realistic data, conversations, and matches.',
    descriptionHi:
      '4 पूर्व-निर्मित डेमो प्रोफ़ाइल में से चुनें। प्रत्येक के पास यथार्थवादी डेटा, वार्तालाप और मैच हैं।',
    tips: [
      'Priya (26, Mumbai) - Marriage-focused, Gold verified',
      'Rohan (28, Delhi) - Serious relationship, Silver verified',
      'Anjali (24, Bangalore) - Friendship first, Bronze verified',
      'Vikram (30, Chennai) - Marriage-minded, Gold verified',
    ],
  },
  {
    id: 2,
    icon: Play,
    title: 'Explore Discovery Feed',
    titleHi: 'खोज फ़ीड देखें',
    description:
      'Browse through curated matches. Like profiles to see mutual match animations.',
    descriptionHi:
      'क्यूरेटेड मैच ब्राउज़ करें। पारस्परिक मैच एनिमेशन देखने के लिए प्रोफ़ाइल को लाइक करें।',
    tips: [
      'Daily limit: 5 profiles (free) / Unlimited (premium)',
      'Compatibility scores range from 70-95%',
      '60% chance of mutual match in demo mode',
      'Use filters to refine search',
    ],
  },
  {
    id: 3,
    icon: MessageCircle,
    title: 'Open Chat Conversations',
    titleHi: 'चैट वार्तालाप खोलें',
    description:
      'View pre-written conversations showing culturally appropriate Indian dating discussions.',
    descriptionHi:
      'सांस्कृतिक रूप से उपयुक्त भारतीय डेटिंग चर्चाओं को दिखाने वाले पूर्व-लिखित वार्तालाप देखें।',
    tips: [
      'Text messages, voice notes, and photos',
      'Voice notes are 10-15 seconds (cultural norm)',
      'Photos blurred until match (privacy feature)',
      'Mix of English and Hindi messages',
    ],
  },
  {
    id: 4,
    icon: Shield,
    title: 'Try Safety Features',
    titleHi: 'सुरक्षा सुविधाएँ आज़माएं',
    description:
      'Demonstrate "Share My Date" feature for location sharing with trusted contacts.',
    descriptionHi:
      'विश्वसनीय संपर्कों के साथ स्थान साझाकरण के लिए "अपनी डेट साझा करें" सुविधा प्रदर्शित करें।',
    tips: [
      'Red shield button in chat screen',
      'Share location for 2 hours',
      'Select up to 3 emergency contacts',
      'Auto-stops after 2 hours',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Step Content Component
// ─────────────────────────────────────────────────────────────────────────────
interface StepContentProps {
  step: Step;
  isActive: boolean;
}

function StepContent({ step, isActive }: StepContentProps) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'p-6 rounded-2xl',
        isActive ? 'bg-white/5 border border-white/10' : 'opacity-50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
          isActive
            ? 'bg-gradient-to-br from-saffron-500/20 to-rose-500/20 border border-saffron-500/30'
            : 'bg-white/5 border border-white/10'
        )}
      >
        <Icon
          className={cn(
            'w-6 h-6',
            isActive ? 'text-saffron-400' : 'text-gray-500'
          )}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-lg font-bold mb-2',
          isActive ? 'text-white' : 'text-gray-500'
        )}
      >
        {step.title}
      </h3>

      {/* Hindi Title */}
      <p className="text-sm text-gray-500 hindi-text mb-4">{step.titleHi}</p>

      {/* Description */}
      <p
        className={cn(
          'text-sm mb-4',
          isActive ? 'text-gray-300' : 'text-gray-600'
        )}
      >
        {step.description}
      </p>

      {/* Hindi Description */}
      <p className="text-xs text-gray-500 hindi-text mb-4">
        {step.descriptionHi}
      </p>

      {/* Tips */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Pro Tips:
          </p>
          {step.tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-300">{tip}</span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface DemoInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoInstructions({ isOpen, onClose }: DemoInstructionsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl">
              <div className="rounded-2xl bg-gradient-to-b from-midnight-900 to-midnight-950 border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-500/20 to-rose-500/20 border border-saffron-500/30 flex items-center justify-center">
                      <Play className="w-5 h-5 text-saffron-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Demo Instructions
                      </h2>
                      <p className="text-xs text-gray-400">
                        Step-by-step guide for presenters
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-saffron-500 to-rose-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Step Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </button>

                    {/* Step Indicators */}
                    <div className="flex items-center space-x-2">
                      {STEPS.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentStep(index)}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all',
                            index === currentStep
                              ? 'w-8 bg-gradient-to-r from-saffron-500 to-rose-500'
                              : 'bg-white/20 hover:bg-white/30'
                          )}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))
                      }
                      disabled={currentStep === STEPS.length - 1}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Step Content */}
                  <StepContent step={step} isActive={true} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-white/10">
                  {/* Keyboard Shortcuts */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Keyboard className="w-4 h-4" />
                    <span>Press Esc to close</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl glass-sm border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                      Skip Guide
                    </button>
                    {currentStep < STEPS.length - 1 ? (
                      <motion.button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white text-sm font-semibold hover:shadow-saffron-glow transition-shadow flex items-center space-x-2"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white text-sm font-semibold hover:shadow-saffron-glow transition-shadow flex items-center space-x-2"
                      >
                        <span>Start Demo</span>
                        <ExternalLink className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DemoInstructions;
