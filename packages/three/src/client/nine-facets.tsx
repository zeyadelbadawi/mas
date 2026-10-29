"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { StudioEnvironment } from "./studio-environment";
import {
  BufferGeometry,
  Color,
  EdgesGeometry,
  Float32BufferAttribute,
  MathUtils,
  type Group,
  type MeshStandardMaterial,
} from "three";

const FACETS = 9;
const RING = 1.45;
const APEX = 1.95;
const CRIMSON = new Color("#c21f30");

/** One kite-shaped facet of a nine-sided bipyramid: an upper and a lower triangle. */
function facetGeometry(i: number): BufferGeometry {
  const a0 = (i / FACETS) * Math.PI * 2;
  const a1 = ((i + 1) / FACETS) * Math.PI * 2;
  const v = (a: number) => [Math.cos(a) * RING, 0, Math.sin(a) * RING];
  const top = [0, APEX, 0];
  const bottom = [0, -APEX, 0];
  // Counter-clockwise when seen from outside, so the normals face out.
  const positions = [...top, ...v(a1), ...v(a0), ...bottom, ...v(a0), ...v(a1)];
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/** Rotation around Y that turns facet `i` toward a camera on +Z. */
function facingAngle(i: number): number {
  const centre = ((i + 0.5) / FACETS) * Math.PI * 2;
  return centre - Math.PI / 2;
}

type NineFacetsProps = {
  /** Index of the service being read (0..8). A ref, so scrolling never re-renders React. */
  active: RefObject<number>;
};

/** MAS services (M3): an obsidian crystal that turns one facet per service and lights it crimson. */
export function NineFacets({ active }: NineFacetsProps) {
  const facets = useMemo(
    () =>
      Array.from({ length: FACETS }, (_, i) => {
        const geometry = facetGeometry(i);
        return { id: `facet-${i}`, geometry, edges: new EdgesGeometry(geometry) };
      }),
    [],
  );
  const groupRef = useRef<Group>(null);
  const materialsRef = useRef<(MeshStandardMaterial | null)[]>([]);

  useFrame((state, delta) => {
    const index = MathUtils.clamp(Math.round(active.current ?? 0), 0, FACETS - 1);
    const group = groupRef.current;
    if (group) {
      // Shortest way round, so moving from 8 back to 0 doesn't spin a full turn.
      const target = facingAngle(index);
      const diff =
        MathUtils.euclideanModulo(target - group.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
      group.rotation.y = MathUtils.damp(group.rotation.y, group.rotation.y + diff, 5, delta);
      group.rotation.x = 0.28 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
    }
    materialsRef.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = MathUtils.damp(m.emissiveIntensity, i === index ? 0.38 : 0, 6, delta);
    });
  });

  return (
    <>
      <StudioEnvironment />
      <directionalLight position={[3, 4, 5]} intensity={0.9} color="#f3efe7" />
      <directionalLight position={[-4, -1, -3]} intensity={1.2} color="#c21f30" />
      <group ref={groupRef}>
        {facets.map(({ id, geometry }, i) => (
          <mesh key={id} geometry={geometry}>
            <meshStandardMaterial
              ref={(m) => {
                materialsRef.current[i] = m;
              }}
              color="#141416"
              roughness={0.18}
              metalness={0.9}
              envMapIntensity={0.55}
              emissive={CRIMSON}
              emissiveIntensity={0}
              flatShading
            />
          </mesh>
        ))}
        {facets.map(({ id, edges }) => (
          <lineSegments key={`${id}-edges`} geometry={edges}>
            <lineBasicMaterial color="#3a3a3e" />
          </lineSegments>
        ))}
      </group>
    </>
  );
}
