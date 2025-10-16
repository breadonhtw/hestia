import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  artisan_count: number;
  preview_artisans?: any[];
  artisans?: any[];
  created_at: string;
}

/**
 * Fetch all published collections
 */
export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch featured collections with preview artisans
 */
export function useFeaturedCollections() {
  return useQuery({
    queryKey: ["collections-featured"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_featured_collections");

      if (error) throw error;
      return data as Collection[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch a single collection with all its artisans
 */
export function useCollectionBySlug(slug: string) {
  return useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_collection_with_artisans", {
        p_collection_slug: slug,
      });

      if (error) throw error;
      return data as Collection;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get artisan count for a collection
 */
export function useCollectionArtisanCount(collectionId: string) {
  return useQuery({
    queryKey: ["collection-count", collectionId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("collection_artisans")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", collectionId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
  });
}
