import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const FavoritesList = () => {
  const { user } = useAuth();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // First get the artisan IDs from user_favorites
      const { data: favoriteIds } = await supabase
        .from('user_favorites')
        .select('artisan_id')
        .eq('user_id', user!.id);

      if (!favoriteIds || favoriteIds.length === 0) {
        return [];
      }

      // Then fetch full artisan data from artisans_public view
      const { data: artisans } = await supabase
        .from('artisans_public')
        .select('*')
        .in('id', favoriteIds.map(f => f.artisan_id));

      // Map back to favorites format for compatibility
      return artisans?.map(artisan => ({
        id: artisan.id,
        artisan: {
          id: artisan.id,
          bio: artisan.bio,
          craft_type: artisan.craft_type,
          location: artisan.location,
          profile: {
            username: artisan.username,
            full_name: artisan.full_name,
            avatar_url: artisan.avatar_url
          }
        }
      })) || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground mb-4">You haven't favorited any artisans yet.</p>
        <Link to="/browse" className="text-primary hover:underline">
          Browse Artisans →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((fav: any) => (
        <Link key={fav.id} to={`/artisan/${fav.artisan.profile.username}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-muted relative">
              {fav.artisan.profile.avatar_url && (
                <img
                  src={fav.artisan.profile.avatar_url}
                  alt={fav.artisan.profile.full_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{fav.artisan.profile.full_name}</h3>
              <p className="text-sm text-muted-foreground">{fav.artisan.craft_type}</p>
              <p className="text-sm text-muted-foreground">{fav.artisan.location}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
