-- Create helper function to insert artisan profiles with elevated privileges
CREATE OR REPLACE FUNCTION public.create_artisan_profile(
  _user_id UUID,
  _email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.artisans (user_id, bio, location, craft_type, email)
  VALUES (_user_id, '', '', '', _email);
END;
$$;

-- Update the handle_new_user trigger to use the helper function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );

  -- Determine role from metadata (default to 'community_member')
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'community_member'::app_role
  );

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  -- If artisan role, create artisan record using helper function
  IF user_role = 'artisan' THEN
    PERFORM public.create_artisan_profile(NEW.id, NEW.email);
  END IF;

  RETURN NEW;
END;
$function$;