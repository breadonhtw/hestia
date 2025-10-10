import { useState } from "react";
import { User, Rss, Calendar, Heart, Users, Building2, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import hestiaLogo from "@/assets/hestia-logo.svg";

const navigationItems = [
  { name: "Profile", icon: User, href: "#profile" },
  { name: "Feeds", icon: Rss, href: "#feeds" },
  { name: "Events", icon: Calendar, href: "#events" },
  { name: "Charity", icon: Heart, href: "#charity" },
  { name: "Friends", icon: Users, href: "#friends" },
  { name: "Community", icon: Building2, href: "#community" },
];

const followingUsers = [
  { id: 1, name: "Sarah Chen", avatar: "/placeholder.svg" },
  { id: 2, name: "Marcus Brown", avatar: "/placeholder.svg" },
  { id: 3, name: "Elena Rodriguez", avatar: "/placeholder.svg" },
  { id: 4, name: "James Wilson", avatar: "/placeholder.svg" },
  { id: 5, name: "Aisha Patel", avatar: "/placeholder.svg" },
  { id: 6, name: "David Kim", avatar: "/placeholder.svg" },
];

const contentCards = [
  { id: 1, image: "/placeholder.svg", title: "Ceramic Vase Collection", description: "Hand-thrown pottery with organic glazes" },
  { id: 2, image: "/placeholder.svg", title: "Watercolor Landscapes", description: "Nature-inspired paintings from local trails" },
  { id: 3, image: "/placeholder.svg", title: "Wooden Serving Boards", description: "Handcrafted from reclaimed oak" },
  { id: 4, image: "/placeholder.svg", title: "Textile Wall Hangings", description: "Woven art with natural dyes" },
  { id: 5, image: "/placeholder.svg", title: "Glass Jewelry", description: "Fused glass pendants and earrings" },
  { id: 6, image: "/placeholder.svg", title: "Artisan Bread", description: "Sourdough baked fresh daily" },
];

export default function Profile() {
  const [activeNav, setActiveNav] = useState("Profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border w-64 flex flex-col z-50 transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <img src={hestiaLogo} alt="Hestia" className="h-8" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveNav(item.name);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            })}
          </div>

          {/* Followings Section */}
          <div className="mt-8">
            <h3 className="px-4 text-sm font-semibold text-muted-foreground mb-3">
              Followings
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {followingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-card rounded-lg border border-border"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Top Search Bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="relative max-w-md ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 bg-card"
              />
            </div>
          </div>
        </div>

        {/* Profile Header Section */}
        <div className="relative">
          {/* Banner Image */}
          <div className="h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />

          {/* Profile Details */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-16 sm:-mt-20 pb-8 border-b border-border">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                {/* Avatar */}
                <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-border">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-3xl">FM</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">Fredy Mercury</h1>
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex gap-6 mb-3 text-sm">
                    <div>
                      <span className="font-semibold text-foreground">1.25k</span>{" "}
                      <span className="text-muted-foreground">Followers</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">455</span>{" "}
                      <span className="text-muted-foreground">Following</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground max-w-2xl">
                    Artisan creator specializing in handcrafted ceramics and pottery. 
                    Inspired by nature and traditional techniques, bringing beauty to everyday objects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs and Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="creations" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="creations">Creations</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <div className="text-center py-12 text-muted-foreground">
                No events to display
              </div>
            </TabsContent>

            <TabsContent value="creations">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentCards.map((card) => (
                  <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted" style={{ backgroundImage: `url(${card.image})`, backgroundSize: 'cover' }} />
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="donations">
              <div className="text-center py-12 text-muted-foreground">
                No donations to display
              </div>
            </TabsContent>

            <TabsContent value="followers">
              <div className="text-center py-12 text-muted-foreground">
                No followers to display
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
