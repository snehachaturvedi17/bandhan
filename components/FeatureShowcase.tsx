/**
 * Bandhan AI - Feature Showcase
 * Displays key features with icons and descriptions
 */

'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Sparkles,
  Mic,
  Users,
  Navigation,
  Heart,
  Zap,
  Lock,
  Video,
  FileText,
  Smartphone,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Feature {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  color: string;
  bgColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature Data
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES: Feature[] = [
  {
    id: 'digilocker',
    icon: ShieldCheck,
    title: 'DigiLocker Verification',
    titleHi: 'DigiLocker सत्यापन',
    description: 'Government ID verification for authentic profiles',
    descriptionHi: 'वास्तविक प्रोफ़ाइल के लिए सरकारी ID सत्यापन',
    color: 'text-blue-400',
    bgColor: 'from-blue-500/20 to-blue-600/20',
  },
  {
    id: 'ai-insights',
    icon: Sparkles,
    title: 'AI Match Insights',
    titleHi: 'AI मैच अंतर्दृष्टि',
    description: 'Smart compatibility scoring based on values & preferences',
    descriptionHi: 'मूल्यों और प्राथमिकताओं के आधार पर स्मार्ट अनुकूलता स्कोर',
    color: 'text-violet-400',
    bgColor: 'from-violet-500/20 to-violet-600/20',
  },
  {
    id: 'voice-notes',
    icon: Mic,
    title: 'Voice Note Intros',
    titleHi: 'वॉइस नोट परिचय',
    description: '15-second voice introductions for authentic connections',
    descriptionHi: 'वास्तविक संबंधों के लिए 15-सेकंड के वॉइस परिचय',
    color: 'text-rose-400',
    bgColor: 'from-rose-500/20 to-rose-600/20',
  },
  {
    id: 'family-dashboard',
    icon: Users,
    title: 'Family Dashboard',
    titleHi: 'परिवार डैशबोर्ड',
    description: 'Share profile with parents for joint decision making',
    descriptionHi: 'संयुक्त निर्णय लेने के लिए माता-पिता के साथ प्रोफ़ाइल साझा करें',
    color: 'text-emerald-400',
    bgColor: 'from-emerald-500/20 to-emerald-600/20',
  },
  {
    id: 'safety',
    icon: Navigation,
    title: 'Share My Date Safety',
    titleHi: 'सुरक्षा सुविधा',
    description: 'Share live location with trusted contacts during dates',
    descriptionHi: 'डेट के दौरान विश्वसनीय संपर्कों के साथ लाइव स्थान साझा करें',
    color: 'text-amber-400',
    bgColor: 'from-amber-500/20 to-amber-600/20',
  },
  {
    id: 'privacy',
    icon: Lock,
    title: 'Privacy First',
    titleHi: 'गोपनीयता पहले',
    description: 'Photos blurred until match, DPDP Act 2023 compliant',
    descriptionHi: 'मैच तक फ़ोटो धुंधली, DPDP अधिनियम 2023 अनुपालित',
    color: 'text-cyan-400',
    bgColor: 'from-cyan-500/20 to-cyan-600/20',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Feature Card Component
// ─────────────────────────────────────────────────────────────────────────────
interface FeatureCardProps {
  feature: Feature;
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={cn(
        'relative p-6 rounded-2xl',
        'bg-gradient-to-br',
        feature.bgColor,
        'border border-white/10',
        'backdrop-blur-md',
        'transition-all duration-300'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
          'bg-gradient-to-br',
          feature.bgColor,
          'border border-white/20'
        )}
      >
        <Icon className={cn('w-6 h-6', feature.color)} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-3">{feature.description}</p>

      {/* Hindi Description */}
      <p className="text-xs text-gray-500 hindi-text">{feature.descriptionHi}</p>

      {/* Decorative Element */}
      <div
        className={cn(
          'absolute -bottom-2 -right-2 w-16 h-16 rounded-full',
          'bg-gradient-to-br',
          feature.bgColor,
          'blur-2xl opacity-50'
        )}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface FeatureShowcaseProps {
  title?: string;
  subtitle?: string;
}

export function FeatureShowcase({
  title = 'Why Bandhan AI?',
  subtitle = 'India\'s first marriage-focused dating platform with safety at its core',
}: FeatureShowcaseProps) {
  return (
    <section className="py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index} />
        ))}
      </div>

      {/* Additional Features Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-saffron-500/10 to-rose-500/10 border border-saffron-500/20"
      >
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Verified Profiles Only</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant Matching</span>
          </div>
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-violet-400" />
            <span>Video Profiles</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Family View PDF</span>
          </div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Mobile Optimized</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default FeatureShowcase;
