import { useEffect } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Search, Loader2, User, UserCircle, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Redirect to account settings by default if on /settings
  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/account", { replace: true });
    }
  }, [location.pathname, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isArtisan = role === "artisan";
  const currentPath = location.pathname;

  const sidebarItems = [
    {
      id: "account",
      label: "Your account",
      path: "/settings/account",
      icon: User,
      description:
        "See information about your account, download an archive of your data, or learn about your account deactivation options",
    },
    ...(isArtisan
      ? [
          {
            id: "profile",
            label: "Profile",
            path: "/settings/profile",
            icon: UserCircle,
            description: "Edit your profile information and gallery",
          },
          {
            id: "analytics",
            label: "Analytics",
            path: "/settings/analytics",
            icon: BarChart3,
            description: "Track your profile performance and engagement metrics",
          },
        ]
      : [
          {
            id: "become-artisan",
            label: "Become an Artisan",
            path: "/settings/become-artisan",
            icon: Sparkles,
            description: "Share your craft with the Hestia community",
            highlight: true,
          },
        ]),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>

                {/* Search Settings */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search Settings"
                    className="pl-10 bg-card border-border rounded-xl"
                  />
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    const isHighlight = (item as any).highlight;

                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={cn(
                          "block px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : isHighlight
                            ? "bg-primary/5 border border-primary/20 text-foreground hover:bg-primary/10"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("h-5 w-5", isHighlight && "text-primary")} />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Settings;
