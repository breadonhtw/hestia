-- Create collections system for curating groups of artisans
-- Supports admin-curated collections like "Wedding Artisans", "Eco-Friendly Crafters", etc.

-- Collections table
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  cover_image_url text,
  collection_type text DEFAULT 'curated', -- 'curated' (admin), 'auto' (algorithm), 'user' (future)
  is_featured boolean DEFAULT false, -- show on homepage
  display_order int DEFAULT 0, -- for sorting featured collections
  created_by uuid REFERENCES profiles(id),
  status text DEFAULT 'published', -- 'draft', 'published', 'archived'
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collection artisans junction table
CREATE TABLE collection_artisans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  display_order int DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  added_by uuid REFERENCES profiles(id),
  UNIQUE(collection_id, artisan_id)
);

-- Indexes for performance
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_status ON collections(status);
CREATE INDEX idx_collections_is_featured ON collections(is_featured) WHERE is_featured = true;
CREATE INDEX idx_collections_display_order ON collections(display_order);
CREATE INDEX idx_collection_artisans_collection_id ON collection_artisans(collection_id);
CREATE INDEX idx_collection_artisans_artisan_id ON collection_artisans(artisan_id);
CREATE INDEX idx_collection_artisans_display_order ON collection_artisans(display_order);

-- RLS policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_artisans ENABLE ROW LEVEL SECURITY;

-- Everyone can read published collections
CREATE POLICY "Published collections are publicly readable"
  ON collections FOR SELECT
  USING (status = 'published');

-- Admins can manage all collections
CREATE POLICY "Admins can manage collections"
  ON collections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Everyone can read collection artisans for published collections
CREATE POLICY "Collection artisans are publicly readable"
  ON collection_artisans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_artisans.collection_id
      AND collections.status = 'published'
    )
  );

-- Admins can manage collection artisans
CREATE POLICY "Admins can manage collection artisans"
  ON collection_artisans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to create a collection
CREATE OR REPLACE FUNCTION create_collection(
  p_title text,
  p_slug text,
  p_description text DEFAULT NULL,
  p_cover_image_url text DEFAULT NULL,
  p_is_featured boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_collection_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create collections';
  END IF;

  INSERT INTO collections (
    title,
    slug,
    description,
    cover_image_url,
    is_featured,
    created_by,
    status,
    published_at
  ) VALUES (
    p_title,
    p_slug,
    p_description,
    p_cover_image_url,
    p_is_featured,
    auth.uid(),
    'published',
    now()
  )
  RETURNING id INTO v_collection_id;

  RETURN v_collection_id;
END;
$$;

-- Function to add artisan to collection
CREATE OR REPLACE FUNCTION add_artisan_to_collection(
  p_collection_id uuid,
  p_artisan_id uuid,
  p_display_order int DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can add artisans to collections';
  END IF;

  INSERT INTO collection_artisans (collection_id, artisan_id, display_order, added_by)
  VALUES (p_collection_id, p_artisan_id, p_display_order, auth.uid())
  ON CONFLICT (collection_id, artisan_id)
  DO UPDATE SET
    display_order = p_display_order,
    added_at = now(),
    added_by = auth.uid()
  RETURNING id INTO v_id;

  -- Update collection updated_at
  UPDATE collections
  SET updated_at = now()
  WHERE id = p_collection_id;

  RETURN v_id;
END;
$$;

-- Function to remove artisan from collection
CREATE OR REPLACE FUNCTION remove_artisan_from_collection(
  p_collection_id uuid,
  p_artisan_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can remove artisans from collections';
  END IF;

  DELETE FROM collection_artisans
  WHERE collection_id = p_collection_id
  AND artisan_id = p_artisan_id;

  -- Update collection updated_at
  UPDATE collections
  SET updated_at = now()
  WHERE id = p_collection_id;

  RETURN FOUND;
END;
$$;

-- Function to get collection with artisans
CREATE OR REPLACE FUNCTION get_collection_with_artisans(p_collection_slug text)
RETURNS json
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'id', c.id,
    'title', c.title,
    'slug', c.slug,
    'description', c.description,
    'cover_image_url', c.cover_image_url,
    'is_featured', c.is_featured,
    'created_at', c.created_at,
    'artisan_count', COUNT(ca.artisan_id),
    'artisans', COALESCE(
      json_agg(
        json_build_object(
          'id', ap.id,
          'username', ap.username,
          'full_name', ap.full_name,
          'avatar_url', ap.avatar_url,
          'craft_type', ap.craft_type,
          'bio', ap.bio,
          'location', ap.location,
          'categories', ap.categories,
          'tags', ap.tags,
          'badges', ap.badges,
          'gallery_images', ap.gallery_images
        ) ORDER BY ca.display_order, ca.added_at
      ) FILTER (WHERE ap.id IS NOT NULL),
      '[]'::json
    )
  )
  FROM collections c
  LEFT JOIN collection_artisans ca ON ca.collection_id = c.id
  LEFT JOIN artisans_public ap ON ap.id = ca.artisan_id
  WHERE c.slug = p_collection_slug
  AND c.status = 'published'
  GROUP BY c.id;
$$;

-- Function to get featured collections with preview artisans
CREATE OR REPLACE FUNCTION get_featured_collections()
RETURNS json
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', c.id,
        'title', c.title,
        'slug', c.slug,
        'description', c.description,
        'cover_image_url', c.cover_image_url,
        'artisan_count', (
          SELECT COUNT(*)
          FROM collection_artisans ca2
          WHERE ca2.collection_id = c.id
        ),
        'preview_artisans', (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', ap.id,
                'username', ap.username,
                'full_name', ap.full_name,
                'avatar_url', ap.avatar_url,
                'craft_type', ap.craft_type
              )
            ),
            '[]'::json
          )
          FROM (
            SELECT ap2.*
            FROM collection_artisans ca3
            JOIN artisans_public ap2 ON ap2.id = ca3.artisan_id
            WHERE ca3.collection_id = c.id
            ORDER BY ca3.display_order, ca3.added_at
            LIMIT 4
          ) ap
        )
      ) ORDER BY c.display_order, c.created_at DESC
    ),
    '[]'::json
  )
  FROM collections c
  WHERE c.status = 'published'
  AND c.is_featured = true;
$$;

-- Insert some initial collections (examples)
INSERT INTO collections (title, slug, description, is_featured, display_order, collection_type, status, published_at)
VALUES
  ('Wedding Artisans', 'wedding-artisans', 'Discover talented artisans perfect for your special day - from custom invitations to handmade favors', true, 1, 'curated', 'published', now()),
  ('Sustainable Crafters', 'sustainable-crafters', 'Meet artisans committed to eco-friendly materials and sustainable practices', true, 2, 'curated', 'published', now()),
  ('Home & Decor', 'home-decor', 'Artisans creating beautiful pieces to make your house a home', true, 3, 'curated', 'published', now()),
  ('New Artisans', 'new-artisans', 'Welcome our newest members to the Hestia community', false, 4, 'auto', 'published', now());

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_collection TO authenticated;
GRANT EXECUTE ON FUNCTION add_artisan_to_collection TO authenticated;
GRANT EXECUTE ON FUNCTION remove_artisan_from_collection TO authenticated;
GRANT EXECUTE ON FUNCTION get_collection_with_artisans TO authenticated;
GRANT EXECUTE ON FUNCTION get_collection_with_artisans TO anon;
GRANT EXECUTE ON FUNCTION get_featured_collections TO authenticated;
GRANT EXECUTE ON FUNCTION get_featured_collections TO anon;
