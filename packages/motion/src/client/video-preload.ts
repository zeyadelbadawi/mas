import type { VideoPrefetch, VideoPrefetchMap } from "../video-prefetch";

/**
 * Downloads scroll videos whole, one at a time in page order, and reports progress (for a splash screen).
 * A fully downloaded video plays from a blob: URL, so every seek is answered from memory, never the network.
 */

export type PreloadState = {
  loaded: number;
  total: number;
  done: boolean;
  url?: string;
  error?: boolean;
};

type Job = { id: string; src?: string; bytes: number };

const states = new Map<string, PreloadState>();
const listeners = new Set<() => void>();
const queue: Job[] = [];
let active: { id: string; abort: AbortController } | null = null;
/** Downloads adopted from the page's inline script, followed in parallel with the queue. */
const following = new Map<string, AbortController>();

const emit = () => listeners.forEach((fn) => fn());

/** Subscribe to progress changes; returns the unsubscribe function. */
export function subscribePreload(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function preloadState(id: string): PreloadState | undefined {
  return states.get(id);
}

/** Combined progress (0..1) of the given videos, by bytes; ids not known yet count as not started. */
export function preloadProgress(ids: readonly string[]): { progress: number; done: boolean } {
  let loaded = 0;
  let total = 0;
  let done = ids.length > 0;
  for (const id of ids) {
    const s = states.get(id);
    if (!s?.total) {
      done = false;
      continue;
    }
    loaded += s.loaded;
    total += s.total;
    done &&= s.done;
  }
  return { progress: total > 0 ? Math.min(1, loaded / total) : 0, done };
}

/**
 * Bytes downloaded so far for these videos, and their combined size; `total` is 0 until every one of them
 * knows its size. Lets a splash measure the line's real speed (navigator.connection only estimates it).
 */
export function preloadBytes(ids: readonly string[]): { loaded: number; total: number } {
  let loaded = 0;
  let total = 0;
  let known = ids.length > 0;
  for (const id of ids) {
    const s = states.get(id);
    if (!s?.total) known = false;
    loaded += s?.loaded ?? 0;
    total += s?.total ?? 0;
  }
  return { loaded, total: known ? total : 0 };
}

/** Takes over a download the page's inline script already started (videoPrefetchScript), if there is one. */
function adoptPrefetch(src: string): VideoPrefetch | undefined {
  const map = (globalThis as { __masVideoPrefetch?: VideoPrefetchMap }).__masVideoPrefetch;
  const pre = map?.[src];
  if (pre && map) delete map[src];
  return pre;
}

/** Follows an adopted download to its end, reporting its progress as this video's. */
function followPrefetch(
  job: Job & { src: string },
  pre: VideoPrefetch,
  signal: AbortSignal,
): Promise<boolean> {
  const fallback = job.bytes || 1;
  return new Promise((resolve) => {
    const finish = (ok: boolean) => {
      pre.on = null;
      resolve(ok);
    };
    const tick = () => {
      if (pre.done) {
        finish(!pre.error);
        return;
      }
      states.set(job.id, { loaded: pre.loaded, total: pre.total || fallback, done: false });
      emit();
    };
    signal.addEventListener(
      "abort",
      () => {
        // Stop the network transfer too, not just the progress reports.
        pre.abort?.();
        finish(false);
      },
      { once: true },
    );
    pre.on = tick;
    tick();
  });
}

async function download(job: Job & { src: string }, signal: AbortSignal): Promise<void> {
  const fallback = job.bytes || 1;
  const pre = adoptPrefetch(job.src);
  if (pre) {
    const ok = await followPrefetch(job, pre, signal);
    if (ok) {
      const url = URL.createObjectURL(new Blob(pre.chunks as BlobPart[], { type: "video/mp4" }));
      const total = pre.total || pre.loaded;
      states.set(job.id, { loaded: total, total, done: true, url });
      emit();
      return;
    }
    // Aborted (the visitor reached the section first) or failed: same as a failed download below.
    if (signal.aborted) {
      states.set(job.id, { loaded: fallback, total: fallback, done: true, error: true });
      emit();
      return;
    }
  }
  try {
    const res = await fetch(job.src, { signal });
    if (!res.ok || !res.body) throw new Error(`${job.src}: ${res.status}`);
    const total = Number(res.headers.get("content-length")) || fallback;
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      states.set(job.id, { loaded, total, done: false });
      emit();
    }
    const url = URL.createObjectURL(new Blob(chunks as BlobPart[], { type: "video/mp4" }));
    states.set(job.id, { loaded: total, total, done: true, url });
  } catch {
    // Failed or given up (the player streams the file directly instead).
    states.set(job.id, { loaded: fallback, total: fallback, done: true, error: true });
  }
  emit();
}

async function pump(): Promise<void> {
  // Strictly in page order: wait for the first queued video to know its file before starting the next.
  const head = queue[0];
  if (active || !head?.src) return;
  queue.shift();
  active = { id: head.id, abort: new AbortController() };
  await download(head as Job & { src: string }, active.abort.signal);
  active = null;
  void pump();
}

/** Hold a place in the download queue, in the order sections mount. `first` jumps the queue. */
export function reservePreload(id: string, first = false): void {
  if (states.has(id)) return;
  states.set(id, { loaded: 0, total: 0, done: false });
  if (first) queue.unshift({ id, bytes: 0 });
  else queue.push({ id, bytes: 0 });
}

/** Give a reserved video its file and size; downloads start in queue order. */
export function startPreload(id: string, src: string, bytes: number): void {
  if (!states.has(id)) reservePreload(id);
  const job = queue.find((j) => j.id === id);
  if (!job) return;
  job.src = src;
  job.bytes = bytes;
  states.set(id, { loaded: 0, total: bytes || 1, done: false });
  // Already downloading since the page was parsed: follow it now, alongside the queue, so its progress (and
  // the line's speed) shows from the start instead of when its turn in the queue comes.
  const pre = adoptPrefetch(src);
  if (pre) {
    queue.splice(queue.indexOf(job), 1);
    const abort = new AbortController();
    following.set(id, abort);
    void followPrefetch(job as Job & { src: string }, pre, abort.signal).then((ok) => {
      following.delete(id);
      if (abort.signal.aborted) return;
      if (ok) {
        const url = URL.createObjectURL(new Blob(pre.chunks as BlobPart[], { type: "video/mp4" }));
        const total = pre.total || pre.loaded;
        states.set(id, { loaded: total, total, done: true, url });
      } else {
        states.set(id, { loaded: bytes || 1, total: bytes || 1, done: true, error: true });
      }
      emit();
    });
  }
  emit();
  void pump();
}

/**
 * Stop waiting for a video: drop it from the queue, or cancel its download, and let the next one start. Used
 * when its manifest can't be read, and when the visitor reaches the section first (the player streams it).
 */
export function abandonPreload(id: string): void {
  const i = queue.findIndex((j) => j.id === id);
  if (i >= 0) queue.splice(i, 1);
  if (active?.id === id) active.abort.abort();
  following.get(id)?.abort();
  const s = states.get(id);
  if (!s?.done)
    states.set(id, { loaded: s?.total || 1, total: s?.total || 1, done: true, error: true });
  emit();
  void pump();
}

/**
 * Give up on every video (the line is too slow to load them in reasonable time): cancel all downloads,
 * including the ones the page's inline script started, and mark them finished without a file.
 */
export function abandonAllPreloads(): void {
  queue.length = 0;
  active?.abort.abort();
  following.forEach((abort) => abort.abort());
  following.clear();
  const map = (globalThis as { __masVideoPrefetch?: VideoPrefetchMap }).__masVideoPrefetch;
  if (map) for (const key of Object.keys(map)) map[key]?.abort?.();
  states.forEach((s, id) => {
    if (!s.done)
      states.set(id, { loaded: s.total || 1, total: s.total || 1, done: true, error: true });
  });
  emit();
}
