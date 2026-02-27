'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  User,
  Shield,
  ShieldCheck,
  Heart,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Utensils,
  ChevronDown,
  ChevronUp,
  Save,
  LogOut,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Users,
  X,
  Plus,
  Phone,
  Crown,
  Settings,
  Bell,
  Globe,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ProfileData {
  name: string;
  age: number;
  avatarUrl: string;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  intent: string;
  city: string;
  education: string;
  career: string;
  family: string;
  diet: string;
}

interface PrivacySettings {
  profileVisibility: 'everyone' | 'verified' | 'premium';
  photoPrivacy: 'blur' | 'visible';
  locationSharing: 'city' | 'pincode';
  screenshotAlerts: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const initialProfile: ProfileData = {
  name: 'Rahul Sharma',
  age: 28,
  avatarUrl: '',
  verificationLevel: 'gold',
  intent: 'Marriage within 1-2 years',
  city: 'Bangalore',
  education: 'IIT Delhi',
  career: 'Software Engineer',
  family: 'Living with parents',
  diet: 'Vegetarian',
};

const initialPrivacy: PrivacySettings = {
  profileVisibility: 'verified',
  photoPrivacy: 'blur',
  locationSharing: 'city',
  screenshotAlerts: true,
};

const mockContacts: EmergencyContact[] = [
  { id: '1', name: 'Mom', phone: '+91 98765 43210', relationship: 'Mother' },
  { id: '2', name: 'Riya Sharma', phone: '+91 98765 43211', relationship: 'Sister' },
];

const blockedUsers = [
  { id: '1', name: 'Blocked User 1', blockedDate: '2 days ago' },
  { id: '2', name: 'Blocked User 2', blockedDate: '1 week ago' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
function VerificationBadge({ level }: { level: 'bronze' | 'silver' | 'gold' }) {
  const config = {
    bronze: {
      color: 'text-amber-700 bg-amber-500/20 border-amber-500/30',
      icon: Shield,
      label: 'Phone Verified',
    },
    silver: {
      color: 'text-midnight-200 bg-white/20 border-white/30',
      icon: Shield,
      label: 'Email Verified',
    },
    gold: {
      color: 'text-gold-500 bg-gold-500/20 border-gold-500/30',
      icon: ShieldCheck,
      label: 'ID Verified',
    },
  };

  const Icon = config[level].icon;

  return (
    <div className={cn('px-3 py-1.5 rounded-full border flex items-center space-x-1.5', config[level].color)}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold">{config[level].label}</span>
    </div>
  );
}

function AccordionSection({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-md rounded-2xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-violet-400" />
          </div>
          <span className="font-semibold text-midnight-100">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-midnight-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-midnight-400" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
  label,
  labelHi,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  labelHi?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-midnight-200">{label}</p>
        {labelHi && <p className="text-xs text-midnight-500 hindi-text">{labelHi}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors',
          enabled ? 'bg-violet-500' : 'bg-midnight-600'
        )}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 0 }}
          className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"
        />
      </button>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-midnight-200 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-midnight-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [privacy, setPrivacy] = useState<PrivacySettings>(initialPrivacy);
  const [contacts, setContacts] = useState<EmergencyContact[]>(mockContacts);
  const [openSection, setOpenSection] = useState<string | null>('details');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePrivacyChange = (field: keyof PrivacySettings, value: string | boolean) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Save to backend
    console.log('Saving:', { profile, privacy });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setHasChanges(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    // Delete account logic
    console.log('Deleting account...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    handleLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 safe-top safe-bottom pb-24">
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
        <h1 className="text-2xl font-bold text-gradient-brand mb-1">Settings</h1>
        <p className="text-sm text-midnight-300">Manage your profile and privacy</p>
      </motion.header>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 glass-md rounded-3xl p-6 border border-white/10 mb-4"
      >
        <div className="flex items-start justify-between mb-4">
          {/* Avatar */}
          <div className="relative">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              {profile.avatarUrl ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-violet-500/50">
                  <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-saffron-500/20 to-violet-500/20 border-2 border-violet-500/50 flex items-center justify-center">
                  <User className="w-8 h-8 text-violet-400" />
                </div>
              )}
            </motion.div>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-r from-saffron-500 to-violet-500 border-2 border-midnight-900"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Verification */}
          <VerificationBadge level={profile.verificationLevel} />
        </div>

        {/* Name & Intent */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-midnight-400 mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-midnight-400 mb-1">Looking for</label>
            <select
              value={profile.intent}
              onChange={(e) => handleProfileChange('intent', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
            >
              <option>Marriage within 1-2 years</option>
              <option>Serious relationship with marriage potential</option>
              <option>Friendship / Networking</option>
              <option>Healing space</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Accordion Sections */}
      <div className="relative z-10 space-y-3">
        {/* My Details */}
        <AccordionSection
          title="My Details"
          icon={User}
          isOpen={openSection === 'details'}
          onToggle={() => setOpenSection(openSection === 'details' ? null : 'details')}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-midnight-400 mb-1">City</label>
              <div className="flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <MapPin className="w-4 h-4 text-violet-400" />
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleProfileChange('city', e.target.value)}
                  className="flex-1 bg-transparent text-sm text-midnight-100 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-midnight-400 mb-1">Education</label>
              <div className="flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <GraduationCap className="w-4 h-4 text-violet-400" />
                <input
                  type="text"
                  value={profile.education}
                  onChange={(e) => handleProfileChange('education', e.target.value)}
                  className="flex-1 bg-transparent text-sm text-midnight-100 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-midnight-400 mb-1">Career</label>
              <div className="flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <Briefcase className="w-4 h-4 text-violet-400" />
                <input
                  type="text"
                  value={profile.career}
                  onChange={(e) => handleProfileChange('career', e.target.value)}
                  className="flex-1 bg-transparent text-sm text-midnight-100 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-midnight-400 mb-1">Family</label>
              <div className="flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <Home className="w-4 h-4 text-violet-400" />
                <input
                  type="text"
                  value={profile.family}
                  onChange={(e) => handleProfileChange('family', e.target.value)}
                  className="flex-1 bg-transparent text-sm text-midnight-100 focus:outline-none"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-midnight-400 mb-1">Diet</label>
              <select
                value={profile.diet}
                onChange={(e) => handleProfileChange('diet', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
              >
                <option>Vegetarian</option>
                <option>Eggetarian</option>
                <option>Non-vegetarian</option>
                <option>Jain</option>
                <option>Halal</option>
              </select>
            </div>
          </div>
        </AccordionSection>

        {/* Privacy Settings */}
        <AccordionSection
          title="Privacy Settings"
          icon={Lock}
          isOpen={openSection === 'privacy'}
          onToggle={() => setOpenSection(openSection === 'privacy' ? null : 'privacy')}
        >
          <SelectField
            label="Who can see my profile"
            value={privacy.profileVisibility}
            options={[
              { value: 'everyone', label: 'Everyone' },
              { value: 'verified', label: 'Verified users only' },
              { value: 'premium', label: 'Premium members only' },
            ]}
            onChange={(v) => handlePrivacyChange('profileVisibility', v)}
          />
          <SelectField
            label="Photo privacy"
            value={privacy.photoPrivacy}
            options={[
              { value: 'blur', label: 'Blur until match' },
              { value: 'visible', label: 'Always visible' },
            ]}
            onChange={(v) => handlePrivacyChange('photoPrivacy', v)}
          />
          <SelectField
            label="Location sharing"
            value={privacy.locationSharing}
            options={[
              { value: 'city', label: 'Share city only' },
              { value: 'pincode', label: 'Share pincode area' },
            ]}
            onChange={(v) => handlePrivacyChange('locationSharing', v)}
          />
          <Toggle
            enabled={privacy.screenshotAlerts}
            onChange={(v) => handlePrivacyChange('screenshotAlerts', v)}
            label="Screenshot alerts"
            labelHi="स्क्रीनशॉट सतर्कता"
          />
        </AccordionSection>

        {/* Safety */}
        <AccordionSection
          title="Safety"
          icon={Shield}
          isOpen={openSection === 'safety'}
          onToggle={() => setOpenSection(openSection === 'safety' ? null : 'safety')}
        >
          {/* Emergency Contacts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-midnight-200">Emergency Contacts</label>
              <button className="text-xs text-violet-400 flex items-center space-x-1 hover:text-violet-300">
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-midnight-100">{contact.name}</p>
                      <p className="text-xs text-midnight-500">{contact.relationship}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg">
                    <X className="w-4 h-4 text-midnight-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Block List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-midnight-200">Blocked Users</label>
              <span className="text-xs text-midnight-500">{blockedUsers.length} blocked</span>
            </div>
            {blockedUsers.length === 0 ? (
              <p className="text-sm text-midnight-500 text-center py-4">No blocked users</p>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-sm text-midnight-100">{user.name}</p>
                      <p className="text-xs text-midnight-500">Blocked {user.blockedDate}</p>
                    </div>
                    <button className="text-xs text-violet-400 hover:text-violet-300">
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Issue */}
          <button className="w-full py-3 rounded-xl glass-sm border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Report an Issue</span>
          </button>
        </AccordionSection>

        {/* Account */}
        <AccordionSection
          title="Account"
          icon={Settings}
          isOpen={openSection === 'account'}
          onToggle={() => setOpenSection(openSection === 'account' ? null : 'account')}
        >
          {/* Subscription */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-gold-500/10 to-saffron-500/10 border border-gold-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-gold-500" />
                <span className="font-semibold text-midnight-100">Premium Plan</span>
              </div>
              <span className="px-2 py-1 rounded-full bg-gold-500/20 border border-gold-500/30 text-xs text-gold-400">
                Active
              </span>
            </div>
            <p className="text-xs text-midnight-400">Renews on March 15, 2026</p>
            <button className="mt-3 text-xs text-violet-400 hover:text-violet-300">
              Manage Subscription →
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl glass-sm border border-white/10 text-midnight-200 hover:bg-white/5 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 rounded-xl glass-sm border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </AccordionSection>
      </div>

      {/* Save Button (Sticky Bottom) */}
      <AnimatePresence>
        {hasChanges && (
          <motion.footer
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 safe-bottom bg-gradient-to-t from-midnight-900 via-midnight-900/95 to-transparent"
          >
            <div className="max-w-md mx-auto">
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-saffron-500 to-violet-500 text-white font-semibold hover:shadow-saffron-glow transition-shadow flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </motion.button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="glass-md rounded-2xl p-6 max-w-sm w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload Photo</h3>
              <button onClick={() => setShowAvatarModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5 text-midnight-300" />
              </button>
            </div>
            <label className="block">
              <input type="file" accept="image/*" className="hidden" />
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-violet-500/50 transition-colors cursor-pointer">
                <Camera className="w-10 h-10 text-midnight-400 mx-auto mb-3" />
                <p className="text-sm text-midnight-300">Click to upload or drag and drop</p>
                <p className="text-xs text-midnight-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </label>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="glass-md rounded-2xl p-6 max-w-sm w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Account?</h3>
            </div>
            <p className="text-sm text-midnight-300 mb-6">
              This action cannot be undone. All your data, matches, and conversations will be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl glass-sm border border-white/10 text-midnight-200 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold hover:shadow-lg transition-shadow"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
