/**
 * Bandhan AI - Mock API Health Check
 * Returns health status for demo deployment
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    demoMode: true,
    production: process.env.NODE_ENV === 'production',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    services: {
      auth: 'mock',
      matches: 'mock',
      chat: 'mock',
      profile: 'mock',
      subscription: 'mock',
    },
  });
}
