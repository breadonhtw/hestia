import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopSearchBar } from "@/components/TopSearchBar";
import { SidebarAceternity } from "@/components/ui/sidebar-aceternity";
import { SidebarContentWrapper } from "@/components/SidebarContentWrapper";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <SidebarAceternity>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <TopSearchBar />
        <SidebarContentWrapper>
          {children}
        </SidebarContentWrapper>
      </div>
    </SidebarAceternity>
  );
};
