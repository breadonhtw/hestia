import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FlameParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 0.5;
    positions[i3 + 1] = Math.random() * -2;
    positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
    
    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = Math.random() * 0.05 + 0.05;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // Reset particles that go too high
      if (positions[i3 + 1] > 2) {
        positions[i3] = (Math.random() - 0.5) * 0.5;
        positions[i3 + 1] = -2;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
      }
      
      // Add slight wave motion
      positions[i3] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      positions[i3 + 2] += Math.cos(state.clock.elapsedTime + i) * 0.001;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#f59e0b"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export const ThreeJsFlame = () => {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none z-10">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <FlameParticles />
      </Canvas>
    </div>
  );
};
