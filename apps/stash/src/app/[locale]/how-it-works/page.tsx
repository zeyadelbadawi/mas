import { getTranslations } from "next-intl/server";
import { simplePage } from "@/lib/simple-page";

const STEPS = ["design", "see", "make", "deliver"] as const;

/** How it works (S1): the four steps; artwork guidance, minimums and lead times come in S6. */
const page = simplePage({
  key: "howItWorks",
  path: "/how-it-works",
  current: "howItWorks",
  soon: false,
  body: async (locale) => {
    const t = await getTranslations({ locale, namespace: "home.steps" });
    return (
      <ol className="mx-auto grid max-w-7xl gap-10 px-4 pb-24 sm:px-8 md:grid-cols-4 md:gap-6">
        {STEPS.map((step, i) => (
          <li key={step} className="flex flex-col gap-4">
            <span className="flex items-center gap-4">
              <span className="text-sm font-semibold tabular-nums">{i + 1}</span>
              <span aria-hidden="true" className="st-dieline flex-1" />
            </span>
            <h2 className="text-xl font-semibold">{t(`${step}.title`)}</h2>
            <p className="text-muted leading-relaxed">{t(`${step}.body`)}</p>
          </li>
        ))}
      </ol>
    );
  },
});

export const generateMetadata = page.generateMetadata;
export default page.Page;
