-- Recreate the artisans_public view without SECURITY DEFINER
-- This ensures the view uses the permissions of the querying user
DROP VIEW IF EXISTS public.artisans_public CASCADE;

CREATE VIEW public.artisans_public 
WITH (security_invoker = true) AS
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

-- Grant SELECT to all users for the public view
GRANT SELECT ON public.artisans_public TO anon, authenticated;