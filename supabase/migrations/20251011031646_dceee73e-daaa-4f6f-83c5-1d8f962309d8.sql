-- Add availability columns to artisans table
ALTER TABLE public.artisans 
ADD COLUMN IF NOT EXISTS accepting_orders BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS open_for_commissions BOOLEAN DEFAULT false;

-- Update the artisans_public view to include new columns
DROP VIEW IF EXISTS public.artisans_public;

CREATE VIEW public.artisans_public AS
SELECT 
  a.id,
  a.user_id,
  a.bio,
  a.location,
  a.craft_type,
  a.featured,
  a.created_at,
  a.updated_at,
  a.instagram,
  a.website,
  a.story,
  a.accepting_orders,
  a.open_for_commissions,
  p.username,
  p.full_name,
  p.avatar_url
FROM public.artisans a
LEFT JOIN public.profiles p ON p.id = a.user_id;