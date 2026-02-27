/**
 * Location History Routes & Scheduled Cleanup
 * DPDP Act 2023 Compliance - Auto-delete after 90 days
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";
import { authenticate } from "../middleware/auth";
import { ERROR_CODES, createError, handleError } from "../utils/errors";

const prisma = new PrismaClient();

// DPDP Act 2023: Location data retention limit
const LOCATION_RETENTION_DAYS = 90;

interface LocationBody {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * POST /location
 * Record user location with auto-expiry (90 days)
 */
export async function recordLocationRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<{ Body: LocationBody }>,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    const { latitude, longitude, accuracy } = request.body;

    // Validate coordinates
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw createError(
        ERROR_CODES.INVALID_INPUT,
        "Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.",
        400
      );
    }

    // Verify consent for location tracking
    const consent = await prisma.consent.findFirst({
      where: { userId, consentWithdrawnAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!consent || !consent.purposeAnalytics) {
      throw createError(
        ERROR_CODES.CONSENT_REQUIRED,
        "Location tracking requires analytics consent. Please update your consent settings.",
        403,
        { requiredConsent: "purposeAnalytics" }
      );
    }

    // Create location record with auto-expiry
    const expiresAt = addDays(new Date(), LOCATION_RETENTION_DAYS);

    const location = await prisma.locationHistory.create({
      data: {
        userId,
        latitude,
        longitude,
        accuracy: accuracy ?? null,
        expiresAt,
        isExpired: false,
      },
    });

    return reply.status(201).send({
      message: "Location recorded",
      location: {
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        recordedAt: location.createdAt,
        expiresAt: location.expiresAt,
        retentionDays: LOCATION_RETENTION_DAYS,
      },
      dpdpNotice: {
        retention: `Location data will be automatically deleted after ${LOCATION_RETENTION_DAYS} days as per DPDP Act 2023.`,
        rights: "You can request immediate deletion of your location data.",
      },
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * GET /location/history
 * Get user's location history (non-expired only)
 */
export async function getLocationHistoryRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    const locations = await prisma.locationHistory.findMany({
      where: {
        userId,
        isExpired: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit results
      select: {
        id: true,
        latitude: true,
        longitude: true,
        accuracy: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return reply.status(200).send({
      locations,
      totalRecords: locations.length,
      retentionDays: LOCATION_RETENTION_DAYS,
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * DELETE /location/history
 * Delete all location history (user's right to erasure)
 */
export async function deleteLocationHistoryRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    // Count records to be deleted
    const count = await prisma.locationHistory.count({
      where: {
        userId,
        isExpired: false,
      },
    });

    // Soft delete (mark as expired)
    await prisma.locationHistory.updateMany({
      where: {
        userId,
        isExpired: false,
      },
      data: {
        isExpired: true,
      },
    });

    // Log deletion for audit
    await prisma.auditLog.create({
      data: {
        eventType: "LOCATION_DATA_DELETED",
        userId,
        entityType: "LOCATION_HISTORY",
        action: "USER_REQUESTED_DELETION",
        metadata: {
          recordsDeleted: count,
          requestedBy: "user",
        },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    return reply.status(200).send({
      message: "Location history deleted successfully",
      recordsDeleted: count,
      dpdpNotice: {
        notice: "Your location data has been deleted as per your right to erasure under DPDP Act 2023.",
        grievanceOfficer: "Contact grievance.officer@bandhan.ai for queries.",
      },
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * Scheduled Job: Clean up expired location data
 * Run daily to delete location records older than 90 days
 */
export async function cleanupExpiredLocations(): Promise<{
  deletedCount: number;
}> {
  try {
    const now = new Date();

    // Mark expired records
    const markResult = await prisma.locationHistory.updateMany({
      where: {
        expiresAt: { lte: now },
        isExpired: false,
      },
      data: {
        isExpired: true,
      },
    });

    // Delete old expired records (older than 180 days for safety)
    const safetyRetention = addDays(now, -180);
    const deleteResult = await prisma.locationHistory.deleteMany({
      where: {
        expiresAt: { lte: safetyRetention },
        isExpired: true,
      },
    });

    // Log cleanup
    await prisma.auditLog.create({
      data: {
        eventType: "AUTO_DATA_CLEANUP",
        entityType: "LOCATION_HISTORY",
        action: "SCHEDULED_EXPIRY_DELETION",
        metadata: {
          markedAsExpired: markResult.count,
          permanentlyDeleted: deleteResult.count,
          retentionDays: LOCATION_RETENTION_DAYS,
          safetyRetentionDays: 180,
        },
      },
    });

    console.log(
      `[Location Cleanup] Marked ${markResult.count} as expired, deleted ${deleteResult.count} old records`
    );

    return {
      deletedCount: deleteResult.count,
    };
  } catch (error) {
    console.error("[Location Cleanup] Error:", error);
    throw error;
  }
}

/**
 * Register routes with Fastify
 */
export async function locationRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/location",
    { preHandler: [authenticate] },
    recordLocationRoute
  );

  fastify.get(
    "/location/history",
    { preHandler: [authenticate] },
    getLocationHistoryRoute
  );

  fastify.delete(
    "/location/history",
    { preHandler: [authenticate] },
    deleteLocationHistoryRoute
  );
}
