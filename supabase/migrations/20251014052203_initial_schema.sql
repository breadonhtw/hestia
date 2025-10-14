-- Fix artisan signup and username login issues

-- 1. Fix the handle_new_user() function to remove automatic artisan record creation
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

  -- Note: Removed automatic artisan record creation
  -- Users will complete their artisan profile through the UI after signup

  RETURN NEW;
END;
$$;

-- 2. Create function to get email by username for login
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT u.email
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.username = _username
  LIMIT 1;
$$;