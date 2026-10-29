"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { StudioEnvironment } from "./studio-environment";
import { MathUtils, PlaneGeometry, type Group, type Mesh, type PointLight } from "three";

/** Deterministic pseudo-random, so the facets look the same on every visit. */
function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function facetedPlane(): PlaneGeometry {
  const geo = new PlaneGeometry(16, 10, 26, 16);
  const pos = geo.attributes.position!;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Jitter in-plane so the grid reads as broken stone, then lift each vertex for depth.
    pos.setXYZ(
      i,
      x + (hash(x, y) - 0.5) * 0.45,
      y + (hash(y, x) - 0.5) * 0.45,
      hash(x * 0.7, y * 1.3) * 0.75,
    );
  }
  // Unshared vertices give each triangle its own normal: hard facets, like the deck's polygon background.
  const flat = geo.toNonIndexed() as PlaneGeometry;
  flat.computeVertexNormals();
  geo.dispose();
  return flat;
}

type ObsidianFieldProps = {
  /** 0..1 scroll progress through the hero; the camera pushes into the facets as it grows. */
  progress?: RefObject<number>;
};

/** MAS hero (M1): a dark faceted surface that catches a sweeping crimson light. */
export function ObsidianField({ progress }: ObsidianFieldProps) {
  const geometry = useMemo(() => facetedPlane(), []);
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const sweepRef = useRef<PointLight>(null);

  useFrame((state, delta) => {
    const { camera, pointer } = state;
    const t = state.clock.elapsedTime;
    const p = progress?.current ?? 0;
    if (sweepRef.current) {
      // The crimson light crosses the field slowly, then holds brighter as the visitor scrolls in.
      sweepRef.current.position.x = Math.sin(t * 0.22) * 7;
      sweepRef.current.position.y = Math.cos(t * 0.17) * 2.2;
      sweepRef.current.intensity = 34 + p * 46;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = MathUtils.damp(
        groupRef.current.rotation.y,
        pointer.x * 0.08,
        3,
        delta,
      );
      groupRef.current.rotation.x = MathUtils.damp(
        groupRef.current.rotation.x,
        -0.42 - pointer.y * 0.05,
        3,
        delta,
      );
    }
    camera.position.z = MathUtils.damp(camera.position.z, 7 - p * 4, 4, delta);
  });

  return (
    <>
      <color attach="background" args={["#0b0b0c"]} />
      <StudioEnvironment />
      <directionalLight position={[-4, 6, 3]} intensity={0.25} color="#f3efe7" />
      <pointLight ref={sweepRef} position={[0, 0, 2.2]} distance={11} decay={1.6} color="#c21f30" />
      <group ref={groupRef} rotation={[-0.42, 0, 0]}>
        <mesh ref={meshRef} geometry={geometry}>
          <meshStandardMaterial
            color="#111113"
            roughness={0.3}
            metalness={0.85}
            envMapIntensity={0.07}
            flatShading
          />
        </mesh>
      </group>
    </>
  );
}
