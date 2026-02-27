/**
 * Bandhan AI - Mock Chat Service
 * Simulates chat functionality for demo mode
 *
 * Features:
 * - Pre-created conversations
 * - Realistic message history
 * - Voice note simulation
 * - Photo upload simulation
 * - Read receipts
 * - Typing indicators
 */

import { messageDelay, uploadDelay, typingDelay } from './delay';
import {
  DEMO_CONVERSATIONS,
  getConversationById,
  getConversationByParticipantId,
  type DemoConversation,
  type DemoMessage,
} from '@/data/demo-conversations';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface ConversationSummary {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  isOnline: boolean;
  lastMessage?: DemoMessage;
  unreadCount: number;
  matchedAt: string;
}

export interface SendMessageResult {
  success: boolean;
  message?: DemoMessage;
  error?: string;
}

export interface VoiceNoteUploadResult {
  success: boolean;
  message?: DemoMessage;
  progress?: number;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-Memory State (for demo)
// ─────────────────────────────────────────────────────────────────────────────
const conversationsState = new Map<string, DemoConversation>(
  DEMO_CONVERSATIONS.map((c) => [c.id, { ...c, messages: [...c.messages] }])
);

// ─────────────────────────────────────────────────────────────────────────────
// Mock Chat Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all conversations
 */
export async function getConversations(): Promise<ConversationSummary[]> {
  console.log('💬 MOCK: getConversations called');

  await messageDelay();

  return Array.from(conversationsState.values()).map((conv) => ({
    id: conv.id,
    participantId: conv.participantId,
    participantName: conv.participantName,
    participantAvatar: conv.participantAvatar,
    verificationLevel: conv.verificationLevel,
    isOnline: conv.isOnline,
    lastMessage: conv.lastMessage,
    unreadCount: conv.unreadCount,
    matchedAt: conv.matchedAt,
  }));
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<DemoMessage[]> {
  console.log('📋 MOCK: getMessages called', conversationId, { limit, before });

  await messageDelay();

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    console.warn('⚠️ MOCK: Conversation not found', conversationId);
    return [];
  }

  let messages = [...conversation.messages];

  // Filter by "before" timestamp if provided
  if (before) {
    messages = messages.filter((m) => m.timestamp < before);
  }

  // Limit results
  messages = messages.slice(-limit);

  return messages;
}

/**
 * Send a text message
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<SendMessageResult> {
  console.log('📤 MOCK: sendMessage called', conversationId, content);

  // Simulate typing delay based on message length
  await typingDelay(content.length);

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    return {
      success: false,
      error: 'Conversation not found',
    };
  }

  // Create new message
  const newMessage: DemoMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    senderId: 'current_user',
    type: 'text',
    content,
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  // Add to conversation
  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage;
  conversation.unreadCount = 0;

  // Simulate delivery delay
  await messageDelay();

  console.log('✅ MOCK: Message sent', newMessage.id);

  return {
    success: true,
    message: newMessage,
  };
}

/**
 * Upload and send a voice note
 */
export async function uploadVoiceNote(
  conversationId: string,
  audioBlob: Blob,
  duration: number
): Promise<VoiceNoteUploadResult> {
  console.log('🎤 MOCK: uploadVoiceNote called', conversationId, {
    size: audioBlob.size,
    duration,
  });

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    return {
      success: false,
      error: 'Conversation not found',
    };
  }

  // Simulate upload progress
  let progress = 0;
  await uploadDelay((p) => {
    progress = p;
    console.log(`📊 MOCK: Upload progress: ${p}%`);
  }, 2000);

  // Create voice message
  const newMessage: DemoMessage = {
    id: `msg_voice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    senderId: 'current_user',
    type: 'voice',
    content: `Voice note (${duration}s)`,
    timestamp: new Date().toISOString(),
    isRead: false,
    duration,
  };

  // Add to conversation
  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage;
  conversation.unreadCount = 0;

  console.log('✅ MOCK: Voice note uploaded', newMessage.id);

  return {
    success: true,
    message: newMessage,
    progress: 100,
  };
}

/**
 * Upload and send a photo
 */
export async function uploadPhoto(
  conversationId: string,
  imageBlob: Blob
): Promise<SendMessageResult> {
  console.log('📷 MOCK: uploadPhoto called', conversationId, {
    size: imageBlob.size,
  });

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    return {
      success: false,
      error: 'Conversation not found',
    };
  }

  // Simulate upload
  await uploadDelay(() => {}, 1500);

  // Create photo message (blurred by default for privacy)
  const newMessage: DemoMessage = {
    id: `msg_photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    senderId: 'current_user',
    type: 'photo',
    content: '📷 Photo',
    timestamp: new Date().toISOString(),
    isRead: false,
    isBlurred: true,
  };

  // Add to conversation
  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage;
  conversation.unreadCount = 0;

  console.log('✅ MOCK: Photo uploaded', newMessage.id);

  return {
    success: true,
    message: newMessage,
  };
}

/**
 * Mark messages as read
 */
export async function markAsRead(conversationId: string): Promise<{
  success: boolean;
}> {
  console.log('✅ MOCK: markAsRead called', conversationId);

  await messageDelay();

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    return { success: false };
  }

  // Mark all messages from other user as read
  conversation.messages.forEach((msg) => {
    if (msg.senderId !== 'current_user') {
      msg.isRead = true;
    }
  });

  conversation.unreadCount = 0;

  return { success: true };
}

/**
 * Send interest
 */
export async function sendInterest(
  conversationId: string
): Promise<SendMessageResult> {
  console.log('❤️ MOCK: sendInterest called', conversationId);

  await messageDelay();

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    return {
      success: false,
      error: 'Conversation not found',
    };
  }

  // Create interest message
  const newMessage: DemoMessage = {
    id: `msg_interest_${Date.now()}`,
    senderId: 'current_user',
    type: 'interest',
    content: '❤️ Sent you an interest',
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  // Add to conversation
  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage;

  console.log('✅ MOCK: Interest sent');

  return {
    success: true,
    message: newMessage,
  };
}

/**
 * Block user in conversation
 */
export async function blockUser(
  conversationId: string
): Promise<{ success: boolean }> {
  console.log('🚫 MOCK: blockUser called', conversationId);

  await messageDelay();

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    return { success: false };
  }

  // Remove conversation from state
  conversationsState.delete(conversationId);

  console.log('✅ MOCK: User blocked');

  return { success: true };
}

/**
 * Report conversation
 */
export async function reportConversation(
  conversationId: string,
  reason: string
): Promise<{ success: boolean }> {
  console.log('🚨 MOCK: reportConversation called', conversationId, reason);

  await messageDelay();

  // In real app, would send to backend
  console.log('✅ MOCK: Report submitted');

  return { success: true };
}

/**
 * Delete message
 */
export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<{ success: boolean }> {
  console.log('🗑️ MOCK: deleteMessage called', conversationId, messageId);

  await messageDelay();

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    return { success: false };
  }

  // Remove message
  const index = conversation.messages.findIndex((m) => m.id === messageId);

  if (index === -1) {
    return { success: false };
  }

  conversation.messages.splice(index, 1);

  console.log('✅ MOCK: Message deleted');

  return { success: true };
}

/**
 * Get conversation details
 */
export async function getConversationDetails(
  conversationId: string
): Promise<DemoConversation | null> {
  console.log('📋 MOCK: getConversationDetails called', conversationId);

  await messageDelay();

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    return null;
  }

  // Mark as read when viewing
  conversation.unreadCount = 0;
  conversation.messages.forEach((msg) => {
    if (msg.senderId !== 'current_user') {
      msg.isRead = true;
    }
  });

  return { ...conversation };
}

/**
 * Simulate incoming message (for demo)
 */
export async function simulateIncomingMessage(
  conversationId: string,
  content: string
): Promise<DemoMessage> {
  console.log('📥 MOCK: simulateIncomingMessage called', conversationId);

  const conversation = conversationsState.get(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Simulate typing
  await typingDelay(content.length);

  const newMessage: DemoMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    senderId: conversation.participantId,
    type: 'text',
    content,
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage;
  conversation.unreadCount += 1;
  conversation.isOnline = true;

  // Set offline after a delay
  setTimeout(() => {
    if (conversationsState.has(conversationId)) {
      conversationsState.get(conversationId)!.isOnline = false;
    }
  }, 5000);

  return newMessage;
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Mock Chat Service
// ─────────────────────────────────────────────────────────────────────────────
export const mockChatService = {
  getConversations,
  getMessages,
  sendMessage,
  uploadVoiceNote,
  uploadPhoto,
  markAsRead,
  sendInterest,
  blockUser,
  reportConversation,
  deleteMessage,
  getConversationDetails,
  simulateIncomingMessage,
};

export default mockChatService;
