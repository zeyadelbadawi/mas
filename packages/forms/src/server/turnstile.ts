import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: "missing-secret" | "invalid" | "unreachable" };

/** Server-side verification of the invisible Turnstile token (one-time use, bound to our site key). */
export async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
  secret: string | undefined,
): Promise<TurnstileResult> {
  if (!secret) return { ok: false, reason: "missing-secret" };
  if (!token) return { ok: false, reason: "invalid" };
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success ? { ok: true } : { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
