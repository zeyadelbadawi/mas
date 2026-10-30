import { evictable, framePriority } from "./frame-math";

type Loader = (index: number, signal: AbortSignal) => Promise<ImageBitmap>;

/**
 * Keeps decoded frames near the current scroll position in memory.
 * Requests the current frame first, then neighbours; cancels requests that fall out of the window.
 */
export class FrameCache {
  private bitmaps = new Map<number, ImageBitmap>();
  private inflight = new Map<number, AbortController>();
  private readonly maxConcurrent: number;
  private readonly ahead: number;
  private readonly behind: number;
  private queue: number[] = [];
  private onReady: (index: number) => void;

  constructor(
    private readonly frameCount: number,
    private readonly load: Loader,
    options: {
      maxConcurrent?: number;
      /** Frames to fetch ahead of / behind the current one. Size these to a memory budget (decoded RGBA). */
      ahead?: number;
      behind?: number;
      onReady: (index: number) => void;
    },
  ) {
    this.maxConcurrent = options.maxConcurrent ?? 6;
    this.ahead = options.ahead ?? 24;
    this.behind = options.behind ?? 8;
    this.onReady = options.onReady;
  }

  get(index: number): ImageBitmap | undefined {
    return this.bitmaps.get(index);
  }

  /** Nearest already-decoded frame, so fast scrolling never shows a blank canvas. */
  nearest(index: number): ImageBitmap | undefined {
    for (let d = 0; d < this.frameCount; d++) {
      const a = this.bitmaps.get(index - d);
      if (a) return a;
      const b = this.bitmaps.get(index + d);
      if (b) return b;
    }
    return undefined;
  }

  prioritise(current: number, direction: 1 | -1): void {
    const { ahead, behind } = this;
    const wanted = framePriority(current, this.frameCount, ahead, behind, direction);
    const wantedSet = new Set(wanted);
    for (const [i, ctrl] of this.inflight) {
      if (!wantedSet.has(i)) {
        ctrl.abort();
        this.inflight.delete(i);
      }
    }
    // A little slack past the window so small back-and-forth scrolls don't re-decode frames.
    const slack = Math.ceil((ahead + behind) / 4);
    for (const i of evictable(this.bitmaps.keys(), current, ahead + slack, behind + slack)) {
      this.bitmaps.get(i)?.close();
      this.bitmaps.delete(i);
    }
    this.queue = wanted.filter((i) => !this.bitmaps.has(i) && !this.inflight.has(i));
    this.pump();
  }

  private pump(): void {
    while (this.inflight.size < this.maxConcurrent && this.queue.length > 0) {
      const index = this.queue.shift();
      if (index === undefined) break;
      const ctrl = new AbortController();
      this.inflight.set(index, ctrl);
      this.load(index, ctrl.signal)
        .then((bitmap) => {
          if (ctrl.signal.aborted) {
            bitmap.close();
            return;
          }
          this.bitmaps.set(index, bitmap);
          this.onReady(index);
        })
        .catch(() => {
          /* aborted or failed: the nearest cached frame keeps showing */
        })
        .finally(() => {
          this.inflight.delete(index);
          this.pump();
        });
    }
  }

  destroy(): void {
    for (const ctrl of this.inflight.values()) ctrl.abort();
    this.inflight.clear();
    for (const b of this.bitmaps.values()) b.close();
    this.bitmaps.clear();
    this.queue = [];
  }
}
