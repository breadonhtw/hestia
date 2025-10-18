import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PageLayout } from "@/components/PageLayout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreatorCard } from "@/components/CreatorCard";
import {
  MapPin,
  Instagram,
  Globe,
  Loader2,
  Edit,
  Mail,
  Heart,
  Eye,
  MessageCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { sanitizeUrl, sanitizeInstagramHandle } from "@/lib/sanitize";
import {
  useArtisanById,
  useArtisanByUsername,
  useArtisans,
  useGalleryImages,
} from "@/hooks/useArtisans";
import { useArtisanAnalyticsRealtime } from "@/hooks/useAnalytics";
import type { Creator } from "@/types/creator";
import { useAuth } from "@/contexts/AuthContext";
import { ArtisanBadges } from "@/components/artisan/ArtisanBadge";
import { trackProfileViewDebounced } from "@/lib/analytics";
import { ContactFormDialog } from "@/components/artisan/ContactFormDialog";
import { ImageLightbox, LightboxImage } from "@/components/ui/image-lightbox";

const CreatorProfile = () => {
  const { id, username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  // Check if viewing own profile
  const isOwnProfile = user?.id === artisan?.user_id;

  // Fetch real analytics data (only if not own profile)
  const { data: analytics } = useArtisanAnalyticsRealtime(
    artisan?.id || "",
    30,
    !!artisan && !isOwnProfile
  );

  // Track profile view when artisan data is loaded
  useEffect(() => {
    if (artisan?.id && !isLoading) {
      trackProfileViewDebounced(artisan.id);
    }
  }, [artisan?.id, isLoading]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

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
    works: [],
    featured: artisan.featured || false,
    story: artisan.story || undefined,
    instagram: artisan.instagram || undefined,
    website: artisan.website || undefined,
    username: artisan.username || undefined,
    badges: artisan.badges
      ? typeof artisan.badges === "string"
        ? JSON.parse(artisan.badges)
        : artisan.badges
      : undefined,
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

  // Prepare lightbox images
  const lightboxImages: LightboxImage[] =
    galleryImages?.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      title: img.title,
      description: img.description,
    })) || [];

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
          <meta property="og:image" content={creator.image} />
        </Helmet>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-lift">
                  <OptimizedImage
                    src={creator.image}
                    alt={`${creator.name}'s profile photo`}
                    className="w-full h-full object-cover"
                    width={160}
                    height={160}
                  />
                </div>
                {artisan.featured && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-secondary text-white text-xs px-3 py-1">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              {/* Creator Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                      {creator.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <Badge className="bg-primary text-white text-base px-4 py-1.5">
                        {creator.craftType}
                      </Badge>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm">{creator.location}</span>
                      </span>
                    </div>
                    {creator.badges && creator.badges.length > 0 && (
                      <ArtisanBadges badges={creator.badges} size="md" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isOwnProfile && (
                      <Button
                        onClick={() => navigate("/settings/profile")}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                    {!isOwnProfile && (
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setContactDialogOpen(true)}
                      >
                        <Mail className="h-4 w-4" />
                        Contact
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {artisan.accepting_orders && (
                    <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Accepting Orders</span>
                    </div>
                  )}
                  {artisan.open_for_commissions && (
                    <div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Open for Commissions</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex gap-2">
                  {creator.instagram && (
                    <a
                      href={`https://instagram.com/${sanitizeInstagramHandle(
                        creator.instagram
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-card hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-soft"
                      aria-label={`Visit ${creator.name}'s Instagram`}
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {creator.website && (
                    <a
                      href={sanitizeUrl(creator.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-card hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-soft"
                      aria-label={`Visit ${creator.name}'s website`}
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Only show to visitors with real analytics data */}
        {!isOwnProfile && analytics && (
          <section className="border-b border-border">
            <div className="container mx-auto px-4 lg:px-8 py-6">
              <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs md:text-sm font-medium">
                      Views
                    </span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {analytics.total_profile_views.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs md:text-sm font-medium">
                      Favorites
                    </span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {analytics.current_favorites}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs md:text-sm font-medium">
                      Messages
                    </span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {analytics.total_contact_requests}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tabbed Content */}
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid md:grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="gallery">
                Gallery {galleryImages && `(${galleryImages.length})`}
              </TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">
                    About {creator.name.split(" ")[0]}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-base md:text-lg text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                      {creator.bio}
                    </p>
                    {creator.story && (
                      <>
                        <Separator className="my-6" />
                        <h3 className="font-serif text-xl font-semibold mb-4">
                          My Story
                        </h3>
                        <p className="text-base md:text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                          {creator.story}
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              {galleryImages && galleryImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {galleryImages.map((image, index) => (
                    <Card
                      key={image.id}
                      className="overflow-hidden group cursor-pointer hover:shadow-lift transition-all duration-300"
                      onClick={() => openLightbox(index)}
                    >
                      <div className="relative aspect-square">
                        <OptimizedImage
                          src={image.image_url}
                          alt={image.title || "Gallery image"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          width={600}
                          height={600}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {image.is_featured && (
                          <div className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                            <span>★</span>
                            <span>Featured</span>
                          </div>
                        )}
                      </div>
                      {image.title && (
                        <CardContent className="p-4">
                          <p className="font-medium text-sm line-clamp-1">
                            {image.title}
                          </p>
                          {image.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {image.description}
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">
                      No gallery images yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">
                    Get in Touch
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Work Together
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Interested in commissioning a piece or learning more
                        about {creator.name.split(" ")[0]}'s work? Send a
                        message to get started.
                      </p>
                      <Button
                        className="w-full md:w-auto gap-2"
                        size="lg"
                        onClick={() => setContactDialogOpen(true)}
                      >
                        <Mail className="h-5 w-5" />
                        Send Message
                      </Button>
                    </div>

                    {(creator.instagram || creator.website) && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold text-lg mb-4">
                            Connect Online
                          </h3>
                          <div className="flex flex-col gap-3">
                            {creator.instagram && (
                              <a
                                href={`https://instagram.com/${sanitizeInstagramHandle(
                                  creator.instagram
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors border border-border"
                              >
                                <Instagram className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium">Instagram</p>
                                  <p className="text-sm text-muted-foreground">
                                    @
                                    {sanitizeInstagramHandle(creator.instagram)}
                                  </p>
                                </div>
                              </a>
                            )}
                            {creator.website && (
                              <a
                                href={sanitizeUrl(creator.website)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted transition-colors border border-border"
                              >
                                <Globe className="h-5 w-5 text-primary" />
                                <div>
                                  <p className="font-medium">Website</p>
                                  <p className="text-sm text-muted-foreground break-all">
                                    {creator.website}
                                  </p>
                                </div>
                              </a>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Similar Creators */}
        {similarCreators.length > 0 && (
          <section className="container mx-auto px-4 lg:px-8 py-16 border-t border-border">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8">
              Discover Similar Creators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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

        {/* Contact Form Dialog */}
        <ContactFormDialog
          artisanId={artisan.id}
          artisanName={creator.name}
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
        />

        {/* Image Lightbox */}
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </div>
    </PageLayout>
  );
};

export default CreatorProfile;
