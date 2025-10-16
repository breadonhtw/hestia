import { cn } from "@/lib/utils";

export interface BadgeData {
  badge_key: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  awarded_at: string;
  metadata?: any;
}

interface ArtisanBadgeProps {
  badge: BadgeData;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function ArtisanBadge({
  badge,
  size = "md",
  showTooltip = true,
  className
}: ArtisanBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2"
  };

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-all",
        "border border-opacity-20",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: badge.color ? `${badge.color}15` : "#3b82f615",
        borderColor: badge.color || "#3b82f6",
        color: badge.color || "#3b82f6"
      }}
      title={showTooltip ? badge.description || badge.name : undefined}
    >
      {badge.icon && (
        <span className={iconSizes[size]} aria-hidden="true">
          {badge.icon}
        </span>
      )}
      <span>{badge.name}</span>
    </div>
  );
}

interface ArtisanBadgesProps {
  badges: BadgeData[];
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
  className?: string;
}

export function ArtisanBadges({
  badges,
  size = "md",
  maxDisplay,
  className
}: ArtisanBadgesProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay && badges.length > maxDisplay
    ? badges.length - maxDisplay
    : 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {displayBadges.map((badge) => (
        <ArtisanBadge
          key={badge.badge_key}
          badge={badge}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className="text-xs text-muted-foreground ml-1"
          title={`+${remainingCount} more badge${remainingCount > 1 ? 's' : ''}`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
