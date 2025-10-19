import { useEffect, useState } from "react";
import { X, ArrowRight, Loader2, ImageOff, CheckCircle, Clock } from "lucide-react";
import { Creator } from "@/types/creator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import { useFeaturedGalleryImages, useArtisanById } from "@/hooks/useArtisans";
import { ArtisanBadges } from "@/components/artisan/ArtisanBadge";
import { useAuth } from "@/contexts/AuthContext";

interface CreatorOverlayProps {
  creator: Creator;
  onClose: () => void;
  showBio?: boolean;
}

export const CreatorOverlay = ({
  creator,
  onClose,
  showBio = true,
}: CreatorOverlayProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: featuredImages, isLoading: loadingFeatured } =
    useFeaturedGalleryImages(creator.id);
  const { data: artisan } = useArtisanById(creator.id);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Check if viewing own profile
  const isOwnProfile = user?.id === artisan?.user_id;

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

  // Body scroll lock
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

  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => new Set([...prev, imageId]));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        role="presentation"
      />

      {/* Floating Modal Card */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-[95%] max-w-[480px] max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creator-name"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center transition-all hover:scale-110"
          onClick={onClose}
          aria-label="Close creator preview"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteClick}
          className="absolute top-4 left-4 z-10 h-10 w-10 rounded-full hover:bg-primary/10"
        >
          <Heart
            className={`h-5 w-5 transition-all ${
              isFavorite(creator.id)
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            }`}
          />
        </Button>

        {/* Content */}
        <div className="p-8 pt-16">
          {/* Creator Photo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
              <img
                src={creator.image}
                alt={`${creator.name}'s profile photo`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width={128}
                height={128}
              />
            </div>
          </div>

          {/* Creator Info */}
          <div className="text-center space-y-3 mb-6">
            <h3
              className="font-serif text-3xl font-bold text-foreground"
              id="creator-name"
            >
              {creator.name}
            </h3>
            <Badge className="bg-primary text-white text-sm px-4 py-1.5">
              {creator.craftType}
            </Badge>
            <p className="text-sm flex items-center justify-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {creator.location}
            </p>
            {creator.badges && creator.badges.length > 0 && (
              <div className="flex justify-center pt-2">
                <ArtisanBadges badges={creator.badges} size="sm" maxDisplay={3} />
              </div>
            )}
          </div>

          {/* Status Indicators */}
          {artisan && (artisan.accepting_orders || artisan.open_for_commissions) && (
            <>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {artisan.accepting_orders && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span className="font-medium">Accepting Orders</span>
                  </div>
                )}
                {artisan.open_for_commissions && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium">Open for Commissions</span>
                  </div>
                )}
              </div>
              <Separator className="my-6" />
            </>
          )}

          {/* Bio Preview */}
          {showBio && creator.bio && (
            <>
              {!artisan?.accepting_orders && !artisan?.open_for_commissions && (
                <Separator className="my-6" />
              )}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed text-center">
                  {creator.bio}
                </p>
              </div>
            </>
          )}

          {/* Featured Works Section */}
          {loadingFeatured ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : featuredImages && featuredImages.length > 0 ? (
            <>
              {!showBio && !artisan?.accepting_orders && !artisan?.open_for_commissions && (
                <Separator className="my-6" />
              )}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-center mb-4 text-muted-foreground uppercase tracking-wider">
                  Featured Works
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {featuredImages.slice(0, 3).map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                      onClick={handleViewProfile}
                    >
                      {imageErrors.has(image.id) ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="h-6 w-6 text-muted-foreground" />
                        </div>
                      ) : (
                        <img
                          src={image.image_url}
                          alt={image.title || "Featured work"}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          decoding="async"
                          onError={() => handleImageError(image.id)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* Action Buttons */}
          <Button
            onClick={handleViewProfile}
            className="w-full gap-2"
            size="lg"
          >
            View Profile
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
