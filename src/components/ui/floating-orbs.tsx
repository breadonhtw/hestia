import React from 'react';
import { motion } from 'framer-motion';

interface FloatingOrbsProps {
  count?: number;
  colors?: string[];
}

export function FloatingOrbs({ 
  count = 5, 
  colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'] 
}: FloatingOrbsProps) {
  const orbs = Array.from({ length: count }, (_, i) => {
    const size = Math.random() * 300 + 200;
    const initialX = Math.random() * 100;
    const initialY = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 5;
    const color = colors[i % colors.length];
    
    return { size, initialX, initialY, duration, delay, color, id: i };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.initialX}%`,
            top: `${orb.initialY}%`,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
