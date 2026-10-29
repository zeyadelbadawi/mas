import "server-only";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";

export type Mail = {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
  idempotencyKey: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; message: string };

/**
 * Sends one email through Resend. Without RESEND_API_KEY in development it logs the email instead,
 * so forms work locally. In production a missing key is a configuration error.
 */
export async function sendMail(
  mail: Mail,
  env: { apiKey: string | undefined; from: string | undefined },
): Promise<SendResult> {
  const html = await render(mail.react);
  const text = await render(mail.react, { plainText: true });
  if (!env.apiKey) {
    if (process.env.NODE_ENV === "production")
      return { ok: false, message: "RESEND_API_KEY is not set" };
    console.info(`[dev mailer] → ${mail.to} | ${mail.subject}\n${text}`);
    return { ok: true, id: `dev-${mail.idempotencyKey}` };
  }
  if (!env.from) return { ok: false, message: "MAIL_FROM is not set" };
  const resend = new Resend(env.apiKey);
  // The SDK returns { data, error } instead of throwing.
  const { data, error } = await resend.emails.send(
    {
      from: env.from,
      to: [mail.to],
      subject: mail.subject,
      html,
      text,
      ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
    },
    { idempotencyKey: mail.idempotencyKey },
  );
  if (error || !data) return { ok: false, message: error?.message ?? "unknown error" };
  return { ok: true, id: data.id };
}
