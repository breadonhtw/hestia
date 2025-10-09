import React, { useEffect, useState } from 'react';
import { EtherealShadow } from '@/components/ui/ethereal-shadow';

interface HeroShadowProps {
  children: React.ReactNode;
  variant?: 'clay' | 'sage' | 'neutral' | 'teal';
  intensity?: 'subtle' | 'medium' | 'bold';
  className?: string;
}

export function HeroShadow({ 
  children, 
  variant = 'sage', 
  intensity = 'medium',
  className = ''
}: HeroShadowProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hestia color palette
  const colors = {
    clay: 'rgba(217, 125, 84, 0.8)',
    sage: 'rgba(138, 154, 91, 0.85)',
    teal: 'rgba(31, 71, 66, 0.7)',
    neutral: 'rgba(245, 240, 232, 0.6)'
  };

  // Animation intensity levels
  const animations = {
    subtle: { scale: 50, speed: 65 },
    medium: { scale: 70, speed: 75 },
    bold: { scale: 90, speed: 85 }
  };

  // Reduce animation on mobile for performance
  const baseAnimation = animations[intensity];
  const mobileScale = isMobile ? baseAnimation.scale * 0.7 : baseAnimation.scale;
  
  const finalAnimation = prefersReducedMotion 
    ? { scale: 0, speed: 0 }
    : { scale: mobileScale, speed: baseAnimation.speed };

  return (
    <div className={`relative min-h-screen ${className}`}>
      <div className="absolute inset-0">
        <EtherealShadow
          color={colors[variant]}
          animation={finalAnimation}
          noise={{ opacity: 0.9, scale: 1.3 }}
          sizing="fill"
        />
      </div>
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
