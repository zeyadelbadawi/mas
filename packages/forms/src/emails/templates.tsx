import { Heading, Link, Text } from "react-email";
import { formatDate, formatTime, type Locale, type LocalizedText } from "@mas/i18n";
import type { Feedback, Inquiry, Reservation } from "../schemas";
import { displayPhone } from "../phone";
import { DetailsTable, EmailLayout, type EmailBrand } from "./layout";
import { fill, messages } from "./strings";

const dateOf = (ymd: string, locale: Locale) =>
  formatDate(new Date(`${ymd}T12:00:00+02:00`), locale);
const wa = (e164: string) => `https://wa.me/${e164.replace(/\D/g, "")}`;

type StaffContact = { phone: string; email?: string };

function ContactLinks({ phone, email }: StaffContact) {
  return (
    <Text style={{ fontSize: 14 }}>
      <Link href={`tel:${phone}`}>Call {displayPhone(phone)}</Link>
      {"  ·  "}
      <Link href={wa(phone)}>WhatsApp</Link>
      {email ? (
        <>
          {"  ·  "}
          <Link href={`mailto:${email}`}>Email</Link>
        </>
      ) : null}
    </Text>
  );
}

/** To the restaurant inbox. English, with every field and one-tap contact links. */
export function ReservationStaffEmail({
  brand,
  reference,
  r,
  afterMidnight,
  branch,
}: {
  brand: EmailBrand;
  reference: string;
  r: Reservation;
  afterMidnight: boolean;
  /** For brands with several branches. */
  branch?: LocalizedText | undefined;
}) {
  const t = messages.en.forms.reservation;
  return (
    <EmailLayout
      brand={brand}
      locale="en"
      preview={`${t.types[r.type]} · ${r.guests} guests · ${reference}`}
      footer={`Request ${reference}. Not confirmed until you call the guest. Reply to this email to write to the guest.`}
    >
      <Heading as="h2" style={{ fontSize: 20 }}>
        New {t.types[r.type].toLowerCase()} request
      </Heading>
      <DetailsTable
        rows={[
          ["Reference", reference],
          ...(branch ? [["Branch", branch.en] as [string, string]] : []),
          ["Type", t.types[r.type]],
          ["Date", dateOf(r.date, "en")],
          ["Time", `${formatTime(r.time, "en")}${afterMidnight ? " (after midnight)" : ""}`],
          ["Guests", String(r.guests)],
          ["Seating", t.seatings[r.seating]],
          ["Name", r.fullName],
          ["Mobile", displayPhone(r.phone)],
          ["Email", r.email],
          ["Occasion", r.occasionDetails || "—"],
          ["Special requests", r.notes || "—"],
          ["Guest language", r.locale === "ar" ? "Arabic" : "English"],
        ]}
      />
      <ContactLinks phone={r.phone} email={r.email} />
    </EmailLayout>
  );
}

/** Auto-reply to the guest, in their language. */
export function ReservationGuestEmail({
  brand,
  reference,
  r,
  contact,
  branch,
}: {
  brand: EmailBrand;
  reference: string;
  r: Reservation;
  contact: StaffContact;
  branch?: LocalizedText | undefined;
}) {
  const m = messages[r.locale];
  const t = m.forms.reservation;
  const dir = r.locale === "ar" ? "rtl" : "ltr";
  return (
    <EmailLayout
      brand={brand}
      locale={r.locale}
      preview={`${t.successTitle} · ${reference}`}
      footer={fill(t.successBody, { reference })}
    >
      <Heading as="h2" style={{ fontSize: 20 }}>
        {t.successTitle}
      </Heading>
      <Text style={{ fontSize: 15, lineHeight: "24px" }}>{fill(t.successBody, { reference })}</Text>
      <DetailsTable
        dir={dir}
        rows={[
          ...(branch ? [[t.branch, branch[r.locale]] as [string, string]] : []),
          [t.type, t.types[r.type]],
          [t.date, dateOf(r.date, r.locale)],
          [t.time, formatTime(r.time, r.locale)],
          [t.guests, String(r.guests)],
          [t.seating, t.seatings[r.seating]],
          [t.fullName, r.fullName],
        ]}
      />
      <Text style={{ fontSize: 14 }}>
        <Link href={`tel:${contact.phone}`}>
          {t.callUs} {displayPhone(contact.phone)}
        </Link>
        {"  ·  "}
        <Link href={wa(contact.phone)}>{t.whatsapp}</Link>
      </Text>
    </EmailLayout>
  );
}

export function FeedbackStaffEmail({
  brand,
  reference,
  f,
}: {
  brand: EmailBrand;
  reference: string;
  f: Feedback;
}) {
  const t = messages.en.forms.feedback;
  const stars = (n?: number) => (n ? `${"★".repeat(n)}${"☆".repeat(5 - n)}` : "—");
  return (
    <EmailLayout
      brand={brand}
      locale="en"
      preview={`${stars(f.overall)} · ${f.comments.slice(0, 80)}`}
      footer={`Feedback ${reference}.`}
    >
      <Heading as="h2" style={{ fontSize: 20 }}>
        New guest feedback
      </Heading>
      <DetailsTable
        rows={[
          [t.overall, stars(f.overall)],
          [t.food, stars(f.food)],
          [t.service, stars(f.service)],
          [t.ambience, stars(f.ambience)],
          [t.visitDate, f.visitDate ? dateOf(f.visitDate, "en") : "—"],
          [t.comments, f.comments],
          [t.contactMe, f.contactMe ? "Yes" : "No"],
          [t.name, f.name || "—"],
          [t.email, f.email || "—"],
          [t.phone, f.phone ? displayPhone(f.phone) : "—"],
          ["Guest language", f.locale === "ar" ? "Arabic" : "English"],
        ]}
      />
      {f.contactMe && f.phone ? (
        <ContactLinks phone={f.phone} {...(f.email ? { email: f.email } : {})} />
      ) : null}
    </EmailLayout>
  );
}

export function FeedbackGuestEmail({ brand, f }: { brand: EmailBrand; f: Feedback }) {
  const t = messages[f.locale].forms.feedback;
  return (
    <EmailLayout brand={brand} locale={f.locale} preview={t.successTitle} footer={brand.name}>
      <Heading as="h2" style={{ fontSize: 20 }}>
        {t.successTitle}
      </Heading>
      <Text style={{ fontSize: 15, lineHeight: "24px" }}>{t.successBody}</Text>
    </EmailLayout>
  );
}

export function InquiryStaffEmail({
  brand,
  reference,
  q,
  serviceTitles,
}: {
  brand: EmailBrand;
  reference: string;
  q: Inquiry;
  serviceTitles: string[];
}) {
  const t = messages.en.forms.inquiry;
  return (
    <EmailLayout
      brand={brand}
      locale="en"
      preview={`${q.fullName} · ${t.stages[q.stage]} · ${reference}`}
      footer={`Inquiry ${reference}. Reply to this email to answer the sender.`}
    >
      <Heading as="h2" style={{ fontSize: 20 }}>
        New project inquiry
      </Heading>
      <DetailsTable
        rows={[
          ["Reference", reference],
          [t.fullName, q.fullName],
          [t.company, q.company || "—"],
          [t.role, t.roles[q.role]],
          [t.email, q.email],
          [t.phone, displayPhone(q.phone)],
          [t.stage, t.stages[q.stage]],
          [t.services, serviceTitles.join("\n")],
          [t.city, q.city || "—"],
          [t.timeline, q.timeline ? t.timelines[q.timeline] : "—"],
          [t.budget, q.budget ? t.budgets[q.budget] : "—"],
          [t.message, q.message],
          ["Language", q.locale === "ar" ? "Arabic" : "English"],
        ]}
      />
      <ContactLinks phone={q.phone} email={q.email} />
    </EmailLayout>
  );
}

export function InquiryGuestEmail({
  brand,
  reference,
  q,
}: {
  brand: EmailBrand;
  reference: string;
  q: Inquiry;
}) {
  const t = messages[q.locale].forms.inquiry;
  return (
    <EmailLayout brand={brand} locale={q.locale} preview={t.successTitle} footer={brand.name}>
      <Heading as="h2" style={{ fontSize: 20 }}>
        {t.successTitle}
      </Heading>
      <Text style={{ fontSize: 15, lineHeight: "24px" }}>{fill(t.successBody, { reference })}</Text>
    </EmailLayout>
  );
}
