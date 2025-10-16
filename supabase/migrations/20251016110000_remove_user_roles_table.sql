-- Remove redundant user_roles table and consolidate role management into profiles.role
-- This fixes the signup error by eliminating the need for two INSERTs during user creation

-- 1. Update handle_new_user() to only insert into profiles (no user_roles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  user_full_name text;
  user_username text;
  user_avatar_url text;
BEGIN
  -- Extract and validate user metadata
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_username := COALESCE(NEW.raw_user_meta_data->>'username', '');
  user_avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', '');
  
  -- Determine role from metadata (default to 'community_member')
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'community_member'::app_role
  );

  -- Insert profile with role (single INSERT - no user_roles needed!)
  INSERT INTO public.profiles (id, full_name, username, avatar_url, role)
  VALUES (
    NEW.id,
    user_full_name,
    user_username,
    user_avatar_url,
    user_role
  );

  -- Log successful user creation for debugging
  RAISE LOG 'Successfully created user profile for % with role %', NEW.id, user_role;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    -- Re-raise the error to prevent user creation
    RAISE;
END;
$$;

-- 2. Update publish_artisan_profile() to update profiles.role instead of user_roles
CREATE OR REPLACE FUNCTION public.publish_artisan_profile(
  _user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _artisan_id uuid;
  _errors jsonb := '[]'::jsonb;
  _artisan RECORD;
BEGIN
  -- Get artisan profile ID by user_id (not from profiles.artisan_profile_id)
  SELECT id INTO _artisan_id
  FROM public.artisans
  WHERE user_id = _user_id;

  IF _artisan_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No artisan profile found');
  END IF;

  -- Get artisan data for validation
  SELECT * INTO _artisan
  FROM public.artisans
  WHERE id = _artisan_id AND user_id = _user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Artisan profile not found');
  END IF;

  -- Validate required fields
  IF _artisan.craft_type IS NULL OR TRIM(_artisan.craft_type) = '' THEN
    _errors := _errors || '["Craft type is required"]'::jsonb;
  END IF;

  IF _artisan.location IS NULL OR TRIM(_artisan.location) = '' THEN
    _errors := _errors || '["Location is required"]'::jsonb;
  END IF;

  IF _artisan.bio IS NULL OR TRIM(_artisan.bio) = '' THEN
    _errors := _errors || '["Bio is required"]'::jsonb;
  END IF;

  -- Check pricing model consistency
  IF _artisan.pricing_model IS NOT NULL THEN
    IF _artisan.pricing_model = 'fixed' AND _artisan.price_min IS NULL THEN
      _errors := _errors || '["Fixed pricing requires a price"]'::jsonb;
    END IF;
  END IF;

  -- Return errors if any
  IF jsonb_array_length(_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'errors', _errors);
  END IF;

  -- Update artisan profile to published
  UPDATE public.artisans
  SET
    status = 'published',
    published_at = COALESCE(published_at, now()),
    profile_completed = true,
    updated_at = now()
  WHERE id = _artisan_id;

  -- Update user role to artisan in profiles table
  UPDATE public.profiles
  SET role = 'artisan'::app_role
  WHERE id = _user_id;

  RETURN jsonb_build_object('success', true, 'artisan_id', _artisan_id);
END;
$$;

-- 3. Update unpublish_artisan_profile() to update profiles.role instead of user_roles
CREATE OR REPLACE FUNCTION public.unpublish_artisan_profile(
  _user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _artisan_id uuid;
BEGIN
  -- Get artisan profile ID by user_id (not from profiles.artisan_profile_id)
  SELECT id INTO _artisan_id
  FROM public.artisans
  WHERE user_id = _user_id;

  IF _artisan_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update artisan profile to draft
  UPDATE public.artisans
  SET
    status = 'draft',
    published_at = NULL,
    accepting_orders = false,
    updated_at = now()
  WHERE id = _artisan_id AND user_id = _user_id;

  -- Keep role as artisan but they won't appear in discovery
  -- Optionally demote: UPDATE public.profiles SET role = 'community_member'::app_role WHERE id = _user_id;

  RETURN FOUND;
END;
$$;

-- 4. Drop the redundant user_roles table
DROP TABLE IF EXISTS public.user_roles;

-- 5. Optionally drop the redundant artisan_profile_id column from profiles
-- (artisans.user_id already has UNIQUE constraint, so this is redundant)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS artisan_profile_id;

-- 6. Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile record when a new user signs up. Role is stored in profiles.role only.';
COMMENT ON FUNCTION public.publish_artisan_profile(uuid) IS 'Publishes artisan profile and updates profiles.role to artisan.';
COMMENT ON FUNCTION public.unpublish_artisan_profile(uuid) IS 'Unpublishes artisan profile. Role remains artisan but profile is hidden.';
