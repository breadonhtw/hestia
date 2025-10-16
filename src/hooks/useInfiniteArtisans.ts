import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 12; // Load 12 artisans at a time (similar to Instagram's feed)

export const useInfiniteArtisans = () => {
  return useInfiniteQuery({
    queryKey: ["artisans-infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("artisans_public")
        .select(
          "id, user_id, craft_type, location, bio, story, instagram, website, avatar_url, full_name, username, featured, accepting_orders, open_for_commissions, created_at, updated_at, categories, tags, estate, contact_channel, contact_value, email, phone, accepting_orders_expires_at",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
        totalCount: count || 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - similar to X/Instagram's cache strategy
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};
