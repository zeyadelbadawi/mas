/** Map normalised scroll progress (0..1) to a frame index, clamped to the frame range. */
export function progressToFrame(progress: number, frameCount: number): number {
  if (frameCount <= 0) return 0;
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  return Math.min(frameCount - 1, Math.round(p * (frameCount - 1)));
}

/**
 * Map normalised scroll progress (0..1) to a position between frames (0..frameCount-1, fractional). With a
 * `timing` curve (each frame's place along the move, 0..1, rising), equal scroll moves the camera equally
 * even where the frames are unevenly spaced; without one the frames are spread evenly.
 */
export function progressToPosition(progress: number, frameCount: number, timing?: readonly number[]): number {
  if (frameCount <= 1) return 0;
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  if (!timing || timing.length !== frameCount) return p * (frameCount - 1);
  // Last frame whose place is at or before p, then the share of the way to the next one.
  let lo = 0;
  let hi = frameCount - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((timing[mid] ?? 0) <= p) lo = mid;
    else hi = mid;
  }
  const a = timing[lo] ?? 0;
  const b = timing[hi] ?? 1;
  return b > a ? lo + Math.min(1, Math.max(0, (p - a) / (b - a))) : lo;
}

/**
 * Order in which to request frames around the current one: current first, then alternating
 * ahead/behind (ahead weighted by scroll direction), never outside 0..frameCount-1.
 */
export function framePriority(
  current: number,
  frameCount: number,
  ahead: number,
  behind: number,
  direction: 1 | -1 = 1,
): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  const push = (i: number) => {
    if (i >= 0 && i < frameCount && !seen.has(i)) {
      seen.add(i);
      out.push(i);
    }
  };
  push(current);
  // `ahead` always means "in the scroll direction"; multiplying by direction handles reverse scrolling.
  for (let d = 1; d <= Math.max(ahead, behind); d++) {
    if (d <= ahead) push(current + d * direction);
    if (d <= behind) push(current - d * direction);
  }
  return out;
}

/**
 * How coarse a frame is for progressive loading: 0 for every `maxStride`-th frame (and the last frame),
 * 1 for the frames that halve that gap, and so on up to log2(maxStride) for odd frames.
 */
export function strideLevel(index: number, frameCount: number, maxStride = 16): number {
  if (index === frameCount - 1) return 0;
  let level = 0;
  for (let s = maxStride; s > 1; s /= 2, level++) if (index % s === 0) return level;
  return level;
}

/**
 * Order in which to download frames: the few right around the current one first, then a coarse pass
 * across the sequence (every 16th frame), then finer passes. Within a pass, nearest first, favouring the
 * scroll direction. A fast scroll then always lands near a frame that has already arrived.
 */
export function downloadOrder(
  missing: Iterable<number>,
  current: number,
  frameCount: number,
  direction: 1 | -1 = 1,
  near = 6,
): number[] {
  return [...missing]
    .map((i) => {
      const d = (i - current) * direction;
      const level = Math.abs(i - current) <= near ? -1 : strideLevel(i, frameCount);
      // Behind the scroll direction counts double, and loses ties.
      return { i, level, dist: d >= 0 ? d : -d * 2 + 0.5 };
    })
    .sort((a, b) => a.level - b.level || a.dist - b.dist)
    .map((x) => x.i);
}

/** Frames outside [current - keepBehind, current + keepAhead] can be evicted from memory. */
export function evictable(
  cached: Iterable<number>,
  current: number,
  keepAhead: number,
  keepBehind: number,
): number[] {
  const out: number[] = [];
  for (const i of cached) if (i > current + keepAhead || i < current - keepBehind) out.push(i);
  return out;
}

/** object-fit: cover/contain with a focal point (0..1) for drawing a frame onto a canvas. */
export function fitRect(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
  fit: "cover" | "contain",
  focal: { x: number; y: number } = { x: 0.5, y: 0.5 },
): {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
} {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  if (fit === "contain") {
    const scale = Math.min(dstW / srcW, dstH / srcH);
    const dw = srcW * scale;
    const dh = srcH * scale;
    return { sx: 0, sy: 0, sw: srcW, sh: srcH, dx: (dstW - dw) / 2, dy: (dstH - dh) / 2, dw, dh };
  }
  let sw = srcW;
  let sh = srcH;
  if (srcRatio > dstRatio) sw = srcH * dstRatio;
  else sh = srcW / dstRatio;
  const sx = Math.min(srcW - sw, Math.max(0, focal.x * srcW - sw / 2));
  const sy = Math.min(srcH - sh, Math.max(0, focal.y * srcH - sh / 2));
  return { sx, sy, sw, sh, dx: 0, dy: 0, dw: dstW, dh: dstH };
}
