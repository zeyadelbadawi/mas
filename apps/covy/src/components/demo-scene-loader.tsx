"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// three.js stays out of the initial bundle (architecture §8).
const DemoScene = dynamic(() => import("./demo-scene"), { ssr: false });

export function DemoSceneLoader({ poster, label }: { poster: ReactNode; label: string }) {
  return (
    <div className="relative aspect-video w-full">
      <div className="absolute inset-0">{poster}</div>
      <div className="absolute inset-0">
        <DemoScene poster={poster} label={label} />
      </div>
    </div>
  );
}
