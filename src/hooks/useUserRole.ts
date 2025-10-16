import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        // First try to get role from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (!roleError && roleData) {
          return roleData.role as "artisan" | "community_member" | "admin";
        }

        // Fallback: try to get role from profiles table (for backward compatibility)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user!.id)
          .maybeSingle();

        if (!profileError && profileData?.role) {
          return profileData.role as "artisan" | "community_member" | "admin";
        }

        // Final fallback: check if user has an artisan profile
        const { data: artisanData } = await supabase
          .from("artisans")
          .select("id")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (artisanData) {
          return "artisan" as const;
        }

        // Default fallback
        return "community_member" as const;
      } catch (error) {
        console.error("Exception fetching user role:", error);
        // Fallback to community_member on exception
        return "community_member" as const;
      }
    },
  });

  return {
    role,
    isLoading,
    isArtisan: role === "artisan",
    isCommunityMember: role === "community_member",
    isAdmin: role === "admin",
  };
};
