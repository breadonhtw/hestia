-- Backfill artisan role and profile for user breadon
-- Insert artisan role
INSERT INTO public.user_roles (user_id, role)
VALUES ('2c5e2f91-73d0-4e82-8020-de058c14f901', 'artisan'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Create artisan profile
INSERT INTO public.artisans (user_id, bio, location, craft_type, email, story)
VALUES (
  '2c5e2f91-73d0-4e82-8020-de058c14f901',
  '',
  '',
  'Painting',
  'brandonhtw@gmail.com',
  ''
)
ON CONFLICT (user_id) DO NOTHING;