-- =====================================================
-- FIX: Remove SECURITY DEFINER from view
-- =====================================================

-- Drop the existing view
DROP VIEW IF EXISTS public.artisans_public;

-- Recreate as a regular view (not SECURITY DEFINER)
-- This view excludes email and precise GPS coordinates
CREATE VIEW public.artisans_public AS
SELECT 
  id,
  user_id,
  craft_type,
  location,
  bio,
  story,
  website,
  instagram,
  -- Email is EXCLUDED for privacy
  featured,
  -- Precise coordinates are EXCLUDED for safety
  -- latitude is EXCLUDED
  -- longitude is EXCLUDED
  created_at,
  updated_at
FROM public.artisans;

-- Grant public read access to the view
GRANT SELECT ON public.artisans_public TO anon, authenticated;

-- Add helpful comment
COMMENT ON VIEW public.artisans_public IS 
  'Public-facing view of artisan profiles. Excludes sensitive data like email addresses and precise GPS coordinates to protect user privacy and safety.';