'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Crown,
  Zap,
  Users,
  MessageCircle,
  Filter,
  FileText,
  Sparkles,
  Shield,
  Lock,
  RotateCcw,
  QrCode,
  Smartphone,
  Globe,
  CreditCard,
  Building,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    unlockPremium: 'Unlock Premium',
    tagline: 'Less than ₹17/day – your journey to marriage',
    taglineHi: '₹17/दिन से कम – आपकी शादी की यात्रा',
    freePlan: 'Free',
    premiumPlan: 'Premium',
    familyPlan: 'Family',
    currentPlan: 'Current Plan',
    mostPopular: 'Most Popular',
    bestValue: 'Best Value',
    perMonth: '/month',
    perYear: '/year',
    save: 'Save',
    billedYearly: 'Billed yearly',
    features: 'Features',
    upgrade: 'Upgrade',
    current: 'Current',
    scanToPay: 'Scan to Pay',
    scanWith: 'Scan with PhonePe / GPay / Paytm',
    orPayWithVpa: 'Or pay with UPI ID',
    enterVpa: 'Enter UPI ID (e.g., yourname@upi)',
    payNow: 'Pay Now',
    processing: 'Processing...',
    trustBadges: {
      digilocker: 'DigiLocker Verified',
      dpdp: 'DPDP Compliant',
      guarantee: '7-day money back guarantee',
    },
    hindi: 'हिंदी',
    english: 'English',
    whyPremium: 'Why Premium?',
    whyPremiumHi: 'प्रीमियम क्यों?',
  },
  hi: {
    unlockPremium: 'प्रीमियम अनलॉक करें',
    tagline: '₹17/दिन से कम – आपकी शादी की यात्रा',
    taglineHi: 'Less than ₹17/day – your journey to marriage',
    freePlan: 'मुफ्त',
    premiumPlan: 'प्रीमियम',
    familyPlan: 'परिवार',
    currentPlan: 'वर्तमान योजना',
    mostPopular: 'सबसे लोकप्रिय',
    bestValue: 'सर्वोत्तम मूल्य',
    perMonth: '/माह',
    perYear: '/वर्ष',
    save: 'बचाएं',
    billedYearly: 'वार्षिक बिल',
    features: 'विशेषताएं',
    upgrade: 'अपग्रेड',
    current: 'वर्तमान',
    scanToPay: 'भुगतान करने के लिए स्कैन करें',
    scanWith: 'PhonePe / GPay / Paytm से स्कैन करें',
    orPayWithVpa: 'या UPI ID से भुगतान करें',
    enterVpa: 'UPI ID दर्ज करें (जैसे, yourname@upi)',
    payNow: 'अभी भुगतान करें',
    processing: 'प्रसंस्करण...',
    trustBadges: {
      digilocker: 'DigiLocker सत्यापित',
      dpdp: 'DPDP अनुपालित',
      guarantee: '7-दिन की वापसी गारंटी',
    },
    hindi: 'English',
    english: 'हिंदी',
    whyPremium: 'प्रीमियम क्यों?',
    whyPremiumHi: 'Why Premium?',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Pricing Data
// ─────────────────────────────────────────────────────────────────────────────
const freeFeatures = [
  { label: '5 profiles/day', labelHi: '5 प्रोफ़ाइल/दिन', included: true },
  { label: '2 chats/day', labelHi: '2 चैट/दिन', included: true },
  { label: 'Basic filters', labelHi: 'बुनियादी फ़िल्टर', included: true },
  { label: 'Unlimited profiles', labelHi: 'असीमित प्रोफ़ाइल', included: false },
  { label: 'Caste subgroup filters', labelHi: 'जाति उपसमूह फ़िल्टर', included: false },
  { label: 'Family View PDF', labelHi: 'परिवार दृश्य PDF', included: false },
];

const premiumFeatures = [
  { label: 'Unlimited profiles', labelHi: 'असीमित प्रोफ़ाइल', icon: Users },
  { label: 'Unlimited chats', labelHi: 'असीमित चैट', icon: MessageCircle },
  { label: 'Advanced filters (Caste, Gotra)', labelHi: 'उन्नत फ़िल्टर (जाति, गोत्र)', icon: Filter },
  { label: 'Family View PDF download', labelHi: 'परिवार दृश्य PDF डाउनलोड', icon: FileText },
  { label: 'Compatibility insights', labelHi: 'अनुकूलता अंतर्दृष्टि', icon: Sparkles },
  { label: 'Priority customer support', labelHi: 'प्राथमिकता ग्राहक सहायता', icon: Zap },
];

const familyFeatures = [
  { label: '2 profiles (siblings)', labelHi: '2 प्रोफ़ाइल (भाई-बहन)', icon: Users },
  { label: 'Parent dashboard', labelHi: 'माता-पिता डैशबोर्ड', icon: Building },
  { label: 'Shared matching preferences', labelHi: 'साझा मिलान प्राथमिकताएं', icon: Filter },
  { label: 'All Premium features', labelHi: 'सभी प्रीमियम सुविधाएं', icon: Crown },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
function PricingCard({
  title,
  titleHi,
  price,
  period,
  badge,
  badgeColor,
  features,
  isCurrent,
  onSelect,
  highlight,
}: {
  title: string;
  titleHi: string;
  price: string;
  period: string;
  badge?: string;
  badgeColor?: string;
  features: { label: string; labelHi: string; included?: boolean; icon?: React.ComponentType<{ className?: string }> }[];
  isCurrent?: boolean;
  highlight?: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'relative rounded-2xl p-5 border transition-all duration-300',
        highlight
          ? 'bg-gradient-to-b from-saffron-500/10 via-rose-500/10 to-violet-500/10 border-saffron-500/50 scale-105 shadow-xl shadow-saffron-500/20'
          : 'glass-md border-white/10 hover:border-white/20'
      )}
    >
      {/* Badge */}
      {badge && (
        <div className={cn('absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold', badgeColor || 'bg-violet-500/20 text-violet-300 border border-violet-500/30')}>
          {badge}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-4 pt-2">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-midnight-400 hindi-text">{titleHi}</p>
        <div className="mt-3">
          <span className="text-3xl font-bold text-white">{price}</span>
          <span className="text-sm text-midnight-400">{period}</span>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2.5 mb-5">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-2">
            {'included' in feature ? (
              feature.included ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-midnight-500 flex-shrink-0 mt-0.5" />
              )
            ) : (
              feature.icon && (
                <feature.icon className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              )
            )}
            <span className={cn('text-sm', 'included' in feature && !feature.included ? 'text-midnight-500 line-through' : 'text-midnight-200')}>
              {feature.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={cn(
          'w-full py-3 rounded-xl font-semibold transition-all duration-200',
          isCurrent
            ? 'bg-midnight-700/50 text-midnight-400 cursor-not-allowed'
            : highlight
            ? 'bg-gradient-to-r from-saffron-500 to-rose-500 text-white hover:shadow-saffron-glow'
            : 'glass-sm border border-white/10 text-midnight-200 hover:bg-white/5'
        )}
      >
        {isCurrent ? 'Current' : 'Upgrade'}
      </button>
    </motion.div>
  );
}

function TrustBadge({ icon: Icon, label, labelHi }: { icon: React.ComponentType<{ className?: string }>; label: string; labelHi: string }) {
  return (
    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg glass-sm border border-white/10">
      <Icon className="w-4 h-4 text-emerald-400" />
      <div>
        <p className="text-xs text-midnight-200">{label}</p>
        <p className="text-[10px] text-midnight-500 hindi-text">{labelHi}</p>
      </div>
    </div>
  );
}

function UPIPayment({
  onPaymentComplete,
  language,
}: {
  onPaymentComplete: () => void;
  language: 'en' | 'hi';
}) {
  const [vpa, setVpa] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = translations[language];

  const handlePay = async () => {
    if (!vpa) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onPaymentComplete();
  };

  const handleCopyVPA = () => {
    navigator.clipboard.writeText('bandhan@upi');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="flex flex-col items-center">
        <div className="w-48 h-48 rounded-2xl bg-white p-3 border-4 border-saffron-500/30 shadow-lg shadow-saffron-500/20">
          <div className="w-full h-full bg-gradient-to-br from-midnight-900 to-midnight-800 rounded-xl flex items-center justify-center relative overflow-hidden">
            {/* Simulated QR Pattern */}
            <div className="absolute inset-2 grid grid-cols-6 gap-1">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-sm',
                    Math.random() > 0.5 ? 'bg-midnight-900' : 'bg-white'
                  )}
                />
              ))}
            </div>
            {/* Center Logo */}
            <div className="relative z-10 w-12 h-12 rounded-lg bg-gradient-to-br from-saffron-500 to-rose-500 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <p className="text-sm text-midnight-300 mt-3">{t.scanWith}</p>
        <p className="text-xs text-midnight-500 hindi-text mt-0.5">
          PhonePe / GPay / Paytm से स्कैन करें
        </p>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-transparent text-xs text-midnight-500">
            {t.orPayWithVpa}
          </span>
        </div>
      </div>

      {/* VPA Input */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={vpa}
            onChange={(e) => setVpa(e.target.value)}
            placeholder={t.enterVpa}
            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-midnight-100 placeholder:text-midnight-500 focus:outline-none focus:ring-2 focus:ring-saffron-500/50"
          />
          <button
            onClick={handleCopyVPA}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-midnight-400" />
            )}
          </button>
        </div>

        {/* Merchant VPA */}
        <div className="p-3 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-saffron-200">Merchant UPI ID</p>
            <p className="text-sm font-mono text-saffron-400">bandhan@upi</p>
          </div>
          <button
            onClick={handleCopyVPA}
            className="p-2 rounded-lg hover:bg-saffron-500/20 transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-saffron-400" />
            )}
          </button>
        </div>

        <button
          onClick={handlePay}
          disabled={!vpa || isProcessing}
          className={cn(
            'w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200',
            'bg-gradient-to-r from-saffron-500 to-rose-500 hover:shadow-saffron-glow',
            (!vpa || isProcessing) && 'opacity-50 cursor-not-allowed hover:shadow-none'
          )}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RotateCcw className="w-5 h-5" />
              </motion.div>
              <span>{t.processing}</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>{t.payNow}</span>
            </span>
          )}
        </button>
      </div>

      {/* Payment Methods */}
      <div className="flex items-center justify-center space-x-3 pt-2">
        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-1.5">
          <Smartphone className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-midnight-300">PhonePe</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-1.5">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-midnight-300">GPay</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-1.5">
          <Building className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-midnight-300">Paytm</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function PremiumPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'family'>('yearly');
  const [showPayment, setShowPayment] = useState(false);

  const t = translations[language];

  const handleUpgrade = () => {
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    // Handle successful payment
    console.log('Payment complete!');
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 safe-top safe-bottom pb-16">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 rounded-xl glass-sm hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-midnight-300" />
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 rounded-xl glass-sm text-sm text-midnight-300 hover:bg-white/10 transition-colors flex items-center space-x-1"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-saffron-500/20 to-rose-500/20 border border-saffron-500/30 mb-4"
          >
            <Crown className="w-8 h-8 text-saffron-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">
            {t.unlockPremium}
          </h1>
          <p className="text-midnight-300">{t.tagline}</p>
          <p className="text-midnight-500 text-sm hindi-text mt-1">{t.taglineHi}</p>
        </div>
      </motion.header>

      {/* Pricing Cards */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mb-8"
      >
        {/* Plan Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 rounded-xl glass-md border border-white/10">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedPlan === 'monthly'
                  ? 'bg-saffron-500/20 text-saffron-300'
                  : 'text-midnight-400 hover:text-midnight-200'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1',
                selectedPlan === 'yearly'
                  ? 'bg-saffron-500/20 text-saffron-300'
                  : 'text-midnight-400 hover:text-midnight-200'
              )}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                -40%
              </span>
            </button>
            <button
              onClick={() => setSelectedPlan('family')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedPlan === 'family'
                  ? 'bg-saffron-500/20 text-saffron-300'
                  : 'text-midnight-400 hover:text-midnight-200'
              )}
            >
              Family
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free Plan */}
          <PricingCard
            title={t.freePlan}
            titleHi={translations.hi.freePlan}
            price="₹0"
            period={t.perMonth}
            badge={t.currentPlan}
            badgeColor="bg-midnight-700/50 text-midnight-300 border border-white/10"
            features={freeFeatures}
            isCurrent
            onSelect={() => {}}
          />

          {/* Premium Plan */}
          <PricingCard
            title={t.premiumPlan}
            titleHi={translations.hi.premiumPlan}
            price={selectedPlan === 'yearly' ? '₹2,999' : '₹499'}
            period={selectedPlan === 'yearly' ? t.perYear : t.perMonth}
            badge={selectedPlan === 'yearly' ? t.mostPopular : undefined}
            badgeColor="bg-gradient-to-r from-gold-500/20 to-saffron-500/20 text-gold-400 border border-gold-500/30"
            features={premiumFeatures}
            highlight
            onSelect={handleUpgrade}
          />

          {/* Family Plan */}
          <PricingCard
            title={t.familyPlan}
            titleHi={translations.hi.familyPlan}
            price="₹799"
            period={t.perMonth}
            badge={t.bestValue}
            badgeColor="bg-gradient-to-r from-violet-500/20 to-rose-500/20 text-violet-400 border border-violet-500/30"
            features={familyFeatures}
            onSelect={handleUpgrade}
          />
        </div>
      </motion.main>

      {/* Payment Modal */}
      {showPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowPayment(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md glass-md rounded-3xl p-6 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Complete Payment</h2>
              <button
                onClick={() => setShowPayment(false)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-midnight-300" />
              </button>
            </div>

            <UPIPayment
              onPaymentComplete={handlePaymentComplete}
              language={language}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Trust Badges */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10"
      >
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <TrustBadge
            icon={Shield}
            label={t.trustBadges.digilocker}
            labelHi={translations.hi.trustBadges.digilocker}
          />
          <TrustBadge
            icon={Lock}
            label={t.trustBadges.dpdp}
            labelHi={translations.hi.trustBadges.dpdp}
          />
          <TrustBadge
            icon={RotateCcw}
            label={t.trustBadges.guarantee}
            labelHi={translations.hi.trustBadges.guarantee}
          />
        </div>

        {/* Why Premium Section */}
        <div className="glass-md rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold text-midnight-200 mb-4 text-center">
            {t.whyPremium}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-saffron-400">10x</p>
              <p className="text-xs text-midnight-400">More matches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-400">5x</p>
              <p className="text-xs text-midnight-400">Higher response rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-400">3x</p>
              <p className="text-xs text-midnight-400">Faster marriage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">100%</p>
              <p className="text-xs text-midnight-400">Verified profiles</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
