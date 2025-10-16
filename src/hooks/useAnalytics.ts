import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsSummary {
  date: string;
  profile_views: number;
  unique_visitors: number;
  favorites_added: number;
  favorites_removed: number;
  contact_requests: number;
  image_views: number;
}

export interface RealtimeAnalytics {
  total_profile_views: number;
  total_unique_visitors: number;
  total_favorites_added: number;
  total_contact_requests: number;
  total_image_views: number;
  current_favorites: number;
}

/**
 * Fetch analytics summary for an artisan over a date range
 */
export function useArtisanAnalytics(
  artisanId: string,
  startDate?: string,
  endDate?: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["artisan-analytics", artisanId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_artisan_analytics", {
        p_artisan_id: artisanId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;
      return data as AnalyticsSummary[];
    },
    enabled: enabled && !!artisanId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch real-time analytics for an artisan
 */
export function useArtisanAnalyticsRealtime(
  artisanId: string,
  days: number = 30,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["artisan-analytics-realtime", artisanId, days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_artisan_analytics_realtime", {
        p_artisan_id: artisanId,
        p_days: days,
      });

      if (error) throw error;

      // The RPC returns an array with a single object
      return (data as any[])[0] as RealtimeAnalytics;
    },
    enabled: enabled && !!artisanId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Calculate analytics totals from summary data
 */
export function calculateAnalyticsTotals(summaries: AnalyticsSummary[]) {
  return summaries.reduce(
    (acc, day) => ({
      totalViews: acc.totalViews + day.profile_views,
      totalUniqueVisitors: acc.totalUniqueVisitors + day.unique_visitors,
      totalFavorites: acc.totalFavorites + day.favorites_added,
      totalContacts: acc.totalContacts + day.contact_requests,
      totalImageViews: acc.totalImageViews + day.image_views,
    }),
    {
      totalViews: 0,
      totalUniqueVisitors: 0,
      totalFavorites: 0,
      totalContacts: 0,
      totalImageViews: 0,
    }
  );
}

/**
 * Get analytics for a specific date range preset
 */
export function getDateRange(preset: "7d" | "30d" | "90d" | "1y"): {
  startDate: string;
  endDate: string;
} {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(end.getFullYear() - 1);
      break;
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}
