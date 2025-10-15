-- Remove languages from artisans and update the public view

-- 1) Drop dependent view first
DROP VIEW IF EXISTS public.artisans_public;

-- 2) Drop column if exists
ALTER TABLE public.artisans
  DROP COLUMN IF EXISTS languages;

-- 3) Recreate artisans_public view without languages
CREATE VIEW public.artisans_public AS
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
  a.categories,
  a.tags,
  a.estate,
  a.contact_channel,
  a.contact_value,
  a.email,
  a.phone,
  a.accepting_orders_expires_at,
  p.full_name,
  p.username,
  p.avatar_url
FROM public.artisans a
JOIN public.profiles p ON p.id = a.user_id;

GRANT SELECT ON public.artisans_public TO anon, authenticated;


