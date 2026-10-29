"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

/** P1 smoke test for the 3D shell: a faceted solid in the brand accent. Real scenes arrive in P2. */
export function TestScene({ color = "#c21f30" }: { color?: string }) {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.25;
    meshRef.current.rotation.y += delta * 0.35;
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.35} metalness={0.4} />
      </mesh>
    </>
  );
}
