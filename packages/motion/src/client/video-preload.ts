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
let active = false;

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

async function download(job: Job & { src: string }): Promise<void> {
  const fallback = job.bytes || 1;
  try {
    const res = await fetch(job.src);
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
    // The player streams the file directly instead.
    states.set(job.id, { loaded: fallback, total: fallback, done: true, error: true });
  }
  emit();
}

async function pump(): Promise<void> {
  // Strictly in page order: wait for the first queued video to know its file before starting the next.
  const head = queue[0];
  if (active || !head?.src) return;
  queue.shift();
  active = true;
  await download(head as Job & { src: string });
  active = false;
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
  emit();
  void pump();
}
