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
  isPlaceholder = false,
}: CreatorCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(creator.id, creator.name);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div
      className={`relative bg-card dark:bg-card-dark border border-border rounded-xl p-6 transition-all duration-300 cursor-pointer ${
        isPlaceholder ? "opacity-30 pointer-events-none" : ""
      }`}
      style={{
        animation: "fade-in-up 0.6s ease-out forwards",
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
        transform: isHovered ? "translateY(-6px)" : "translateY(0px)",
        boxShadow: isHovered ? "var(--shadow-lift)" : "var(--shadow-soft)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Favorite Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 z-10 rounded-full bg-background/60 backdrop-blur-sm"
      >
        <Heart
          className={`h-5 w-5 transition-all ${
            isFavorite(creator.id)
              ? "fill-primary text-primary"
              : "text-muted-foreground"
          } ${isAnimating ? "animate-heart-beat" : ""}`}
        />
      </Button>

      {/* Left-Aligned Content */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-background flex-shrink-0 shadow-inner">
          <img
            src={creator.image}
            alt={creator.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-1">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            {creator.name}
          </h3>
          <Badge variant="secondary">{creator.craftType}</Badge>
          <p className="text-sm flex items-center gap-1.5 pt-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {creator.location}
          </p>
        </div>
      </div>

      {/* Hover-reveal button for a clear CTA */}
      <div
        className={`absolute bottom-6 right-6 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <Button
          size="sm"
          onClick={onClick}
          variant="default"
          className="shadow-lg"
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};
