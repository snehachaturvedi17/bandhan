/**
 * Authentication Middleware
 * JWT verification for protected routes
 */

import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) {
  try {
    await request.jwtVerify();
    done();
  } catch (err: any) {
    return reply.status(401).send({
      error: "UNAUTHORIZED",
      message: err.message || "Invalid or expired token",
    });
  }
}

/**
 * Optional Authentication Middleware
 * Does not block if no token, but adds user info if token is valid
 */
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) {
  try {
    await request.jwtVerify();
    done();
  } catch (err) {
    // Don't block, just continue without user context
    done();
  }
}
