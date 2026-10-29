import { getTranslations } from "next-intl/server";

export type ConsentLabels = {
  title: string;
  body: string;
  readPolicy: string;
  necessary: string;
  necessaryHint: string;
  analytics: string;
  analyticsHint: string;
  recordings: string;
  recordingsHint: string;
  save: string;
  preferences: string;
  rejectAll: string;
  acceptAll: string;
  close: string;
  cookieSettings: string;
};

/** Banner strings, read on the server and passed to ConsentProvider (keeps the formatter out of the bundle). */
export async function getConsentLabels(locale: string): Promise<ConsentLabels> {
  const t = await getTranslations({ locale, namespace: "consent" });
  const c = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("title"),
    body: t("body"),
    readPolicy: t("readPolicy"),
    necessary: t("necessary"),
    necessaryHint: t("necessaryHint"),
    analytics: t("analytics"),
    analyticsHint: t("analyticsHint"),
    recordings: t("recordings"),
    recordingsHint: t("recordingsHint"),
    save: t("save"),
    preferences: t("preferences"),
    rejectAll: t("rejectAll"),
    acceptAll: t("acceptAll"),
    close: c("close"),
    cookieSettings: c("cookieSettings"),
  };
}
