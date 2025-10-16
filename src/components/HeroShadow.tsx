import React, { useEffect, useState } from "react";

interface HeroShadowProps {
  children: React.ReactNode;
  variant?: "clay" | "sage" | "neutral" | "teal";
  intensity?: "subtle" | "medium" | "bold";
  className?: string;
  deferAnimation?: boolean; // start animation after idle/interaction to improve LCP
}

export function HeroShadow({
  children,
  variant = "sage",
  intensity = "medium",
  className = "",
  deferAnimation = false,
}: HeroShadowProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animationReady, setAnimationReady] = useState(!deferAnimation);
  const [EtherealShadowComp, setEtherealShadowComp] = useState<
    null | ((props: any) => JSX.Element)
  >(null);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Defer enabling animation until user interacts (no idle to keep CI/first view static)
  useEffect(() => {
    if (!deferAnimation || animationReady) return;
    const enable = () => setAnimationReady(true);
    window.addEventListener("pointerdown", enable, { once: true });
    window.addEventListener("touchstart", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });
    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("touchstart", enable);
      window.removeEventListener("keydown", enable);
    };
  }, [deferAnimation, animationReady]);

  // Defer loading the animated background implementation until needed
  useEffect(() => {
    if (!animationReady || prefersReducedMotion || EtherealShadowComp) return;
    let mounted = true;
    import("@/components/ui/ethereal-shadow").then((m) => {
      if (mounted) setEtherealShadowComp(() => m.EtherealShadow as any);
    });
    return () => {
      mounted = false;
    };
  }, [animationReady, prefersReducedMotion, EtherealShadowComp]);

  // Hestia color palette
  const colors = {
    clay: "rgba(217, 125, 84, 0.8)",
    sage: "rgba(138, 154, 91, 0.85)",
    teal: "rgba(31, 71, 66, 0.7)",
    neutral: "rgba(245, 240, 232, 0.6)",
  };

  // Animation intensity levels
  const animations = {
    subtle: { scale: 50, speed: 65 },
    medium: { scale: 70, speed: 75 },
    bold: { scale: 90, speed: 85 },
  };

  // Disable animation on mobile for performance (Option 1 optimization)
  // Mobile devices: Static fallback only (much faster)
  // Desktop: Full animation (beautiful)
  const baseAnimation = animations[intensity];
  const mobileScale = isMobile ? baseAnimation.scale : baseAnimation.scale;
  const mobileSpeed = isMobile ? baseAnimation.speed : baseAnimation.speed;

  const finalAnimation =
    animationReady && !prefersReducedMotion && !isMobile
      ? { scale: mobileScale, speed: mobileSpeed }
      : { scale: 0, speed: 0 };

  return (
    <div className={`relative min-h-screen ${className}`}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ contain: "paint" }}
      >
        {EtherealShadowComp ? (
          <EtherealShadowComp
            color={colors[variant]}
            animation={finalAnimation}
            noise={{ opacity: 0.9, scale: 1.3 }}
            sizing="fill"
          />
        ) : (
          // Lightweight static fallback (same mask/noise visuals, no JS animation)
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: colors[variant],
                WebkitMaskImage: `url('/ethereal-mask.png')`,
                maskImage: `url('/ethereal-mask.png')`,
                WebkitMaskSize: "cover",
                maskSize: "cover",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                filter: "blur(4px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url('/ethereal-noise.png')`,
                backgroundSize: 1.3 * 200,
                backgroundRepeat: "repeat",
                opacity: 0.45,
              }}
            />
          </>
        )}
      </div>
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
