-- Populate user_roles table with existing users
-- This migration ensures all existing users have entries in the user_roles table

-- Insert missing user roles for existing users
-- Default to 'community_member' for users without explicit roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id as user_id,
  'community_member'::app_role as role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.user_id IS NULL;

-- Update existing artisans to have 'artisan' role
UPDATE public.user_roles 
SET role = 'artisan'::app_role
WHERE user_id IN (
  SELECT DISTINCT user_id 
  FROM public.artisans 
  WHERE status = 'published'
);

-- Ensure the trigger is set up to create user_roles entries for new users
-- (This should already be handled by the handle_new_user function)
