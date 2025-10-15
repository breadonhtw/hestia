-- Add full_name column to profiles table
-- This fixes the PGRST204 error about missing full_name column

-- Add full_name column if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text;

-- Update existing records to populate full_name
-- If display_name exists, copy it to full_name
-- Otherwise, use username or a default value
UPDATE public.profiles 
SET full_name = COALESCE(
  display_name,  -- if display_name column exists
  username,      -- fallback to username
  'User'         -- final fallback
)
WHERE full_name IS NULL OR full_name = '';

-- Make full_name NOT NULL with a default
ALTER TABLE public.profiles
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN full_name SET DEFAULT 'User';

-- Check if display_name column exists and drop it safely
-- First, let's drop any views that might depend on it
DO $$
BEGIN
  -- Drop the artisans_public view if it exists (we'll recreate it)
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'artisans_public' AND table_schema = 'public') THEN
    DROP VIEW public.artisans_public CASCADE;
  END IF;
  
  -- Now we can safely drop the display_name column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name' AND table_schema = 'public') THEN
    ALTER TABLE public.profiles DROP COLUMN display_name;
  END IF;
END $$;

-- Recreate the artisans_public view with the correct schema
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
  p.avatar_url
FROM public.artisans a
JOIN public.profiles p ON p.id = a.user_id
WHERE a.status = 'published';

-- Grant permissions on the view
GRANT SELECT ON public.artisans_public TO anon, authenticated;
