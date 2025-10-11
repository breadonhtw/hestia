import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const FAVORITES_KEY = 'hestia_favorites';

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localFavorites, setLocalFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch favorites from database for authenticated users
  const { data: dbFavorites } = useQuery({
    queryKey: ['user-favorites', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_favorites')
        .select('artisan_id')
        .eq('user_id', user!.id);
      return data?.map(f => f.artisan_id) || [];
    }
  });

  // Mutation to add favorite
  const addFavoriteMutation = useMutation({
    mutationFn: async (artisanId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: user!.id, artisan_id: artisanId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  // Mutation to remove favorite
  const removeFavoriteMutation = useMutation({
    mutationFn: async (artisanId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user!.id)
        .eq('artisan_id', artisanId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const favorites = user ? (dbFavorites || []) : localFavorites;

  useEffect(() => {
    if (!user) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(localFavorites));
    }
  }, [localFavorites, user]);

  const toggleFavorite = async (creatorId: string, creatorName: string) => {
    const isFavorited = favorites.includes(creatorId);
    
    if (user) {
      // Authenticated user - use database
      if (isFavorited) {
        await removeFavoriteMutation.mutateAsync(creatorId);
        toast.info(`Removed ${creatorName} from favorites`);
      } else {
        await addFavoriteMutation.mutateAsync(creatorId);
        toast.success(`Added ${creatorName} to favorites!`);
      }
    } else {
      // Guest user - use localStorage
      setLocalFavorites(prev => {
        if (isFavorited) {
          toast.info(`Removed ${creatorName} from favorites`);
          return prev.filter(id => id !== creatorId);
        } else {
          toast.success(`Added ${creatorName} to favorites!`);
          return [...prev, creatorId];
        }
      });
    }
  };

  const isFavorite = (creatorId: string) => favorites.includes(creatorId);

  return { favorites, toggleFavorite, isFavorite, favoritesCount: favorites.length };
};
