import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronDown,
  Users,
  Quote,
  Palette,
  Scissors,
  Hammer,
  CakeSlice,
  Gem,
  Flower,
  Home,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { CreatorCard } from "@/components/CreatorCard";
import { ScrollProgress } from "@/components/ScrollProgress";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useArtisans } from "@/hooks/useArtisans";
import { usePublications } from "@/hooks/usePublications";
import { HeroShadow } from "@/components/HeroShadow";
import { SkeletonCard } from "@/components/SkeletonCard";
import type { Creator } from "@/types/creator";
import { GradientText } from "@/components/ui/gradient-text";
import { OptimizedImage } from "@/components/OptimizedImage";
import { MagazineModal } from "@/components/MagazineModal";
// Floating effects and Footer are loaded on idle to reduce initial JS
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const { user } = useAuth();
  const { data: artisansData, isLoading } = useArtisans();
  const { data: publicationsData, isLoading: isLoadingPublications } = usePublications();
  const location = useLocation();

  // Get latest publication
  const latestPublication = publicationsData?.[0];
  const [showEffects, setShowEffects] = useState(false);
  const [FloatingOrbsComp, setFloatingOrbsComp] = useState<
    null | ((props: any) => JSX.Element)
  >(null);
  const [FooterComp, setFooterComp] = useState<
    null | ((props: any) => JSX.Element)
  >(null);

  useEffect(() => {
    const schedule = (cb: () => void) =>
      (window as any).requestIdleCallback
        ? (window as any).requestIdleCallback(cb)
        : setTimeout(cb, 200);
    schedule(() => {
      setShowEffects(true);
      import("@/components/ui/floating-orbs").then((m) =>
        setFloatingOrbsComp(() => m.FloatingOrbs as any)
      );
      import("@/components/Footer").then((m) =>
        setFooterComp(() => m.Footer as any)
      );
    });
  }, []);

  // Transform artisan data to Creator format
  const creators: Creator[] = (artisansData || []).map((artisan) => ({
    id: artisan.id,
    name: artisan.username || artisan.full_name || "Anonymous",
    craftType: artisan.craft_type,
    location: artisan.location,
    bio: artisan.bio,
    story: undefined,
    image: artisan.avatar_url || "/placeholder.svg",
    works: [],
    featured: artisan.featured || false,
    instagram: artisan.instagram,
    website: artisan.website,
    username: artisan.username || artisan.id,
  }));

  const featuredCreator = creators.find((c) => c.featured) || creators[0];
  const exploreCreators = creators.slice(0, 6);

  // Scroll reveal hooks for different sections
  const magazineReveal = useScrollReveal({ threshold: 0.1 });
  const artisansReveal = useScrollReveal({ threshold: 0.1 });
  const categoriesReveal = useScrollReveal({ threshold: 0.1 });

  const categoryIcons = {
    "Pottery & Ceramics": Gem,
    "Textiles & Fiber Arts": Scissors,
    Woodworking: Hammer,
    "Baked Goods & Preserves": CakeSlice,
    "Jewelry & Accessories": Gem,
    "Art & Illustration": Palette,
    "Plants & Florals": Flower,
    "Home Decor": Home,
    Other: Sparkles,
  };

  // Prefetch creator profile route chunk on intent (hover/focus)
  const prefetchCreatorProfile = () => {
    try {
      import("./CreatorProfile");
    } catch {}
  };

  return (
    <PageLayout>
      <div className="w-full">
        <Helmet>
          <title>Hestia – Discover Local Artisans and Makers</title>
          <meta
            name="description"
            content="Connect with talented home-based artisans in your neighborhood. Discover handcrafted pottery, textiles, woodwork, baked goods, and more from local creators."
          />
          <link rel="canonical" href="https://www.hestia.sg/" />
          <meta
            property="og:title"
            content="Hestia – Discover Local Artisans in Singapore"
          />
          <meta
            property="og:description"
            content="Connect with talented home-based artisans and makers in your neighbourhood."
          />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="https://www.hestia.sg/og-image.jpg" />
          <link rel="preload" as="image" href={heroBackground} />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Hestia",
              url: "https://www.hestia.sg",
              logo: "https://www.hestia.sg/hestia-logo.svg",
              description: "Connect with talented home-based artisans and makers in Singapore. Discover handcrafted pottery, textiles, woodwork, and more.",
              sameAs: [
                "https://instagram.com/hestia_sg",
              ],
              address: {
                "@type": "PostalAddress",
                addressCountry: "SG",
                addressLocality: "Singapore",
              },
              areaServed: "SG",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Service",
                url: "https://www.hestia.sg/contact",
              },
            })}
          </script>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Hestia",
              url: "https://www.hestia.sg",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.hestia.sg/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            })}
          </script>
        </Helmet>
        <ScrollProgress />

        {/* Hero Section with Ethereal Shadow */}
        <HeroShadow
          variant="sage"
          intensity="medium"
          className="pointer-events-none min-h-screen"
          deferAnimation
        >
          {showEffects && FloatingOrbsComp && <FloatingOrbsComp count={6} />}
          <section className="min-h-screen flex items-center justify-center overflow-hidden pointer-events-auto pt-20">
            <div className="text-center max-w-4xl mx-auto px-4">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in-up drop-shadow-lg">
                Discover the Makers Behind Your Neighborhood's Hidden Treasures
              </h1>
              <p
                className="font-sans text-xl md:text-2xl text-foreground mb-8 animate-fade-in-up drop-shadow-md"
                style={{ animationDelay: "0.1s" }}
              >
                Connect with local artisans crafting beauty from home
              </p>
              <div className="flex flex-row gap-6 justify-center">
                <Link to="/browse" aria-label="Explore creators">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-glow animate-fade-in-up pointer-events-auto"
                    style={{ animationDelay: "0.2s" }}
                  >
                    Explore Creators
                  </Button>
                </Link>
                <Link
                  to={user ? "/profile" : "/join"}
                  className="pointer-events-auto"
                >
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-glow animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                  >
                    {user ? "View Profile" : "Join as a Creator"}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20 pointer-events-auto">
              <ChevronDown className="h-8 w-8 text-muted-foreground drop-shadow-md" />
            </div>
          </section>
        </HeroShadow>

        {/* Latest Magazine Section */}
        {latestPublication && (
          <section
            ref={magazineReveal.ref}
            className="relative z-10 py-24 pointer-events-auto"
          >
            <div className="container mx-auto px-4 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Stories from Our Community
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Pull up a chair and discover the heartwarming stories of makers in your neighborhood
                </p>
              </div>

              {/* Featured Magazine Card */}
              <div className="flex justify-center">
                <div className="w-full max-w-[320px]">
                  <MagazineModal publication={latestPublication}>
                    <article className="bg-card rounded-2xl overflow-hidden shadow-lift border border-border hover:shadow-glow transition-all duration-300 card-lift group cursor-pointer">
                      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                        {latestPublication.cover_image_url ? (
                          <OptimizedImage
                            src={latestPublication.cover_image_url}
                            alt={latestPublication.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            width={320}
                            height={427}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="h-16 w-16 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        {latestPublication.theme && (
                          <p className="text-sm text-secondary font-medium mb-1">
                            {latestPublication.theme}
                          </p>
                        )}
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {latestPublication.title}
                        </h3>
                        {latestPublication.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {latestPublication.description}
                          </p>
                        )}
                        <Button
                          size="default"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                        >
                          Read Magazine →
                        </Button>
                      </div>
                    </article>
                  </MagazineModal>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link to="/publications" className="text-sm text-muted-foreground hover:text-primary transition-colors underline">
                  Browse All Stories
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Explore Our Artisans - Uniform Grid with Scroll Reveal */}
        <section className="relative z-10 container mx-auto px-4 lg:px-8 py-24 pointer-events-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore Our Artisans
            </h2>
            <p className="text-xl text-muted-foreground">
              Browse by craft, location, or simply wander
            </p>
          </div>

          <div
            ref={artisansReveal.ref}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-12`}
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : exploreCreators.map((creator, index) => (
                  <div key={creator.id}>
                    <CreatorCard
                      creator={creator}
                      index={index}
                      variant="compact"
                    />
                  </div>
                ))}
          </div>

          <div className="text-center">
            <Link to="/browse">
              <Button
                size="lg"
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                Load More Creators
              </Button>
            </Link>
          </div>
        </section>

        {/* Browse by Craft Categories with Custom Icons */}
        <section className="relative z-10 bg-primary/5 py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Browse by Craft
              </h2>
            </div>

            <div
              ref={categoriesReveal.ref}
              className={`grid grid-cols-2 md:grid-cols-4 gap-6`}
            >
              {Object.entries(categoryIcons).map(([category, Icon]) => (
                <Link
                  key={category}
                  to={`/browse?craft=${encodeURIComponent(category)}`}
                  className="bg-card rounded-xl p-6 text-center hover:shadow-lift transition-all duration-300 card-lift border-2 border-transparent hover:border-primary group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:rotate-12">
                    <Icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                  </div>
                  <h3 className="font-sans font-medium text-foreground group-hover:text-primary transition-colors">
                    {category}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {FooterComp ? <FooterComp /> : null}
      </div>
    </PageLayout>
  );
};

export default Index;
