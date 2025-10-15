import { useState, useEffect, lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
const FooterLazy = lazy(() =>
  import("@/components/Footer").then((m) => ({ default: m.Footer }))
);
import { CreatorCard } from "@/components/CreatorCard";
import { CreatorOverlay } from "@/components/CreatorOverlay";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SkeletonCard } from "@/components/SkeletonCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useArtisans } from "@/hooks/useArtisans";
import { Creator } from "@/types/creator";
import { Filter } from "lucide-react";
const Browse = () => {
  const { data: artisansData, isLoading } = useArtisans();
  const [gridVisible, setGridVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById("browse-grid");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGridVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [searchParams] = useSearchParams();

  // Pending filters (what user is selecting)
  const [pendingCrafts, setPendingCrafts] = useState<string[]>([]);
  const [pendingLocation, setPendingLocation] = useState<string>("all");
  const [pendingAcceptingOrders, setPendingAcceptingOrders] = useState(false);
  const [pendingOpenForCommissions, setPendingOpenForCommissions] =
    useState(false);
  const [pendingNewlyJoined, setPendingNewlyJoined] = useState(false);

  // Applied filters (actually used for filtering)
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [acceptingOrders, setAcceptingOrders] = useState(false);
  const [openForCommissions, setOpenForCommissions] = useState(false);
  const [newlyJoined, setNewlyJoined] = useState(false);

  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  // Initialize from URL params on mount
  useEffect(() => {
    const craftParam = searchParams.get("craft");
    if (craftParam) {
      setPendingCrafts([craftParam]);
      setSelectedCrafts([craftParam]);
    }
  }, [searchParams]);

  // Transform artisan data to Creator format (include created_at for "New" badge)
  const creators: Creator[] =
    artisansData?.map(
      (artisan) =>
        ({
          id: artisan.id,
          name: artisan.username || artisan.full_name || "Artisan",
          craftType: artisan.craft_type,
          location: artisan.location,
          bio: artisan.bio || "",
          image: artisan.avatar_url || "",
          works: [],
          featured: artisan.featured,
          story: undefined,
          website: artisan.website || undefined,
          instagram: artisan.instagram || undefined,
          created_at: artisan.created_at,
        } as any)
    ) || [];
  const craftTypes = [
    "Pottery & Ceramics",
    "Textiles & Fiber Arts",
    "Woodworking",
    "Baked Goods",
    "Jewelry",
    "Art & Illustration",
    "Plants & Florals",
    "Home Decor",
  ];
  const locations = [
    "All Locations",
    "Downtown District",
    "Riverside",
    "Westside",
    "East Village",
    "Arts District",
    "North End",
  ];
  const handleCraftToggle = (craft: string) => {
    setPendingCrafts((prev) =>
      prev.includes(craft) ? prev.filter((c) => c !== craft) : [...prev, craft]
    );
  };

  const applyFilters = () => {
    setSelectedCrafts(pendingCrafts);
    setSelectedLocation(pendingLocation);
    setAcceptingOrders(pendingAcceptingOrders);
    setOpenForCommissions(pendingOpenForCommissions);
    setNewlyJoined(pendingNewlyJoined);
  };

  const clearFilters = () => {
    setPendingCrafts([]);
    setPendingLocation("all");
    setPendingAcceptingOrders(false);
    setPendingOpenForCommissions(false);
    setPendingNewlyJoined(false);
    setSelectedCrafts([]);
    setSelectedLocation("all");
    setAcceptingOrders(false);
    setOpenForCommissions(false);
    setNewlyJoined(false);
  };

  // Filter creators
  const filteredCreators = creators.filter((creator) => {
    const craftMatch =
      selectedCrafts.length === 0 || selectedCrafts.includes(creator.craftType);
    const locationMatch =
      selectedLocation === "all" ||
      creator.location.toLowerCase().includes(selectedLocation.toLowerCase());

    // Availability filters - only if data exists
    const artisan = artisansData?.find((a) => a.id === creator.id);
    const acceptingOrdersMatch = !acceptingOrders || artisan?.accepting_orders;
    const openForCommissionsMatch =
      !openForCommissions || artisan?.open_for_commissions;

    // Newly joined filter (within last 30 days)
    const newlyJoinedMatch =
      !newlyJoined ||
      (artisan?.created_at &&
        new Date(artisan.created_at) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return (
      craftMatch &&
      locationMatch &&
      acceptingOrdersMatch &&
      openForCommissionsMatch &&
      newlyJoinedMatch
    );
  });

  // Prefetch profile route on hover/focus intent
  const prefetchCreatorProfile = () => {
    try {
      import("./CreatorProfile");
    } catch {}
  };
  return (
    <PageLayout>
      <div className="w-full max-w-[1920px]">
        <Helmet>
          <title>Browse Artisans | Hestia</title>
          <meta
            name="description"
            content="Discover local artisans by craft and location. Explore pottery, textiles, woodwork, jewelry, and more."
          />
          <link rel="canonical" href={`https://www.hestia.sg/browse`} />
        </Helmet>
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="filter-sidebar relative bg-[#F5F0E8] dark:bg-[rgba(245,240,232,0.08)] rounded-xl p-6 shadow-soft sticky top-24 border border-[rgba(160,97,58,0.1)] dark:border-[rgba(245,240,232,0.1)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-semibold text-[#1F4742] dark:text-[#F5F0E8]">
                    Refine Your Search
                  </h2>
                </div>

                {/* Craft Type Filters */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-[#2A5A54] dark:text-[#E8DFD3]">
                    Craft Type
                  </h3>
                  <div className="space-y-3">
                    {craftTypes.map((craft) => (
                      <div key={craft} className="flex items-center space-x-2">
                        <Checkbox
                          id={craft}
                          checked={pendingCrafts.includes(craft)}
                          onCheckedChange={() => handleCraftToggle(craft)}
                          className="focus-terracotta"
                        />
                        <Label
                          htmlFor={craft}
                          className="text-sm cursor-pointer text-[#2A5A54] dark:text-[#E8DFD3]"
                        >
                          {craft}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-[#2A5A54] dark:text-[#E8DFD3]">
                    Location
                  </h3>
                  <Select
                    value={pendingLocation}
                    onValueChange={setPendingLocation}
                  >
                    <SelectTrigger className="w-full bg-background dark:bg-[rgba(245,240,232,0.08)] focus-terracotta">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[rgba(245,240,232,0.08)]">
                      {locations.map((location) => (
                        <SelectItem
                          key={location}
                          value={
                            location === "All Locations" ? "all" : location
                          }
                        >
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability Filters */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-[#2A5A54] dark:text-[#E8DFD3]">
                    Availability
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="accepting-orders"
                        className="text-sm cursor-pointer text-[#2A5A54] dark:text-[#E8DFD3]"
                      >
                        Accepting Orders
                      </Label>
                      <Switch
                        id="accepting-orders"
                        checked={pendingAcceptingOrders}
                        onCheckedChange={setPendingAcceptingOrders}
                        className="focus-terracotta"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="open-commissions"
                        className="text-sm cursor-pointer text-[#2A5A54] dark:text-[#E8DFD3]"
                      >
                        Open for Commissions
                      </Label>
                      <Switch
                        id="open-commissions"
                        checked={pendingOpenForCommissions}
                        onCheckedChange={setPendingOpenForCommissions}
                        className="focus-terracotta"
                      />
                    </div>
                  </div>
                </div>

                {/* Newly Joined Filter */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="newly-joined"
                      className="font-medium cursor-pointer text-[#2A5A54] dark:text-[#E8DFD3]"
                    >
                      Newly Joined
                    </Label>
                    <Switch
                      id="newly-joined"
                      checked={pendingNewlyJoined}
                      onCheckedChange={setPendingNewlyJoined}
                      className="focus-terracotta"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="p-0 h-auto mb-4 underline dark:text-[#D4AF7A]"
                  style={{ color: "#A0613A" }}
                >
                  Clear All Filters
                </Button>

                {/* Apply Filters Button */}
                <Button
                  onClick={applyFilters}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Apply Filters
                </Button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Active Filters Display */}
              {(selectedCrafts.length > 0 ||
                selectedLocation !== "all" ||
                acceptingOrders ||
                openForCommissions ||
                newlyJoined) && (
                <div className="mb-6 p-4 bg-[#F5F0E8] dark:bg-[rgba(245,240,232,0.08)] rounded-lg border border-[rgba(160,97,58,0.2)] dark:border-[rgba(245,240,232,0.1)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-[#2A5A54] dark:text-[#E8DFD3]">
                      Active Filters
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs hover:bg-[rgba(160,97,58,0.1)]"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCrafts.map((craft) => (
                      <div
                        key={craft}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(160,97,58,0.15)] dark:bg-[rgba(212,175,122,0.15)] text-[#A0613A] dark:text-[#D4AF7A] rounded-full text-sm"
                      >
                        <span>{craft}</span>
                        <button
                          onClick={() => {
                            const newCrafts = selectedCrafts.filter(
                              (c) => c !== craft
                            );
                            setSelectedCrafts(newCrafts);
                            setPendingCrafts(newCrafts);
                          }}
                          className="ml-1 hover:bg-[rgba(160,97,58,0.2)] dark:hover:bg-[rgba(212,175,122,0.2)] rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${craft} filter`}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {selectedLocation !== "all" && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(160,97,58,0.15)] dark:bg-[rgba(212,175,122,0.15)] text-[#A0613A] dark:text-[#D4AF7A] rounded-full text-sm">
                        <span>Location: {selectedLocation}</span>
                        <button
                          onClick={() => {
                            setSelectedLocation("all");
                            setPendingLocation("all");
                          }}
                          className="ml-1 hover:bg-[rgba(160,97,58,0.2)] dark:hover:bg-[rgba(212,175,122,0.2)] rounded-full p-0.5 transition-colors"
                          aria-label="Remove location filter"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    {acceptingOrders && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(160,97,58,0.15)] dark:bg-[rgba(212,175,122,0.15)] text-[#A0613A] dark:text-[#D4AF7A] rounded-full text-sm">
                        <span>Accepting Orders</span>
                        <button
                          onClick={() => {
                            setAcceptingOrders(false);
                            setPendingAcceptingOrders(false);
                          }}
                          className="ml-1 hover:bg-[rgba(160,97,58,0.2)] dark:hover:bg-[rgba(212,175,122,0.2)] rounded-full p-0.5 transition-colors"
                          aria-label="Remove accepting orders filter"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    {openForCommissions && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(160,97,58,0.15)] dark:bg-[rgba(212,175,122,0.15)] text-[#A0613A] dark:text-[#D4AF7A] rounded-full text-sm">
                        <span>Open for Commissions</span>
                        <button
                          onClick={() => {
                            setOpenForCommissions(false);
                            setPendingOpenForCommissions(false);
                          }}
                          className="ml-1 hover:bg-[rgba(160,97,58,0.2)] dark:hover:bg-[rgba(212,175,122,0.2)] rounded-full p-0.5 transition-colors"
                          aria-label="Remove open for commissions filter"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    {newlyJoined && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-[rgba(160,97,58,0.15)] dark:bg-[rgba(212,175,122,0.15)] text-[#A0613A] dark:text-[#D4AF7A] rounded-full text-sm">
                        <span>Newly Joined (30 days)</span>
                        <button
                          onClick={() => {
                            setNewlyJoined(false);
                            setPendingNewlyJoined(false);
                          }}
                          className="ml-1 hover:bg-[rgba(160,97,58,0.2)] dark:hover:bg-[rgba(212,175,122,0.2)] rounded-full p-0.5 transition-colors"
                          aria-label="Remove newly joined filter"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <p className="text-[#5A6F6B] dark:text-[#C4B5A5]">
                  <span className="font-medium text-[#2A5A54] dark:text-[#E8DFD3]">
                    {filteredCreators.length}
                  </span>{" "}
                  creators found
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#2A5A54] dark:text-[#E8DFD3]">
                    Sort by:
                  </span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 dark:bg-[rgba(245,240,232,0.08)] focus-terracotta">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[rgba(245,240,232,0.08)]">
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="a-z">A-Z</SelectItem>
                      <SelectItem value="nearby">Nearby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Creator Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredCreators.length > 0 ? (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  id="browse-grid"
                  style={{ contentVisibility: "auto" }}
                >
                  {(gridVisible
                    ? filteredCreators
                    : filteredCreators.slice(0, 6)
                  ).map((creator, index) => (
                    <div
                      key={creator.id}
                      className="aspect-[4/5]"
                      onMouseEnter={prefetchCreatorProfile}
                      onFocus={prefetchCreatorProfile}
                    >
                      <CreatorCard
                        creator={creator}
                        index={index}
                        onClick={() => setSelectedCreator(creator)}
                        isPlaceholder={selectedCreator?.id === creator.id}
                        variant="expanded"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Floating Overlay */}
        {selectedCreator && (
          <CreatorOverlay
            creator={selectedCreator}
            onClose={() => setSelectedCreator(null)}
          />
        )}

        <Suspense fallback={<div aria-hidden="true" />}>
          <FooterLazy />
        </Suspense>
      </div>
    </PageLayout>
  );
};
export default Browse;
