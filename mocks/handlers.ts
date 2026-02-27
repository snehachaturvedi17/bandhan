/**
 * Bandhan AI - Mock Service Worker (MSW) Handlers
 * API mocking for demo mode
 *
 * Setup:
 * 1. Install MSW: npm install msw --save-dev
 * 2. Add to next.config.js webpack config
 * 3. Start mock server: npx msw init public/
 */

import { http, HttpResponse, delay } from 'msw';

// Mock data imports
import { DEMO_USERS } from '@/data/demo-users';
import { DEMO_CONVERSATIONS } from '@/data/demo-conversations';
import { apiDelay, matchDelay } from '@/lib/delay';

// ─────────────────────────────────────────────────────────────────────────────
// API Base URL
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Handlers
// ─────────────────────────────────────────────────────────────────────────────
export const authHandlers = [
  // Send OTP
  http.post(`${API_BASE}/auth/send-otp`, async () => {
    await apiDelay();
    console.log('📱 MSW: POST /auth/send-otp');

    return HttpResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber: '+91XXXXXXXXXX',
        otpLength: 6,
        expiresInSeconds: 300,
      },
    });
  }),

  // Verify OTP
  http.post(`${API_BASE}/auth/verify-otp`, async () => {
    await matchDelay();
    console.log('🔐 MSW: POST /auth/verify-otp');

    return HttpResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: 'demo_user_1',
          uid: 'mock_uid_1',
          name: 'Demo User',
          phone: '+919876543210',
          isVerified: true,
          isPremium: false,
          verificationLevel: 'bronze',
          demoMode: true,
        },
        token: 'mock_jwt_token_' + Date.now(),
      },
    });
  }),

  // Resend OTP
  http.post(`${API_BASE}/auth/resend-otp`, async () => {
    await apiDelay();
    console.log('🔄 MSW: POST /auth/resend-otp');

    return HttpResponse.json({
      success: true,
      message: 'OTP resent successfully',
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Match Handlers
// ─────────────────────────────────────────────────────────────────────────────
export const matchHandlers = [
  // Get matches
  http.get(`${API_BASE}/matches`, async ({ request }) => {
    await apiDelay();
    console.log('🔍 MSW: GET /matches');

    const url = new URL(request.url);
    const filters = Object.fromEntries(url.searchParams);

    // Filter demo users
    let matches = DEMO_USERS.map((profile) => ({
      id: `match_${profile.id}`,
      profile,
      compatibility: Math.floor(Math.random() * 26) + 70,
      matchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
      likedByMe: false,
      likedByThem: Math.random() < 0.5,
    }));

    // Apply filters
    if (filters.ageMin) {
      matches = matches.filter((m) => m.profile.age >= parseInt(filters.ageMin));
    }
    if (filters.ageMax) {
      matches = matches.filter((m) => m.profile.age <= parseInt(filters.ageMax));
    }
    if (filters.location) {
      matches = matches.filter((m) =>
        m.profile.city.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sort by compatibility
    matches.sort((a, b) => b.compatibility - a.compatibility);

    return HttpResponse.json({
      success: true,
      data: matches.slice(0, 10),
      meta: {
        total: matches.length,
        limit: 10,
        offset: 0,
      },
    });
  }),

  // Like user
  http.post(`${API_BASE}/matches/like/:userId`, async ({ params }) => {
    await matchDelay();
    console.log('❤️ MSW: POST /matches/like/:userId', params.userId);

    const profile = DEMO_USERS.find((p) => p.id === params.userId);

    if (!profile) {
      return HttpResponse.json({
        success: false,
        error: 'Profile not found',
      }, { status: 404 });
    }

    // 60% chance of mutual match
    const isMatch = Math.random() < 0.6;

    return HttpResponse.json({
      success: true,
      data: {
        isMatch,
        match: isMatch ? {
          id: `match_${params.userId}_${Date.now()}`,
          profile,
          compatibility: Math.floor(Math.random() * 26) + 70,
          matchedAt: new Date().toISOString(),
          status: 'accepted' as const,
          likedByMe: true,
          likedByThem: true,
        } : null,
        message: isMatch
          ? `It's a match with ${profile.name}!`
          : 'Like sent! We\'ll notify you if they like you back.',
      },
    });
  }),

  // Pass user
  http.post(`${API_BASE}/matches/pass/:userId`, async () => {
    await apiDelay();
    console.log('❌ MSW: POST /matches/pass/:userId');

    return HttpResponse.json({
      success: true,
      data: { success: true },
    });
  }),

  // Get match details
  http.get(`${API_BASE}/matches/:matchId`, async ({ params }) => {
    await apiDelay();
    console.log('📋 MSW: GET /matches/:matchId', params.matchId);

    const profileId = (params.matchId as string).replace('match_', '');
    const profile = DEMO_USERS.find((p) => p.id === profileId);

    if (!profile) {
      return HttpResponse.json({
        success: false,
        error: 'Match not found',
      }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: params.matchId,
        profile,
        compatibility: Math.floor(Math.random() * 26) + 70,
        matchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending' as const,
        likedByMe: false,
        likedByThem: true,
      },
    });
  }),

  // Get compatibility report
  http.get(`${API_BASE}/matches/:matchId/compatibility`, async () => {
    await apiDelay();
    console.log('📊 MSW: GET /matches/:matchId/compatibility');

    return HttpResponse.json({
      success: true,
      data: {
        score: Math.floor(Math.random() * 26) + 70,
        factors: {
          values: Math.floor(Math.random() * 30) + 70,
          lifestyle: Math.floor(Math.random() * 30) + 70,
          career: Math.floor(Math.random() * 30) + 70,
          family: Math.floor(Math.random() * 30) + 70,
          communication: Math.floor(Math.random() * 30) + 70,
        },
      },
    });
  }),

  // Get daily limit
  http.get(`${API_BASE}/matches/limit`, async () => {
    await apiDelay();
    console.log('📊 MSW: GET /matches/limit');

    return HttpResponse.json({
      success: true,
      data: {
        used: Math.floor(Math.random() * 3),
        total: 5,
        resetsAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      },
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Chat Handlers
// ─────────────────────────────────────────────────────────────────────────────
export const chatHandlers = [
  // Get conversations
  http.get(`${API_BASE}/chat/conversations`, async () => {
    await apiDelay();
    console.log('💬 MSW: GET /chat/conversations');

    return HttpResponse.json({
      success: true,
      data: DEMO_CONVERSATIONS.map((conv) => ({
        id: conv.id,
        participantId: conv.participantId,
        participantName: conv.participantName,
        participantAvatar: conv.participantAvatar,
        verificationLevel: conv.verificationLevel,
        isOnline: conv.isOnline,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
        matchedAt: conv.matchedAt,
      })),
    });
  }),

  // Get messages
  http.get(`${API_BASE}/chat/conversations/:conversationId/messages`, async ({ params, request }) => {
    await apiDelay();
    console.log('📋 MSW: GET /chat/conversations/:conversationId/messages', params.conversationId);

    const conversation = DEMO_CONVERSATIONS.find((c) => c.id === params.conversationId);

    if (!conversation) {
      return HttpResponse.json({
        success: false,
        error: 'Conversation not found',
      }, { status: 404 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    return HttpResponse.json({
      success: true,
      data: conversation.messages.slice(-limit),
    });
  }),

  // Send message
  http.post(`${API_BASE}/chat/conversations/:conversationId/messages`, async ({ params, request }) => {
    await apiDelay();
    console.log('📤 MSW: POST /chat/conversations/:conversationId/messages', params.conversationId);

    const body = await request.json() as { content: string; type?: string };

    return HttpResponse.json({
      success: true,
      data: {
        id: `msg_${Date.now()}`,
        senderId: 'current_user',
        type: body.type || 'text',
        content: body.content,
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    });
  }),

  // Upload voice note
  http.post(`${API_BASE}/chat/conversations/:conversationId/messages/voice`, async () => {
    await apiDelay();
    console.log('🎤 MSW: POST /chat/conversations/:conversationId/messages/voice');

    return HttpResponse.json({
      success: true,
      data: {
        id: `msg_voice_${Date.now()}`,
        senderId: 'current_user',
        type: 'voice',
        content: 'Voice note',
        timestamp: new Date().toISOString(),
        isRead: false,
        duration: 10,
      },
    });
  }),

  // Upload photo
  http.post(`${API_BASE}/chat/conversations/:conversationId/messages/photo`, async () => {
    await apiDelay();
    console.log('📷 MSW: POST /chat/conversations/:conversationId/messages/photo');

    return HttpResponse.json({
      success: true,
      data: {
        id: `msg_photo_${Date.now()}`,
        senderId: 'current_user',
        type: 'photo',
        content: '📷 Photo',
        timestamp: new Date().toISOString(),
        isRead: false,
        isBlurred: true,
      },
    });
  }),

  // Mark as read
  http.post(`${API_BASE}/chat/conversations/:conversationId/read`, async () => {
    await apiDelay();
    console.log('✅ MSW: POST /chat/conversations/:conversationId/read');

    return HttpResponse.json({
      success: true,
      data: { success: true },
    });
  }),

  // Send interest
  http.post(`${API_BASE}/chat/conversations/:conversationId/interest`, async () => {
    await apiDelay();
    console.log('❤️ MSW: POST /chat/conversations/:conversationId/interest');

    return HttpResponse.json({
      success: true,
      data: {
        id: `msg_interest_${Date.now()}`,
        senderId: 'current_user',
        type: 'interest',
        content: '❤️ Sent you an interest',
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Profile Handlers
// ─────────────────────────────────────────────────────────────────────────────
export const profileHandlers = [
  // Get profile
  http.get(`${API_BASE}/profile`, async () => {
    await apiDelay();
    console.log('👤 MSW: GET /profile');

    return HttpResponse.json({
      success: true,
      data: {
        id: 'current_user',
        name: 'Demo User',
        age: 28,
        phone: '+919876543210',
        isVerified: true,
        isPremium: false,
        verificationLevel: 'bronze',
        demoMode: true,
      },
    });
  }),

  // Update profile
  http.put(`${API_BASE}/profile`, async () => {
    await apiDelay();
    console.log('✏️ MSW: PUT /profile');

    return HttpResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  }),

  // Upload photo
  http.post(`${API_BASE}/profile/photo`, async () => {
    await apiDelay();
    console.log('📷 MSW: POST /profile/photo');

    return HttpResponse.json({
      success: true,
      data: {
        id: `photo_${Date.now()}`,
        url: 'https://ui-avatars.com/api/?name=Demo+User',
        isPrimary: false,
        isBlurred: false,
      },
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Premium Handlers
// ─────────────────────────────────────────────────────────────────────────────
export const premiumHandlers = [
  // Get subscription status
  http.get(`${API_BASE}/subscription`, async () => {
    await apiDelay();
    console.log('💎 MSW: GET /subscription');

    return HttpResponse.json({
      success: true,
      data: {
        plan: 'free',
        expiresAt: null,
        features: [],
      },
    });
  }),

  // Create order
  http.post(`${API_BASE}/subscription/create-order`, async () => {
    await apiDelay();
    console.log('💳 MSW: POST /subscription/create-order');

    return HttpResponse.json({
      success: true,
      data: {
        orderId: `order_${Date.now()}`,
        amount: 49900, // ₹499 in paise
        currency: 'INR',
      },
    });
  }),

  // Verify payment
  http.post(`${API_BASE}/subscription/verify-payment`, async () => {
    await apiDelay();
    console.log('✅ MSW: POST /subscription/verify-payment');

    return HttpResponse.json({
      success: true,
      data: { success: true },
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// Export All Handlers
// ─────────────────────────────────────────────────────────────────────────────
export const handlers = [
  ...authHandlers,
  ...matchHandlers,
  ...chatHandlers,
  ...profileHandlers,
  ...premiumHandlers,
];

export default handlers;
