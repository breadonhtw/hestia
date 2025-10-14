import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, Flame, Sun, Moon, Heart, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import hestiaLogo from "@/assets/hestia-logo.svg";
import { useFavorites } from "@/hooks/useFavorites";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("hestia-theme");
    if (stored) return stored === "dark";
    return document.documentElement.classList.contains("dark");
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { favoritesCount } = useFavorites();
  const { user } = useAuth();
  const isProfilePage = location.pathname === "/profile";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    document.documentElement.classList.toggle("dark");
    setIsDark(newTheme);
    localStorage.setItem("hestia-theme", newTheme ? "dark" : "light");
  };

  const menuItems = [
    { label: "About Hestia", path: "/about" },
    { label: "Browse Creators", path: "/browse" },
    { label: "Contact Us", path: "/contact" },
    { label: "Sign In", path: "/auth" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-soft"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={hestiaLogo}
              alt="Hestia"
              className={`transition-all duration-300 ${
                isScrolled ? "h-10" : "h-12"
              }`}
            />
          </Link>

          {/* Search Bar - Desktop */}
          {!isProfilePage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search creators, crafts, locations..."
                  className="pl-10 bg-card border-border focus:border-primary focus:ring-primary rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Favorites */}
            <Link
              to="/profile?tab=favorites"
              className="relative"
              aria-label="Favorites"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10 relative"
                aria-label="My Favorites"
              >
                <Heart className="h-5 w-5 text-primary" />{" "}
                {/* ✅ Larger icon */}
                {favoritesCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                    {favoritesCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Profile Icon */}
            <Link
              to={user ? "/profile" : "/auth"}
              aria-label={user ? "Profile" : "Sign in"}
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10"
                aria-label="Profile"
              >
                <User className="h-5 w-5 text-primary" />
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-primary/10"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-primary transition-all duration-300" />
              ) : (
                <Moon className="h-5 w-5 text-primary transition-all duration-300" />
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-primary/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background border-border">
                <nav className="flex flex-col gap-6 mt-8">
                  {/* Mobile Search */}
                  {!isProfilePage && (
                    <div className="md:hidden relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-10 bg-card border-border rounded-xl"
                      />
                    </div>
                  )}

                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
