import { downloadOrder, evictable, framePriority } from "./frame-math";

type Fetcher = (index: number, signal: AbortSignal) => Promise<Blob>;
type Decoder<T> = (blob: Blob) => Promise<T>;

export type CacheMode = "playing" | "ready" | "standby";

/**
 * Frames kept decoded ahead of / behind the current one on standby: enough to open on. The rest is freed, so
 * three sequences don't hold ~250 MB of decoded frames each; a sequence gets its full window back ("ready")
 * a screen and a half before it plays.
 */
const STANDBY: [number, number] = [6, 2];

/** Tries per frame before a failed download is given up on. */
const MAX_ATTEMPTS = 3;

/**
 * Two layers: the compressed bytes of every frame (small, a few MB per sequence), and decoded frames
 * near the current scroll position (large: width × height × 4 bytes each, so kept to a window).
 * Downloads are never cancelled by scrolling, so a fast scroll can't starve them; only decoding
 * follows the scroll position, and decoding from memory takes tens of milliseconds.
 */
export class FrameCache<T extends { close(): void } = ImageBitmap> {
  private blobs = new Map<number, Blob>();
  private downloading = new Map<number, AbortController>();
  private failed = new Set<number>();
  private attempts = new Map<number, number>();
  private bitmaps = new Map<number, T>();
  private decoding = new Set<number>();
  private current = 0;
  private direction: 1 | -1 = 1;
  private preloading = false;
  private mode: CacheMode = "playing";
  private destroyed = false;
  private readonly decode: Decoder<T>;
  private readonly maxDownloads: number;
  private readonly maxDecodes: number;
  private readonly ahead: number;
  private readonly behind: number;
  private readonly retryDelayMs: number;
  private onReady: (index: number) => void;

  constructor(
    private readonly frameCount: number,
    private readonly fetchFrame: Fetcher,
    options: {
      decode?: Decoder<T>;
      maxDownloads?: number;
      maxDecodes?: number;
      /** Decoded frames to keep ahead of / behind the current one. Size these to a memory budget (decoded RGBA). */
      ahead?: number;
      behind?: number;
      /** Pause before retrying a failed download; grows with each attempt. */
      retryDelayMs?: number;
      onReady: (index: number) => void;
    },
  ) {
    this.decode = options.decode ?? ((blob) => createImageBitmap(blob) as unknown as Promise<T>);
    this.maxDownloads = options.maxDownloads ?? 6;
    this.maxDecodes = options.maxDecodes ?? 2;
    this.ahead = options.ahead ?? 24;
    this.behind = options.behind ?? 8;
    this.retryDelayMs = options.retryDelayMs ?? 1000;
    this.onReady = options.onReady;
  }

  get(index: number): T | undefined {
    return this.bitmaps.get(index);
  }

  /** Nearest already-decoded frame, so fast scrolling never shows a blank canvas. */
  nearest(index: number): T | undefined {
    const i = nearestKey(this.bitmaps, index, this.frameCount);
    return i === undefined ? undefined : this.bitmaps.get(i);
  }

  /** Download every frame in the background, coarse to fine, not only the ones near the current position. */
  preloadAll(): void {
    this.preloading = true;
    this.pumpDownloads();
  }

  prioritise(current: number, direction: 1 | -1): void {
    this.current = current;
    this.direction = direction;
    this.evict();
    this.pumpDownloads();
    this.pumpDecodes();
  }

  /**
   * "playing": on screen, full window at full decode speed. "ready": next up, full window but one decode at
   * a time, so it doesn't slow the sequence playing. "standby": far away, a smaller window (one decode at a
   * time) and the rest of the memory freed. Downloads carry on in every mode.
   */
  setMode(mode: CacheMode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    this.evict();
    this.pumpDecodes();
  }

  private evict(): void {
    const shown = nearestKey(this.bitmaps, this.current, this.frameCount);
    for (const i of evictable(this.bitmaps.keys(), this.current, ...this.keepWindow())) {
      // Keep the frame on screen until a closer one is decoded.
      if (i === shown) continue;
      this.bitmaps.get(i)?.close();
      this.bitmaps.delete(i);
    }
  }

  /** Frames to decode ahead of / behind the current one: the full window unless on standby. */
  private window(): [number, number] {
    if (this.mode !== "standby") return [this.ahead, this.behind];
    return [Math.min(STANDBY[0], this.ahead), Math.min(STANDBY[1], this.behind)];
  }

  /** [keepAhead, keepBehind] in index terms, with a little slack so small back-and-forth scrolls don't re-decode. */
  private keepWindow(): [number, number] {
    const [ahead, behind] = this.window();
    const slack = this.mode === "standby" ? 0 : Math.ceil((ahead + behind) / 4);
    const forward = ahead + slack;
    const backward = behind + slack;
    return this.direction === 1 ? [forward, backward] : [backward, forward];
  }

  private pumpDownloads(): void {
    const free = this.maxDownloads - this.downloading.size;
    if (this.destroyed || free <= 0) return;
    const { current, direction, frameCount } = this;
    const candidates = this.preloading
      ? Array.from({ length: frameCount }, (_, i) => i)
      : framePriority(current, frameCount, this.ahead, this.behind, direction);
    const missing = candidates.filter(
      (i) => !this.blobs.has(i) && !this.downloading.has(i) && !this.failed.has(i),
    );
    for (const index of downloadOrder(missing, current, frameCount, direction).slice(0, free)) {
      const ctrl = new AbortController();
      this.downloading.set(index, ctrl);
      this.fetchFrame(index, ctrl.signal)
        .then((blob) => {
          if (this.destroyed) return;
          this.blobs.set(index, blob);
          this.pumpDecodes();
        })
        .catch(() => {
          if (this.destroyed) return;
          // Retry a dropped connection or 5xx after a pause, a few times at most; meanwhile the
          // nearest frame that did arrive is shown instead.
          const attempts = (this.attempts.get(index) ?? 0) + 1;
          this.attempts.set(index, attempts);
          this.failed.add(index);
          if (attempts < MAX_ATTEMPTS) {
            setTimeout(() => {
              this.failed.delete(index);
              this.pumpDownloads();
            }, this.retryDelayMs * attempts);
          }
        })
        .finally(() => {
          this.downloading.delete(index);
          this.pumpDownloads();
        });
    }
  }

  private pumpDecodes(): void {
    const free = (this.mode === "playing" ? this.maxDecodes : 1) - this.decoding.size;
    if (this.destroyed || free <= 0) return;
    const { current, frameCount } = this;
    // Coarse to fine inside the window: the frames right at the scroll position, then every 16th, 8th, ...
    // A fast scroll moves on before consecutive frames would be ready, so this keeps a decoded frame within
    // a few frames of wherever it lands, instead of a run of frames it has already passed.
    const wanted = downloadOrder(
      framePriority(current, frameCount, ...this.window(), this.direction).filter(
        (i) => this.blobs.has(i) && !this.bitmaps.has(i) && !this.decoding.has(i),
      ),
      current,
      frameCount,
      this.direction,
      2,
    );
    // While the current frame is still downloading, decode the closest one that has arrived.
    if (!this.blobs.has(current)) {
      const arrived = nearestKey(this.blobs, current, frameCount);
      const shown = nearestKey(this.bitmaps, current, frameCount);
      const closer =
        arrived !== undefined &&
        (shown === undefined || Math.abs(arrived - current) < Math.abs(shown - current));
      if (closer && !this.decoding.has(arrived) && !wanted.includes(arrived))
        wanted.unshift(arrived);
    }
    for (const index of wanted.slice(0, free)) {
      const blob = this.blobs.get(index);
      if (!blob) continue;
      this.decoding.add(index);
      this.decode(blob)
        .then((bitmap) => {
          const shown = nearestKey(this.bitmaps, this.current, frameCount);
          const [keepAhead, keepBehind] = this.keepWindow();
          const inWindow = index <= this.current + keepAhead && index >= this.current - keepBehind;
          const closest =
            shown === undefined || Math.abs(index - this.current) < Math.abs(shown - this.current);
          if (this.destroyed || (!inWindow && !closest)) {
            bitmap.close();
            return;
          }
          this.bitmaps.set(index, bitmap);
          this.onReady(index);
        })
        .catch(() => {
          // Undecodable bytes won't decode on a second try: drop them and don't fetch the frame
          // again. The nearest decoded frame keeps showing.
          this.blobs.delete(index);
          this.failed.add(index);
        })
        .finally(() => {
          this.decoding.delete(index);
          this.pumpDecodes();
        });
    }
  }

  destroy(): void {
    this.destroyed = true;
    for (const ctrl of this.downloading.values()) ctrl.abort();
    this.downloading.clear();
    for (const b of this.bitmaps.values()) b.close();
    this.bitmaps.clear();
    this.blobs.clear();
  }
}

/** Key in `map` closest to `index` (ties go to the lower index). */
function nearestKey(
  map: Map<number, unknown>,
  index: number,
  frameCount: number,
): number | undefined {
  if (map.has(index)) return index;
  for (let d = 1; d < frameCount; d++) {
    if (map.has(index - d)) return index - d;
    if (map.has(index + d)) return index + d;
  }
  return undefined;
}
