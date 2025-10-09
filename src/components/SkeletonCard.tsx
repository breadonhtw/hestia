import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard = ({ className }: SkeletonCardProps) => {
  return (
    <div className={cn("rounded-2xl overflow-hidden bg-card border border-border", className)}>
      <div className="aspect-square w-full shimmer-skeleton" />
      <div className="p-6 space-y-3">
        <div className="h-6 w-3/4 shimmer-skeleton rounded" />
        <div className="h-4 w-1/2 shimmer-skeleton rounded" />
        <div className="h-4 w-2/3 shimmer-skeleton rounded" />
      </div>
    </div>
  );
};
