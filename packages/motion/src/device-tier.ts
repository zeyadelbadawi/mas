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
  // WebGL is not a reason to drop the scroll videos: they only need the video decoder. Chrome also turns
  // WebGL off by itself after GPU errors (many tabs, a crashed GPU process), which used to send a capable
  // desktop to still posters. 3D scenes check WebGL themselves (hasWebgl).
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

let cachedWebgl: boolean | undefined;
/** Whether this browser can create a WebGL context now; measured once per page load. For 3D scenes. */
export function hasWebgl(): boolean {
  return (cachedWebgl ??= detectWebgl());
}

export function readTierSignals(): TierSignals {
  const nav = navigator as NavigatorWithHints;
  const webgl = hasWebgl();
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
