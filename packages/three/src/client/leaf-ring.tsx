"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import {
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  MathUtils,
  Object3D,
  Shape,
  ShapeGeometry,
  type Group,
  type InstancedMesh,
  type ShaderMaterial,
} from "three";

const COUNT = 22;
const RADIUS = 3.6;

/** Caladium-style leaf: pointed tip, two rounded basal lobes, notch at the stem. Stem point at (0, 0). */
function leafGeometry(): ShapeGeometry {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.18, -0.2, 0.62, -0.32, 0.62, 0.08);
  s.bezierCurveTo(0.62, 0.55, 0.28, 0.95, 0, 1.35);
  s.bezierCurveTo(-0.28, 0.95, -0.62, 0.55, -0.62, 0.08);
  s.bezierCurveTo(-0.62, -0.32, -0.18, -0.2, 0, 0);
  return new ShapeGeometry(s, 28);
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  attribute float aTint;
  varying vec2 vPos;
  varying float vTint;
  varying float vShade;
  varying float vDepth;
  void main() {
    vec3 p = position;
    vPos = p.xy;
    vTint = aTint;
    // Cup the blade along its width and let it drift, so the leaves float rather than spin.
    float cup = p.x * p.x * 0.35;
    float flutter = sin(uTime * 0.8 + aPhase * 6.2831 + p.y * 1.6) * 0.06 * p.y;
    p.z += cup + flutter;
    vShade = 0.82 + cup * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
    vDepth = gl_Position.w;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uPale;
  uniform vec3 uBlue;
  uniform vec3 uNavy;
  uniform vec3 uCocoa;
  uniform vec3 uFog;
  varying vec2 vPos;
  varying float vTint;
  varying float vShade;
  varying float vDepth;
  void main() {
    // Caladium venation: a midrib to the tip and side veins running up and out from it.
    float midrib = 1.0 - smoothstep(0.012, 0.03, abs(vPos.x));
    float side = fract((vPos.y - abs(vPos.x) * 0.85) * 5.0);
    float veins = (1.0 - smoothstep(0.0, 0.07, side)) * smoothstep(0.04, 0.12, abs(vPos.x));
    float dist = length(vPos - vec2(0.0, 0.5));
    // Two-tone: pale centre, blue (or cocoa) towards the edge.
    vec3 edge = mix(uBlue, uCocoa, vTint);
    vec3 col = mix(uPale, edge, smoothstep(0.3, 0.8, dist));
    col = mix(col, uNavy, max(veins * 0.45, midrib * 0.7) * smoothstep(-0.05, 0.25, vPos.y));
    col *= vShade;
    // Leaves at the back of the ring fade into the page, which gives the ring depth.
    col = mix(col, uFog, smoothstep(7.5, 12.5, vDepth) * 0.75);
    gl_FragColor = vec4(col, 1.0);
  }
`;

type LeafRingProps = {
  /** 0..1 progress through the "Taste of Everywhere" section; the ring turns through the five cuisines. */
  progress?: RefObject<number>;
};

/** COVY (C4): a slow ring of caladium leaves in the brand's blue/cocoa duotone. */
export function LeafRing({ progress }: LeafRingProps) {
  const geometry = useMemo(() => {
    const g = leafGeometry();
    const phase = new Float32Array(COUNT);
    const tint = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      phase[i] = (Math.sin(i * 91.7) + 1) / 2;
      tint[i] = i % 4 === 0 ? 1 : 0;
    }
    g.setAttribute("aPhase", new InstancedBufferAttribute(phase, 1));
    g.setAttribute("aTint", new InstancedBufferAttribute(tint, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPale: { value: new Color("#eef0f2") },
      uBlue: { value: new Color("#7e98ae") },
      uNavy: { value: new Color("#262d3f") },
      uCocoa: { value: new Color("#765f4d") },
      uFog: { value: new Color("#e6e0dc") },
    }),
    [],
  );

  const meshRef = useRef<InstancedMesh>(null);
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const o = new Object3D();
    for (let i = 0; i < COUNT; i++) {
      const a = (i / COUNT) * Math.PI * 2;
      const wobble = Math.sin(i * 12.9898) * 0.5;
      o.position.set(Math.cos(a) * RADIUS, wobble * 0.9 - 0.4, Math.sin(a) * RADIUS);
      // Face outward, lean back a little, and turn each blade a different amount.
      o.rotation.set(-0.35 + wobble * 0.3, -a + Math.PI / 2, wobble * 0.9);
      const s = 0.55 + ((Math.sin(i * 4.1) + 1) / 2) * 0.35;
      o.scale.set(s, s, s);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) materialRef.current.uniforms.uTime!.value = state.clock.elapsedTime;
    const group = groupRef.current;
    if (!group) return;
    const target = (progress?.current ?? 0) * Math.PI * 1.6 + state.clock.elapsedTime * 0.02;
    group.rotation.y = MathUtils.damp(group.rotation.y, target, 2.5, delta);
  });

  return (
    <group ref={groupRef} rotation={[0.12, 0, 0]}>
      <instancedMesh ref={meshRef} args={[geometry, undefined, COUNT]}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}
