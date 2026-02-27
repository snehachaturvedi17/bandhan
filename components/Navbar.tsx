'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Bell,
  User,
  Heart,
  MessageCircle,
  Crown,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

const navLinks = [
  {
    href: '/matches',
    label: 'Matches',
    icon: Heart,
  },
  {
    href: '/chat',
    label: 'Chat',
    icon: MessageCircle,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'glass-md py-2 safe-top'
            : 'bg-transparent py-4 safe-top'
        )}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <span className="text-gradient-brand text-2xl font-bold tracking-tight">
                  Bandhan
                </span>
                <span className="text-violet-400 text-2xl font-bold ml-1">
                  AI
                </span>
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-saffron-500 to-violet-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    'hover:text-saffron-400 hover:bg-white/5',
                    isActive(link.href)
                      ? 'text-violet-400 bg-white/10'
                      : 'text-midnight-200'
                  )}
                >
                  <span className="flex items-center space-x-2">
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </span>
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-xl bg-white/10 -z-10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Premium Badge */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full glass-sm border border-gold-500/30 hover:border-gold-500/50 transition-colors"
              >
                <Crown className="w-4 h-4 text-gold-500" />
                <span className="text-xs font-semibold text-gradient-premium">
                  Premium
                </span>
              </motion.button>

              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2.5 rounded-xl glass-sm hover:bg-white/10 transition-colors group"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-midnight-300 group-hover:text-violet-400 transition-colors" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-saffron-500 to-rose-500 text-[10px] font-bold text-white shadow-lg"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl glass-sm hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-midnight-300" />
                ) : (
                  <Menu className="w-5 h-5 text-midnight-300" />
                )}
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden safe-top safe-bottom"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] glass-dark z-50 md:hidden safe-top safe-bottom"
            >
              <div className="flex flex-col h-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-gradient-brand text-xl font-bold">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-midnight-300" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col space-y-2 flex-1">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200',
                          isActive(link.href)
                            ? 'bg-gradient-to-r from-violet-500/20 to-saffron-500/20 text-violet-400 border border-violet-500/30'
                            : 'text-midnight-200 hover:bg-white/5 hover:text-saffron-400'
                        )}
                      >
                        <link.icon
                          className={cn(
                            'w-5 h-5',
                            isActive(link.href)
                              ? 'text-violet-400'
                              : 'text-midnight-400'
                          )}
                        />
                        <span className="font-medium">{link.label}</span>
                        {isActive(link.href) && (
                          <motion.div
                            layoutId="mobile-indicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-saffron-500 to-violet-500"
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Premium Card */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-auto"
                >
                  <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-saffron-500/20 via-violet-500/20 to-rose-500/20 border border-white/10">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gold-500/30 to-transparent rounded-full blur-xl" />
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-5 h-5 text-gold-500" />
                        <span className="text-sm font-bold text-gradient-premium">
                          Premium
                        </span>
                      </div>
                      <p className="text-xs text-midnight-300 mb-3">
                        Unlock unlimited matches and exclusive features
                      </p>
                      <button className="w-full py-2 rounded-lg bg-gradient-to-r from-saffron-500 to-violet-500 text-white text-xs font-semibold hover:shadow-saffron-glow transition-shadow">
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
