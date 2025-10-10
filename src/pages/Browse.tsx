import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Footer } from "@/components/Footer";
import { CreatorCard } from "@/components/CreatorCard";
import { CreatorOverlay } from "@/components/CreatorOverlay";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { creators } from "@/data/creators";
import { Creator } from "@/types/creator";
import { Filter } from "lucide-react";
const Browse = () => {
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [acceptingOrders, setAcceptingOrders] = useState(false);
  const [openForCommissions, setOpenForCommissions] = useState(false);
  const [justBrowsing, setJustBrowsing] = useState(false);
  const [newlyJoined, setNewlyJoined] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const craftTypes = [
    "Pottery & Ceramics",
    "Textiles & Fiber Arts",
    "Woodworking",
    "Baked Goods & Preserves",
    "Jewelry & Accessories",
    "Art & Illustration",
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
    setSelectedCrafts((prev) =>
      prev.includes(craft) ? prev.filter((c) => c !== craft) : [...prev, craft]
    );
  };
  const clearFilters = () => {
    setSelectedCrafts([]);
    setSelectedLocation("all");
    setAcceptingOrders(false);
    setOpenForCommissions(false);
    setJustBrowsing(false);
    setNewlyJoined(false);
  };

  // Filter creators
  const filteredCreators = creators.filter((creator) => {
    const craftMatch =
      selectedCrafts.length === 0 || selectedCrafts.includes(creator.craftType);
    const locationMatch =
      selectedLocation === "all" || creator.location === selectedLocation;
    return craftMatch && locationMatch;
  });
  return (
    <PageLayout>
      <div className="w-full max-w-[1920px]">
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
                          checked={selectedCrafts.includes(craft)}
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
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
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
                        checked={acceptingOrders}
                        onCheckedChange={setAcceptingOrders}
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
                        checked={openForCommissions}
                        onCheckedChange={setOpenForCommissions}
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
                      checked={newlyJoined}
                      onCheckedChange={setNewlyJoined}
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
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Apply Filters
                </Button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
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
              {filteredCreators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCreators.map((creator, index) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      index={index}
                      onClick={() => setSelectedCreator(creator)}
                      isPlaceholder={selectedCreator?.id === creator.id}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground mb-4">
                    No creators found matching your filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                  >
                    Clear Filters
                  </Button>
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

        <Footer />
      </div>
    </PageLayout>
  );
};
export default Browse;
