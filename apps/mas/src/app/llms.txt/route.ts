import { brands, insights, masServices, serviceDetails } from "@mas/content";
import { siteOrigin } from "@mas/seo";
import { brand } from "@/site";

export const dynamic = "force-static";

/**
 * /llms.txt (D70): a plain summary of MAS and links to its main pages, for AI assistants and answer
 * engines that read it (llmstxt.org). Built from the same content as the site.
 */
export function GET() {
  const o = siteOrigin(brand);
  const live = (id: "covy" | "aroma") => brands[id].liveUrl ?? brands[id].domain;
  const services = [...masServices]
    .sort((a, b) => a.order - b.order)
    .map(
      (s) =>
        `- [${s.title.en}](${o}/services/${s.slug}): ${serviceDetails[s.slug]?.intro.en ?? s.summary.en}`,
    )
    .join("\n");
  const articles = insights
    .map((i) => `- [${i.title.en}](${o}/insights/${i.slug}): ${i.excerpt.en}`)
    .join("\n");
  const body = `# MAS

> MAS is a café and restaurant management company in Egypt. It plans, opens and runs cafés and restaurants: concept, brand, menu engineering and costing, events, recruitment and training, operations and hospitality, financial control, production and supply, and quality assurance. The site is in English (${o}/) and Arabic (${o}/ar).

## Company

- [About MAS](${o}/about): what MAS does and what its mark stands for.
- [Contact](${o}/contact): discuss a café or restaurant project; replies within one business day. Email: ${brand.inboxEmail}

## Services

${services}

## Brands MAS runs

- [COVY](${o}/brands/covy): a restaurant and café with a world-tour menu. Its own site: ${live("covy")}
- [Aroma Lounge](${o}/brands/aroma): a café and restaurant by the lake at Mivida and in Madinaty. Its own site: ${live("aroma")}

## Insights

${articles}
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
