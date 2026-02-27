/**
 * Bandhan AI - Mock API Catch-All Route
 * Handles all mock API requests and returns realistic JSON responses
 *
 * Routes:
 * - POST /api/mock/auth/send-otp
 * - POST /api/mock/auth/verify-otp
 * - GET /api/mock/matches
 * - POST /api/mock/matches/like/:userId
 * - GET /api/mock/chat/conversations
 * - POST /api/mock/chat/conversations/:id/messages
 * - GET /api/mock/profile
 * - PUT /api/mock/profile
 * - GET /api/mock/subscription
 * - POST /api/mock/subscription/create-order
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockAuth } from '@/lib/mock-auth';
import { mockMatchService } from '@/lib/mock-match';
import { mockChatService } from '@/lib/mock-chat';
import { DEMO_USERS } from '@/data/demo-users';
import { DEMO_CONVERSATIONS } from '@/data/demo-conversations';
import { apiDelay } from '@/lib/delay';

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function success(data: unknown, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

function error(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

async function mockDelayResponse<T>(data: T, ms = 500): Promise<NextResponse> {
  await apiDelay();
  return success(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET Handler
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('📥 MOCK API GET:', pathname);

  try {
    // Health check
    if (pathname === '/api/mock/health') {
      return mockDelayResponse({
        status: 'healthy',
        demoMode: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Get matches
    if (pathname === '/api/mock/matches') {
      const searchParams = request.nextUrl.searchParams;
      const filters = {
        ageMin: searchParams.get('ageMin') ? parseInt(searchParams.get('ageMin')!) : undefined,
        ageMax: searchParams.get('ageMax') ? parseInt(searchParams.get('ageMax')!) : undefined,
        location: searchParams.get('location') || undefined,
        intent: searchParams.get('intent') || undefined,
      };

      const matches = await mockMatchService.getMatches(filters);
      return mockDelayResponse(matches);
    }

    // Get conversations
    if (pathname === '/api/mock/chat/conversations') {
      const conversations = await mockChatService.getConversations();
      return mockDelayResponse(conversations);
    }

    // Get messages
    if (pathname.match(/^\/api\/mock\/chat\/conversations\/[^/]+\/messages$/)) {
      const conversationId = pathname.split('/')[5];
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
      const messages = await mockChatService.getMessages(conversationId, limit);
      return mockDelayResponse(messages);
    }

    // Get profile
    if (pathname === '/api/mock/profile') {
      // Return current demo user
      const demoUser = DEMO_USERS[0];
      return mockDelayResponse({
        id: 'current_user',
        ...demoUser,
        demoMode: true,
      });
    }

    // Get subscription
    if (pathname === '/api/mock/subscription') {
      return mockDelayResponse({
        plan: 'free',
        expiresAt: null,
        features: [],
        demoMode: true,
      });
    }

    // Get daily limit
    if (pathname === '/api/mock/matches/limit') {
      const limit = await mockMatchService.getDailyLimit();
      return mockDelayResponse(limit);
    }

    return error('Endpoint not found', 404);
  } catch (err) {
    console.error('❌ MOCK API GET Error:', err);
    return error('Internal server error', 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST Handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('📥 MOCK API POST:', pathname);

  try {
    const body = await request.json().catch(() => ({}));

    // Send OTP
    if (pathname === '/api/mock/auth/send-otp') {
      const { phoneNumber } = body;

      if (!phoneNumber) {
        return error('Phone number required');
      }

      // Simulate OTP send
      await apiDelay();

      return success(
        {
          phoneNumber,
          otpLength: 6,
          expiresInSeconds: 300,
          demoOtp: '123456',
        },
        'OTP sent successfully (Demo: Use 123456)'
      );
    }

    // Verify OTP
    if (pathname === '/api/mock/auth/verify-otp') {
      const { phoneNumber, otp } = body;

      if (!phoneNumber || !otp) {
        return error('Phone number and OTP required');
      }

      // Demo OTP is always 123456
      if (otp !== '123456') {
        return error('Invalid OTP. Demo OTP is 123456');
      }

      await apiDelay();

      // Return demo user
      const demoUser = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];

      return success(
        {
          user: {
            ...demoUser,
            demoMode: true,
          },
          token: `mock_token_${Date.now()}`,
        },
        'OTP verified successfully'
      );
    }

    // Like user
    if (pathname.match(/^\/api\/mock\/matches\/like\/[^/]+$/)) {
      const userId = pathname.split('/')[5];
      const result = await mockMatchService.likeUser(userId);
      return mockDelayResponse(result);
    }

    // Pass user
    if (pathname.match(/^\/api\/mock\/matches\/pass\/[^/]+$/)) {
      const userId = pathname.split('/')[5];
      const result = await mockMatchService.passUser(userId);
      return mockDelayResponse(result);
    }

    // Send message
    if (pathname.match(/^\/api\/mock\/chat\/conversations\/[^/]+\/messages$/)) {
      const conversationId = pathname.split('/')[5];
      const { content, type = 'text' } = body;

      if (!content) {
        return error('Message content required');
      }

      const result = await mockChatService.sendMessage(conversationId, content);
      return mockDelayResponse(result);
    }

    // Send voice note
    if (pathname.match(/^\/api\/mock\/chat\/conversations\/[^/]+\/messages\/voice$/)) {
      const conversationId = pathname.split('/')[5];
      const { duration = 10 } = body;

      const result = await mockChatService.uploadVoiceNote(
        conversationId,
        new Blob(['mock audio'], { type: 'audio/webm' }),
        duration
      );
      return mockDelayResponse(result);
    }

    // Send photo
    if (pathname.match(/^\/api\/mock\/chat\/conversations\/[^/]+\/messages\/photo$/)) {
      const conversationId = pathname.split('/')[5];

      const result = await mockChatService.uploadPhoto(
        conversationId,
        new Blob(['mock image'], { type: 'image/jpeg' })
      );
      return mockDelayResponse(result);
    }

    // Send interest
    if (pathname.match(/^\/api\/mock\/chat\/conversations\/[^/]+\/interest$/)) {
      const conversationId = pathname.split('/')[5];
      const result = await mockChatService.sendInterest(conversationId);
      return mockDelayResponse(result);
    }

    // Mark as read
    if (pathname.match(/^\/api\/mock\/chat\/conversations\/[^/]+\/read$/)) {
      const conversationId = pathname.split('/')[5];
      const result = await mockChatService.markAsRead(conversationId);
      return mockDelayResponse(result);
    }

    // Update profile
    if (pathname === '/api/mock/profile') {
      await apiDelay();
      return success(
        { success: true, updated: body },
        'Profile updated successfully'
      );
    }

    // Create subscription order
    if (pathname === '/api/mock/subscription/create-order') {
      const { planId } = body;

      await apiDelay();

      return success({
        orderId: `order_${Date.now()}`,
        amount: planId === 'yearly' ? 299900 : 49900,
        currency: 'INR',
        demoMode: true,
      });
    }

    // Verify payment
    if (pathname === '/api/mock/subscription/verify-payment') {
      await apiDelay();

      return success({
        success: true,
        demoMode: true,
        message: 'Payment verified (demo)',
      });
    }

    return error('Endpoint not found', 404);
  } catch (err) {
    console.error('❌ MOCK API POST Error:', err);
    return error('Internal server error', 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT Handler
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('📥 MOCK API PUT:', pathname);

  try {
    const body = await request.json().catch(() => ({}));

    // Update profile
    if (pathname === '/api/mock/profile') {
      await apiDelay();
      return success(
        { success: true, updated: body },
        'Profile updated successfully'
      );
    }

    return error('Endpoint not found', 404);
  } catch (err) {
    console.error('❌ MOCK API PUT Error:', err);
    return error('Internal server error', 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE Handler
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('📥 MOCK API DELETE:', pathname);

  try {
    // Delete message
    if (pathname.match(/^\/api\/mock\/chat\/conversations\/[^/]+\/messages\/[^/]+$/)) {
      const conversationId = pathname.split('/')[5];
      const messageId = pathname.split('/')[7];

      const result = await mockChatService.deleteMessage(conversationId, messageId);
      return mockDelayResponse(result);
    }

    return error('Endpoint not found', 404);
  } catch (err) {
    console.error('❌ MOCK API DELETE Error:', err);
    return error('Internal server error', 500);
  }
}
