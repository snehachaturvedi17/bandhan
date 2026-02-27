/**
 * Bandhan AI - Demo Conversations Data
 * Pre-written conversations for demo mode
 *
 * Cultural Notes:
 * - Respectful, family-oriented discussions
 * - No explicit/sexual content
 * - Voice notes <15 seconds (cultural norm)
 * - Mix of English and Hindi messages
 * - Focus on marriage/relationship compatibility
 */

import { DEMO_USERS } from './demo-users';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type MessageType = 'text' | 'photo' | 'voice' | 'interest';

export interface DemoMessage {
  id: string;
  senderId: string;
  type: MessageType;
  content: string;
  timestamp: string;
  isRead: boolean;
  duration?: number; // for voice notes (seconds)
  isBlurred?: boolean; // for photos
}

export interface DemoConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  isOnline: boolean;
  lastMessage?: DemoMessage;
  unreadCount: number;
  matchedAt: string;
  messages: DemoMessage[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate timestamp (relative to now)
 */
function timestamp(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

/**
 * Create text message
 */
function textMessage(
  senderId: string,
  content: string,
  minutesAgo: number,
  isRead = true
): DemoMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    senderId,
    type: 'text',
    content,
    timestamp: timestamp(minutesAgo),
    isRead,
  };
}

/**
 * Create voice note message
 */
function voiceMessage(
  senderId: string,
  duration: number,
  minutesAgo: number,
  isRead = true
): DemoMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    senderId,
    type: 'voice',
    content: `Voice note (${duration}s)`,
    timestamp: timestamp(minutesAgo),
    isRead,
    duration,
  };
}

/**
 * Create photo message
 */
function photoMessage(
  senderId: string,
  minutesAgo: number,
  isRead = true,
  isBlurred = false
): DemoMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    senderId,
    type: 'photo',
    content: '📷 Photo',
    timestamp: timestamp(minutesAgo),
    isRead,
    isBlurred,
  };
}

/**
 * Create interest message
 */
function interestMessage(
  senderId: string,
  minutesAgo: number
): DemoMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    senderId,
    type: 'interest',
    content: '❤️ Sent you an interest',
    timestamp: timestamp(minutesAgo),
    isRead: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Conversations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Conversation 1: Priya ↔ Current User (Marriage-focused)
 * Culturally appropriate, family-oriented discussion
 */
export const CONVERSATION_PRIYA: DemoConversation = {
  id: 'conv_priya',
  participantId: DEMO_USERS[0].id,
  participantName: DEMO_USERS[0].name,
  participantAvatar: DEMO_USERS[0].avatarUrl,
  verificationLevel: DEMO_USERS[0].verificationLevel,
  isOnline: true,
  unreadCount: 2,
  matchedAt: timestamp(2 * 24 * 60), // 2 days ago
  messages: [
    interestMessage(DEMO_USERS[0].id, 2 * 24 * 60),
    textMessage(
      DEMO_USERS[0].id,
      'Hi! I saw your profile and felt we might have good compatibility. Would love to know more about you! 😊',
      2 * 24 * 60 - 30
    ),
    textMessage(
      'current_user',
      'Hi Priya! Thank you for reaching out. I\'d be happy to get to know you better. What would you like to know?',
      2 * 24 * 60 - 25,
      false
    ),
    textMessage(
      DEMO_USERS[0].id,
      'Great! So, I saw you\'re working in tech. I\'m a Product Manager at Google. How do you balance work and family life?',
      2 * 24 * 60 - 20
    ),
    textMessage(
      'current_user',
      'That\'s a great question! I believe family always comes first. Work is important, but I make sure to spend quality time with family on weekends.',
      2 * 24 * 60 - 15,
      false
    ),
    voiceMessage(DEMO_USERS[0].id, 12, 2 * 24 * 60 - 10),
    textMessage(
      DEMO_USERS[0].id,
      'I completely agree! Family values are very important to me too. My parents live with me in Mumbai. What about your family?',
      2 * 24 * 60 - 8
    ),
    textMessage(
      'current_user',
      'That\'s wonderful! I live with my parents too. We\'re a close-knit family. I saw you\'re vegetarian - that\'s great, I am too!',
      2 * 24 * 60 - 5,
      false
    ),
    textMessage(
      DEMO_USERS[0].id,
      'Yes! 🙏 Food habits are important for compatibility. By the way, I love traveling. Have you been to any interesting places recently?',
      2 * 24 * 60 - 3
    ),
    textMessage(
      'current_user',
      'I recently went to Rajasthan - Jaipur and Udaipur. The culture and architecture were amazing! Do you like traveling?',
      2 * 24 * 60 - 1,
      false
    ),
    textMessage(
      DEMO_USERS[0].id,
      'Oh I love Rajasthan! 😍 Yes, I enjoy traveling a lot. Maybe we can share more about our favorite destinations. Would you be free for a call this weekend?',
      30,
      false
    ),
    textMessage(
      DEMO_USERS[0].id,
      'Also, my parents would love to meet you if things progress well. Family approval is important to me. 🙏',
      28,
      false
    ),
  ],
  lastMessage: {
    id: 'msg_last_priya',
    senderId: DEMO_USERS[0].id,
    type: 'text',
    content: 'Also, my parents would love to meet you if things progress well. Family approval is important to me. 🙏',
    timestamp: timestamp(28),
    isRead: false,
  },
};

/**
 * Conversation 2: Rohan ↔ Current User (Serious relationship)
 * Getting to know each other, respectful conversation
 */
export const CONVERSATION_ROHAN: DemoConversation = {
  id: 'conv_rohan',
  participantId: DEMO_USERS[1].id,
  participantName: DEMO_USERS[1].name,
  participantAvatar: DEMO_USERS[1].avatarUrl,
  verificationLevel: DEMO_USERS[1].verificationLevel,
  isOnline: false,
  unreadCount: 0,
  matchedAt: timestamp(5 * 24 * 60), // 5 days ago
  messages: [
    interestMessage(DEMO_USERS[1].id, 5 * 24 * 60),
    textMessage(
      'current_user',
      'Hi Rohan! Thanks for the interest. Your profile looks great! 👋',
      5 * 24 * 60 - 60
    ),
    textMessage(
      DEMO_USERS[1].id,
      'Thank you! 😊 I\'m glad you reached out. I saw you\'re into reading - what kind of books do you enjoy?',
      5 * 24 * 60 - 55
    ),
    textMessage(
      'current_user',
      'I love reading spiritual books and biographies. Currently reading "The Power of Now". How about you?',
      5 * 24 * 60 - 50,
      true
    ),
    voiceMessage(DEMO_USERS[1].id, 15, 5 * 24 * 60 - 45),
    textMessage(
      DEMO_USERS[1].id,
      'That\'s awesome! I enjoy reading about technology and personal development. Also a big fan of cricket! Do you follow sports?',
      5 * 24 * 60 - 40
    ),
    textMessage(
      'current_user',
      'Yes! I love watching cricket matches. Especially during IPL season. Which team do you support?',
      5 * 24 * 60 - 35,
      true
    ),
    textMessage(
      DEMO_USERS[1].id,
      'Mumbai Indians! 🏏 What about you? Also, I noticed you\'re into music. What kind of music do you listen to?',
      5 * 24 * 60 - 30
    ),
    photoMessage('current_user', 5 * 24 * 60 - 25, true, false),
    textMessage(
      'current_user',
      'Here\'s a photo from my recent trip to Goa! I enjoy all kinds of music - classical, Bollywood, and some English too.',
      5 * 24 * 60 - 25,
      true
    ),
    textMessage(
      DEMO_USERS[1].id,
      'Beautiful photo! 🌊 Goa is amazing. I\'m more into Bollywood and classical. My mom is a classical dancer, so grew up listening to it.',
      5 * 24 * 60 - 20
    ),
    textMessage(
      'current_user',
      'That\'s wonderful! Classical arts are such a rich part of our culture. Does your family live in Delhi?',
      5 * 24 * 60 - 15,
      true
    ),
    textMessage(
      DEMO_USERS[1].id,
      'Yes, we\'re in Delhi. Joint family - parents, grandparents, and my sister\'s family. It\'s lively! How about yours?',
      5 * 24 * 60 - 10
    ),
  ],
  lastMessage: {
    id: 'msg_last_rohan',
    senderId: DEMO_USERS[1].id,
    type: 'text',
    content: 'Yes, we\'re in Delhi. Joint family - parents, grandparents, and my sister\'s family. It\'s lively! How about yours?',
    timestamp: timestamp(10),
    isRead: true,
  },
};

/**
 * Conversation 3: Anjali ↔ Current User (Friendship first)
 * Casual, friendly conversation
 */
export const CONVERSATION_ANJALI: DemoConversation = {
  id: 'conv_anjali',
  participantId: DEMO_USERS[2].id,
  participantName: DEMO_USERS[2].name,
  participantAvatar: DEMO_USERS[2].avatarUrl,
  verificationLevel: DEMO_USERS[2].verificationLevel,
  isOnline: true,
  unreadCount: 1,
  matchedAt: timestamp(1 * 24 * 60), // 1 day ago
  messages: [
    interestMessage(DEMO_USERS[2].id, 1 * 24 * 60),
    textMessage(
      DEMO_USERS[2].id,
      'Hey! 👋 I saw we both love art and design. Would be great to connect as friends first!',
      1 * 24 * 60 - 120
    ),
    textMessage(
      'current_user',
      'Hi Anjali! Absolutely, I\'d love that. I saw you\'re a UX Designer - that\'s such a creative field!',
      1 * 24 * 60 - 115,
      true
    ),
    textMessage(
      DEMO_USERS[2].id,
      'Yes! I love my job. Working at Flipkart has been amazing. What do you do?',
      1 * 24 * 60 - 110
    ),
    voiceMessage('current_user', 10, 1 * 24 * 60 - 105, true),
    textMessage(
      DEMO_USERS[2].id,
      'Nice! Tech industry is great. So, besides work, what do you enjoy doing in your free time?',
      1 * 24 * 60 - 100
    ),
    textMessage(
      'current_user',
      'I enjoy painting, hiking, and trying out new cafes. Bangalore has such a great cafe culture!',
      1 * 24 * 60 - 95,
      true
    ),
    textMessage(
      DEMO_USERS[2].id,
      'Oh totally! 🎨 I love exploring new cafes too. Have you been to Blue Tokai in Indiranagar?',
      1 * 24 * 60 - 90
    ),
    textMessage(
      'current_user',
      'Yes! Love their coffee. We should exchange more recommendations. Are you from Bangalore originally?',
      1 * 24 * 60 - 85,
      true
    ),
    textMessage(
      DEMO_USERS[2].id,
      'Actually I\'m from Chennai originally. Moved to Bangalore for work 3 years ago. Missing the Chennai filter coffee! ☕',
      1 * 24 * 60 - 80
    ),
    textMessage(
      DEMO_USERS[2].id,
      'Would love to hear about your favorite spots in Bangalore. Maybe we can grab coffee sometime? No pressure, just as friends! 😊',
      60,
      false
    ),
  ],
  lastMessage: {
    id: 'msg_last_anjali',
    senderId: DEMO_USERS[2].id,
    type: 'text',
    content: 'Would love to hear about your favorite spots in Bangalore. Maybe we can grab coffee sometime? No pressure, just as friends! 😊',
    timestamp: timestamp(60),
    isRead: false,
  },
};

/**
 * Conversation 4: Vikram ↔ Current User (Marriage intent)
 * Traditional, family-oriented conversation with Hindi messages
 */
export const CONVERSATION_VIKRAM: DemoConversation = {
  id: 'conv_vikram',
  participantId: DEMO_USERS[3].id,
  participantName: DEMO_USERS[3].name,
  participantAvatar: DEMO_USERS[3].avatarUrl,
  verificationLevel: DEMO_USERS[3].verificationLevel,
  isOnline: false,
  unreadCount: 0,
  matchedAt: timestamp(3 * 24 * 60), // 3 days ago
  messages: [
    interestMessage(DEMO_USERS[3].id, 3 * 24 * 60),
    textMessage(
      DEMO_USERS[3].id,
      'नमस्ते! 🙏 I saw your profile and was impressed by your values. Would love to connect.',
      3 * 24 * 60 - 180
    ),
    textMessage(
      'current_user',
      'नमस्ते Vikram! Thank you for the kind words. I\'d be happy to get to know you better.',
      3 * 24 * 60 - 175,
      true
    ),
    textMessage(
      DEMO_USERS[3].id,
      'Great! I saw you\'re well-educated and family-oriented. These qualities are very important to me. What are you looking for?',
      3 * 24 * 60 - 170
    ),
    textMessage(
      'current_user',
      'I\'m looking for a serious relationship that can lead to marriage. Family values are very important to me too.',
      3 * 24 * 60 - 165,
      true
    ),
    voiceMessage(DEMO_USERS[3].id, 14, 3 * 24 * 60 - 160),
    textMessage(
      DEMO_USERS[3].id,
      'That\'s wonderful to hear! 🙏 I\'m also looking for marriage. My family is very traditional but modern in thinking.',
      3 * 24 * 60 - 155
    ),
    textMessage(
      'current_user',
      'That\'s great! I saw you\'re a Data Scientist - that\'s impressive! How do you like working at Amazon?',
      3 * 24 * 60 - 150,
      true
    ),
    textMessage(
      DEMO_USERS[3].id,
      'Thank you! It\'s challenging but rewarding. Work-life balance is good. I make time for family and my hobbies.',
      3 * 24 * 60 - 145
    ),
    textMessage(
      'current_user',
      'What are your hobbies? I saw you mentioned Carnatic music - that\'s wonderful!',
      3 * 24 * 60 - 140,
      true
    ),
    textMessage(
      DEMO_USERS[3].id,
      'Yes! 🎵 I\'ve been learning Carnatic vocal for 10 years. Also enjoy cooking - I make great sambar! 😄 What about you?',
      3 * 24 * 60 - 135
    ),
    textMessage(
      'current_user',
      'That\'s amazing! I love music too. And you cook? That\'s rare! I enjoy reading and yoga.',
      3 * 24 * 60 - 130,
      true
    ),
    textMessage(
      DEMO_USERS[3].id,
      'Yoga is great! 🧘‍♂️ I think we have good compatibility. Would you be comfortable with a family meeting if things progress well?',
      3 * 24 * 60 - 125
    ),
  ],
  lastMessage: {
    id: 'msg_last_vikram',
    senderId: DEMO_USERS[3].id,
    type: 'text',
    content: 'Yoga is great! 🧘‍♂️ I think we have good compatibility. Would you be comfortable with a family meeting if things progress well?',
    timestamp: timestamp(125),
    isRead: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Export All Conversations
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_CONVERSATIONS: DemoConversation[] = [
  CONVERSATION_PRIYA,
  CONVERSATION_ROHAN,
  CONVERSATION_ANJALI,
  CONVERSATION_VIKRAM,
];

/**
 * Get conversation by ID
 */
export function getConversationById(id: string): DemoConversation | undefined {
  return DEMO_CONVERSATIONS.find((c) => c.id === id);
}

/**
 * Get conversation by participant ID
 */
export function getConversationByParticipantId(
  participantId: string
): DemoConversation | undefined {
  return DEMO_CONVERSATIONS.find((c) => c.participantId === participantId);
}

/**
 * Get all conversations
 */
export function getAllConversations(): DemoConversation[] {
  return DEMO_CONVERSATIONS;
}

export default DEMO_CONVERSATIONS;
