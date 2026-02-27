/**
 * Bandhan AI - DPDP Act 2023 Compliant Authentication Backend
 *
 * Features:
 * - 3-Tier Verification (Phone OTP, DigiLocker, Video Selfie)
 * - NO Aadhaar storage (compliant with Indian regulations)
 * - AWS KMS AES-256-GCM encryption for sensitive tokens
 * - Firebase Auth for Indian SMS gateways
 * - Age gate (18+) enforcement
 * - Purpose-based consent management
 * - Auto-delete location history after 90 days
 */

import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import schedule from "@fastify/schedule";
import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

// Import routes
import { phoneOtpRoutes } from "./routes/auth/phone-otp";
import { digiLockerRoutes } from "./routes/auth/digilocker";
import { videoSelfieRoutes } from "./routes/auth/video-selfie";
import { ageVerificationRoutes } from "./routes/auth/age-verify";
import { consentRoutes } from "./routes/consent";
import { locationRoutes, cleanupExpiredLocations } from "./routes/location";

// Import middleware
import { authenticate } from "./middleware/auth";
import { ageGate } from "./middleware/ageGate";

// Import error handling
import { ERROR_CODES, handleError } from "./utils/errors";

// Initialize Prisma
const prisma = new PrismaClient();

// Create Fastify instance
const app: FastifyInstance = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

// ============================================================================
// PLUGINS
// ============================================================================

// CORS
app.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// Helmet (Security headers)
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// Rate Limiting
app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  allowList: ["127.0.0.1", "::1"], // Whitelist localhost
});

// JWT
app.register(jwt, {
  secret: process.env.JWT_SECRET || "supersecretkey", // Use env var in production
  sign: {
    expiresIn: "15m",
  },
});

// Scheduler (for cleanup jobs)
app.register(schedule);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/", async () => {
  return {
    message: "Bandhan AI Backend Running 🚀",
    version: "2.0.0",
    compliance: "DPDP Act 2023",
    timestamp: new Date().toISOString(),
  };
});

app.get("/health", async () => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    app.log.error("Health check failed:", error);
    return {
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    };
  }
});

// ============================================================================
// AUTH ROUTES (Public)
// ============================================================================

// Phone OTP routes (Tier 1 verification)
app.register(phoneOtpRoutes);

// DigiLocker callback (public, called by MeitY API)
app.register(digiLockerRoutes);

// ============================================================================
// PROTECTED ROUTES
// ============================================================================

// Age verification routes
app.register(ageVerificationRoutes);

// Video selfie routes (Tier 3 verification)
app.register(videoSelfieRoutes);

// Consent management routes
app.register(consentRoutes);

// Location routes
app.register(locationRoutes);

// ============================================================================
// PROFILE ROUTE (Protected + Age Gated)
// ============================================================================

app.get(
  "/profile",
  { preHandler: [authenticate, ageGate] },
  async (request: any, reply) => {
    const userId = request.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        isPhoneVerified: true,
        isAgeVerified: true,
        verificationLevel: true,
        phoneVerifiedAt: true,
        digiLockerVerifiedAt: true,
        videoSelfieVerifiedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({
        error: ERROR_CODES.USER_NOT_FOUND,
        message: "User not found",
      });
    }

    return {
      user: {
        ...user,
        phone: user.phone?.replace(/(\+91)(\d{3})(\d{7})/, "$1-XXX-XXX$3"), // Mask phone
      },
      verification: {
        tier1: user.isPhoneVerified,
        tier2: !!user.digiLockerVerifiedAt,
        tier3: !!user.videoSelfieVerifiedAt,
        level: user.verificationLevel,
      },
    };
  },
);

// ============================================================================
// TOKEN REFRESH ROUTE
// ============================================================================

app.post("/auth/refresh", async (request: any, reply) => {
  const { refreshToken } = request.body;

  if (!refreshToken) {
    return reply.status(401).send({
      error: ERROR_CODES.NO_REFRESH_TOKEN,
      message: "No refresh token provided",
    });
  }

  try {
    const decoded: any = app.jwt.verify(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return reply.status(403).send({
        error: ERROR_CODES.REFRESH_TOKEN_INVALID,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = app.jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        verificationLevel: user.verificationLevel,
      },
      { expiresIn: "15m" },
    );

    return { accessToken: newAccessToken };
  } catch (err: any) {
    return reply.status(403).send({
      error: ERROR_CODES.REFRESH_TOKEN_INVALID,
      message: "Invalid or expired refresh token",
    });
  }
});

// ============================================================================
// LOGOUT ROUTE
// ============================================================================

app.post(
  "/auth/logout",
  { preHandler: [authenticate] },
  async (request: any, reply) => {
    const userId = request.user.userId;

    // Revoke all sessions for this user
    await prisma.session.updateMany({
      where: { userId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });

    // Log logout
    await prisma.auditLog.create({
      data: {
        eventType: "LOGOUT",
        userId,
        entityType: "USER",
        entityId: userId,
        action: "USER_LOGOUT",
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      },
    });

    return { message: "Logged out successfully" };
  },
);

// ============================================================================
// SCHEDULED JOBS
// ============================================================================

// Daily cleanup of expired location data (90 days retention)
app.addCronJob("0 2 * * *", async () => {
  // Runs at 2:00 AM daily
  app.log.info("[Scheduled Job] Starting location data cleanup...");

  try {
    const result = await cleanupExpiredLocations();
    app.log.info(
      `[Scheduled Job] Cleanup complete. Deleted ${result.deletedCount} records.`,
    );
  } catch (error) {
    app.log.error("[Scheduled Job] Cleanup failed:", error);
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.setErrorHandler((error, request, reply) => {
  return handleError(error, request, reply);
});

// ============================================================================
// START SERVER
// ============================================================================

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "4000", 10);
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           Bandhan AI Backend - DPDP Act 2023              ║
╠═══════════════════════════════════════════════════════════╣
║  Server running at http://${host}:${port}                    ║
║  Environment: ${process.env.NODE_ENV || "development"}                       ║
║  Compliance: DPDP Act 2023 (India)                        ║
╠═══════════════════════════════════════════════════════════╣
║  Features:                                                 ║
║  ✓ 3-Tier Verification (No Aadhaar storage)               ║
║  ✓ Firebase Auth (Indian SMS Gateway)                     ║
║  ✓ DigiLocker OAuth (MeitY API)                           ║
║  ✓ Video Selfie with Liveness Detection                   ║
║  ✓ Age Gate (18+ enforcement)                             ║
║  ✓ Purpose-based Consent Management                       ║
║  ✓ Auto-delete Location (90 days)                         ║
║  ✓ AWS KMS AES-256-GCM Encryption                         ║
╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
});

start();
