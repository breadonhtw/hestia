import ToasterModern from "@/components/ui/toast-modern";
import { useToastModern } from "@/hooks/use-toast-modern";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import React, { Suspense } from "react";
const Index = React.lazy(() => import("./pages/Index"));
const Browse = React.lazy(() => import("./pages/Browse"));
const Search = React.lazy(() => import("./pages/Search"));
const CreatorProfile = React.lazy(() => import("./pages/CreatorProfile"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Profile = React.lazy(() => import("./pages/Profile"));
const ArtisanUpgrade = React.lazy(() => import("./pages/ArtisanUpgrade"));
const Settings = React.lazy(() => import("./pages/Settings"));
const SettingsAccount = React.lazy(() => import("./pages/SettingsAccount"));
const SettingsProfile = React.lazy(() => import("./pages/SettingsProfile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Optimized QueryClient configuration inspired by X and Instagram
// - Longer staleTime reduces unnecessary refetches
// - Proper gcTime (formerly cacheTime) improves performance
// - Retry logic for better reliability
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache
      refetchOnWindowFocus: false, // Reduce unnecessary refetches (like Instagram)
      refetchOnReconnect: true, // Refetch when connection is restored
      retry: 1, // Retry failed requests once
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppRoutes = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/search" element={<Search />} />
        <Route path="/artisan/:username" element={<CreatorProfile />} />
        <Route path="/creator/:id" element={<CreatorProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/become-artisan" element={<ArtisanUpgrade />} />
        <Route path="/settings" element={<Settings />}>
          <Route path="account" element={<SettingsAccount />} />
          <Route path="profile" element={<SettingsProfile />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  const toasterRef = useToastModern();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ToasterModern ref={toasterRef} />
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
