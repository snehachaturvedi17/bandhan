/**
 * Bandhan AI - Mock Match Service
 * Simulates matching functionality for demo mode
 *
 * Features:
 * - Pre-defined demo profiles
 * - Compatibility scoring
 * - Mutual match logic
 * - Realistic delays
 */

import { apiDelay, matchDelay } from './delay';
import { DEMO_USERS, type DemoUserProfile, type DemoMatch } from '@/data/demo-users';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface MockMatch extends DemoMatch {
  isNew?: boolean;
}

export interface MatchFilters {
  ageMin?: number;
  ageMax?: number;
  location?: string;
  intent?: string;
  verificationLevel?: 'bronze' | 'silver' | 'gold';
}

export interface LikeResult {
  success: boolean;
  isMatch: boolean;
  match?: MockMatch;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

// Generate additional demo profiles for matches feed
const ADDITIONAL_PROFILES: DemoUserProfile[] = [
  {
    id: 'demo_kavya',
    uid: 'mock_kavya_uid',
    name: 'Kavya Nair',
    age: 25,
    phone: '+919876543216',
    city: 'Kochi',
    state: 'Kerala',
    education: 'B.Tech, NIT Calicut',
    occupation: 'Software Engineer at Infosys',
    annualIncome: 1500000,
    familyType: 'nuclear',
    fatherOccupation: 'Engineer',
    motherOccupation: 'Teacher',
    siblings: '1 elder brother (married)',
    diet: 'non-vegetarian',
    smoking: 'never',
    drinking: 'never',
    intent: 'serious-relationship',
    bio: 'Tech enthusiast who loves reading and traveling. Looking for someone who values family and has ambition in life.',
    height: "5'4\"",
    religion: 'Hindu',
    caste: 'Nair',
    gotra: 'Not applicable',
    manglik: false,
    motherTongue: 'Malayalam',
    isVerified: true,
    isPremium: false,
    verificationLevel: 'silver',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Kavya+Nair&background=ec4899&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Kavya+Nair&background=ec4899&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 25, max: 32 },
      location: ['Kochi', 'Bangalore', 'Chennai', 'Mumbai'],
    },
  },
  {
    id: 'demo_aditya',
    uid: 'mock_aditya_uid',
    name: 'Aditya Kumar',
    age: 29,
    phone: '+919876543217',
    city: 'Bangalore',
    state: 'Karnataka',
    education: 'MBA, IIM Bangalore',
    occupation: 'Product Manager at Flipkart',
    annualIncome: 3000000,
    familyType: 'joint',
    fatherOccupation: 'Business Owner',
    motherOccupation: 'Homemaker',
    siblings: '1 younger sister (studying)',
    diet: 'vegetarian',
    smoking: 'never',
    drinking: 'occasionally',
    intent: 'marriage-soon',
    bio: 'Ambitious professional with strong family values. Enjoy cricket, music, and exploring new places. Looking for a life partner who is understanding and supportive.',
    height: "5'10\"",
    religion: 'Hindu',
    caste: 'Kayastha',
    gotra: 'Bharadwaj',
    manglik: false,
    motherTongue: 'Hindi',
    isVerified: true,
    isPremium: true,
    verificationLevel: 'gold',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Aditya+Kumar&background=3b82f6&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Aditya+Kumar&background=3b82f6&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 24, max: 28 },
      location: ['Bangalore', 'Mumbai', 'Delhi', 'Pune'],
    },
  },
  {
    id: 'demo_meera',
    uid: 'mock_meera_uid',
    name: 'Meera Iyer',
    age: 26,
    phone: '+919876543218',
    city: 'Chennai',
    state: 'Tamil Nadu',
    education: 'CA, ICAI',
    occupation: 'Chartered Accountant at Deloitte',
    annualIncome: 2200000,
    familyType: 'nuclear',
    fatherOccupation: 'Bank Manager',
    motherOccupation: 'Professor',
    siblings: 'Only child',
    diet: 'vegetarian',
    smoking: 'never',
    drinking: 'never',
    intent: 'marriage-soon',
    bio: 'Finance professional with a passion for classical music and dance. Looking for someone who respects traditions and has modern outlook.',
    height: "5'3\"",
    religion: 'Hindu',
    caste: 'Iyer',
    gotra: 'Bharadwaj',
    manglik: false,
    motherTongue: 'Tamil',
    isVerified: true,
    isPremium: false,
    verificationLevel: 'bronze',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Meera+Iyer&background=8b5cf6&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Meera+Iyer&background=8b5cf6&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 26, max: 32 },
      location: ['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai'],
    },
  },
];

// All available demo profiles
const ALL_PROFILES = [...DEMO_USERS, ...ADDITIONAL_PROFILES];

// Generate compatibility score (70-95%)
function generateCompatibility(): number {
  return Math.floor(Math.random() * 26) + 70;
}

// Check if match is mutual (for demo, 60% chance)
function isMutualMatch(): boolean {
  return Math.random() < 0.6;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Match Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get daily matches with filters
 */
export async function getMatches(filters?: MatchFilters): Promise<MockMatch[]> {
  console.log('🔍 MOCK: getMatches called', filters);

  await apiDelay();

  let matches = ALL_PROFILES.map((profile) => ({
    id: `match_${profile.id}`,
    profile,
    compatibility: generateCompatibility(),
    matchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending' as const,
    likedByMe: false,
    likedByThem: Math.random() < 0.5,
    isNew: Math.random() < 0.3,
  }));

  // Apply filters
  if (filters) {
    if (filters.ageMin) {
      matches = matches.filter((m) => m.profile.age >= filters.ageMin!);
    }
    if (filters.ageMax) {
      matches = matches.filter((m) => m.profile.age <= filters.ageMax!);
    }
    if (filters.location) {
      matches = matches.filter((m) =>
        m.profile.city.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    if (filters.intent) {
      matches = matches.filter((m) => m.profile.intent === filters.intent);
    }
    if (filters.verificationLevel) {
      matches = matches.filter((m) => m.profile.verificationLevel === filters.verificationLevel);
    }
  }

  // Sort by compatibility
  matches.sort((a, b) => b.compatibility - a.compatibility);

  // Return top 10
  return matches.slice(0, 10);
}

/**
 * Like a user
 */
export async function likeUser(userId: string): Promise<LikeResult> {
  console.log('❤️ MOCK: likeUser called', userId);

  await matchDelay();

  const profile = ALL_PROFILES.find((p) => p.id === userId);

  if (!profile) {
    return {
      success: false,
      isMatch: false,
      message: 'Profile not found',
    };
  }

  // Simulate mutual match logic
  const mutual = isMutualMatch();

  if (mutual) {
    const match: MockMatch = {
      id: `match_${userId}_${Date.now()}`,
      profile,
      compatibility: generateCompatibility(),
      matchedAt: new Date().toISOString(),
      status: 'accepted',
      likedByMe: true,
      likedByThem: true,
      isNew: true,
    };

    console.log('🎉 MOCK: Mutual match!', profile.name);

    return {
      success: true,
      isMatch: true,
      match,
      message: `It's a match with ${profile.name}!`,
    };
  }

  console.log('📤 MOCK: Like sent (pending)', profile.name);

  return {
    success: true,
    isMatch: false,
    message: 'Like sent! We\'ll notify you if they like you back.',
  };
}

/**
 * Pass/reject a user
 */
export async function passUser(userId: string): Promise<{ success: boolean }> {
  console.log('❌ MOCK: passUser called', userId);

  await apiDelay();

  return { success: true };
}

/**
 * Get match details
 */
export async function getMatchDetails(matchId: string): Promise<MockMatch | null> {
  console.log('📋 MOCK: getMatchDetails called', matchId);

  await apiDelay();

  // Find match by profile ID
  const profileId = matchId.replace('match_', '');
  const profile = ALL_PROFILES.find((p) => p.id === profileId);

  if (!profile) {
    return null;
  }

  return {
    id: matchId,
    profile,
    compatibility: generateCompatibility(),
    matchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    likedByMe: false,
    likedByThem: true,
  };
}

/**
 * Undo last like (premium feature)
 */
export async function undoLike(): Promise<{ success: boolean; message: string }> {
  console.log('↩️ MOCK: undoLike called');

  await apiDelay();

  return {
    success: true,
    message: 'Like undone successfully',
  };
}

/**
 * Get compatibility report
 */
export async function getCompatibilityReport(matchId: string): Promise<{
  score: number;
  factors: Record<string, number>;
}> {
  console.log('📊 MOCK: getCompatibilityReport called', matchId);

  await apiDelay();

  return {
    score: generateCompatibility(),
    factors: {
      values: Math.floor(Math.random() * 30) + 70,
      lifestyle: Math.floor(Math.random() * 30) + 70,
      career: Math.floor(Math.random() * 30) + 70,
      family: Math.floor(Math.random() * 30) + 70,
      communication: Math.floor(Math.random() * 30) + 70,
    },
  };
}

/**
 * Get daily limit status
 */
export async function getDailyLimit(): Promise<{
  used: number;
  total: number;
  resetsAt: string;
}> {
  console.log('📊 MOCK: getDailyLimit called');

  await apiDelay();

  // Simulate some usage
  const used = Math.floor(Math.random() * 3);
  const resetsAt = new Date();
  resetsAt.setHours(24, 0, 0, 0);

  return {
    used,
    total: 5,
    resetsAt: resetsAt.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Mock Match Service
// ─────────────────────────────────────────────────────────────────────────────
export const mockMatchService = {
  getMatches,
  likeUser,
  passUser,
  getMatchDetails,
  undoLike,
  getCompatibilityReport,
  getDailyLimit,
};

export default mockMatchService;
