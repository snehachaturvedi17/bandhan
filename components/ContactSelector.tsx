/**
 * Bandhan AI - Contact Selector
 * Select emergency contacts for location sharing
 *
 * Features:
 * - Pre-filled from device contacts (with permission)
 * - Add custom contact button
 * - Max 3 contacts selectable
 * - Contact chips with names + phone numbers
 * - Explicit consent for contact access
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  User,
  Phone,
  X,
  Check,
  Smartphone,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
}

interface ContactSelectorProps {
  selectedContacts: EmergencyContact[];
  onChange: (contacts: EmergencyContact[]) => void;
  maxContacts?: number;
  language?: 'en' | 'hi';
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Contacts (in production, fetch from device)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_CONTACTS: EmergencyContact[] = [
  { id: '1', name: 'Mom', phone: '+91 98765 43210', relationship: 'Mother' },
  { id: '2', name: 'Dad', phone: '+91 98765 43211', relationship: 'Father' },
  { id: '3', name: 'Best Friend - Riya', phone: '+91 98765 43212', relationship: 'Friend' },
  { id: '4', name: 'Sister - Anjali', phone: '+91 98765 43213', relationship: 'Sister' },
  { id: '5', name: 'Brother - Rahul', phone: '+91 98765 43214', relationship: 'Brother' },
  { id: '6', name: 'Colleague - Priya', phone: '+91 98765 43215', relationship: 'Colleague' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    selectContacts: 'Select Emergency Contacts',
    selectContactsHi: 'आपातकालीन संपर्क चुनें',
    addContact: 'Add Contact',
    addContactHi: 'संपर्क जोड़ें',
    contactsSelected: 'contacts selected',
    contactsSelectedHi: 'संपर्क चुने गए',
    maxReached: 'Maximum 3 contacts reached',
    maxReachedHi: 'अधिकतम 3 संपर्क पहुंच गए',
    permissionRequired: 'Contact access required',
    permissionRequiredHi: 'संपर्क पहुंच आवश्यक',
    grantPermission: 'Grant Permission',
    grantPermissionHi: 'अनुमति दें',
    permissionDesc: 'We need access to your contacts to select emergency contacts. Contacts are not stored permanently.',
    permissionDescHi: 'आपातकालीन संपर्क चुनने के लिए हमें आपके संपर्कों की पहुंच चाहिए। संपर्क स्थायी रूप से संग्रहीत नहीं हैं।',
    customContact: 'Custom Contact',
    customContactHi: 'कस्टम संपर्क',
    enterName: 'Enter name',
    enterNameHi: 'नाम दर्ज करें',
    enterPhone: 'Enter phone number',
    enterPhoneHi: 'फ़ोन नंबर दर्ज करें',
    enterRelationship: 'Relationship (optional)',
    enterRelationshipHi: 'रिश्ता (वैकल्पिक)',
    save: 'Save',
    saveHi: 'सहेजें',
    cancel: 'Cancel',
    cancelHi: 'रद्द करें',
    remove: 'Remove',
    removeHi: 'हटाएं',
  },
  hi: {
    selectContacts: 'आपातकालीन संपर्क चुनें',
    selectContactsHi: 'आपातकालीन संपर्क चुनें',
    addContact: 'संपर्क जोड़ें',
    addContactHi: 'संपर्क जोड़ें',
    contactsSelected: 'संपर्क चुने गए',
    contactsSelectedHi: 'संपर्क चुने गए',
    maxReached: 'अधिकतम 3 संपर्क पहुंच गए',
    maxReachedHi: 'अधिकतम 3 संपर्क पहुंच गए',
    permissionRequired: 'संपर्क पहुंच आवश्यक',
    permissionRequiredHi: 'संपर्क पहुंच आवश्यक',
    grantPermission: 'अनुमति दें',
    grantPermissionHi: 'अनुमति दें',
    permissionDesc: 'आपातकालीन संपर्क चुनने के लिए हमें आपके संपर्कों की पहुंच चाहिए। संपर्क स्थायी रूप से संग्रहीत नहीं हैं।',
    permissionDescHi: 'आपातकालीन संपर्क चुनने के लिए हमें आपके संपर्कों की पहुंच चाहिए। संपर्क स्थायी रूप से संग्रहीत नहीं हैं।',
    customContact: 'कस्टम संपर्क',
    customContactHi: 'कस्टम संपर्क',
    enterName: 'नाम दर्ज करें',
    enterNameHi: 'नाम दर्ज करें',
    enterPhone: 'फ़ोन नंबर दर्ज करें',
    enterPhoneHi: 'फ़ोन नंबर दर्ज करें',
    enterRelationship: 'रिश्ता (वैकल्पिक)',
    enterRelationshipHi: 'रिश्ता (वैकल्पिक)',
    save: 'सहेजें',
    saveHi: 'सहेजें',
    cancel: 'रद्द करें',
    cancelHi: 'रद्द करें',
    remove: 'हटाएं',
    removeHi: 'हटाएं',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Contact Item Component
// ─────────────────────────────────────────────────────────────────────────────
function ContactItem({
  contact,
  isSelected,
  isDisabled,
  onSelect,
  onRemove,
  language,
}: {
  contact: EmergencyContact;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  onRemove: () => void;
  language: 'en' | 'hi';
}) {
  const t = TRANSLATIONS[language];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center justify-between p-3 rounded-xl border transition-all',
        isSelected
          ? 'bg-violet-500/20 border-violet-500/50'
          : isDisabled
          ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
          : 'bg-white/5 border-white/10 hover:border-white/20 cursor-pointer'
      )}
      onClick={!isDisabled ? onSelect : undefined}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isSelected
              ? 'bg-violet-500/30'
              : 'bg-white/10'
          )}
        >
          {isSelected ? (
            <Check className="w-5 h-5 text-violet-300" />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Info */}
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              isSelected ? 'text-violet-200' : 'text-gray-300'
            )}
          >
            {contact.name}
          </p>
          <p className="text-xs text-gray-400">{contact.phone}</p>
          {contact.relationship && (
            <p className="text-xs text-gray-500">{contact.relationship}</p>
          )}
        </div>
      </div>

      {/* Remove Button (for selected contacts) */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Custom Contact Modal
// ─────────────────────────────────────────────────────────────────────────────
function AddContactModal({
  isOpen,
  onClose,
  onAdd,
  language,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: EmergencyContact) => void;
  language: 'en' | 'hi';
}) {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSave = () => {
    if (!name || !phone) return;

    onAdd({
      id: `custom-${Date.now()}`,
      name,
      phone,
      relationship: relationship || undefined,
    });

    // Reset form
    setName('');
    setPhone('');
    setRelationship('');
    onClose();
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
              <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-midnight-900 to-midnight-950 border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">
                    {language === 'en' ? t.customContact : t.customContactHi}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full glass-sm hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      {language === 'en' ? t.enterName : t.enterNameHi}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder={language === 'en' ? 'John Doe' : 'जॉन डो'}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      {language === 'en' ? t.enterPhone : t.enterPhoneHi}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      {language === 'en' ? t.enterRelationship : t.enterRelationshipHi}
                    </label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder={language === 'en' ? 'Friend, Family, etc.' : 'दोस्त, परिवार, आदि'}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex p-4 pt-0 space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl glass-sm border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors"
                  >
                    {language === 'en' ? t.cancel : t.cancelHi}
                  </button>
                  <motion.button
                    whileHover={{ scale: name && phone ? 1.02 : 1 }}
                    whileTap={{ scale: name && phone ? 0.98 : 1 }}
                    onClick={handleSave}
                    disabled={!name || !phone}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === 'en' ? t.save : t.saveHi}
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
// Permission Request Component
// ─────────────────────────────────────────────────────────────────────────────
function PermissionRequest({
  onGrant,
  language,
}: {
  onGrant: () => void;
  language: 'en' | 'hi';
}) {
  const t = TRANSLATIONS[language];

  return (
    <div className="text-center p-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4">
        <Shield className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">
        {language === 'en' ? t.permissionRequired : t.permissionRequiredHi}
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        {language === 'en' ? t.permissionDesc : t.permissionDescHi}
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGrant}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold"
      >
        {language === 'en' ? t.grantPermission : t.grantPermissionHi}
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function ContactSelector({
  selectedContacts,
  onChange,
  maxContacts = 3,
  language = 'en',
}: ContactSelectorProps) {
  const t = TRANSLATIONS[language];
  const [hasPermission, setHasPermission] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customContacts, setCustomContacts] = useState<EmergencyContact[]>([]);

  // Combine mock contacts with custom contacts
  const allContacts = [...MOCK_CONTACTS, ...customContacts];

  const handleGrantPermission = async () => {
    // In production, request actual contact permission
    // const result = await Contacts.requestPermissions();
    // if (result.granted) { ... }

    // Simulate permission grant
    setHasPermission(true);
  };

  const handleSelectContact = (contact: EmergencyContact) => {
    if (selectedContacts.length >= maxContacts) return;

    onChange([...selectedContacts, contact]);
  };

  const handleRemoveContact = (contactId: string) => {
    onChange(selectedContacts.filter((c) => c.id !== contactId));
  };

  const handleAddCustomContact = (contact: EmergencyContact) => {
    setCustomContacts([...customContacts, contact]);
    onChange([...selectedContacts, contact]);
  };

  const isMaxReached = selectedContacts.length >= maxContacts;

  return (
    <div className="space-y-4">
      {!hasPermission ? (
        <PermissionRequest onGrant={handleGrantPermission} language={language} />
      ) : (
        <>
          {/* Selected Contacts Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              <span className="text-violet-400 font-semibold">{selectedContacts.length}</span>
              {' / '}{maxContacts} {language === 'en' ? t.contactsSelected : t.contactsSelectedHi}
            </p>
            {!isMaxReached && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'en' ? t.addContact : t.addContactHi}</span>
              </motion.button>
            )}
          </div>

          {/* Contact List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {allContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedContacts.some((c) => c.id === contact.id)}
                  isDisabled={isMaxReached && !selectedContacts.some((c) => c.id === contact.id)}
                  onSelect={() => handleSelectContact(contact)}
                  onRemove={() => handleRemoveContact(contact.id)}
                  language={language}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Max Reached Warning */}
          {isMaxReached && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-200">
                {language === 'en' ? t.maxReached : t.maxReachedHi}
              </p>
            </motion.div>
          )}
        </>
      )}

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCustomContact}
        language={language}
      />
    </div>
  );
}

export default ContactSelector;
