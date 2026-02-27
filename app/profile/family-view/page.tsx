'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Share2,
  Edit2,
  Shield,
  ShieldCheck,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Heart,
  Users,
  Utensils,
  Cigarette,
  Wine,
  QrCode,
  Printer,
  WhatsApp,
  FileText,
  Calendar,
  Lock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Profile Data
// ─────────────────────────────────────────────────────────────────────────────
const profileData = {
  name: 'Rahul Sharma',
  age: 28,
  height: "5'10\"",
  city: 'Bangalore',
  state: 'Karnataka',
  education: 'B.Tech Computer Science, IIT Delhi',
  career: 'Senior Software Engineer, Google',
  family: 'Joint family, Middle-class values',
  fatherOccupation: 'Retired Government Officer',
  motherOccupation: 'Homemaker',
  siblings: '1 younger sister (married)',
  lookingFor: 'Marriage within 1-2 years',
  valuesAlignment: 'Family-oriented, Traditional yet progressive',
  lifestyle: 'Vegetarian, Non-smoker, Moderate social life',
  diet: 'Strict Vegetarian',
  smoking: 'Non-smoker',
  drinking: 'Occasionally',
  motherTongue: 'Hindi',
  religion: 'Hindu',
  gotra: 'Bharadwaj',
  manglik: 'No',
  location: 'Koramangala, Bangalore',
  contactEmail: 'rahul.sharma@email.com',
  contactPhone: '+91 98765 43210',
};

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
  wide,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={cn('flex items-start space-x-3 py-2', wide ? 'col-span-2' : '')}>
      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function SectionHeading({ children, icon: Icon }: { children: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center space-x-2 mb-3 pb-2 border-b-2 border-violet-200">
      <Icon className="w-5 h-5 text-violet-600" />
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{children}</h3>
    </div>
  );
}

export default function FamilyViewPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const generatedDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In production, use @react-pdf/renderer or html2pdf
    window.print();
    setIsGenerating(false);
  };

  const handleShareWhatsApp = () => {
    const message = `Hi! I've created my profile on Bandhan AI. Please check: bandhan.ai/profile/rahul-sharma-123`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEdit = () => {
    window.location.href = '/profile';
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 safe-top safe-bottom">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header Actions (Hide on Print) */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6 print:hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Family View</h1>
            <p className="text-sm text-gray-400">Shareable profile for parents</p>
          </div>
          <button className="p-2 rounded-xl glass-sm hover:bg-white/10 transition-colors">
            <Lock className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <motion.button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-rose-500 text-white font-semibold hover:shadow-saffron-glow transition-shadow flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <FileText className="w-5 h-5" />
                </motion.div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </>
            )}
          </motion.button>

          <motion.button
            onClick={handleShareWhatsApp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-shadow flex items-center space-x-2"
          >
            <WhatsApp className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={handleEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 rounded-xl glass-sm border border-white/10 text-gray-300 hover:bg-white/5 transition-colors flex items-center space-x-2"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* A4 Profile Card (Print Optimized) */}
      <motion.div
        ref={printRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 max-w-[210mm] mx-auto"
      >
        {/* A4 Ratio Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:rounded-none print:shadow-none print:w-full">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none print:fixed print:inset-0 z-0 opacity-5">
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-96 h-96 text-gray-400" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 print:p-6">
            {/* Header */}
            <div className="text-center mb-6 pb-6 border-b-2 border-violet-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="w-6 h-6 text-violet-600" />
                <h2 className="text-lg font-bold text-gray-800">Bandhan AI</h2>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Family Introduction Profile</h1>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Profile</span>
              </div>
            </div>

            {/* Profile Photo & Basic Info */}
            <div className="flex flex-col items-center mb-6">
              {/* Photo Placeholder */}
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-violet-100 to-saffron-100 border-4 border-violet-200 flex items-center justify-center mb-4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-violet-200 to-rose-200 flex items-center justify-center">
                  <Users className="w-16 h-16 text-violet-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profileData.name}</h2>
              <p className="text-gray-600">{profileData.age} years • {profileData.height}</p>
            </div>

            {/* Basic Details Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
              <DetailRow
                icon={MapPin}
                label="Location"
                value={`${profileData.city}, ${profileData.state}`}
              />
              <DetailRow
                icon={GraduationCap}
                label="Education"
                value={profileData.education}
              />
              <DetailRow
                icon={Briefcase}
                label="Career"
                value={profileData.career}
              />
              <DetailRow
                icon={Home}
                label="Family"
                value={profileData.family}
              />
              <DetailRow
                icon={Users}
                label="Father"
                value={profileData.fatherOccupation}
              />
              <DetailRow
                icon={Users}
                label="Mother"
                value={profileData.motherOccupation}
              />
              <DetailRow
                icon={Users}
                label="Siblings"
                value={profileData.siblings}
              />
              <DetailRow
                icon={Languages}
                label="Mother Tongue"
                value={profileData.motherTongue}
              />
              <DetailRow
                icon={Church}
                label="Religion"
                value={profileData.religion}
              />
              <DetailRow
                icon={Heart}
                label="Gotra"
                value={profileData.gotra}
              />
              <DetailRow
                icon={Heart}
                label="Manglik"
                value={profileData.manglik}
              />
              <DetailRow
                icon={MapPin}
                label="Current Location"
                value={profileData.location}
              />
            </div>

            {/* Compatibility Summary */}
            <div className="bg-violet-50 rounded-xl p-4 mb-6 border border-violet-100">
              <SectionHeading icon={Heart}>Compatibility Summary</SectionHeading>
              <div className="space-y-3">
                <DetailRow
                  icon={Heart}
                  label="Looking For"
                  value={profileData.lookingFor}
                  wide
                />
                <DetailRow
                  icon={Users}
                  label="Values Alignment"
                  value={profileData.valuesAlignment}
                  wide
                />
                <DetailRow
                  icon={Utensils}
                  label="Lifestyle"
                  value={profileData.lifestyle}
                  wide
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Utensils className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-gray-600">{profileData.diet}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Cigarette className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-gray-600">{profileData.smoking}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <Wine className="w-3 h-3 text-amber-600" />
                    </div>
                    <span className="text-gray-600">{profileData.drinking}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Message */}
            <div className="bg-saffron-50 rounded-xl p-4 mb-6 border border-saffron-100">
              <SectionHeading icon={FileText}>A Message from Rahul</SectionHeading>
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "Dear Parents, I've created this profile on Bandhan AI to find a compatible life partner.
                I value family traditions while embracing modern perspectives. I'm looking for someone who
                shares similar values and is ready to build a meaningful relationship together. Please feel
                free to share this profile with trusted family friends."
              </p>
            </div>

            {/* Contact & QR Code */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Information</p>
                <p className="text-sm text-gray-800 font-medium">{profileData.contactEmail}</p>
                <p className="text-sm text-gray-800 font-medium">{profileData.contactPhone}</p>
              </div>
              <div className="w-24 h-24 bg-white rounded-xl border-2 border-violet-200 p-2 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-violet-600" />
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t-2 border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-1">
                <Calendar className="w-3 h-3" />
                <span>Generated on {generatedDate}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                <span>Confidential – For family use only</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This profile is protected by Bandhan AI's privacy policy. Unauthorized distribution is prohibited.
              </p>
            </div>
          </div>

          {/* Bottom Watermark Bar */}
          <div className="bg-gradient-to-r from-violet-600 to-rose-600 py-3 text-center print:bg-gray-800">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Bandhan AI – Verified Profile</span>
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tips Card (Hide on Print) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 max-w-[210mm] mx-auto mt-6 print:hidden"
      >
        <div className="glass-md rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-violet-400" />
            <span>Sharing Tips</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start space-x-2">
              <span className="text-violet-400 mt-0.5">•</span>
              <span>Share only with trusted family and friends</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-violet-400 mt-0.5">•</span>
              <span>The QR code links to your full Bandhan AI profile</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-violet-400 mt-0.5">•</span>
              <span>Update your profile regularly for best matches</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:fixed {
            position: fixed !important;
          }
          .print\\:inset-0 {
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

// Icon components for detail rows
function Languages({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  );
}

function Church({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 0v4m0-4h4m-4 0H8m4 8v6m-3-3h6M5 21h14" />
    </svg>
  );
}
