import { getTranslations } from "next-intl/server";
import { simplePage } from "@/lib/simple-page";

const SHAPES = ["cup", "box", "bag"] as const;

/** The Design Studio's page (S1): what it will draw. The studio itself opens in S5 (plan §5.3). */
const page = simplePage({
  key: "design",
  path: "/design",
  current: "design",
  body: async (locale) => {
    const t = await getTranslations({ locale, namespace: "pages.design.shapes" });
    return (
      <ul className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:grid-cols-3 sm:px-8">
        {SHAPES.map((s, i) => (
          <li key={s} className="rounded-card bg-surface flex items-center gap-4 p-5">
            <span className="text-muted text-sm font-semibold tabular-nums">{i + 1}</span>
            <span className="font-semibold">{t(s)}</span>
          </li>
        ))}
      </ul>
    );
  },
});

export const generateMetadata = page.generateMetadata;
export default page.Page;
