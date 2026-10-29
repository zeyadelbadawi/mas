"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@mas/analytics";
import type { MasService } from "@mas/content";
import { pick } from "@mas/i18n";
import { Button, ChoiceCard, Field, Input, Select, Textarea } from "@mas/ui";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  inquiryBudgets,
  inquiryRoles,
  inquirySchema,
  inquiryStages,
  inquiryTimelines,
  type Inquiry,
  type InquiryInput,
} from "../schemas";
import {
  ConsentField,
  FormAlert,
  Honeypot,
  SuccessPanel,
  TurnstileField,
  useErrorText,
  useFormSubmit,
} from "./shared";

export type InquiryFormProps = {
  services: MasService[];
  privacyHref: string;
  turnstileSiteKey?: string | undefined;
  turnstileTheme?: "light" | "dark" | "auto" | undefined;
  /** Pre-select a service when the form is opened from a service page. */
  defaultService?: string;
};

export function InquiryForm({
  services,
  privacyHref,
  turnstileSiteKey,
  turnstileTheme,
  defaultService,
}: InquiryFormProps) {
  const t = useTranslations("forms");
  const locale = useLocale() as "en" | "ar";
  const schema = useMemo(() => inquirySchema(services.map((s) => s.slug)), [services]);
  const { register, setError, handleSubmit, formState } = useForm<InquiryInput, unknown, Inquiry>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      company: "",
      email: "",
      phone: "",
      services: defaultService ? [defaultService] : [],
      city: "",
      message: "",
      locale,
    },
  });
  const errors = formState.errors;
  const errorText = useErrorText();
  const err = (field: keyof InquiryInput) =>
    errorText(field, errors[field]?.message ?? errors[field]?.root?.message);
  const { send, state, setToken, honeypotRef, turnstileRef } = useFormSubmit<InquiryInput>(
    "inquiry",
    setError,
  );

  if (state.status === "sent") {
    return (
      <SuccessPanel title={t("inquiry.successTitle")}>
        <p className="text-fg">{t("inquiry.successBody", { reference: state.reference })}</p>
      </SuccessPanel>
    );
  }

  const sorted = [...services].sort((a, b) => a.order - b.order);

  return (
    <form
      data-clarity-mask="true"
      noValidate
      onSubmit={handleSubmit(async (data) => {
        if (await send(data)) track("inquiry_submit");
      })}
      className="relative flex flex-col gap-6"
    >
      <Honeypot inputRef={honeypotRef} />
      {state.status === "error" ? <FormAlert>{state.message}</FormAlert> : null}
      {state.status === "invalid" ? <FormAlert>{t("checkFields")}</FormAlert> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="fullName" label={t("inquiry.fullName")} error={err("fullName")} required>
          {(a11y) => <Input autoComplete="name" {...a11y} {...register("fullName")} />}
        </Field>
        <Field
          id="company"
          label={t("inquiry.company")}
          error={err("company")}
          optionalLabel={t("optional")}
        >
          {(a11y) => <Input autoComplete="organization" {...a11y} {...register("company")} />}
        </Field>
        <Field id="role" label={t("inquiry.role")} error={err("role")} required>
          {(a11y) => (
            <Select defaultValue="" {...a11y} {...register("role")}>
              <option value="" disabled>
                —
              </option>
              {inquiryRoles.map((r) => (
                <option key={r} value={r}>
                  {t(`inquiry.roles.${r}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field
          id="city"
          label={t("inquiry.city")}
          error={err("city")}
          optionalLabel={t("optional")}
        >
          {(a11y) => <Input autoComplete="address-level2" {...a11y} {...register("city")} />}
        </Field>
        <Field id="email" label={t("inquiry.email")} error={err("email")} required>
          {(a11y) => (
            <Input type="email" autoComplete="email" dir="ltr" {...a11y} {...register("email")} />
          )}
        </Field>
        <Field id="phone" label={t("inquiry.phone")} error={err("phone")} required>
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

      <fieldset className="flex flex-col gap-3">
        <legend className="text-fg mb-3 text-sm font-medium">{t("inquiry.stage")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {inquiryStages.map((s) => (
            <ChoiceCard
              key={s}
              id={`stage-${s}`}
              value={s}
              title={t(`inquiry.stages.${s}`)}
              {...register("stage")}
            />
          ))}
        </div>
        {err("stage") ? (
          <p role="alert" className="text-danger text-sm font-medium">
            {err("stage")}
          </p>
        ) : null}
      </fieldset>

      <fieldset
        className="flex flex-col gap-3"
        aria-describedby={err("services") ? "services-error" : undefined}
      >
        <legend className="text-fg mb-3 text-sm font-medium">{t("inquiry.services")}</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((s) => (
            <ChoiceCard
              key={s.slug}
              type="checkbox"
              id={`service-${s.slug}`}
              value={s.slug}
              title={pick(s.title, locale)}
              {...register("services")}
            />
          ))}
        </div>
        {err("services") ? (
          <p id="services-error" role="alert" className="text-danger text-sm font-medium">
            {err("services")}
          </p>
        ) : null}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="timeline" label={t("inquiry.timeline")} optionalLabel={t("optional")}>
          {(a11y) => (
            <Select
              defaultValue=""
              {...a11y}
              {...register("timeline", { setValueAs: (v: string) => v || undefined })}
            >
              <option value="">—</option>
              {inquiryTimelines.map((v) => (
                <option key={v} value={v}>
                  {t(`inquiry.timelines.${v}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="budget" label={t("inquiry.budget")} optionalLabel={t("optional")}>
          {(a11y) => (
            <Select
              defaultValue=""
              {...a11y}
              {...register("budget", { setValueAs: (v: string) => v || undefined })}
            >
              <option value="">—</option>
              {inquiryBudgets.map((v) => (
                <option key={v} value={v}>
                  {t(`inquiry.budgets.${v}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field id="message" label={t("inquiry.message")} error={err("message")} required>
        {(a11y) => <Textarea rows={6} {...a11y} {...register("message")} />}
      </Field>

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
          size="lg"
          disabled={state.status === "sending"}
          aria-busy={state.status === "sending"}
        >
          {state.status === "sending" ? t("sending") : t("inquiry.submit")}
        </Button>
      </div>
    </form>
  );
}
