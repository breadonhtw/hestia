import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useArtisans = () => {
  return useQuery({
    queryKey: ["artisans-public"],
    queryFn: async () => {
      // IMPORTANT: Query the public VIEW, not the table
      const { data, error } = await supabase
        .from("artisans_public")
        .select(
          "id, user_id, craft_type, location, bio, story, instagram, website, avatar_url, full_name, username, featured, accepting_orders, open_for_commissions, created_at, updated_at, categories, tags, estate, contact_channel, contact_value, email, phone, accepting_orders_expires_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useFeaturedGalleryImages = (artisanId: string) => {
  return useQuery({
    queryKey: ["featured-gallery", artisanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("artisan_id", artisanId)
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!artisanId,
    staleTime: 5 * 60 * 1000, // 5 minutes - featured images don't change frequently
  });
};

export const useGalleryImages = (artisanId: string) => {
  return useQuery({
    queryKey: ["gallery", artisanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("artisan_id", artisanId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!artisanId,
    staleTime: 2 * 60 * 1000, // 2 minutes - gallery can be edited more frequently
  });
};

export const useArtisanById = (id: string) => {
  return useQuery({
    queryKey: ["artisan-public", id],
    queryFn: async () => {
      // Query the public VIEW
      const { data, error } = await supabase
        .from("artisans_public")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useArtisanByUsername = (username: string) => {
  return useQuery({
    queryKey: ["artisan-public-username", username],
    queryFn: async () => {
      // Query the public VIEW
      const { data, error } = await supabase
        .from("artisans_public")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });
};
