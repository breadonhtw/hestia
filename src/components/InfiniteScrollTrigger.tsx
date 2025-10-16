import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

/**
 * Infinite Scroll Trigger Component
 * Similar to X/Instagram's feed loading mechanism
 * Automatically loads more content when user scrolls near the bottom
 */
export const InfiniteScrollTrigger = ({
  onIntersect,
  hasMore,
  isLoading,
}: InfiniteScrollTriggerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading) {
          onIntersect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px", // Start loading 200px before reaching the trigger
      }
    );

    observer.observe(trigger);

    return () => {
      if (trigger) {
        observer.unobserve(trigger);
      }
    };
  }, [onIntersect, hasMore, isLoading]);

  if (!hasMore) return null;

  return (
    <div
      ref={triggerRef}
      className="w-full py-8 flex items-center justify-center"
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading more artisans...</span>
        </div>
      )}
    </div>
  );
};
