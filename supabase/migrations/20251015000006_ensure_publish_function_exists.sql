-- Ensure publish_artisan_profile function exists and is properly configured
-- This migration checks and recreates the function if needed

-- First, check if the function exists and drop it if it does
DROP FUNCTION IF EXISTS public.publish_artisan_profile(uuid, uuid);

-- Create the function with proper error handling
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
  -- Validate input parameters
  IF _artisan_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'errors', jsonb_build_array('Artisan ID is required'));
  END IF;
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'errors', jsonb_build_array('User ID is required'));
  END IF;

  -- Fetch artisan record
  SELECT * INTO _artisan
  FROM public.artisans
  WHERE id = _artisan_id AND user_id = _user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'errors', jsonb_build_array('Artisan profile not found'));
  END IF;

  -- Validate required fields
  IF _artisan.craft_type IS NULL OR _artisan.craft_type = '' THEN
    _errors := _errors || jsonb_build_array('Category/craft type is required');
  END IF;

  IF _artisan.bio IS NULL OR _artisan.bio = '' THEN
    _errors := _errors || jsonb_build_array('Bio is required');
  END IF;

  IF _artisan.location IS NULL OR _artisan.location = '' THEN
    _errors := _errors || jsonb_build_array('Location is required');
  END IF;

  -- Check minimum media count
  SELECT COUNT(*) INTO _gallery_count
  FROM public.gallery_images
  WHERE artisan_id = _artisan_id;

  IF _gallery_count < 3 THEN
    _errors := _errors || jsonb_build_array('At least 3 images required (currently: ' || _gallery_count || ')');
  END IF;

  -- Check at least one contact method
  IF (_artisan.contact_value IS NULL OR _artisan.contact_value = '')
     AND (_artisan.email IS NULL OR _artisan.email = '')
     AND (_artisan.phone IS NULL OR _artisan.phone = '')
     AND (_artisan.instagram IS NULL OR _artisan.instagram = '')
     AND (_artisan.whatsapp_url IS NULL OR _artisan.whatsapp_url = '') THEN
    _errors := _errors || jsonb_build_array('At least one contact method is required');
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

  -- Update user role to artisan (only if user_roles table exists)
  BEGIN
    UPDATE public.user_roles
    SET role = 'artisan'::app_role
    WHERE user_id = _user_id;
  EXCEPTION
    WHEN undefined_table THEN
      -- user_roles table doesn't exist, skip this step
      NULL;
  END;

  RETURN jsonb_build_object('success', true, 'artisan_id', _artisan_id);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.publish_artisan_profile(uuid, uuid) TO authenticated;
