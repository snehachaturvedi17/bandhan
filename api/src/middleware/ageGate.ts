/**
 * Age Gate Middleware
 * DPDP Act 2023 Compliance - Blocks under-18 users at API level
 * Must be applied to all profile-related routes
 */

import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth
 * @returns Age in years
 */
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Check if user is 18 or older
 * @param dateOfBirth - Date of birth
 * @returns True if user is 18+
 */
export const isAdult = (dateOfBirth: Date): boolean => {
  return calculateAge(dateOfBirth) >= 18;
};

/**
 * Age Gate Middleware
 * Blocks access for users who are:
 * - Not age verified
 * - Under 18 years old
 *
 * Error Code: AGE_RESTRICTION_VIOLATION
 */
export async function ageGate(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  try {
    // Extract user ID from JWT (set by authenticate middleware)
    const userId = (request.user as any)?.userId;

    if (!userId) {
      return reply.status(401).send({
        error: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dateOfBirth: true,
        isAgeVerified: true,
        name: true,
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: "USER_NOT_FOUND",
        message: "User does not exist",
      });
    }

    // Check if age is verified
    if (!user.isAgeVerified) {
      return reply.status(403).send({
        error: "AGE_NOT_VERIFIED",
        message: "Age verification required. Please provide your date of birth.",
        requiresAction: "AGE_VERIFICATION",
      });
    }

    // Check if user is 18 or older
    if (!user.dateOfBirth) {
      return reply.status(403).send({
        error: "AGE_RESTRICTION_VIOLATION",
        message: "Date of birth not found. Age verification required.",
        requiresAction: "AGE_VERIFICATION",
      });
    }

    if (!isAdult(user.dateOfBirth)) {
      // Log age restriction violation for compliance
      await prisma.auditLog.create({
        data: {
          eventType: "AGE_RESTRICTION_VIOLATION",
          userId: user.id,
          entityType: "USER",
          entityId: user.id,
          action: "BLOCKED_UNDERAGE_ACCESS",
          metadata: {
            reason: "User is under 18 years old",
            blockedAt: new Date().toISOString(),
          },
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        },
      });

      return reply.status(403).send({
        error: "AGE_RESTRICTION_VIOLATION",
        message: "You must be 18 years or older to access this service.",
        requiresAction: "ACCOUNT_RESTRICTION",
      });
    }

    // User is verified and 18+, proceed
    done();
  } catch (error: any) {
    request.log.error("Age gate middleware error:", error);
    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to verify age",
    });
  }
}

/**
 * Optional Age Gate Middleware
 * Does not block, but adds age verification status to request context
 * Use for routes that need to know age status but don't require 18+
 */
export async function optionalAgeGate(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  try {
    const userId = (request.user as any)?.userId;

    if (!userId) {
      return done();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dateOfBirth: true,
        isAgeVerified: true,
      },
    });

    // Add age verification status to request context
    (request as any).ageVerification = {
      isVerified: user?.isAgeVerified ?? false,
      isAdult: user?.dateOfBirth ? isAdult(user.dateOfBirth) : false,
      requiresVerification: !user?.isAgeVerified,
    };

    done();
  } catch (error) {
    request.log.error("Optional age gate middleware error:", error);
    done(); // Don't block, just log
  }
}
