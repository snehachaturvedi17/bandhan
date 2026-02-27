/**
 * Bandhan AI - Global State Management with Zustand
 * Implements persist middleware for critical data
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  uid: string;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  isVerified: boolean;
  isPremium: boolean;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  height?: string;
  weight?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  manglik: boolean;
  motherTongue: string;
  education: string;
  occupation: string;
  annualIncome?: number;
  city: string;
  state: string;
  country: string;
  familyType: 'joint' | 'nuclear';
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;
  diet: 'vegetarian' | 'eggetarian' | 'non-vegetarian' | 'jain' | 'halal';
  smoking: 'never' | 'occasionally' | 'regularly';
  drinking: 'never' | 'occasionally' | 'regularly';
  intent: 'marriage-soon' | 'serious-relationship' | 'friendship' | 'healing';
  bio?: string;
  photos: Photo[];
  preferences: MatchPreferences;
  verificationLevel: 'bronze' | 'silver' | 'gold';
  onboardingComplete: boolean;
  onboardingStep: number;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  isBlurred: boolean;
  uploadedAt: string;
}

export interface MatchPreferences {
  ageRange: { min: number; max: number };
  heightRange: { min: number; max: number };
  location: string[];
  religion: string[];
  caste: string[];
  education: string[];
  occupation: string[];
  diet: string[];
  manglik: 'any' | 'yes' | 'no';
  maritalStatus: string[];
}

export interface Match {
  id: string;
  profile: Profile;
  compatibility: number;
  matchedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  likedByMe: boolean;
  likedByThem: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  type: 'text' | 'photo' | 'voice' | 'interest';
  content: string;
  duration?: number; // for voice notes
  timestamp: string;
  isRead: boolean;
  isFromMe: boolean;
}

export interface Conversation {
  id: string;
  matchId: string;
  participant: {
    id: string;
    name: string;
    avatarUrl?: string;
    isOnline: boolean;
    verificationLevel: 'bronze' | 'silver' | 'gold';
  };
  lastMessage?: Message;
  unreadCount: number;
  matchedAt: string;
  messages: Message[];
}

export interface MatchFilters {
  ageMin: number;
  ageMax: number;
  location: string;
  religion: string;
  caste: string;
  education: string;
  diet: string;
  manglik: 'any' | 'yes' | 'no';
  intent: string;
  distance: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage Configuration
// ─────────────────────────────────────────────────────────────────────────────
// Custom storage for better control over localStorage
const createCustomStorage = (): StateStorage => ({
  getItem: (name: string): string | null => {
    try {
      const item = localStorage.getItem(name);
      return item;
    } catch (error) {
      console.error(`Error getting item ${name}:`, error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error(`Error setting item ${name}:`, error);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error(`Error removing item ${name}:`, error);
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth Store
// ─────────────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setToken: (token: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

type AuthStore = AuthState & AuthActions;

const createAuthStore = () =>
  create<AuthStore>()(
    persist(
      immer((set) => ({
        // Initial State
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        login: (user, token, refreshToken) =>
          set((state) => {
            state.user = user;
            state.token = token;
            if (refreshToken) state.refreshToken = refreshToken;
            state.isAuthenticated = true;
            state.error = null;
          }),

        logout: () =>
          set((state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
          }),

        setToken: (token, refreshToken) =>
          set((state) => {
            state.token = token;
            if (refreshToken) state.refreshToken = refreshToken;
          }),

        updateUser: (userData) =>
          set((state) => {
            if (state.user) {
              state.user = { ...state.user, ...userData };
            }
          }),

        clearError: () =>
          set((state) => {
            state.error = null;
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),
      })),
      {
        name: 'bandhan-auth-storage',
        storage: createJSONStorage(() => createCustomStorage()),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
        version: 1,
        migrate: (persistedState: unknown, version: number) => {
          // Migration logic for future updates
          if (version === 0) {
            // Add any migration logic here
          }
          return persistedState as AuthState;
        },
      }
    )
  );

// ─────────────────────────────────────────────────────────────────────────────
// Profile Store
// ─────────────────────────────────────────────────────────────────────────────
interface ProfileState {
  profileData: Profile | null;
  onboardingComplete: boolean;
  onboardingStep: number;
  isLoading: boolean;
  error: string | null;
}

interface ProfileActions {
  setProfile: (profile: Profile) => void;
  updateProfile: (data: Partial<Profile>) => void;
  completeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  addPhoto: (photo: Photo) => void;
  removePhoto: (photoId: string) => void;
  setPrimaryPhoto: (photoId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

type ProfileStore = ProfileState & ProfileActions;

const createProfileStore = () =>
  create<ProfileStore>()(
    persist(
      immer((set) => ({
        // Initial State
        profileData: null,
        onboardingComplete: false,
        onboardingStep: 0,
        isLoading: false,
        error: null,

        // Actions
        setProfile: (profile) =>
          set((state) => {
            state.profileData = profile;
            state.onboardingComplete = profile.onboardingComplete;
            state.onboardingStep = profile.onboardingStep;
          }),

        updateProfile: (data) =>
          set((state) => {
            if (state.profileData) {
              state.profileData = { ...state.profileData, ...data };
            }
          }),

        completeOnboarding: () =>
          set((state) => {
            state.onboardingComplete = true;
            if (state.profileData) {
              state.profileData.onboardingComplete = true;
            }
          }),

        setOnboardingStep: (step) =>
          set((state) => {
            state.onboardingStep = step;
            if (state.profileData) {
              state.profileData.onboardingStep = step;
            }
          }),

        addPhoto: (photo) =>
          set((state) => {
            if (state.profileData) {
              state.profileData.photos.push(photo);
            }
          }),

        removePhoto: (photoId) =>
          set((state) => {
            if (state.profileData) {
              state.profileData.photos = state.profileData.photos.filter(
                (p) => p.id !== photoId
              );
            }
          }),

        setPrimaryPhoto: (photoId) =>
          set((state) => {
            if (state.profileData) {
              state.profileData.photos.forEach((p) => {
                p.isPrimary = p.id === photoId;
              });
            }
          }),

        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        clearError: () =>
          set((state) => {
            state.error = null;
          }),
      })),
      {
        name: 'bandhan-profile-storage',
        storage: createJSONStorage(() => createCustomStorage()),
        partialize: (state) => ({
          profileData: state.profileData,
          onboardingComplete: state.onboardingComplete,
          onboardingStep: state.onboardingStep,
        }),
        version: 1,
      }
    )
  );

// ─────────────────────────────────────────────────────────────────────────────
// Match Store
// ─────────────────────────────────────────────────────────────────────────────
interface MatchState {
  matches: Match[];
  currentMatch: Match | null;
  filters: MatchFilters;
  dailyLimit: {
    used: number;
    total: number;
    resetsAt: string;
  };
  isLoading: boolean;
  error: string | null;
}

interface MatchActions {
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  removeMatch: (matchId: string) => void;
  setCurrentMatch: (match: Match | null) => void;
  likeUser: (userId: string) => void;
  passUser: (userId: string) => void;
  setFilters: (filters: Partial<MatchFilters>) => void;
  resetFilters: () => void;
  setDailyLimit: (limit: { used: number; total: number; resetsAt: string }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

type MatchStore = MatchState & MatchActions;

const createMatchStore = () =>
  create<MatchStore>()(
    immer((set) => ({
      // Initial State
      matches: [],
      currentMatch: null,
      filters: {
        ageMin: 22,
        ageMax: 35,
        location: '',
        religion: '',
        caste: '',
        education: '',
        diet: '',
        manglik: 'any',
        intent: '',
        distance: 50,
      },
      dailyLimit: {
        used: 0,
        total: 5,
        resetsAt: '',
      },
      isLoading: false,
      error: null,

      // Actions
      setMatches: (matches) =>
        set((state) => {
          state.matches = matches;
        }),

      addMatch: (match) =>
        set((state) => {
          state.matches.push(match);
        }),

      removeMatch: (matchId) =>
        set((state) => {
          state.matches = state.matches.filter((m) => m.id !== matchId);
          if (state.currentMatch?.id === matchId) {
            state.currentMatch = null;
          }
        }),

      setCurrentMatch: (match) =>
        set((state) => {
          state.currentMatch = match;
        }),

      likeUser: (userId) =>
        set((state) => {
          const match = state.matches.find((m) => m.profile.id === userId);
          if (match) {
            match.likedByMe = true;
            state.dailyLimit.used += 1;
          }
        }),

      passUser: (userId) =>
        set((state) => {
          state.matches = state.matches.filter(
            (m) => m.profile.id !== userId
          );
        }),

      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = {
            ageMin: 22,
            ageMax: 35,
            location: '',
            religion: '',
            caste: '',
            education: '',
            diet: '',
            manglik: 'any',
            intent: '',
            distance: 50,
          };
        }),

      setDailyLimit: (limit) =>
        set((state) => {
          state.dailyLimit = limit;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      clearError: () =>
        set((state) => {
          state.error = null;
        }),
    }))
  );

// ─────────────────────────────────────────────────────────────────────────────
// Chat Store
// ─────────────────────────────────────────────────────────────────────────────
interface ChatState {
  conversations: Conversation[];
  currentChat: Conversation | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

interface ChatActions {
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, data: Partial<Conversation>) => void;
  removeConversation: (conversationId: string) => void;
  setCurrentChat: (chat: Conversation | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  markAsRead: (conversationId: string) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

type ChatStore = ChatState & ChatActions;

const createChatStore = () =>
  create<ChatStore>()(
    immer((set) => ({
      // Initial State
      conversations: [],
      currentChat: null,
      isLoading: false,
      isSending: false,
      error: null,

      // Actions
      setConversations: (conversations) =>
        set((state) => {
          state.conversations = conversations;
        }),

      addConversation: (conversation) =>
        set((state) => {
          state.conversations.unshift(conversation);
        }),

      updateConversation: (conversationId, data) =>
        set((state) => {
          const conversation = state.conversations.find(
            (c) => c.id === conversationId
          );
          if (conversation) {
            Object.assign(conversation, data);
          }
          if (state.currentChat?.id === conversationId) {
            Object.assign(state.currentChat, data);
          }
        }),

      removeConversation: (conversationId) =>
        set((state) => {
          state.conversations = state.conversations.filter(
            (c) => c.id !== conversationId
          );
          if (state.currentChat?.id === conversationId) {
            state.currentChat = null;
          }
        }),

      setCurrentChat: (chat) =>
        set((state) => {
          state.currentChat = chat;
        }),

      addMessage: (conversationId, message) =>
        set((state) => {
          const conversation = state.conversations.find(
            (c) => c.id === conversationId
          );
          if (conversation) {
            conversation.messages.push(message);
            conversation.lastMessage = message;
            if (!message.isFromMe) {
              conversation.unreadCount += 1;
            }
          }
          if (state.currentChat?.id === conversationId) {
            state.currentChat.messages.push(message);
            state.currentChat.lastMessage = message;
          }
        }),

      markAsRead: (conversationId) =>
        set((state) => {
          const conversation = state.conversations.find(
            (c) => c.id === conversationId
          );
          if (conversation) {
            conversation.unreadCount = 0;
            conversation.messages.forEach((m) => {
              if (!m.isFromMe) m.isRead = true;
            });
          }
          if (state.currentChat?.id === conversationId) {
            state.currentChat.unreadCount = 0;
            state.currentChat.messages.forEach((m) => {
              if (!m.isFromMe) m.isRead = true;
            });
          }
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setSending: (sending) =>
        set((state) => {
          state.isSending = sending;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      clearError: () =>
        set((state) => {
          state.error = null;
        }),
    }))
  );

// ─────────────────────────────────────────────────────────────────────────────
// Combined Store Export
// ─────────────────────────────────────────────────────────────────────────────
// Create store instances
export const useAuthStore = createAuthStore();
export const useProfileStore = createProfileStore();
export const useMatchStore = createMatchStore();
export const useChatStore = createChatStore();

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Clear all persisted stores (for logout)
 */
export const clearAllStores = () => {
  localStorage.removeItem('bandhan-auth-storage');
  localStorage.removeItem('bandhan-profile-storage');
  // Keep match and chat stores as they might be useful
};

/**
 * Clear specific store
 */
export const clearStore = (storeName: 'auth' | 'profile' | 'match' | 'chat') => {
  const storageKey = `bandhan-${storeName}-storage`;
  localStorage.removeItem(storageKey);
};

/**
 * Get store hydration status
 */
export const getHydrationStatus = () => ({
  auth: !!localStorage.getItem('bandhan-auth-storage'),
  profile: !!localStorage.getItem('bandhan-profile-storage'),
  match: !!localStorage.getItem('bandhan-match-storage'),
  chat: !!localStorage.getItem('bandhan-chat-storage'),
});

/**
 * Force rehydrate all stores
 */
export const rehydrateAllStores = async () => {
  const stores = [useAuthStore, useProfileStore, useMatchStore, useChatStore];
  await Promise.all(stores.map((store) => store.persist.rehydrate()));
};

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Store Types
// ─────────────────────────────────────────────────────────────────────────────
export type { AuthStore, ProfileStore, MatchStore, ChatStore };
export type { AuthState, AuthActions };
export type { ProfileState, ProfileActions };
export type { MatchState, MatchActions };
export type { ChatState, ChatActions };
