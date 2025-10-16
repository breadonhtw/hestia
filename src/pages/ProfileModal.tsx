import { useNavigate, useParams } from "react-router-dom";
import { CreatorOverlay } from "@/components/CreatorOverlay";
import { useArtisanById, useArtisanByUsername } from "@/hooks/useArtisans";
import type { Creator } from "@/types/creator";

const ProfileModal = () => {
  const navigate = useNavigate();
  const { username, id } = useParams();

  const {
    data: artisanByUsername,
    isLoading: isLoadingByUsername,
  } = useArtisanByUsername(username ?? "");
  const { data: artisanById, isLoading: isLoadingById } = useArtisanById(
    id ?? ""
  );

  const artisan = artisanByUsername ?? artisanById;
  const isLoading = isLoadingByUsername || isLoadingById;

  if (isLoading || !artisan) return null;

  const creator: Creator = {
    id: artisan.id,
    name: artisan.username || artisan.full_name || "Anonymous",
    craftType: artisan.craft_type,
    location: artisan.location,
    bio: artisan.bio,
    image: artisan.avatar_url || "/placeholder.svg",
    works: [],
    featured: artisan.featured || false,
    instagram: artisan.instagram || undefined,
    website: artisan.website || undefined,
    username: artisan.username || undefined,
  };

  return (
    <CreatorOverlay creator={creator} onClose={() => navigate(-1)} />
  );
};

export default ProfileModal;

