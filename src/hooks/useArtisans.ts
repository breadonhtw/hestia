import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useArtisans = () => {
  return useQuery({
    queryKey: ['artisans-public'],
    queryFn: async () => {
      // IMPORTANT: Query the public VIEW, not the table
      const { data, error } = await supabase
        .from('artisans_public')
        .select('id, user_id, craft_type, location, bio, story, instagram, website, avatar_url, full_name, username, featured, accepting_orders, open_for_commissions, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useArtisanById = (id: string) => {
  return useQuery({
    queryKey: ['artisan-public', id],
    queryFn: async () => {
      // Query the public VIEW
      const { data, error } = await supabase
        .from('artisans_public')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};
