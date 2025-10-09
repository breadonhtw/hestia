import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useArtisans = () => {
  return useQuery({
    queryKey: ['artisans-public'],
    queryFn: async () => {
      // IMPORTANT: Query the public VIEW, not the table
      const { data, error } = await supabase
        .from('artisans_public')
        .select('*')
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
