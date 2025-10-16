import React from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  fetchPriority?: "high" | "low" | "auto";
}

function buildTransformedUrl(originalSrc: string, width: number, height?: number, quality = 75) {
  try {
    const url = new URL(originalSrc, window.location.origin);
    const isSupabaseObject = /\/storage\/v1\/object\//.test(url.pathname);
    const isSupabaseRender = /\/storage\/v1\/render\/image\//.test(url.pathname);

    if (isSupabaseRender) {
      url.searchParams.set("width", String(width));
      if (height) url.searchParams.set("height", String(height));
      url.searchParams.set("quality", String(quality));
      url.searchParams.set("resize", "cover");
      return url.toString();
    }

    if (isSupabaseObject) {
      // Convert object URL to render endpoint for transforms
      url.pathname = url.pathname.replace("/object/", "/render/image/");
      url.searchParams.set("width", String(width));
      if (height) url.searchParams.set("height", String(height));
      url.searchParams.set("quality", String(quality));
      url.searchParams.set("resize", "cover");
      return url.toString();
    }

    return originalSrc;
  } catch {
    return originalSrc;
  }
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  sizes,
  fetchPriority,
  className,
  ...imgProps
}) => {
  const base300 = buildTransformedUrl(src, 300);
  const base600 = buildTransformedUrl(src, 600);
  const base900 = buildTransformedUrl(src, 900);

  return (
    <img
      src={buildTransformedUrl(src, width, height)}
      srcSet={`${base300} 300w, ${base600} 600w, ${base900} 900w`}
      sizes={sizes || "(max-width: 640px) 100vw, 600px"}
      width={width}
      height={height}
      alt={alt}
      loading={fetchPriority === "high" ? undefined : "lazy"}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
      {...imgProps}
    />
  );
};
