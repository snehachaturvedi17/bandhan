/**
 * Error Codes and Types
 * DPDP Act 2023 Compliance Error Handling
 */

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Authentication Errors
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  NO_REFRESH_TOKEN: "NO_REFRESH_TOKEN",
  REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",

  // Age Verification Errors
  AGE_RESTRICTION_VIOLATION: "AGE_RESTRICTION_VIOLATION",
  AGE_NOT_VERIFIED: "AGE_NOT_VERIFIED",
  INVALID_DATE_OF_BIRTH: "INVALID_DATE_OF_BIRTH",

  // Phone OTP Errors
  INVALID_PHONE_FORMAT: "INVALID_PHONE_FORMAT",
  OTP_SEND_FAILED: "OTP_SEND_FAILED",
  OTP_VERIFICATION_FAILED: "OTP_VERIFICATION_FAILED",
  OTP_EXPIRED: "OTP_EXPIRED",
  OTP_MAX_ATTEMPTS_EXCEEDED: "OTP_MAX_ATTEMPTS_EXCEEDED",
  FIREBASE_USER_CREATION_FAILED: "FIREBASE_USER_CREATION_FAILED",

  // DigiLocker Errors
  DIGILOCKER_VERIFICATION_FAILED: "DIGILOCKER_VERIFICATION_FAILED",
  DIGILOCKER_PROFILE_FETCH_FAILED: "DIGILOCKER_PROFILE_FETCH_FAILED",
  DIGILOCKER_TOKEN_EXPIRED: "DIGILOCKER_TOKEN_EXPIRED",
  DIGILOCKER_TOKEN_REFRESH_FAILED: "DIGILOCKER_TOKEN_REFRESH_FAILED",
  DIGILOCKER_STATE_MISMATCH: "DIGILOCKER_STATE_MISMATCH",

  // Video Selfie Errors
  VIDEO_SELFIE_VERIFICATION_FAILED: "VIDEO_SELFIE_VERIFICATION_FAILED",
  LIVENESS_DETECTION_FAILED: "LIVENESS_DETECTION_FAILED",
  INVALID_VIDEO_FORMAT: "INVALID_VIDEO_FORMAT",
  VIDEO_TOO_LARGE: "VIDEO_TOO_LARGE",

  // Consent Errors
  CONSENT_REQUIRED: "CONSENT_REQUIRED",
  CONSENT_WITHDRAWN: "CONSENT_WITHDRAWN",
  INVALID_CONSENT_PURPOSE: "INVALID_CONSENT_PURPOSE",

  // Encryption Errors
  ENCRYPTION_FAILED: "ENCRYPTION_FAILED",
  DECRYPTION_FAILED: "DECRYPTION_FAILED",
  DATA_KEY_GENERATION_FAILED: "DATA_KEY_GENERATION_FAILED",

  // Database Errors
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  DATABASE_ERROR: "DATABASE_ERROR",

  // Rate Limiting Errors
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Validation Errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Server Errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

export interface ErrorResponse {
  error: ErrorCode;
  message: string;
  details?: Record<string, any>;
  requiresAction?: string;
}

export interface ApiError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: Record<string, any>;
}

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

export const createError = (
  code: ErrorCode,
  message: string,
  statusCode: number = 400,
  details?: Record<string, any>
): ApiError => {
  const error = new Error(message) as ApiError;
  error.code = code;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

export const ageRestrictionError = (): ApiError =>
  createError(
    ERROR_CODES.AGE_RESTRICTION_VIOLATION,
    "You must be 18 years or older to access this service.",
    403,
    { requiresAction: "ACCOUNT_RESTRICTION" }
  );

export const ageNotVerifiedError = (): ApiError =>
  createError(
    ERROR_CODES.AGE_NOT_VERIFIED,
    "Age verification required. Please provide your date of birth.",
    403,
    { requiresAction: "AGE_VERIFICATION" }
  );

export const digilockerVerificationError = (details?: string): ApiError =>
  createError(
    ERROR_CODES.DIGILOCKER_VERIFICATION_FAILED,
    "DigiLocker verification failed. Please try again.",
    400,
    details ? { digilockerError: details } : undefined
  );

export const invalidPhoneFormatError = (): ApiError =>
  createError(
    ERROR_CODES.INVALID_PHONE_FORMAT,
    "Invalid phone number format. Use +91XXXXXXXXXX (Indian format).",
    400,
    { expectedFormat: "+91XXXXXXXXXX" }
  );

export const otpVerificationError = (): ApiError =>
  createError(
    ERROR_CODES.OTP_VERIFICATION_FAILED,
    "OTP verification failed. Please check the code and try again.",
    400
  );

export const consentRequiredError = (purpose: string): ApiError =>
  createError(
    ERROR_CODES.CONSENT_REQUIRED,
    `Consent required for purpose: ${purpose}`,
    403,
    { requiredConsent: purpose }
  );

// ============================================================================
// ERROR HANDLER FOR FASTIFY
// ============================================================================

import { FastifyReply, FastifyRequest } from "fastify";

export const handleError = (
  error: ApiError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  if ("code" in error && "statusCode" in error) {
    const apiError = error as ApiError;
    return reply.status(apiError.statusCode).send({
      error: apiError.code,
      message: apiError.message,
      details: apiError.details,
      requiresAction: apiError.details?.requiresAction,
    });
  }

  // Generic error
  return reply.status(500).send({
    error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: "An unexpected error occurred",
  });
};
