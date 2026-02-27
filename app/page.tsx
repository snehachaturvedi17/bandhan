/**
 * Bandhan AI - Home Page
 * Redirects to appropriate page based on user state
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const profilePublished = localStorage.getItem('profile_published');

      setTimeout(() => {
        if (!token) {
          // Not authenticated - redirect to login
          router.push('/login');
        } else if (!profilePublished) {
          // Authenticated but no profile - redirect to onboarding
          router.push('/onboarding/intent');
        } else {
          // Authenticated with profile - redirect to matches
          router.push('/matches');
        }
      }, 2000);
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Loading Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        {/* Logo Animation */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-saffron-500/20 to-violet-500/20 border border-white/10 mb-6"
          >
            <Heart className="w-12 h-12 text-gradient-brand" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gradient-brand mb-2"
          >
            Bandhan AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-400"
          >
            AI-Powered Matchmaking for Modern Indians
          </motion.p>
        </div>

        {/* Loading Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center space-x-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-6 h-6 text-saffron-400" />
          </motion.div>
          <span className="text-gray-400">Loading...</span>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto"
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-saffron-400" />
            </div>
            <p className="text-xs text-gray-400">Verified Profiles</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-xs text-gray-400">Smart Matching</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-6 h-6 text-rose-400" />
            </div>
            <p className="text-xs text-gray-400">Privacy First</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
