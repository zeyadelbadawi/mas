import "server-only";

/**
 * Best-effort, per-instance limiter (serverless instances don't share memory).
 * Turnstile is the real gate; this only slows a burst hitting one warm instance.
 */
const hits = new Map<string, number[]>();

export function rateLimited(
  key: string,
  limit = 5,
  windowMs = 10 * 60_000,
  now = Date.now(),
): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}
