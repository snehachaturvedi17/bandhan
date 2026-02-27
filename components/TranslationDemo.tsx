/**
 * Bandhan AI - Translation System Demo
 * Shows how to use the bilingual translation system
 */

'use client';

import { LanguageToggle, useTranslation } from '@/contexts/LanguageContext';
import { T, useT, useFormatNumber, useFormatDate, useFormatRelativeTime } from '@/hooks/useTranslation';

// ─────────────────────────────────────────────────────────────────────────────
// Example Component: Using Translation Hook
// ─────────────────────────────────────────────────────────────────────────────
export function TranslationDemo() {
  const { t, language, toggleLanguage } = useTranslation();
  const formatNumber = useFormatNumber();
  const formatDate = useFormatDate();
  const formatRelative = useFormatRelativeTime();

  const sampleDate = new Date(Date.now() - 300000); // 5 minutes ago

  return (
    <div className="p-6 space-y-6">
      {/* Language Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          <T k="common.settings" />
        </h2>
        <LanguageToggle variant="inline" />
      </div>

      {/* Basic Translation */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Basic Translations:</h3>
        <p>{t('auth.welcome')}</p>
        <p>{t('auth.send_otp')}</p>
        <p>{t('matches.title')}</p>
      </div>

      {/* Translation with Parameters */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">With Parameters:</h3>
        <p>{t('onboarding.step_of', { current: 1, total: 5 })}</p>
        <p>{t('time.minutes_ago', { min: 5 })}</p>
        <p>{t('time.hours_ago', { hours: 2 })}</p>
      </div>

      {/* Number Formatting */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Number Formatting:</h3>
        <p>English: {formatNumber(1234567)}</p>
        <p>Hindi: {formatNumber(1234567)}</p>
        <p>Currency: {formatNumber(499, { style: 'currency', currency: 'INR' })}</p>
      </div>

      {/* Date Formatting */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Date Formatting:</h3>
        <p>Full Date: {formatDate(new Date())}</p>
        <p>Short: {formatDate(new Date(), { dateStyle: 'short' })}</p>
        <p>Long: {formatDate(new Date(), { dateStyle: 'long' })}</p>
      </div>

      {/* Relative Time */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Relative Time:</h3>
        <p>5 min ago: {formatRelative(sampleDate)}</p>
        <p>Just now: {formatRelative(new Date())}</p>
      </div>

      {/* Current Language */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Current State:</h3>
        <p>Language: {language}</p>
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-saffron-500 text-white rounded-lg"
        >
          Toggle Language
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example Component: Using T Component
// ─────────────────────────────────────────────────────────────────────────────
export function TranslationComponentDemo() {
  return (
    <div className="p-6 space-y-4">
      {/* Using T component for inline translations */}
      <h1>
        <T k="auth.welcome" component="span" className="text-2xl font-bold" />
      </h1>

      <p>
        <T
          k="onboarding.step_of"
          params={{ current: 2, total: 4 }}
          component="span"
        />
      </p>

      {/* Nested translations */}
      <div>
        <T k="common.loading" />
        <T k="common.success" />
        <T k="common.error" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example: Auth Screen Translation
// ─────────────────────────────────────────────────────────────────────────────
export function AuthScreenExample() {
  const t = useT();

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient-brand">
          {t('auth.welcome')}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {t('auth.enter_phone')}
        </p>
      </div>

      {/* Phone Input */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">
          {t('auth.phone_number')}
        </label>
        <input
          type="tel"
          placeholder="+91 XXXXXXXXXX"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
        />
      </div>

      {/* Send OTP Button */}
      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white font-semibold">
        {t('auth.send_otp')}
      </button>

      {/* Terms */}
      <p className="text-xs text-center text-gray-500">
        {t('auth.terms_agree')}{' '}
        <a href="/terms" className="text-violet-400 hover:underline">
          {t('auth.terms')}
        </a>{' '}
        &{' '}
        <a href="/privacy" className="text-violet-400 hover:underline">
          {t('auth.privacy')}
        </a>
      </p>

      {/* Phishing Warning */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-xs text-amber-200">
          {t('auth.phishing_warning')}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example: Matches Screen Translation
// ─────────────────────────────────────────────────────────────────────────────
export function MatchesScreenExample() {
  const t = useT();

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('matches.title')}</h1>
        <LanguageToggle variant="minimal" />
      </div>

      {/* Daily Limit */}
      <div className="p-4 rounded-xl glass-sm border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm">{t('matches.daily_limit')}</span>
          <span className="text-sm font-semibold">3/5</span>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <p className="text-gray-400">{t('matches.no_matches')}</p>
        <button className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-violet-500 text-white">
          {t('onboarding.complete')}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example: Premium Screen Translation
// ─────────────────────────────────────────────────────────────────────────────
export function PremiumScreenExample() {
  const t = useT();
  const formatNumber = useFormatNumber();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient-brand">
          {t('premium.title')}
        </h1>
        <p className="text-gray-400 mt-2">{t('premium.tagline')}</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-4">
        {/* Free Plan */}
        <div className="p-6 rounded-2xl glass-md border border-white/10">
          <h3 className="text-lg font-bold">{t('premium.free_plan')}</h3>
          <p className="text-3xl font-bold mt-2">
            ₹{formatNumber(0)}
            <span className="text-sm text-gray-400">{t('premium.per_month')}</span>
          </p>
          <button className="mt-4 w-full py-3 rounded-xl glass-sm border border-white/10">
            {t('premium.current_plan')}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-saffron-500/20 to-rose-500/20 border border-saffron-500/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{t('premium.premium_plan')}</h3>
            <span className="px-2 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs">
              {t('premium.most_popular')}
            </span>
          </div>
          <p className="text-3xl font-bold mt-2">
            ₹{formatNumber(499)}
            <span className="text-sm text-gray-400">{t('premium.per_month')}</span>
          </p>
          <button className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white font-semibold">
            {t('premium.upgrade')}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">{t('premium.features')}</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center space-x-2">
            <span className="text-emerald-400">✓</span>
            <span>{t('premium.unlimited_profiles')}</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-emerald-400">✓</span>
            <span>{t('premium.unlimited_chats')}</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-emerald-400">✓</span>
            <span>{t('premium.family_view_pdf')}</span>
          </li>
        </ul>
      </div>

      {/* Money Back Guarantee */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
        <p className="text-sm text-emerald-200">{t('premium.money_back')}</p>
      </div>
    </div>
  );
}

export default TranslationDemo;
