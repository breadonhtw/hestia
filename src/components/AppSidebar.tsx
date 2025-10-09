import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Sun, Moon, Heart, Home, Info, Users, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarAceternity, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar-aceternity";
import hestiaLogo from "@/assets/hestia-logo.svg";
import { useFavorites } from "@/hooks/useFavorites";
import { motion } from "framer-motion";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 group py-2">
      <img src={hestiaLogo} alt="Hestia" className="h-10 w-10" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-serif text-xl font-bold text-foreground whitespace-pre"
      >
        Hestia
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link to="/" className="flex items-center py-2">
      <img src={hestiaLogo} alt="Hestia" className="h-10 w-10" />
    </Link>
  );
};

export const AppSidebar = () => {
  const [open, setOpen] = useState(false); // Collapsed by default
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('hestia-theme');
    if (stored) return stored === 'dark';
    return document.documentElement.classList.contains('dark');
  });
  const location = useLocation();
  const { favoritesCount } = useFavorites();

  const toggleTheme = () => {
    const newTheme = !isDark;
    document.documentElement.classList.toggle("dark");
    setIsDark(newTheme);
    localStorage.setItem('hestia-theme', newTheme ? 'dark' : 'light');
  };

  const menuItems = [
    { label: "Home", path: "/", icon: <Home className="h-5 w-5 text-foreground" /> },
    { label: "About Hestia", path: "/about", icon: <Info className="h-5 w-5 text-foreground" /> },
    { label: "Browse Creators", path: "/browse", icon: <Users className="h-5 w-5 text-foreground" /> },
    { label: "Join as Creator", path: "/join", icon: <Sparkles className="h-5 w-5 text-foreground" /> },
    { label: "Contact Us", path: "/contact", icon: <Mail className="h-5 w-5 text-foreground" /> },
  ];

  return (
    <SidebarAceternity open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 fixed">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          
          {/* Search - Collapsed to icon when closed */}
          <div className="mt-8 mb-4">
            {open ? (
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search creators..."
                  className="pl-10 bg-card border-border focus:border-primary focus:ring-primary rounded-xl"
                />
              </div>
            ) : (
              <button className="w-full flex items-center justify-center p-2 hover:bg-muted rounded-lg transition-colors">
                <Search className="h-5 w-5 text-foreground" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            {menuItems.map((item, idx) => (
              <SidebarLink
                key={idx}
                link={{
                  label: item.label,
                  href: item.path,
                  icon: item.icon,
                }}
                className={location.pathname === item.path ? "bg-primary/10" : "hover:bg-muted/50"}
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2">
          {/* Favorites */}
          <Link to="/browse">
            <div className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-muted/50 cursor-pointer">
              <div className="relative">
                <Heart className="h-5 w-5 text-primary" />
                {favoritesCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                    {favoritesCount}
                  </Badge>
                )}
              </div>
              {open && <span className="text-foreground text-sm">Favorites</span>}
            </div>
          </Link>

          {/* Theme Toggle */}
          <div
            onClick={toggleTheme}
            className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-muted/50 cursor-pointer"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
            {open && <span className="text-foreground text-sm">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </div>
        </div>
      </SidebarBody>
    </SidebarAceternity>
  );
};
