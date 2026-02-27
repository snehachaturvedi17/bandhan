/**
 * Bandhan AI - Analytics Tracking Utilities
 * Mock analytics for tracking limit-related events
 *
 * In production, replace with:
 * - Google Analytics 4
 * - Mixpanel
 * - Amplitude
 * - Custom backend events
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface AnalyticsEvent {
  event_name: string;
  event_timestamp: string;
  user_id?: string;
  properties?: Record<string, unknown>;
}

export interface LimitEventProperties {
  limit_type: 'profiles' | 'chats' | 'likes' | 'views';
  daily_limit: number;
  used_count: number;
  remaining_count: number;
  percentage_used: number;
  time_of_day: string;
  is_peak_hours: boolean;
  user_segment: 'free' | 'premium' | 'trial';
  device_type: 'mobile' | 'desktop' | 'tablet';
}

export interface UpsellEventProperties {
  modal_type: 'limit_reached' | 'feature_locked' | 'banner_click';
  trigger_action: string;
  limit_type: 'profiles' | 'chats' | 'likes';
  time_on_page: number;
  previous_upsell_shown: number;
  user_segment: 'free' | 'premium' | 'trial';
}

export interface ConversionEventProperties {
  plan_type: 'monthly' | 'yearly' | 'family';
  price: number;
  currency: string;
  payment_method?: 'upi' | 'card' | 'netbanking' | 'wallet';
  time_to_convert: number; // seconds from first upsell to conversion
  upsell_impressions: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Analytics Storage (for demo)
// ─────────────────────────────────────────────────────────────────────────────
const ANALYTICS_STORAGE_KEY = 'bandhan_analytics_events';

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeEvent(event: AnalyticsEvent): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const events = getStoredEvents();
    events.push(event);
    // Keep only last 100 events to prevent storage bloat
    const trimmed = events.slice(-100);
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error storing analytics event:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Tracking Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track any analytics event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>,
  userId?: string
): void {
  const event: AnalyticsEvent = {
    event_name: eventName,
    event_timestamp: new Date().toISOString(),
    user_id: userId,
    properties,
  };

  // Store locally for demo
  storeEvent(event);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties);
  }

  // In production, send to analytics backend
  // sendToAnalyticsBackend(event);
}

// ─────────────────────────────────────────────────────────────────────────────
// Limit-Related Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track when user hits daily limit
 */
export function trackLimitReached(properties: LimitEventProperties): void {
  trackEvent('daily_limit_reached', {
    ...properties,
    event_category: 'monetization',
    event_action: 'limit_hit',
  });
}

/**
 * Track when limit counter is viewed
 */
export function trackLimitCounterView(
  remainingCount: number,
  totalCount: number
): void {
  trackEvent('limit_counter_viewed', {
    remaining: remainingCount,
    total: totalCount,
    percentage_remaining: (remainingCount / totalCount) * 100,
    event_category: 'engagement',
  });
}

/**
 * Track when user tries to exceed limit
 */
export function trackLimitExceedAttempt(limitType: string): void {
  trackEvent('limit_exceed_attempt', {
    limit_type: limitType,
    event_category: 'monetization',
    event_action: 'attempt_blocked',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Upsell Modal Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track when upsell modal is shown
 */
export function trackUpsellModalShown(properties: UpsellEventProperties): void {
  trackEvent('upsell_modal_shown', {
    ...properties,
    event_category: 'monetization',
    event_action: 'impression',
  });
}

/**
 * Track when user clicks upgrade CTA
 */
export function trackUpgradeCTAClick(
  modalType: string,
  ctaPosition: string = 'primary'
): void {
  trackEvent('upgrade_cta_clicked', {
    modal_type: modalType,
    cta_position: ctaPosition,
    event_category: 'monetization',
    event_action: 'cta_click',
  });
}

/**
 * Track when user dismisses upsell modal
 */
export function trackUpsellModalDismissed(
  modalType: string,
  dismissAction: 'close' | 'remind_later' | 'skip'
): void {
  trackEvent('upsell_modal_dismissed', {
    modal_type: modalType,
    dismiss_action: dismissAction,
    event_category: 'monetization',
    event_action: 'dismissal',
  });
}

/**
 * Track when user clicks "Remind me tomorrow"
 */
export function trackRemindMeTomorrow(): void {
  trackEvent('remind_me_tomorrow_clicked', {
    event_category: 'monetization',
    event_action: 'remind_later',
  });

  // Store reminder preference
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('bandhan_upsell_reminder', new Date().toISOString());
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversion Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track when user starts checkout
 */
export function trackCheckoutStarted(planType: string, price: number): void {
  trackEvent('checkout_started', {
    plan_type: planType,
    price,
    currency: 'INR',
    event_category: 'monetization',
    event_action: 'checkout_initiated',
  });
}

/**
 * Track successful conversion
 */
export function trackConversion(properties: ConversionEventProperties): void {
  trackEvent('premium_converted', {
    ...properties,
    event_category: 'monetization',
    event_action: 'conversion',
    revenue: properties.price,
    currency: properties.currency,
  });
}

/**
 * Track payment failure
 */
export function trackPaymentFailure(
  planType: string,
  errorCode?: string
): void {
  trackEvent('payment_failed', {
    plan_type: planType,
    error_code: errorCode,
    event_category: 'monetization',
    event_action: 'payment_failure',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Engagement Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track time spent on premium page
 */
export function trackPremiumPageTime(seconds: number): void {
  trackEvent('premium_page_time', {
    duration_seconds: seconds,
    event_category: 'engagement',
  });
}

/**
 * Track which premium features user viewed
 */
export function trackFeatureViewed(featureName: string): void {
  trackEvent('feature_viewed', {
    feature_name: featureName,
    event_category: 'engagement',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// A/B Testing Events
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track A/B test variant exposure
 */
export function trackABTestExposure(
  testId: string,
  variant: string
): void {
  trackEvent('ab_test_exposure', {
    test_id: testId,
    variant,
    event_category: 'experiment',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Dashboard Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all stored events (for debugging/demo)
 */
export function getAllEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

/**
 * Get events by name
 */
export function getEventsByName(eventName: string): AnalyticsEvent[] {
  return getStoredEvents().filter((e) => e.event_name === eventName);
}

/**
 * Get conversion rate (mock calculation)
 */
export function getConversionRate(): number {
  const events = getAllEvents();
  const impressions = events.filter((e) =>
    e.event_name === 'upsell_modal_shown'
  ).length;
  const conversions = events.filter((e) =>
    e.event_name === 'premium_converted'
  ).length;

  if (impressions === 0) return 0;
  return (conversions / impressions) * 100;
}

/**
 * Get limit hit frequency by hour
 */
export function getLimitHitsByHour(): Record<number, number> {
  const events = getEventsByName('daily_limit_reached');
  const byHour: Record<number, number> = {};

  events.forEach((event) => {
    const hour = new Date(event.event_timestamp).getHours();
    byHour[hour] = (byHour[hour] || 0) + 1;
  });

  return byHour;
}

/**
 * Clear all stored events
 */
export function clearAnalytics(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Production Integration (Placeholder)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send event to analytics backend
 * Replace with actual implementation in production
 */
async function sendToAnalyticsBackend(event: AnalyticsEvent): Promise<void> {
  // Example: Send to your backend
  // await fetch('/api/analytics/track', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event),
  // });

  // Example: Google Analytics 4
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', event.event_name, event.properties);
  // }

  // Example: Mixpanel
  // if (typeof mixpanel !== 'undefined') {
  //   mixpanel.track(event.event_name, event.properties);
  // }

  console.log('[Analytics Backend]', event);
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export default {
  trackEvent,
  trackLimitReached,
  trackLimitCounterView,
  trackLimitExceedAttempt,
  trackUpsellModalShown,
  trackUpgradeCTAClick,
  trackUpsellModalDismissed,
  trackRemindMeTomorrow,
  trackCheckoutStarted,
  trackConversion,
  trackPaymentFailure,
  trackPremiumPageTime,
  trackFeatureViewed,
  trackABTestExposure,
  getAllEvents,
  getEventsByName,
  getConversionRate,
  getLimitHitsByHour,
  clearAnalytics,
};
