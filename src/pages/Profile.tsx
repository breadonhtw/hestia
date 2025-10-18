import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useArtisanByUserId } from "@/hooks/useArtisans";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BecomeArtisanBanner } from "@/components/profile/BecomeArtisanBanner";
import { FavoritesList } from "@/components/profile/FavoritesList";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  const { data: artisanData, isLoading: artisanLoading } = useArtisanByUserId(
    user?.id || ""
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      console.log("Fetching profile for user:", user?.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) {
        console.error("Profile query error:", error);
        throw error;
      }

      console.log("Profile data:", data);
      return data;
    },
  });

  // Debug logging
  console.log("Profile component render:", {
    user: !!user,
    authLoading,
    role,
    roleLoading,
    profile: !!profile,
    profileLoading,
    profileError,
  });

  const { data: favorites } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_favorites")
        .select("artisan_id")
        .eq("user_id", user!.id);
      return data || [];
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Redirect artisans to their public profile using artisan ID
  useEffect(() => {
    if (
      !roleLoading &&
      !artisanLoading &&
      role === "artisan" &&
      artisanData?.id
    ) {
      navigate(`/creator/${artisanData.id}`, { replace: true });
    }
  }, [role, roleLoading, artisanLoading, artisanData?.id, navigate]);

  if (authLoading || roleLoading || profileLoading || artisanLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile || !role) {
    console.log("Profile page missing data:", {
      user: !!user,
      profile: !!profile,
      role,
    });
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Loading profile data...</p>
            <p className="text-xs text-muted-foreground mt-2">
              User: {user ? "✓" : "✗"} | Profile: {profile ? "✓" : "✗"} | Role:{" "}
              {role ? "✓" : "✗"}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Community users see their favorites
  if (role !== "artisan") {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <ProfileHeader
          fullName={profile.full_name}
          username={profile.username}
          avatarUrl={profile.avatar_url}
          role={role}
          createdAt={profile.created_at}
          favoritesCount={favorites?.length}
        />

        {/* Prominent Call-to-Action to Become Artisan */}
        <BecomeArtisanBanner />

        <div className="w-full max-w-[1920px]">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="w-full max-w-4xl mx-auto space-y-6">
              <FavoritesList />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Artisans will be redirected to their public profile
  return null;
};

export default Profile;
