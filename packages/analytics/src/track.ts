/** Events from architecture §10. GA4 receives them only after analytics consent. */
export type AnalyticsEvent =
  | "reservation_start"
  | "reservation_step"
  | "reservation_submit_success"
  | "reservation_submit_error"
  | "feedback_submit"
  | "inquiry_submit"
  | "menu_category_view"
  | "menu_search"
  | "sequence_complete"
  | "cta_click"
  | "brand_portal_click"
  | "language_switch"
  | "phone_click"
  | "whatsapp_click"
  | "map_click";

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

/** Fire-and-forget. A no-op until GA4 has loaded, i.e. until the visitor allows analytics. */
export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
}
