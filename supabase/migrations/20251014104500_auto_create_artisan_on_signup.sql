-- Auto-create an artisans row for users who sign up with role 'artisan'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Conditionally create an artisan record with safe defaults
  IF user_role = 'artisan'::app_role THEN
    INSERT INTO public.artisans (
      user_id,
      craft_type,
      location,
      bio,
      accepting_orders,
      open_for_commissions,
      profile_completed,
      featured,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      'Unspecified',
      '',
      '',
      false,
      false,
      false,
      false,
      now(),
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;




