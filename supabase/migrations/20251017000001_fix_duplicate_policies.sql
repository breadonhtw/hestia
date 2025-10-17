-- Migration: Fix Duplicate RLS Policies
-- Purpose: Remove duplicate policies that cause multiple permissive policy warnings
-- Date: 2025-10-17

-- ============================================================================
-- ARTISAN_ANALYTICS_EVENTS - Remove duplicate read policies
-- ============================================================================
DROP POLICY IF EXISTS "Analytics events admin read" ON public.artisan_analytics_events;
DROP POLICY IF EXISTS "Analytics events artisan read" ON public.artisan_analytics_events;
DROP POLICY IF EXISTS "Anyone can create analytics events" ON public.artisan_analytics_events;

-- Recreate as single consolidated policy
CREATE POLICY "Analytics events read"
  ON public.artisan_analytics_events
  FOR SELECT
  USING (
    (select auth.uid()) IN (
      SELECT user_id FROM public.artisans WHERE id = artisan_id
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

-- ============================================================================
-- ARTISAN_ANALYTICS_SUMMARY - Remove duplicate policies
-- ============================================================================
DROP POLICY IF EXISTS "Analytics summary admin" ON public.artisan_analytics_summary;

-- Keep only the consolidated read policy

-- ============================================================================
-- ARTISAN_APPLICATIONS - Remove duplicate insert policies
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.artisan_applications;

-- Keep the admin policies and the consolidated anyone insert

-- ============================================================================
-- ARTISAN_BADGES - Remove duplicate ALL policy
-- ============================================================================
DROP POLICY IF EXISTS "Artisan badges admin" ON public.artisan_badges;

-- Recreate as separate INSERT, UPDATE, DELETE policies
CREATE POLICY "Artisan badges admin insert"
  ON public.artisan_badges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Artisan badges admin update"
  ON public.artisan_badges
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Artisan badges admin delete"
  ON public.artisan_badges
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

-- ============================================================================
-- BADGE_TYPES - Remove duplicate ALL policy
-- ============================================================================
DROP POLICY IF EXISTS "Badge types admin" ON public.badge_types;

-- Recreate as separate INSERT, UPDATE, DELETE policies
CREATE POLICY "Badge types admin insert"
  ON public.badge_types
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Badge types admin update"
  ON public.badge_types
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Badge types admin delete"
  ON public.badge_types
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

-- ============================================================================
-- COLLECTION_ARTISANS - Remove duplicate ALL policy
-- ============================================================================
DROP POLICY IF EXISTS "Collection artisans admin" ON public.collection_artisans;

-- Recreate as separate INSERT, UPDATE, DELETE policies
CREATE POLICY "Collection artisans admin insert"
  ON public.collection_artisans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Collection artisans admin update"
  ON public.collection_artisans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Collection artisans admin delete"
  ON public.collection_artisans
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

-- ============================================================================
-- COLLECTIONS - Remove duplicate ALL policy
-- ============================================================================
DROP POLICY IF EXISTS "Collections admin" ON public.collections;

-- Recreate as separate INSERT, UPDATE, DELETE policies
CREATE POLICY "Collections admin insert"
  ON public.collections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Collections admin update"
  ON public.collections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Collections admin delete"
  ON public.collections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

-- ============================================================================
-- PROFILES - Remove duplicate SELECT policies
-- ============================================================================
DROP POLICY IF EXISTS "Profile access control" ON public.profiles;

-- Keep only "Profiles viewable by everyone"

-- ============================================================================
-- CONTACT_REQUESTS - Remove duplicate read/write policies if needed
-- ============================================================================
-- Keep existing policies as they appear correct

-- ============================================================================
-- ARTISAN_ANALYTICS_SUMMARY - Keep consolidated read policy
-- ============================================================================
-- Already correct with single read policy
