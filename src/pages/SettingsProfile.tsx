import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { EditArtisanForm } from "@/components/profile/EditArtisanForm";
import { EditCommunityForm } from "@/components/profile/EditCommunityForm";
import { Loader2 } from "lucide-react";

const SettingsProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Redirect community users to settings home
  useEffect(() => {
    if (!roleLoading && role !== "artisan") {
      navigate("/settings/account");
    }
  }, [role, roleLoading, navigate]);

  if (authLoading || roleLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile || role !== "artisan") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Edit Profile</h2>
        <p className="text-muted-foreground">
          Update your profile information and manage your gallery
        </p>
      </div>

      <div className="max-w-4xl">
        {role === "artisan" ? (
          <EditArtisanForm
            fullName={profile.full_name}
            avatarUrl={profile.avatar_url}
          />
        ) : (
          <EditCommunityForm
            displayName={profile.full_name}
            avatarUrl={profile.avatar_url}
            isArtisan={false}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsProfile;
