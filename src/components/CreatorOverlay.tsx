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
        aria-labelledby="creator-name"
      >
        {/* Close Button */}
        <button
          className="close-overlay-btn"
          onClick={onClose}
          aria-label="Close creator preview"
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
          <div className="relative w-[160px] h-[160px] rounded-full overflow-hidden border-4 border-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <img
              src={creator.image}
              alt={creator.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Creator Info */}
        <div className="text-center space-y-2 mb-4">
          <h3 
            className="creator-name font-serif text-[32px] font-bold text-[#1F4742] dark:text-[#F5F0E8]"
            id="creator-name"
          >
            {creator.name}
          </h3>
          <Badge 
            className="text-sm font-bold px-4 py-1.5"
            style={{
              backgroundColor: '#A0613A',
              color: 'white',
              borderRadius: '20px'
            }}
          >
            {creator.craftType}
          </Badge>
          <p className="location-text text-base flex items-center justify-center gap-1.5 mt-2 text-[#7A8A86] dark:text-[#C4B5A5]">
            <MapPin className="h-4 w-4" style={{ color: '#B8976A' }} />
            {creator.location}
          </p>
        </div>

        {/* Gold Divider */}
        <div
          className="w-full h-px mx-auto"
          style={{ background: "#B8976A", opacity: 0.4, marginTop: '24px', marginBottom: '20px' }}
        />

        {/* Featured Works Section */}
        <div className="px-2">
          <h4 
            className="featured-works-heading text-center text-lg mb-4 text-[#B8976A] font-semibold uppercase tracking-wider"
          >
            Featured Works
          </h4>

          {/* Work Thumbnails */}
          <div className="flex justify-center gap-3 mb-6">
            {creator.works.slice(0, 3).map((work, idx) => (
              <div
                key={work.title}
                className="work-thumbnail w-[110px] h-[110px] rounded-xl overflow-hidden"
                style={{
                  animationDelay: `${idx * 0.1}s`,
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${work.title}`}
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
            className="focus-terracotta w-full font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
            style={{
              height: '52px',
              backgroundColor: '#B8976A',
              color: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(184, 151, 106, 0.3)',
              marginTop: '24px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#A0613A';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(160, 97, 58, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#B8976A';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(184, 151, 106, 0.3)';
            }}
          >
            View Full Profile
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
};
