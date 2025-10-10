import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Rss, Calendar, Heart, Users, Building2, Search, Menu, BadgeCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Profile", icon: User, path: "/profile", active: true },
  { name: "Feeds", icon: Rss, path: "/feeds" },
  { name: "Events", icon: Calendar, path: "/events" },
  { name: "Charity", icon: Heart, path: "/charity" },
  { name: "Friends", icon: Users, path: "/friends" },
  { name: "Community", icon: Building2, path: "/community" }
];

const followingUsers = [
  { id: 1, name: "Emma Watson", avatar: "/placeholder.svg", initials: "EW" },
  { id: 2, name: "John Smith", avatar: "/placeholder.svg", initials: "JS" },
  { id: 3, name: "Sarah Lee", avatar: "/placeholder.svg", initials: "SL" },
  { id: 4, name: "Mike Chen", avatar: "/placeholder.svg", initials: "MC" },
  { id: 5, name: "Lisa Park", avatar: "/placeholder.svg", initials: "LP" },
  { id: 6, name: "David Kim", avatar: "/placeholder.svg", initials: "DK" }
];

const contentItems = [
  { id: 1, title: "Ceramic Vase Collection", description: "Handcrafted pottery with natural glazes", image: "/placeholder.svg" },
  { id: 2, title: "Wooden Sculpture", description: "Carved from reclaimed oak wood", image: "/placeholder.svg" },
  { id: 3, title: "Handwoven Textile", description: "Traditional weaving techniques", image: "/placeholder.svg" },
  { id: 4, title: "Artisan Jewelry", description: "Sterling silver with turquoise stones", image: "/placeholder.svg" },
  { id: 5, title: "Glass Art Piece", description: "Blown glass with vibrant colors", image: "/placeholder.svg" },
  { id: 6, title: "Leather Goods", description: "Hand-stitched leather accessories", image: "/placeholder.svg" },
  { id: 7, title: "Botanical Prints", description: "Original watercolor paintings", image: "/placeholder.svg" },
  { id: 8, title: "Candle Making", description: "Natural soy wax candles", image: "/placeholder.svg" },
  { id: 9, title: "Macramé Wall Art", description: "Intricate knot work designs", image: "/placeholder.svg" }
];

const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
  <div className="flex flex-col h-full">
    {/* Logo Section */}
    <div className="p-6 flex items-center justify-between">
      <Link to="/" className="flex items-center">
        <img src="/src/assets/hestia-logo-light.svg" alt="Hestia" className="h-8 dark:hidden" />
        <img src="/src/assets/hestia-logo-dark.svg" alt="Hestia" className="h-8 hidden dark:block" />
      </Link>
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>

    {/* Navigation Links */}
    <nav className="px-3 space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
              item.active
                ? "bg-primary/10 text-primary border-l-4 border-primary pl-[10px]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>

    {/* Followings Section */}
    <div className="mt-6 px-6 flex-1 overflow-hidden flex flex-col">
      <div className="border-t border-border pt-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Following
        </h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {followingUsers.map((user) => (
            <Link
              key={user.id}
              to="#"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground">{user.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Profile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("creations");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Hamburger Toggle */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] bg-card">
          <SidebarContent onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[280px] bg-card border-r border-border overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[280px]">
        {/* Top Search Bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="p-4 max-w-7xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts, creations..."
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
          </div>
        </div>

        {/* Profile Header Section */}
        <div className="max-w-7xl mx-auto">
          {/* Banner Image */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 relative">
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-30" />
          </div>

          {/* Profile Details */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-20 pb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
                {/* Avatar */}
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
                  <AvatarImage src="/placeholder.svg" alt="Fredy Mercury" />
                  <AvatarFallback className="text-4xl font-serif">FM</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 sm:pt-16">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                      Fredy Mercury
                    </h1>
                    <BadgeCheck className="w-6 h-6 text-primary" />
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mb-3">
                    <button className="hover:text-primary transition-colors">
                      <span className="font-bold text-foreground">1.25k</span>{" "}
                      <span className="text-muted-foreground">Followers</span>
                    </button>
                    <button className="hover:text-primary transition-colors">
                      <span className="font-bold text-foreground">455</span>{" "}
                      <span className="text-muted-foreground">Following</span>
                    </button>
                  </div>

                  {/* Bio */}
                  <p className="text-muted-foreground max-w-2xl">
                    Passionate artisan and creator. Bringing handcrafted beauty to life, one piece at a time. Based in Portland, OR 🌲
                  </p>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="creations">Creations</TabsTrigger>
                <TabsTrigger value="donations">Donations</TabsTrigger>
                <TabsTrigger value="followers">Followers</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {contentItems.slice(0, 6).map((item) => (
                    <Card key={item.id} className="overflow-hidden hover-scale">
                      <CardContent className="p-0">
                        <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 relative">
                          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-50" />
                        </div>
                        <div className="p-4">
                          <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="creations" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {contentItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover-scale">
                      <CardContent className="p-0">
                        <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 relative">
                          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-50" />
                        </div>
                        <div className="p-4">
                          <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="donations" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {contentItems.slice(0, 3).map((item) => (
                    <Card key={item.id} className="overflow-hidden hover-scale">
                      <CardContent className="p-0">
                        <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 relative">
                          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-50" />
                        </div>
                        <div className="p-4">
                          <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="followers" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                  {followingUsers.map((user) => (
                    <Card key={user.id} className="hover-scale">
                      <CardContent className="p-6 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-base">{user.name}</CardTitle>
                          <CardDescription className="text-sm">Artisan</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">Follow</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
