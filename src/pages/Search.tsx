import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { TopSearchBar } from "@/components/TopSearchBar";
import { CreatorCard } from "@/components/CreatorCard";
import { CreatorOverlay } from "@/components/CreatorOverlay";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useArtisans } from "@/hooks/useArtisans";
import { Creator } from "@/types/creator";
import { Helmet } from "react-helmet";
import { SidebarContentWrapper } from "@/components/SidebarContentWrapper";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q") || "";
  const { data: artisans, isLoading } = useArtisans();
  const [filteredArtisans, setFilteredArtisans] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  useEffect(() => {
    if (artisans && searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = artisans
        .filter((artisan: any) => {
          const nameMatch = artisan.full_name?.toLowerCase().includes(query);
          const craftMatch = artisan.craft_tags?.some((tag: string) => 
            tag.toLowerCase().includes(query)
          );
          const locationMatch = artisan.location?.toLowerCase().includes(query);
          return nameMatch || craftMatch || locationMatch;
        })
        .map((artisan: any) => ({
          id: artisan.id,
          name: artisan.full_name || "Anonymous Creator",
          craftType: artisan.craft_tags?.[0] || "Artisan",
          location: artisan.location || "Unknown",
          bio: artisan.bio || "",
          image: artisan.avatar_url || "/placeholder.svg",
          works: [],
          email: artisan.email || "",
          instagram: artisan.instagram || "",
          website: artisan.website || "",
        }));
      setFilteredArtisans(filtered);
    } else if (artisans) {
      setFilteredArtisans([]);
    }
  }, [artisans, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Search Results - Hestia</title>
        <meta 
          name="description" 
          content={`Search results for "${searchQuery}" - Discover local artisans and their crafts`}
        />
      </Helmet>
      
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <TopSearchBar />
        <SidebarContentWrapper>
          <main className="container mx-auto px-4 md:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                Search Results
              </h1>
              {searchQuery && (
                <p className="text-muted-foreground">
                  Showing results for "<span className="text-foreground font-medium">{searchQuery}</span>"
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : !searchQuery ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  Enter a search term to find creators
                </p>
              </div>
            ) : filteredArtisans.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-2">
                  No creators found matching "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Try searching by name, craft type, or location
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Found {filteredArtisans.length} {filteredArtisans.length === 1 ? 'creator' : 'creators'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArtisans.map((creator, index) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      index={index}
                      onClick={() => setSelectedCreator(creator)}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </SidebarContentWrapper>
      </div>

      {selectedCreator && (
        <CreatorOverlay
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      )}
    </>
  );
};

export default Search;
