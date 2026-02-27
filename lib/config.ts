/**
 * Bandhan AI - Environment Configuration
 * Type-safe environment variable validation and access
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Environment Schema Validation
// ─────────────────────────────────────────────────────────────────────────────
const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_NAME: z.string().default('Bandhan AI'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_VERSION: z.string(),

  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Backend API
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(32),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Razorpay
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_S3_BUCKET: z.string().min(1),

  // CDN
  NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
  NEXT_PUBLIC_MEDIA_URL: z.string().url().optional(),

  // DigiLocker
  DIGILOCKER_CLIENT_ID: z.string().optional(),
  DIGILOCKER_CLIENT_SECRET: z.string().optional(),
  DIGILOCKER_REDIRECT_URI: z.string().url().optional(),

  // MSG91
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().default('BNDHAN'),
  MSG91_TEMPLATE_ID: z.string().optional(),

  // Socket.io
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  SOCKET_SECRET: z.string().optional(),

  // KMS
  KMS_KEY_ARN: z.string().optional(),
  KMS_REGION: z.string().default('ap-south-1'),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_KUNDALI: z.string().transform((v) => v === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_VIDEO: z.string().transform((v) => v === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_VOICE_NOTES: z.string().transform((v) => v === 'true').default('true'),
  NEXT_PUBLIC_MAINTENANCE: z.string().transform((v) => v === 'true').default('false'),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),

  // reCAPTCHA
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform((v) => parseInt(v, 10)).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((v) => parseInt(v, 10)).default('100'),

  // Cookie Settings
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.string().transform((v) => v === 'true').default('false'),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
});

// ─────────────────────────────────────────────────────────────────────────────
// Environment Type
// ─────────────────────────────────────────────────────────────────────────────
export type EnvConfig = z.infer<typeof envSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Validate and Parse Environment Variables
// ─────────────────────────────────────────────────────────────────────────────
function validateEnv(): { config: EnvConfig; errors: z.ZodError | null } {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    return {
      config: {} as EnvConfig,
      errors: result.error,
    };
  }

  return {
    config: result.data,
    errors: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration Object
// ─────────────────────────────────────────────────────────────────────────────
const { config: envConfig, errors: validationErrors } = validateEnv();

// Log validation errors in development (not in production for security)
if (validationErrors && process.env.NODE_ENV === 'development') {
  console.error('❌ Environment variable validation failed:');
  console.error(validationErrors.format());
  console.error('\nPlease check your .env.local file and ensure all required variables are set.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Configuration
// ─────────────────────────────────────────────────────────────────────────────
export const config = {
  // App
  appName: envConfig.NEXT_PUBLIC_APP_NAME,
  appUrl: envConfig.NEXT_PUBLIC_APP_URL,
  appVersion: envConfig.NEXT_PUBLIC_APP_VERSION,

  // Firebase
  firebase: {
    apiKey: envConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: envConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: envConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: envConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: envConfig.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },

  // API
  api: {
    baseUrl: envConfig.NEXT_PUBLIC_API_BASE_URL,
    secretKey: envConfig.API_SECRET_KEY,
  },

  // Database
  database: {
    url: envConfig.DATABASE_URL,
    directUrl: envConfig.DIRECT_URL,
  },

  // Razorpay
  razorpay: {
    keyId: envConfig.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    keySecret: envConfig.RAZORPAY_KEY_SECRET,
    webhookSecret: envConfig.RAZORPAY_WEBHOOK_SECRET,
  },

  // AWS
  aws: {
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
    region: envConfig.AWS_REGION,
    s3Bucket: envConfig.AWS_S3_BUCKET,
  },

  // CDN
  cdn: {
    url: envConfig.NEXT_PUBLIC_CDN_URL,
    mediaUrl: envConfig.NEXT_PUBLIC_MEDIA_URL,
  },

  // DigiLocker
  digilocker: {
    clientId: envConfig.DIGILOCKER_CLIENT_ID,
    clientSecret: envConfig.DIGILOCKER_CLIENT_SECRET,
    redirectUri: envConfig.DIGILOCKER_REDIRECT_URI,
  },

  // MSG91
  msg91: {
    authKey: envConfig.MSG91_AUTH_KEY,
    senderId: envConfig.MSG91_SENDER_ID,
    templateId: envConfig.MSG91_TEMPLATE_ID,
  },

  // Socket.io
  socket: {
    url: envConfig.NEXT_PUBLIC_SOCKET_URL,
    secret: envConfig.SOCKET_SECRET,
  },

  // KMS
  kms: {
    keyArn: envConfig.KMS_KEY_ARN,
    region: envConfig.KMS_REGION,
  },

  // Feature Flags
  features: {
    kundali: envConfig.NEXT_PUBLIC_ENABLE_KUNDALI,
    video: envConfig.NEXT_PUBLIC_ENABLE_VIDEO,
    voiceNotes: envConfig.NEXT_PUBLIC_ENABLE_VOICE_NOTES,
    maintenance: envConfig.NEXT_PUBLIC_MAINTENANCE,
  },

  // Sentry
  sentry: {
    dsn: envConfig.SENTRY_DSN,
    publicDsn: envConfig.NEXT_PUBLIC_SENTRY_DSN,
    org: envConfig.SENTRY_ORG,
    project: envConfig.SENTRY_PROJECT,
  },

  // Analytics
  analytics: {
    googleAnalyticsId: envConfig.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    mixpanelToken: envConfig.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },

  // reCAPTCHA
  reCAPTCHA: {
    siteKey: envConfig.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
    maxRequests: envConfig.RATE_LIMIT_MAX_REQUESTS,
  },

  // Cookie
  cookie: {
    domain: envConfig.COOKIE_DOMAIN,
    secure: envConfig.COOKIE_SECURE,
  },

  // NextAuth
  nextAuth: {
    url: envConfig.NEXTAUTH_URL,
    secret: envConfig.NEXTAUTH_SECRET,
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Check if all required environment variables are set
 */
export function isEnvValid(): boolean {
  return validationErrors === null;
}

/**
 * Get validation errors (for debugging)
 */
export function getEnvErrors(): z.ZodError | null {
  return validationErrors;
}

/**
 * Get a specific config value by path
 * @example getEnvValue('firebase.projectId')
 */
export function getEnvValue(path: string): unknown {
  const keys = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = config;

  for (const key of keys) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Firebase Config Helper
// ─────────────────────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
  measurementId: config.firebase.measurementId,
};

// ─────────────────────────────────────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────────────────────────────────────
export default config;
