import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard = ({ className }: SkeletonCardProps) => {
  return (
    <div className={cn("rounded-[20px] bg-card border border-border p-6", className)}>
      {/* Avatar placeholder - matches CreatorCard compact variant */}
      <div className="mb-4 flex justify-center">
        <div className="w-[120px] h-[120px] rounded-full shimmer-skeleton" />
      </div>

      {/* Creator info placeholder - matches CreatorCard spacing */}
      <div className="text-center space-y-2">
        <div className="h-8 w-3/4 mx-auto shimmer-skeleton rounded" />
        <div className="h-6 w-1/2 mx-auto shimmer-skeleton rounded-full" />
        <div className="h-4 w-2/3 mx-auto shimmer-skeleton rounded" />
      </div>
    </div>
  );
};
