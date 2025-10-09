-- =====================================================
-- FIX: Protect Sensitive Artisan Data
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Artisans are viewable by everyone" ON public.artisans;

-- Create a secure view for public artisan browsing
-- This view excludes email and precise GPS coordinates
CREATE OR REPLACE VIEW public.artisans_public AS
SELECT 
  id,
  user_id,
  craft_type,
  location,
  bio,
  story,
  website,
  instagram,
  -- Email is EXCLUDED for privacy
  featured,
  -- Precise coordinates are EXCLUDED for safety
  -- latitude is EXCLUDED
  -- longitude is EXCLUDED
  created_at,
  updated_at
FROM public.artisans;

-- Grant public read access to the view
GRANT SELECT ON public.artisans_public TO anon, authenticated;

-- New RLS policy: Public can view artisans through the secure view
-- But direct table access requires authentication
CREATE POLICY "Anyone can view public artisan information"
  ON public.artisans FOR SELECT
  TO anon
  USING (false);  -- Anonymous users cannot query the table directly

-- Authenticated users can view public fields through app logic
CREATE POLICY "Authenticated users can view artisan profiles"
  ON public.artisans FOR SELECT
  TO authenticated
  USING (true);

-- Artisans can view their own complete record including sensitive data
-- This policy is already covered by the authenticated policy above

-- Add helpful comment
COMMENT ON VIEW public.artisans_public IS 
  'Public-facing view of artisan profiles. Excludes sensitive data like email addresses and precise GPS coordinates to protect user privacy and safety.';

-- =====================================================
-- Optional: Create a secure contact request table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID REFERENCES public.artisans(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Public can submit contact requests
CREATE POLICY "Anyone can submit contact requests"
  ON public.contact_requests FOR INSERT
  WITH CHECK (true);

-- Only the artisan can view their own contact requests
CREATE POLICY "Artisans can view their own contact requests"
  ON public.contact_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE artisans.id = contact_requests.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- Only the artisan can update the status
CREATE POLICY "Artisans can update their contact request status"
  ON public.contact_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE artisans.id = contact_requests.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.contact_requests IS 
  'Stores contact form submissions from visitors to artisans. Email addresses are never exposed publicly - messages are routed securely.';