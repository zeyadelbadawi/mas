"use client";

import type { ConsentLabels } from "../consent-labels";
import { Button, Checkbox } from "@mas/ui";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
// Brings in the Window typings for gtag/clarity.
import type {} from "../track";
import {
  ALL,
  NONE,
  parseConsent,
  serializeConsent,
  trackingCookieNames,
  type Consent,
} from "../consent";

/* ------------------------------------------------------------------ cookie store */

const listeners = new Set<() => void>();
const NO_CHOICE = "none";
const SERVER = "server";

/** Snapshot is a primitive so unrelated cookie changes (e.g. _ga) don't re-render or re-run loaders. */
function snapshot(): string {
  const consent = parseConsent(document.cookie);
  return consent ? `a${consent.analytics ? 1 : 0}r${consent.recordings ? 1 : 0}` : NO_CHOICE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function fromSnapshot(value: string): Consent | null | undefined {
  if (value === SERVER) return undefined;
  if (value === NO_CHOICE) return null;
  return { analytics: value[1] === "1", recordings: value[3] === "1" };
}

function writeConsent(consent: Consent) {
  document.cookie = serializeConsent(consent, location.protocol === "https:");
  for (const listener of listeners) listener();
}

/** Removes GA4/Clarity cookies on this host and its parent domains. */
function clearTrackingCookies() {
  const parts = location.hostname.split(".");
  const domains = parts.map((_, i) => parts.slice(i).join(".")).filter((d) => d.includes("."));
  for (const name of trackingCookieNames(document.cookie)) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}`;
  }
}

/* ------------------------------------------------------------------ loaders */

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

/** GA4 in Consent Mode v2 "basic": nothing loads before the visitor allows analytics. */
function loadGa4(id: string) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  // Host-only cookies keep mas.com, covy.mas.com and aroma.mas.com independent.
  window.gtag("config", id, { cookie_domain: location.hostname });
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
}

function loadClarity(id: string) {
  if (!window.clarity) {
    const clarity: NonNullable<Window["clarity"]> = function () {
      // eslint-disable-next-line prefer-rest-params
      (clarity.q = clarity.q ?? []).push(arguments);
    };
    window.clarity = clarity;
    loadScript(`https://www.clarity.ms/tag/${encodeURIComponent(id)}`);
  }
  window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
}

/* ------------------------------------------------------------------ context */

type ConsentContextValue = {
  /** undefined while server rendering, null before the visitor chooses. */
  consent: Consent | null | undefined;
  save: (consent: Consent) => void;
  openPreferences: () => void;
  labels: ConsentLabels;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent(): ConsentContextValue {
  const value = use(ConsentContext);
  if (!value) throw new Error("useConsent must be used inside <ConsentProvider>");
  return value;
}

type ConsentProviderProps = {
  ga4Id?: string | undefined;
  clarityId?: string | undefined;
  privacyHref: string;
  /** From getConsentLabels() on the server. */
  labels: ConsentLabels;
  children: ReactNode;
};

/** Holds the cookie choice, loads GA4/Clarity only when allowed, and renders the banner. */
export function ConsentProvider({
  ga4Id,
  clarityId,
  privacyHref,
  labels,
  children,
}: ConsentProviderProps) {
  const consent = fromSnapshot(useSyncExternalStore(subscribe, snapshot, () => SERVER));
  const [panel, setPanel] = useState<"closed" | "preferences">("closed");

  useEffect(() => {
    if (consent?.analytics && ga4Id) loadGa4(ga4Id);
  }, [consent?.analytics, ga4Id]);

  useEffect(() => {
    if (consent?.recordings && clarityId) loadClarity(clarityId);
  }, [consent?.recordings, clarityId]);

  const save = useCallback(
    (next: Consent) => {
      const withdrawn =
        (consent?.analytics && !next.analytics) || (consent?.recordings && !next.recordings);
      writeConsent(next);
      setPanel("closed");
      if (withdrawn) {
        window.gtag?.("consent", "update", {
          analytics_storage: next.analytics ? "granted" : "denied",
        });
        window.clarity?.("consentv2", {
          ad_Storage: "denied",
          analytics_Storage: next.recordings ? "granted" : "denied",
        });
        clearTrackingCookies();
        // Already-loaded scripts can't be unloaded; a reload starts clean with the new choice.
        location.reload();
      }
    },
    [consent],
  );

  const openPreferences = useCallback(() => setPanel("preferences"), []);
  // Server render (consent undefined) includes the banner so it paints with the page; the boot
  // script in <head> hides it before first paint when a choice is already stored.
  const showBanner = consent === null || consent === undefined || panel === "preferences";

  return (
    <ConsentContext value={{ consent, save, openPreferences, labels }}>
      {children}
      {showBanner ? (
        <CookieBanner
          key={panel}
          initialView={panel === "preferences" ? "preferences" : "summary"}
          current={consent ?? NONE}
          privacyHref={privacyHref}
          onSave={save}
          onClose={consent ? () => setPanel("closed") : undefined}
          showRecordings={Boolean(clarityId) || !ga4Id}
          pending={consent === undefined}
          labels={labels}
        />
      ) : null}
    </ConsentContext>
  );
}

/* ------------------------------------------------------------------ banner */

type CookieBannerProps = {
  initialView: "summary" | "preferences";
  current: Consent;
  privacyHref: string;
  onSave: (consent: Consent) => void;
  onClose: (() => void) | undefined;
  showRecordings: boolean;
  /** Rendered before the cookie could be read (server HTML); CSS hides it if a choice exists. */
  pending: boolean;
  labels: ConsentLabels;
};

function CookieBanner({
  initialView,
  current,
  privacyHref,
  onSave,
  onClose,
  showRecordings,
  pending,
  labels: t,
}: CookieBannerProps) {
  const [view, setView] = useState(initialView);
  const [draft, setDraft] = useState<Consent>(current);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Opened on purpose (footer link or "Preferences"): move focus into the panel.
  useEffect(() => {
    if (view === "preferences") headingRef.current?.focus();
  }, [view]);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <section
      aria-labelledby="consent-title"
      {...(pending ? { "data-consent-pending": "" } : {})}
      className="rounded-card border-line bg-surface text-fg fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl border p-5 shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          id="consent-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold outline-none"
        >
          {t.title}
        </h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-control text-muted hover:text-fg -m-2 p-2"
            aria-label={t.close}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
      <p className="text-muted mt-2 text-sm leading-relaxed">
        {t.body}{" "}
        <a href={privacyHref} className="text-fg hover:text-accent underline underline-offset-2">
          {t.readPolicy}
        </a>
      </p>

      {view === "preferences" ? (
        <div className="mt-4 flex flex-col gap-3">
          <Toggle
            id="consent-necessary"
            label={t.necessary}
            hint={t.necessaryHint}
            checked
            disabled
          />
          <Toggle
            id="consent-analytics"
            label={t.analytics}
            hint={t.analyticsHint}
            checked={draft.analytics}
            onChange={(analytics) => setDraft((d) => ({ ...d, analytics }))}
          />
          {showRecordings ? (
            <Toggle
              id="consent-recordings"
              label={t.recordings}
              hint={t.recordingsHint}
              checked={draft.recordings}
              onChange={(recordings) => setDraft((d) => ({ ...d, recordings }))}
            />
          ) : null}
        </div>
      ) : null}

      {/* Reject and accept carry the same weight. */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
        {view === "preferences" ? (
          <Button
            size="sm"
            variant="secondary"
            className="col-span-2 sm:order-first"
            onClick={() => onSave(draft)}
          >
            {t.save}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="col-span-2 sm:order-first sm:me-auto"
            onClick={() => setView("preferences")}
          >
            {t.preferences}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => onSave(NONE)}>
          {t.rejectAll}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onSave(ALL)}>
          {t.acceptAll}
        </Button>
      </div>
    </section>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-control border-line flex items-start gap-3 border p-3">
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        aria-describedby={`${id}-hint`}
        onChange={(e) => onChange?.(e.currentTarget.checked)}
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <p id={`${id}-hint`} className="text-muted text-xs">
          {hint}
        </p>
      </div>
    </div>
  );
}

/** Footer link that reopens the preferences panel. */
export function CookieSettingsButton({ className }: { className?: string }) {
  const { openPreferences, labels } = useConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={className ?? "hover:text-fg underline-offset-2 hover:underline"}
    >
      {labels.cookieSettings}
    </button>
  );
}
