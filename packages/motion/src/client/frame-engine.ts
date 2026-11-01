import type { VideoDecodeIndex } from "../manifest";

/**
 * Decodes a scroll video's frames with WebCodecs and draws them into a canvas (D62). The browser's own seek
 * pipeline answers one frame at a time, 15-20 times a second at best (and about 400 ms per seek on Android);
 * a decoder that is fed directly keeps going without a flush between frames, several times faster.
 *
 * - Frames are cut straight out of the downloaded MP4 with the manifest's frame index: no parser.
 * - Moving forward, the decoder simply continues. A far jump starts again at the keyframe before the target
 *   (at most a GOP of extra decodes). Moving back, whole GOPs are decoded and kept.
 * - A ring of recent frames is kept as compact copies in memory (YUV, about 3 MB each at 1080p), never as the
 *   decoder's own frames, which must be closed at once or the decoder stalls (WebCodecs spec).
 * - What is drawn only ever moves from the frame on screen toward the target, never past it, so a frame that
 *   arrives late can't make the picture step back.
 */

const MAX_QUEUE = 4;
/** No output for this long while frames are in flight: the decoder is holding them, flush it out. */
const STALL_MS = 120;

export type FrameEngineStats = {
  /** Frames decoded so far. */
  decoded: number;
  /** Frames drawn into the canvas. */
  drawn: number;
  /** Frames kept in the ring now, and their size in bytes. */
  kept: number;
  keptBytes: number;
  /** Times the decoder had to be flushed or reopened. */
  flushes: number;
  errors: number;
  /** Main-thread time spent drawing and copying frames out of the decoder (ms, totals). */
  drawMs: number;
  copyMs: number;
};

type Kept = VideoFrame | ImageBitmap;

function config(index: VideoDecodeIndex, width: number, height: number): VideoDecoderConfig {
  return {
    codec: index.codec,
    codedWidth: width,
    codedHeight: height,
    description: Uint8Array.from(atob(index.description), (c) => c.charCodeAt(0)),
    optimizeForLatency: true,
  };
}

export class FrameEngine {
  readonly stats: FrameEngineStats = {
    decoded: 0,
    drawn: 0,
    kept: 0,
    keptBytes: 0,
    flushes: 0,
    errors: 0,
    drawMs: 0,
    copyMs: 0,
  };
  /** Frame on screen (-1: nothing drawn yet). */
  shown = -1;
  failed = false;
  /** Called after each frame is drawn. */
  onDraw: ((frame: number) => void) | null = null;
  /** Called once if the engine gives up; the player switches to its video element. */
  onFail: (() => void) | null = null;

  private readonly count: number;
  private readonly keySet: Set<number>;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly kept = new Map<number, Kept>();
  private readonly copying = new Set<number>();
  private decoder: VideoDecoder | null = null;
  /** Next sample the decoder can take without a keyframe (-1: it needs a keyframe first). */
  private feedPos = -1;
  /** Frames fed and not yet out, in order. */
  private inflight: number[] = [];
  private target = 0;
  private dir: 1 | -1 = 1;
  private flushing = false;
  private stallTimer = 0;
  /** Bumped whenever the decoder is replaced, so late copies from the old one are dropped. */
  private epoch = 0;
  private errorTimes: number[] = [];
  private closed = false;
  /** The best frame straight from the decoder since the last draw (a second handle, closed once drawn). */
  private fresh: { frame: number; f: VideoFrame } | null = null;
  private drawRaf = 0;

  constructor(
    private readonly data: Uint8Array,
    private readonly index: VideoDecodeIndex,
    private readonly width: number,
    private readonly height: number,
    canvas: HTMLCanvasElement,
    /** Frames kept around the target. */
    private readonly ring = 24,
  ) {
    this.count = index.samples.length;
    this.keySet = new Set(index.keys);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("no 2d context");
    this.ctx = ctx;
  }

  /** Whether this browser can decode the index's codec at this size. */
  static async supports(index: VideoDecodeIndex, width: number, height: number): Promise<boolean> {
    if (
      typeof VideoDecoder !== "function" ||
      typeof EncodedVideoChunk !== "function" ||
      typeof VideoFrame !== "function"
    )
      return false;
    try {
      const res = await VideoDecoder.isConfigSupported(config(index, width, height));
      return Boolean(res.supported);
    } catch {
      return false;
    }
  }

  /** Ask for a frame. The engine walks there: drawing what it has on the way, decoding what it lacks. */
  show(frame: number): void {
    if (this.closed || this.failed) return;
    const t = Math.min(this.count - 1, Math.max(0, Math.round(frame)));
    if (t !== this.target) this.dir = t > this.target ? 1 : -1;
    this.target = t;
    // Called from the page's animation frame: what is already decoded is drawn in this same frame.
    this.drawBest();
    this.pump();
  }

  /** Free the decoder and the ring (the scene is far from the screen). The canvas keeps its picture. */
  release(): void {
    this.closeDecoder();
    this.dropKept();
    this.dropFresh();
  }

  private dropFresh(): void {
    this.fresh?.f.close();
    this.fresh = null;
  }

  close(): void {
    this.closed = true;
    cancelAnimationFrame(this.drawRaf);
    this.release();
  }

  private open(): VideoDecoder {
    this.epoch++;
    const epoch = this.epoch;
    const decoder = new VideoDecoder({
      output: (f) => this.onOutput(f, epoch),
      error: () => this.onError(epoch),
    });
    decoder.configure(config(this.index, this.width, this.height));
    this.decoder = decoder;
    this.feedPos = -1;
    this.inflight = [];
    this.flushing = false;
    return decoder;
  }

  private closeDecoder(): void {
    window.clearTimeout(this.stallTimer);
    if (this.decoder && this.decoder.state !== "closed") {
      try {
        this.decoder.close();
      } catch {
        // Already closed by an error.
      }
    }
    this.decoder = null;
    this.epoch++;
    this.feedPos = -1;
    this.inflight = [];
    this.flushing = false;
  }

  private dropKept(): void {
    this.kept.forEach((f) => f.close());
    this.kept.clear();
    this.stats.kept = 0;
    this.stats.keptBytes = 0;
  }

  private onError(epoch: number): void {
    if (epoch !== this.epoch) return;
    this.stats.errors++;
    const now = performance.now();
    this.errorTimes = [...this.errorTimes.filter((t) => now - t < 10_000), now];
    this.closeDecoder();
    // A decoder taken back by the browser (a hidden tab, a busy GPU) is simply opened again on the next
    // frame asked for. Errors that keep coming mean this browser can't decode the file: give up.
    if (this.errorTimes.length >= 3) this.fail();
    else if (!document.hidden) this.pump();
  }

  private fail(): void {
    if (this.failed) return;
    this.failed = true;
    this.release();
    this.onFail?.();
  }

  private keyBefore(frame: number): number {
    for (let i = frame; i > 0; i--) if (this.keySet.has(i)) return i;
    return 0;
  }

  /** Frames worth keeping: most of the ring ahead of the target in the direction of travel, the rest behind. */
  private inWindow(frame: number): boolean {
    const ahead = Math.ceil((this.ring * 2) / 3);
    const behind = this.ring - ahead;
    const d = (frame - this.target) * this.dir;
    return d >= -behind && d <= ahead;
  }

  /** The next frame to decode: the target first, then ahead in the direction of travel, then behind. */
  private nextMissing(): number {
    const ahead = Math.ceil((this.ring * 2) / 3);
    const behind = this.ring - ahead;
    const need = (f: number) =>
      f >= 0 &&
      f < this.count &&
      !this.kept.has(f) &&
      !this.copying.has(f) &&
      !this.inflight.includes(f) &&
      f !== this.shownUncached();
    if (need(this.target)) return this.target;
    for (let k = 1; k <= ahead; k++)
      if (need(this.target + k * this.dir)) return this.target + k * this.dir;
    for (let k = 1; k <= behind; k++)
      if (need(this.target - k * this.dir)) return this.target - k * this.dir;
    return -1;
  }

  /** The frame on screen counts as had, even when it was drawn straight from the decoder and not kept. */
  private shownUncached(): number {
    return this.shown;
  }

  private pump(): void {
    if (this.closed || this.failed || this.flushing || document.hidden) return;
    const decoder = this.decoder ?? this.open();
    while (decoder.state === "configured" && decoder.decodeQueueSize < MAX_QUEUE) {
      const want = this.nextMissing();
      if (want < 0) break;
      const key = this.keyBefore(want);
      // Continue from where the decoder is when that is no more work than starting at the keyframe.
      const from =
        this.feedPos >= 0 && this.feedPos <= want && this.feedPos >= key ? this.feedPos : key;
      this.feed(decoder, from);
    }
    this.watchStall();
  }

  private feed(decoder: VideoDecoder, frame: number): void {
    const [offset, size] = this.index.samples[frame] ?? [0, 0];
    decoder.decode(
      new EncodedVideoChunk({
        type: this.keySet.has(frame) ? "key" : "delta",
        timestamp: frame,
        data: this.data.subarray(offset, offset + size),
      }),
    );
    this.inflight.push(frame);
    this.feedPos = frame + 1;
  }

  /** Some decoders hold the last frames until more input comes: when nothing more is wanted, flush them out. */
  private watchStall(): void {
    window.clearTimeout(this.stallTimer);
    if (!this.inflight.length) return;
    const epoch = this.epoch;
    this.stallTimer = window.setTimeout(() => {
      const decoder = this.decoder;
      if (epoch !== this.epoch || !decoder || !this.inflight.length || this.flushing) return;
      this.flushing = true;
      this.stats.flushes++;
      decoder
        .flush()
        .catch(() => {})
        .finally(() => {
          if (epoch !== this.epoch) return;
          this.flushing = false;
          // After a flush the decoder needs a keyframe again.
          this.feedPos = -1;
          this.inflight = [];
          this.pump();
        });
    }, STALL_MS);
  }

  private onOutput(f: VideoFrame, epoch: number): void {
    const frame = Math.round(f.timestamp);
    if (epoch !== this.epoch || this.closed) {
      f.close();
      return;
    }
    this.stats.decoded++;
    const at = this.inflight.indexOf(frame);
    if (at >= 0) this.inflight.splice(0, at + 1);
    // Drawn at the next screen refresh, at most one frame per refresh: the best one by then.
    if (this.isBetter(frame) && (!this.fresh || this.closer(frame, this.fresh.frame))) {
      this.dropFresh();
      this.fresh = { frame, f: f.clone() };
      this.scheduleDraw();
    }
    if (this.inWindow(frame) && !this.kept.has(frame) && !this.copying.has(frame))
      this.keep(frame, f, epoch);
    else f.close();
    this.pump();
  }

  /** Copies the frame out of the decoder's memory, then closes it. */
  private keep(frame: number, f: VideoFrame, epoch: number): void {
    this.copying.add(frame);
    const done = (stored: Kept | null, bytes: number) => {
      this.copying.delete(frame);
      if (!stored) return;
      if (epoch !== this.epoch || this.closed || !this.inWindow(frame)) {
        stored.close();
        return;
      }
      this.kept.set(frame, stored);
      this.stats.kept = this.kept.size;
      this.stats.keptBytes += bytes;
      this.evict();
      if (this.isBetter(frame)) this.scheduleDraw();
      this.pump();
    };
    const rect = f.visibleRect;
    if (f.format && rect) {
      const buffer = new Uint8Array(f.allocationSize());
      const format = f.format;
      const colorSpace = (() => {
        try {
          return f.colorSpace.toJSON();
        } catch {
          return undefined;
        }
      })();
      const t = performance.now();
      const copying = f.copyTo(buffer);
      this.stats.copyMs += performance.now() - t;
      copying
        .then((layout) => {
          const copy = new VideoFrame(buffer, {
            format,
            codedWidth: rect.width,
            codedHeight: rect.height,
            timestamp: frame,
            layout,
            ...(colorSpace ? { colorSpace } : {}),
          });
          f.close();
          done(copy, buffer.byteLength);
        })
        .catch(() => {
          f.close();
          done(null, 0);
        });
      return;
    }
    // A frame the browser can't copy out (an opaque format): keep a bitmap of it instead.
    createImageBitmap(f)
      .then((bitmap) => {
        f.close();
        done(bitmap, this.width * this.height * 4);
      })
      .catch(() => {
        f.close();
        done(null, 0);
      });
  }

  private evict(): void {
    if (this.kept.size <= this.ring) return;
    const order = [...this.kept.keys()].sort(
      (a, b) =>
        Number(this.inWindow(a)) - Number(this.inWindow(b)) ||
        Math.abs(b - this.target) - Math.abs(a - this.target),
    );
    for (const frame of order) {
      if (this.kept.size <= this.ring) break;
      const f = this.kept.get(frame);
      if (!f) continue;
      this.stats.keptBytes -=
        f instanceof VideoFrame ? f.allocationSize() : this.width * this.height * 4;
      f.close();
      this.kept.delete(frame);
    }
    this.stats.kept = this.kept.size;
  }

  /** Closer to the target than the frame on screen, and on the way to it (never past it). */
  private isBetter(frame: number): boolean {
    if (this.shown < 0) return true;
    if (frame === this.shown) return false;
    const toTarget = this.target - this.shown;
    const step = frame - this.shown;
    return step * toTarget > 0 && Math.abs(step) <= Math.abs(toTarget);
  }

  /** Nearer the target than `other`. */
  private closer(frame: number, other: number): boolean {
    return Math.abs(frame - this.target) < Math.abs(other - this.target);
  }

  private scheduleDraw(): void {
    if (this.drawRaf || this.closed) return;
    this.drawRaf = requestAnimationFrame(() => {
      this.drawRaf = 0;
      this.drawBest();
    });
  }

  /** One draw per screen refresh: the frame nearest the target on the way to it, kept or fresh. */
  private drawBest(): void {
    if (this.shown === this.target) {
      this.dropFresh();
      return;
    }
    let best = -1;
    for (const frame of this.kept.keys()) {
      if (this.isBetter(frame) && (best < 0 || this.closer(frame, best))) best = frame;
    }
    const fresh = this.fresh;
    if (fresh && this.isBetter(fresh.frame) && (best < 0 || this.closer(fresh.frame, best))) {
      this.draw(fresh.f, fresh.frame);
    } else {
      const f = best >= 0 ? this.kept.get(best) : undefined;
      if (f) this.draw(f, best);
    }
    this.dropFresh();
  }

  private draw(source: CanvasImageSource, frame: number): void {
    const t = performance.now();
    this.ctx.drawImage(source, 0, 0, this.width, this.height);
    this.stats.drawMs += performance.now() - t;
    this.shown = frame;
    this.stats.drawn++;
    this.onDraw?.(frame);
  }
}
