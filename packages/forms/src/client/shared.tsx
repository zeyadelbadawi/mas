"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { Location } from "@mas/content";
import { Checkbox } from "@mas/ui";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { FieldValues, Path, UseFormRegisterReturn, UseFormSetError } from "react-hook-form";
import { guestRange, LIMITS, type FormKind, type ReservationType } from "../schemas";
import type { FormResponse } from "../server/handler";

/** Character limits per field, used to fill {min}/{max} in error messages. */
const MIN: Record<string, number> = {
  fullName: LIMITS.name.min,
  comments: LIMITS.comments.min,
  message: LIMITS.message.min,
};
const MAX: Record<string, number> = {
  fullName: LIMITS.name.max,
  name: LIMITS.name.max,
  notes: LIMITS.notes.max,
  occasionDetails: LIMITS.occasion.max,
  comments: LIMITS.comments.max,
  message: LIMITS.message.max,
  company: LIMITS.short.max,
  city: LIMITS.short.max,
  email: 254,
};

/** Turns a schema issue key (e.g. "tooShort") into a translated sentence for a given field. */
export function useErrorText(context?: {
  location?: Location;
  type?: ReservationType | undefined;
}) {
  const t = useTranslations("forms.errors");
  return (field: string, key: string | undefined): string | undefined => {
    if (!key) return undefined;
    const known = t.has(key) ? key : "required";
    const guests =
      context?.location && context.type
        ? guestRange(context.type, context.location)
        : { min: 1, max: 1 };
    return t(known, {
      min: key === "guests" ? guests.min : (MIN[field] ?? 1),
      max: key === "guests" ? guests.max : (MAX[field] ?? 0),
      days: context?.location?.bookingWindowDays ?? 0,
    });
  };
}

export type SubmitState =
  | { status: "idle" | "sending" | "invalid" }
  | { status: "sent"; reference: string }
  | { status: "error"; message: string };

/**
 * Posts `{ data, turnstileToken, website, startedAt }` to the app's form route and maps the
 * response. Field errors returned by the server are pushed into react-hook-form.
 */
export function useFormSubmit<T extends FieldValues>(kind: FormKind, setError: UseFormSetError<T>) {
  const t = useTranslations("forms.errors");
  const startedAtRef = useRef(0);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [token, setToken] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  /** `data` is the parsed form output; the server validates it again with the same schema. */
  async function send(data: unknown): Promise<boolean> {
    setState({ status: "sending" });
    let body: FormResponse;
    try {
      const res = await fetch(`/api/forms/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          turnstileToken: token,
          website: honeypotRef.current?.value ?? "",
          startedAt: startedAtRef.current,
        }),
      });
      body = (await res.json()) as FormResponse;
    } catch {
      body = { ok: false, error: "generic" };
    }
    // Turnstile tokens are single use.
    turnstileRef.current?.reset();
    setToken("");

    if (body.ok) {
      setState({ status: "sent", reference: body.reference });
      return true;
    }
    if (body.error === "validation") {
      for (const [field, key] of Object.entries(body.fields))
        setError(field as Path<T>, { type: "server", message: key });
      setState({ status: "invalid" });
      return false;
    }
    const key =
      body.error === "verification" || body.error === "rateLimited" ? body.error : "generic";
    setState({ status: "error", message: t(key) });
    return false;
  }

  return { send, state, setState, setToken, honeypotRef, turnstileRef };
}

/** Zero-size field that only bots fill in. Not announced, not focusable. Clipped rather than pushed
 * off-screen, because a negative start offset becomes a huge right overflow in Arabic (RTL). */
export function Honeypot({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }) {
  const t = useTranslations("forms");
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 h-0 w-0 overflow-hidden opacity-0"
    >
      <label>
        {t("honeypot")}
        <input
          ref={inputRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}

/** Cloudflare Turnstile in "interaction-only" mode: invisible unless Cloudflare needs a check. */
export function TurnstileField({
  siteKey,
  instanceRef,
  onToken,
  theme = "auto",
}: {
  siteKey: string | undefined;
  instanceRef: RefObject<TurnstileInstance | null>;
  onToken: (token: string) => void;
  theme?: "light" | "dark" | "auto" | undefined;
}) {
  const locale = useLocale();
  if (!siteKey) return null;
  return (
    <Turnstile
      ref={instanceRef}
      siteKey={siteKey}
      onSuccess={onToken}
      onExpire={() => onToken("")}
      onError={() => onToken("")}
      options={{ theme, language: locale, size: "flexible", appearance: "interaction-only" }}
    />
  );
}

/**
 * Comes into view and takes focus when it appears, so a failed send never sits unseen above the fold or
 * under a fixed header.
 */
export function FormAlert({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }, []);
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="rounded-control border-danger/40 bg-danger/10 text-danger scroll-mt-24 border px-4 py-3 text-sm font-medium outline-none"
    >
      {children}
    </div>
  );
}

export function ConsentField({
  registration,
  error,
  privacyHref,
}: {
  registration: UseFormRegisterReturn;
  error: string | undefined;
  privacyHref: string;
}) {
  const t = useTranslations("forms");
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <Checkbox
          id="consent"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "consent-error" : undefined}
          {...registration}
        />
        <label htmlFor="consent" className="text-fg text-sm leading-relaxed">
          {t.rich("consent", {
            link: (chunks) => (
              <a
                href={privacyHref}
                target="_blank"
                rel="noopener"
                className="hover:text-accent underline underline-offset-2"
              >
                {chunks}
              </a>
            ),
          })}
        </label>
      </div>
      {error ? (
        <p id="consent-error" role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shown in place of the form after a successful send. Focused so screen readers announce it. */
export function SuccessPanel({ title, children }: { title: string; children: ReactNode }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div
      role="status"
      className="rounded-card border-line bg-surface flex flex-col gap-4 border p-6 sm:p-8"
    >
      <h3 ref={headingRef} tabIndex={-1} className="font-display text-fg text-2xl outline-none">
        {title}
      </h3>
      {children}
    </div>
  );
}
