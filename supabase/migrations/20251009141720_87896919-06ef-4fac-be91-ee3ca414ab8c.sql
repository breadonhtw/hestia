-- Create enum types
CREATE TYPE public.app_role AS ENUM ('artisan', 'community_member', 'admin');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles RLS Policies
CREATE POLICY "User roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (true);

-- =====================================================
-- CRAFT TYPES TABLE
-- =====================================================
CREATE TABLE public.craft_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.craft_types ENABLE ROW LEVEL SECURITY;

-- Craft types RLS Policies
CREATE POLICY "Craft types are viewable by everyone"
  ON public.craft_types FOR SELECT
  USING (true);

-- =====================================================
-- ARTISANS TABLE
-- =====================================================
CREATE TABLE public.artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  craft_type TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT NOT NULL,
  story TEXT,
  website TEXT,
  instagram TEXT,
  email TEXT NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;

-- Artisans RLS Policies
CREATE POLICY "Artisans are viewable by everyone"
  ON public.artisans FOR SELECT
  USING (true);

CREATE POLICY "Artisans can create their own profile"
  ON public.artisans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Artisans can update their own profile"
  ON public.artisans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Artisans can delete their own profile"
  ON public.artisans FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- GALLERY IMAGES TABLE
-- =====================================================
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID REFERENCES public.artisans(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Gallery images RLS Policies
CREATE POLICY "Gallery images are viewable by everyone"
  ON public.gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Artisans can insert their own gallery images"
  ON public.gallery_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE artisans.id = gallery_images.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can update their own gallery images"
  ON public.gallery_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE artisans.id = gallery_images.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can delete their own gallery images"
  ON public.gallery_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE artisans.id = gallery_images.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID REFERENCES public.artisans(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts RLS Policies
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Artisans can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE artisans.id = posts.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can update their own posts"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE artisans.id = posts.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can delete their own posts"
  ON public.posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE artisans.id = posts.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- =====================================================
-- FOLLOWERS TABLE
-- =====================================================
CREATE TABLE public.followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.artisans(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Followers RLS Policies
CREATE POLICY "Users can view all follow relationships"
  ON public.followers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow artisans"
  ON public.followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow artisans"
  ON public.followers FOR DELETE
  USING (auth.uid() = follower_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Function to get artisan follower count
CREATE OR REPLACE FUNCTION public.get_artisan_follower_count(_artisan_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.followers
  WHERE following_id = _artisan_id
$$;

-- Function to check if user is following an artisan
CREATE OR REPLACE FUNCTION public.is_following(_user_id UUID, _artisan_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.followers
    WHERE follower_id = _user_id
    AND following_id = _artisan_id
  )
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on profiles
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update updated_at on artisans
CREATE TRIGGER on_artisan_updated
  BEFORE UPDATE ON public.artisans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update updated_at on posts
CREATE TRIGGER on_post_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create gallery-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create post-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  3145728, -- 3MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- =====================================================
-- STORAGE RLS POLICIES
-- =====================================================

-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Gallery-images bucket policies
CREATE POLICY "Gallery images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own gallery images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own gallery images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Post-images bucket policies
CREATE POLICY "Post images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own post images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own post images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- SEED DATA: Craft Types
-- =====================================================
INSERT INTO public.craft_types (name, icon) VALUES
  ('Ceramics & Pottery', 'pottery'),
  ('Textiles & Weaving', 'textile'),
  ('Woodworking', 'wood'),
  ('Painting & Drawing', 'palette'),
  ('Jewelry & Metalwork', 'gem'),
  ('Baking & Culinary', 'chef-hat');