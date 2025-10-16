import { lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PageLayout } from "@/components/PageLayout";
const FooterLazy = lazy(() =>
  import("@/components/Footer").then((m) => ({ default: m.Footer }))
);
import { CreatorCard } from "@/components/CreatorCard";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useCollectionBySlug } from "@/hooks/useCollections";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import type { Creator } from "@/types/creator";

const CollectionDetail = () => {
  const { slug } = useParams();
  const { data: collection, isLoading, error } = useCollectionBySlug(slug || "");

  if (isLoading) {
    return (
      <PageLayout>
        <div className="w-full max-w-[1920px]">
          <div className="container mx-auto px-4 py-24 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          </div>
          <Suspense fallback={<div aria-hidden="true" />}>
            <FooterLazy />
          </Suspense>
        </div>
      </PageLayout>
    );
  }

  if (error || !collection) {
    return (
      <PageLayout>
        <div className="w-full max-w-[1920px]">
          <div className="container mx-auto px-4 py-24 text-center">
            <h1 className="font-serif text-4xl font-bold mb-4">
              Collection Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The collection you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/collections">
              <Button>Browse Collections</Button>
            </Link>
          </div>
          <Suspense fallback={<div aria-hidden="true" />}>
            <FooterLazy />
          </Suspense>
        </div>
      </PageLayout>
    );
  }

  // Transform artisan data to Creator format
  const creators: Creator[] = (collection.artisans || []).map((artisan: any) => ({
    id: artisan.id,
    name: artisan.username || artisan.full_name || "Anonymous",
    craftType: artisan.craft_type,
    location: artisan.location,
    bio: artisan.bio,
    image: artisan.avatar_url || "/placeholder.svg",
    works: [],
    featured: artisan.featured || false,
    badges: artisan.badges,
  }));

  return (
    <PageLayout>
      <div className="w-full max-w-[1920px]">
        <Helmet>
          <title>{`${collection.title} | Collections | Hestia`}</title>
          <meta
            name="description"
            content={
              collection.description ||
              `Explore ${collection.artisan_count} artisans in the ${collection.title} collection.`
            }
          />
          <link
            rel="canonical"
            href={`https://www.hestia.sg/collections/${collection.slug}`}
          />
        </Helmet>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/20 to-secondary/20 py-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />

          <div className="container mx-auto px-4 relative">
            {/* Back Button */}
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 text-[#2A5A54] dark:text-[#E8DFD3] hover:text-primary dark:hover:text-[#D4AF7A] mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Collections</span>
            </Link>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Collection Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                    {collection.title}
                  </h1>
                  {collection.is_featured && (
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span>★</span>
                      <span>Featured</span>
                    </div>
                  )}
                </div>

                {collection.description && (
                  <p className="text-lg text-[#2A5A54] dark:text-[#E8DFD3] mb-6 leading-relaxed">
                    {collection.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[#5A6F6B] dark:text-[#C4B5A5]">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">
                    {collection.artisan_count}{" "}
                    {collection.artisan_count === 1 ? "artisan" : "artisans"} in this collection
                  </span>
                </div>
              </div>

              {/* Cover Image */}
              {collection.cover_image_url && (
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lift border border-[rgba(160,97,58,0.1)] dark:border-[rgba(245,240,232,0.1)]">
                  <OptimizedImage
                    src={collection.cover_image_url}
                    alt={collection.title}
                    className="w-full h-full object-cover"
                    width={600}
                    height={400}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Artisans Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          {creators.length > 0 ? (
            <>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
                Artisans in This Collection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {creators.map((creator, index) => (
                  <div key={creator.id} className="aspect-[4/5]">
                    <CreatorCard
                      creator={creator}
                      index={index}
                      variant="expanded"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-[#F5F0E8] dark:bg-[rgba(245,240,232,0.08)] rounded-xl border border-[rgba(160,97,58,0.1)] dark:border-[rgba(245,240,232,0.1)]">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                No Artisans Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                This collection is being curated. Check back soon!
              </p>
              <Link to="/browse">
                <Button>Browse All Artisans</Button>
              </Link>
            </div>
          )}
        </section>

        <Suspense fallback={<div aria-hidden="true" />}>
          <FooterLazy />
        </Suspense>
      </div>
    </PageLayout>
  );
};

export default CollectionDetail;
