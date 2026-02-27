/**
 * DigiLocker OAuth Routes
 * Tier 2 Verification - MeitY API Integration
 * DPDP Act 2023 Compliance - Only encrypted tokens stored, NO Aadhaar numbers
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import {
  getDigiLockerAuthUrl,
  exchangeDigiLockerCode,
  getDigiLockerProfile,
} from "../utils/digilocker";
import { encryptWithKMS } from "../utils/kms-encryption";
import { authenticate } from "../middleware/auth";
import { ERROR_CODES, createError, handleError } from "../utils/errors";

const prisma = new PrismaClient();

interface InitDigiLockerRequest {
  userId: string;
}

interface DigiLockerCallbackQuery {
  code?: string;
  state?: string;
  error?: string;
}

/**
 * GET /auth/digilocker/init
 * Initialize DigiLocker OAuth flow
 * Returns authorization URL for user redirect
 */
export async function initDigiLockerRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Verify user is authenticated
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    // Generate state parameter for CSRF protection
    const state = uuidv4();

    // Store state in database for validation on callback
    await prisma.session.create({
      data: {
        id: state, // Use state as ID for temporary storage
        userId,
        refreshTokenHash: "digilocker_state", // Marker for state type
        expiresAt: addMinutes(new Date(), 15), // 15 minute state expiry
      },
    });

    // Get DigiLocker authorization URL
    const authUrl = getDigiLockerAuthUrl(state);

    return reply.status(200).send({
      message: "DigiLocker authorization initiated",
      authorizationUrl: authUrl,
      state,
      expiresInSeconds: 900,
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * GET /auth/digilocker/callback
 * Handle DigiLocker OAuth callback
 * Exchange code for token and encrypt with AWS KMS
 * Tier 2 verification complete upon success
 */
export async function digiLockerCallbackRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<{ Querystring: DigiLockerCallbackQuery }>,
  reply: FastifyReply
) {
  try {
    const { code, state, error } = request.query;

    // Check for OAuth error
    if (error) {
      throw createError(
        ERROR_CODES.DIGILOCKER_VERIFICATION_FAILED,
        "DigiLocker authorization was denied or cancelled.",
        400,
        { digilockerError: error }
      );
    }

    if (!code) {
      throw createError(
        ERROR_CODES.DIGILOCKER_VERIFICATION_FAILED,
        "Authorization code not received from DigiLocker.",
        400
      );
    }

    if (!state) {
      throw createError(
        ERROR_CODES.DIGILOCKER_STATE_MISMATCH,
        "State parameter missing. Possible CSRF attack.",
        403
      );
    }

    // Verify state parameter
    const stateSession = await prisma.session.findUnique({
      where: { id: state },
    });

    if (!stateSession) {
      throw createError(
        ERROR_CODES.DIGILOCKER_STATE_MISMATCH,
        "Invalid or expired state parameter. Please restart the verification process.",
        403
      );
    }

    const userId = stateSession.userId;

    // Exchange code for access token
    const tokenResponse = await exchangeDigiLockerCode(code);

    // Encrypt the access token using AWS KMS (AES-256-GCM)
    const encryptedToken = await encryptWithKMS(tokenResponse.access_token);

    // Get user profile from DigiLocker (for verification purposes only)
    // IMPORTANT: We do NOT store Aadhaar or any PII from the profile
    const profile = await getDigiLockerProfile(tokenResponse.access_token);

    // Update user with Tier 2 verification
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        // Store ONLY encrypted token components (NO Aadhaar)
        digiLockerToken: encryptedToken.ciphertext,
        digiLockerTokenIv: encryptedToken.iv,
        digiLockerTokenTag: encryptedToken.authTag,
        digiLockerVerifiedAt: new Date(),
        verificationLevel: {
          increment: 1,
        },
      },
    });

    // Clean up state session
    await prisma.session.delete({
      where: { id: state },
    });

    // Log successful DigiLocker verification
    await prisma.auditLog.create({
      data: {
        eventType: "DIGILOCKER_VERIFIED",
        userId: user.id,
        entityType: "USER",
        entityId: user.id,
        action: "TIER_2_VERIFICATION_COMPLETE",
        metadata: {
          verificationLevel: user.verificationLevel,
          // DO NOT log any profile data that could contain Aadhaar
          verifiedAt: new Date().toISOString(),
          tokenEncrypted: true,
          encryptionMethod: "AES-256-GCM",
          kmsUsed: true,
        },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    // Generate new JWT with updated verification level
    const accessToken = fastify.jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        verificationLevel: user.verificationLevel,
        digilockerVerified: true,
      },
      { expiresIn: "15m" }
    );

    return reply.status(200).send({
      message: "DigiLocker verification successful",
      user: {
        id: user.id,
        verificationLevel: user.verificationLevel,
        isPhoneVerified: user.isPhoneVerified,
        digiLockerVerifiedAt: user.digiLockerVerifiedAt,
      },
      tokens: {
        accessToken,
      },
      // IMPORTANT: Never return the token or any profile data
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * POST /auth/digilocker/refresh
 * Refresh DigiLocker access token
 */
export async function refreshDigiLockerTokenRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Verify user is authenticated
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    // Get user's DigiLocker token
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.digiLockerToken) {
      throw createError(
        ERROR_CODES.DIGILOCKER_TOKEN_EXPIRED,
        "No DigiLocker token found. Please re-authorize.",
        404
      );
    }

    // Note: In production, you would store and use the refresh token
    // This is a simplified implementation
    throw createError(
      ERROR_CODES.DIGILOCKER_TOKEN_EXPIRED,
      "DigiLocker token has expired. Please re-authorize.",
      401
    );
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * GET /auth/digilocker/status
 * Check DigiLocker verification status
 */
export async function digiLockerStatusRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Verify user is authenticated
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        digiLockerVerifiedAt: true,
        verificationLevel: true,
      },
    });

    if (!user) {
      throw createError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    return reply.status(200).send({
      isVerified: !!user.digiLockerVerifiedAt,
      verifiedAt: user.digiLockerVerifiedAt,
      verificationLevel: user.verificationLevel,
      tier2Complete: user.verificationLevel >= 2,
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * Register routes with Fastify
 */
export async function digiLockerRoutes(fastify: FastifyInstance) {
  // Public callback route (called by DigiLocker)
  fastify.get("/auth/digilocker/callback", digiLockerCallbackRoute);

  // Protected routes
  fastify.get(
    "/auth/digilocker/init",
    { preHandler: [authenticate] },
    initDigiLockerRoute
  );
  fastify.get(
    "/auth/digilocker/status",
    { preHandler: [authenticate] },
    digiLockerStatusRoute
  );
  fastify.post(
    "/auth/digilocker/refresh",
    { preHandler: [authenticate] },
    refreshDigiLockerTokenRoute
  );
}
