/**
 * Age Verification Routes
 * DPDP Act 2023 Compliance - 18+ age gate enforcement
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { addYears } from "date-fns";
import { authenticate } from "../middleware/auth";
import { ageGate, isAdult, calculateAge } from "../middleware/ageGate";
import { ERROR_CODES, createError, handleError } from "../utils/errors";

const prisma = new PrismaClient();

interface AgeVerificationBody {
  dateOfBirth: string; // ISO 8601 format: YYYY-MM-DD
}

/**
 * POST /auth/age-verify
 * Submit date of birth for age verification
 * Must be 18+ to use the service (DPDP Act 2023)
 */
export async function verifyAgeRoute(
  fastify: FastifyInstance,
  request: FastifyRequest<{ Body: AgeVerificationBody }>,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    const { dateOfBirth } = request.body;

    if (!dateOfBirth) {
      throw createError(
        ERROR_CODES.INVALID_DATE_OF_BIRTH,
        "Date of birth is required.",
        400
      );
    }

    // Parse and validate date
    const dob = new Date(dateOfBirth);

    if (isNaN(dob.getTime())) {
      throw createError(
        ERROR_CODES.INVALID_DATE_OF_BIRTH,
        "Invalid date format. Use ISO 8601 format (YYYY-MM-DD).",
        400,
        { expectedFormat: "YYYY-MM-DD" }
      );
    }

    // Check if user is 18 or older
    if (!isAdult(dob)) {
      const age = calculateAge(dob);

      // Log age restriction violation
      await prisma.auditLog.create({
        data: {
          eventType: "AGE_VERIFICATION_FAILED",
          userId,
          entityType: "USER",
          entityId: userId,
          action: "UNDERAGE_REGISTRATION_ATTEMPT",
          metadata: {
            providedAge: age,
            requiredAge: 18,
          },
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        },
      });

      throw createError(
        ERROR_CODES.AGE_RESTRICTION_VIOLATION,
        "You must be 18 years or older to use this service.",
        403,
        {
          providedAge: age,
          requiredAge: 18,
          yearsUntilEligible: 18 - age,
        }
      );
    }

    // Update user with age verification
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        dateOfBirth: dob,
        isAgeVerified: true,
        ageVerifiedAt: new Date(),
      },
    });

    // Log successful age verification
    await prisma.auditLog.create({
      data: {
        eventType: "AGE_VERIFIED",
        userId,
        entityType: "USER",
        entityId: userId,
        action: "AGE_VERIFICATION_COMPLETE",
        metadata: {
          age: calculateAge(dob),
          isAdult: true,
        },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    return reply.status(200).send({
      message: "Age verified successfully",
      isAgeVerified: true,
      isAdult: true,
      ageVerifiedAt: user.ageVerifiedAt,
      dpdpNotice: {
        notice: "Your date of birth is stored securely and used only for age verification.",
        rights: "You can request data deletion as per DPDP Act 2023.",
      },
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * GET /auth/age-verify/status
 * Check age verification status
 */
export async function ageVerifyStatusRoute(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const userId = (request.user as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dateOfBirth: true,
        isAgeVerified: true,
        ageVerifiedAt: true,
      },
    });

    if (!user) {
      throw createError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    return reply.status(200).send({
      isAgeVerified: user.isAgeVerified,
      ageVerifiedAt: user.ageVerifiedAt,
      requiresVerification: !user.isAgeVerified,
      // Don't expose full date of birth for privacy
      dobYear: user.dateOfBirth?.getFullYear() ?? null,
    });
  } catch (error: any) {
    return handleError(error, request, reply);
  }
}

/**
 * Register routes with Fastify
 */
export async function ageVerificationRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/auth/age-verify",
    { preHandler: [authenticate] },
    verifyAgeRoute
  );

  fastify.get(
    "/auth/age-verify/status",
    { preHandler: [authenticate] },
    ageVerifyStatusRoute
  );
}
