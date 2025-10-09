import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const FAVORITES_KEY = 'hestia_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (creatorId: string, creatorName: string) => {
    setFavorites(prev => {
      const isFavorited = prev.includes(creatorId);
      
      if (isFavorited) {
        toast.info(`Removed ${creatorName} from favorites`);
        return prev.filter(id => id !== creatorId);
      } else {
        toast.success(`Added ${creatorName} to favorites! ❤️`);
        return [...prev, creatorId];
      }
    });
  };

  const isFavorite = (creatorId: string) => favorites.includes(creatorId);

  return { favorites, toggleFavorite, isFavorite, favoritesCount: favorites.length };
};
