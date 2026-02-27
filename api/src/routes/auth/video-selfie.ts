/**
 * Video Selfie Verification Routes
 * Tier 3 Verification - Liveness Detection
 * DPDP Act 2023 Compliance - Only encrypted verification results stored
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { encryptWithKMS } from "../utils/kms-encryption";
import { authenticate } from "../middleware/auth";
import { ERROR_CODES, createError, handleError } from "../utils/errors";

const prisma = new PrismaClient();

// Maximum video file size: 10MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;

// Allowed video MIME types
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

interface VideoSelfieRequestBody {
  videoData: string; // Base64 encoded video
  metadata?: {
    deviceInfo: string;
    captureDuration: number;
    frameCount: number;
  };
}

interface LivenessDetectionResult {
  isLive: boolean;
  confidence: number;
  checks: {
    faceDetected: boolean;
    eyeMovement: boolean;
    headMovement: boolean;
    depthAnalysis: boolean;
  };
}

/**
 * Simulate liveness detection
 * In production, integrate with a real liveness detection service like:
 * - AWS Rekognition Face Liveness
 * - Azure Face API Liveness
 * - Onfido
 * - Jumio
 */
const performLivenessDetection = async (
  videoData: string
): Promise<LivenessDetectionResult> => {
  // TODO: Integrate with actual liveness detection service
  // This is a placeholder implementation

  // Basic validation of video data
  if (!videoData || videoData.length < 1000) {
    throw createError(
      ERROR_CODES.INVALID_VIDEO_FORMAT,
      "Video data is too short or invalid.",
      400
    );
  }

  // Simulated liveness detection result
  return {
    isLive: true,
    confidence: 0.95,
    checks: {
      faceDetected: true,
      eyeMovement: true,
      headMovement: true,
      depthAnalysis: true,
    },
  };
};

/**
 * Validate video data
 * @param videoData - Base64 encoded video
 * @param mimeType - Video MIME type
 * @throws Error if validation fails
 */
const validateVideo = (videoData: string, mimeType: string): void => {
  // Check MIME type
  if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    throw createError(
      ERROR_CODES.INVALID_VIDEO_FORMAT,
      `Invalid video format. Allowed: ${ALLOWED_VIDEO_TYPES.join(", ")}`,
      400,
      { allowedTypes: ALLOWED_VIDEO_TYPES, received: mimeType }
    );
  }

  // Check file size
  const sizeInBytes = Buffer.byteLength(videoData, "base64");
  if (sizeInBytes > MAX_VIDEO_SIZE) {
    throw createError(
      ERROR_CODES.VIDEO_TOO_LARGE,
      `Video too large. Maximum size: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
      400,
      { maxSize: MAX_VIDEO_SIZE, received: sizeInBytes }
    );
  }
};

/**
 * POST /auth/video-selfie/verify
 * Submit video selfie for liveness detection
 * Tier 3 verification complete upon success
 */
export async function verifyVideoSelfieRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<{ Body: VideoSelfieRequestBody }>,
  reply: FastifyReply
) {
  try {
    // Verify user is authenticated
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    const { videoData, metadata } = request.body;

    if (!videoData) {
      throw createError(
        ERROR_CODES.INVALID_VIDEO_FORMAT,
        "No video data provided.",
        400
      );
    }

    // Extract MIME type from base64 data URL if present
    let mimeType = "video/mp4";
    let base64Data = videoData;

    if (videoData.startsWith("data:")) {
      const matches = videoData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // Validate video
    validateVideo(base64Data, mimeType);

    // Perform liveness detection
    const livenessResult = await performLivenessDetection(base64Data);

    if (!livenessResult.isLive) {
      // Log failed liveness detection
      await prisma.auditLog.create({
        data: {
          eventType: "LIVENESS_DETECTION_FAILED",
          userId,
          entityType: "USER",
          entityId: userId,
          action: "TIER_3_VERIFICATION_FAILED",
          metadata: {
            confidence: livenessResult.confidence,
            checks: livenessResult.checks,
            reason: "Liveness check failed",
          },
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        },
      });

      throw createError(
        ERROR_CODES.LIVENESS_DETECTION_FAILED,
        "Liveness detection failed. Please ensure you're recording in good lighting and follow the on-screen instructions.",
        400,
        {
          confidence: livenessResult.confidence,
          failedChecks: Object.entries(livenessResult.checks)
            .filter(([_, passed]) => !passed)
            .map(([check]) => check),
        }
      );
    }

    // Encrypt liveness detection result using AWS KMS
    const verificationData = JSON.stringify({
      isLive: livenessResult.isLive,
      confidence: livenessResult.confidence,
      verifiedAt: new Date().toISOString(),
      checks: livenessResult.checks,
    });

    const encryptedData = await encryptWithKMS(verificationData);

    // Update user with Tier 3 verification
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        videoSelfieData: encryptedData.ciphertext,
        videoSelfieVerifiedAt: new Date(),
        verificationLevel: 3, // Tier 3 complete (maximum)
      },
    });

    // Log successful video selfie verification
    await prisma.auditLog.create({
      data: {
        eventType: "VIDEO_SELFIE_VERIFIED",
        userId: user.id,
        entityType: "USER",
        entityId: user.id,
        action: "TIER_3_VERIFICATION_COMPLETE",
        metadata: {
          verificationLevel: user.verificationLevel,
          confidence: livenessResult.confidence,
          dataEncrypted: true,
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
        digilockerVerified: user.verificationLevel >= 2,
        videoSelfieVerified: user.verificationLevel >= 3,
      },
      { expiresIn: "15m" }
    );

    return reply.status(200).send({
      message: "Video selfie verification successful",
      user: {
        id: user.id,
        verificationLevel: user.verificationLevel,
        isPhoneVerified: user.isPhoneVerified,
        digiLockerVerifiedAt: user.digiLockerVerifiedAt,
        videoSelfieVerifiedAt: user.videoSelfieVerifiedAt,
      },
      tokens: {
        accessToken,
      },
      liveness: {
        confidence: livenessResult.confidence,
        // Don't expose detailed check results for security
      },
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * GET /auth/video-selfie/status
 * Check video selfie verification status
 */
export async function videoSelfieStatusRoute(
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
        verificationLevel: true,
        videoSelfieVerifiedAt: true,
        isPhoneVerified: true,
        digiLockerVerifiedAt: true,
      },
    });

    if (!user) {
      throw createError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    return reply.status(200).send({
      verificationLevel: user.verificationLevel,
      tier1Complete: user.isPhoneVerified,
      tier2Complete: !!user.digiLockerVerifiedAt,
      tier3Complete: !!user.videoSelfieVerifiedAt,
      fullyVerified: user.verificationLevel >= 3,
      videoSelfieVerifiedAt: user.videoSelfieVerifiedAt,
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * GET /auth/video-selfie/instructions
 * Get video selfie capture instructions
 */
export async function getVideoSelfieInstructionsRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    return reply.status(200).send({
      instructions: {
        steps: [
          "Find a well-lit area with even lighting on your face",
          "Hold your device at eye level, about arm's length away",
          "Ensure your entire face is visible in the frame",
          "Remove glasses, masks, or anything covering your face",
          "Follow the on-screen prompts (turn head, blink, smile)",
          "Keep still during the final capture",
        ],
        requirements: {
          lighting: "Good, even lighting (avoid backlighting)",
          background: "Plain background preferred",
          face: "Full face visible, no obstructions",
          device: "Stable connection, camera working",
        },
        videoSpecs: {
          maxDuration: 30, // seconds
          minDuration: 5, // seconds
          maxFileSize: MAX_VIDEO_SIZE / 1024 / 1024, // MB
          allowedFormats: ALLOWED_VIDEO_TYPES,
        },
      },
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * Register routes with Fastify
 */
export async function videoSelfieRoutes(fastify: FastifyInstance) {
  fastify.get("/auth/video-selfie/instructions", getVideoSelfieInstructionsRoute);

  fastify.post(
    "/auth/video-selfie/verify",
    { preHandler: [authenticate] },
    verifyVideoSelfieRoute
  );

  fastify.get(
    "/auth/video-selfie/status",
    { preHandler: [authenticate] },
    videoSelfieStatusRoute
  );
}
