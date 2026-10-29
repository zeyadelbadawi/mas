"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Procedural studio reflections for metal and stone materials. Built locally from three's
 * RoomEnvironment, so nothing is downloaded (no HDR files, nothing for the CSP to allow).
 */
export function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const texture = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    // 64 px is plenty for dark stone reflections and keeps the one-off build cheap on phones.
    const target = pmrem.fromScene(room, 0, 0.1, 100, { size: 64 });
    room.dispose();
    pmrem.dispose();
    return target.texture;
  }, [gl]);
  useEffect(() => () => texture.dispose(), [texture]);
  // Strength is tuned per material with envMapIntensity.
  return <primitive object={texture} attach="environment" />;
}
