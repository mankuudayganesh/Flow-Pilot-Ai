import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Floating neural network particle field ──────────────────────────────────
function NeuralParticles({ count = 3000 }) {
  const ref = useRef();

  const [positions, connections] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return [pos, null];
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.04;
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#4F46E5"
        size={0.035}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

// ── Slowly rotating wireframe torus ─────────────────────────────────────────
function FloatingTorus({ position = [4, 0, -3], color = '#7C3AED', speed = 0.3 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      ref.current.rotation.y = state.clock.elapsedTime * speed;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[1, 0.3, 16, 60]} />
      <meshStandardMaterial
        color={color}
        wireframe={true}
        transparent
        opacity={0.25}
      />
    </mesh>
  );
}

// ── Slowly pulsing icosahedron ───────────────────────────────────────────────
function FloatingIcosahedron({ position = [-4, 1, -2], color = '#06B6D4' }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.2;
      ref.current.rotation.z = state.clock.elapsedTime * 0.15;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
      ref.current.scale.set(scale, scale, scale);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        wireframe={true}
        transparent
        opacity={0.2}
      />
    </mesh>
  );
}

// ── Small orbiting spheres ───────────────────────────────────────────────────
function OrbitingSpheres() {
  const group = useRef();
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });
  const spheres = [
    { pos: [3, 0, 0], color: '#4F46E5', size: 0.12 },
    { pos: [-3, 1, 0], color: '#06B6D4', size: 0.08 },
    { pos: [0, -2.5, 1], color: '#7C3AED', size: 0.1 },
    { pos: [2, 2, -1], color: '#22C55E', size: 0.07 },
    { pos: [-2, -1, 2], color: '#F59E0B', size: 0.09 },
  ];
  return (
    <group ref={group}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.size, 16, 16]} />
          <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main exported Three.js canvas scene ─────────────────────────────────────
export default function ThreeScene({ style = {}, minimal = false }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        ...style,
      }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} color="#4F46E5" intensity={1.5} />
      <pointLight position={[-10, -10, -5]} color="#06B6D4" intensity={1} />
      <pointLight position={[0, 5, 0]} color="#7C3AED" intensity={0.8} />

      {/* 3D elements */}
      <NeuralParticles count={minimal ? 1500 : 3000} />
      {!minimal && (
        <>
          <FloatingTorus position={[4.5, 0.5, -4]} color="#7C3AED" speed={0.25} />
          <FloatingTorus position={[-4, -1, -3]} color="#4F46E5" speed={0.18} />
          <FloatingIcosahedron position={[-3.5, 1.5, -2]} color="#06B6D4" />
          <FloatingIcosahedron position={[3, -1.5, -3]} color="#4F46E5" />
          <OrbitingSpheres />
        </>
      )}
    </Canvas>
  );
}
