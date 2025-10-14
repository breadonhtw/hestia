import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { Footer } from "@/components/Footer";
import { CreatorCard } from "@/components/CreatorCard";
import { ScrollProgress } from "@/components/ScrollProgress";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useArtisans } from "@/hooks/useArtisans";
import { HeroShadow } from "@/components/HeroShadow";
import { SkeletonCard } from "@/components/SkeletonCard";
import type { Creator } from "@/types/creator";
import { GradientText } from "@/components/ui/gradient-text";
import { FloatingOrbs } from "@/components/ui/floating-orbs";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const { data: artisansData, isLoading } = useArtisans();
  const [showEffects, setShowEffects] = useState(false);

  useEffect(() => {
    const schedule = (cb: () => void) =>
      (window as any).requestIdleCallback
        ? (window as any).requestIdleCallback(cb)
        : setTimeout(cb, 200);
    schedule(() => setShowEffects(true));
  }, []);

  // Transform artisan data to Creator format
  const creators: Creator[] = (artisansData || []).map((artisan) => ({
    id: artisan.id,
    name: artisan.full_name || "Anonymous",
    craftType: artisan.craft_type,
    location: artisan.location,
    bio: artisan.bio,
    story: artisan.story || "",
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
  const bentoReveal = useScrollReveal({ threshold: 0.1 });
  const artisansReveal = useScrollReveal({ threshold: 0.1 });
  const categoriesReveal = useScrollReveal({ threshold: 0.1 });

  const categoryIcons = {
    "Pottery & Ceramics": Gem,
    "Textiles & Fiber Arts": Scissors,
    Woodworking: Hammer,
    "Baked Goods": CakeSlice,
    Jewelry: Gem,
    "Art & Illustration": Palette,
    "Plants & Florals": Flower,
    "Home Decor": Home,
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
          <link rel="preload" as="image" href={heroBackground} />
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
          {showEffects && <FloatingOrbs count={6} />}
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
              <Link to="/browse">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-xl shadow-glow animate-fade-in-up pointer-events-auto"
                  style={{ animationDelay: "0.2s" }}
                >
                  Explore Creators
                </Button>
              </Link>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20 pointer-events-auto">
              <ChevronDown className="h-8 w-8 text-muted-foreground drop-shadow-md" />
            </div>
          </section>
        </HeroShadow>

        {/* This Week at Hestia - Bento Grid with Scroll Reveal */}
        <section className="relative z-10 container mx-auto px-4 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              This Week at Hestia
            </h2>
            <p className="text-xl text-muted-foreground">
              Celebrating our community of makers
            </p>
          </div>

          <div
            ref={bentoReveal.ref}
            className={`grid grid-cols-1 md:grid-cols-12 gap-6`}
          >
            {/* Large Featured Creator Tile (reserve space when loading) */}
            {featuredCreator ? (
              <div className="md:col-span-8 md:row-span-2 bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-lift transition-all card-lift">
                <div className="aspect-[3/2] md:aspect-[16/9]">
                  <img
                    src={heroBackground}
                    alt={featuredCreator.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    sizes="100vw"
                    width={1200}
                    height={800}
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Featured Creator
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-foreground mb-2">
                    {featuredCreator.name}
                  </h3>
                  <p className="text-secondary font-medium mb-3">
                    {featuredCreator.craftType}
                  </p>
                  <p className="text-muted-foreground mb-6">
                    {featuredCreator.story}
                  </p>
                  <Link to={`/creator/${featuredCreator.id}`}>
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto font-semibold"
                    >
                      Read Story →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="md:col-span-8 md:row-span-2 bg-card rounded-xl overflow-hidden shadow-soft transition-all">
                <div className="h-64 md:h-96 shimmer-skeleton" />
                <div className="p-8 space-y-4">
                  <div className="h-4 w-32 bg-muted rounded shimmer-skeleton" />
                  <div className="h-8 w-2/3 bg-muted rounded shimmer-skeleton" />
                  <div className="h-4 w-1/2 bg-muted rounded shimmer-skeleton" />
                </div>
              </div>
            )}

            {/* Stat Card */}
            <div className="md:col-span-4 bg-card rounded-xl p-8 shadow-soft hover:shadow-lift transition-all card-lift flex flex-col justify-center items-center text-center">
              <Users className="h-12 w-12 text-primary mb-4" />
              <div className="font-serif text-5xl font-bold text-primary mb-2">
                125
              </div>
              <p className="text-lg text-muted-foreground">Local Artisans</p>
            </div>

            {/* Testimonial Card */}
            <div className="md:col-span-4 bg-card rounded-xl p-8 shadow-soft hover:shadow-lift transition-all card-lift flex flex-col justify-center">
              <Quote className="h-8 w-8 text-secondary mb-4" />
              <p className="italic text-foreground mb-4">
                "Finding Elena's pottery was like discovering a treasure in my
                own neighborhood."
              </p>
              <p className="text-sm text-muted-foreground">— Sarah M.</p>
            </div>

            {/* Work Image Tiles */}
            {(
              featuredCreator?.works?.slice(0, 2) || [undefined, undefined]
            ).map((work, idx) => (
              <div
                key={work?.id ?? idx}
                className={`${
                  idx === 0 ? "md:col-span-4" : "md:col-span-8"
                } bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-lift transition-all card-lift group cursor-pointer`}
              >
                <div className="relative aspect-[4/3]">
                  {work ? (
                    <>
                      <img
                        src={work.image}
                        alt={work.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width={800}
                        height={384}
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                        <p className="text-background font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {work.title}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full shimmer-skeleton" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

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
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    index={index}
                    onClick={() =>
                      (window.location.href = `/creator/${creator.id}`)
                    }
                    variant="compact"
                  />
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

        <Footer />
      </div>
    </PageLayout>
  );
};

export default Index;
