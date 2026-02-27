/**
 * Consent Management Routes
 * DPDP Act 2023 Compliance - Purpose-based consent with granular control
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";
import { ERROR_CODES, createError, handleError } from "../utils/errors";

const prisma = new PrismaClient();

// Valid consent purposes as per DPDP Act 2023
const VALID_CONSENT_PURPOSES = [
  "purposeMatching",    // For identity matching
  "purposeMarketing",   // For marketing communications
  "purposeAnalytics",   // For usage analytics
  "purposeThirdParty",  // For third-party sharing
] as const;

type ConsentPurpose = typeof VALID_CONSENT_PURPOSES[number];

interface ConsentRequestBody {
  purposeMatching?: boolean;
  purposeMarketing?: boolean;
  purposeAnalytics?: boolean;
  purposeThirdParty?: boolean;
}

interface ConsentUpdateBody {
  purpose?: ConsentPurpose;
  granted?: boolean;
}

/**
 * GET /consent
 * Get current consent status for authenticated user
 */
export async function getConsentRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    // Get latest consent record
    const consent = await prisma.consent.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return reply.status(200).send({
      consent: consent
        ? {
            purposeMatching: consent.purposeMatching,
            purposeMarketing: consent.purposeMarketing,
            purposeAnalytics: consent.purposeAnalytics,
            purposeThirdParty: consent.purposeThirdParty,
            consentGivenAt: consent.consentGivenAt,
            consentWithdrawnAt: consent.consentWithdrawnAt,
            consentVersion: consent.consentVersion,
            isActive: !consent.consentWithdrawnAt,
          }
        : null,
      dpdpCompliance: {
        notice: "As per DPDP Act 2023, you have the right to withdraw consent at any time.",
        rights: [
          "Right to access personal data",
          "Right to correction and erasure",
          "Right to grievance redressal",
          "Right to withdraw consent",
        ],
      },
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * POST /consent
 * Provide or update consent for specific purposes
 * DPDP Act 2023 requires explicit, informed consent
 */
export async function updateConsentRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<{ Body: ConsentRequestBody }>,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    const {
      purposeMatching,
      purposeMarketing,
      purposeAnalytics,
      purposeThirdParty,
    } = request.body;

    // Validate that at least one purpose is provided
    if (
      purposeMatching === undefined &&
      purposeMarketing === undefined &&
      purposeAnalytics === undefined &&
      purposeThirdParty === undefined
    ) {
      throw createError(
        ERROR_CODES.INVALID_INPUT,
        "At least one consent purpose must be specified.",
        400
      );
    }

    // Get current consent or create new
    const existingConsent = await prisma.consent.findFirst({
      where: { userId, consentWithdrawnAt: null },
      orderBy: { createdAt: "desc" },
    });

    // Create new consent record
    const consent = await prisma.consent.create({
      data: {
        userId,
        purposeMatching: purposeMatching ?? existingConsent?.purposeMatching ?? false,
        purposeMarketing: purposeMarketing ?? existingConsent?.purposeMarketing ?? false,
        purposeAnalytics: purposeAnalytics ?? existingConsent?.purposeAnalytics ?? false,
        purposeThirdParty: purposeThirdParty ?? existingConsent?.purposeThirdParty ?? false,
        consentVersion: "1.0",
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    // Log consent given for audit
    await prisma.auditLog.create({
      data: {
        eventType: "CONSENT_GIVEN",
        userId,
        entityType: "CONSENT",
        entityId: consent.id,
        action: "CONSENT_PROVIDED",
        metadata: {
          purposes: {
            purposeMatching,
            purposeMarketing,
            purposeAnalytics,
            purposeThirdParty,
          },
          consentVersion: "1.0",
        },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    return reply.status(200).send({
      message: "Consent updated successfully",
      consent: {
        purposeMatching: consent.purposeMatching,
        purposeMarketing: consent.purposeMarketing,
        purposeAnalytics: consent.purposeAnalytics,
        purposeThirdParty: consent.purposeThirdParty,
        consentGivenAt: consent.consentGivenAt,
        consentVersion: consent.consentVersion,
      },
      dpdpNotice: {
        withdrawalInfo: "You can withdraw consent at any time via /consent/withdraw",
        dataPrincipalRights: "As per DPDP Act 2023, you have rights over your personal data.",
      },
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * POST /consent/withdraw
 * Withdraw all consent (DPDP Act 2023 right)
 */
export async function withdrawConsentRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    // Find active consent
    const existingConsent = await prisma.consent.findFirst({
      where: { userId, consentWithdrawnAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!existingConsent) {
      throw createError(
        ERROR_CODES.CONSENT_WITHDRAWN,
        "No active consent found to withdraw.",
        400
      );
    }

    // Mark consent as withdrawn
    const updatedConsent = await prisma.consent.update({
      where: { id: existingConsent.id },
      data: {
        consentWithdrawnAt: new Date(),
      },
    });

    // Log consent withdrawal for audit
    await prisma.auditLog.create({
      data: {
        eventType: "CONSENT_WITHDRAWN",
        userId,
        entityType: "CONSENT",
        entityId: updatedConsent.id,
        action: "CONSENT_WITHDRAWN",
        metadata: {
          previousPurposes: {
            purposeMatching: updatedConsent.purposeMatching,
            purposeMarketing: updatedConsent.purposeMarketing,
            purposeAnalytics: updatedConsent.purposeAnalytics,
            purposeThirdParty: updatedConsent.purposeThirdParty,
          },
        },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    return reply.status(200).send({
      message: "Consent withdrawn successfully",
      withdrawnAt: updatedConsent.consentWithdrawnAt,
      dpdpNotice: {
        effect: "Data processing for marketing and third-party purposes will stop.",
        dataRetention: "Some data may be retained as required by law.",
        grievanceOfficer: "Contact grievance.officer@bandhan.ai for queries.",
      },
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * GET /consent/history
 * Get consent history for audit purposes
 */
export async function getConsentHistoryRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    const consentHistory = await prisma.consent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 records
      select: {
        id: true,
        purposeMatching: true,
        purposeMarketing: true,
        purposeAnalytics: true,
        purposeThirdParty: true,
        consentGivenAt: true,
        consentWithdrawnAt: true,
        consentVersion: true,
        createdAt: true,
      },
    });

    return reply.status(200).send({
      history: consentHistory,
      totalRecords: consentHistory.length,
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * POST /consent/verify-purpose
 * Verify if consent is given for a specific purpose
 * Use this middleware-style route before processing data
 */
export async function verifyConsentPurposeRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<{ Body: { purpose: ConsentPurpose } }>,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;
    const { purpose } = request.body;

    if (!VALID_CONSENT_PURPOSES.includes(purpose)) {
      throw createError(
        ERROR_CODES.INVALID_CONSENT_PURPOSE,
        `Invalid consent purpose. Valid purposes: ${VALID_CONSENT_PURPOSES.join(", ")}`,
        400
      );
    }

    // Get latest active consent
    const consent = await prisma.consent.findFirst({
      where: { userId, consentWithdrawnAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!consent) {
      throw createError(
        ERROR_CODES.CONSENT_REQUIRED,
        "No consent record found. Please provide consent before proceeding.",
        403,
        { requiredConsent: purpose }
      );
    }

    const hasConsent = consent[purpose];

    if (!hasConsent) {
      throw createError(
        ERROR_CODES.CONSENT_REQUIRED,
        `Consent not given for purpose: ${purpose}`,
        403,
        { requiredConsent: purpose }
      );
    }

    return reply.status(200).send({
      hasConsent: true,
      purpose,
      consentGivenAt: consent.consentGivenAt,
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * Register routes with Fastify
 */
export async function consentRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/consent",
    { preHandler: [authenticate] },
    getConsentRoute
  );

  fastify.post(
    "/consent",
    { preHandler: [authenticate] },
    updateConsentRoute
  );

  fastify.post(
    "/consent/withdraw",
    { preHandler: [authenticate] },
    withdrawConsentRoute
  );

  fastify.get(
    "/consent/history",
    { preHandler: [authenticate] },
    getConsentHistoryRoute
  );

  fastify.post(
    "/consent/verify-purpose",
    { preHandler: [authenticate] },
    verifyConsentPurposeRoute
  );
}
