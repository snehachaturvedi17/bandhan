'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  MapPin,
  Heart,
  Mic,
  GraduationCap,
  Briefcase,
  Home,
  Utensils,
  Clock,
  Calendar,
  Send,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface ProfileData {
  id: string;
  name: string;
  age: number;
  city: string;
  distance?: string;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  intent: string;
  bio: string;
  photos: string[];
  education: string;
  career: string;
  family: string;
  diet: string;
  loveLanguage: string;
  weekendVibe: string;
  fiveYearVision: string;
  height?: string;
  motherTongue?: string;
  religion?: string;
  gotra?: string;
  manglik?: boolean;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onSendInterest: (profileId: string) => void;
  onSendVoiceNote: (profileId: string) => void;
  onPass: (profileId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
function VerificationBadge({ level }: { level: 'bronze' | 'silver' | 'gold' }) {
  const config = {
    bronze: {
      color: 'text-amber-700 bg-amber-500/10 border-amber-500/30',
      icon: Shield,
      label: 'Phone Verified',
    },
    silver: {
      color: 'text-midnight-200 bg-white/10 border-white/20',
      icon: Shield,
      label: 'Email Verified',
    },
    gold: {
      color: 'text-gold-500 bg-gold-500/10 border-gold-500/30',
      icon: ShieldCheck,
      label: 'ID Verified',
    },
  };

  const Icon = config[level].icon;

  return (
    <div className={cn('px-3 py-1.5 rounded-full border flex items-center space-x-1.5', config[level].color)}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold">{config[level].label}</span>
    </div>
  );
}

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPhoto, prevPhoto]);

  return (
    <>
      {/* Main Carousel */}
      <div className="relative h-80 sm:h-96 bg-midnight-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={photos[currentIndex] || '/placeholder-profile.jpg'}
            alt={`Profile photo ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent" />

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass-sm hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass-sm hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Photo Counter */}
        {photos.length > 1 && (
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <div className="px-2 py-1 rounded-full glass-sm text-xs text-white">
              {currentIndex + 1} / {photos.length}
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-full glass-sm hover:bg-white/20 transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Thumbnail Dots */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'w-6 bg-white'
                    : 'bg-white/40 hover:bg-white/60'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full glass-sm hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-sm hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <motion.img
              key={currentIndex}
              src={photos[currentIndex] || '/placeholder-profile.jpg'}
              alt={`Profile photo ${currentIndex + 1}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-sm hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-midnight-400">{label}</p>
        <p className="text-sm text-midnight-200 truncate">{value}</p>
      </div>
    </div>
  );
}

function ValueTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      <p className="text-xs text-midnight-400 mb-1">{label}</p>
      <p className="text-sm text-midnight-200">{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────
export function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSendInterest,
  onSendVoiceNote,
  onPass,
}: ProfileModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleAction = async (action: string, callback: () => void) => {
    setActiveAction(action);
    setIsSending(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (profile) {
      callback();
    }

    setIsSending(false);
    setActiveAction(null);
  };

  if (!profile) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-gradient-hero safe-top safe-bottom"
          >
            <div className="min-h-screen pb-24">
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="fixed top-4 right-4 z-10 p-3 rounded-full glass-md border border-white/20 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>

              {/* Photo Carousel */}
              <PhotoCarousel photos={profile.photos} />

              {/* Content */}
              <div className="px-4 sm:px-6 -mt-6 relative z-10">
                {/* Name & Verification */}
                <div className="glass-md rounded-3xl p-5 border border-white/10 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {profile.name}, {profile.age}
                      </h2>
                      <div className="flex items-center space-x-2 text-midnight-300">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{profile.city}</span>
                        {profile.distance && (
                          <>
                            <span>•</span>
                            <span className="text-sm">{profile.distance} away</span>
                          </>
                        )}
                      </div>
                    </div>
                    <VerificationBadge level={profile.verificationLevel} />
                  </div>

                  {/* Intent Tag */}
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-saffron-500/20 to-rose-500/20 border border-saffron-500/30">
                    <Heart className="w-4 h-4 text-saffron-400" />
                    <span className="text-sm font-medium text-saffron-200">
                      {profile.intent}
                    </span>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="mt-4 text-sm text-midnight-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Life Details Grid */}
                <div className="glass-md rounded-3xl p-5 border border-white/10 mb-4">
                  <h3 className="text-sm font-semibold text-midnight-200 mb-4 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span>Life Details</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow
                      icon={GraduationCap}
                      label="Education"
                      value={profile.education}
                    />
                    <InfoRow
                      icon={Briefcase}
                      label="Career"
                      value={profile.career}
                    />
                    <InfoRow
                      icon={Home}
                      label="Family"
                      value={profile.family}
                    />
                    <InfoRow
                      icon={Utensils}
                      label="Diet"
                      value={profile.diet}
                    />
                  </div>

                  {/* Additional Details */}
                  {(profile.height || profile.motherTongue || profile.religion) && (
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                      {profile.height && (
                        <InfoRow
                          icon={Maximize2}
                          label="Height"
                          value={profile.height}
                        />
                      )}
                      {profile.motherTongue && (
                        <InfoRow
                          icon={MapPin}
                          label="Mother Tongue"
                          value={profile.motherTongue}
                        />
                      )}
                      {profile.religion && (
                        <InfoRow
                          icon={Church}
                          label="Religion"
                          value={profile.religion}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Values Section */}
                <div className="glass-md rounded-3xl p-5 border border-white/10 mb-4">
                  <h3 className="text-sm font-semibold text-midnight-200 mb-4 flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Values & Personality</span>
                  </h3>

                  <div className="space-y-3">
                    <ValueTag
                      label="Love Language"
                      value={profile.loveLanguage}
                    />
                    <ValueTag
                      label="Weekend Vibe"
                      value={profile.weekendVibe}
                    />
                    <ValueTag
                      label="5-Year Vision"
                      value={profile.fiveYearVision}
                    />
                  </div>
                </div>

                {/* Compatibility Insights (Optional) */}
                <div className="glass-sm rounded-2xl p-4 border border-white/10 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <span className="text-sm font-medium text-midnight-200">
                        Compatibility Insights
                      </span>
                    </div>
                    <span className="text-xs text-gold-500 font-semibold">
                      87% Match
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                      Same education level
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                      Compatible love languages
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                      Different dietary preferences
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Fixed Bottom) */}
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3 }}
              className="fixed bottom-0 left-0 right-0 p-4 safe-bottom bg-gradient-to-t from-midnight-900 via-midnight-900/95 to-transparent"
            >
              <div className="max-w-md mx-auto space-y-3">
                {/* Primary: Send Interest */}
                <motion.button
                  onClick={() => handleAction('interest', () => onSendInterest(profile.id))}
                  disabled={isSending && activeAction === 'interest'}
                  whileHover={{ scale: isSending ? 1 : 1.02 }}
                  whileTap={{ scale: isSending ? 1 : 0.98 }}
                  className={cn(
                    'w-full py-4 rounded-xl font-semibold text-white',
                    'flex items-center justify-center space-x-2',
                    'transition-all duration-300',
                    !isSending || activeAction === 'interest'
                      ? 'bg-gradient-to-r from-saffron-500 to-rose-500 hover:shadow-saffron-glow'
                      : 'bg-midnight-700/50 cursor-not-allowed opacity-50'
                  )}
                >
                  {isSending && activeAction === 'interest' ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Send className="w-5 h-5" />
                      </motion.div>
                      <span>Sending Interest...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      <span>Send Interest</span>
                    </>
                  )}
                </motion.button>

                {/* Secondary & Tertiary Row */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => handleAction('voice', () => onSendVoiceNote(profile.id))}
                    disabled={isSending && activeAction === 'voice'}
                    whileHover={{ scale: isSending ? 1 : 1.05 }}
                    whileTap={{ scale: isSending ? 1 : 0.95 }}
                    className={cn(
                      'flex-1 py-3.5 rounded-xl font-medium',
                      'flex items-center justify-center space-x-2',
                      'transition-all duration-200',
                      !isSending || activeAction === 'voice'
                        ? 'glass-md border border-violet-500/30 text-violet-400 hover:bg-violet-500/20'
                        : 'bg-midnight-700/50 cursor-not-allowed opacity-50'
                    )}
                  >
                    {isSending && activeAction === 'voice' ? (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Mic className="w-5 h-5" />
                        </motion.div>
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Voice Note</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={() => handleAction('pass', () => onPass(profile.id))}
                    disabled={isSending && activeAction === 'pass'}
                    whileHover={{ scale: isSending ? 1 : 1.05 }}
                    whileTap={{ scale: isSending ? 1 : 0.95 }}
                    className={cn(
                      'flex-1 py-3.5 rounded-xl font-medium',
                      'flex items-center justify-center space-x-2',
                      'transition-all duration-200',
                      !isSending || activeAction === 'pass'
                        ? 'glass-sm border border-white/10 text-midnight-300 hover:bg-white/10'
                        : 'bg-midnight-700/50 cursor-not-allowed opacity-50'
                    )}
                  >
                    {isSending && activeAction === 'pass' ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <X className="w-5 h-5" />
                        </motion.div>
                        <span>Passing...</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        <span>Pass</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Church({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L12 4M12 20L12 22M4 12L2 12M22 12L20 12M12 8L8 20L16 20L12 8Z" />
    </svg>
  );
}

export default ProfileModal;
