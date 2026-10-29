import { serializeJsonLd } from "./json-ld";

/** Server component. Data comes from our own content records, and serializeJsonLd escapes "<". */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const html = { __html: serializeJsonLd(data) };
  // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- JSON-LD has to be inline; see serializeJsonLd
  return <script type="application/ld+json" dangerouslySetInnerHTML={html} />;
}
