-- Fix analytics date calculation bug
-- Issue: 7-day metrics were showing higher than 30-day metrics due to date calculation inconsistencies

-- Drop and recreate the function with proper date handling
CREATE OR REPLACE FUNCTION get_artisan_analytics_realtime(
  p_artisan_id uuid,
  p_days int DEFAULT 30
)
RETURNS TABLE (
  total_profile_views bigint,
  total_unique_visitors bigint,
  total_favorites_added bigint,
  total_contact_requests bigint,
  total_image_views bigint,
  current_favorites bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'profile_view') as total_profile_views,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'profile_view') as total_unique_visitors,
    COUNT(*) FILTER (WHERE event_type = 'favorite_added') as total_favorites_added,
    COUNT(*) FILTER (WHERE event_type = 'contact_sent') as total_contact_requests,
    COUNT(*) FILTER (WHERE event_type = 'image_view') as total_image_views,
    (SELECT COUNT(*) FROM user_favorites WHERE artisan_id = p_artisan_id) as current_favorites
  FROM artisan_analytics_events
  WHERE artisan_id = p_artisan_id
  AND created_at >= now() - make_interval(days => p_days);
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_artisan_analytics_realtime TO authenticated;
