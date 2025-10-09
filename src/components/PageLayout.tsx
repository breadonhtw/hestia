import { ReactNode } from "react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, Users, Info, UserPlus, Mail } from "lucide-react";

interface PageLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'Browse', url: '/browse', icon: Users },
  { name: 'About', url: '/about', icon: Info },
  { name: 'Join', url: '/join', icon: UserPlus },
  { name: 'Contact', url: '/contact', icon: Mail }
];

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-background">
      <NavBar items={navItems} />
      <main className="pb-20 sm:pt-20">
        {children}
      </main>
    </div>
  );
};
