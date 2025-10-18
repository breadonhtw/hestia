import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import { PageLayout } from "@/components/PageLayout";
const FooterLazy = lazy(() =>
  import("@/components/Footer").then((m) => ({ default: m.Footer }))
);
import { OptimizedImage } from "@/components/OptimizedImage";
import { usePublications } from "@/hooks/usePublications";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagazineModal } from "@/components/MagazineModal";

const Publications = () => {
  const { data: publicationsData, isLoading } = usePublications();
  const currentPublication = publicationsData?.[0];
  const pastPublications = publicationsData?.slice(1);

  return (
    <PageLayout>
      <div className="w-full max-w-[1920px]">
        <Helmet>
          <title>This Week at Hestia – Magazine Archive | Hestia</title>
          <meta
            name="description"
            content="Explore our weekly magazine featuring themed content about artisans and makers in Singapore."
          />
          <link rel="canonical" href={`https://www.hestia.sg/publications`} />
          <meta property="og:title" content="This Week at Hestia – Magazine Archive | Hestia" />
          <meta
            property="og:description"
            content="Discover weekly themed magazines celebrating artisans and makers."
          />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="https://www.hestia.sg/og-image.jpg" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "This Week at Hestia – Magazine Archive",
              url: "https://www.hestia.sg/publications",
              description: "Weekly magazine archive celebrating artisans and makers",
              mainEntity: {
                "@type": "Collection",
                name: "Hestia Magazine Archive",
              },
            })}
          </script>
        </Helmet>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/20 to-secondary/20 py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                This Week at Hestia
              </h1>
              <p className="text-lg text-muted-foreground">
                Weekly magazine celebrating artisans, makers, and creative community.
              </p>
            </div>
          </div>
        </section>

        {/* Current Week's Magazine */}
        {currentPublication && (
          <section className="container mx-auto px-4 lg:px-8 py-16 border-b border-border">
            <div className="text-center mb-8">
              <div className="inline-block mb-4">
                <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full">
                  Current Issue #{currentPublication.issue_number || 1}
                </span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                Featured This Week
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <MagazineModal publication={currentPublication}>
                <article className="bg-card rounded-2xl overflow-hidden shadow-lift border border-border hover:shadow-glow transition-all duration-300 group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                    {currentPublication.cover_image_url ? (
                      <OptimizedImage
                        src={currentPublication.cover_image_url}
                        alt={currentPublication.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        width={800}
                        height={500}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="h-24 w-24 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    {currentPublication.theme && (
                      <p className="text-xl text-secondary mb-2 font-medium">
                        {currentPublication.theme}
                      </p>
                    )}
                    <h3 className="font-serif text-3xl font-bold text-foreground mb-4">
                      {currentPublication.title}
                    </h3>
                    {currentPublication.description && (
                      <p className="text-muted-foreground mb-6 text-lg">
                        {currentPublication.description}
                      </p>
                    )}
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                    >
                      Read Magazine →
                    </Button>
                  </div>
                </article>
              </MagazineModal>
            </div>
          </section>
        )}

        {/* Past Issues Archive */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
              Past Issues
            </h2>
            <p className="text-muted-foreground">
              Explore our archive of past weekly magazines
            </p>
          </div>

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
          ) : pastPublications && pastPublications.length > 0 ? (
            <>
              <div className="mb-8">
                <p className="text-[#5A6F6B] dark:text-[#C4B5A5]">
                  <span className="font-medium text-[#2A5A54] dark:text-[#E8DFD3]">
                    {pastPublications.length}
                  </span>{" "}
                  past {pastPublications.length === 1 ? "issue" : "issues"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pastPublications.map((publication) => (
                  <MagazineModal key={publication.id} publication={publication}>
                    <article className="group block h-full bg-[#F5F0E8] dark:bg-[rgba(245,240,232,0.08)] rounded-xl overflow-hidden border border-[rgba(160,97,58,0.1)] dark:border-[rgba(245,240,232,0.1)] shadow-soft hover:shadow-lift transition-all duration-300">
                      {/* Cover Image */}
                      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                        {publication.cover_image_url ? (
                          <OptimizedImage
                            src={publication.cover_image_url}
                            alt={publication.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            width={400}
                            height={225}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="h-16 w-16 text-primary/30" />
                          </div>
                        )}
                        {publication.issue_number && (
                          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            Issue #{publication.issue_number}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {publication.theme && (
                          <p className="text-sm text-secondary font-medium mb-2">
                            {publication.theme}
                          </p>
                        )}
                        <h2 className="font-serif text-2xl font-bold text-[#1F4742] dark:text-[#F5F0E8] mb-3 group-hover:text-primary dark:group-hover:text-[#D4AF7A] transition-colors">
                          {publication.title}
                        </h2>

                        {publication.description && (
                          <p className="text-[#2A5A54] dark:text-[#E8DFD3] mb-4 line-clamp-2">
                            {publication.description}
                          </p>
                        )}

                        {publication.active_from && (
                          <div className="text-sm text-[#5A6F6B] dark:text-[#C4B5A5]">
                            {new Date(publication.active_from).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </div>
                    </article>
                  </MagazineModal>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                No Past Issues Yet
              </h3>
              <p className="text-muted-foreground">
                Check back soon for our archive of weekly magazines.
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

export default Publications;
