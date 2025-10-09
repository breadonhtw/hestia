import { useState } from "react";
import { MapPin, Heart } from "lucide-react";
import { Creator } from "@/types/creator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

interface CreatorCardProps {
  creator: Creator;
  index?: number;
  onClick: () => void;
  isPlaceholder?: boolean;
}

export const CreatorCard = ({ 
  creator, 
  index = 0, 
  onClick,
  isPlaceholder = false 
}: CreatorCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Random rotation for organic feel
  const baseRotation = (index % 3 - 1) * 1.5; // -1.5, 0, or 1.5 degrees

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(creator.id, creator.name);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div
      className={`creator-card relative bg-[#F5F0E8] rounded-[20px] p-6 transition-all duration-300 cursor-pointer ${
        isPlaceholder 
          ? "dimmed-placeholder" 
          : isHovered 
            ? "hovered" 
            : ""
      }`}
      style={{
        transform: isHovered ? "translateY(-4px) rotate(0deg)" : `rotate(${baseRotation}deg)`,
        boxShadow: isHovered 
          ? "0 6px 20px rgba(184, 151, 106, 0.3)" 
          : "0 2px 12px rgba(0, 0, 0, 0.08)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Favorite Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 z-10 rounded-full hover:bg-primary/10"
      >
        <Heart
          className={`h-5 w-5 transition-all ${
            isFavorite(creator.id)
              ? "fill-primary text-primary"
              : "text-muted-foreground"
          } ${isAnimating ? "animate-heart-beat" : ""}`}
        />
      </Button>

      {/* Creator Photo */}
      <div className="mb-4 flex justify-center">
        <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-primary/10">
          <img
            src={creator.image}
            alt={creator.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Creator Info */}
      <div className="text-center space-y-2">
        <h3 className="font-serif text-2xl font-semibold text-foreground">
          {creator.name}
        </h3>
        <Badge
          className="bg-secondary text-white text-xs rounded-full px-3 py-1"
        >
          {creator.craftType}
        </Badge>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3" />
          {creator.location}
        </p>
      </div>
    </div>
  );
};
