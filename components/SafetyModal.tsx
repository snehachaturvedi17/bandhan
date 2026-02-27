/**
 * Bandhan AI - Safety Modal
 * Multi-step flow for sharing date location with trusted contacts
 *
 * Flow:
 * 1. Confirm sharing intent
 * 2. Select emergency contacts (max 3)
 * 3. Review and confirm with map preview
 *
 * Privacy:
 * - Explicit consent for contacts access
 * - Location auto-deleted after 2 hours
 * - DPDP Act 2023 compliant
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  MapPin,
  Users,
  Clock,
  MessageSquare,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Lock,
} from "lucide-react";
import { ContactSelector } from "./ContactSelector";
import {
  startLocationSharing,
  type EmergencyContact,
} from "@/lib/location-tracking";
import { sendSafetySMS } from "@/lib/sms-service";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchDetails?: {
    name: string;
    photoUrl?: string;
    phone?: string;
  };
  language?: "en" | "hi";
}

type ModalStep = "confirm" | "contacts" | "review";

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    title: "Share My Date Location",
    subtitle: "Share your live location with trusted contacts for 2 hours",
    step1: "Confirm",
    step2: "Contacts",
    step3: "Review",
    includeMatchDetails: "Include match details",
    matchDetailsDesc: "Name, photo, and chat history",
    locationDuration: "Sharing for 2 hours",
    autoStop: "Auto-stops at",
    privacyNotice: "For safety only – not for surveillance",
    privacyNoticeHi: "केवल सुरक्षा के लिए – निगरानी के लिए नहीं",
    locationDataDeleted: "Location data auto-deleted after sharing ends",
    cancel: "Cancel",
    cancelHi: "रद्द करें",
    continue: "Continue",
    continueHi: "जारी रखें",
    shareLocation: "Share Location",
    shareLocationHi: "स्थान साझा करें",
    back: "Back",
    backHi: "वापस",
    smsPreview: "SMS Preview",
    smsPreviewHi: "SMS पूर्वावलोकन",
    contactsSelected: "contacts selected",
    contactsSelectedHi: "संपर्क चुने गए",
    maxContacts: "Max 3 contacts",
    maxContactsHi: "अधिकतम 3 संपर्क",
    currentLocation: "Your current location",
    currentLocationHi: "आपका वर्तमान स्थान",
    dpdpCompliant: "DPDP Act 2023 compliant",
    encrypted: "End-to-end encrypted",
  },
  hi: {
    title: "अपनी डेट का स्थान साझा करें",
    subtitle:
      "2 घंटे के लिए अपने विश्वसनीय संपर्कों के साथ अपना लाइव स्थान साझा करें",
    step1: "पुष्टि",
    step2: "संपर्क",
    step3: "समीक्षा",
    includeMatchDetails: "मैच विवरण शामिल करें",
    matchDetailsDesc: "नाम, फ़ोटो, और चैट इतिहास",
    locationDuration: "2 घंटे के लिए साझाकरण",
    autoStop: "पर स्वतः रुक जाएगा",
    privacyNotice: "केवल सुरक्षा के लिए – निगरानी के लिए नहीं",
    privacyNoticeHi: "केवल सुरक्षा के लिए – निगरानी के लिए नहीं",
    locationDataDeleted:
      "साझाकरण समाप्त होने के बाद स्थान डेटा स्वतः हटा दिया जाता है",
    cancel: "रद्द करें",
    cancelHi: "रद्द करें",
    continue: "जारी रखें",
    continueHi: "जारी रखें",
    shareLocation: "स्थान साझा करें",
    shareLocationHi: "स्थान साझा करें",
    back: "वापस",
    backHi: "वापस",
    smsPreview: "SMS पूर्वावलोकन",
    smsPreviewHi: "SMS पूर्वावलोकन",
    contactsSelected: "संपर्क चुने गए",
    contactsSelectedHi: "संपर्क चुने गए",
    maxContacts: "अधिकतम 3 संपर्क",
    maxContactsHi: "अधिकतम 3 संपर्क",
    currentLocation: "आपका वर्तमान स्थान",
    currentLocationHi: "आपका वर्तमान स्थान",
    dpdpCompliant: "DPDP अधिनियम 2023 अनुपालित",
    encrypted: "एंड-टू-एंड एन्क्रिप्टेड",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Confirm Intent
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmStep({
  matchDetails,
  includeMatchDetails,
  setIncludeMatchDetails,
  language,
  onContinue,
}: {
  matchDetails?: { name: string; photoUrl?: string };
  includeMatchDetails: boolean;
  setIncludeMatchDetails: (value: boolean) => void;
  language: "en" | "hi";
  onContinue: () => void;
}) {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 mb-4">
          <Shield className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{t.title}</h2>
        <p className="text-sm text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      {/* Match Details Toggle */}
      {matchDetails && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            {matchDetails.photoUrl ? (
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                <img
                  src={matchDetails.photoUrl}
                  alt={matchDetails.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-rose-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-violet-400">
                  {matchDetails.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {matchDetails.name}
              </p>
              <p className="text-xs text-gray-400">Your match</p>
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-gray-200">{t.includeMatchDetails}</p>
                <p className="text-xs text-gray-400">{t.matchDetailsDesc}</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={includeMatchDetails}
                onChange={(e) => setIncludeMatchDetails(e.target.checked)}
                className="sr-only"
              />
              <div
                className={cn(
                  "w-12 h-6 rounded-full transition-colors",
                  includeMatchDetails ? "bg-violet-500" : "bg-gray-600",
                )}
              >
                <motion.div
                  animate={{ x: includeMatchDetails ? 24 : 0 }}
                  className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
                />
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Duration Info */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-sm text-amber-200">{t.locationDuration}</p>
            <p className="text-xs text-amber-300/70">
              {t.autoStop}{" "}
              {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-start space-x-2">
          <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-emerald-200">{t.privacyNotice}</p>
            <p className="text-xs text-emerald-300/70 mt-0.5">
              {t.locationDataDeleted}
            </p>
            <p className="text-xs text-emerald-300/50 mt-1">
              {t.dpdpCompliant} • {t.encrypted}
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition-shadow"
      >
        {language === "en" ? t.continue : t.continueHi}
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Contact Selection
// ─────────────────────────────────────────────────────────────────────────────
function ContactsStep({
  selectedContacts,
  setSelectedContacts,
  language,
  onContinue,
  onBack,
}: {
  selectedContacts: EmergencyContact[];
  setSelectedContacts: (contacts: EmergencyContact[]) => void;
  language: "en" | "hi";
  onContinue: () => void;
  onBack: () => void;
}) {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 mb-4">
          <Users className="w-8 h-8 text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-white">
          {language === "en"
            ? "Select Emergency Contacts"
            : "आपातकालीन संपर्क चुनें"}
        </h2>
        <p className="text-sm text-gray-400 mt-1">{t.maxContacts}</p>
      </div>

      {/* Contact Selector */}
      <ContactSelector
        selectedContacts={selectedContacts}
        onChange={setSelectedContacts}
        maxContacts={3}
        language={language}
      />

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl glass-sm border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors"
        >
          {language === "en" ? t.back : t.backHi}
        </button>
        <motion.button
          whileHover={{ scale: selectedContacts.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selectedContacts.length > 0 ? 0.98 : 1 }}
          onClick={onContinue}
          disabled={selectedContacts.length === 0}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/30 transition-shadow"
        >
          {language === "en" ? t.continue : t.continueHi}
        </motion.button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Review & Confirm
// ─────────────────────────────────────────────────────────────────────────────
function ReviewStep({
  contacts,
  includeMatchDetails,
  matchDetails,
  language,
  onConfirm,
  onBack,
}: {
  contacts: EmergencyContact[];
  includeMatchDetails: boolean;
  matchDetails?: { name: string };
  language: "en" | "hi";
  onConfirm: () => void;
  onBack: () => void;
}) {
  const t = TRANSLATIONS[language];
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

  // Generate SMS preview
  const smsPreview =
    language === "hi"
      ? `नमस्ते, मैं बंधन एआई का उपयोग करके डेट पर हूं। मेरा लाइव स्थान: bandhan.ai/track/abc123। यह केवल सुरक्षा उद्देश्यों के लिए है।`
      : `Hi, I'm on a date using Bandhan AI. My live location: bandhan.ai/track/abc123. This is for safety purposes only.`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-4">
          <MapPin className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">
          {language === "en" ? "Review & Confirm" : "समीक्षा और पुष्टि"}
        </h2>
      </div>

      {/* Map Preview Placeholder */}
      <div className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <Navigation className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
        <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <p className="text-xs text-white flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>
              {language === "en" ? t.currentLocation : t.currentLocationHi}
            </span>
          </p>
        </div>
      </div>

      {/* Selected Contacts */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {language === "en" ? "Sharing with:" : "के साथ साझा:"}
        </p>
        <div className="flex flex-wrap gap-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="px-3 py-2 rounded-full bg-violet-500/20 border border-violet-500/30"
            >
              <p className="text-sm text-violet-200">{contact.name}</p>
              <p className="text-xs text-violet-400">{contact.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Match Details (if included) */}
      {includeMatchDetails && matchDetails && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            {language === "en" ? "Match Details Included" : "मैच विवरण शामिल"}
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-rose-500/20 flex items-center justify-center">
              <span className="text-xs font-bold text-violet-400">
                {matchDetails.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-gray-300">{matchDetails.name}</span>
          </div>
        </div>
      )}

      {/* SMS Preview */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {language === "en" ? t.smsPreview : t.smsPreviewHi}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-gray-300 font-mono leading-relaxed">
            {smsPreview}
          </p>
        </div>
      </div>

      {/* Duration */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-200">{t.locationDuration}</span>
          </div>
          <span className="text-sm text-amber-300">
            {endTime.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl glass-sm border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors"
        >
          {language === "en" ? t.back : t.backHi}
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition-shadow flex items-center justify-center space-x-2"
        >
          <Shield className="w-5 h-5" />
          <span>{language === "en" ? t.shareLocation : t.shareLocationHi}</span>
        </motion.button>
      </div>

      {/* Privacy Disclaimer */}
      <p className="text-xs text-center text-gray-500">
        {language === "en" ? t.privacyNotice : t.privacyNoticeHi}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────
export function SafetyModal({
  isOpen,
  onClose,
  matchDetails,
  language = "en",
}: SafetyModalProps) {
  const [step, setStep] = useState<ModalStep>("confirm");
  const [includeMatchDetails, setIncludeMatchDetails] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<EmergencyContact[]>(
    [],
  );
  const [isSharing, setIsSharing] = useState(false);

  const t = TRANSLATIONS[language];

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("confirm");
      setIncludeMatchDetails(false);
      setSelectedContacts([]);
      setIsSharing(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsSharing(true);

    try {
      // Start location sharing
      await startLocationSharing({
        contacts: selectedContacts,
        duration: 2 * 60 * 60 * 1000, // 2 hours
        includeMatchDetails,
        matchDetails: includeMatchDetails ? matchDetails : undefined,
      });

      // Send SMS to all selected contacts
      for (const contact of selectedContacts) {
        await sendSafetySMS({
          phoneNumber: contact.phone,
          language,
          includeMatchDetails,
          matchDetails: includeMatchDetails ? matchDetails : undefined,
        });
      }

      // Close modal and notify
      onClose();
    } catch (error) {
      console.error("Error starting location sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const nextStep = () => {
    if (step === "confirm") setStep("contacts");
    else if (step === "contacts") setStep("review");
  };

  const prevStep = () => {
    if (step === "contacts") setStep("confirm");
    else if (step === "review") setStep("contacts");
  };

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
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-md my-8">
              {/* Card */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-midnight-900 via-midnight-900 to-midnight-950 border border-white/10 shadow-2xl">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full glass-sm hover:bg-white/10 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 pt-6 pb-2">
                  {(["confirm", "contacts", "review"] as ModalStep[]).map(
                    (s, index) => (
                      <div
                        key={s}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          step === s
                            ? "w-6 bg-gradient-to-r from-rose-500 to-red-500"
                            : index <
                                ["confirm", "contacts", "review"].indexOf(step)
                              ? "bg-emerald-500"
                              : "bg-gray-600",
                        )}
                      />
                    ),
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {step === "confirm" && (
                      <ConfirmStep
                        key="confirm"
                        matchDetails={matchDetails}
                        includeMatchDetails={includeMatchDetails}
                        setIncludeMatchDetails={setIncludeMatchDetails}
                        language={language}
                        onContinue={nextStep}
                      />
                    )}

                    {step === "contacts" && (
                      <ContactsStep
                        key="contacts"
                        selectedContacts={selectedContacts}
                        setSelectedContacts={setSelectedContacts}
                        language={language}
                        onContinue={nextStep}
                        onBack={prevStep}
                      />
                    )}

                    {step === "review" && (
                      <ReviewStep
                        key="review"
                        contacts={selectedContacts}
                        includeMatchDetails={includeMatchDetails}
                        matchDetails={matchDetails}
                        language={language}
                        onConfirm={handleConfirm}
                        onBack={prevStep}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Loading Overlay */}
                {isSharing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Navigation className="w-10 h-10 text-rose-400 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-white font-medium">
                        {language === "en"
                          ? "Starting location sharing..."
                          : "स्थान साझाकरण शुरू हो रहा है..."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SafetyModal;
