


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."app_role" AS ENUM (
    'artisan',
    'community_member',
    'admin'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."contact_channel_type" AS ENUM (
    'chat',
    'instagram',
    'website',
    'email',
    'phone'
);


ALTER TYPE "public"."contact_channel_type" OWNER TO "postgres";


CREATE TYPE "public"."pricing_model_type" AS ENUM (
    'fixed',
    'range',
    'contact'
);


ALTER TYPE "public"."pricing_model_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."aggregate_daily_analytics"("p_date" "date" DEFAULT (CURRENT_DATE - '1 day'::interval)) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO artisan_analytics_summary (
    artisan_id,
    date,
    profile_views,
    unique_visitors,
    favorites_added,
    favorites_removed,
    contact_requests,
    image_views,
    updated_at
  )
  SELECT
    artisan_id,
    p_date,
    COUNT(*) FILTER (WHERE event_type = 'profile_view') as profile_views,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'profile_view') as unique_visitors,
    COUNT(*) FILTER (WHERE event_type = 'favorite_added') as favorites_added,
    COUNT(*) FILTER (WHERE event_type = 'favorite_removed') as favorites_removed,
    COUNT(*) FILTER (WHERE event_type = 'contact_sent') as contact_requests,
    COUNT(*) FILTER (WHERE event_type = 'image_view') as image_views,
    now()
  FROM artisan_analytics_events
  WHERE DATE(created_at) = p_date
  GROUP BY artisan_id
  ON CONFLICT (artisan_id, date)
  DO UPDATE SET
    profile_views = EXCLUDED.profile_views,
    unique_visitors = EXCLUDED.unique_visitors,
    favorites_added = EXCLUDED.favorites_added,
    favorites_removed = EXCLUDED.favorites_removed,
    contact_requests = EXCLUDED.contact_requests,
    image_views = EXCLUDED.image_views,
    updated_at = now();
END;
$$;


ALTER FUNCTION "public"."aggregate_daily_analytics"("p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."award_badge"("p_artisan_id" "uuid", "p_badge_key" "text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb", "p_expires_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_badge_id uuid;
BEGIN
  -- Check if badge type exists
  IF NOT EXISTS (SELECT 1 FROM badge_types WHERE badge_key = p_badge_key) THEN
    RAISE EXCEPTION 'Badge type % does not exist', p_badge_key;
  END IF;

  -- Insert or update badge
  INSERT INTO artisan_badges (artisan_id, badge_key, metadata, expires_at, awarded_by)
  VALUES (p_artisan_id, p_badge_key, p_metadata, p_expires_at, auth.uid())
  ON CONFLICT (artisan_id, badge_key)
  DO UPDATE SET
    metadata = p_metadata,
    expires_at = p_expires_at,
    awarded_at = now(),
    awarded_by = auth.uid()
  RETURNING id INTO v_badge_id;

  RETURN v_badge_id;
END;
$$;


ALTER FUNCTION "public"."award_badge"("p_artisan_id" "uuid", "p_badge_key" "text", "p_metadata" "jsonb", "p_expires_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_featured_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  featured_count int;
begin
  -- Only check if setting is_featured to true
  if NEW.is_featured = true then
    -- Count current featured images for this artisan (excluding the current row if updating)
    select count(*) into featured_count
    from public.gallery_images
    where artisan_id = NEW.artisan_id
      and is_featured = true
      and id != NEW.id;

    -- If already 3 featured images, reject the operation
    if featured_count >= 3 then
      raise exception 'Cannot feature more than 3 images. Please unfeature an existing image first.';
    end if;
  end if;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."check_featured_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_artisan_profile"("_user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  _artisan_id uuid;
BEGIN
  -- Check if user already has an artisan profile
  SELECT artisan_profile_id INTO _artisan_id
  FROM public.profiles
  WHERE id = _user_id;

  IF _artisan_id IS NOT NULL THEN
    RETURN _artisan_id;
  END IF;

  -- Create draft artisan profile with minimal required fields
  INSERT INTO public.artisans (
    user_id,
    craft_type,
    location,
    bio,
    status,
    accepting_orders,
    open_for_commissions,
    profile_completed,
    featured,
    categories,
    created_at,
    updated_at
  ) VALUES (
    _user_id,
    '',
    '',
    '',
    'draft',
    false,
    false,
    false,
    false,
    '{}',
    now(),
    now()
  )
  RETURNING id INTO _artisan_id;

  -- Update profile to link the artisan record
  UPDATE public.profiles
  SET artisan_profile_id = _artisan_id
  WHERE id = _user_id;

  RETURN _artisan_id;
END;
$$;


ALTER FUNCTION "public"."create_artisan_profile"("_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_artisan_profile"("_user_id" "uuid") IS 'Creates a draft artisan profile for a user upgrading from community member';



CREATE OR REPLACE FUNCTION "public"."create_collection"("p_title" "text", "p_slug" "text", "p_description" "text" DEFAULT NULL::"text", "p_cover_image_url" "text" DEFAULT NULL::"text", "p_is_featured" boolean DEFAULT false) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_collection_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create collections';
  END IF;

  INSERT INTO collections (
    title,
    slug,
    description,
    cover_image_url,
    is_featured,
    created_by,
    status,
    published_at
  ) VALUES (
    p_title,
    p_slug,
    p_description,
    p_cover_image_url,
    p_is_featured,
    auth.uid(),
    'published',
    now()
  )
  RETURNING id INTO v_collection_id;

  RETURN v_collection_id;
END;
$$;


ALTER FUNCTION "public"."create_collection"("p_title" "text", "p_slug" "text", "p_description" "text", "p_cover_image_url" "text", "p_is_featured" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_publication"("p_title" "text", "p_slug" "text", "p_description" "text" DEFAULT NULL::"text", "p_cover_image_url" "text" DEFAULT NULL::"text", "p_external_url" "text" DEFAULT NULL::"text", "p_active_from" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_active_until" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_issue_number" integer DEFAULT NULL::integer, "p_theme" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_publication_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create publications';
  END IF;

  INSERT INTO publications (
    title,
    slug,
    description,
    cover_image_url,
    external_url,
    active_from,
    active_until,
    issue_number,
    theme,
    created_by,
    status,
    published_at
  ) VALUES (
    p_title,
    p_slug,
    p_description,
    p_cover_image_url,
    p_external_url,
    p_active_from,
    p_active_until,
    p_issue_number,
    p_theme,
    auth.uid(),
    'published',
    now()
  )
  RETURNING id INTO v_publication_id;

  RETURN v_publication_id;
END;
$$;


ALTER FUNCTION "public"."create_publication"("p_title" "text", "p_slug" "text", "p_description" "text", "p_cover_image_url" "text", "p_external_url" "text", "p_active_from" timestamp with time zone, "p_active_until" timestamp with time zone, "p_issue_number" integer, "p_theme" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_artisan_analytics"("p_artisan_id" "uuid", "p_start_date" "date" DEFAULT (CURRENT_DATE - '30 days'::interval), "p_end_date" "date" DEFAULT CURRENT_DATE) RETURNS TABLE("date" "date", "profile_views" integer, "unique_visitors" integer, "favorites_added" integer, "favorites_removed" integer, "contact_requests" integer, "image_views" integer)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    date,
    profile_views,
    unique_visitors,
    favorites_added,
    favorites_removed,
    contact_requests,
    image_views
  FROM artisan_analytics_summary
  WHERE artisan_id = p_artisan_id
  AND date >= p_start_date
  AND date <= p_end_date
  ORDER BY date ASC;
$$;


ALTER FUNCTION "public"."get_artisan_analytics"("p_artisan_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_artisan_analytics_realtime"("p_artisan_id" "uuid", "p_days" integer DEFAULT 30) RETURNS TABLE("total_profile_views" bigint, "total_unique_visitors" bigint, "total_favorites_added" bigint, "total_contact_requests" bigint, "total_image_views" bigint, "current_favorites" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'profile_view') as total_profile_views,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'profile_view') as total_unique_visitors,
    COUNT(*) FILTER (WHERE event_type = 'favorite_added') as total_favorites_added,
    COUNT(*) FILTER (WHERE event_type = 'contact_sent') as total_contact_requests,
    COUNT(*) FILTER (WHERE event_type = 'image_view') as total_image_views,
    (SELECT COUNT(*) FROM user_favorites WHERE artisan_id = p_artisan_id) as current_favorites
  FROM artisan_analytics_events
  WHERE artisan_id = p_artisan_id
  AND created_at >= now() - make_interval(days => p_days);
$$;


ALTER FUNCTION "public"."get_artisan_analytics_realtime"("p_artisan_id" "uuid", "p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_artisan_badges"("p_artisan_id" "uuid") RETURNS TABLE("badge_key" "text", "name" "text", "description" "text", "icon" "text", "color" "text", "awarded_at" timestamp with time zone, "expires_at" timestamp with time zone, "metadata" "jsonb")
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    ab.badge_key,
    bt.name,
    bt.description,
    bt.icon,
    bt.color,
    ab.awarded_at,
    ab.expires_at,
    ab.metadata
  FROM artisan_badges ab
  JOIN badge_types bt ON bt.badge_key = ab.badge_key
  WHERE ab.artisan_id = p_artisan_id
  AND (ab.expires_at IS NULL OR ab.expires_at > now())
  ORDER BY ab.awarded_at DESC;
$$;


ALTER FUNCTION "public"."get_artisan_badges"("p_artisan_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_weekly_publication"() RETURNS json
    LANGUAGE "sql" STABLE
    AS $$
  SELECT json_build_object(
    'id', p.id,
    'title', p.title,
    'slug', p.slug,
    'description', p.description,
    'theme', p.theme,
    'cover_image_url', p.cover_image_url,
    'external_url', p.external_url,
    'issue_number', p.issue_number,
    'active_from', p.active_from,
    'active_until', p.active_until,
    'created_at', p.created_at
  )
  FROM publications p
  WHERE p.status = 'published'
  AND p.active_from IS NOT NULL
  AND p.active_until IS NOT NULL
  AND now() >= p.active_from
  AND now() < p.active_until
  ORDER BY p.issue_number DESC
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_current_weekly_publication"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_email_by_username"("_username" "text") RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT u.email
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.username = _username
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_email_by_username"("_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_past_weekly_publications"() RETURNS json
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COALESCE(
    json_agg(
      row_to_json(publication_data) ORDER BY publication_data.issue_number DESC
    ),
    '[]'::json
  )
  FROM (
    SELECT
      p.id,
      p.title,
      p.slug,
      p.description,
      p.theme,
      p.cover_image_url,
      p.external_url,
      p.issue_number,
      p.active_from,
      p.active_until
    FROM publications p
    WHERE p.status = 'published'
    AND p.active_from IS NOT NULL
    AND p.active_until IS NOT NULL
    AND now() >= p.active_until
    ORDER BY p.issue_number DESC
  ) publication_data;
$$;


ALTER FUNCTION "public"."get_past_weekly_publications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Creates profile record when a new user signs up. Role is stored in profiles.role only.';



CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
    AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_artisan_profile_completed"("_artisan_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    craft_type IS NOT NULL 
    AND craft_type != '' 
    AND location IS NOT NULL 
    AND location != '' 
    AND bio IS NOT NULL 
    AND bio != ''
  FROM public.artisans
  WHERE id = _artisan_id
$$;


ALTER FUNCTION "public"."is_artisan_profile_completed"("_artisan_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."publish_artisan_profile"("_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  _artisan_id uuid;
  _errors jsonb := '[]'::jsonb;
  _artisan RECORD;
BEGIN
  -- Get artisan profile ID by user_id (not from profiles.artisan_profile_id)
  SELECT id INTO _artisan_id
  FROM public.artisans
  WHERE user_id = _user_id;

  IF _artisan_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No artisan profile found');
  END IF;

  -- Get artisan data for validation
  SELECT * INTO _artisan
  FROM public.artisans
  WHERE id = _artisan_id AND user_id = _user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Artisan profile not found');
  END IF;

  -- Validate required fields
  IF _artisan.craft_type IS NULL OR TRIM(_artisan.craft_type) = '' THEN
    _errors := _errors || '["Craft type is required"]'::jsonb;
  END IF;

  IF _artisan.location IS NULL OR TRIM(_artisan.location) = '' THEN
    _errors := _errors || '["Location is required"]'::jsonb;
  END IF;

  IF _artisan.bio IS NULL OR TRIM(_artisan.bio) = '' THEN
    _errors := _errors || '["Bio is required"]'::jsonb;
  END IF;

  -- Check pricing model consistency
  IF _artisan.pricing_model IS NOT NULL THEN
    IF _artisan.pricing_model = 'fixed' AND _artisan.price_min IS NULL THEN
      _errors := _errors || '["Fixed pricing requires a price"]'::jsonb;
    END IF;
  END IF;

  -- Return errors if any
  IF jsonb_array_length(_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'errors', _errors);
  END IF;

  -- Update artisan profile to published
  UPDATE public.artisans
  SET
    status = 'published',
    published_at = COALESCE(published_at, now()),
    profile_completed = true,
    updated_at = now()
  WHERE id = _artisan_id;

  -- Update user role to artisan in profiles table
  UPDATE public.profiles
  SET role = 'artisan'::app_role
  WHERE id = _user_id;

  RETURN jsonb_build_object('success', true, 'artisan_id', _artisan_id);
END;
$$;


ALTER FUNCTION "public"."publish_artisan_profile"("_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."publish_artisan_profile"("_user_id" "uuid") IS 'Publishes artisan profile and updates profiles.role to artisan.';



CREATE OR REPLACE FUNCTION "public"."publish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  _artisan record;
  _errors jsonb := '[]'::jsonb;
  _gallery_count integer;
BEGIN
  -- Validate input parameters
  IF _artisan_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'errors', jsonb_build_array('Artisan ID is required'));
  END IF;
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'errors', jsonb_build_array('User ID is required'));
  END IF;

  -- Fetch artisan record
  SELECT * INTO _artisan
  FROM public.artisans
  WHERE id = _artisan_id AND user_id = _user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'errors', jsonb_build_array('Artisan profile not found'));
  END IF;

  -- Validate required fields
  IF _artisan.craft_type IS NULL OR _artisan.craft_type = '' THEN
    _errors := _errors || jsonb_build_array('Category/craft type is required');
  END IF;

  IF _artisan.bio IS NULL OR _artisan.bio = '' THEN
    _errors := _errors || jsonb_build_array('Bio is required');
  END IF;

  IF _artisan.location IS NULL OR _artisan.location = '' THEN
    _errors := _errors || jsonb_build_array('Location is required');
  END IF;

  -- Check minimum media count
  SELECT COUNT(*) INTO _gallery_count
  FROM public.gallery_images
  WHERE artisan_id = _artisan_id;

  IF _gallery_count < 3 THEN
    _errors := _errors || jsonb_build_array('At least 3 images required (currently: ' || _gallery_count || ')');
  END IF;

  -- Check at least one contact method
  IF (_artisan.contact_value IS NULL OR _artisan.contact_value = '')
     AND (_artisan.email IS NULL OR _artisan.email = '')
     AND (_artisan.phone IS NULL OR _artisan.phone = '')
     AND (_artisan.instagram IS NULL OR _artisan.instagram = '')
     AND (_artisan.whatsapp_url IS NULL OR _artisan.whatsapp_url = '') THEN
    _errors := _errors || jsonb_build_array('At least one contact method is required');
  END IF;

  -- Return errors if validation failed
  IF jsonb_array_length(_errors) > 0 THEN
    RETURN jsonb_build_object('success', false, 'errors', _errors);
  END IF;

  -- Update artisan to published
  UPDATE public.artisans
  SET
    status = 'published',
    published_at = now(),
    profile_completed = true,
    updated_at = now()
  WHERE id = _artisan_id;

  -- Update user role to artisan (only if user_roles table exists)
  BEGIN
    UPDATE public.user_roles
    SET role = 'artisan'::app_role
    WHERE user_id = _user_id;
  EXCEPTION
    WHEN undefined_table THEN
      -- user_roles table doesn't exist, skip this step
      NULL;
  END;

  RETURN jsonb_build_object('success', true, 'artisan_id', _artisan_id);
END;
$$;


ALTER FUNCTION "public"."publish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."revoke_badge"("p_artisan_id" "uuid", "p_badge_key" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM artisan_badges
  WHERE artisan_id = p_artisan_id
  AND badge_key = p_badge_key;

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."revoke_badge"("p_artisan_id" "uuid", "p_badge_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_analytics_event"("p_artisan_id" "uuid", "p_event_type" "text", "p_event_data" "jsonb" DEFAULT '{}'::"jsonb", "p_session_id" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_event_id uuid;
  v_user_id uuid;
BEGIN
  -- Get current user ID (null if anonymous)
  v_user_id := auth.uid();

  -- Insert event
  INSERT INTO artisan_analytics_events (artisan_id, event_type, event_data, session_id, user_id)
  VALUES (p_artisan_id, p_event_type, p_event_data, p_session_id, v_user_id)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;


ALTER FUNCTION "public"."track_analytics_event"("p_artisan_id" "uuid", "p_event_type" "text", "p_event_data" "jsonb", "p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."unpublish_artisan_profile"("_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  _artisan_id uuid;
BEGIN
  -- Get artisan profile ID by user_id (not from profiles.artisan_profile_id)
  SELECT id INTO _artisan_id
  FROM public.artisans
  WHERE user_id = _user_id;

  IF _artisan_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update artisan profile to draft
  UPDATE public.artisans
  SET
    status = 'draft',
    published_at = NULL,
    accepting_orders = false,
    updated_at = now()
  WHERE id = _artisan_id AND user_id = _user_id;

  -- Keep role as artisan but they won't appear in discovery
  -- Optionally demote: UPDATE public.profiles SET role = 'community_member'::app_role WHERE id = _user_id;

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."unpublish_artisan_profile"("_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."unpublish_artisan_profile"("_user_id" "uuid") IS 'Unpublishes artisan profile. Role remains artisan but profile is hidden.';



CREATE OR REPLACE FUNCTION "public"."unpublish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Update artisan to draft status
  UPDATE public.artisans
  SET
    status = 'draft',
    accepting_orders = false,
    updated_at = now()
  WHERE id = _artisan_id AND user_id = _user_id;

  -- Keep role as artisan but they won't appear in discovery
  -- Optionally demote: UPDATE public.user_roles SET role = 'community_member'::app_role WHERE user_id = _user_id;

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."unpublish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."unpublish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") IS 'Unpublishes an artisan profile, hiding from discovery';



CREATE OR REPLACE FUNCTION "public"."update_artisan_profile_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if the profile is now completed
  NEW.profile_completed := (
    NEW.craft_type IS NOT NULL 
    AND NEW.craft_type != '' 
    AND NEW.location IS NOT NULL 
    AND NEW.location != '' 
    AND NEW.bio IS NOT NULL 
    AND NEW.bio != ''
  );
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_artisan_profile_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."artisan_analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artisan_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb",
    "session_id" "text",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."artisan_analytics_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artisan_analytics_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artisan_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "profile_views" integer DEFAULT 0,
    "unique_visitors" integer DEFAULT 0,
    "favorites_added" integer DEFAULT 0,
    "favorites_removed" integer DEFAULT 0,
    "contact_requests" integer DEFAULT 0,
    "image_views" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."artisan_analytics_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artisan_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "location" "text" NOT NULL,
    "craft_type" "text" NOT NULL,
    "story" "text" NOT NULL,
    "specialty" "text",
    "website" "text",
    "instagram" "text",
    "phone" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    CONSTRAINT "artisan_applications_email_check" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")),
    CONSTRAINT "artisan_applications_instagram_check" CHECK ((("instagram" IS NULL) OR ("instagram" ~* '^@?[A-Za-z0-9._]{1,30}$'::"text"))),
    CONSTRAINT "artisan_applications_location_check" CHECK ((("length"(TRIM(BOTH FROM "location")) >= 2) AND ("length"(TRIM(BOTH FROM "location")) <= 100))),
    CONSTRAINT "artisan_applications_name_check" CHECK ((("length"(TRIM(BOTH FROM "name")) >= 2) AND ("length"(TRIM(BOTH FROM "name")) <= 100))),
    CONSTRAINT "artisan_applications_phone_check" CHECK ((("phone" IS NULL) OR ("phone" ~* '^[\d\s()+-]{10,20}$'::"text"))),
    CONSTRAINT "artisan_applications_specialty_check" CHECK ((("specialty" IS NULL) OR ("length"(TRIM(BOTH FROM "specialty")) <= 300))),
    CONSTRAINT "artisan_applications_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "artisan_applications_story_check" CHECK ((("length"(TRIM(BOTH FROM "story")) >= 20) AND ("length"(TRIM(BOTH FROM "story")) <= 500))),
    CONSTRAINT "artisan_applications_website_check" CHECK ((("website" IS NULL) OR ("website" ~* '^https?://'::"text")))
);


ALTER TABLE "public"."artisan_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artisan_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artisan_id" "uuid" NOT NULL,
    "badge_key" "text" NOT NULL,
    "awarded_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "awarded_by" "uuid"
);


ALTER TABLE "public"."artisan_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artisans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "craft_type" "text" NOT NULL,
    "location" "text" NOT NULL,
    "bio" "text" NOT NULL,
    "story" "text",
    "website" "text",
    "instagram" "text",
    "featured" boolean DEFAULT false NOT NULL,
    "accepting_orders" boolean DEFAULT false,
    "open_for_commissions" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_completed" boolean DEFAULT false NOT NULL,
    "categories" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "estate" "text",
    "contact_channel" "public"."contact_channel_type" DEFAULT 'chat'::"public"."contact_channel_type" NOT NULL,
    "contact_value" "text",
    "email" "text",
    "phone" "text",
    "accepting_orders_expires_at" timestamp with time zone,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "published_at" timestamp with time zone,
    "pricing_model" "public"."pricing_model_type",
    "price_min" numeric(10,2),
    "price_max" numeric(10,2),
    "currency" "text" DEFAULT 'USD'::"text",
    "whatsapp_url" "text",
    "external_shop_url" "text",
    "lead_time_days" integer,
    "hours" "jsonb",
    "telegram" "text",
    CONSTRAINT "artisans_instagram_format" CHECK ((("instagram" IS NULL) OR ("instagram" ~* '^@?[A-Za-z0-9._]{1,30}$'::"text"))),
    CONSTRAINT "artisans_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text"]))),
    CONSTRAINT "artisans_website_format" CHECK ((("website" IS NULL) OR ("website" ~* '^https?://'::"text")))
);


ALTER TABLE "public"."artisans" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."artisans_public" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "user_id",
    NULL::"text" AS "craft_type",
    NULL::"text" AS "location",
    NULL::"text" AS "bio",
    NULL::"text" AS "story",
    NULL::"text" AS "instagram",
    NULL::"text" AS "website",
    NULL::boolean AS "featured",
    NULL::boolean AS "accepting_orders",
    NULL::boolean AS "open_for_commissions",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::timestamp with time zone AS "published_at",
    NULL::"text"[] AS "categories",
    NULL::"text"[] AS "tags",
    NULL::"text" AS "estate",
    NULL::"public"."contact_channel_type" AS "contact_channel",
    NULL::"text" AS "contact_value",
    NULL::"text" AS "email",
    NULL::"text" AS "phone",
    NULL::timestamp with time zone AS "accepting_orders_expires_at",
    NULL::"public"."pricing_model_type" AS "pricing_model",
    NULL::numeric(10,2) AS "price_min",
    NULL::numeric(10,2) AS "price_max",
    NULL::"text" AS "currency",
    NULL::"text" AS "whatsapp_url",
    NULL::"text" AS "external_shop_url",
    NULL::integer AS "lead_time_days",
    NULL::"jsonb" AS "hours",
    NULL::"text" AS "full_name",
    NULL::"text" AS "username",
    NULL::"text" AS "avatar_url",
    NULL::json AS "gallery_images",
    NULL::json AS "badges";


ALTER VIEW "public"."artisans_public" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."badge_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "badge_key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "color" "text",
    "is_auto_awarded" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."badge_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artisan_id" "uuid" NOT NULL,
    "sender_name" "text" NOT NULL,
    "sender_email" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "contact_requests_message_check" CHECK ((("length"(TRIM(BOTH FROM "message")) >= 10) AND ("length"(TRIM(BOTH FROM "message")) <= 1000))),
    CONSTRAINT "contact_requests_sender_email_check" CHECK (("sender_email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")),
    CONSTRAINT "contact_requests_sender_name_check" CHECK ((("length"(TRIM(BOTH FROM "sender_name")) >= 2) AND ("length"(TRIM(BOTH FROM "sender_name")) <= 100))),
    CONSTRAINT "contact_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'read'::"text", 'replied'::"text"])))
);


ALTER TABLE "public"."contact_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."craft_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."craft_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artisan_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_featured" boolean DEFAULT false
);


ALTER TABLE "public"."gallery_images" OWNER TO "postgres";


COMMENT ON COLUMN "public"."gallery_images"."is_featured" IS 'Whether this image is featured in the artisan preview (max 3 per artisan)';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "avatar_url" "text",
    "role" "public"."app_role" DEFAULT 'community_member'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "full_name" "text" DEFAULT 'User'::"text" NOT NULL,
    CONSTRAINT "username_format" CHECK (("username" ~* '^[a-zA-Z0-9_]{3,20}$'::"text"))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."publications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "cover_image_url" "text",
    "created_by" "uuid",
    "status" "text" DEFAULT 'published'::"text",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "active_from" timestamp with time zone,
    "active_until" timestamp with time zone,
    "issue_number" integer,
    "theme" "text",
    "external_url" "text"
);


ALTER TABLE "public"."publications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "artisan_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


ALTER TABLE ONLY "public"."artisan_analytics_events"
    ADD CONSTRAINT "artisan_analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artisan_analytics_summary"
    ADD CONSTRAINT "artisan_analytics_summary_artisan_id_date_key" UNIQUE ("artisan_id", "date");



ALTER TABLE ONLY "public"."artisan_analytics_summary"
    ADD CONSTRAINT "artisan_analytics_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artisan_applications"
    ADD CONSTRAINT "artisan_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artisan_badges"
    ADD CONSTRAINT "artisan_badges_artisan_id_badge_key_key" UNIQUE ("artisan_id", "badge_key");



ALTER TABLE ONLY "public"."artisan_badges"
    ADD CONSTRAINT "artisan_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artisans"
    ADD CONSTRAINT "artisans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artisans"
    ADD CONSTRAINT "artisans_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."badge_types"
    ADD CONSTRAINT "badge_types_badge_key_key" UNIQUE ("badge_key");



ALTER TABLE ONLY "public"."badge_types"
    ADD CONSTRAINT "badge_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."publications"
    ADD CONSTRAINT "collections_issue_number_key" UNIQUE ("issue_number");



ALTER TABLE ONLY "public"."publications"
    ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."publications"
    ADD CONSTRAINT "collections_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."contact_requests"
    ADD CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."craft_types"
    ADD CONSTRAINT "craft_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."craft_types"
    ADD CONSTRAINT "craft_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_images"
    ADD CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_artisan_id_key" UNIQUE ("user_id", "artisan_id");



CREATE INDEX "idx_analytics_events_artisan_id" ON "public"."artisan_analytics_events" USING "btree" ("artisan_id");



CREATE INDEX "idx_analytics_events_created_at" ON "public"."artisan_analytics_events" USING "btree" ("created_at");



CREATE INDEX "idx_analytics_events_event_type" ON "public"."artisan_analytics_events" USING "btree" ("event_type");



CREATE INDEX "idx_analytics_events_session_id" ON "public"."artisan_analytics_events" USING "btree" ("session_id") WHERE ("session_id" IS NOT NULL);



CREATE INDEX "idx_analytics_summary_artisan_id" ON "public"."artisan_analytics_summary" USING "btree" ("artisan_id");



CREATE INDEX "idx_analytics_summary_date" ON "public"."artisan_analytics_summary" USING "btree" ("date");



CREATE INDEX "idx_applications_created" ON "public"."artisan_applications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_applications_status" ON "public"."artisan_applications" USING "btree" ("status");



CREATE INDEX "idx_artisan_badges_artisan_id" ON "public"."artisan_badges" USING "btree" ("artisan_id");



CREATE INDEX "idx_artisan_badges_badge_key" ON "public"."artisan_badges" USING "btree" ("badge_key");



CREATE INDEX "idx_artisan_badges_expires_at" ON "public"."artisan_badges" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_artisans_craft_type" ON "public"."artisans" USING "btree" ("craft_type");



CREATE INDEX "idx_artisans_featured" ON "public"."artisans" USING "btree" ("featured");



CREATE INDEX "idx_artisans_published" ON "public"."artisans" USING "btree" ("status", "published_at") WHERE ("status" = 'published'::"text");



CREATE INDEX "idx_artisans_status" ON "public"."artisans" USING "btree" ("status");



CREATE INDEX "idx_artisans_user_id" ON "public"."artisans" USING "btree" ("user_id");



CREATE INDEX "idx_contact_artisan" ON "public"."contact_requests" USING "btree" ("artisan_id");



CREATE INDEX "idx_contact_status" ON "public"."contact_requests" USING "btree" ("artisan_id", "status");



CREATE INDEX "idx_favorites_artisan" ON "public"."user_favorites" USING "btree" ("artisan_id");



CREATE INDEX "idx_favorites_user" ON "public"."user_favorites" USING "btree" ("user_id");



CREATE INDEX "idx_gallery_images_artisan" ON "public"."gallery_images" USING "btree" ("artisan_id");



CREATE INDEX "idx_gallery_images_featured" ON "public"."gallery_images" USING "btree" ("artisan_id", "is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_gallery_images_order" ON "public"."gallery_images" USING "btree" ("artisan_id", "display_order");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_publications_active_dates" ON "public"."publications" USING "btree" ("active_from", "active_until") WHERE ("status" = 'published'::"text");



CREATE INDEX "idx_publications_issue_number" ON "public"."publications" USING "btree" ("issue_number") WHERE ("issue_number" IS NOT NULL);



CREATE INDEX "idx_publications_slug" ON "public"."publications" USING "btree" ("slug");



CREATE INDEX "idx_publications_status" ON "public"."publications" USING "btree" ("status");



CREATE OR REPLACE VIEW "public"."artisans_public" AS
 SELECT "a"."id",
    "a"."user_id",
    "a"."craft_type",
    "a"."location",
    "a"."bio",
    "a"."story",
    "a"."instagram",
    "a"."website",
    "a"."featured",
    "a"."accepting_orders",
    "a"."open_for_commissions",
    "a"."created_at",
    "a"."updated_at",
    "a"."published_at",
    "a"."categories",
    "a"."tags",
    "a"."estate",
    "a"."contact_channel",
    "a"."contact_value",
    "a"."email",
    "a"."phone",
    "a"."accepting_orders_expires_at",
    "a"."pricing_model",
    "a"."price_min",
    "a"."price_max",
    "a"."currency",
    "a"."whatsapp_url",
    "a"."external_shop_url",
    "a"."lead_time_days",
    "a"."hours",
    "p"."full_name",
    "p"."username",
    "p"."avatar_url",
    COALESCE("json_agg"(DISTINCT "jsonb_build_object"('id', "gi"."id", 'image_url', "gi"."image_url", 'title', "gi"."title", 'description', "gi"."description", 'display_order', "gi"."display_order", 'is_featured', "gi"."is_featured") ORDER BY ("jsonb_build_object"('id', "gi"."id", 'image_url', "gi"."image_url", 'title', "gi"."title", 'description', "gi"."description", 'display_order', "gi"."display_order", 'is_featured', "gi"."is_featured"))) FILTER (WHERE ("gi"."id" IS NOT NULL)), '[]'::json) AS "gallery_images",
    COALESCE("json_agg"(DISTINCT "jsonb_build_object"('badge_key', "ab"."badge_key", 'name', "bt"."name", 'description', "bt"."description", 'icon', "bt"."icon", 'color', "bt"."color", 'awarded_at', "ab"."awarded_at", 'metadata', "ab"."metadata") ORDER BY ("jsonb_build_object"('badge_key', "ab"."badge_key", 'name', "bt"."name", 'description', "bt"."description", 'icon', "bt"."icon", 'color', "bt"."color", 'awarded_at', "ab"."awarded_at", 'metadata', "ab"."metadata"))) FILTER (WHERE (("ab"."id" IS NOT NULL) AND (("ab"."expires_at" IS NULL) OR ("ab"."expires_at" > "now"())))), '[]'::json) AS "badges"
   FROM (((("public"."artisans" "a"
     JOIN "public"."profiles" "p" ON (("p"."id" = "a"."user_id")))
     LEFT JOIN "public"."gallery_images" "gi" ON (("gi"."artisan_id" = "a"."id")))
     LEFT JOIN "public"."artisan_badges" "ab" ON (("ab"."artisan_id" = "a"."id")))
     LEFT JOIN "public"."badge_types" "bt" ON (("bt"."badge_key" = "ab"."badge_key")))
  WHERE ("a"."status" = 'published'::"text")
  GROUP BY "a"."id", "p"."id";



CREATE OR REPLACE TRIGGER "check_featured_limit_trigger" BEFORE INSERT OR UPDATE ON "public"."gallery_images" FOR EACH ROW EXECUTE FUNCTION "public"."check_featured_limit"();



CREATE OR REPLACE TRIGGER "on_artisan_profile_update" BEFORE UPDATE ON "public"."artisans" FOR EACH ROW EXECUTE FUNCTION "public"."update_artisan_profile_completion"();



CREATE OR REPLACE TRIGGER "on_artisan_updated" BEFORE UPDATE ON "public"."artisans" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_profile_updated" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_artisans_updated_at" BEFORE UPDATE ON "public"."artisans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."artisan_analytics_events"
    ADD CONSTRAINT "artisan_analytics_events_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artisan_analytics_events"
    ADD CONSTRAINT "artisan_analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."artisan_analytics_summary"
    ADD CONSTRAINT "artisan_analytics_summary_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artisan_applications"
    ADD CONSTRAINT "artisan_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."artisan_badges"
    ADD CONSTRAINT "artisan_badges_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artisan_badges"
    ADD CONSTRAINT "artisan_badges_awarded_by_fkey" FOREIGN KEY ("awarded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."artisans"
    ADD CONSTRAINT "artisans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."publications"
    ADD CONSTRAINT "collections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."contact_requests"
    ADD CONSTRAINT "contact_requests_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gallery_images"
    ADD CONSTRAINT "gallery_images_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_artisan_id_fkey" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage publications" ON "public"."publications" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can read applications" ON "public"."artisan_applications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can update applications" ON "public"."artisan_applications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Analytics events create" ON "public"."artisan_analytics_events" FOR INSERT WITH CHECK (true);



CREATE POLICY "Analytics events read" ON "public"."artisan_analytics_events" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "artisans"."user_id"
   FROM "public"."artisans"
  WHERE ("artisans"."id" = "artisan_analytics_events"."artisan_id"))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role"))))));



CREATE POLICY "Analytics summary read" ON "public"."artisan_analytics_summary" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "artisans"."user_id"
   FROM "public"."artisans"
  WHERE ("artisans"."id" = "artisan_analytics_summary"."artisan_id"))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role"))))));



CREATE POLICY "Anyone can submit contact requests" ON "public"."contact_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Artisan badges admin delete" ON "public"."artisan_badges" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Artisan badges admin insert" ON "public"."artisan_badges" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Artisan badges admin update" ON "public"."artisan_badges" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Artisan badges read" ON "public"."artisan_badges" FOR SELECT USING (true);



CREATE POLICY "Artisan delete policy" ON "public"."artisans" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Artisan insert policy" ON "public"."artisans" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Artisan select policy" ON "public"."artisans" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role"))))));



CREATE POLICY "Artisan update policy" ON "public"."artisans" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Badge types admin delete" ON "public"."badge_types" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Badge types admin insert" ON "public"."badge_types" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Badge types admin update" ON "public"."badge_types" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Badge types read" ON "public"."badge_types" FOR SELECT USING (true);



CREATE POLICY "Collections admin delete" ON "public"."publications" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Collections admin insert" ON "public"."publications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Collections admin update" ON "public"."publications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Collections read" ON "public"."publications" FOR SELECT USING ((("status" = 'published'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."app_role"))))));



CREATE POLICY "Contact request select" ON "public"."contact_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."artisans"
  WHERE (("artisans"."id" = "contact_requests"."artisan_id") AND ("artisans"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Contact request update" ON "public"."contact_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."artisans"
  WHERE (("artisans"."id" = "contact_requests"."artisan_id") AND ("artisans"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."artisans"
  WHERE (("artisans"."id" = "contact_requests"."artisan_id") AND ("artisans"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Craft types viewable by everyone" ON "public"."craft_types" FOR SELECT USING (true);



CREATE POLICY "Gallery delete policy" ON "public"."gallery_images" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."artisans" "a"
  WHERE (("a"."id" = "gallery_images"."artisan_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Gallery select policy" ON "public"."gallery_images" FOR SELECT USING (true);



CREATE POLICY "Gallery update policy" ON "public"."gallery_images" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."artisans" "a"
  WHERE (("a"."id" = "gallery_images"."artisan_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."artisans" "a"
  WHERE (("a"."id" = "gallery_images"."artisan_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Gallery write policy" ON "public"."gallery_images" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."artisans" "a"
  WHERE (("a"."id" = "gallery_images"."artisan_id") AND ("a"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Profiles viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Published publications are publicly readable" ON "public"."publications" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "User favorites delete" ON "public"."user_favorites" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User favorites select" ON "public"."user_favorites" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "User favorites write" ON "public"."user_favorites" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."artisan_analytics_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artisan_analytics_summary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artisan_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artisan_badges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artisans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."badge_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."craft_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gallery_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."publications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."aggregate_daily_analytics"("p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."aggregate_daily_analytics"("p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."aggregate_daily_analytics"("p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."award_badge"("p_artisan_id" "uuid", "p_badge_key" "text", "p_metadata" "jsonb", "p_expires_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."award_badge"("p_artisan_id" "uuid", "p_badge_key" "text", "p_metadata" "jsonb", "p_expires_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."award_badge"("p_artisan_id" "uuid", "p_badge_key" "text", "p_metadata" "jsonb", "p_expires_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_featured_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_featured_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_featured_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_artisan_profile"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_artisan_profile"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_artisan_profile"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_collection"("p_title" "text", "p_slug" "text", "p_description" "text", "p_cover_image_url" "text", "p_is_featured" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."create_collection"("p_title" "text", "p_slug" "text", "p_description" "text", "p_cover_image_url" "text", "p_is_featured" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_collection"("p_title" "text", "p_slug" "text", "p_description" "text", "p_cover_image_url" "text", "p_is_featured" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_publication"("p_title" "text", "p_slug" "text", "p_description" "text", "p_cover_image_url" "text", "p_external_url" "text", "p_active_from" timestamp with time zone, "p_active_until" timestamp with time zone, "p_issue_number" integer, "p_theme" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_publication"("p_title" "text", "p_slug" "text", "p_description" "text", "p_cover_image_url" "text", "p_external_url" "text", "p_active_from" timestamp with time zone, "p_active_until" timestamp with time zone, "p_issue_number" integer, "p_theme" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_publication"("p_title" "text", "p_slug" "text", "p_description" "text", "p_cover_image_url" "text", "p_external_url" "text", "p_active_from" timestamp with time zone, "p_active_until" timestamp with time zone, "p_issue_number" integer, "p_theme" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_artisan_analytics"("p_artisan_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_artisan_analytics"("p_artisan_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_artisan_analytics"("p_artisan_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_artisan_analytics_realtime"("p_artisan_id" "uuid", "p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_artisan_analytics_realtime"("p_artisan_id" "uuid", "p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_artisan_analytics_realtime"("p_artisan_id" "uuid", "p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_artisan_badges"("p_artisan_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_artisan_badges"("p_artisan_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_artisan_badges"("p_artisan_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_weekly_publication"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_weekly_publication"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_weekly_publication"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_email_by_username"("_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_email_by_username"("_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_email_by_username"("_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_past_weekly_publications"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_past_weekly_publications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_past_weekly_publications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_artisan_profile_completed"("_artisan_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_artisan_profile_completed"("_artisan_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_artisan_profile_completed"("_artisan_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."publish_artisan_profile"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."publish_artisan_profile"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."publish_artisan_profile"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."publish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."publish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."publish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."revoke_badge"("p_artisan_id" "uuid", "p_badge_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."revoke_badge"("p_artisan_id" "uuid", "p_badge_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."revoke_badge"("p_artisan_id" "uuid", "p_badge_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."track_analytics_event"("p_artisan_id" "uuid", "p_event_type" "text", "p_event_data" "jsonb", "p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."track_analytics_event"("p_artisan_id" "uuid", "p_event_type" "text", "p_event_data" "jsonb", "p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_analytics_event"("p_artisan_id" "uuid", "p_event_type" "text", "p_event_data" "jsonb", "p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unpublish_artisan_profile"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."unpublish_artisan_profile"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unpublish_artisan_profile"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."unpublish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."unpublish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unpublish_artisan_profile"("_artisan_id" "uuid", "_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_artisan_profile_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_artisan_profile_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_artisan_profile_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."artisan_analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."artisan_analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."artisan_analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."artisan_analytics_summary" TO "anon";
GRANT ALL ON TABLE "public"."artisan_analytics_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."artisan_analytics_summary" TO "service_role";



GRANT ALL ON TABLE "public"."artisan_applications" TO "anon";
GRANT ALL ON TABLE "public"."artisan_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."artisan_applications" TO "service_role";



GRANT ALL ON TABLE "public"."artisan_badges" TO "anon";
GRANT ALL ON TABLE "public"."artisan_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."artisan_badges" TO "service_role";



GRANT ALL ON TABLE "public"."artisans" TO "anon";
GRANT ALL ON TABLE "public"."artisans" TO "authenticated";
GRANT ALL ON TABLE "public"."artisans" TO "service_role";



GRANT ALL ON TABLE "public"."artisans_public" TO "anon";
GRANT ALL ON TABLE "public"."artisans_public" TO "authenticated";
GRANT ALL ON TABLE "public"."artisans_public" TO "service_role";



GRANT ALL ON TABLE "public"."badge_types" TO "anon";
GRANT ALL ON TABLE "public"."badge_types" TO "authenticated";
GRANT ALL ON TABLE "public"."badge_types" TO "service_role";



GRANT ALL ON TABLE "public"."contact_requests" TO "anon";
GRANT ALL ON TABLE "public"."contact_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_requests" TO "service_role";



GRANT ALL ON TABLE "public"."craft_types" TO "anon";
GRANT ALL ON TABLE "public"."craft_types" TO "authenticated";
GRANT ALL ON TABLE "public"."craft_types" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_images" TO "anon";
GRANT ALL ON TABLE "public"."gallery_images" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_images" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."publications" TO "anon";
GRANT ALL ON TABLE "public"."publications" TO "authenticated";
GRANT ALL ON TABLE "public"."publications" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







RESET ALL;
