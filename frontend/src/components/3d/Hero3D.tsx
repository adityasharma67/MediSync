'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedBackground = () => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 75 }} style={{ width: '100%', height: '100%' }}>
      <OrbitControls autoRotate autoRotateSpeed={2} />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Central Sphere */}
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere args={[1.5, 64, 200]} scale={1}>
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#1e40af"
            roughness={0.2}
            metalness={0.8}
            wireframe={true}
          />
        </Sphere>
      </Float>

      {/* Orbiting Particles */}
      {[...Array(20)].map((_, i) => (
        <OrbitingParticle key={i} distance={4 + i * 0.3} speed={0.5 + i * 0.1} color={['#10b981', '#3b82f6', '#f59e0b'][i % 3]} />
      ))}
    </Canvas>
  );
};

const OrbitingParticle = ({ distance, speed, color }: { distance: number; speed: number; color: string }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * distance;
      ref.current.position.z = Math.sin(t) * distance;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
};

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <AnimatedBackground />
    </div>
  );
}
