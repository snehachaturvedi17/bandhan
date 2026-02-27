/**
 * Bandhan AI - API Service Layer
 * Backend communication with error handling for Indian users
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
const API_CONFIG = {
  // Development (local)
  development: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',
    timeout: 30000, // 30 seconds for Indian networks
  },
  // Production (Mumbai region)
  production: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bandhan.ai/api/v1',
    timeout: 30000,
  },
};

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development';
const config = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

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
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterData {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  otp?: string;
  referralCode?: string;
}

export interface LoginData {
  phone: string;
  otp?: string;
  password?: string;
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
  createdAt: string;
  updatedAt: string;
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

export interface MatchFilters {
  ageMin?: number;
  ageMax?: number;
  location?: string;
  religion?: string;
  caste?: string;
  education?: string;
  diet?: string;
  manglik?: boolean;
  intent?: string;
  limit?: number;
  offset?: number;
}

export interface Conversation {
  id: string;
  matchId: string;
  participant: Profile;
  lastMessage?: Message;
  unreadCount: number;
  matchedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'photo' | 'voice' | 'interest';
  content: string;
  timestamp: string;
  isRead: boolean;
  isFromMe: boolean;
}

export interface VoiceNote {
  id: string;
  url: string;
  duration: number;
  transcript?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Error Types
// ─────────────────────────────────────────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
  userMessage: string;
  userMessageHi: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Message Translations (English/Hindi)
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<string, Omit<ApiError, 'code' | 'statusCode'>> = {
  // Auth Errors
  'AUTH_INVALID_CREDENTIALS': {
    message: 'Invalid credentials provided.',
    userMessage: 'Invalid phone number or OTP. Please try again.',
    userMessageHi: 'अमान्य फ़ोन नंबर या OTP। कृपया पुनः प्रयास करें।',
  },
  'AUTH_OTP_EXPIRED': {
    message: 'OTP has expired.',
    userMessage: 'OTP has expired. Please request a new one.',
    userMessageHi: 'OTP समाप्त हो गया है। कृपया नया अनुरोध करें।',
  },
  'AUTH_OTP_INVALID': {
    message: 'Invalid OTP code.',
    userMessage: 'Invalid OTP. Please check and try again.',
    userMessageHi: 'अमान्य OTP। कृपया जांचें और पुनः प्रयास करें।',
  },
  'AUTH_USER_EXISTS': {
    message: 'User with this phone number already exists.',
    userMessage: 'This phone number is already registered. Please login instead.',
    userMessageHi: 'यह फ़ोन नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।',
  },
  'AUTH_USER_NOT_FOUND': {
    message: 'User not found.',
    userMessage: 'Account not found. Please register first.',
    userMessageHi: 'खाता नहीं मिला। कृपया पहले पंजीकरण करें।',
  },
  'AUTH_TOKEN_EXPIRED': {
    message: 'Authentication token has expired.',
    userMessage: 'Your session has expired. Please login again.',
    userMessageHi: 'आपका सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।',
  },
  'AUTH_TOKEN_INVALID': {
    message: 'Invalid authentication token.',
    userMessage: 'Invalid session. Please login again.',
    userMessageHi: 'अमान्य सत्र। कृपया पुनः लॉगिन करें।',
  },

  // Profile Errors
  'PROFILE_NOT_FOUND': {
    message: 'Profile not found.',
    userMessage: 'Profile not found. Please complete your profile setup.',
    userMessageHi: 'प्रोफ़ाइल नहीं मिली। कृपया अपनी प्रोफ़ाइल सेटअप पूरी करें।',
  },
  'PROFILE_INCOMPLETE': {
    message: 'Profile is incomplete.',
    userMessage: 'Please complete all required fields to continue.',
    userMessageHi: 'कृपया जारी रखने के लिए सभी आवश्यक फ़ील्ड पूरे करें।',
  },
  'PHOTO_UPLOAD_FAILED': {
    message: 'Failed to upload photo.',
    userMessage: 'Photo upload failed. Please try again with a smaller file.',
    userMessageHi: 'फ़ोटो अपलोड विफल। कृपया छोटी फ़ाइल के साथ पुनः प्रयास करें।',
  },

  // Match Errors
  'MATCH_NOT_FOUND': {
    message: 'Match not found.',
    userMessage: 'This match is no longer available.',
    userMessageHi: 'यह मैच अब उपलब्ध नहीं है।',
  },
  'MATCH_ALREADY_LIKED': {
    message: 'You have already liked this profile.',
    userMessage: 'You have already expressed interest in this profile.',
    userMessageHi: 'आपने पहले ही इस प्रोफ़ाइल में रुचि व्यक्त की है।',
  },
  'MATCH_LIMIT_REACHED': {
    message: 'Daily like limit reached.',
    userMessage: 'You have reached your daily like limit. Upgrade to Premium for unlimited likes.',
    userMessageHi: 'आपने अपनी दैनिक लाइक सीमा पहुंच ली है। असीमित लाइक के लिए प्रीमियम में अपग्रेड करें।',
  },
  'NO_MATCHES_AVAILABLE': {
    message: 'No matches available with current filters.',
    userMessage: 'No matches found. Try adjusting your preferences.',
    userMessageHi: 'कोई मैच नहीं मिला। अपनी प्राथमिकताएं समायोजित करने का प्रयास करें।',
  },

  // Chat Errors
  'CONVERSATION_NOT_FOUND': {
    message: 'Conversation not found.',
    userMessage: 'This conversation is no longer available.',
    userMessageHi: 'यह वार्तालाप अब उपलब्ध नहीं है।',
  },
  'MESSAGE_SEND_FAILED': {
    message: 'Failed to send message.',
    userMessage: 'Message could not be sent. Please check your connection.',
    userMessageHi: 'संदेश भेजा नहीं जा सका। कृपया अपना कनेक्शन जांचें।',
  },
  'CHAT_NOT_ALLOWED': {
    message: 'Chat not allowed with this match.',
    userMessage: 'You can only chat with mutual matches.',
    userMessageHi: 'आप केवल पारस्परिक मैचों के साथ ही चैट कर सकते हैं।',
  },

  // Network Errors
  'NETWORK_ERROR': {
    message: 'Network error occurred.',
    userMessage: 'Please check your internet connection and try again.',
    userMessageHi: 'कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
  },
  'TIMEOUT_ERROR': {
    message: 'Request timed out.',
    userMessage: 'Request took too long. Please try again.',
    userMessageHi: 'अनुरोध में बहुत समय लगा। कृपया पुनः प्रयास करें।',
  },
  'SERVER_ERROR': {
    message: 'Server error occurred.',
    userMessage: 'Something went wrong. Please try again later.',
    userMessageHi: 'कुछ गलत हो गया। कृपया बाद में पुनः प्रयास करें।',
  },
};

function getErrorMessage(errorCode: string): Omit<ApiError, 'code' | 'statusCode'> {
  return ERROR_MESSAGES[errorCode] || {
    message: 'An unexpected error occurred.',
    userMessage: 'Something went wrong. Please try again.',
    userMessageHi: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Axios Instance Setup
// ─────────────────────────────────────────────────────────────────────────────
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      'X-Platform': 'web',
    },
  });

  // Request Interceptor - Add auth token
  instance.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');

      if (token && request.headers) {
        request.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for debugging
      request.headers['X-Request-Timestamp'] = Date.now().toString();

      console.log(`[API Request] ${request.method?.toUpperCase()} ${request.url}`);
      return request;
    },
    (error: AxiosError) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  // Response Interceptor - Handle errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
      return response;
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        const errorInfo = getErrorMessage('TIMEOUT_ERROR');
        return Promise.reject(formatApiError('TIMEOUT_ERROR', errorInfo, 408));
      }

      if (error.code === 'ERR_NETWORK' || !error.response) {
        const errorInfo = getErrorMessage('NETWORK_ERROR');
        return Promise.reject(formatApiError('NETWORK_ERROR', errorInfo, 0));
      }

      const responseData = error.response?.data as ApiResponse<unknown> | undefined;
      const statusCode = error.response?.status || 500;
      const errorCode = (responseData as any)?.error?.code || 'SERVER_ERROR';

      const errorInfo = getErrorMessage(errorCode);
      return Promise.reject(
        formatApiError(errorCode, errorInfo, statusCode, (responseData as any)?.error?.details)
      );
    }
  );

  return instance;
}

function formatApiError(
  code: string,
  errorInfo: Omit<ApiError, 'code' | 'statusCode'>,
  statusCode: number,
  details?: Record<string, string[]>
): ApiError {
  return {
    code,
    statusCode,
    message: errorInfo.message,
    userMessage: errorInfo.userMessage,
    userMessageHi: errorInfo.userMessageHi,
    details,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API Instance
// ─────────────────────────────────────────────────────────────────────────────
const api = createAxiosInstance();

// ─────────────────────────────────────────────────────────────────────────────
// Service Modules
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Register new user with OTP
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  /**
   * Login with phone/OTP or password
   */
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/verify-otp', {
      phone,
      otp,
    });
    return response.data;
  },

  /**
   * Resend OTP
   */
  async resendOTP(phone: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.post<ApiResponse<{ success: boolean }>>('/auth/resend-otp', {
      phone,
    });
    return response.data;
  },
};

/**
 * Profile Service
 */
export const profileService = {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<ApiResponse<Profile>> {
    const response = await api.get<ApiResponse<Profile>>('/profile');
    return response.data;
  },

  /**
   * Update profile
   */
  async updateProfile(data: Partial<Profile>): Promise<ApiResponse<Profile>> {
    const response = await api.put<ApiResponse<Profile>>('/profile', data);
    return response.data;
  },

  /**
   * Upload profile photo
   */
  async uploadPhoto(file: File): Promise<ApiResponse<Photo>> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post<ApiResponse<Photo>>('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete profile photo
   */
  async deletePhoto(photoId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(`/profile/photo/${photoId}`);
    return response.data;
  },

  /**
   * Set primary photo
   */
  async setPrimaryPhoto(photoId: string): Promise<ApiResponse<Profile>> {
    const response = await api.post<ApiResponse<Profile>>(`/profile/photo/${photoId}/primary`);
    return response.data;
  },

  /**
   * Get profile completion status
   */
  async getCompletionStatus(): Promise<ApiResponse<{ percentage: number; missingFields: string[] }>> {
    const response = await api.get<ApiResponse<{ percentage: number; missingFields: string[] }>>('/profile/completion');
    return response.data;
  },

  /**
   * Verify profile with DigiLocker
   */
  async verifyWithDigiLocker(code: string): Promise<ApiResponse<{ verified: boolean }>> {
    const response = await api.post<ApiResponse<{ verified: boolean }>>('/profile/verify/digilocker', {
      code,
    });
    return response.data;
  },
};

/**
 * Match Service
 */
export const matchService = {
  /**
   * Get daily matches with filters
   */
  async getMatches(filters?: MatchFilters): Promise<ApiResponse<Match[]>> {
    const response = await api.get<ApiResponse<Match[]>>('/matches', { params: filters });
    return response.data;
  },

  /**
   * Like a user
   */
  async likeUser(userId: string): Promise<ApiResponse<{ match: boolean; matchData?: Match }>> {
    const response = await api.post<ApiResponse<{ match: boolean; matchData?: Match }>>(`/matches/like/${userId}`);
    return response.data;
  },

  /**
   * Pass/reject a user
   */
  async passUser(userId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.post<ApiResponse<{ success: boolean }>>(`/matches/pass/${userId}`);
    return response.data;
  },

  /**
   * Get match details
   */
  async getMatchDetails(matchId: string): Promise<ApiResponse<Match>> {
    const response = await api.get<ApiResponse<Match>>(`/matches/${matchId}`);
    return response.data;
  },

  /**
   * Undo last like (Premium feature)
   */
  async undoLike(): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.post<ApiResponse<{ success: boolean }>>('/matches/undo');
    return response.data;
  },

  /**
   * Get compatibility report
   */
  async getCompatibilityReport(matchId: string): Promise<ApiResponse<{ score: number; factors: Record<string, number> }>> {
    const response = await api.get<ApiResponse<{ score: number; factors: Record<string, number> }>>(
      `/matches/${matchId}/compatibility`
    );
    return response.data;
  },

  /**
   * Get remaining daily likes
   */
  async getDailyLimit(): Promise<ApiResponse<{ used: number; total: number; resetsAt: string }>> {
    const response = await api.get<ApiResponse<{ used: number; total: number; resetsAt: string }>>('/matches/limit');
    return response.data;
  },
};

/**
 * Chat Service
 */
export const chatService = {
  /**
   * Get all conversations
   */
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    const response = await api.get<ApiResponse<Conversation[]>>('/chat/conversations');
    return response.data;
  },

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string, limit?: number, before?: string): Promise<ApiResponse<Message[]>> {
    const response = await api.get<ApiResponse<Message[]>>(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, before },
    });
    return response.data;
  },

  /**
   * Send text message
   */
  async sendMessage(conversationId: string, content: string): Promise<ApiResponse<Message>> {
    const response = await api.post<ApiResponse<Message>>(`/chat/conversations/${conversationId}/messages`, {
      type: 'text',
      content,
    });
    return response.data;
  },

  /**
   * Send photo message
   */
  async sendPhoto(conversationId: string, file: File): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post<ApiResponse<Message>>(
      `/chat/conversations/${conversationId}/messages/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Send voice note
   */
  async sendVoiceNote(conversationId: string, file: File, duration: number): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    formData.append('voice', file);
    formData.append('duration', duration.toString());

    const response = await api.post<ApiResponse<Message>>(
      `/chat/conversations/${conversationId}/messages/voice`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Send interest
   */
  async sendInterest(conversationId: string): Promise<ApiResponse<Message>> {
    const response = await api.post<ApiResponse<Message>>(`/chat/conversations/${conversationId}/interest`);
    return response.data;
  },

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      `/chat/conversations/${conversationId}/read`
    );
    return response.data;
  },

  /**
   * Delete message
   */
  async deleteMessage(conversationId: string, messageId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(
      `/chat/conversations/${conversationId}/messages/${messageId}`
    );
    return response.data;
  },

  /**
   * Block user in conversation
   */
  async blockUser(conversationId: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      `/chat/conversations/${conversationId}/block`
    );
    return response.data;
  },

  /**
   * Report conversation
   */
  async reportConversation(conversationId: string, reason: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.post<ApiResponse<{ success: boolean }>>(
      `/chat/conversations/${conversationId}/report`,
      { reason }
    );
    return response.data;
  },
};

/**
 * Subscription Service
 */
export const subscriptionService = {
  /**
   * Get current subscription status
   */
  async getStatus(): Promise<ApiResponse<{ plan: string; expiresAt: string; features: string[] }>> {
    const response = await api.get<ApiResponse<{ plan: string; expiresAt: string; features: string[] }>>('/subscription');
    return response.data;
  },

  /**
   * Create Razorpay order
   */
  async createOrder(planId: string): Promise<ApiResponse<{ orderId: string; amount: number; currency: string }>> {
    const response = await api.post<ApiResponse<{ orderId: string; amount: number; currency: string }>>(
      '/subscription/create-order',
      { planId }
    );
    return response.data;
  },

  /**
   * Verify payment
   */
  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.post<ApiResponse<{ success: boolean }>>('/subscription/verify-payment', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Get error message in user's preferred language
 */
export function getUserMessage(error: ApiError, language: 'en' | 'hi' = 'en'): string {
  return language === 'hi' ? error.userMessageHi : error.userMessage;
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: unknown): boolean {
  const apiError = error as ApiError;
  return apiError?.code?.startsWith('AUTH_') || apiError?.statusCode === 401;
}

/**
 * Check if error requires token refresh
 */
export function isTokenExpiredError(error: unknown): boolean {
  const apiError = error as ApiError;
  return apiError?.code === 'AUTH_TOKEN_EXPIRED' || apiError?.code === 'AUTH_TOKEN_INVALID';
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export default api;
export { api as apiClient };
