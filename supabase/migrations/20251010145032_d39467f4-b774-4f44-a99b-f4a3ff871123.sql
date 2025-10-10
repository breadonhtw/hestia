-- Update handle_new_user() to assign roles based on metadata
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

  -- If artisan role, create artisan record placeholder
  IF user_role = 'artisan' THEN
    INSERT INTO public.artisans (user_id, bio, location, craft_type, email)
    VALUES (
      NEW.id,
      '',
      '',
      '',
      NEW.email
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  artisan_id UUID REFERENCES public.artisans(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, artisan_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON public.user_favorites;
CREATE POLICY "Users can add favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove favorites" ON public.user_favorites;
CREATE POLICY "Users can remove favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;