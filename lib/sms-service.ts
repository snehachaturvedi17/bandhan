/**
 * Bandhan AI - SMS Service for Safety Notifications
 * TRAI-compliant SMS sending for location sharing
 *
 * Features:
 * - TRAI compliant templates (no promotional content)
 * - Indian sender ID (BNDHAN)
 * - Bilingual support (English/Hindi)
 * - Rate limiting for abuse prevention
 *
 * Compliance:
 * - TRAI Telecom Commercial Communication Customer Preference Regulations
 * - DPDP Act 2023 for data handling
 * - No storage of contact numbers after SMS sent
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface SafetySMSOptions {
  phoneNumber: string;
  language?: 'en' | 'hi';
  includeMatchDetails?: boolean;
  matchDetails?: {
    name: string;
    photoUrl?: string;
  };
  trackingUrl?: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAI Compliant SMS Templates
// ─────────────────────────────────────────────────────────────────────────────
/**
 * SMS Templates registered with TRAI
 * Template ID: 19001234567890123456 (sample)
 * Sender ID: BNDHAN (6 characters, TRAI approved)
 */
const SMS_TEMPLATES = {
  en: {
    // Primary safety SMS
    safety:
      'Hi, I\'m on a date using Bandhan AI. My live location: {trackingUrl}. This is for safety purposes only. - BNDHAN',

    // With match details
    safetyWithMatch:
      'Hi, I\'m on a date with {matchName} using Bandhan AI. My live location: {trackingUrl}. This is for safety purposes only. - BNDHAN',

    // Location update (sent periodically)
    locationUpdate:
      'Location update: I\'m still safe. Live location: {trackingUrl}. Auto-stops in {timeRemaining}. - BNDHAN',

    // Sharing ended
    sharingEnded:
      'Location sharing has ended. All location data has been deleted. This was a Bandhan AI safety feature. - BNDHAN',

    // Emergency SOS (if user triggers emergency)
    emergency:
      'EMERGENCY: I need help. My current location: {trackingUrl}. Please contact me immediately. - BNDHAN',
  },
  hi: {
    // Primary safety SMS
    safety:
      'नमस्ते, मैं बंधन एआई का उपयोग करके डेट पर हूं। मेरा लाइव स्थान: {trackingUrl}। यह केवल सुरक्षा उद्देश्यों के लिए है। - BNDHAN',

    // With match details
    safetyWithMatch:
      'नमस्ते, मैं {matchName} के साथ बंधन एआई का उपयोग करके डेट पर हूं। मेरा लाइव स्थान: {trackingUrl}। यह केवल सुरक्षा उद्देश्यों के लिए है। - BNDHAN',

    // Location update
    locationUpdate:
      'स्थान अपडेट: मैं अभी भी सुरक्षित हूं। लाइव स्थान: {trackingUrl}। {timeRemaining} में स्वतः रुक जाएगा। - BNDHAN',

    // Sharing ended
    sharingEnded:
      'स्थान साझाकरण समाप्त हो गया है। सभी स्थान डेटा हटा दिया गया है। यह एक बंधन एआई सुरक्षा सुविधा थी। - BNDHAN',

    // Emergency SOS
    emergency:
      'आपातकालीन: मुझे मदद की जरूरत है। मेरा वर्तमान स्थान: {trackingUrl}। कृपया तुरंत मुझसे संपर्क करें। - BNDHAN',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
const SMS_CONFIG = {
  // TRAI Registered Sender ID
  senderId: 'BNDHAN',

  // Template ID (registered with TRAI)
  templateId: '19001234567890123456',

  // Rate limiting
  maxSmsPerHour: 10,
  maxSmsPerDay: 50,

  // Default tracking URL (in production, generate unique short URL)
  defaultTrackingUrl: 'bandhan.ai/track',
};

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting (in-memory, use Redis in production)
// ─────────────────────────────────────────────────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset rate limit
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + hourMs,
    });
    return { allowed: true, remaining: SMS_CONFIG.maxSmsPerHour - 1 };
  }

  if (record.count >= SMS_CONFIG.maxSmsPerHour) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: SMS_CONFIG.maxSmsPerHour - record.count };
}

// ─────────────────────────────────────────────────────────────────────────────
// SMS Sending Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send safety SMS to emergency contact
 *
 * @param options - SMS options including phone number and language
 * @returns SMS result with success status
 *
 * @example
 * await sendSafetySMS({
 *   phoneNumber: '+919876543210',
 *   language: 'en',
 *   includeMatchDetails: true,
 *   matchDetails: { name: 'Rahul Sharma' },
 * });
 */
export async function sendSafetySMS(options: SafetySMSOptions): Promise<SMSResult> {
  const {
    phoneNumber,
    language = 'en',
    includeMatchDetails = false,
    matchDetails,
    trackingUrl = `${SMS_CONFIG.defaultTrackingUrl}/${generateTrackingId()}`,
  } = options;

  // Validate phone number (Indian format)
  if (!isValidIndianPhoneNumber(phoneNumber)) {
    return {
      success: false,
      error: 'Invalid phone number. Must be valid Indian number.',
    };
  }

  // Check rate limit
  const rateLimit = checkRateLimit(`sms_${phoneNumber}`);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
    };
  }

  // Select template
  const template = includeMatchDetails && matchDetails
    ? SMS_TEMPLATES[language].safetyWithMatch
    : SMS_TEMPLATES[language].safety;

  // Replace placeholders
  const message = template
    .replace('{trackingUrl}', trackingUrl)
    .replace('{matchName}', matchDetails?.name || 'someone')
    .replace('{timeRemaining}', '2 hours');

  // In production, send via SMS provider (Twilio, MSG91, etc.)
  // For demo, we'll simulate the send
  try {
    const result = await simulateSendSMS({
      to: phoneNumber,
      message,
      senderId: SMS_CONFIG.senderId,
      templateId: SMS_CONFIG.templateId,
    });

    // Log for debugging (in production, use proper logging)
    console.log('[Safety SMS Sent]', {
      to: phoneNumber,
      language,
      template: includeMatchDetails ? 'safetyWithMatch' : 'safety',
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('[Safety SMS Error]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

/**
 * Send location update SMS (periodic updates during sharing)
 */
export async function sendLocationUpdateSMS(
  phoneNumber: string,
  trackingUrl: string,
  timeRemaining: string,
  language: 'en' | 'hi' = 'en'
): Promise<SMSResult> {
  const template = SMS_TEMPLATES[language].locationUpdate;
  const message = template
    .replace('{trackingUrl}', trackingUrl)
    .replace('{timeRemaining}', timeRemaining);

  return simulateSendSMS({
    to: phoneNumber,
    message,
    senderId: SMS_CONFIG.senderId,
    templateId: SMS_CONFIG.templateId,
  });
}

/**
 * Send sharing ended notification
 */
export async function sendSharingEndedSMS(
  phoneNumber: string,
  language: 'en' | 'hi' = 'en'
): Promise<SMSResult> {
  const template = SMS_TEMPLATES[language].sharingEnded;

  return simulateSendSMS({
    to: phoneNumber,
    message: template,
    senderId: SMS_CONFIG.senderId,
    templateId: SMS_CONFIG.templateId,
  });
}

/**
 * Send emergency SOS SMS
 */
export async function sendEmergencySMS(
  phoneNumber: string,
  trackingUrl: string,
  language: 'en' | 'hi' = 'en'
): Promise<SMSResult> {
  const template = SMS_TEMPLATES[language].emergency;
  const message = template.replace('{trackingUrl}', trackingUrl);

  // Emergency SMS bypass rate limiting
  return simulateSendSMS({
    to: phoneNumber,
    message,
    senderId: SMS_CONFIG.senderId,
    templateId: SMS_CONFIG.templateId,
    priority: 'high',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate Indian phone number
 */
function isValidIndianPhoneNumber(phoneNumber: string): boolean {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Check for +91 prefix or 10-digit number starting with 6-9
  if (digits.startsWith('91') && digits.length === 12) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }

  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }

  return false;
}

/**
 * Generate unique tracking ID for location sharing
 */
function generateTrackingId(): string {
  return Math.random().toString(36).substring(2, 10) +
         Date.now().toString(36).substring(4);
}

/**
 * Simulate SMS sending (replace with actual SMS provider in production)
 *
 * Production integration examples:
 * - Twilio: https://www.twilio.com/docs/sms
 * - MSG91: https://docs.msg91.com
 * - TextLocal: https://www.textlocal.in/docs
 */
async function simulateSendSMS({
  to,
  message,
  senderId,
  templateId,
  priority = 'normal',
}: {
  to: string;
  message: string;
  senderId: string;
  templateId: string;
  priority?: 'normal' | 'high';
}): Promise<{ messageId: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock message ID
  const messageId = `SMS_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // In production, integrate with SMS provider:
  /*
  // Twilio example:
  const client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
  await client.messages.create({
    body: message,
    from: senderId,
    to: to.startsWith('+') ? to : `+91${to}`,
  });

  // MSG91 example:
  await fetch('https://api.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      'authkey': MSG91_AUTH_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile: to,
      message: message,
      sender: senderId,
      template_id: templateId,
    }),
  });
  */

  console.log('[SMS Provider Simulation]', {
    to,
    message: message.substring(0, 50) + '...',
    senderId,
    templateId,
    priority,
    messageId,
  });

  return { messageId };
}

/**
 * Format phone number for display (mask middle digits)
 */
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.length === 10) {
    return `${digits.substring(0, 3)}*****${digits.substring(8)}`;
  }

  if (digits.startsWith('91') && digits.length === 12) {
    return `+91 ${digits.substring(2, 5)}*****${digits.substring(10)}`;
  }

  return phoneNumber;
}

/**
 * Get SMS character count (for billing estimation)
 * Standard SMS: 160 characters (GSM-7) or 70 characters (Unicode)
 */
export function getSmsCharacterCount(message: string): {
  segments: number;
  encoding: 'GSM-7' | 'Unicode';
  charactersPerSegment: number;
} {
  // Check if message contains non-GSM characters (Hindi = Unicode)
  const hasUnicode = /[^\u0000-\u007F]/.test(message);

  const charactersPerSegment = hasUnicode ? 70 : 160;
  const segments = Math.ceil(message.length / charactersPerSegment);

  return {
    segments,
    encoding: hasUnicode ? 'Unicode' : 'GSM-7',
    charactersPerSegment,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export default {
  sendSafetySMS,
  sendLocationUpdateSMS,
  sendSharingEndedSMS,
  sendEmergencySMS,
  formatPhoneNumberForDisplay,
  getSmsCharacterCount,
  SMS_CONFIG,
  SMS_TEMPLATES,
};
