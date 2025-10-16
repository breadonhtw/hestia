import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 30;

export interface PublicArtisanRecord {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  craft_type: string | null;
  location: string | null;
  bio: string | null;
  story?: string | null;
  instagram?: string | null;
  website?: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
  username?: string | null;
  featured?: boolean | null;
  accepting_orders?: boolean | null;
  open_for_commissions?: boolean | null;
}

export const useArtisansInfinite = () => {
  return useInfiniteQuery({
    queryKey: ["artisans-public-infinite"],
    queryFn: async ({ pageParam }) => {
      const query = supabase
        .from("artisans_public")
        .select(
          "id, user_id, craft_type, location, bio, story, instagram, website, avatar_url, full_name, username, featured, accepting_orders, open_for_commissions, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (pageParam) {
        // Keyset pagination by created_at
        query.lt("created_at", pageParam as string);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PublicArtisanRecord[];
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000,
  });
};

