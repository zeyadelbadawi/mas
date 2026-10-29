import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";
import type { ReactNode } from "react";

export type EmailBrand = { name: string; accent: string; ink: string; paper: string };

type LayoutProps = {
  brand: EmailBrand;
  locale: "en" | "ar";
  preview: string;
  children: ReactNode;
  footer: string;
};

export function EmailLayout({ brand, locale, preview, children, footer }: LayoutProps) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <Html lang={locale} dir={dir}>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: brand.paper,
          margin: 0,
          padding: "24px 0",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Section style={{ backgroundColor: brand.ink, padding: "20px 28px" }}>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 20,
                letterSpacing: 3,
                margin: 0,
                textAlign: dir === "rtl" ? "right" : "left",
              }}
            >
              {brand.name}
            </Text>
          </Section>
          <Section
            style={{
              padding: "8px 28px 24px",
              direction: dir,
              textAlign: dir === "rtl" ? "right" : "left",
            }}
          >
            {children}
          </Section>
          <Hr style={{ borderColor: "#e5e5e5", margin: 0 }} />
          <Section style={{ padding: "14px 28px" }}>
            <Text
              style={{
                color: "#777777",
                fontSize: 12,
                margin: 0,
                direction: dir,
                textAlign: dir === "rtl" ? "right" : "left",
              }}
            >
              {footer}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Two-column key/value table that renders in every mail client. */
export function DetailsTable({
  rows,
  dir = "ltr",
}: {
  rows: [string, ReactNode][];
  dir?: "ltr" | "rtl";
}) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ borderCollapse: "collapse", margin: "12px 0", direction: dir }}
    >
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td
              style={{
                padding: "8px 12px 8px 0",
                color: "#666666",
                fontSize: 13,
                verticalAlign: "top",
                width: "38%",
                borderBottom: "1px solid #eeeeee",
              }}
            >
              {label}
            </td>
            <td
              style={{
                padding: "8px 0",
                color: "#111111",
                fontSize: 14,
                verticalAlign: "top",
                borderBottom: "1px solid #eeeeee",
                whiteSpace: "pre-wrap",
              }}
            >
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
