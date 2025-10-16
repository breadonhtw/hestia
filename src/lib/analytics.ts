import { supabase } from "@/integrations/supabase/client";

// Generate a session ID for tracking unique visitors
let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;

  // Try to get from sessionStorage first
  const stored = sessionStorage.getItem('hestia_session_id');
  if (stored) {
    sessionId = stored;
    return sessionId;
  }

  // Generate new session ID
  sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('hestia_session_id', sessionId);
  return sessionId;
}

export type AnalyticsEventType =
  | 'profile_view'
  | 'favorite_added'
  | 'favorite_removed'
  | 'contact_sent'
  | 'image_view';

export interface AnalyticsEventData {
  [key: string]: any;
}

/**
 * Track an analytics event for an artisan
 */
export async function trackAnalyticsEvent(
  artisanId: string,
  eventType: AnalyticsEventType,
  eventData: AnalyticsEventData = {}
): Promise<void> {
  try {
    const { error } = await supabase.rpc('track_analytics_event', {
      p_artisan_id: artisanId,
      p_event_type: eventType,
      p_event_data: eventData,
      p_session_id: getSessionId()
    });

    if (error) {
      console.error('Analytics tracking error:', error);
    }
  } catch (err) {
    // Silently fail - don't disrupt user experience
    console.error('Analytics tracking exception:', err);
  }
}

/**
 * Track a profile view
 */
export async function trackProfileView(artisanId: string): Promise<void> {
  return trackAnalyticsEvent(artisanId, 'profile_view');
}

/**
 * Track when a user favorites an artisan
 */
export async function trackFavoriteAdded(artisanId: string): Promise<void> {
  return trackAnalyticsEvent(artisanId, 'favorite_added');
}

/**
 * Track when a user unfavorites an artisan
 */
export async function trackFavoriteRemoved(artisanId: string): Promise<void> {
  return trackAnalyticsEvent(artisanId, 'favorite_removed');
}

/**
 * Track when a contact request is sent
 */
export async function trackContactSent(artisanId: string, data?: AnalyticsEventData): Promise<void> {
  return trackAnalyticsEvent(artisanId, 'contact_sent', data);
}

/**
 * Track when a gallery image is viewed
 */
export async function trackImageView(artisanId: string, imageId: string): Promise<void> {
  return trackAnalyticsEvent(artisanId, 'image_view', { image_id: imageId });
}

/**
 * Debounce function to prevent excessive event tracking
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Debounced profile view tracking (prevents multiple calls within 5 seconds)
 */
export const trackProfileViewDebounced = debounce(trackProfileView, 5000);
