import React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function GradientText({ children, className, animate = true }: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent",
        animate && "animate-gradient",
        className
      )}
    >
      {children}
    </span>
  );
}
