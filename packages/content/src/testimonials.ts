// Sample reviews, written by us to show the layout. They are NOT real guest reviews and are always
// displayed with a "Sample review" label (CLAUDE.md rule 5). Real Google reviews replace them in P7.
import type { Testimonial } from "./types";

export const testimonials: Testimonial[] = [
  {
    id: "covy-sample-1",
    brandId: "covy",
    quote: {
      en: "Sample review: a short quote from a guest about the food and the space will sit here.",
      ar: "رأي تجريبي: هنا سيظهر اقتباس قصير من ضيف عن الأكل والمكان.",
    },
    author: { en: "Sample guest", ar: "ضيف تجريبي" },
    rating: 5,
    source: "placeholder",
    placeholder: true,
  },
  {
    id: "covy-sample-2",
    brandId: "covy",
    quote: {
      en: "Sample review: a second guest quote, for example about the coffee or the service.",
      ar: "رأي تجريبي: اقتباس ثانٍ من ضيف، مثلًا عن القهوة أو الخدمة.",
    },
    author: { en: "Sample guest", ar: "ضيف تجريبي" },
    rating: 5,
    source: "placeholder",
    placeholder: true,
  },
  {
    id: "covy-sample-3",
    brandId: "covy",
    quote: {
      en: "Sample review: a third quote, taken from Google reviews once the client approves which to show.",
      ar: "رأي تجريبي: اقتباس ثالث من تقييمات جوجل بعد موافقة العميل على المعروض.",
    },
    author: { en: "Sample guest", ar: "ضيف تجريبي" },
    rating: 4,
    source: "placeholder",
    placeholder: true,
  },
  {
    id: "aroma-sample-1",
    brandId: "aroma",
    quote: {
      en: "Sample review: a short quote from a guest about the food and the terrace will sit here.",
      ar: "رأي تجريبي: هنا سيظهر اقتباس قصير من ضيف عن الأكل والتراس.",
    },
    author: { en: "Sample guest", ar: "ضيف تجريبي" },
    rating: 5,
    source: "placeholder",
    placeholder: true,
  },
  {
    id: "aroma-sample-2",
    brandId: "aroma",
    quote: {
      en: "Sample review: a second guest quote, for example about the welcome or the shisha.",
      ar: "رأي تجريبي: اقتباس ثانٍ من ضيف، مثلًا عن الاستقبال أو الشيشة.",
    },
    author: { en: "Sample guest", ar: "ضيف تجريبي" },
    rating: 5,
    source: "placeholder",
    placeholder: true,
  },
  {
    id: "aroma-sample-3",
    brandId: "aroma",
    quote: {
      en: "Sample review: a third quote, taken from Google reviews once the client approves which to show.",
      ar: "رأي تجريبي: اقتباس ثالث من تقييمات جوجل بعد موافقة العميل على المعروض.",
    },
    author: { en: "Sample guest", ar: "ضيف تجريبي" },
    rating: 4,
    source: "placeholder",
    placeholder: true,
  },
];
