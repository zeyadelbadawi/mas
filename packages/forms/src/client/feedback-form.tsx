"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@mas/analytics";
import { Button, Checkbox, Field, Input, Textarea } from "@mas/ui";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { feedbackSchema, type Feedback, type FeedbackInput } from "../schemas";
import { cairoNow } from "../time";
import {
  ConsentField,
  FormAlert,
  Honeypot,
  SuccessPanel,
  TurnstileField,
  useErrorText,
  useFormSubmit,
} from "./shared";

export type FeedbackFormProps = {
  privacyHref: string;
  turnstileSiteKey?: string | undefined;
  turnstileTheme?: "light" | "dark" | "auto" | undefined;
};

const RATINGS = ["overall", "food", "service", "ambience"] as const;

export function FeedbackForm({ privacyHref, turnstileSiteKey, turnstileTheme }: FeedbackFormProps) {
  const t = useTranslations("forms");
  const locale = useLocale() as "en" | "ar";
  const [today] = useState(() => cairoNow().date);
  const schema = useMemo(() => feedbackSchema(), []);
  const { register, control, setError, handleSubmit, formState } = useForm<
    FeedbackInput,
    unknown,
    Feedback
  >({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      comments: "",
      visitDate: "",
      contactMe: false,
      name: "",
      email: "",
      phone: "",
      locale,
    },
  });
  const errors = formState.errors;
  const errorText = useErrorText();
  const err = (field: keyof FeedbackInput) => errorText(field, errors[field]?.message);
  const contactMe = useWatch({ control, name: "contactMe" });
  const ratings = useWatch({ control, name: [...RATINGS] });
  const { send, state, setToken, honeypotRef, turnstileRef } = useFormSubmit<FeedbackInput>(
    "feedback",
    setError,
  );

  if (state.status === "sent") {
    return (
      <SuccessPanel title={t("feedback.successTitle")}>
        <p className="text-fg">{t("feedback.successBody")}</p>
      </SuccessPanel>
    );
  }

  return (
    <form
      data-clarity-mask="true"
      noValidate
      onSubmit={handleSubmit(async (data) => {
        if (await send(data)) track("feedback_submit");
      })}
      className="relative flex flex-col gap-6"
    >
      <Honeypot inputRef={honeypotRef} />
      {state.status === "error" ? <FormAlert>{state.message}</FormAlert> : null}
      {state.status === "invalid" ? <FormAlert>{t("checkFields")}</FormAlert> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {RATINGS.map((name, i) => (
          <StarRating
            key={name}
            name={name}
            legend={t(`feedback.${name}`)}
            required={name === "overall"}
            optionalLabel={t("optional")}
            value={Number(ratings[i] ?? 0)}
            registration={register(name)}
            starLabel={(count) => t("feedback.stars", { count })}
            error={err(name)}
          />
        ))}
      </div>

      <Field
        id="visitDate"
        label={t("feedback.visitDate")}
        error={err("visitDate")}
        optionalLabel={t("optional")}
      >
        {(a11y) => <Input type="date" max={today} {...a11y} {...register("visitDate")} />}
      </Field>
      <Field id="comments" label={t("feedback.comments")} error={err("comments")} required>
        {(a11y) => <Textarea rows={5} {...a11y} {...register("comments")} />}
      </Field>

      <div className="flex items-start gap-3">
        <Checkbox id="contactMe" {...register("contactMe")} />
        <label htmlFor="contactMe" className="text-fg text-sm">
          {t("feedback.contactMe")}
        </label>
      </div>
      {contactMe ? (
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            id="name"
            label={t("feedback.name")}
            error={err("name")}
            optionalLabel={t("optional")}
          >
            {(a11y) => <Input autoComplete="name" {...a11y} {...register("name")} />}
          </Field>
          <Field
            id="email"
            label={t("feedback.email")}
            error={err("email")}
            optionalLabel={t("optional")}
          >
            {(a11y) => (
              <Input type="email" autoComplete="email" dir="ltr" {...a11y} {...register("email")} />
            )}
          </Field>
          <Field
            id="phone"
            label={t("feedback.phone")}
            error={err("phone")}
            optionalLabel={t("optional")}
          >
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
        </div>
      ) : null}

      <ConsentField
        registration={register("consent")}
        error={err("consent")}
        privacyHref={privacyHref}
      />
      <TurnstileField
        siteKey={turnstileSiteKey}
        instanceRef={turnstileRef}
        onToken={setToken}
        theme={turnstileTheme}
      />

      <div>
        <Button
          type="submit"
          disabled={state.status === "sending"}
          aria-busy={state.status === "sending"}
        >
          {state.status === "sending" ? t("sending") : t("feedback.submit")}
        </Button>
      </div>
    </form>
  );
}

/** Five native radios rendered as stars: arrow keys move between them, screen readers read "4 stars". */
function StarRating({
  name,
  legend,
  required,
  optionalLabel,
  value,
  registration,
  starLabel,
  error,
}: {
  name: string;
  legend: string;
  required: boolean;
  optionalLabel: string;
  value: number;
  registration: UseFormRegisterReturn;
  starLabel: (count: number) => string;
  error: string | undefined;
}) {
  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-describedby={error ? `${name}-error` : undefined}
    >
      <legend className="text-fg text-sm font-medium">
        {legend}
        {!required ? (
          <span className="text-muted ms-1.5 font-normal">({optionalLabel})</span>
        ) : null}
      </legend>
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="has-[:focus-visible]:outline-focus cursor-pointer rounded-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
          >
            <input type="radio" value={n} className="sr-only" {...registration} />
            <span className="sr-only">{starLabel(n)}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={`size-8 transition-colors duration-150 ${n <= value ? "fill-accent stroke-accent" : "stroke-line hover:stroke-fg fill-none"}`}
              strokeWidth={1.5}
            >
              <path
                d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"
                strokeLinejoin="round"
              />
            </svg>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
