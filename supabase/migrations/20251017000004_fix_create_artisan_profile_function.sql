-- Fix create_artisan_profile function to not use removed artisan_profile_id column
-- This function should only create the artisan record, not update profiles table

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
  SELECT id INTO _artisan_id
  FROM public.artisans
  WHERE user_id = _user_id;

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

  -- No need to update profiles table - the relationship is via artisans.user_id
  -- which already has a UNIQUE constraint

  RETURN _artisan_id;
END;
$$;

COMMENT ON FUNCTION public.create_artisan_profile IS 'Creates a draft artisan profile for a user upgrading from community member. No longer updates profiles table since artisan_profile_id column was removed.';

