/**
 * Bandhan AI - Demo Account Card
 * Presenter account selection card with realistic Indian profile data
 */

'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Heart,
  MapPin,
  GraduationCap,
  Briefcase,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface DemoAccount {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  gender: 'male' | 'female';
  verificationLevel: 'bronze' | 'silver' | 'gold';
  intent: 'marriage-soon' | 'serious-relationship' | 'friendship' | 'healing';
  education: string;
  occupation: string;
  avatarUrl: string;
  bio: string;
  features: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Verification Badge Component
// ─────────────────────────────────────────────────────────────────────────────
function VerificationBadge({ level }: { level: 'bronze' | 'silver' | 'gold' }) {
  const config = {
    bronze: {
      color: 'text-amber-700 bg-amber-500/20 border-amber-500/30',
      icon: Shield,
      label: 'Verified',
    },
    silver: {
      color: 'text-gray-200 bg-white/20 border-white/30',
      icon: Shield,
      label: 'Verified',
    },
    gold: {
      color: 'text-gold-500 bg-gold-500/20 border-gold-500/30',
      icon: ShieldCheck,
      label: 'Verified',
    },
  };

  const Icon = config[level].icon;

  return (
    <div
      className={cn(
        'px-2 py-1 rounded-full border flex items-center space-x-1',
        config[level].color
      )}
    >
      <Icon className="w-3 h-3" />
      <span className="text-[10px] font-semibold">{config[level].label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent Badge Component
// ─────────────────────────────────────────────────────────────────────────────
function IntentBadge({ intent }: { intent: DemoAccount['intent'] }) {
  const config = {
    'marriage-soon': {
      label: 'Marriage-minded',
      labelHi: 'विवाह के इच्छुक',
      color: 'from-saffron-500 to-rose-500',
    },
    'serious-relationship': {
      label: 'Serious relationship',
      labelHi: 'गंभीर संबंध',
      color: 'from-violet-500 to-rose-500',
    },
    friendship: {
      label: 'Friendship',
      labelHi: 'मित्रता',
      color: 'from-violet-500 to-blue-500',
    },
    healing: {
      label: 'Healing space',
      labelHi: 'उपचार की जगह',
      color: 'from-emerald-500 to-teal-500',
    },
  };

  const intentConfig = config[intent];

  return (
    <div
      className={cn(
        'inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r text-white text-xs font-medium',
        intentConfig.color
      )}
    >
      <Heart className="w-3 h-3" />
      <span>{intentConfig.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface DemoAccountCardProps {
  account: DemoAccount;
  onSelect: (account: DemoAccount) => void;
  isLoading?: boolean;
}

export function DemoAccountCard({
  account,
  onSelect,
  isLoading = false,
}: DemoAccountCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-gradient-to-b from-white/10 to-white/5',
        'border border-white/10',
        'backdrop-blur-md',
        'shadow-xl',
        'transition-all duration-300'
      )}
    >
      {/* Profile Photo */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${account.avatarUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent" />

        {/* Verification Badge */}
        <div className="absolute top-3 right-3">
          <VerificationBadge level={account.verificationLevel} />
        </div>

        {/* Gender Indicator */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs text-white font-medium">
          {account.gender === 'male' ? 'Male' : 'Female'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Name & Basic Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">
              {account.name}, {account.age}
            </h3>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>
              {account.city}, {account.state}
            </span>
          </div>
        </div>

        {/* Intent Tag */}
        <IntentBadge intent={account.intent} />

        {/* Education & Occupation */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-gray-300">
            <GraduationCap className="w-4 h-4 text-violet-400" />
            <span className="truncate">{account.education}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Briefcase className="w-4 h-4 text-violet-400" />
            <span className="truncate">{account.occupation}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-400 line-clamp-2">{account.bio}</p>

        {/* Features Preview */}
        <div className="flex flex-wrap gap-1.5">
          {account.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300"
            >
              {feature}
            </span>
          ))}
          {account.features.length > 3 && (
            <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-400">
              +{account.features.length - 3} more
            </span>
          )}
        </div>

        {/* Login Button */}
        <motion.button
          onClick={() => onSelect(account)}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className={cn(
            'w-full py-3 rounded-xl font-semibold text-white',
            'flex items-center justify-center space-x-2',
            'bg-gradient-to-r from-saffron-500 to-rose-500',
            'hover:shadow-saffron-glow',
            'transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <LogIn className="w-4 h-4" />
          <span>Login as {account.name.split(' ')[0]}</span>
        </motion.button>
      </div>

      {/* Gold Shine Effect for Gold Verified */}
      {account.verificationLevel === 'gold' && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-gradient-to-tr from-gold-500/10 via-transparent to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
}

export default DemoAccountCard;
