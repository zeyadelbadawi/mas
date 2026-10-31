"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@mas/analytics";
import type { Location } from "@mas/content";
import { formatDate, formatTime, type Locale } from "@mas/i18n";
import { Button, ChoiceCard, Field, Input, Select, Textarea } from "@mas/ui";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { displayPhone } from "../phone";
import {
  eventTypes,
  guestRange,
  reservationRuleIssues,
  reservationSchema,
  reservationTypes,
  seatings,
  type Reservation,
  type ReservationInput,
  type ReservationType,
} from "../schemas";
import { timeSlots } from "../slots";
import { addDays, cairoNow } from "../time";
import {
  ConsentField,
  FormAlert,
  Honeypot,
  SuccessPanel,
  TurnstileField,
  useErrorText,
  useFormSubmit,
} from "./shared";

export type ReservationFormProps = {
  location: Location;
  privacyHref: string;
  turnstileSiteKey?: string | undefined;
  turnstileTheme?: "light" | "dark" | "auto" | undefined;
  defaultType?: ReservationType;
  /** Set when booking from an event card. */
  eventId?: string;
  /** That event's name, shown in the review step. */
  eventTitle?: string;
  /** Prefill from an event card: its date (YYYY-MM-DD) and start time (HH:MM). */
  defaults?: { date?: string; time?: string };
};

const STEPS = ["what", "details", "review"] as const;
const STEP_FIELDS = [
  ["type", "date", "time", "guests", "seating", "occasionDetails"],
  ["fullName", "phone", "email", "notes"],
  ["consent"],
] as const satisfies readonly (readonly (keyof ReservationInput)[])[];

function stepOf(errors: FieldErrors<ReservationInput>): number {
  const index = STEP_FIELDS.findIndex((fields) => fields.some((f) => errors[f]));
  return index === -1 ? 2 : index;
}

export function ReservationForm({
  location,
  privacyHref,
  turnstileSiteKey,
  turnstileTheme,
  defaultType = "table",
  eventId,
  eventTitle,
  defaults,
}: ReservationFormProps) {
  const t = useTranslations("forms");
  const locale = useLocale() as Locale;
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [today] = useState(() => cairoNow().date);

  const schema = useMemo(() => reservationSchema({ location }), [location]);
  const form = useForm<ReservationInput, unknown, Reservation>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      type: defaultType,
      date: defaults?.date ?? "",
      time: defaults?.time ?? "",
      guests: 2,
      seating: "any",
      fullName: "",
      phone: "",
      email: "",
      occasionDetails: "",
      notes: "",
      locale,
      ...(eventId ? { eventId } : {}),
    },
  });
  const { register, control, trigger, getValues, setError, setValue, handleSubmit, formState } =
    form;
  const errors = formState.errors;
  const type = useWatch({ control, name: "type" }) ?? "table";
  const date = useWatch({ control, name: "date" });
  const guests = Number(useWatch({ control, name: "guests" }) ?? 0);
  const isEvent = eventTypes.includes(type);
  const range = guestRange(type, location);
  const slots = useMemo(() => (date ? timeSlots(location, date) : []), [date, location]);
  const errorText = useErrorText({ location, type });
  const err = (field: keyof ReservationInput) => errorText(field, errors[field]?.message);
  const { send, state, setToken, honeypotRef, turnstileRef } = useFormSubmit<ReservationInput>(
    "reservation",
    setError,
  );

  // A date change can remove the chosen time.
  useEffect(() => {
    const time = getValues("time");
    if (time && !slots.includes(time)) setValue("time", "");
  }, [slots, getValues, setValue]);

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  async function next() {
    const fields = [...STEP_FIELDS[step]!];
    const valid = await trigger(fields);
    // Take the visitor to the first field that needs attention, in the order the step shows them.
    const focusFirstError = () => {
      const first = fields.find((f) => form.getFieldState(f).invalid);
      if (first) form.setFocus(first);
    };
    if (step === 0 && valid) {
      const v = getValues();
      const issues = reservationRuleIssues(
        { type: v.type, date: v.date, time: v.time, guests: Number(v.guests) },
        location,
      );
      for (const issue of issues)
        setError(issue.path[0] as keyof ReservationInput, { type: "rule", message: issue.message });
      if (issues.length) {
        focusFirstError();
        return;
      }
    }
    if (!valid) {
      focusFirstError();
      return;
    }
    if (step === 0) track("reservation_start", { type: getValues("type") });
    track("reservation_step", { step: step + 2 });
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  const onSubmit = handleSubmit(
    async (data) => {
      const ok = await send(data);
      track(ok ? "reservation_submit_success" : "reservation_submit_error", {
        type: data.type,
        guests: data.guests,
      });
      if (!ok) setStep(stepOf(form.formState.errors));
    },
    (invalid) => setStep(stepOf(invalid)),
  );

  if (state.status === "sent") {
    return (
      <SuccessPanel title={t("reservation.successTitle")}>
        <p className="text-fg">{t("reservation.successBody", { reference: state.reference })}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <a href={`tel:${location.phone}`}>{t("reservation.callUs")}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href={`https://wa.me/${location.whatsapp}`} target="_blank" rel="noopener">
              {t("reservation.whatsapp")}
            </a>
          </Button>
        </div>
      </SuccessPanel>
    );
  }

  const values = getValues();
  const availableTypes = reservationTypes.filter(
    (rt) => rt !== "shisha" || location.areas.includes("shisha"),
  );
  const availableSeatings = seatings.filter((s) => s === "any" || location.areas.includes(s));

  return (
    <form
      data-clarity-mask="true"
      noValidate
      onSubmit={onSubmit}
      className="relative flex flex-col gap-8"
      aria-labelledby="reservation-step-title"
    >
      <Honeypot inputRef={honeypotRef} />

      <div className="flex flex-col gap-2">
        <p className="text-muted text-sm">
          {t("stepOf", { current: step + 1, total: STEPS.length })}
        </p>
        <h3
          id="reservation-step-title"
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-fg text-2xl outline-none"
        >
          {t(`reservation.steps.${STEPS[step]!}`)}
        </h3>
        <ol className="flex gap-2" aria-hidden="true">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`}
            />
          ))}
        </ol>
      </div>

      {state.status === "error" ? <FormAlert>{state.message}</FormAlert> : null}
      {state.status === "invalid" ? <FormAlert>{t("checkFields")}</FormAlert> : null}

      {step === 0 ? (
        <div className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="text-fg mb-3 text-sm font-medium">{t("reservation.type")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {availableTypes.map((rt) => (
                <ChoiceCard
                  key={rt}
                  id={`type-${rt}`}
                  value={rt}
                  title={t(`reservation.types.${rt}`)}
                  description={t(`reservation.typeHints.${rt}`)}
                  {...register("type")}
                />
              ))}
            </div>
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="date" label={t("reservation.date")} error={err("date")} required>
              {(a11y) => (
                <Input
                  type="date"
                  min={today}
                  max={addDays(today, location.bookingWindowDays)}
                  {...a11y}
                  {...register("date")}
                />
              )}
            </Field>
            <Field
              id="time"
              label={t("reservation.time")}
              error={date ? err("time") : undefined}
              hint={date && slots.length === 0 ? t("reservation.noTimes") : undefined}
              required
            >
              {(a11y) => (
                <Select disabled={!date || slots.length === 0} {...a11y} {...register("time")}>
                  <option value="">—</option>
                  {slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatTime(slot, locale)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="guests"
              label={t("reservation.guests")}
              error={err("guests")}
              hint={
                !isEvent && guests > location.maxTableGuests
                  ? t("reservation.bigGroup", { max: location.maxTableGuests })
                  : undefined
              }
              required
            >
              {(a11y) => (
                <Input
                  type="number"
                  inputMode="numeric"
                  min={range.min}
                  max={range.max}
                  step={1}
                  {...a11y}
                  {...register("guests")}
                />
              )}
            </Field>
            {availableSeatings.length > 1 ? (
              <Field id="seating" label={t("reservation.seating")} error={err("seating")} required>
                {(a11y) => (
                  <Select {...a11y} {...register("seating")}>
                    {availableSeatings.map((s) => (
                      <option key={s} value={s}>
                        {t(`reservation.seatings.${s}`)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            ) : null}
          </div>

          {isEvent ? (
            <Field
              id="occasionDetails"
              label={t("reservation.occasion")}
              hint={t("reservation.occasionHint")}
              error={err("occasionDetails")}
              optionalLabel={t("optional")}
            >
              {(a11y) => <Textarea {...a11y} {...register("occasionDetails")} />}
            </Field>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="flex flex-col gap-6">
          <Field id="fullName" label={t("reservation.fullName")} error={err("fullName")} required>
            {(a11y) => <Input autoComplete="name" {...a11y} {...register("fullName")} />}
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="phone" label={t("reservation.phone")} error={err("phone")} required>
              {(a11y) => (
                <Input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                  {...a11y}
                  {...register("phone")}
                />
              )}
            </Field>
            <Field
              id="email"
              label={t("reservation.email")}
              hint={t("reservation.emailHint")}
              error={err("email")}
              required
            >
              {(a11y) => (
                <Input
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  {...a11y}
                  {...register("email")}
                />
              )}
            </Field>
          </div>
          <Field
            id="notes"
            label={t("reservation.notes")}
            hint={t("reservation.notesHint")}
            error={err("notes")}
            optionalLabel={t("optional")}
          >
            {(a11y) => <Textarea {...a11y} {...register("notes")} />}
          </Field>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-6">
          <dl className="rounded-card border-line bg-surface grid gap-x-6 gap-y-3 border p-5 text-sm sm:grid-cols-[auto_1fr]">
            {eventTitle ? <SummaryRow label={t("reservation.event")} value={eventTitle} /> : null}
            <SummaryRow
              label={t("reservation.type")}
              value={t(`reservation.types.${values.type}`)}
            />
            <SummaryRow
              label={t("reservation.date")}
              value={
                values.date
                  ? formatDate(new Date(`${values.date}T12:00:00Z`), locale, {
                      weekday: "long",
                      month: "long",
                    })
                  : ""
              }
            />
            <SummaryRow
              label={t("reservation.time")}
              value={values.time ? formatTime(values.time, locale) : ""}
            />
            <SummaryRow
              label={t("reservation.guests")}
              value={t("reservation.guestsCount", { count: Number(values.guests) })}
            />
            <SummaryRow
              label={t("reservation.seating")}
              value={t(`reservation.seatings.${values.seating}`)}
            />
            {values.occasionDetails ? (
              <SummaryRow label={t("reservation.occasion")} value={values.occasionDetails} />
            ) : null}
            <SummaryRow label={t("reservation.fullName")} value={values.fullName} />
            <SummaryRow
              label={t("reservation.phone")}
              value={<span dir="ltr">{displayPhone(values.phone)}</span>}
            />
            <SummaryRow
              label={t("reservation.email")}
              value={<span dir="ltr">{values.email}</span>}
            />
            {values.notes ? (
              <SummaryRow label={t("reservation.notes")} value={values.notes} />
            ) : null}
          </dl>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="link" onClick={() => setStep(0)}>
              {t("edit")} · {t("reservation.steps.what")}
            </Button>
            <Button type="button" variant="link" onClick={() => setStep(1)}>
              {t("edit")} · {t("reservation.steps.details")}
            </Button>
          </div>
          <ConsentField
            registration={register("consent")}
            error={err("consent")}
            privacyHref={privacyHref}
          />
        </div>
      ) : null}

      <TurnstileField
        siteKey={turnstileSiteKey}
        instanceRef={turnstileRef}
        onToken={setToken}
        theme={turnstileTheme}
      />

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
            {t("back")}
          </Button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            {t("next")}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={state.status === "sending"}
            aria-busy={state.status === "sending"}
          >
            {state.status === "sending" ? t("sending") : t("submit")}
          </Button>
        )}
      </div>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-fg font-medium">{value}</dd>
    </>
  );
}
