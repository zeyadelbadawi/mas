/** Consent choices, stored in a first-party cookie for 6 months (architecture §10). */
export type Consent = {
  /** GA4 (Consent Mode v2, analytics_storage). */
  analytics: boolean;
  /** Microsoft Clarity heatmaps and session recordings. */
  recordings: boolean;
};

export const CONSENT_COOKIE = "mas_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 182;

export const ALL: Consent = { analytics: true, recordings: true };
export const NONE: Consent = { analytics: false, recordings: false };

/** "v1.a1.r0" → { analytics: true, recordings: false }. Unknown versions count as no choice. */
export function parseConsent(cookieHeader: string): Consent | null {
  const raw = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  const match = raw?.match(/^v(\d+)\.a([01])\.r([01])$/);
  if (!match || Number(match[1]) !== CONSENT_VERSION) return null;
  return { analytics: match[2] === "1", recordings: match[3] === "1" };
}

export function serializeConsent(consent: Consent, secure: boolean): string {
  const value = `v${CONSENT_VERSION}.a${consent.analytics ? 1 : 0}.r${consent.recordings ? 1 : 0}`;
  return `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** Cookies GA4 and Clarity set; removed when consent is withdrawn. */
export function trackingCookieNames(cookieHeader: string): string[] {
  return cookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0] ?? "")
    .filter(
      (name) =>
        name === "_ga" ||
        name.startsWith("_ga_") ||
        name === "_gid" ||
        name === "_clck" ||
        name === "_clsk",
    );
}
