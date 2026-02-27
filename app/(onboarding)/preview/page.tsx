'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Camera,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Heart,
  Utensils,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Globe,
  CheckCircle2,
  Sparkles,
  Upload,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types & Data
// ─────────────────────────────────────────────────────────────────────────────
interface OnboardingData {
  intent?: string;
  lifeArchitecture?: {
    pincode: string;
    city: string;
    relocationPreference: string;
    familyStructure: string;
    education: string;
    careerField: string;
    dietaryPreferences: string[];
  };
  values?: {
    loveLanguages: string[];
    dealbreakers: Record<string, number>;
    weekendPreferences: string[];
    fiveYearVision: string;
  };
}

interface Translation {
  publishProfile: string;
  publishing: string;
  profilePreview: string;
  yourProfileIsReady: string;
  privacyDisclaimer: string;
  verifiedMatchesOnly: string;
  edit: string;
  uploadPhoto: string;
  basicInfo: string;
  lifeDetails: string;
  valuesPersonality: string;
  intent: string;
  verification: string;
  city: string;
  education: string;
  career: string;
  family: string;
  diet: string;
  loveLanguage: string;
  dealbreakers: string;
  weekend: string;
  vision: string;
  bronze: string;
  silver: string;
  gold: string;
}

const translations: Record<'en' | 'hi', Translation> = {
  en: {
    publishProfile: 'Publish Profile',
    publishing: 'Publishing...',
    profilePreview: 'Profile Preview',
    yourProfileIsReady: 'Your profile is ready to be published',
    privacyDisclaimer: 'Your profile is visible only to verified matches',
    verifiedMatchesOnly: 'Verified matches only',
    edit: 'Edit',
    uploadPhoto: 'Upload Photo',
    basicInfo: 'Basic Info',
    lifeDetails: 'Life Details',
    valuesPersonality: 'Values & Personality',
    intent: 'Looking for',
    verification: 'Verification',
    city: 'City',
    education: 'Education',
    career: 'Career',
    family: 'Family',
    diet: 'Diet',
    loveLanguage: 'Love Languages',
    dealbreakers: 'Dealbreakers',
    weekend: 'Weekends',
    vision: '5-Year Vision',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
  },
  hi: {
    publishProfile: 'प्रोफ़ाइल प्रकाशित करें',
    publishing: 'प्रकाशित हो रहा है...',
    profilePreview: 'प्रोफ़ाइल पूर्वावलोकन',
    yourProfileIsReady: 'आपकी प्रोफ़ाइल प्रकाशित होने के लिए तैयार है',
    privacyDisclaimer: 'आपकी प्रोफ़ाइल केवल सत्यापित मैचों को दिखाई देती है',
    verifiedMatchesOnly: 'केवल सत्यापित मैच',
    edit: 'संपादित करें',
    uploadPhoto: 'फ़ोटो अपलोड करें',
    basicInfo: 'बुनियादी जानकारी',
    lifeDetails: 'जीवन विवरण',
    valuesPersonality: 'मूल्य और व्यक्तित्व',
    intent: 'तलाश रहे हैं',
    verification: 'सत्यापन',
    city: 'शहर',
    education: 'शिक्षा',
    career: 'करियर',
    family: 'परिवार',
    diet: 'आहार',
    loveLanguage: 'प्यार की भाषाएँ',
    dealbreakers: 'सौदेबाजी',
    weekend: 'सप्ताहांत',
    vision: '5 वर्ष की दृष्टि',
    bronze: 'कांस्य',
    silver: 'रजत',
    gold: 'स्वर्ण',
  },
};

const intentLabels: Record<string, { label: string; labelHi: string; color: string }> = {
  'marriage-soon': {
    label: 'Marriage within 1-2 years',
    labelHi: '1-2 वर्षों में विवाह',
    color: 'from-saffron-500 to-rose-500',
  },
  'serious-relationship': {
    label: 'Serious relationship',
    labelHi: 'गंभीर संबंध',
    color: 'from-violet-500 to-rose-500',
  },
  'friendship-networking': {
    label: 'Friendship / Networking',
    labelHi: 'मित्रता / नेटवर्किंग',
    color: 'from-violet-500 to-blue-500',
  },
  'healing-space': {
    label: 'Healing space',
    labelHi: 'उपचार की जगह',
    color: 'from-emerald-500 to-teal-500',
  },
};

const familyLabels: Record<string, { label: string; labelHi: string }> = {
  'living-with-parents': { label: 'Living with parents', labelHi: 'माता-पिता के साथ' },
  'joint-family': { label: 'Joint family', labelHi: 'संयुक्त परिवार' },
  'independent': { label: 'Independent', labelHi: 'स्वतंत्र' },
  'hostel': { label: 'Hostel/PG', labelHi: 'होस्टल' },
};

const dietLabels: Record<string, { label: string; labelHi: string }> = {
  'strict-vegetarian': { label: 'Vegetarian', labelHi: 'शाकाहारी' },
  'eggetarian': { label: 'Eggetarian', labelHi: 'अंडे वाला शाकाहारी' },
  'non-veg': { label: 'Non-vegetarian', labelHi: 'मांसाहारी' },
  'jain': { label: 'Jain', labelHi: 'जैन' },
  'halal-conscious': { label: 'Halal', labelHi: 'हलाल' },
};

const loveLanguageLabels: Record<string, { label: string; labelHi: string }> = {
  'family-elders': { label: 'Caring for elders', labelHi: 'बुजुर्गों की देखभाल' },
  'quality-time': { label: 'Quality time', labelHi: 'गुणवत्तापूर्ण समय' },
  'acts-of-service': { label: 'Acts of service', labelHi: 'सेवा कार्य' },
  'words-of-affirmation': { label: 'Words of affirmation', labelHi: 'पुष्टि के शब्द' },
  'physical-touch': { label: 'Physical touch', labelHi: 'शारीरिक स्पर्श' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilePreviewPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [verificationLevel, setVerificationLevel] = useState<'bronze' | 'silver' | 'gold'>('bronze');

  const t = translations[language];

  useEffect(() => {
    const data = localStorage.getItem('onboarding_data');
    if (data) {
      setOnboardingData(JSON.parse(data));
    }

    const storedAvatar = localStorage.getItem('profile_avatar');
    if (storedAvatar) {
      setAvatarUrl(storedAvatar);
    }
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        localStorage.setItem('profile_avatar', result);
        setShowImageModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark profile as published
      localStorage.setItem('profile_published', 'true');
      localStorage.setItem('verification_level', verificationLevel);

      // Navigate to dashboard/home
      router.push('/dashboard');
    } catch (error) {
      console.error('Error publishing profile:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = (section: string) => {
    const routes: Record<string, string> = {
      intent: '/onboarding/intent',
      life: '/onboarding/life-architecture',
      values: '/onboarding/values',
    };
    router.push(routes[section] || '/onboarding/intent');
  };

  const intent = onboardingData?.intent;
  const intentData = intent ? intentLabels[intent] : null;
  const lifeArch = onboardingData?.lifeArchitecture;
  const values = onboardingData?.values;

  const getVerificationIcon = () => {
    switch (verificationLevel) {
      case 'gold':
        return <ShieldCheck className="w-4 h-4" />;
      case 'silver':
        return <Shield className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  const getVerificationColor = () => {
    switch (verificationLevel) {
      case 'gold':
        return 'text-gold-500 bg-gold-500/10 border-gold-500/30';
      case 'silver':
        return 'text-midnight-200 bg-white/10 border-white/20';
      default:
        return 'text-amber-700 bg-amber-500/10 border-amber-500/30';
    }
  };

  if (!onboardingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-midnight-300">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 safe-top safe-bottom pb-32">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">
              {t.profilePreview}
            </h1>
            <p className="text-sm text-midnight-300">{t.yourProfileIsReady}</p>
          </div>
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="p-2.5 rounded-xl glass-sm hover:bg-white/10 transition-colors"
          >
            <Globe className="w-5 h-5 text-midnight-300" />
          </button>
        </div>
      </motion.header>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 space-y-4"
      >
        {/* Avatar & Basic Info Card */}
        <div className="glass-md rounded-3xl p-6 border border-white/10">
          <div className="flex items-start justify-between mb-4">
            {/* Avatar */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                {avatarUrl ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-violet-500/50 shadow-violet-glow">
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-saffron-500/20 to-violet-500/20 border-2 border-violet-500/50 flex items-center justify-center">
                    <User className="w-10 h-10 text-violet-400" />
                  </div>
                )}
              </motion.div>

              {/* Upload Button */}
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-r from-saffron-500 to-violet-500 border-2 border-midnight-900 shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Verification Badge */}
            <div className="flex flex-col items-end space-y-2">
              <div className={cn('px-3 py-1.5 rounded-full border flex items-center space-x-1.5', getVerificationColor())}>
                {getVerificationIcon()}
                <span className="text-xs font-semibold">
                  {verificationLevel === 'bronze' && t.bronze}
                  {verificationLevel === 'silver' && t.silver}
                  {verificationLevel === 'gold' && t.gold}
                </span>
              </div>

              {/* Verification Level Selector */}
              <select
                value={verificationLevel}
                onChange={(e) => setVerificationLevel(e.target.value as any)}
                className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-midnight-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="bronze">Bronze (Phone)</option>
                <option value="silver">Silver (Email)</option>
                <option value="gold">Gold (DigiLocker)</option>
              </select>
            </div>
          </div>

          {/* Name & Age Placeholder */}
          <div className="mb-3">
            <h2 className="text-xl font-bold text-midnight-50">
              Rahul Sharma
            </h2>
            <p className="text-sm text-midnight-400">
              28 years • Male • Hindi
            </p>
          </div>

          {/* Intent Tag */}
          {intentData && (
            <div className={cn('inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r', intentData.color)}>
              <Heart className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white">
                {language === 'en' ? intentData.label : intentData.labelHi}
              </span>
            </div>
          )}
        </div>

        {/* Basic Info Section */}
        <div className="glass-md rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-midnight-200 flex items-center space-x-2">
              <User className="w-4 h-4 text-violet-400" />
              <span>{t.basicInfo}</span>
            </h3>
            <button
              onClick={() => handleEdit('life')}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center space-x-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{t.edit}</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* City */}
            {lifeArch?.city && (
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-midnight-400" />
                <span className="text-midnight-300">{t.city}:</span>
                <span className="text-midnight-200">{lifeArch.city}</span>
              </div>
            )}

            {/* Education */}
            {lifeArch?.education && (
              <div className="flex items-center space-x-3 text-sm">
                <GraduationCap className="w-4 h-4 text-midnight-400" />
                <span className="text-midnight-300">{t.education}:</span>
                <span className="text-midnight-200">{lifeArch.education}</span>
              </div>
            )}

            {/* Career */}
            {lifeArch?.careerField && (
              <div className="flex items-center space-x-3 text-sm">
                <Briefcase className="w-4 h-4 text-midnight-400" />
                <span className="text-midnight-300">{t.career}:</span>
                <span className="text-midnight-200 capitalize">{lifeArch.careerField.replace(/-/g, ' ')}</span>
              </div>
            )}

            {/* Family */}
            {lifeArch?.familyStructure && (
              <div className="flex items-center space-x-3 text-sm">
                <Home className="w-4 h-4 text-midnight-400" />
                <span className="text-midnight-300">{t.family}:</span>
                <span className="text-midnight-200">
                  {familyLabels[lifeArch.familyStructure]?.label || lifeArch.familyStructure}
                </span>
              </div>
            )}

            {/* Diet */}
            {lifeArch?.dietaryPreferences && lifeArch.dietaryPreferences.length > 0 && (
              <div className="flex items-center space-x-3 text-sm">
                <Utensils className="w-4 h-4 text-midnight-400" />
                <span className="text-midnight-300">{t.diet}:</span>
                <div className="flex flex-wrap gap-1">
                  {lifeArch.dietaryPreferences.map((diet) => (
                    <span
                      key={diet}
                      className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs"
                    >
                      {dietLabels[diet]?.label || diet}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Values & Personality Section */}
        <div className="glass-md rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-midnight-200 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-violet-400" />
              <span>{t.valuesPersonality}</span>
            </h3>
            <button
              onClick={() => handleEdit('values')}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center space-x-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{t.edit}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Love Languages */}
            {values?.loveLanguages && values.loveLanguages.length > 0 && (
              <div>
                <p className="text-xs text-midnight-400 mb-2">{t.loveLanguage}</p>
                <div className="flex flex-wrap gap-1.5">
                  {values.loveLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs"
                    >
                      {loveLanguageLabels[lang]?.label || lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dealbreakers Summary */}
            {values?.dealbreakers && Object.keys(values.dealbreakers).length > 0 && (
              <div>
                <p className="text-xs text-midnight-400 mb-2">{t.dealbreakers}</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(values.dealbreakers).slice(0, 3).map(([key, level]) => (
                    <span
                      key={key}
                      className={cn(
                        'px-2.5 py-1 rounded-lg border text-xs',
                        level <= 1
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      )}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}: {level <= 1 ? 'Strict' : 'Flexible'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weekend & Vision */}
            <div className="grid grid-cols-2 gap-3">
              {values?.weekendPreferences && values.weekendPreferences.length > 0 && (
                <div>
                  <p className="text-xs text-midnight-400 mb-2">{t.weekend}</p>
                  <p className="text-sm text-midnight-200 capitalize">
                    {values.weekendPreferences[0].replace(/-/g, ' ')}
                  </p>
                </div>
              )}
              {values?.fiveYearVision && (
                <div>
                  <p className="text-xs text-midnight-400 mb-2">{t.vision}</p>
                  <p className="text-sm text-midnight-200 capitalize">
                    {values.fiveYearVision.replace(/-/g, ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-sm rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-midnight-200">{t.privacyDisclaimer}</p>
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400">{t.verifiedMatchesOnly}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Publish Button */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 p-4 safe-bottom bg-gradient-to-t from-midnight-900 via-midnight-900/95 to-transparent"
      >
        <div className="max-w-md mx-auto">
          <motion.button
            onClick={handlePublish}
            disabled={isPublishing}
            whileHover={{ scale: isPublishing ? 1 : 1.02 }}
            whileTap={{ scale: isPublishing ? 1 : 0.98 }}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-white',
              'flex items-center justify-center space-x-2',
              'transition-all duration-300',
              !isPublishing
                ? 'bg-gradient-to-r from-saffron-500 to-violet-500 hover:shadow-saffron-glow'
                : 'bg-midnight-700/50 cursor-not-allowed'
            )}
          >
            {isPublishing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span>{t.publishing}</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>{t.publishProfile}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.footer>

      {/* Image Upload Modal */}
      {showImageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-md rounded-2xl p-6 max-w-sm w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-midnight-50">{t.uploadPhoto}</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-midnight-300" />
              </button>
            </div>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-violet-500/50 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-midnight-400 mx-auto mb-3" />
                <p className="text-sm text-midnight-300 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-midnight-500">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </label>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
