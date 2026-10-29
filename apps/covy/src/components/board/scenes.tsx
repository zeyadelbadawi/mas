"use client";

import { LeafRing } from "@mas/three/leaf-ring";
import { SceneCanvas } from "@mas/three/scene-canvas";
import type { RefObject } from "react";

// Loaded through next/dynamic (ssr: false) so three.js stays out of the first bundle.
export function LeafStage({ progress }: { progress: RefObject<number> }) {
  return (
    <SceneCanvas
      poster={
        <div className="h-full w-full bg-[radial-gradient(55%_50%_at_50%_50%,#d9e1e8_0%,transparent_70%)]" />
      }
      label="A slow ring of blue caladium leaves"
      className="h-full w-full"
      camera={{ position: [0, 1.4, 10.5], fov: 36 }}
    >
      <LeafRing progress={progress} />
    </SceneCanvas>
  );
}
