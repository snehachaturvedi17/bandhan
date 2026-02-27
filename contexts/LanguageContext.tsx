/**
 * Bandhan AI - Language Context Provider
 * Handles Hindi/English localization across the entire app
 *
 * Features:
 * - Auto-detect device language
 * - Persist preference in localStorage
 * - Dynamic font loading (Inter for English, Noto Sans Devanagari for Hindi)
 * - Fallback to English if Hindi translation missing
 * - No page reload on language switch
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type Language = 'en' | 'hi';

export interface TranslationData {
  [key: string]: string | TranslationData;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  isRTL: boolean;
  fontClass: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
let translations: Record<Language, TranslationData> = {
  en: {},
  hi: {},
};

// Load translations dynamically
async function loadTranslations(lang: Language): Promise<TranslationData> {
  if (translations[lang] && Object.keys(translations[lang]).length > 0) {
    return translations[lang];
  }

  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${lang} translations`);
    }
    translations[lang] = await response.json();
    return translations[lang];
  } catch (error) {
    console.error(`Error loading ${lang} translations:`, error);
    // Fallback to English
    if (lang === 'hi' && translations.en) {
      return translations.en;
    }
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect device language preference
 * Returns 'hi' if device language is Hindi, otherwise 'en'
 */
function detectDeviceLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language.toLowerCase();
  const systemLangs = navigator.languages || [browserLang];

  // Check for Hindi variants
  const hindiVariants = ['hi', 'hi-in', 'hin', 'hindi'];

  for (const lang of systemLangs) {
    if (hindiVariants.some((h) => lang.includes(h))) {
      return 'hi';
    }
  }

  return 'en';
}

/**
 * Get stored language preference from localStorage
 */
function getStoredLanguage(): Language | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const stored = localStorage.getItem('bandhan_language');
    if (stored === 'en' || stored === 'hi') {
      return stored;
    }
  } catch (error) {
    console.error('Error reading language from storage:', error);
  }

  return null;
}

/**
 * Store language preference to localStorage
 */
function storeLanguage(lang: Language): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem('bandhan_language', lang);
  } catch (error) {
    console.error('Error storing language preference:', error);
  }
}

/**
 * Get nested translation value from key path
 * e.g., 'auth.welcome' -> translations.auth.welcome
 */
function getNestedValue(obj: TranslationData, path: string): string | null {
  const keys = path.split('.');
  let current: TranslationData | string = obj;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return typeof current === 'string' ? current : null;
}

/**
 * Interpolate parameters in translation string
 * e.g., 'Hello {{name}}' with {name: 'John'} -> 'Hello John'
 */
function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;

  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider Component
// ─────────────────────────────────────────────────────────────────────────────
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({
  children,
  defaultLanguage = 'en',
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedTranslations, setLoadedTranslations] = useState<Record<Language, TranslationData>>({
    en: {},
    hi: {},
  });

  // Initialize language on mount
  useEffect(() => {
    async function init() {
      // Get stored preference or detect from device
      const stored = getStoredLanguage();
      const detected = stored || detectDeviceLanguage();

      // Load translations for both languages
      const [enTranslations, hiTranslations] = await Promise.all([
        loadTranslations('en'),
        loadTranslations('hi'),
      ]);

      setLoadedTranslations({
        en: enTranslations,
        hi: hiTranslations,
      });

      setLanguageState(detected);
      setIsLoading(false);
    }

    init();
  }, []);

  // Update document language and font class
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    document.documentElement.classList.remove('font-inter', 'font-hindi');
    document.documentElement.classList.add(language === 'hi' ? 'font-hindi' : 'font-inter');

    // Set CSS variable for text direction (future RTL support)
    document.documentElement.style.setProperty(
      '--text-direction',
      language === 'hi' ? 'ltr' : 'ltr'
    );

    // Adjust line-height for Hindi text (Devanagari needs more space)
    document.documentElement.style.setProperty(
      '--line-height-base',
      language === 'hi' ? '1.8' : '1.6'
    );
  }, [language]);

  // Set language state and persist
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storeLanguage(lang);
  }, []);

  // Toggle between English and Hindi
  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const newLang = prev === 'en' ? 'hi' : 'en';
      storeLanguage(newLang);
      return newLang;
    });
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Try current language first
      const currentLangTranslations = loadedTranslations[language];
      let value = getNestedValue(currentLangTranslations, key);

      // Fallback to English if Hindi translation missing
      if (!value && language === 'hi') {
        value = getNestedValue(loadedTranslations.en, key);
      }

      // Final fallback: return key itself
      if (!value) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }

      return interpolate(value, params);
    },
    [language, loadedTranslations]
  );

  // RTL support (currently LTR for both English and Hindi)
  const isRTL = false;

  // Font class for Tailwind
  const fontClass = language === 'hi' ? 'font-hindi' : 'font-inter';

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isLoading,
    isRTL,
    fontClass,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translation Hook (Shorthand)
// ─────────────────────────────────────────────────────────────────────────────
export function useTranslation() {
  const { t, language, setLanguage, toggleLanguage } = useLanguage();
  return { t, language, setLanguage, toggleLanguage };
}

// ─────────────────────────────────────────────────────────────────────────────
// Language Toggle Component
// ─────────────────────────────────────────────────────────────────────────────
export function LanguageToggle({
  className,
  variant = 'floating',
}: {
  className?: string;
  variant?: 'floating' | 'inline' | 'minimal';
}) {
  const { language, toggleLanguage, t } = useLanguage();

  if (variant === 'floating') {
    return (
      <motion.button
        onClick={toggleLanguage}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed top-4 right-4 z-50',
          'flex items-center space-x-2 px-3 py-2',
          'rounded-full glass-md border border-white/20',
          'hover:bg-white/10 transition-colors',
          'backdrop-blur-md',
          className
        )}
        aria-label={t('accessibility.language_toggle')}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={language}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="text-lg"
          >
            {language === 'en' ? '🇮🇳' : '🇬🇧'}
          </motion.span>
        </AnimatePresence>
        <span className="text-xs font-medium text-white/80">
          {language === 'en' ? 'हिंदी' : 'English'}
        </span>
      </motion.button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          'flex items-center space-x-1 px-2 py-1',
          'rounded-lg hover:bg-white/5 transition-colors',
          className
        )}
        aria-label={t('accessibility.language_toggle')}
      >
        <span className="text-sm">
          {language === 'en' ? '🇮🇳' : '🇬🇧'}
        </span>
      </button>
    );
  }

  // Inline variant
  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'flex items-center space-x-2 px-3 py-1.5',
        'rounded-xl glass-sm border border-white/10',
        'hover:bg-white/10 transition-colors',
        className
      )}
      aria-label={t('accessibility.language_toggle')}
    >
      <span className="text-base">
        {language === 'en' ? '🇮🇳' : '🇬🇧'}
      </span>
      <span className="text-sm text-white/80">
        {language === 'en' ? 'हिंदी' : 'English'}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Get current language direction
// ─────────────────────────────────────────────────────────────────────────────
export function getTextDirection(lang?: Language): 'ltr' | 'rtl' {
  // Currently both English and Hindi are LTR
  // Future: Add support for Arabic/Urdu (RTL)
  return 'ltr';
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Estimate text expansion for Hindi
// Hindi text is typically 20-30% longer than English
// ─────────────────────────────────────────────────────────────────────────────
export function getExpansionFactor(lang: Language): number {
  return lang === 'hi' ? 1.3 : 1.0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper for cn (classname utility)
// ─────────────────────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default LanguageProvider;
