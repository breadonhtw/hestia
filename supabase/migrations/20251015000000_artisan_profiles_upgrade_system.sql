-- Migration: Artisan Profiles Upgrade System
-- Converts artisans table to support draft/published status and community-first signup

-- 1. Add status column to artisans table
ALTER TABLE public.artisans
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- 2. Add published_at timestamp
ALTER TABLE public.artisans
  ADD COLUMN IF NOT EXISTS published_at timestamptz NULL;

-- 3. Add pricing model fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_model_type') THEN
    CREATE TYPE public.pricing_model_type AS ENUM ('fixed', 'range', 'contact');
  END IF;
END$$;

ALTER TABLE public.artisans
  ADD COLUMN IF NOT EXISTS pricing_model public.pricing_model_type NULL,
  ADD COLUMN IF NOT EXISTS price_min decimal(10,2) NULL,
  ADD COLUMN IF NOT EXISTS price_max decimal(10,2) NULL,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- 4. Add additional contact fields
ALTER TABLE public.artisans
  ADD COLUMN IF NOT EXISTS whatsapp_url text NULL,
  ADD COLUMN IF NOT EXISTS external_shop_url text NULL,
  ADD COLUMN IF NOT EXISTS lead_time_days integer NULL,
  ADD COLUMN IF NOT EXISTS hours jsonb NULL;

-- 5. Update profiles table to track artisan_profile_id
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS artisan_profile_id uuid NULL,
  ADD CONSTRAINT fk_artisan_profile FOREIGN KEY (artisan_profile_id) REFERENCES public.artisans(id) ON DELETE SET NULL;

-- 6. Create index on artisan status for faster queries
CREATE INDEX IF NOT EXISTS idx_artisans_status ON public.artisans(status);
CREATE INDEX IF NOT EXISTS idx_artisans_published ON public.artisans(status, published_at) WHERE status = 'published';

-- 7. Update handle_new_user() to ONLY create community members by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile (always community_member initially)
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );

  -- Insert role (always community_member)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'community_member'::app_role);

  -- No automatic artisan record creation - users must upgrade through the UI

  RETURN NEW;
END;
$$;

-- 8. Create function to upgrade user to artisan and create draft profile
CREATE OR REPLACE FUNCTION public.create_artisan_profile(
  _user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _artisan_id uuid;
BEGIN
  -- Check if user already has an artisan profile
  SELECT artisan_profile_id INTO _artisan_id
  FROM public.profiles
  WHERE id = _user_id;

  IF _artisan_id IS NOT NULL THEN
    RETURN _artisan_id;
  END IF;

  -- Create draft artisan profile with minimal required fields
  INSERT INTO public.artisans (
    user_id,
    craft_type,
    location,
    bio,
    status,
    accepting_orders,
    open_for_commissions,
    profile_completed,
    featured,
    categories,
    created_at,
    updated_at
  ) VALUES (
    _user_id,
    '',
    '',
    '',
    'draft',
    false,
    false,
    false,
    false,
    '{}',
    now(),
    now()
  )
  RETURNING id INTO _artisan_id;

  -- Update profile to link the artisan record
  UPDATE public.profiles
  SET artisan_profile_id = _artisan_id
  WHERE id = _user_id;

  RETURN _artisan_id;
END;
$$;

-- 9. Create function to publish artisan profile
CREATE OR REPLACE FUNCTION public.publish_artisan_profile(
  _artisan_id uuid,
  _user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _artisan record;
  _errors jsonb := '[]'::jsonb;
  _gallery_count integer;
BEGIN
  -- Fetch artisan record
  SELECT * INTO _artisan
  FROM public.artisans
  WHERE id = _artisan_id AND user_id = _user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'errors', jsonb_build_array('Artisan profile not found'));
  END IF;

  -- Validate required fields
  IF _artisan.craft_type IS NULL OR _artisan.craft_type = '' THEN
    _errors := _errors || '["Category/craft type is required"]'::jsonb;
  END IF;

  IF _artisan.bio IS NULL OR _artisan.bio = '' THEN
    _errors := _errors || '["Bio is required"]'::jsonb;
  END IF;

  IF _artisan.location IS NULL OR _artisan.location = '' THEN
    _errors := _errors || '["Location is required"]'::jsonb;
  END IF;

  -- Categories validation removed - craft_type is used instead

  -- Check minimum media count
  SELECT COUNT(*) INTO _gallery_count
  FROM public.gallery_images
  WHERE artisan_id = _artisan_id;

  IF _gallery_count < 3 THEN
    _errors := _errors || jsonb_build_array('At least 3 images required (currently: ' || _gallery_count || ')');
  END IF;

  -- Check pricing model consistency
  IF _artisan.pricing_model IS NOT NULL THEN
    IF _artisan.pricing_model = 'fixed' AND _artisan.price_min IS NULL THEN
      _errors := _errors || '["Fixed pricing requires a price"]'::jsonb;
    END IF;

    IF _artisan.pricing_model = 'range' AND (_artisan.price_min IS NULL OR _artisan.price_max IS NULL) THEN
      _errors := _errors || '["Range pricing requires both minimum and maximum price"]'::jsonb;
    END IF;
  END IF;

  -- Check at least one contact method
  IF (_artisan.contact_value IS NULL OR _artisan.contact_value = '')
     AND (_artisan.email IS NULL OR _artisan.email = '')
     AND (_artisan.phone IS NULL OR _artisan.phone = '')
     AND (_artisan.instagram IS NULL OR _artisan.instagram = '')
     AND (_artisan.whatsapp_url IS NULL OR _artisan.whatsapp_url = '') THEN
    _errors := _errors || '["At least one contact method is required"]'::jsonb;
  END IF;

  -- Return errors if validation failed
  IF jsonb_array_length(_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'errors', _errors);
  END IF;

  -- Update artisan to published
  UPDATE public.artisans
  SET
    status = 'published',
    published_at = now(),
    profile_completed = true,
    updated_at = now()
  WHERE id = _artisan_id;

  -- Update user role to artisan
  UPDATE public.user_roles
  SET role = 'artisan'::app_role
  WHERE user_id = _user_id;

  RETURN jsonb_build_object('success', true, 'artisan_id', _artisan_id);
END;
$$;

-- 10. Update artisans_public view to only show published artisans
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
WHERE a.status = 'published';  -- Only show published artisans

GRANT SELECT ON public.artisans_public TO anon, authenticated;

-- 11. Create function to unpublish artisan (optional demotion)
CREATE OR REPLACE FUNCTION public.unpublish_artisan_profile(
  _artisan_id uuid,
  _user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update artisan to draft status
  UPDATE public.artisans
  SET
    status = 'draft',
    accepting_orders = false,
    updated_at = now()
  WHERE id = _artisan_id AND user_id = _user_id;

  -- Keep role as artisan but they won't appear in discovery
  -- Optionally demote: UPDATE public.user_roles SET role = 'community_member'::app_role WHERE user_id = _user_id;

  RETURN FOUND;
END;
$$;

-- 12. Migrate existing artisan records to published status
UPDATE public.artisans
SET
  status = 'published',
  published_at = COALESCE(published_at, created_at),
  profile_completed = true
WHERE status = 'draft' AND profile_completed = true;

-- 13. Update profiles table to link existing artisan records
UPDATE public.profiles p
SET artisan_profile_id = a.id
FROM public.artisans a
WHERE p.id = a.user_id AND p.artisan_profile_id IS NULL;

-- 14. Add RLS policies for artisan profile access
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;

-- Users can read their own draft artisan profiles
CREATE POLICY "Users can view own artisan profile"
  ON public.artisans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own artisan profiles
CREATE POLICY "Users can update own artisan profile"
  ON public.artisans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can create their own artisan profile (via function)
CREATE POLICY "Users can insert own artisan profile"
  ON public.artisans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anonymous and authenticated can view published artisans (via view)
-- This is already handled by the artisans_public view

COMMENT ON FUNCTION public.create_artisan_profile IS 'Creates a draft artisan profile for a user upgrading from community member';
COMMENT ON FUNCTION public.publish_artisan_profile IS 'Validates and publishes an artisan profile, upgrading user role';
COMMENT ON FUNCTION public.unpublish_artisan_profile IS 'Unpublishes an artisan profile, hiding from discovery';
