import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart, ArrowRight } from "lucide-react";
import { Creator } from "@/types/creator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

interface CreatorCardProps {
  creator: Creator;
  index?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CreatorCard = ({ creator, index = 0, isExpanded = false, onToggleExpand }: CreatorCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Random rotation for organic feel
  const baseRotation = (index % 3 - 1) * 1.5; // -1.5, 0, or 1.5 degrees

  // Desktop hover or mobile expanded state
  const showPreview = isHovered || isExpanded;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // On mobile/tablet, toggle expansion
    if (window.innerWidth < 1024 && onToggleExpand) {
      e.preventDefault();
      onToggleExpand();
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(creator.id, creator.name);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <Link
      to={`/creator/${creator.id}`}
      className="block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div
        className={`creator-card relative bg-[#F5F0E8] rounded-[20px] p-6 transition-all duration-[350ms] overflow-hidden ${
          showPreview
            ? "expanded scale-[1.03] -translate-y-1 shadow-[0_6px_20px_rgba(184,151,106,0.3)] rotate-0"
            : "shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        }`}
        style={{
          transform: !showPreview ? `rotate(${baseRotation}deg)` : undefined,
          transitionTimingFunction: "ease-in-out",
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

        {/* Preview Section - Slides Down on Hover/Expand */}
        <div
          className={`expanded-preview transition-all duration-300 ease-out overflow-hidden ${
            showPreview 
              ? "max-h-48 opacity-100 mt-4" 
              : "max-h-0 opacity-0 mt-0"
          }`}
        >
          {/* Gold Divider */}
          <div className="w-full h-px bg-primary my-3" />
          
          {/* Work Thumbnails */}
          <div className="flex justify-center gap-1.5 mb-3">
            {creator.works.slice(0, 3).map((work, idx) => (
              <div
                key={work.title}
                className="w-20 h-20 rounded-lg overflow-hidden transition-opacity duration-300"
                style={{
                  transitionDelay: showPreview ? `${idx * 100}ms` : "0ms",
                  opacity: showPreview ? 1 : 0,
                }}
              >
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* View Profile Link */}
          <div className="text-center">
            <span className="view-profile-link inline-flex items-center gap-1 hover:gap-2 transition-all">
              View Profile
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
