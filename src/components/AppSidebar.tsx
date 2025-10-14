import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Home, Users, LogOut, User } from "lucide-react";
import {
  SidebarAceternity,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar-aceternity";
import hestiaLogo from "@/assets/hestia-logo.svg";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 group py-2">
      <img
        src={hestiaLogo}
        alt="Hestia"
        className="h-10 w-10"
        loading="lazy"
        decoding="async"
        width={40}
        height={40}
      />
      <span className="font-serif text-xl font-bold text-foreground whitespace-pre animate-fade-in-up">
        Hestia
      </span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link to="/" className="flex items-center py-2">
      <img
        src={hestiaLogo}
        alt="Hestia"
        className="h-10 w-10"
        loading="lazy"
        decoding="async"
        width={40}
        height={40}
      />
    </Link>
  );
};

export const AppSidebar = () => {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("hestia-theme");
    if (stored) return stored === "dark";
    return document.documentElement.classList.contains("dark");
  });
  const location = useLocation();

  const toggleTheme = () => {
    const newTheme = !isDark;
    document.documentElement.classList.toggle("dark");
    setIsDark(newTheme);
    localStorage.setItem("hestia-theme", newTheme ? "dark" : "light");
  };

  const menuItems = [
    { label: "Home", path: "/", Icon: Home },
    { label: "Browse Creators", path: "/browse", Icon: Users },
  ];

  return (
    <SidebarBody className="justify-between gap-10 fixed">
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
        {open ? <Logo /> : <LogoIcon />}

        {/* Navigation Links */}
        <div className="mt-8 flex flex-col gap-2">
          {menuItems.map((item, idx) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            const IconComponent = item.Icon;
            return (
              <SidebarLink
                key={idx}
                link={{
                  label: item.label,
                  href: item.path,
                  icon: (
                    <IconComponent
                      className={`h-5 w-5 transition-colors duration-200 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  ),
                }}
                className={`transition-all duration-200 ${
                  isActive ? "bg-primary/10" : "hover:bg-muted/50"
                }`}
              />
            );
          })}
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
          {open && (
            <span className="text-foreground text-sm">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </div>

        {/* Profile */}
        <Link to="/profile">
          <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            {open && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-foreground text-sm font-medium truncate">
                  Guest User
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  View Profile
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </SidebarBody>
  );
};
