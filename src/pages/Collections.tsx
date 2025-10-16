import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PageLayout } from "@/components/PageLayout";
const FooterLazy = lazy(() =>
  import("@/components/Footer").then((m) => ({ default: m.Footer }))
);
import { OptimizedImage } from "@/components/OptimizedImage";
import { useCollections } from "@/hooks/useCollections";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

const Collections = () => {
  const { data: collections, isLoading } = useCollections();

  return (
    <PageLayout>
      <div className="w-full max-w-[1920px]">
        <Helmet>
          <title>Curated Collections | Hestia</title>
          <meta
            name="description"
            content="Explore curated collections of artisans. Discover themed groups of talented craftspeople in Singapore."
          />
          <link rel="canonical" href={`https://www.hestia.sg/collections`} />
        </Helmet>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/20 to-secondary/20 py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Curated Collections
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover handpicked groups of artisans organized by theme, occasion, and specialty.
              </p>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : collections && collections.length > 0 ? (
            <>
              <div className="mb-8">
                <p className="text-[#5A6F6B] dark:text-[#C4B5A5]">
                  <span className="font-medium text-[#2A5A54] dark:text-[#E8DFD3]">
                    {collections.length}
                  </span>{" "}
                  collections available
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    to={`/collections/${collection.slug}`}
                    className="group block"
                  >
                    <article className="h-full bg-[#F5F0E8] dark:bg-[rgba(245,240,232,0.08)] rounded-xl overflow-hidden border border-[rgba(160,97,58,0.1)] dark:border-[rgba(245,240,232,0.1)] shadow-soft hover:shadow-lift transition-all duration-300">
                      {/* Cover Image */}
                      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                        {collection.cover_image_url ? (
                          <OptimizedImage
                            src={collection.cover_image_url}
                            alt={collection.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            width={400}
                            height={225}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-16 w-16 text-primary/30" />
                          </div>
                        )}
                        {collection.is_featured && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                            <span>★</span>
                            <span>Featured</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="font-serif text-2xl font-bold text-[#1F4742] dark:text-[#F5F0E8] mb-3 group-hover:text-primary dark:group-hover:text-[#D4AF7A] transition-colors">
                          {collection.title}
                        </h2>

                        {collection.description && (
                          <p className="text-[#2A5A54] dark:text-[#E8DFD3] mb-4 line-clamp-2">
                            {collection.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-[#5A6F6B] dark:text-[#C4B5A5]">
                          <Users className="h-4 w-4" />
                          <span>
                            {collection.artisan_count}{" "}
                            {collection.artisan_count === 1 ? "artisan" : "artisans"}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                No Collections Yet
              </h3>
              <p className="text-muted-foreground">
                Check back soon for curated collections of artisans.
              </p>
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

export default Collections;
