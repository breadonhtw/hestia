import { useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { Creator } from "@/types/creator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";

interface CreatorOverlayProps {
  creator: Creator;
  onClose: () => void;
}

export const CreatorOverlay = ({ creator, onClose }: CreatorOverlayProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Focus trap and body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(creator.id, creator.name);
  };

  const handleViewProfile = () => {
    navigate(`/creator/${creator.id}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="overlay-backdrop active"
        onClick={onClose}
        role="presentation"
      />

      {/* Floating Overlay Card */}
      <div
        className="creator-card floating-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={`${creator.name} preview`}
      >
        {/* Close Button */}
        <button
          className="close-overlay-btn"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X size={20} />
        </button>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteClick}
          className="absolute top-4 left-4 z-10 rounded-full hover:bg-primary/10"
        >
          <Heart
            className={`h-5 w-5 transition-all ${
              isFavorite(creator.id)
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            }`}
          />
        </Button>

        {/* Creator Photo - Enlarged */}
        <div className="mb-4 flex justify-center">
          <div className="relative w-[160px] h-[160px] rounded-full overflow-hidden border-4 border-primary/10">
            <img
              src={creator.image}
              alt={creator.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Creator Info */}
        <div className="text-center space-y-2 mb-4">
          <h3 className="font-serif text-2xl font-semibold text-foreground">
            {creator.name}
          </h3>
          <Badge className="bg-secondary text-white text-xs rounded-full px-3 py-1">
            {creator.craftType}
          </Badge>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3" />
            {creator.location}
          </p>
        </div>

        {/* Gold Divider */}
        <div
          className="w-full h-px mx-auto my-4"
          style={{ background: "#B8976A", opacity: 0.2, maxWidth: "80%" }}
        />

        {/* Featured Works Section */}
        <div className="px-2">
          <h4 className="text-center text-muted-foreground text-sm mb-3">
            Featured Works
          </h4>

          {/* Work Thumbnails */}
          <div className="flex justify-center gap-3 mb-6">
            {creator.works.slice(0, 3).map((work, idx) => (
              <div
                key={work.title}
                className="work-thumbnail w-[110px] h-[110px] rounded-lg overflow-hidden hover:scale-105 hover:shadow-lg transition-all cursor-pointer"
                style={{
                  animationDelay: `${idx * 0.1}s`,
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

          {/* View Full Profile Button */}
          <Button
            onClick={handleViewProfile}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-secondary rounded-xl font-semibold text-base flex items-center justify-center gap-2"
          >
            View Full Profile
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
};
