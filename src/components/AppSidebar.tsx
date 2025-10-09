import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Home, Users, LogOut, User } from "lucide-react";
import { SidebarAceternity, SidebarBody, SidebarLink } from "@/components/ui/sidebar-aceternity";
import hestiaLogo from "@/assets/hestia-logo.svg";
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
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('hestia-theme');
    if (stored) return stored === 'dark';
    return document.documentElement.classList.contains('dark');
  });
  const location = useLocation();

  const toggleTheme = () => {
    const newTheme = !isDark;
    document.documentElement.classList.toggle("dark");
    setIsDark(newTheme);
    localStorage.setItem('hestia-theme', newTheme ? 'dark' : 'light');
  };

  const menuItems = [
    { label: "Home", path: "/", icon: <Home className="h-5 w-5 text-foreground" /> },
    { label: "Browse Creators", path: "/browse", icon: <Users className="h-5 w-5 text-foreground" /> },
    { label: "Logout", path: "/", icon: <LogOut className="h-5 w-5 text-foreground" /> },
  ];

  return (
    <SidebarAceternity open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 fixed">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col gap-2">
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

        {/* Bottom Section */}
        <div className="space-y-2">
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

          {/* Profile */}
          <Link to="/profile">
            <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              {open && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-foreground text-sm font-medium truncate">Guest User</span>
                  <span className="text-muted-foreground text-xs truncate">View Profile</span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </SidebarBody>
    </SidebarAceternity>
  );
};
