import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

/**
 * Progressive Image component with blur-up technique
 * Similar to Instagram's image loading strategy:
 * 1. Shows a blur placeholder while loading
 * 2. Loads the full image in the background
 * 3. Smoothly transitions when ready
 */
export const ProgressiveImage = ({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  priority = false,
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);

  useEffect(() => {
    // If priority is true, load immediately
    if (priority) {
      setIsInView(true);
      return;
    }

    // Use IntersectionObserver to only load when image is near viewport
    const img = new Image();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
      }
    );

    const element = document.querySelector(`[data-src="${src}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [src, isInView]);

  return (
    <div
      data-src={src}
      className={cn("relative overflow-hidden bg-muted", className)}
    >
      {/* Blur placeholder - shows while loading */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        style={{
          backgroundColor: "#f0f0f0",
          backgroundImage: `linear-gradient(90deg, #f0f0f0 0px, #f8f8f8 40px, #f0f0f0 80px)`,
          backgroundSize: "200% 100%",
          animation: isInView && !isLoaded ? "shimmer 1.5s infinite" : "none",
        }}
      />

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading={loading}
          width={width}
          height={height}
          decoding="async"
        />
      )}
    </div>
  );
};
