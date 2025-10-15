import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserBadges } from "./UserBadges";

interface ProfileHeaderProps {
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string;
  favoritesCount?: number;
  followersCount?: number;
  role: "artisan" | "community_member" | "admin";
}

export const ProfileHeader = ({
  fullName,
  username,
  avatarUrl,
  role,
  createdAt,
  favoritesCount,
  followersCount,
}: ProfileHeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getRoleBadge = () => {
    const roleColors = {
      artisan: "bg-accent text-white",
      community_member: "bg-secondary",
      admin: "bg-primary text-white",
    };

    const roleLabels = {
      artisan: "Artisan",
      community_member: "Community Member",
      admin: "Admin",
    };

    return <Badge className={roleColors[role]}>{roleLabels[role]}</Badge>;
  };

  return (
    <div className="bg-card border-b p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || ""} alt={fullName} />
              <AvatarFallback className="text-2xl">
                {fullName?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {fullName || "Unknown User"}
              </h1>
              {username && <p className="text-muted-foreground">@{username}</p>}
              <div className="mt-2 flex items-center gap-2">
                {getRoleBadge()}
              </div>
              {/* ✅ Add badges component */}
              <UserBadges
                role={role}
                createdAt={createdAt}
                favoritesCount={favoritesCount}
                followersCount={followersCount}
              />
            </div>
          </div>

          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
