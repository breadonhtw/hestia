-- Add artisan_profile_id column to profiles table
-- This links profiles to their artisan profile (if they have one)

-- Add the column (nullable since not all profiles are artisans)
ALTER TABLE public.profiles
ADD COLUMN artisan_profile_id uuid REFERENCES public.artisans(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_profiles_artisan_profile_id ON public.profiles(artisan_profile_id)
WHERE artisan_profile_id IS NOT NULL;

-- Backfill existing artisan profiles
-- For any existing artisan records, set the artisan_profile_id in profiles
UPDATE public.profiles p
SET artisan_profile_id = a.id
FROM public.artisans a
WHERE p.id = a.user_id
AND p.artisan_profile_id IS NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.profiles.artisan_profile_id IS 'Links to artisan profile if user is an artisan (one-to-one relationship)';
