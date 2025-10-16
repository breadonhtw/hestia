-- Create artisan badges system
-- Badges recognize artisan achievements and qualities

-- Badge types table for defining available badges
CREATE TABLE badge_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key text UNIQUE NOT NULL, -- 'verified', 'top_rated', 'quick_responder', etc.
  name text NOT NULL,
  description text,
  icon text, -- icon name or emoji
  color text, -- hex color for badge styling
  is_auto_awarded boolean DEFAULT false, -- can be automatically calculated
  created_at timestamptz DEFAULT now()
);

-- Artisan badges (junction table)
CREATE TABLE artisan_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  awarded_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- for time-limited badges
  metadata jsonb DEFAULT '{}', -- flexible data like {"year": 2020, "rating": 4.8}
  awarded_by uuid REFERENCES profiles(id), -- null if auto-awarded
  UNIQUE(artisan_id, badge_key)
);

-- Indexes for performance
CREATE INDEX idx_artisan_badges_artisan_id ON artisan_badges(artisan_id);
CREATE INDEX idx_artisan_badges_badge_key ON artisan_badges(badge_key);
CREATE INDEX idx_artisan_badges_expires_at ON artisan_badges(expires_at) WHERE expires_at IS NOT NULL;

-- RLS policies
ALTER TABLE badge_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_badges ENABLE ROW LEVEL SECURITY;

-- Everyone can read badge types
CREATE POLICY "Badge types are publicly readable"
  ON badge_types FOR SELECT
  USING (true);

-- Everyone can read artisan badges
CREATE POLICY "Artisan badges are publicly readable"
  ON artisan_badges FOR SELECT
  USING (true);

-- Only admins can manage badge types
CREATE POLICY "Admins can manage badge types"
  ON badge_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can award/revoke badges
CREATE POLICY "Admins can manage artisan badges"
  ON artisan_badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert initial badge types
INSERT INTO badge_types (badge_key, name, description, icon, color, is_auto_awarded) VALUES
  ('verified', 'Verified', 'Verified by Hestia team', '✓', '#3b82f6', false),
  ('top_rated', 'Top Rated', 'Maintains high ratings from community', '⭐', '#f59e0b', true),
  ('quick_responder', 'Quick Responder', 'Responds to inquiries within 24 hours', '⚡', '#10b981', true),
  ('eco_friendly', 'Eco-Friendly', 'Uses sustainable materials and practices', '🌿', '#059669', false),
  ('workshop_host', 'Workshop Host', 'Offers classes and workshops', '🎓', '#8b5cf6', false),
  ('featured_artisan', 'Featured', 'Featured artisan of the month', '✨', '#ec4899', false);

-- Function to get artisan badges with details
CREATE OR REPLACE FUNCTION get_artisan_badges(p_artisan_id uuid)
RETURNS TABLE (
  badge_key text,
  name text,
  description text,
  icon text,
  color text,
  awarded_at timestamptz,
  expires_at timestamptz,
  metadata jsonb
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ab.badge_key,
    bt.name,
    bt.description,
    bt.icon,
    bt.color,
    ab.awarded_at,
    ab.expires_at,
    ab.metadata
  FROM artisan_badges ab
  JOIN badge_types bt ON bt.badge_key = ab.badge_key
  WHERE ab.artisan_id = p_artisan_id
  AND (ab.expires_at IS NULL OR ab.expires_at > now())
  ORDER BY ab.awarded_at DESC;
$$;

-- Function to award a badge to an artisan
CREATE OR REPLACE FUNCTION award_badge(
  p_artisan_id uuid,
  p_badge_key text,
  p_metadata jsonb DEFAULT '{}',
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badge_id uuid;
BEGIN
  -- Check if badge type exists
  IF NOT EXISTS (SELECT 1 FROM badge_types WHERE badge_key = p_badge_key) THEN
    RAISE EXCEPTION 'Badge type % does not exist', p_badge_key;
  END IF;

  -- Insert or update badge
  INSERT INTO artisan_badges (artisan_id, badge_key, metadata, expires_at, awarded_by)
  VALUES (p_artisan_id, p_badge_key, p_metadata, p_expires_at, auth.uid())
  ON CONFLICT (artisan_id, badge_key)
  DO UPDATE SET
    metadata = p_metadata,
    expires_at = p_expires_at,
    awarded_at = now(),
    awarded_by = auth.uid()
  RETURNING id INTO v_badge_id;

  RETURN v_badge_id;
END;
$$;

-- Function to revoke a badge from an artisan
CREATE OR REPLACE FUNCTION revoke_badge(
  p_artisan_id uuid,
  p_badge_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM artisan_badges
  WHERE artisan_id = p_artisan_id
  AND badge_key = p_badge_key;

  RETURN FOUND;
END;
$$;

-- Update artisans_public view to include badges
DROP VIEW IF EXISTS artisans_public;
CREATE VIEW artisans_public AS
SELECT
  a.id,
  a.user_id,
  a.craft_type,
  a.location,
  a.bio,
  a.story,
  a.instagram,
  a.website,
  a.featured,
  a.accepting_orders,
  a.open_for_commissions,
  a.created_at,
  a.updated_at,
  a.published_at,
  a.categories,
  a.tags,
  a.estate,
  a.contact_channel,
  a.contact_value,
  a.email,
  a.phone,
  a.accepting_orders_expires_at,
  a.pricing_model,
  a.price_min,
  a.price_max,
  a.currency,
  a.whatsapp_url,
  a.external_shop_url,
  a.lead_time_days,
  a.hours,
  p.full_name,
  p.username,
  p.avatar_url,
  -- Aggregate gallery images
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', gi.id,
        'image_url', gi.image_url,
        'title', gi.title,
        'description', gi.description,
        'display_order', gi.display_order,
        'is_featured', gi.is_featured
      ) ORDER BY jsonb_build_object(
        'id', gi.id,
        'image_url', gi.image_url,
        'title', gi.title,
        'description', gi.description,
        'display_order', gi.display_order,
        'is_featured', gi.is_featured
      )
    ) FILTER (WHERE gi.id IS NOT NULL),
    '[]'::json
  ) AS gallery_images,
  -- Aggregate badges
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'badge_key', ab.badge_key,
        'name', bt.name,
        'description', bt.description,
        'icon', bt.icon,
        'color', bt.color,
        'awarded_at', ab.awarded_at,
        'metadata', ab.metadata
      ) ORDER BY jsonb_build_object(
        'badge_key', ab.badge_key,
        'name', bt.name,
        'description', bt.description,
        'icon', bt.icon,
        'color', bt.color,
        'awarded_at', ab.awarded_at,
        'metadata', ab.metadata
      )
    ) FILTER (WHERE ab.id IS NOT NULL AND (ab.expires_at IS NULL OR ab.expires_at > now())),
    '[]'::json
  ) AS badges
FROM artisans a
JOIN profiles p ON p.id = a.user_id
LEFT JOIN gallery_images gi ON gi.artisan_id = a.id
LEFT JOIN artisan_badges ab ON ab.artisan_id = a.id
LEFT JOIN badge_types bt ON bt.badge_key = ab.badge_key
WHERE a.status = 'published'
GROUP BY a.id, p.id;

-- Grant permissions
GRANT SELECT ON artisans_public TO authenticated;
GRANT SELECT ON artisans_public TO anon;
