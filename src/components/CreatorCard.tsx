import { useMemo, useState } from "react";
import { MapPin, Heart } from "lucide-react";
import { Creator } from "@/types/creator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { ProgressiveImage } from "@/components/ProgressiveImage";

interface CreatorCardProps {
  creator: Creator;
  index?: number;
  onClick: () => void;
  isPlaceholder?: boolean;
  variant?: "compact" | "expanded";
}

export const CreatorCard = ({
  creator,
  index = 0,
  onClick,
  isPlaceholder = false,
  variant = "compact",
}: CreatorCardProps) => {
  // Memoize derived values to avoid recalculation on parent renders
  const baseRotation = useMemo(() => ((index % 3) - 1) * 1.5, [index]);
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if artisan is newly joined (within 30 days)
  const isNew =
    (creator as any).created_at &&
    new Date((creator as any).created_at) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

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

  if (variant === "compact") {
    return (
      <div
        className={`creator-card relative bg-[#F5F0E8] dark:bg-[#2A5A54] rounded-[20px] p-6 transition-all duration-300 cursor-pointer ${
          isPlaceholder ? "dimmed-placeholder" : isHovered ? "hovered" : ""
        }`}
        style={{
          transform: isHovered
            ? "translateY(-4px) rotate(0deg)"
            : `rotate(${baseRotation}deg)`,
          boxShadow: isHovered
            ? "0 6px 20px rgba(184, 151, 106, 0.3)"
            : "0 2px 12px rgba(0, 0, 0, 0.08)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {/* New Badge */}
        {isNew && (
          <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground">
            New
          </Badge>
        )}

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
                : "text-muted-foreground dark:text-[#C4B5A5]"
            } ${isAnimating ? "animate-heart-beat" : ""}`}
          />
        </Button>

        {/* Creator Photo */}
        <div className="mb-4 flex justify-center">
          <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-primary/10">
            <ProgressiveImage
              src={creator.image}
              alt={creator.name}
              className="w-full h-full object-cover"
              loading="lazy"
              width={120}
              height={120}
            />
          </div>
        </div>

        {/* Creator Info */}
        <div className="text-center space-y-2">
          <h3 className="font-serif text-2xl font-semibold text-[#2A5A54] dark:text-[#F5F0E8]">
            {creator.name}
          </h3>
          <Badge className="bg-secondary text-white text-xs rounded-full px-3 py-1">
            {creator.craftType}
          </Badge>
          <p className="text-sm flex items-center justify-center gap-1 text-[#7A8A86] dark:text-[#C4B5A5]">
            <MapPin className="h-3 w-3" style={{ color: "#B8976A" }} />
            {creator.location}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`creator-card group relative bg-[#F5F0E8] dark:bg-[#2A5A54] rounded-[20px] p-8 transition-all duration-300 cursor-pointer ${
        isPlaceholder ? "dimmed-placeholder" : isHovered ? "hovered" : ""
      }`}
      style={{
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 8px 24px rgba(184, 151, 106, 0.4)"
          : "0 2px 12px rgba(0, 0, 0, 0.08)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* New Badge */}
      {isNew && (
        <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground">
          New
        </Badge>
      )}

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
              : "text-muted-foreground dark:text-[#C4B5A5]"
          } ${isAnimating ? "animate-heart-beat" : ""}`}
        />
      </Button>

      {/* Creator Photo - Larger */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-[160px] h-[160px] rounded-full overflow-hidden border-4 border-primary/10 shadow-md">
          <ProgressiveImage
            src={creator.image}
            alt={creator.name}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
            width={160}
            height={160}
          />
        </div>
      </div>

      {/* Creator Info */}
      <div className="text-center space-y-3">
        <h3 className="font-serif text-3xl font-bold text-[#2A5A54] dark:text-[#F5F0E8]">
          {creator.name}
        </h3>
        <Badge className="bg-secondary text-white text-sm rounded-full px-4 py-1.5">
          {creator.craftType}
        </Badge>
        <p className="text-sm flex items-center justify-center gap-1.5 text-[#7A8A86] dark:text-[#C4B5A5]">
          <MapPin className="h-4 w-4" style={{ color: "#B8976A" }} />
          {creator.location}
        </p>
      </div>

      {/* Bio Preview */}
      <div className="mt-6 pt-6 border-t border-primary/10">
        <p className="text-sm text-[#5A6F6B] dark:text-[#C4B5A5] line-clamp-3 leading-relaxed">
          {creator.bio}
        </p>
      </div>

      {/* Work Preview - Show thumbnails of first 3 works */}
      {creator.works && creator.works.length > 0 && (
        <div className="mt-6 pt-6 border-t border-primary/10">
          <p className="text-xs uppercase tracking-wider text-[#B8976A] dark:text-[#D4AF7A] font-semibold mb-3 text-center">
            Featured Works
          </p>
          <div className="flex gap-2 justify-center">
            {creator.works.slice(0, 3).map((work) => (
              <div
                key={work.id}
                className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/20 hover:border-primary transition-all"
              >
                <ProgressiveImage
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={64}
                  height={64}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Profile hint */}
      <div className="mt-6 text-center">
        <span
          className={`text-xs text-primary font-medium transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          Click to view full profile →
        </span>
      </div>
    </div>
  );
};
