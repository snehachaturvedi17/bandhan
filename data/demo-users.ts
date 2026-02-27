/**
 * Bandhan AI - Demo User Data
 * Pre-created demo profiles for testing without real accounts
 *
 * Each profile includes:
 * - Basic info (name, age, city)
 * - Life architecture (education, career, family)
 * - Values & personality
 * - Verification level
 * - Photos (placeholder URLs)
 */

import { MockUser } from '@/lib/mock-auth';

// ─────────────────────────────────────────────────────────────────────────────
// Demo User Profiles
// ─────────────────────────────────────────────────────────────────────────────
export interface DemoUserProfile extends MockUser {
  age: number;
  city: string;
  state: string;
  education: string;
  occupation: string;
  annualIncome?: number;
  familyType: 'joint' | 'nuclear';
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;
  diet: 'vegetarian' | 'eggetarian' | 'non-vegetarian' | 'jain' | 'halal';
  smoking: 'never' | 'occasionally' | 'regularly';
  drinking: 'never' | 'occasionally' | 'regularly';
  intent: 'marriage-soon' | 'serious-relationship' | 'friendship' | 'healing';
  bio?: string;
  height: string;
  weight?: string;
  religion?: string;
  caste?: string;
  gotra?: string;
  manglik: boolean;
  motherTongue: string;
  photos: {
    url: string;
    isPrimary: boolean;
  }[];
  preferences: {
    ageRange: { min: number; max: number };
    location: string[];
  };
}

export const DEMO_USERS: DemoUserProfile[] = [
  {
    // ──────────────────────────────────────────────────────────────────────
    // Priya - Mumbai, Marriage Intent
    // ──────────────────────────────────────────────────────────────────────
    id: 'demo_priya',
    uid: 'mock_priya_uid',
    name: 'Priya Sharma',
    age: 26,
    phone: '+919876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
    education: 'MBA, IIM Ahmedabad',
    occupation: 'Product Manager at Google',
    annualIncome: 3500000,
    familyType: 'nuclear',
    fatherOccupation: 'Business Owner',
    motherOccupation: 'Teacher',
    siblings: '1 younger brother (studying)',
    diet: 'vegetarian',
    smoking: 'never',
    drinking: 'occasionally',
    intent: 'marriage-soon',
    bio: 'Ambitious yet family-oriented. Love traveling, reading, and trying new cuisines. Looking for someone who values both career and family equally.',
    height: "5'4\"",
    weight: '55 kg',
    religion: 'Hindu',
    caste: 'Brahmin',
    gotra: 'Bharadwaj',
    manglik: false,
    motherTongue: 'Hindi',
    isVerified: true,
    isPremium: false,
    verificationLevel: 'gold',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=FF9933&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=FF9933&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 26, max: 32 },
      location: ['Mumbai', 'Bangalore', 'Delhi', 'Pune'],
    },
  },

  {
    // ──────────────────────────────────────────────────────────────────────
    // Rohan - Delhi, Serious Relationship
    // ──────────────────────────────────────────────────────────────────────
    id: 'demo_rohan',
    uid: 'mock_rohan_uid',
    name: 'Rohan Verma',
    age: 28,
    phone: '+919876543211',
    city: 'New Delhi',
    state: 'Delhi',
    education: 'B.Tech, IIT Delhi',
    occupation: 'Software Engineer at Microsoft',
    annualIncome: 2800000,
    familyType: 'joint',
    fatherOccupation: 'Government Officer',
    motherOccupation: 'Homemaker',
    siblings: '1 elder sister (married)',
    diet: 'non-vegetarian',
    smoking: 'never',
    drinking: 'occasionally',
    intent: 'serious-relationship',
    bio: 'Tech enthusiast with a passion for music and sports. Believe in traditional values with a modern outlook. Looking for a life partner who is understanding and supportive.',
    height: "5'10\"",
    weight: '75 kg',
    religion: 'Hindu',
    caste: 'Khatri',
    gotra: 'Kashyap',
    manglik: false,
    motherTongue: 'Punjabi',
    isVerified: true,
    isPremium: true,
    verificationLevel: 'silver',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Rohan+Verma&background=6366f1&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Rohan+Verma&background=6366f1&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 24, max: 28 },
      location: ['Delhi', 'Bangalore', 'Mumbai', 'Chandigarh'],
    },
  },

  {
    // ──────────────────────────────────────────────────────────────────────
    // Anjali - Bangalore, Friendship
    // ──────────────────────────────────────────────────────────────────────
    id: 'demo_anjali',
    uid: 'mock_anjali_uid',
    name: 'Anjali Iyer',
    age: 24,
    phone: '+919876543212',
    city: 'Bangalore',
    state: 'Karnataka',
    education: 'B.Des, NID Bangalore',
    occupation: 'UX Designer at Flipkart',
    annualIncome: 1800000,
    familyType: 'nuclear',
    fatherOccupation: 'Bank Manager',
    motherOccupation: 'Doctor',
    siblings: 'Only child',
    diet: 'vegetarian',
    smoking: 'never',
    drinking: 'never',
    intent: 'friendship',
    bio: 'Creative soul who loves art, dance, and exploring new places. Looking for genuine connections and meaningful friendships. Not in a hurry for marriage.',
    height: "5'3\"",
    weight: '50 kg',
    religion: 'Hindu',
    caste: 'Iyer',
    gotra: 'Not applicable',
    manglik: false,
    motherTongue: 'Tamil',
    isVerified: true,
    isPremium: false,
    verificationLevel: 'bronze',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Anjali+Iyer&background=ec4899&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Anjali+Iyer&background=ec4899&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 24, max: 30 },
      location: ['Bangalore', 'Chennai', 'Hyderabad', 'Pune'],
    },
  },

  {
    // ──────────────────────────────────────────────────────────────────────
    // Vikram - Chennai, Marriage Intent
    // ──────────────────────────────────────────────────────────────────────
    id: 'demo_vikram',
    uid: 'mock_vikram_uid',
    name: 'Vikram Krishnan',
    age: 30,
    phone: '+919876543213',
    city: 'Chennai',
    state: 'Tamil Nadu',
    education: 'MS, IIT Madras',
    occupation: 'Data Scientist at Amazon',
    annualIncome: 3200000,
    familyType: 'joint',
    fatherOccupation: 'Retired Professor',
    motherOccupation: 'Classical Dancer',
    siblings: '1 younger brother (working)',
    diet: 'vegetarian',
    smoking: 'never',
    drinking: 'never',
    intent: 'marriage-soon',
    bio: 'Family-oriented person with strong values. Love Carnatic music, cricket, and cooking. Looking for a life partner who shares similar values and interests.',
    height: "5'9\"",
    weight: '72 kg',
    religion: 'Hindu',
    caste: 'Iyengar',
    gotra: 'Bharadwaj',
    manglik: true,
    motherTongue: 'Tamil',
    isVerified: true,
    isPremium: true,
    verificationLevel: 'gold',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Vikram+Krishnan&background=10b981&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Vikram+Krishnan&background=10b981&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 24, max: 28 },
      location: ['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai'],
    },
  },

  {
    // ──────────────────────────────────────────────────────────────────────
    // Sneha - Pune, Healing Space
    // ──────────────────────────────────────────────────────────────────────
    id: 'demo_sneha',
    uid: 'mock_sneha_uid',
    name: 'Sneha Patil',
    age: 27,
    phone: '+919876543214',
    city: 'Pune',
    state: 'Maharashtra',
    education: 'MA Psychology, Savitribai Phule University',
    occupation: 'Counselor',
    annualIncome: 800000,
    familyType: 'nuclear',
    fatherOccupation: 'Social Worker',
    motherOccupation: 'NGO Founder',
    siblings: '1 elder brother (married)',
    diet: 'vegetarian',
    smoking: 'never',
    drinking: 'never',
    intent: 'healing',
    bio: 'Taking time to focus on personal growth and self-discovery. Passionate about mental health awareness and helping others. Looking for genuine connections without pressure.',
    height: "5'5\"",
    weight: '58 kg',
    religion: 'Hindu',
    caste: 'Maratha',
    gotra: 'Not applicable',
    manglik: false,
    motherTongue: 'Marathi',
    isVerified: true,
    isPremium: false,
    verificationLevel: 'silver',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Sneha+Patil&background=8b5cf6&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Sneha+Patil&background=8b5cf6&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 26, max: 32 },
      location: ['Pune', 'Mumbai', 'Bangalore'],
    },
  },

  {
    // ──────────────────────────────────────────────────────────────────────
    // Arjun - Hyderabad, Serious Relationship
    // ──────────────────────────────────────────────────────────────────────
    id: 'demo_arjun',
    uid: 'mock_arjun_uid',
    name: 'Arjun Reddy',
    age: 29,
    phone: '+919876543215',
    city: 'Hyderabad',
    state: 'Telangana',
    education: 'MBBS, Osmania Medical College',
    occupation: 'Doctor at Apollo Hospitals',
    annualIncome: 2500000,
    familyType: 'joint',
    fatherOccupation: 'Retired Doctor',
    motherOccupation: 'Professor',
    siblings: '1 younger sister (studying)',
    diet: 'non-vegetarian',
    smoking: 'never',
    drinking: 'occasionally',
    intent: 'serious-relationship',
    bio: 'Dedicated medical professional with a compassionate heart. Enjoy reading, traveling, and spending time with family. Looking for a understanding life partner.',
    height: "5'11\"",
    weight: '78 kg',
    religion: 'Hindu',
    caste: 'Reddy',
    gotra: 'Bharadwaj',
    manglik: false,
    motherTongue: 'Telugu',
    isVerified: true,
    isPremium: true,
    verificationLevel: 'gold',
    demoMode: true,
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://ui-avatars.com/api/?name=Arjun+Reddy&background=f59e0b&color=fff',
    photos: [
      { url: 'https://ui-avatars.com/api/?name=Arjun+Reddy&background=f59e0b&color=fff&size=256', isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 24, max: 28 },
      location: ['Hyderabad', 'Bangalore', 'Chennai', 'Vijayawada'],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get demo user by ID
 */
export function getDemoUserById(id: string): DemoUserProfile | undefined {
  return DEMO_USERS.find((user) => user.id === id);
}

/**
 * Get demo users by intent
 */
export function getDemoUsersByIntent(intent: string): DemoUserProfile[] {
  return DEMO_USERS.filter((user) => user.intent === intent);
}

/**
 * Get demo users by city
 */
export function getDemoUsersByCity(city: string): DemoUserProfile[] {
  return DEMO_USERS.filter((user) => user.city === city);
}

/**
 * Get demo users by verification level
 */
export function getDemoUsersByVerificationLevel(
  level: 'bronze' | 'silver' | 'gold'
): DemoUserProfile[] {
  return DEMO_USERS.filter((user) => user.verificationLevel === level);
}

/**
 * Get random demo user
 */
export function getRandomDemoUser(): DemoUserProfile {
  const randomIndex = Math.floor(Math.random() * DEMO_USERS.length);
  return DEMO_USERS[randomIndex];
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Match Data (for matches feed)
// ─────────────────────────────────────────────────────────────────────────────
export interface DemoMatch {
  id: string;
  profile: DemoUserProfile;
  compatibility: number;
  matchedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  likedByMe: boolean;
  likedByThem: boolean;
}

export const DEMO_MATCHES: DemoMatch[] = [
  {
    id: 'match_1',
    profile: DEMO_USERS[0], // Priya
    compatibility: 94,
    matchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    likedByMe: false,
    likedByThem: true,
  },
  {
    id: 'match_2',
    profile: DEMO_USERS[1], // Rohan
    compatibility: 87,
    matchedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    likedByMe: false,
    likedByThem: true,
  },
  {
    id: 'match_3',
    profile: DEMO_USERS[2], // Anjali
    compatibility: 82,
    matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    likedByMe: false,
    likedByThem: true,
  },
];

export default DEMO_USERS;
