import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const GlowingCore = () => {
  const coreRef = useRef();
  const pointsRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) coreRef.current.rotation.y = t * 0.2;
    if (pointsRef.current) pointsRef.current.rotation.y = t * 0.2;
  });

  return (
    <group>
      {/* Solid glowing center */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Blue glow layer */}
      <mesh scale={1.1}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Dotted pattern on surface */}
      <points ref={pointsRef}>
        <sphereGeometry args={[1.52, 64, 64]} />
        <pointsMaterial color="#ffffff" size={0.03} transparent opacity={0.6} sizeAttenuation={true} />
      </points>
    </group>
  );
};

const OuterShell = () => {
  const shellRef = useRef();

  useFrame((state) => {
    if (shellRef.current) {
      shellRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      shellRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <mesh ref={shellRef} scale={1.3}>
      <sphereGeometry args={[1.6, 128, 128]} />
      <MeshDistortMaterial
        color="#0f172a"
        transparent
        opacity={0.65}
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        envMapIntensity={2} 
      />
    </mesh>
  );
};

export default function VoiceOrb() {
  return (
    <div style={{ width: '380px', height: '380px', margin: '0 auto', marginBottom: '3.5rem' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.5} />
        {/* Lights for the rim reflections on the dark shell */}
        <spotLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
        <spotLight position={[-10, -10, 5]} intensity={2} color="#ffffff" />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <GlowingCore />
          <OuterShell />
        </Float>
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
