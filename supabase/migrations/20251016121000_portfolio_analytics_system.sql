-- Create portfolio analytics system for artisans
-- Tracks profile views, favorites, contact requests, and engagement metrics

-- Analytics events table (raw event tracking)
CREATE TABLE artisan_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'profile_view', 'favorite_added', 'favorite_removed', 'contact_sent', 'image_view'
  event_data jsonb DEFAULT '{}', -- flexible data for different event types
  session_id text, -- for deduplication within same session
  user_id uuid REFERENCES profiles(id), -- null for anonymous users
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_artisan_id ON artisan_analytics_events(artisan_id);
CREATE INDEX idx_analytics_events_created_at ON artisan_analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON artisan_analytics_events(event_type);
CREATE INDEX idx_analytics_events_session_id ON artisan_analytics_events(session_id) WHERE session_id IS NOT NULL;

-- Analytics summary table (aggregated daily metrics)
CREATE TABLE artisan_analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  date date NOT NULL,
  profile_views int DEFAULT 0,
  unique_visitors int DEFAULT 0,
  favorites_added int DEFAULT 0,
  favorites_removed int DEFAULT 0,
  contact_requests int DEFAULT 0,
  image_views int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(artisan_id, date)
);

-- Indexes for summary table
CREATE INDEX idx_analytics_summary_artisan_id ON artisan_analytics_summary(artisan_id);
CREATE INDEX idx_analytics_summary_date ON artisan_analytics_summary(date);

-- RLS policies
ALTER TABLE artisan_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (for anonymous tracking)
CREATE POLICY "Anyone can create analytics events"
  ON artisan_analytics_events FOR INSERT
  WITH CHECK (true);

-- Artisans can only read their own analytics events
CREATE POLICY "Artisans can read own analytics events"
  ON artisan_analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = artisan_analytics_events.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- Admins can read all analytics events
CREATE POLICY "Admins can read all analytics events"
  ON artisan_analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Artisans can only read their own analytics summary
CREATE POLICY "Artisans can read own analytics summary"
  ON artisan_analytics_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = artisan_analytics_summary.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- Admins can read all analytics summaries
CREATE POLICY "Admins can read all analytics summaries"
  ON artisan_analytics_summary FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to track an analytics event
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_artisan_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}',
  p_session_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id uuid;
  v_user_id uuid;
BEGIN
  -- Get current user ID (null if anonymous)
  v_user_id := auth.uid();

  -- Insert event
  INSERT INTO artisan_analytics_events (artisan_id, event_type, event_data, session_id, user_id)
  VALUES (p_artisan_id, p_event_type, p_event_data, p_session_id, v_user_id)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Function to get analytics summary for date range
CREATE OR REPLACE FUNCTION get_artisan_analytics(
  p_artisan_id uuid,
  p_start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date date,
  profile_views int,
  unique_visitors int,
  favorites_added int,
  favorites_removed int,
  contact_requests int,
  image_views int
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    date,
    profile_views,
    unique_visitors,
    favorites_added,
    favorites_removed,
    contact_requests,
    image_views
  FROM artisan_analytics_summary
  WHERE artisan_id = p_artisan_id
  AND date >= p_start_date
  AND date <= p_end_date
  ORDER BY date ASC;
$$;

-- Function to get real-time analytics (from events, not summary)
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
  AND created_at >= CURRENT_DATE - (p_days || ' days')::interval;
$$;

-- Function to aggregate daily analytics (run via cron job)
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(p_date date DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO artisan_analytics_summary (
    artisan_id,
    date,
    profile_views,
    unique_visitors,
    favorites_added,
    favorites_removed,
    contact_requests,
    image_views,
    updated_at
  )
  SELECT
    artisan_id,
    p_date,
    COUNT(*) FILTER (WHERE event_type = 'profile_view') as profile_views,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'profile_view') as unique_visitors,
    COUNT(*) FILTER (WHERE event_type = 'favorite_added') as favorites_added,
    COUNT(*) FILTER (WHERE event_type = 'favorite_removed') as favorites_removed,
    COUNT(*) FILTER (WHERE event_type = 'contact_sent') as contact_requests,
    COUNT(*) FILTER (WHERE event_type = 'image_view') as image_views,
    now()
  FROM artisan_analytics_events
  WHERE DATE(created_at) = p_date
  GROUP BY artisan_id
  ON CONFLICT (artisan_id, date)
  DO UPDATE SET
    profile_views = EXCLUDED.profile_views,
    unique_visitors = EXCLUDED.unique_visitors,
    favorites_added = EXCLUDED.favorites_added,
    favorites_removed = EXCLUDED.favorites_removed,
    contact_requests = EXCLUDED.contact_requests,
    image_views = EXCLUDED.image_views,
    updated_at = now();
END;
$$;

-- Grant permissions for the tracking function (allow public access)
GRANT EXECUTE ON FUNCTION track_analytics_event TO authenticated;
GRANT EXECUTE ON FUNCTION track_analytics_event TO anon;

-- Grant permissions for analytics retrieval
GRANT EXECUTE ON FUNCTION get_artisan_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_artisan_analytics_realtime TO authenticated;
