-- Phase 1: Email Protection & Data Integrity
-- Add unique constraint to prevent multiple artisan profiles per user
ALTER TABLE public.artisans 
  ADD CONSTRAINT artisans_user_id_unique UNIQUE (user_id);

-- Verify artisans_public view excludes sensitive data (email, lat/long)
-- This view is already created, but let's ensure it's documented
COMMENT ON VIEW public.artisans_public IS 'Public view of artisan profiles - excludes email, latitude, longitude for privacy';

-- Phase 3: Create artisan_applications table for join form
CREATE TABLE public.artisan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(trim(name)) <= 100),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  location TEXT NOT NULL CHECK (length(trim(location)) >= 2 AND length(trim(location)) <= 100),
  craft_type TEXT NOT NULL,
  story TEXT NOT NULL CHECK (length(trim(story)) >= 20 AND length(trim(story)) <= 500),
  specialty TEXT CHECK (specialty IS NULL OR length(trim(specialty)) <= 300),
  website TEXT CHECK (website IS NULL OR website ~* '^https?://'),
  instagram TEXT CHECK (instagram IS NULL OR instagram ~* '^@?[A-Za-z0-9._]{1,30}$'),
  phone TEXT CHECK (phone IS NULL OR phone ~* '^[\d\s()+-]{10,20}$'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on applications table
ALTER TABLE public.artisan_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit applications (unauthenticated)
CREATE POLICY "Anyone can submit applications"
  ON public.artisan_applications FOR INSERT
  WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view applications"
  ON public.artisan_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update application status
CREATE POLICY "Admins can update applications"
  ON public.artisan_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add server-side validation constraints to artisans table
ALTER TABLE public.artisans 
  ADD CONSTRAINT artisans_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.artisans 
  ADD CONSTRAINT artisans_instagram_format 
  CHECK (instagram IS NULL OR instagram ~* '^@?[A-Za-z0-9._]{1,30}$');

ALTER TABLE public.artisans 
  ADD CONSTRAINT artisans_website_format 
  CHECK (website IS NULL OR website ~* '^https?://');