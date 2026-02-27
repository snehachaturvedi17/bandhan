/**
 * Bandhan AI - Demo Mode Landing Page
 * Presenter landing page for showcasing app features
 *
 * URL: /demo
 * Features:
 * - Demo account selector
 * - Feature showcase
 * - Presenter controls
 * - Demo instructions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Shield,
  LogIn,
  HelpCircle,
  ExternalLink,
  X,
  AlertTriangle,
} from 'lucide-react';
import { DemoAccountCard, type DemoAccount } from '@/components/DemoAccountCard';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { PresenterControls } from '@/components/PresenterControls';
import { DemoInstructions } from '@/components/DemoInstructions';
import { enableDemoMode, selectDemoUser } from '@/lib/mock-auth';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Accounts Data
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo_priya',
    name: 'Priya Sharma',
    age: 26,
    city: 'Mumbai',
    state: 'Maharashtra',
    gender: 'female',
    verificationLevel: 'gold',
    intent: 'marriage-soon',
    education: 'MBA, IIM Ahmedabad',
    occupation: 'Product Manager at Google',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    bio: 'Ambitious yet family-oriented. Love traveling, reading, and trying new cuisines.',
    features: ['Verified Profile', 'Premium Member', 'Voice Intro', 'Family Dashboard'],
  },
  {
    id: 'demo_rohan',
    name: 'Rohan Verma',
    age: 28,
    city: 'New Delhi',
    state: 'Delhi',
    gender: 'male',
    verificationLevel: 'silver',
    intent: 'serious-relationship',
    education: 'B.Tech, IIT Delhi',
    occupation: 'Software Engineer at Microsoft',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Tech enthusiast with a passion for music and sports. Believe in traditional values.',
    features: ['Verified Profile', 'Voice Intro', '80% Match Rate'],
  },
  {
    id: 'demo_anjali',
    name: 'Anjali Iyer',
    age: 24,
    city: 'Bangalore',
    state: 'Karnataka',
    gender: 'female',
    verificationLevel: 'bronze',
    intent: 'friendship',
    education: 'B.Des, NID Bangalore',
    occupation: 'UX Designer at Flipkart',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    bio: 'Creative soul who loves art, dance, and exploring new places.',
    features: ['Verified Profile', 'Creative Professional', 'Active User'],
  },
  {
    id: 'demo_vikram',
    name: 'Vikram Krishnan',
    age: 30,
    city: 'Chennai',
    state: 'Tamil Nadu',
    gender: 'male',
    verificationLevel: 'gold',
    intent: 'marriage-soon',
    education: 'MS, IIT Madras',
    occupation: 'Data Scientist at Amazon',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    bio: 'Family-oriented person with strong values. Love Carnatic music and cooking.',
    features: ['Verified Profile', 'Premium Member', 'High Compatibility', 'Family Approved'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function DemoLandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState(false);
  const [showExitBanner, setShowExitBanner] = useState(true);

  // Enable demo mode on mount
  useEffect(() => {
    enableDemoMode();
    console.log('🎭 Demo mode enabled');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+D: Toggle demo mode
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setDemoMode((prev) => !prev);
      }
      // Ctrl+R: Reset demo
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        handleReset();
      }
      // Ctrl+F: Show all features
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setShowAllFeatures((prev) => !prev);
      }
      // Ctrl+K: Toggle console logs
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setConsoleLogs((prev) => !prev);
      }
      // Esc: Close modals
      if (e.key === 'Escape') {
        setShowInstructions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle account selection
  const handleSelectAccount = useCallback(async (account: DemoAccount) => {
    setIsLoading(true);
    console.log('👤 Selecting demo account:', account.name);

    try {
      // Select demo user
      selectDemoUser(account.id);

      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to matches page
      router.push('/matches');
    } catch (error) {
      console.error('Error selecting account:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Handle reset
  const handleReset = useCallback(() => {
    console.log('🔄 Resetting demo data...');
    localStorage.clear();
    enableDemoMode();
    window.location.reload();
  }, []);

  // Toggle handlers
  const handleToggleDemoMode = useCallback(() => {
    setDemoMode((prev) => !prev);
    if (!demoMode) {
      enableDemoMode();
    }
  }, [demoMode]);

  const handleToggleShowAllFeatures = useCallback(() => {
    setShowAllFeatures((prev) => !prev);
    console.log('✨ Show all features:', !showAllFeatures);
  }, [showAllFeatures]);

  const handleToggleConsoleLogs = useCallback(() => {
    setConsoleLogs((prev) => !prev);
    console.log('📋 Console logs:', !consoleLogs);
  }, [consoleLogs]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      {/* Presenter Controls */}
      <PresenterControls
        demoMode={demoMode}
        showAllFeatures={showAllFeatures}
        consoleLogs={consoleLogs}
        onToggleDemoMode={handleToggleDemoMode}
        onToggleShowAllFeatures={handleToggleShowAllFeatures}
        onToggleConsoleLogs={handleToggleConsoleLogs}
        onResetDemo={handleReset}
      />

      {/* Exit Demo Banner */}
      {showExitBanner && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-red-600/90 to-red-500/90 backdrop-blur-md safe-top"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">
                Demo Mode Active - Changes will not be saved
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
              >
                Exit Demo
              </button>
              <button
                onClick={() => setShowExitBanner(false)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 pt-20 safe-top">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-saffron-500/20 to-rose-500/20 border border-saffron-500/30 mb-6"
            >
              <Heart className="w-10 h-10 text-gradient-brand" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-gradient-brand mb-4"
            >
              Bandhan AI Demo
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto mb-8"
            >
              India's first marriage-focused dating platform
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center space-x-4"
            >
              <button
                onClick={() => setShowInstructions(true)}
                className="px-6 py-3 rounded-xl glass-sm border border-white/10 text-gray-300 hover:bg-white/5 transition-colors flex items-center space-x-2"
              >
                <HelpCircle className="w-5 h-5" />
                <span>How to Demo</span>
              </button>
              <a
                href="/matches"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white font-semibold hover:shadow-saffron-glow transition-shadow flex items-center space-x-2"
              >
                <span>Explore App</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Demo Accounts Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Select Demo Account
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Choose from 4 pre-created profiles with realistic data,
                conversations, and matches
              </p>
            </motion.div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {DEMO_ACCOUNTS.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DemoAccountCard
                    account={account}
                    onSelect={handleSelectAccount}
                    isLoading={isLoading}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Showcase */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <FeatureShowcase />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/5">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
            <p>Demo Mode - All data is mock and will be reset on exit</p>
            <p className="mt-2">
              Built with ❤️ for Indian singles seeking meaningful connections
            </p>
          </div>
        </footer>
      </div>

      {/* Demo Instructions Modal */}
      <DemoInstructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-10 h-10 text-saffron-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-white font-medium">Logging in...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
