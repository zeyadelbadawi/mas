export type DeviceTier = "HIGH" | "MID" | "LOW" | "STATIC";

export type TierSignals = {
  reducedMotion: boolean;
  saveData: boolean;
  /** navigator.connection.effectiveType, if known. */
  effectiveType?: string | undefined;
  /** navigator.deviceMemory in GB, if known. */
  deviceMemory?: number | undefined;
  coarsePointer: boolean;
  viewportWidth: number;
  webgl: boolean;
};

/** Decide once per page load how rich the motion and media should be (docs/02-architecture.md §8). */
export function decideTier(s: TierSignals): DeviceTier {
  if (s.reducedMotion) return "STATIC";
  if (
    s.saveData ||
    s.effectiveType === "slow-2g" ||
    s.effectiveType === "2g" ||
    s.effectiveType === "3g"
  )
    return "LOW";
  if (!s.webgl) return "LOW";
  const small = s.viewportWidth < 1024;
  if (s.coarsePointer || small || (s.deviceMemory !== undefined && s.deviceMemory <= 4))
    return "MID";
  return "HIGH";
}

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
};

function detectWebgl(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function readTierSignals(): TierSignals {
  const nav = navigator as NavigatorWithHints;
  const webgl = detectWebgl();
  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(nav.connection?.saveData),
    effectiveType: nav.connection?.effectiveType,
    deviceMemory: nav.deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    viewportWidth: window.innerWidth,
    webgl,
  };
}
