import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreatorCard } from "@/components/CreatorCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { creators } from "@/data/creators";
import { Filter } from "lucide-react";
const Browse = () => {
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [acceptingOrders, setAcceptingOrders] = useState(false);
  const [openForCommissions, setOpenForCommissions] = useState(false);
  const [justBrowsing, setJustBrowsing] = useState(false);
  const [newlyJoined, setNewlyJoined] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const craftTypes = ["Pottery & Ceramics", "Textiles & Fiber Arts", "Woodworking", "Baked Goods & Preserves", "Jewelry & Accessories", "Art & Illustration"];
  const locations = ["All Locations", "Downtown District", "Riverside", "Westside", "East Village", "Arts District", "North End"];
  const handleCraftToggle = (craft: string) => {
    setSelectedCrafts(prev => prev.includes(craft) ? prev.filter(c => c !== craft) : [...prev, craft]);
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
  const filteredCreators = creators.filter(creator => {
    const craftMatch = selectedCrafts.length === 0 || selectedCrafts.includes(creator.craftType);
    const locationMatch = selectedLocation === "all" || creator.location === selectedLocation;
    return craftMatch && locationMatch;
  });
  return <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-[#F5F0E8] rounded-xl p-6 shadow-soft sticky top-24 border border-border/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  Refine Your Search
                </h2>
              </div>

              {/* Craft Type Filters */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Craft Type</h3>
                <div className="space-y-3">
                  {craftTypes.map(craft => <div key={craft} className="flex items-center space-x-2">
                      <Checkbox id={craft} checked={selectedCrafts.includes(craft)} onCheckedChange={() => handleCraftToggle(craft)} />
                      <Label htmlFor={craft} className="text-sm cursor-pointer">
                        {craft}
                      </Label>
                    </div>)}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Location</h3>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => <SelectItem key={location} value={location === "All Locations" ? "all" : location}>
                        {location}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Filters */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="accepting-orders" className="text-sm cursor-pointer">
                      Accepting Orders
                    </Label>
                    <Switch id="accepting-orders" checked={acceptingOrders} onCheckedChange={setAcceptingOrders} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="open-commissions" className="text-sm cursor-pointer">
                      Open for Commissions
                    </Label>
                    <Switch id="open-commissions" checked={openForCommissions} onCheckedChange={setOpenForCommissions} />
                  </div>
                  
                </div>
              </div>

              {/* Newly Joined Filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newly-joined" className="font-medium cursor-pointer">
                    Newly Joined
                  </Label>
                  <Switch id="newly-joined" checked={newlyJoined} onCheckedChange={setNewlyJoined} />
                </div>
              </div>

              {/* Clear Filters */}
              <Button variant="link" onClick={clearFilters} className="text-secondary p-0 h-auto mb-4 underline">
                Clear All Filters
              </Button>

              {/* Apply Filters Button */}
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {filteredCreators.length}
                </span>{" "}
                creators found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="a-z">A-Z</SelectItem>
                    <SelectItem value="nearby">Nearby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Creator Grid */}
            {filteredCreators.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCreators.map((creator, index) => <CreatorCard key={creator.id} creator={creator} index={index} isExpanded={expandedCard === creator.id} onToggleExpand={() => setExpandedCard(expandedCard === creator.id ? null : creator.id)} />)}
              </div> : <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">
                  No creators found matching your filters
                </p>
                <Button variant="outline" onClick={clearFilters} className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                  Clear Filters
                </Button>
              </div>}
          </main>
        </div>
      </div>

      <Footer />
    </div>;
};
export default Browse;