-- Performance optimization indexes for Hestia platform
-- Created: 2025-10-18
-- Purpose: Speed up common queries on Browse and Search pages

-- Index for filtering by craft type (used heavily on Browse page)
CREATE INDEX IF NOT EXISTS idx_artisans_craft_type_published
  ON artisans(craft_type)
  WHERE status = 'published';

-- Index for filtering by location
CREATE INDEX IF NOT EXISTS idx_artisans_location_published
  ON artisans(location)
  WHERE status = 'published';

-- Index for sorting by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_artisans_created_desc
  ON artisans(created_at DESC)
  WHERE status = 'published';

-- Index for filtering featured artisans
CREATE INDEX IF NOT EXISTS idx_artisans_featured
  ON artisans(featured)
  WHERE featured = true AND status = 'published';

-- Index for filtering by availability flags
CREATE INDEX IF NOT EXISTS idx_artisans_accepting_orders
  ON artisans(accepting_orders)
  WHERE accepting_orders = true AND status = 'published';

CREATE INDEX IF NOT EXISTS idx_artisans_open_commissions
  ON artisans(open_for_commissions)
  WHERE open_for_commissions = true AND status = 'published';

-- Composite index for featured gallery images query
CREATE INDEX IF NOT EXISTS idx_gallery_artisan_featured
  ON gallery_images(artisan_id, is_featured)
  WHERE is_featured = true;

-- Index for username lookups (used in profile routing)
CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON profiles(username)
  WHERE username IS NOT NULL;

-- Analyze tables after index creation for query planner optimization
ANALYZE artisans;
ANALYZE gallery_images;
ANALYZE profiles;

-- Add comment for documentation
COMMENT ON INDEX idx_artisans_craft_type_published IS 'Speeds up Browse page filtering by craft type';
COMMENT ON INDEX idx_artisans_location_published IS 'Speeds up Browse page filtering by location';
COMMENT ON INDEX idx_artisans_created_desc IS 'Speeds up sorting by newest artisans';
COMMENT ON INDEX idx_gallery_artisan_featured IS 'Optimizes featured gallery image queries on profile pages';
