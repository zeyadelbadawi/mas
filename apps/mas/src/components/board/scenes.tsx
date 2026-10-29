"use client";

import { NineFacets } from "@mas/three/nine-facets";
import { ObsidianField } from "@mas/three/obsidian-field";
import { SceneCanvas } from "@mas/three/scene-canvas";
import type { RefObject } from "react";

// Loaded through next/dynamic (ssr: false) so three.js stays out of the first bundle.

const darkPoster = (
  <div className="h-full w-full bg-[radial-gradient(60%_50%_at_50%_60%,#2a0b10_0%,#0b0b0c_70%)]" />
);

export function ObsidianStage({ progress }: { progress: RefObject<number> }) {
  return (
    <SceneCanvas
      poster={darkPoster}
      label="A dark faceted stone surface lit by a slow crimson light"
      className="h-full w-full"
      camera={{ position: [0, 0, 7], fov: 40 }}
    >
      <ObsidianField progress={progress} />
    </SceneCanvas>
  );
}

export function FacetStage({ active }: { active: RefObject<number> }) {
  return (
    <SceneCanvas
      poster={darkPoster}
      label="An obsidian crystal that turns one facet toward you for each service"
      className="h-full w-full"
      camera={{ position: [0, 0.2, 6.2], fov: 38 }}
    >
      <NineFacets active={active} />
    </SceneCanvas>
  );
}
