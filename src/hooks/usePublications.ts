import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Publication {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  external_url: string | null;
  theme: string | null;
  issue_number: number | null;
  active_from: string | null;
  active_until: string | null;
  created_at: string;
}

/**
 * Fetch all published publications
 */
export function usePublications() {
  return useQuery({
    queryKey: ["publications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("status", "published")
        .order("issue_number", { ascending: false });

      if (error) throw error;
      return data as Publication[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch current week's publication
 */
export function useCurrentWeeklyPublication() {
  return useQuery({
    queryKey: ["publication-weekly-current"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_current_weekly_publication");

      if (error) throw error;
      return data as Publication | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch past weekly publications (magazine archive)
 */
export function usePastWeeklyPublications() {
  return useQuery({
    queryKey: ["publication-weekly-past"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_past_weekly_publications");

      if (error) throw error;
      return (data as Publication[]) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch a single publication by slug
 */
export function usePublicationBySlug(slug: string) {
  return useQuery({
    queryKey: ["publication", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data as Publication | null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
