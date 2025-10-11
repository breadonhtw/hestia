import { Award, Heart, Sparkles, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserBadgesProps {
  role: "artisan" | "community_member" | "admin";
  createdAt: string;
  favoritesCount?: number;
  followersCount?: number;
}

export const UserBadges = ({
  role,
  createdAt,
  favoritesCount = 0,
  followersCount = 0,
}: UserBadgesProps) => {
  const badges = [];

  // Early Adopter Badge (joined within first 3 months)
  const joinDate = new Date(createdAt);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  if (joinDate < threeMonthsAgo) {
    badges.push({
      id: "early-adopter",
      icon: Sparkles,
      label: "Early Adopter",
      description: "Joined Hestia in its early days",
      color: "text-amber-500",
    });
  }

  // Active Community Member (5+ favorites)
  if (favoritesCount >= 5) {
    badges.push({
      id: "active-member",
      icon: Heart,
      label: "Active Member",
      description: `Favorited ${favoritesCount} creators`,
      color: "text-rose-500",
    });
  }

  // Popular Artisan (10+ followers) - only for artisans
  if (role === "artisan" && followersCount >= 10) {
    badges.push({
      id: "popular-artisan",
      icon: Users,
      label: "Popular Artisan",
      description: `${followersCount} followers`,
      color: "text-purple-500",
    });
  }

  // Admin Badge
  if (role === "admin") {
    badges.push({
      id: "admin",
      icon: Award,
      label: "Hestia Admin",
      description: "Official Hestia team member",
      color: "text-primary",
    });
  }

  // Long-time Member (1+ year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (joinDate < oneYearAgo) {
    badges.push({
      id: "veteran",
      icon: Calendar,
      label: "Veteran Member",
      description: "Member for over a year",
      color: "text-blue-500",
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Achievements
      </h3>
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="cursor-help px-3 py-1.5 flex items-center gap-2 hover:bg-primary/5 transition-colors"
                  >
                    <Icon className={`h-4 w-4 ${badge.color}`} />
                    <span className="text-xs font-medium">{badge.label}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};
