/**
 * Bandhan AI - Daily Limit System Demo
 * Shows how to use the limit counter, hook, and upsell modal together
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp, Zap, Users } from 'lucide-react';
import { LimitCounter, LimitCounterCompact, LimitCounterExpanded } from './LimitCounter';
import { useDailyLimit, useProfileLimit } from '@/hooks/useDailyLimit';
import { getAllLimitsData } from '@/hooks/useDailyLimit';
import { trackEvent } from '@/lib/analytics';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Component: Basic Usage
// ─────────────────────────────────────────────────────────────────────────────
export function DailyLimitDemo() {
  const {
    remaining,
    limit,
    isLimitReached,
    percentageRemaining,
    colorState,
    increment,
    canPerformAction,
    timeUntilReset,
  } = useProfileLimit();

  const handleViewProfile = () => {
    if (canPerformAction()) {
      increment();
      // Perform the actual action (view profile, etc.)
      console.log('Viewing profile...');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Daily Limit Demo</h2>

      {/* Compact Counter (for navbar) */}
      <div className="p-4 rounded-xl glass-sm border border-white/10">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Compact (Navbar)
        </h3>
        <LimitCounterCompact
          config={{ dailyLimit: 5, actionType: 'profiles' }}
        />
      </div>

      {/* Default Counter */}
      <div className="p-4 rounded-xl glass-sm border border-white/10">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Default (Header)
        </h3>
        <LimitCounter
          config={{ dailyLimit: 5, actionType: 'profiles' }}
          variant="default"
        />
      </div>

      {/* Expanded Counter */}
      <div className="p-4 rounded-xl glass-sm border border-white/10">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Expanded (Dedicated Section)
        </h3>
        <LimitCounterExpanded
          config={{ dailyLimit: 5, actionType: 'profiles' }}
        />
      </div>

      {/* Action Button */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Action Example</h3>
        <button
          onClick={handleViewProfile}
          disabled={!canPerformAction()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canPerformAction()
            ? `View Profile (${remaining} remaining)`
            : 'Limit Reached'}
        </button>

        {isLimitReached && (
          <p className="text-sm text-rose-400">
            Daily limit reached! Resets in {timeUntilReset}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 rounded-xl glass-sm border border-white/10">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Current State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Used</p>
            <p className="text-white font-semibold">{limit - remaining}/{limit}</p>
          </div>
          <div>
            <p className="text-gray-500">Remaining</p>
            <p className={cn(
              'font-semibold',
              colorState === 'green' && 'text-emerald-400',
              colorState === 'orange' && 'text-amber-400',
              colorState === 'red' && 'text-rose-400'
            )}>
              {remaining}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Percentage Used</p>
            <p className="text-white font-semibold">{100 - percentageRemaining}%</p>
          </div>
          <div>
            <p className="text-gray-500">Resets In</p>
            <p className="text-white font-semibold">{timeUntilReset}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Component: All Limits Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export function AllLimitsDashboard() {
  const [limits, setLimits] = useState(() => getAllLimitsData());

  // Refresh limits every second
  useState(() => {
    const interval = setInterval(() => {
      setLimits(getAllLimitsData());
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">All Limits Dashboard</h2>

      <div className="grid gap-4">
        {/* Profiles Limit */}
        <div className="p-4 rounded-xl glass-sm border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span className="font-medium">Profile Views</span>
            </div>
            <span className={cn(
              'text-sm font-semibold',
              limits.profiles.colorState === 'green' && 'text-emerald-400',
              limits.profiles.colorState === 'orange' && 'text-amber-400',
              limits.profiles.colorState === 'red' && 'text-rose-400'
            )}>
              {limits.profiles.remaining}/{limits.profiles.limit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                limits.profiles.colorState === 'green' && 'bg-gradient-to-r from-emerald-500 to-teal-500',
                limits.profiles.colorState === 'orange' && 'bg-gradient-to-r from-amber-500 to-orange-500',
                limits.profiles.colorState === 'red' && 'bg-gradient-to-r from-rose-500 to-red-500'
              )}
              style={{ width: `${limits.profiles.percentageUsed}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Resets in {limits.profiles.timeUntilReset}
          </p>
        </div>

        {/* Chats Limit */}
        <div className="p-4 rounded-xl glass-sm border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Chats</span>
            </div>
            <span className={cn(
              'text-sm font-semibold',
              limits.chats.colorState === 'green' && 'text-emerald-400',
              limits.chats.colorState === 'orange' && 'text-amber-400',
              limits.chats.colorState === 'red' && 'text-rose-400'
            )}>
              {limits.chats.remaining}/{limits.chats.limit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                limits.chats.colorState === 'green' && 'bg-gradient-to-r from-emerald-500 to-teal-500',
                limits.chats.colorState === 'orange' && 'bg-gradient-to-r from-amber-500 to-orange-500',
                limits.chats.colorState === 'red' && 'bg-gradient-to-r from-rose-500 to-red-500'
              )}
              style={{ width: `${limits.chats.percentageUsed}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Resets in {limits.chats.timeUntilReset}
          </p>
        </div>

        {/* Likes Limit */}
        <div className="p-4 rounded-xl glass-sm border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="font-medium">Likes</span>
            </div>
            <span className={cn(
              'text-sm font-semibold',
              limits.likes.colorState === 'green' && 'text-emerald-400',
              limits.likes.colorState === 'orange' && 'text-amber-400',
              limits.likes.colorState === 'red' && 'text-rose-400'
            )}>
              {limits.likes.remaining}/{limits.likes.limit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                limits.likes.colorState === 'green' && 'bg-gradient-to-r from-emerald-500 to-teal-500',
                limits.likes.colorState === 'orange' && 'bg-gradient-to-r from-amber-500 to-orange-500',
                limits.likes.colorState === 'red' && 'bg-gradient-to-r from-rose-500 to-red-500'
              )}
              style={{ width: `${limits.likes.percentageUsed}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Resets in {limits.likes.timeUntilReset}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Component: Integration Example (Matches Page)
// ─────────────────────────────────────────────────────────────────────────────
export function MatchesPageExample() {
  const { canPerformAction, increment } = useProfileLimit();
  const [showUpsell, setShowUpsell] = useState(false);

  const handleViewProfile = (profileId: string) => {
    if (canPerformAction()) {
      increment();
      // Navigate to profile
      console.log('Navigating to profile:', profileId);
    } else {
      setShowUpsell(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Counter */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suggested Matches</h1>
        <LimitCounterCompact />
      </div>

      {/* Sample Profile Cards */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl glass-sm border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Profile {i}</h3>
                <p className="text-sm text-gray-400">25 • Bangalore</p>
              </div>
              <button
                onClick={() => handleViewProfile(`profile-${i}`)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-saffron-500 to-rose-500 text-white text-sm font-medium"
              >
                View
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Premium Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-gold-500/10 to-saffron-500/10 border border-gold-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-gold-400" />
            <div>
              <p className="font-semibold text-white">Go Premium</p>
              <p className="text-xs text-gray-400">Unlimited profile views</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-saffron-500 to-rose-500 text-white text-sm font-medium">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper for cn utility
// ─────────────────────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default DailyLimitDemo;
