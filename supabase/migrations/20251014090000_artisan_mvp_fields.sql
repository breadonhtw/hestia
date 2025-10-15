-- Artisan MVP fields: contact channel enum, new columns, and public view update

-- 1) Create enum for contact channel if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_channel_type') THEN
    CREATE TYPE public.contact_channel_type AS ENUM ('chat', 'instagram', 'website', 'email', 'phone');
  END IF;
END$$;

-- 2) Add new columns to artisans table (idempotent with IF NOT EXISTS)
ALTER TABLE public.artisans
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estate text NULL,
  ADD COLUMN IF NOT EXISTS contact_channel public.contact_channel_type NOT NULL DEFAULT 'chat',
  ADD COLUMN IF NOT EXISTS contact_value text NULL,
  ADD COLUMN IF NOT EXISTS email text NULL,
  ADD COLUMN IF NOT EXISTS phone text NULL,
  ADD COLUMN IF NOT EXISTS accepting_orders_expires_at timestamptz NULL;

-- 3) Recreate artisans_public view to include profile fields and new artisan fields
DROP VIEW IF EXISTS public.artisans_public;

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
  -- New MVP fields
  a.categories,
  a.tags,
  a.languages,
  a.estate,
  a.contact_channel,
  a.contact_value,
  a.email,
  a.phone,
  a.accepting_orders_expires_at,
  -- Profile fields for display
  p.full_name,
  p.username,
  p.avatar_url
FROM public.artisans a
JOIN public.profiles p ON p.id = a.user_id;

-- 4) Grant select on the view to anon and authenticated (if RLS setup requires)
GRANT SELECT ON public.artisans_public TO anon, authenticated;


