"use client";

import { Canvas, useThree, type CanvasProps } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotion } from "@mas/motion/provider";

type SceneCanvasProps = {
  /** Shown during SSR, before the canvas is ready, and on LOW/STATIC tiers or when WebGL fails. */
  poster: ReactNode;
  children: ReactNode;
  /** Accessible description of what the scene shows (the canvas itself is decorative). */
  label: string;
  className?: string;
  camera?: CanvasProps["camera"];
};

/**
 * One R3F canvas with one responsibility: decorative depth behind semantic content.
 * DPR capped per tier, rendering paused offscreen, poster fallback (skill: build-awwwards-quality-sites §5).
 * Import this through next/dynamic with ssr:false so three.js stays out of the initial bundle.
 */
export function SceneCanvas({ poster, children, label, className, camera }: SceneCanvasProps) {
  const { tier } = useMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const enabled = (tier === "HIGH" || tier === "MID") && !failed;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), {
      rootMargin: "20%",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={label}
      className={["relative", className ?? ""].join(" ")}
    >
      <div aria-hidden="true" className="absolute inset-0">
        {poster}
      </div>
      {enabled ? (
        <Canvas
          aria-hidden="true"
          className="!absolute inset-0"
          dpr={tier === "HIGH" ? [1, 2] : [1, 1.5]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: tier === "HIGH", powerPreference: "high-performance", alpha: true }}
          camera={camera ?? { position: [0, 0, 5], fov: 45 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              setFailed(true);
            });
          }}
        >
          {children}
          <Prewarm />
        </Canvas>
      ) : null}
    </div>
  );
}

/**
 * Compiles the shaders and uploads the buffers once on mount, even while off screen (frameloop "never"),
 * so the first visible frame is cheap. Mounted after the scene's children, so they are in place.
 */
function Prewarm() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compile(scene, camera);
    gl.render(scene, camera);
  }, [gl, scene, camera]);
  return null;
}
