"use client";

import { SceneCanvas } from "@mas/three/scene-canvas";
import { TestScene } from "@mas/three/test-scene";
import type { ReactNode } from "react";

export default function DemoScene({ poster, label }: { poster: ReactNode; label: string }) {
  return (
    <SceneCanvas poster={poster} label={label} className="aspect-video w-full">
      <TestScene color="#c21f30" />
    </SceneCanvas>
  );
}
