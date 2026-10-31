// Frame timing shared by the scroll-sequence builders: how much the image changes from frame to frame, and
// where each frame sits along the camera move so the player can scrub at an even camera speed.

import sharp from "sharp";

/** Image change between consecutive frames: mean absolute difference of 192×108 greyscale copies. */
export async function motionProfile(files) {
  const change = [];
  let prev;
  for (const file of files) {
    const px = await sharp(file).resize(192, 108, { fit: "fill" }).greyscale().raw().toBuffer();
    if (prev) {
      let sum = 0;
      for (let i = 0; i < px.length; i++) sum += Math.abs(px[i] - prev[i]);
      change.push(sum / px.length);
    }
    prev = px;
  }
  return change;
}

/**
 * Pick about one frame per `step` units of change, always keeping the first and last. Returns the picked
 * source indices and, for each, its position along the move (0..1).
 */
export function pickByMotion(change, step, floor) {
  const at = [0];
  for (const c of change) at.push(at[at.length - 1] + Math.max(c, floor));
  const total = at[at.length - 1];
  const picked = [0];
  for (let i = 1; i < at.length; i++)
    if (at[i] - at[picked[picked.length - 1]] >= step || i === at.length - 1) picked.push(i);
  return { picked, timing: picked.map((i) => at[i] / total) };
}

/**
 * Re-time a curve (0..1) so the camera eases in over the first `easeIn` of the move and out over the last
 * `easeOut`: there it moves at down to 30% of its speed, which takes proportionally more of the scroll.
 */
export function ease(timing, easeIn, easeOut) {
  if (!(easeIn > 0) && !(easeOut > 0)) return timing;
  const floor = 0.3;
  const smooth = (x) => x * x * (3 - 2 * x);
  const speed = (u) => {
    let s = 1;
    if (easeIn > 0 && u < easeIn) s = Math.min(s, floor + (1 - floor) * smooth(u / easeIn));
    if (easeOut > 0 && u > 1 - easeOut)
      s = Math.min(s, floor + (1 - floor) * smooth((1 - u) / easeOut));
    return s;
  };
  // Scroll needed to reach each point of the move: the integral of 1 / speed, normalised to 0..1.
  const n = 4000;
  const scroll = [0];
  for (let i = 1; i <= n; i++)
    scroll.push(scroll[i - 1] + 2 / (speed((i - 1) / n) + speed(i / n)) / n);
  const total = scroll[n];
  return timing.map((t) => {
    const x = t * n;
    const i = Math.min(n - 1, Math.floor(x));
    return (scroll[i] + (scroll[i + 1] - scroll[i]) * (x - i)) / total;
  });
}

/** Each frame's place along the move (0..1), from the change between frames; `floor` is the least a frame counts for. */
export function motionTiming(change, floor) {
  const at = [0];
  for (const c of change) at.push(at[at.length - 1] + Math.max(c, floor));
  const total = at[at.length - 1];
  return at.map((x) => x / total);
}
