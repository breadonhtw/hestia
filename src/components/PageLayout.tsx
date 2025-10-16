import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/ui/tubelight-navbar";
import {
  Home,
  Users,
  Info,
  Mail,
  Sun,
  Moon,
  User,
  LogOut,
  Images,
  LayoutDashboard,
  Heart,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import FloatingActionMenu from "@/components/ui/floating-action-menu";

interface PageLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Home", url: "/", icon: Home },
  { name: "Browse", url: "/browse", icon: Users },
  { name: "About", url: "/about", icon: Info },
  { name: "Contact", url: "/contact", icon: Mail },
];

export const PageLayout = ({ children }: PageLayoutProps) => {
  const { user, signOut } = useAuth();
  const { isArtisan } = useUserRole();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("hestia-theme");
    if (stored) return stored === "dark";
    return document.documentElement.classList.contains("dark");
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    document.documentElement.classList.toggle("dark");
    setIsDark(newTheme);
    localStorage.setItem("hestia-theme", newTheme ? "dark" : "light");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Menu options based on user status
  const getMenuOptions = () => {
    if (!user) {
      // Guest users - only login option
      return [
        {
          label: "Log In",
          Icon: <LogIn className="w-4 h-4" />,
          onClick: () => navigate("/auth"),
        },
      ];
    } else if (isArtisan) {
      // Artisan users - full options
      return [
        {
          label: "Profile",
          Icon: <User className="w-4 h-4" />,
          onClick: () => navigate("/profile"),
        },
        {
          label: "Favorites",
          Icon: <Heart className="w-4 h-4" />,
          onClick: () => navigate("/profile?tab=favorites"),
        },
        {
          label: "My Gallery",
          Icon: <Images className="w-4 h-4" />,
          onClick: () => navigate("/profile?tab=gallery"),
        },
        {
          label: "Artisan Dashboard",
          Icon: <LayoutDashboard className="w-4 h-4" />,
          onClick: () => navigate("/become-artisan"),
        },
        {
          label: "Logout",
          Icon: <LogOut className="w-4 h-4" />,
          onClick: handleLogout,
        },
      ];
    } else {
      // Regular users - basic options
      return [
        {
          label: "Profile",
          Icon: <User className="w-4 h-4" />,
          onClick: () => navigate("/profile"),
        },
        {
          label: "Favorites",
          Icon: <Heart className="w-4 h-4" />,
          onClick: () => navigate("/profile?tab=favorites"),
        },
        {
          label: "Logout",
          Icon: <LogOut className="w-4 h-4" />,
          onClick: handleLogout,
        },
      ];
    }
  };

  const menuOptions = getMenuOptions();

  return (
    <div className="min-h-screen w-full bg-background">
      <NavBar items={navItems} />

      {/* Floating Action Menu - Available to all users */}
      <div className="fixed top-4 right-16 sm:top-6 sm:right-20 z-[60]">
        <FloatingActionMenu
          options={menuOptions}
          className="relative"
          isFixed={true}
        />
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] w-10 h-10 rounded-full bg-background/80 backdrop-blur-lg border border-border shadow-lg flex items-center justify-center hover:bg-primary/10 transition-all hover:scale-110"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-primary" />
        ) : (
          <Moon className="h-5 w-5 text-primary" />
        )}
      </button>

      <main className="relative z-0 pt-0 pb-20">{children}</main>
    </div>
  );
};
