'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  X,
  Mic,
  Filter,
  MapPin,
  Shield,
  ShieldCheck,
  GraduationCap,
  Church,
  Languages,
  Sparkles,
  Crown,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types & Mock Data
// ─────────────────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  intent: string;
  compatibility: number;
  education: string;
  religion: string;
  motherTongue: string;
  imageUrl: string;
  isBlurred: boolean;
}

const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    age: 26,
    city: 'Bangalore',
    verificationLevel: 'gold',
    intent: 'Marriage within 1-2 years',
    compatibility: 94,
    education: 'IIT Delhi',
    religion: 'Hindu',
    motherTongue: 'Hindi',
    imageUrl: '/profiles/priya.jpg',
    isBlurred: true,
  },
  {
    id: '2',
    name: 'Ananya Iyer',
    age: 25,
    city: 'Chennai',
    verificationLevel: 'silver',
    intent: 'Serious relationship',
    compatibility: 87,
    education: 'Anna University',
    religion: 'Hindu',
    motherTongue: 'Tamil',
    imageUrl: '/profiles/ananya.jpg',
    isBlurred: true,
  },
  {
    id: '3',
    name: 'Sneha Patel',
    age: 27,
    city: 'Ahmedabad',
    verificationLevel: 'gold',
    intent: 'Marriage within 1-2 years',
    compatibility: 82,
    education: 'NIT Surathkal',
    religion: 'Hindu',
    motherTongue: 'Gujarati',
    imageUrl: '/profiles/sneha.jpg',
    isBlurred: true,
  },
  {
    id: '4',
    name: 'Kavya Nair',
    age: 24,
    city: 'Kochi',
    verificationLevel: 'bronze',
    intent: 'Serious relationship',
    compatibility: 78,
    education: 'Cochin University',
    religion: 'Christian',
    motherTongue: 'Malayalam',
    imageUrl: '/profiles/kavya.jpg',
    isBlurred: true,
  },
  {
    id: '5',
    name: 'Riya Gupta',
    age: 26,
    city: 'Delhi',
    verificationLevel: 'silver',
    intent: 'Marriage within 1-2 years',
    compatibility: 75,
    education: 'Delhi University',
    religion: 'Hindu',
    motherTongue: 'Hindi',
    imageUrl: '/profiles/riya.jpg',
    isBlurred: true,
  },
];

const intentColors: Record<string, string> = {
  'Marriage within 1-2 years': 'from-saffron-500 to-rose-500',
  'Serious relationship': 'from-violet-500 to-rose-500',
  'Friendship / Networking': 'from-violet-500 to-blue-500',
  'Healing space': 'from-emerald-500 to-teal-500',
};

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
function VerificationBadge({ level }: { level: 'bronze' | 'silver' | 'gold' }) {
  const config = {
    bronze: {
      color: 'text-amber-700 bg-amber-500/10 border-amber-500/30',
      icon: Shield,
      label: 'Verified',
    },
    silver: {
      color: 'text-midnight-200 bg-white/10 border-white/20',
      icon: Shield,
      label: 'Verified',
    },
    gold: {
      color: 'text-gold-500 bg-gold-500/10 border-gold-500/30',
      icon: ShieldCheck,
      label: 'Verified',
    },
  };

  const Icon = config[level].icon;

  return (
    <div className={cn('px-2 py-1 rounded-full border flex items-center space-x-1', config[level].color)}>
      <Icon className="w-3 h-3" />
      <span className="text-[10px] font-semibold">{config[level].label}</span>
    </div>
  );
}

function CompatibilityBadge({ percentage }: { percentage: number }) {
  const getColor = () => {
    if (percentage >= 90) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (percentage >= 80) return 'text-violet-400 bg-violet-500/20 border-violet-500/30';
    if (percentage >= 70) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-midnight-400 bg-white/10 border-white/20';
  };

  return (
    <div className={cn('px-2.5 py-1 rounded-full border flex items-center space-x-1', getColor())}>
      <Sparkles className="w-3 h-3" />
      <span className="text-xs font-bold">{percentage}% match</span>
    </div>
  );
}

function ProfileCard({
  profile,
  index,
  onLike,
  onPass,
  onVoiceNote,
}: {
  profile: Profile;
  index: number;
  onLike: () => void;
  onPass: () => void;
  onVoiceNote: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        'relative rounded-3xl overflow-hidden border border-white/10',
        'bg-gradient-to-b from-white/10 to-white/5',
        'backdrop-blur-md'
      )}
      style={{
        zIndex: 3 - index,
        transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
        opacity: 1 - index * 0.15,
      }}
    >
      {/* Blurred Background Image */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${profile.imageUrl})`,
            filter: profile.isBlurred ? 'blur(20px)' : 'none',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-midnight-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-5 min-h-[420px] flex flex-col">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <VerificationBadge level={profile.verificationLevel} />
            <CompatibilityBadge percentage={profile.compatibility} />
          </div>

          {/* Premium Lock */}
          {profile.isBlurred && (
            <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Lock className="w-4 h-4 text-midnight-300" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-3">
          {/* Name & Age */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {profile.name}, {profile.age}
            </h3>
            <div className="flex items-center space-x-1.5 text-midnight-300">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{profile.city}</span>
            </div>
          </div>

          {/* Intent Tag */}
          <div className={cn('inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r', intentColors[profile.intent] || 'from-violet-500 to-rose-500')}>
            <Heart className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white">{profile.intent}</span>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <GraduationCap className="w-4 h-4 text-violet-400" />
              <span className="text-midnight-200">{profile.education}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Church className="w-4 h-4 text-violet-400" />
              <span className="text-midnight-200">{profile.religion}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Languages className="w-4 h-4 text-violet-400" />
              <span className="text-midnight-200">{profile.motherTongue}</span>
            </div>
          </div>

          {/* Expand for more details */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>{isExpanded ? 'Show less' : 'View full profile'}</span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
          </motion.button>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-xs text-midnight-400">
                    Software Engineer at a leading tech company. Loves traveling, reading, and spending time with family.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-midnight-300">🧘 Yoga</span>
                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-midnight-300">📚 Reading</span>
                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-midnight-300">✈️ Travel</span>
                    <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-midnight-300">🍳 Cooking</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 pt-4 mt-auto">
          <motion.button
            onClick={onPass}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full glass-sm border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-midnight-300" />
          </motion.button>

          <motion.button
            onClick={onVoiceNote}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full glass-sm border border-violet-500/30 flex items-center justify-center hover:bg-violet-500/20 transition-colors"
          >
            <Mic className="w-5 h-5 text-violet-400" />
          </motion.button>

          <motion.button
            onClick={onLike}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-saffron-500 to-rose-500 border border-saffron-500/50 flex items-center justify-center hover:shadow-saffron-glow transition-shadow"
          >
            <Heart className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-saffron-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-midnight-400" />
      </div>
      <h3 className="text-xl font-bold text-midnight-50 mb-2">No matches yet</h3>
      <p className="text-midnight-300 text-sm mb-6">
        Complete your profile to get personalized matches
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-violet-500 text-white font-semibold hover:shadow-saffron-glow transition-shadow"
      >
        Complete Profile
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dailyLimit, setDailyLimit] = useState({ used: 3, total: 5 });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profiles
    const timer = setTimeout(() => {
      setProfiles(mockProfiles);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLike = (id: string) => {
    console.log('Liked:', id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setDailyLimit((prev) => ({ ...prev, used: prev.used + 1 }));
  };

  const handlePass = (id: string) => {
    console.log('Passed:', id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleVoiceNote = (id: string) => {
    console.log('Voice note for:', id);
    // Open voice recording modal
  };

  const remainingProfiles = dailyLimit.total - dailyLimit.used;

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 safe-top safe-bottom pb-24">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">
              Suggested Matches
            </h1>
            <p className="text-sm text-midnight-300">
              Based on your preferences
            </p>
          </div>
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'p-3 rounded-xl border transition-all duration-200',
              showFilters
                ? 'bg-violet-500/20 border-violet-500/50'
                : 'glass-sm border-white/10 hover:border-white/20'
            )}
          >
            <Filter className={cn('w-5 h-5', showFilters ? 'text-violet-400' : 'text-midnight-300')} />
          </motion.button>
        </div>

        {/* Daily Limit Counter */}
        <div className="glass-sm rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-gold-500" />
              <span className="text-sm text-midnight-200">
                {dailyLimit.used}/{dailyLimit.total} profiles today
              </span>
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: dailyLimit.total }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i < dailyLimit.used
                      ? 'bg-gradient-to-r from-saffron-500 to-violet-500'
                      : 'bg-white/10'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(dailyLimit.used / dailyLimit.total) * 100}%` }}
              className="h-full bg-gradient-to-r from-saffron-500 to-violet-500 rounded-full"
            />
          </div>

          {remainingProfiles === 0 ? (
            <p className="text-xs text-amber-400 mt-2">
              Daily limit reached. Upgrade to Premium for unlimited matches!
            </p>
          ) : (
            <p className="text-xs text-midnight-400 mt-2">
              {remainingProfiles} more {remainingProfiles === 1 ? 'profile' : 'profiles'} available today
            </p>
          )}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="glass-md rounded-xl p-4 border border-white/10 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-midnight-400 mb-1">Age Range</label>
                    <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-midnight-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                      <option>22-28</option>
                      <option>25-32</option>
                      <option>28-35</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-midnight-400 mb-1">Location</label>
                    <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-midnight-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                      <option>Any</option>
                      <option>Same City</option>
                      <option>Same State</option>
                      <option>Pan India</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-midnight-400 mb-1">Education</label>
                    <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-midnight-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                      <option>Any</option>
                      <option>Graduate</option>
                      <option>Post Graduate</option>
                      <option>PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-midnight-400 mb-1">Intent</label>
                    <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-midnight-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                      <option>Any</option>
                      <option>Marriage</option>
                      <option>Serious</option>
                      <option>Friendship</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Profile Cards Stack */}
      <motion.main className="relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-10 h-10 text-violet-400" />
            </motion.div>
            <p className="text-midnight-300 text-sm mt-4">Finding your matches...</p>
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative h-[520px]">
            <AnimatePresence>
              {profiles.slice(0, 3).map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  index={index}
                  onLike={() => handleLike(profile.id)}
                  onPass={() => handlePass(profile.id)}
                  onVoiceNote={() => handleVoiceNote(profile.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.main>

      {/* Premium Upgrade Banner */}
      {remainingProfiles <= 1 && (
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 safe-bottom bg-gradient-to-t from-midnight-900 via-midnight-900/95 to-transparent"
        >
          <div className="max-w-md mx-auto">
            <div className="glass-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-saffron-500/20 border border-gold-500/30 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-midnight-50">Upgrade to Premium</p>
                  <p className="text-xs text-midnight-400">Unlimited matches & more features</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-saffron-500 text-white text-sm font-semibold hover:shadow-lg transition-shadow"
              >
                Upgrade
              </motion.button>
            </div>
          </div>
        </motion.footer>
      )}
    </div>
  );
}
