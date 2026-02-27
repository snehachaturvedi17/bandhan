/**
 * Bandhan AI - Presenter Controls
 * Demo mode controls for presenters
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  RotateCcw,
  Sparkles,
  Terminal,
  X,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface PresenterControlsProps {
  demoMode: boolean;
  showAllFeatures: boolean;
  consoleLogs: boolean;
  onToggleDemoMode: () => void;
  onToggleShowAllFeatures: () => void;
  onToggleConsoleLogs: () => void;
  onResetDemo: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Control Button Component
// ─────────────────────────────────────────────────────────────────────────────
interface ControlButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}

function ControlButton({
  icon: Icon,
  label,
  active = false,
  onClick,
  variant = 'default',
}: ControlButtonProps) {
  const variants = {
    default: active
      ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10',
    danger: active
      ? 'bg-red-500/20 border-red-500/50 text-red-300'
      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-red-500/10',
    success: active
      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-emerald-500/10',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center space-x-2 px-4 py-2.5 rounded-xl border',
        'transition-all duration-200',
        variants[variant]
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
      {active && <Check className="w-4 h-4 ml-auto" />}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset Confirmation Modal
// ─────────────────────────────────────────────────────────────────────────────
interface ResetModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ResetModal({ isOpen, onConfirm, onCancel }: ResetModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md">
              <div className="rounded-2xl bg-gradient-to-b from-midnight-900 to-midnight-950 border border-white/10 p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2">
                  Reset Demo Data?
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-6">
                  This will clear all mock conversations, matches, and user data.
                  This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-xl glass-sm border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={onConfirm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg transition-shadow"
                  >
                    Reset Demo
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyboard Shortcuts Info
// ─────────────────────────────────────────────────────────────────────────────
function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: 'Ctrl+D', action: 'Toggle demo mode' },
    { keys: 'Ctrl+R', action: 'Reset demo data' },
    { keys: 'Ctrl+F', action: 'Show all features' },
    { keys: 'Ctrl+K', action: 'Toggle console logs' },
    { keys: 'Esc', action: 'Close modals' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg glass-sm text-gray-400 hover:text-white transition-colors"
      >
        <Info className="w-4 h-4" />
        <span className="text-xs">Shortcuts</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md">
                <div className="rounded-2xl bg-gradient-to-b from-midnight-900 to-midnight-950 border border-white/10 p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      Keyboard Shortcuts
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Shortcuts List */}
                  <div className="space-y-3">
                    {shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.keys}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <span className="text-sm text-gray-300">
                          {shortcut.action}
                        </span>
                        <kbd className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-mono text-gray-300">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function PresenterControls({
  demoMode,
  showAllFeatures,
  consoleLogs,
  onToggleDemoMode,
  onToggleShowAllFeatures,
  onToggleConsoleLogs,
  onResetDemo,
}: PresenterControlsProps) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleReset = () => {
    setShowResetModal(false);
    onResetDemo();
  };

  return (
    <>
      {/* Controls Panel */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          'fixed top-4 right-4 z-40 safe-top',
          isCollapsed ? 'w-auto' : 'w-80'
        )}
      >
        <div className="rounded-2xl bg-gradient-to-b from-midnight-900/95 to-midnight-950/95 border border-white/10 backdrop-blur-md shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">
                Presenter Controls
              </span>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isCollapsed ? (
                <Settings className="w-4 h-4 text-gray-400" />
              ) : (
                <X className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Controls */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-4 space-y-3 overflow-hidden"
              >
                {/* Demo Mode Toggle */}
                <ControlButton
                  icon={Sparkles}
                  label="Demo Mode"
                  active={demoMode}
                  onClick={onToggleDemoMode}
                  variant="success"
                />

                {/* Show All Features */}
                <ControlButton
                  icon={Sparkles}
                  label="Show All Features"
                  active={showAllFeatures}
                  onClick={onToggleShowAllFeatures}
                  variant="success"
                />

                {/* Console Logs */}
                <ControlButton
                  icon={Terminal}
                  label="Console Logs"
                  active={consoleLogs}
                  onClick={onToggleConsoleLogs}
                />

                {/* Reset Demo */}
                <ControlButton
                  icon={RotateCcw}
                  label="Reset Demo"
                  onClick={() => setShowResetModal(true)}
                  variant="danger"
                />

                {/* Keyboard Shortcuts */}
                <div className="pt-2 border-t border-white/10">
                  <KeyboardShortcuts />
                </div>

                {/* Demo Mode Status */}
                {demoMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-300 font-medium">
                        Demo mode active
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Reset Confirmation Modal */}
      <ResetModal
        isOpen={showResetModal}
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />
    </>
  );
}

export default PresenterControls;
