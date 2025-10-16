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

  // Mutation to add favorite with optimistic updates (Instagram-style)
  const addFavoriteMutation = useMutation({
    mutationFn: async (artisanId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: user!.id, artisan_id: artisanId });
      if (error) throw error;
    },
    // Optimistic update - update UI immediately before server responds
    onMutate: async (artisanId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-favorites', user?.id] });
      
      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData<string[]>(['user-favorites', user?.id]);
      
      // Optimistically update to the new value
      queryClient.setQueryData<string[]>(['user-favorites', user?.id], (old = []) => [...old, artisanId]);
      
      // Return context with previous value
      return { previousFavorites };
    },
    // On error, roll back to previous value
    onError: (err, artisanId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['user-favorites', user?.id], context.previousFavorites);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  // Mutation to remove favorite with optimistic updates
  const removeFavoriteMutation = useMutation({
    mutationFn: async (artisanId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user!.id)
        .eq('artisan_id', artisanId);
      if (error) throw error;
    },
    // Optimistic update
    onMutate: async (artisanId: string) => {
      await queryClient.cancelQueries({ queryKey: ['user-favorites', user?.id] });
      const previousFavorites = queryClient.getQueryData<string[]>(['user-favorites', user?.id]);
      queryClient.setQueryData<string[]>(['user-favorites', user?.id], (old = []) => 
        old.filter(id => id !== artisanId)
      );
      return { previousFavorites };
    },
    onError: (err, artisanId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['user-favorites', user?.id], context.previousFavorites);
      }
    },
    onSettled: () => {
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
