-- Add username column to profiles table with unique constraint
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Add check constraint for username format (alphanumeric + underscores, 3-20 chars)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (
  username ~* '^[a-zA-Z0-9_]{3,20}$'
);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.username IS 'Unique username for login, 3-20 alphanumeric characters and underscores';

-- Create a function to validate password strength (for reference/frontend use)
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Minimum 8 characters
  -- At least one uppercase letter
  -- At least one lowercase letter
  -- At least one number
  -- At least one special character
  RETURN password ~ '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$';
END;
$$;

COMMENT ON FUNCTION public.validate_password_strength IS 'Validates password contains: 8+ chars, uppercase, lowercase, number, special char';

-- Update trigger for profile creation to handle username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Function to get user_id by username (helper for auth lookups)
CREATE OR REPLACE FUNCTION public.get_user_id_by_username(_username TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.profiles
  WHERE username = _username
  LIMIT 1;
$$;