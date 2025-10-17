-- Transform collections system into publications/magazine system
-- Removes artisan curation, adds external magazine URLs

-- First, drop the collection_artisans junction table (no longer needed)
DROP TABLE IF EXISTS collection_artisans CASCADE;

-- Drop old collection-related functions
DROP FUNCTION IF EXISTS add_artisan_to_collection(uuid, uuid, int);
DROP FUNCTION IF EXISTS remove_artisan_from_collection(uuid, uuid);
DROP FUNCTION IF EXISTS get_collection_with_artisans(text);
DROP FUNCTION IF EXISTS get_featured_collections();
DROP FUNCTION IF EXISTS get_current_weekly_collection();
DROP FUNCTION IF EXISTS get_past_weekly_collections();
DROP FUNCTION IF EXISTS create_collection(text, text, text, text, boolean, timestamptz, timestamptz, int, text);

-- Rename collections table to publications
ALTER TABLE collections RENAME TO publications;

-- Add external_url field for magazine links
ALTER TABLE publications
ADD COLUMN IF NOT EXISTS external_url text;

-- Remove collection_type field (no longer needed)
ALTER TABLE publications
DROP COLUMN IF EXISTS collection_type,
DROP COLUMN IF EXISTS is_featured,
DROP COLUMN IF EXISTS display_order;

-- Update indexes
DROP INDEX IF EXISTS idx_collections_slug;
DROP INDEX IF EXISTS idx_collections_status;
DROP INDEX IF EXISTS idx_collections_is_featured;
DROP INDEX IF EXISTS idx_collections_display_order;
DROP INDEX IF EXISTS idx_collections_active_dates;
DROP INDEX IF EXISTS idx_collections_issue_number;

CREATE INDEX IF NOT EXISTS idx_publications_slug ON publications(slug);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_active_dates ON publications(active_from, active_until)
WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_publications_issue_number ON publications(issue_number)
WHERE issue_number IS NOT NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Published collections are publicly readable" ON publications;
DROP POLICY IF EXISTS "Admins can manage collections" ON publications;

CREATE POLICY "Published publications are publicly readable"
  ON publications FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage publications"
  ON publications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to get current week's publication/magazine
CREATE OR REPLACE FUNCTION get_current_weekly_publication()
RETURNS json
LANGUAGE sql
STABLE
AS $$
  SELECT json_build_object(
    'id', p.id,
    'title', p.title,
    'slug', p.slug,
    'description', p.description,
    'theme', p.theme,
    'cover_image_url', p.cover_image_url,
    'external_url', p.external_url,
    'issue_number', p.issue_number,
    'active_from', p.active_from,
    'active_until', p.active_until,
    'created_at', p.created_at
  )
  FROM publications p
  WHERE p.status = 'published'
  AND p.active_from IS NOT NULL
  AND p.active_until IS NOT NULL
  AND now() >= p.active_from
  AND now() < p.active_until
  ORDER BY p.issue_number DESC
  LIMIT 1;
$$;

-- Function to get past weekly publications (magazine archive)
CREATE OR REPLACE FUNCTION get_past_weekly_publications()
RETURNS json
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    json_agg(
      row_to_json(publication_data) ORDER BY publication_data.issue_number DESC
    ),
    '[]'::json
  )
  FROM (
    SELECT
      p.id,
      p.title,
      p.slug,
      p.description,
      p.theme,
      p.cover_image_url,
      p.external_url,
      p.issue_number,
      p.active_from,
      p.active_until
    FROM publications p
    WHERE p.status = 'published'
    AND p.active_from IS NOT NULL
    AND p.active_until IS NOT NULL
    AND now() >= p.active_until
    ORDER BY p.issue_number DESC
  ) publication_data;
$$;

-- Function to create a publication
CREATE OR REPLACE FUNCTION create_publication(
  p_title text,
  p_slug text,
  p_description text DEFAULT NULL,
  p_cover_image_url text DEFAULT NULL,
  p_external_url text DEFAULT NULL,
  p_active_from timestamptz DEFAULT NULL,
  p_active_until timestamptz DEFAULT NULL,
  p_issue_number int DEFAULT NULL,
  p_theme text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publication_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create publications';
  END IF;

  INSERT INTO publications (
    title,
    slug,
    description,
    cover_image_url,
    external_url,
    active_from,
    active_until,
    issue_number,
    theme,
    created_by,
    status,
    published_at
  ) VALUES (
    p_title,
    p_slug,
    p_description,
    p_cover_image_url,
    p_external_url,
    p_active_from,
    p_active_until,
    p_issue_number,
    p_theme,
    auth.uid(),
    'published',
    now()
  )
  RETURNING id INTO v_publication_id;

  RETURN v_publication_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_current_weekly_publication TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_weekly_publication TO anon;
GRANT EXECUTE ON FUNCTION get_past_weekly_publications TO authenticated;
GRANT EXECUTE ON FUNCTION get_past_weekly_publications TO anon;
GRANT EXECUTE ON FUNCTION create_publication TO authenticated;

-- Update existing data with placeholder external URLs
UPDATE publications
SET external_url = 'https://flipple.com/hestia-issue-' || issue_number
WHERE external_url IS NULL AND issue_number IS NOT NULL;
