// Real guest reviews of COVY, sent by the client in English and Arabic (D63). They replace the labelled
// samples, so the site shows them without the "Sample review" label (CLAUDE.md rule 5).
import type { Testimonial } from "./types";

export const testimonials: Testimonial[] = [
  {
    id: "covy-food",
    brandId: "covy",
    quote: {
      en: "The food was absolutely amazing. Every dish was beautifully presented, full of flavor, and made the whole experience feel special. Definitely a place I'd love to visit again.",
      ar: "الأكل كان رائعًا بكل تفاصيله! كل طبق كان متقدم بطريقة مميزة، والنكهات كانت غنية ومتوازنة. تجربة جميلة أكيد تستحق التكرار.",
    },
    author: { en: "Sarah M.", ar: "سارة م." },
    rating: 5,
    source: "client",
    placeholder: false,
  },
  {
    id: "covy-coffee-service",
    brandId: "covy",
    quote: {
      en: "A lovely spot for great coffee and a relaxing break. The atmosphere is beautiful, the staff are welcoming, and every little detail makes you feel comfortable.",
      ar: "مكان جميل جدًا للاستمتاع بفنجان قهوة مميز وأخذ استراحة هادئة. الأجواء مريحة، والخدمة ودودة، وكل التفاصيل بتخلي التجربة ممتعة.",
    },
    author: { en: "Omar K.", ar: "عمر ك." },
    rating: 5,
    source: "client",
    placeholder: false,
  },
  {
    id: "covy-experience",
    brandId: "covy",
    quote: {
      en: "COVY is more than just a café. From the stunning interior to the warm atmosphere, everything comes together to create a memorable experience. Perfect for spending quality time with friends.",
      ar: "COVY مش مجرد كافيه، دي تجربة متكاملة! من التصميم الداخلي المميز للأجواء الراقية، كل حاجة متناسقة وبتخلي الوقت هناك مميز. مكان مثالي لقضاء وقت جميل مع الأصدقاء.",
    },
    author: { en: "Mariam A.", ar: "مريم أ." },
    rating: 5,
    source: "client",
    placeholder: false,
  },
];
