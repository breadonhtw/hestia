import ToasterModern from "@/components/ui/toast-modern";
import { useToastModern } from "@/hooks/use-toast-modern";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import React, { Suspense } from "react";
const Index = React.lazy(() => import("./pages/Index"));
const Browse = React.lazy(() => import("./pages/Browse"));
const Search = React.lazy(() => import("./pages/Search"));
const Publications = React.lazy(() => import("./pages/Collections"));
const CreatorProfile = React.lazy(() => import("./pages/CreatorProfile"));
const ProfileModal = React.lazy(() => import("./pages/ProfileModal"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Login = React.lazy(() => import("./pages/Login"));
const Join = React.lazy(() => import("./pages/Join"));
const Profile = React.lazy(() => import("./pages/Profile"));
const ArtisanUpgrade = React.lazy(() => import("./pages/ArtisanUpgrade"));
const Settings = React.lazy(() => import("./pages/Settings"));
const SettingsAccount = React.lazy(() => import("./pages/SettingsAccount"));
const SettingsProfile = React.lazy(() => import("./pages/SettingsProfile"));
const SettingsAnalytics = React.lazy(() => import("./pages/SettingsAnalytics"));
const SettingsBecomeArtisan = React.lazy(() => import("./pages/SettingsBecomeArtisan"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache longer to minimize refetches across navigations
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always",
      retry: 1,
    },
  },
});

const AppRoutes = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | undefined;

  return (
    <Suspense fallback={<div />}>      
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<Index />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/search" element={<Search />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/artisan/:username" element={<CreatorProfile />} />
        <Route path="/creator/:id" element={<CreatorProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/become-artisan" element={<ArtisanUpgrade />} />
        <Route path="/settings" element={<Settings />}>
          <Route path="account" element={<SettingsAccount />} />
          <Route path="profile" element={<SettingsProfile />} />
          <Route path="analytics" element={<SettingsAnalytics />} />
          <Route path="become-artisan" element={<SettingsBecomeArtisan />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {state?.backgroundLocation && (
        <Routes>
          <Route path="/artisan/:username" element={<ProfileModal />} />
          <Route path="/creator/:id" element={<ProfileModal />} />
        </Routes>
      )}
    </Suspense>
  );
};

const App = () => {
  const toasterRef = useToastModern();

  const persister =
    typeof window !== "undefined"
      ? createSyncStoragePersister({ storage: window.localStorage })
      : undefined;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persister ? { persister, maxAge: 24 * 60 * 60 * 1000 } : undefined}
    >
      <AuthProvider>
        <TooltipProvider>
          <ToasterModern ref={toasterRef} />
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
      {/* React Query DevTools - Only in development */}
      {import.meta.env.DEV && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </React.Suspense>
      )}
    </PersistQueryClientProvider>
  );
};

export default App;
