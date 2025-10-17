-- Migration: Fix RLS Performance Warnings
-- Purpose: Optimize auth.uid() calls and consolidate redundant policies
-- Date: 2025-10-17
--
-- Issues addressed:
-- 1. Replace auth.uid() with (select auth.uid()) in RLS policies to avoid re-evaluation per row
-- 2. Consolidate multiple permissive policies into single policies with OR conditions
-- 3. Improve query performance significantly

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profile access control" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- ARTISANS TABLE
-- ============================================================================
ALTER TABLE public.artisans DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artisans viewable by owner" ON public.artisans;
DROP POLICY IF EXISTS "Artisans can create own profile" ON public.artisans;
DROP POLICY IF EXISTS "Artisans can update own profile" ON public.artisans;
DROP POLICY IF EXISTS "Artisans can delete own profile" ON public.artisans;
DROP POLICY IF EXISTS "Users can view own artisan profile" ON public.artisans;
DROP POLICY IF EXISTS "Users can update own artisan profile" ON public.artisans;
DROP POLICY IF EXISTS "Users can insert own artisan profile" ON public.artisans;

ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisan select policy"
  ON public.artisans
  FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Artisan insert policy"
  ON public.artisans
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Artisan update policy"
  ON public.artisans
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Artisan delete policy"
  ON public.artisans
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- GALLERY_IMAGES TABLE
-- ============================================================================
ALTER TABLE public.gallery_images DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artisans can manage own gallery" ON public.gallery_images;
DROP POLICY IF EXISTS "Gallery images viewable by everyone" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery select" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery insert own" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery update own" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery delete own" ON public.gallery_images;

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery select policy"
  ON public.gallery_images
  FOR SELECT
  USING (true);

CREATE POLICY "Gallery write policy"
  ON public.gallery_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artisans a
      WHERE a.id = artisan_id
        AND a.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Gallery update policy"
  ON public.gallery_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans a
      WHERE a.id = artisan_id
        AND a.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artisans a
      WHERE a.id = artisan_id
        AND a.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Gallery delete policy"
  ON public.gallery_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans a
      WHERE a.id = artisan_id
        AND a.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- USER_FAVORITES TABLE
-- ============================================================================
ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON public.user_favorites;

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User favorites select"
  ON public.user_favorites
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "User favorites write"
  ON public.user_favorites
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "User favorites delete"
  ON public.user_favorites
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- ARTISAN_APPLICATIONS TABLE
-- ============================================================================
ALTER TABLE public.artisan_applications DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage applications" ON public.artisan_applications;
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.artisan_applications;

ALTER TABLE public.artisan_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit applications (public)
CREATE POLICY "Anyone can submit applications"
  ON public.artisan_applications
  FOR INSERT
  WITH CHECK (true);

-- Admin can read all applications
CREATE POLICY "Admins can read applications"
  ON public.artisan_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

-- Admin can update applications
CREATE POLICY "Admins can update applications"
  ON public.artisan_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

-- ============================================================================
-- CONTACT_REQUESTS TABLE
-- ============================================================================
ALTER TABLE public.contact_requests DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artisans can view own requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Artisans can update request status" ON public.contact_requests;

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contact request select"
  ON public.contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE id = artisan_id
        AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Contact request update"
  ON public.contact_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE id = artisan_id
        AND user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.artisans
      WHERE id = artisan_id
        AND user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- ARTISAN_ANALYTICS_EVENTS TABLE
-- ============================================================================
ALTER TABLE public.artisan_analytics_events DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artisans can read own analytics events" ON public.artisan_analytics_events;
DROP POLICY IF EXISTS "Admins can read all analytics events" ON public.artisan_analytics_events;

ALTER TABLE public.artisan_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics events create"
  ON public.artisan_analytics_events
  FOR INSERT
  WITH CHECK (true);

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
-- ARTISAN_ANALYTICS_SUMMARY TABLE
-- ============================================================================
ALTER TABLE public.artisan_analytics_summary DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artisans can read own analytics summary" ON public.artisan_analytics_summary;
DROP POLICY IF EXISTS "Admins can read all analytics summaries" ON public.artisan_analytics_summary;

ALTER TABLE public.artisan_analytics_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics summary read"
  ON public.artisan_analytics_summary
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
-- BADGE_TYPES TABLE
-- ============================================================================
ALTER TABLE public.badge_types DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage badge types" ON public.badge_types;
DROP POLICY IF EXISTS "Badge types are publicly readable" ON public.badge_types;

ALTER TABLE public.badge_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badge types read"
  ON public.badge_types
  FOR SELECT
  USING (true);

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
-- ARTISAN_BADGES TABLE
-- ============================================================================
ALTER TABLE public.artisan_badges DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage artisan badges" ON public.artisan_badges;
DROP POLICY IF EXISTS "Artisan badges are publicly readable" ON public.artisan_badges;

ALTER TABLE public.artisan_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisan badges read"
  ON public.artisan_badges
  FOR SELECT
  USING (true);

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
-- COLLECTIONS TABLE
-- ============================================================================
ALTER TABLE public.collections DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
DROP POLICY IF EXISTS "Published collections are publicly readable" ON public.collections;

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections read"
  ON public.collections
  FOR SELECT
  USING (
    status = 'published'::text OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

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
-- COLLECTION_ARTISANS TABLE
-- ============================================================================
ALTER TABLE public.collection_artisans DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage collection artisans" ON public.collection_artisans;
DROP POLICY IF EXISTS "Collection artisans are publicly readable" ON public.collection_artisans;

ALTER TABLE public.collection_artisans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection artisans read"
  ON public.collection_artisans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_id AND status = 'published'::text
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'::app_role
    )
  );

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
