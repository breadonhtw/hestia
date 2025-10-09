-- =====================================================
-- FIX: Enable SECURITY INVOKER on artisans_public view
-- =====================================================

-- Drop the existing view
DROP VIEW IF EXISTS public.artisans_public;

-- Recreate with SECURITY INVOKER enabled
-- This ensures the view respects RLS policies of the querying user
CREATE VIEW public.artisans_public
WITH (security_invoker=on)
AS
SELECT 
  id,
  user_id,
  craft_type,
  location,
  bio,
  story,
  website,
  instagram,
  featured,
  created_at,
  updated_at
FROM public.artisans;

-- Grant public read access to the view
GRANT SELECT ON public.artisans_public TO anon, authenticated;

-- Add helpful comment
COMMENT ON VIEW public.artisans_public IS 
  'Public-facing view of artisan profiles. Excludes sensitive data like email addresses and precise GPS coordinates. Uses SECURITY INVOKER to respect RLS policies.';