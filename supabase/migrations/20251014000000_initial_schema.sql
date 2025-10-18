-- Initial schema setup for Hestia
-- This migration creates the basic database structure

-- 1. Create custom types
CREATE TYPE public.app_role AS ENUM ('artisan', 'community_member', 'admin');
CREATE TYPE public.contact_channel_type AS ENUM ('chat', 'instagram', 'website', 'email', 'phone');
CREATE TYPE public.pricing_model_type AS ENUM ('fixed', 'range', 'contact');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  username text UNIQUE,
  avatar_url text,
  role app_role NOT NULL DEFAULT 'community_member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create artisans table
CREATE TABLE public.artisans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  craft_type text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  story text,
  instagram text,
  website text,
  featured boolean DEFAULT false,
  accepting_orders boolean DEFAULT false,
  open_for_commissions boolean DEFAULT false,
  profile_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Status and publishing fields
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  -- MVP fields
  categories text[] DEFAULT '{}',
  tags text[],
  estate text,
  contact_channel contact_channel_type DEFAULT 'instagram',
  contact_value text,
  email text,
  phone text,
  accepting_orders_expires_at timestamptz,
  -- Pricing fields
  pricing_model pricing_model_type,
  price_min decimal(10,2),
  price_max decimal(10,2),
  currency text DEFAULT 'USD',
  -- Additional contact fields
  whatsapp_url text,
  external_shop_url text,
  telegram text,
  lead_time_days integer,
  hours jsonb
);

-- 4. Create gallery_images table
CREATE TABLE public.gallery_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id uuid REFERENCES public.artisans(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  title text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. Create user_favorites table
CREATE TABLE public.user_favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  artisan_id uuid REFERENCES public.artisans(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, artisan_id)
);

-- 6. Create contact_requests table
CREATE TABLE public.contact_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id uuid REFERENCES public.artisans(id) ON DELETE CASCADE NOT NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- 7. Create craft_types table
CREATE TABLE public.craft_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 8. Create artisan_applications table
CREATE TABLE public.artisan_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  craft_type text NOT NULL,
  location text NOT NULL,
  story text NOT NULL,
  specialty text,
  instagram text,
  website text,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 9. Create indexes
CREATE INDEX idx_artisans_status ON public.artisans(status);
CREATE INDEX idx_artisans_published ON public.artisans(status, published_at) WHERE status = 'published';
CREATE INDEX idx_gallery_images_artisan_id ON public.gallery_images(artisan_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_artisan_id ON public.user_favorites(artisan_id);

-- 10. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- 11. Create basic RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Artisans policies
CREATE POLICY "Users can view own artisan profile" ON public.artisans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own artisan profile" ON public.artisans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own artisan profile" ON public.artisans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gallery images policies
CREATE POLICY "Users can manage own gallery images" ON public.gallery_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.artisans WHERE id = artisan_id AND user_id = auth.uid())
);

-- User favorites policies
CREATE POLICY "Users can manage own favorites" ON public.user_favorites FOR ALL USING (auth.uid() = user_id);

-- Contact requests policies
CREATE POLICY "Users can create contact requests" ON public.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Artisans can view their contact requests" ON public.contact_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.artisans WHERE id = artisan_id AND user_id = auth.uid())
);

-- 12. Create handle_new_user function
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

-- 13. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Create other essential functions
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

CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id AND role = _role
  );
$$;

-- 15. Create artisans_public view
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
  a.telegram,
  a.lead_time_days,
  a.hours,
  p.full_name,
  p.username,
  p.avatar_url
FROM public.artisans a
JOIN public.profiles p ON p.id = a.user_id
WHERE a.status = 'published';  -- Only show published artisans

GRANT SELECT ON public.artisans_public TO anon, authenticated;

-- 16. Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile record when a new user signs up. Role is stored in profiles.role only.';
COMMENT ON FUNCTION public.get_email_by_username IS 'Converts username to email for login purposes';
COMMENT ON FUNCTION public.has_role IS 'Checks if a user has a specific role';
