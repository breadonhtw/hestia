import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { Creator } from "@/types/creator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

interface CreatorCardProps {
  creator: Creator;
  index?: number;
}

export const CreatorCard = ({ creator, index = 0 }: CreatorCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverIntent, setHoverIntent] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  // Random subtle rotation for organic feel
  const baseRotation = (index % 3 - 1) * 1.5; // -1.5, 0, or 1.5 degrees

  // Hover intent detection - 150ms delay before triggering
  const handleMouseEnter = () => {
    const timer = setTimeout(() => setHoverIntent(true), 150);
    setIsHovered(true);
    return () => clearTimeout(timer);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoverIntent(false);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(creator.id, creator.name);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div className="relative perspective-1000">
      {/* Main Card */}
      <Link
        to={`/creator/${creator.id}`}
        className="block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`relative bg-card rounded-xl p-6 shadow-soft transition-all duration-[350ms] ${
            hoverIntent
              ? "scale-105 -translate-y-2 shadow-glow z-30 rotate-0"
              : "hover:shadow-lift"
          }`}
          style={{
            transform: !hoverIntent ? `rotate(${baseRotation}deg)` : undefined,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
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
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary/10">
              <img
                src={creator.image}
                alt={creator.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Creator Info */}
          <div className="text-center space-y-2">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              {creator.name}
            </h3>
            <Badge
              variant="secondary"
              className="bg-secondary text-secondary-foreground"
            >
              {creator.craftType}
            </Badge>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3" />
              {creator.location}
            </p>
          </div>

          {/* Work Preview (shown on hover) */}
          {creator.works[1] && (
            <div 
              className={`mt-4 rounded-lg overflow-hidden transition-all duration-300 ${
                hoverIntent 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-2 h-0 mt-0"
              }`}
            >
              <img
                src={creator.works[1].image}
                alt={creator.works[1].title}
                className="w-full h-32 object-cover"
              />
            </div>
          )}
        </div>
      </Link>

      {/* Side Cards (Desktop Only - Fan Out on Hover) */}
      {/* Left Card */}
      {creator.works[0] && (
        <div
          className={`hidden lg:block absolute top-0 left-0 w-full h-full pointer-events-none z-20 transition-all duration-[350ms]`}
          style={{
            transform: hoverIntent 
              ? "translateX(-120px) rotate(-15deg) scale(1)" 
              : "translateX(0) rotate(0deg) scale(0.95)",
            opacity: hoverIntent ? 0.95 : 0,
            transitionDelay: hoverIntent ? "100ms" : "0ms",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className="bg-card rounded-xl p-4 shadow-lift h-full">
            <img
              src={creator.works[0].image}
              alt={creator.works[0].title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Right Card */}
      {creator.works[2] && (
        <div
          className={`hidden lg:block absolute top-0 left-0 w-full h-full pointer-events-none z-20 transition-all duration-[350ms]`}
          style={{
            transform: hoverIntent 
              ? "translateX(120px) rotate(15deg) scale(1)" 
              : "translateX(0) rotate(0deg) scale(0.95)",
            opacity: hoverIntent ? 0.95 : 0,
            transitionDelay: hoverIntent ? "150ms" : "0ms",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className="bg-card rounded-xl p-4 shadow-lift h-full">
            <img
              src={creator.works[2].image}
              alt={creator.works[2].title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
