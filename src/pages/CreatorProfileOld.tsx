import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PageLayout } from "@/components/PageLayout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CreatorCard } from "@/components/CreatorCard";
import { MapPin, Instagram, Globe, Loader2, Edit } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { sanitizeUrl, sanitizeInstagramHandle } from "@/lib/sanitize";
import {
  useArtisanById,
  useArtisanByUsername,
  useArtisans,
  useGalleryImages,
} from "@/hooks/useArtisans";
import type { Creator } from "@/types/creator";
import { useAuth } from "@/contexts/AuthContext";
import { ArtisanBadges } from "@/components/artisan/ArtisanBadge";
import { trackProfileViewDebounced } from "@/lib/analytics";

const CreatorProfile = () => {
  const { id, username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch the specific artisan
  const { data: artisanById, isLoading: isLoadingById } = useArtisanById(
    id ?? ""
  );
  const { data: artisanByUsername, isLoading: isLoadingByUsername } =
    useArtisanByUsername(username ?? "");

  const artisan = artisanById ?? artisanByUsername;
  const isLoading = isLoadingById || isLoadingByUsername;

  // Fetch gallery images for this artisan
  const { data: galleryImages } = useGalleryImages(artisan?.id || "");

  // Fetch all artisans for "similar creators"
  const { data: allArtisans } = useArtisans();

  // Track profile view when artisan data is loaded
  useEffect(() => {
    if (artisan?.id && !isLoading) {
      trackProfileViewDebounced(artisan.id);
    }
  }, [artisan?.id, isLoading]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="w-full max-w-[1920px]">
          <div className="container mx-auto px-4 py-24 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          </div>
          <Footer />
        </div>
      </PageLayout>
    );
  }

  if (!artisan) {
    return (
      <PageLayout>
        <div className="w-full max-w-[1920px]">
          <div className="container mx-auto px-4 py-24 text-center">
            <h1 className="font-serif text-4xl font-bold mb-4">
              Creator Not Found
            </h1>
            <Link to="/browse">
              <Button>Browse Creators</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageLayout>
    );
  }

  // Transform artisan to Creator format
  const creator: Creator = {
    id: artisan.id,
    name: artisan.username || artisan.full_name || "Anonymous",
    craftType: artisan.craft_type,
    location: artisan.location,
    bio: artisan.bio,
    image: artisan.avatar_url || "/placeholder.svg",
    works: [], // TODO: Fetch gallery images
    featured: artisan.featured || false,
    story: undefined,
    instagram: artisan.instagram || undefined,
    website: artisan.website || undefined,
    username: artisan.username || undefined,
    badges: artisan.badges ? (typeof artisan.badges === 'string' ? JSON.parse(artisan.badges) : artisan.badges) : undefined,
  };

  // Find similar creators
  const similarCreators: Creator[] = (allArtisans || [])
    .filter((a) => a.id !== artisan.id && a.craft_type === artisan.craft_type)
    .slice(0, 3)
    .map((a) => ({
      id: a.id,
      name: a.username || a.full_name || "Anonymous",
      craftType: a.craft_type,
      location: a.location,
      bio: a.bio,
      image: a.avatar_url || "/placeholder.svg",
      works: [],
      featured: a.featured || false,
    }));

  // Check if viewing own profile (compare user.id with artisan.user_id, not artisan.id)
  const isOwnProfile = user?.id === artisan.user_id;

  return (
    <PageLayout>
      <div className="w-full max-w-[1920px]">
        <Helmet>
          <title>{`${creator.name} | ${creator.craftType} | Hestia`}</title>
          <meta
            name="description"
            content={
              creator.bio?.slice(0, 160) ||
              `${creator.name} – ${creator.craftType} in ${creator.location}`
            }
          />
          <link
            rel="canonical"
            href={`https://www.hestia.sg/creator/${creator.id}`}
          />
          <meta
            property="og:title"
            content={`${creator.name} | ${creator.craftType} | Hestia`}
          />
          <meta
            property="og:description"
            content={
              creator.bio?.slice(0, 160) ||
              `${creator.name} – ${creator.craftType} in ${creator.location}`
            }
          />
          <meta
            property="og:image"
            content={creator.image}
          />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.hestia.sg",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Browse",
                  item: "https://www.hestia.sg/browse",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: creator.name,
                  item: `https://www.hestia.sg/creator/${creator.id}`,
                },
              ],
            })}
          </script>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: creator.name,
              jobTitle: creator.craftType,
              areaServed: creator.location,
              image: creator.image,
              url: `https://www.hestia.sg/creator/${creator.id}`,
              knowsAbout: creator.craftType ? [creator.craftType] : [],
              ...(creator.instagram && {
                sameAs: [
                  ...(creator.instagram
                    ? [`https://instagram.com/${sanitizeInstagramHandle(
                        creator.instagram
                      )}`]
                    : []),
                  ...(creator.website ? [creator.website] : []),
                ].filter(Boolean),
              }),
              description: creator.bio,
            })}
          </script>
        </Helmet>
        {/* Hero Section */}
        <section className="relative h-96 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

          <div className="container mx-auto px-4 relative h-full flex items-end pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 w-full">
              {/* Creator Photo */}
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-lift -mb-20 md:-mb-8">
                <OptimizedImage
                  src={creator.image}
                  alt={creator.name}
                  className="w-full h-full object-cover"
                  width={160}
                  height={160}
                />
              </div>

              {/* Creator Info */}
              <div className="md:mb-4 mt-4 md:mt-0 flex-1">
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
                  {creator.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                  <span className="font-medium text-secondary text-lg">
                    {creator.craftType}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {creator.location}
                  </span>
                </div>
                {creator.badges && creator.badges.length > 0 && (
                  <ArtisanBadges badges={creator.badges} size="md" />
                )}
              </div>

              {/* Social Links and Edit Button - positioned next to profile icon */}
              <div className="flex gap-3 md:mb-4 items-end">
              {isOwnProfile && (
                <Button
                  onClick={() => navigate("/settings/profile")}
                  className="flex items-center gap-2 shadow-soft"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
              {creator.instagram && (
                <a
                  href={`https://instagram.com/${sanitizeInstagramHandle(
                    creator.instagram
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-soft"
                >
                  <Instagram className="h-5 w-5 text-foreground hover:text-primary-foreground" />
                </a>
              )}
              {creator.website && (
                <a
                  href={sanitizeUrl(creator.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-soft"
                >
                  <Globe className="h-5 w-5 text-foreground hover:text-primary-foreground" />
                </a>
              )}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto px-4 lg:px-8 py-16 max-w-5xl">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
            About {creator.name.split(" ")[0]}
          </h2>
          <div className="bg-[#F5F0E8] dark:bg-[rgba(245,240,232,0.08)] rounded-xl p-8 border border-[rgba(160,97,58,0.1)] dark:border-[rgba(245,240,232,0.1)] shadow-soft">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-[#2A5A54] dark:text-[#E8DFD3] leading-relaxed mb-6 break-words overflow-wrap-anywhere">
                {creator.bio}
              </p>
              {creator.story && (
                <p className="text-lg text-[#2A5A54] dark:text-[#E8DFD3] leading-relaxed break-words overflow-wrap-anywhere">
                  {creator.story}
                </p>
              )}
            </div>
          </div>{" "}
        </section>

        {/* Gallery Section */}
        {galleryImages && galleryImages.length > 0 && (
          <section className="container mx-auto px-4 lg:px-8 py-16">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
              Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-lift transition-shadow"
                >
                  <OptimizedImage
                    src={image.image_url}
                    alt={image.title || "Gallery image"}
                    className="w-full h-full object-cover"
                    width={600}
                    height={600}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {image.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span>★</span>
                      <span>Featured</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Creators */}
        {similarCreators.length > 0 && (
          <section className="container mx-auto px-4 lg:px-8 py-16">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
              Discover Similar Creators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {similarCreators.map((c, idx) => (
                <CreatorCard
                  key={c.id}
                  creator={c}
                  index={idx}
                  onClick={() => (window.location.href = `/creator/${c.id}`)}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}

        <Footer />
      </div>
    </PageLayout>
  );
};

export default CreatorProfile;
