-- =====================================================
-- SECURITY FIX: Restrict Direct Access to Artisans Table
-- =====================================================

-- Drop the dangerous policy that allows all authenticated users to see emails/GPS
DROP POLICY IF EXISTS "Authenticated users can view artisan profiles" ON public.artisans;

-- Block direct table access for authenticated users (force them to use the public view)
CREATE POLICY "Authenticated users must use public view"
ON public.artisans
FOR SELECT
TO authenticated
USING (false);

-- Create helper function to check artisan ownership
CREATE OR REPLACE FUNCTION public.is_artisan_owner(_artisan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.artisans
    WHERE id = _artisan_id
    AND user_id = auth.uid()
  )
$$;

-- Allow artisans to view their own full profile (including email and GPS)
CREATE POLICY "Artisans can view their own full profile"
ON public.artisans
FOR SELECT
TO authenticated
USING (user_id = auth.uid());