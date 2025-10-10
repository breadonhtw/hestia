import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, Users, Info, User, Mail, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen w-full bg-background">
      <NavBar items={navItems} />

      {/* Profile Icon */}
      <Link to={user ? "/profile" : "/auth"} className="fixed top-6 right-20 z-[60]">
        <button
          className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-lg border border-border shadow-lg flex items-center justify-center hover:bg-primary/10 transition-all hover:scale-110"
          aria-label="Profile"
        >
          <User className="h-5 w-5 text-primary" />
        </button>
      </Link>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-[60] w-10 h-10 rounded-full bg-background/80 backdrop-blur-lg border border-border shadow-lg flex items-center justify-center hover:bg-primary/10 transition-all hover:scale-110"
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
