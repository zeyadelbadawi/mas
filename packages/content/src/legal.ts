import type { LocalizedText } from "@mas/i18n";
import type { Brand } from "./types";

export type LegalSection = {
  heading: LocalizedText;
  paragraphs: LocalizedText[];
  list?: LocalizedText[];
};

export type LegalDocument = {
  title: LocalizedText;
  intro: LocalizedText;
  /** ISO date of the last change. */
  updated: string;
  sections: LegalSection[];
  /** Drafted by us, not by a lawyer: the client's counsel reviews it before launch. */
  placeholder: true;
};

const UPDATED = "2026-10-29";

type Names = { en: string; ar: string; inbox: string; restaurant: boolean };

function names(brand: Brand): Names {
  return {
    en: brand.name.en,
    ar: brand.name.ar,
    inbox: brand.inboxEmail,
    restaurant: brand.id !== "mas",
  };
}

/* ------------------------------------------------------------------ privacy */

export function privacyPolicy(brand: Brand): LegalDocument {
  const n = names(brand);
  const operator: LocalizedText = n.restaurant
    ? { en: `${n.en} is managed by MAS`, ar: `${n.ar} تديره شركة MAS` }
    : { en: "MAS", ar: "MAS" };

  const collected: LocalizedText[] = n.restaurant
    ? [
        {
          en: "Reservation requests: booking type, date, time, number of guests, seating preference, your name, mobile number and email, and any notes you add.",
          ar: "طلبات الحجز: نوع الحجز والتاريخ والوقت وعدد الضيوف وتفضيل الجلوس، واسمك ورقم موبايلك وبريدك الإلكتروني، وأي ملاحظات تضيفها.",
        },
        {
          en: "Feedback: your ratings and comments, and your name and contact details only if you ask us to get back to you.",
          ar: "الآراء والتقييمات: تقييماتك وتعليقاتك، واسمك وبيانات التواصل فقط لو طلبت أن نتواصل معك.",
        },
      ]
    : [
        {
          en: "Project inquiries: your name, company, role, email, mobile number, city, the services you are interested in, your timeline and budget range if you share them, and your message.",
          ar: "طلبات المشروعات: اسمك والشركة ودورك فيها وبريدك الإلكتروني ورقم موبايلك والمدينة، والخدمات التي تهمك، والجدول الزمني ونطاق الميزانية لو شاركتهما، ورسالتك.",
        },
      ];

  return {
    title: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
    intro: {
      en: `This policy explains what personal data the ${n.en} website collects, why, and what you can ask us to do with it. ${operator.en} and is responsible for this data.`,
      ar: `توضح هذه السياسة البيانات الشخصية التي يجمعها موقع ${n.ar}، وسبب جمعها، وما يمكنك أن تطلبه منا بشأنها. ${operator.ar}، وهي المسؤولة عن هذه البيانات.`,
    },
    updated: UPDATED,
    placeholder: true,
    sections: [
      {
        heading: { en: "What we collect", ar: "ما الذي نجمعه" },
        paragraphs: [
          {
            en: "We only collect what you type into our forms, plus basic technical data needed to run the site safely.",
            ar: "نجمع فقط ما تكتبه في النماذج، بالإضافة إلى بيانات تقنية أساسية لازمة لتشغيل الموقع بأمان.",
          },
        ],
        list: [
          ...collected,
          {
            en: "Technical data: your IP address and browser details, used by our hosting and bot-protection providers to deliver the site and block abuse.",
            ar: "البيانات التقنية: عنوان IP وبيانات المتصفح، ويستخدمها مزودا الاستضافة والحماية من البرامج الآلية لتشغيل الموقع ومنع إساءة الاستخدام.",
          },
          {
            en: "Usage data, only if you allow it in the cookie banner: pages visited and how the site is used (Google Analytics), and anonymised heatmaps and session recordings (Microsoft Clarity).",
            ar: "بيانات الاستخدام، فقط لو سمحت بها في شريط ملفات الارتباط: الصفحات التي زرتها وطريقة استخدام الموقع (Google Analytics)، وخرائط حرارية وتسجيلات جلسات مجهولة الهوية (Microsoft Clarity).",
          },
        ],
      },
      {
        heading: { en: "Why we use it", ar: "لماذا نستخدمها" },
        paragraphs: [
          n.restaurant
            ? {
                en: "To handle your reservation request, call you to confirm it, prepare for your visit or event, answer your feedback, and improve our service.",
                ar: "للتعامل مع طلب الحجز، والاتصال بك لتأكيده، والاستعداد لزيارتك أو مناسبتك، والرد على رأيك، وتحسين خدمتنا.",
              }
            : {
                en: "To reply to your inquiry, understand your project and prepare a proposal.",
                ar: "للرد على طلبك، وفهم مشروعك، وإعداد عرض مناسب.",
              },
          {
            en: "We rely on your consent and on the steps you ask us to take before any agreement, in line with Egypt's Personal Data Protection Law (No. 151 of 2020). We do not sell your data or use it for advertising.",
            ar: "نعتمد على موافقتك وعلى الخطوات التي تطلب منا اتخاذها قبل أي اتفاق، وفقًا لقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020. لا نبيع بياناتك ولا نستخدمها في الإعلانات.",
          },
        ],
      },
      {
        heading: { en: "How long we keep it", ar: "مدة الاحتفاظ بها" },
        paragraphs: [
          {
            en: `The site has no database. Your request is sent as an email to our team (${n.inbox}) and a copy to you. We keep these emails only as long as we need them to handle your request, and delete them within 12 months.`,
            ar: `لا توجد قاعدة بيانات في الموقع. يُرسل طلبك كبريد إلكتروني إلى فريقنا (${n.inbox}) مع نسخة لك. نحتفظ بهذه الرسائل فقط طوال المدة اللازمة للتعامل مع طلبك، ونحذفها خلال 12 شهرًا.`,
          },
        ],
      },
      {
        heading: { en: "Who we share it with", ar: "مع من نشاركها" },
        paragraphs: [
          {
            en: "We use a few service providers to run the site. They process data on our behalf and only for these purposes. Some of them store data outside Egypt.",
            ar: "نستعين ببعض مزودي الخدمات لتشغيل الموقع. يعالجون البيانات نيابة عنا ولهذه الأغراض فقط، وبعضهم يخزن البيانات خارج مصر.",
          },
        ],
        list: [
          { en: "Vercel: website hosting.", ar: "Vercel: استضافة الموقع." },
          { en: "Resend: delivering form emails.", ar: "Resend: إرسال رسائل النماذج." },
          {
            en: "Cloudflare: bot protection (Turnstile) and image delivery.",
            ar: "Cloudflare: الحماية من البرامج الآلية (Turnstile) وتوصيل الصور.",
          },
          {
            en: "Google: Google Analytics, only with your consent.",
            ar: "Google: خدمة Google Analytics، بموافقتك فقط.",
          },
          {
            en: "Microsoft: Microsoft Clarity, only with your consent.",
            ar: "Microsoft: خدمة Microsoft Clarity، بموافقتك فقط.",
          },
        ],
      },
      {
        heading: { en: "Cookies", ar: "ملفات الارتباط" },
        paragraphs: [
          {
            en: 'Two necessary cookies remember your language and your cookie choice. Analytics and session-insight cookies are set only if you allow them, and you can change your choice at any time from "Cookie settings" at the bottom of every page.',
            ar: "يحفظ ملفا ارتباط ضروريان لغتك واختيارك بشأن ملفات الارتباط. لا تُضبط ملفات التحليلات وتحليل الجلسات إلا لو سمحت بها، ويمكنك تغيير اختيارك في أي وقت من «إعدادات ملفات الارتباط» أسفل كل صفحة.",
          },
          {
            en: "Microsoft Clarity masks what you type into form fields, so recordings never show your personal details.",
            ar: "تخفي Microsoft Clarity ما تكتبه في حقول النماذج، فلا تظهر بياناتك الشخصية في التسجيلات.",
          },
        ],
      },
      {
        heading: { en: "Your rights", ar: "حقوقك" },
        paragraphs: [
          {
            en: `You can ask to see the data we hold about you, correct it, delete it, or withdraw your consent. Email ${n.inbox} and we will reply within 30 days.`,
            ar: `يمكنك أن تطلب الاطلاع على بياناتك لدينا أو تصحيحها أو حذفها، أو أن تسحب موافقتك. راسلنا على ${n.inbox} وسنرد خلال 30 يومًا.`,
          },
        ],
      },
      {
        heading: { en: "Security", ar: "الأمان" },
        paragraphs: [
          {
            en: "The site is served over HTTPS only, forms are checked on our server and protected against bots, and access to our inboxes is limited to the team that handles requests.",
            ar: "يعمل الموقع عبر HTTPS فقط، ويتم التحقق من النماذج على خادمنا وحمايتها من البرامج الآلية، ويقتصر الوصول إلى صناديق البريد على الفريق المسؤول عن الطلبات.",
          },
        ],
      },
      {
        heading: { en: "Children", ar: "الأطفال" },
        paragraphs: [
          {
            en: "Our forms are meant for adults. If you are under 18, please ask a parent or guardian to contact us for you.",
            ar: "النماذج مخصصة للبالغين. لو كان عمرك أقل من 18 عامًا، اطلب من أحد والديك أو ولي أمرك التواصل معنا نيابة عنك.",
          },
        ],
      },
      {
        heading: { en: "Changes and contact", ar: "التعديلات والتواصل" },
        paragraphs: [
          {
            en: `If we change this policy, we will update the date at the top of this page. Questions: ${n.inbox}.`,
            ar: `لو عدّلنا هذه السياسة سنحدّث التاريخ أعلى الصفحة. للاستفسارات: ${n.inbox}.`,
          },
        ],
      },
    ],
  };
}

/* ------------------------------------------------------------------ terms */

export function termsOfUse(brand: Brand): LegalDocument {
  const n = names(brand);

  const service: LegalSection[] = n.restaurant
    ? [
        {
          heading: { en: "Reservations", ar: "الحجوزات" },
          paragraphs: [
            {
              en: "Sending the reservation form is a request, not a confirmed booking. Your booking is confirmed only when our team calls or messages you. We may decline a request, for example when we are fully booked.",
              ar: "إرسال نموذج الحجز هو طلب وليس حجزًا مؤكدًا. يُؤكَّد الحجز فقط عندما يتصل بك فريقنا أو يراسلك. قد نعتذر عن طلب ما، مثلًا عند اكتمال الحجوزات.",
            },
            {
              en: "Tables are held for 15 minutes after the booked time. Events and full-venue bookings may need a deposit, which we arrange with you directly; the website takes no payments.",
              ar: "نحتفظ بالطاولة لمدة 15 دقيقة بعد موعد الحجز. قد تحتاج المناسبات وحجز المكان بالكامل إلى عربون نتفق عليه معك مباشرة، ولا يتم أي دفع عبر الموقع.",
            },
            {
              en: "To change or cancel a booking, please call us as early as you can.",
              ar: "لتعديل الحجز أو إلغائه، اتصل بنا في أقرب وقت ممكن.",
            },
          ],
        },
        {
          heading: { en: "Menu, prices and allergens", ar: "المنيو والأسعار ومسببات الحساسية" },
          paragraphs: [
            {
              en: "The menu and prices on this site are for information and may change without notice. The prices charged in the restaurant are the ones that apply.",
              ar: "المنيو والأسعار المعروضة على الموقع للعلم فقط وقد تتغير دون إشعار، والأسعار المعتمدة هي المعمول بها داخل المطعم.",
            },
            {
              en: "Allergen information is a guide. If you have an allergy, tell our staff before you order.",
              ar: "معلومات مسببات الحساسية استرشادية. لو لديك حساسية، أبلغ فريق الخدمة قبل الطلب.",
            },
          ],
        },
      ]
    : [
        {
          heading: { en: "Project inquiries", ar: "طلبات المشروعات" },
          paragraphs: [
            {
              en: "Sending an inquiry does not create an agreement. Any work is governed by a separate written proposal or contract signed by both sides.",
              ar: "إرسال طلب لا يُنشئ أي اتفاق. يخضع أي عمل لعرض أو عقد مكتوب منفصل يوقعه الطرفان.",
            },
            {
              en: "Information about our services, past projects and results is general and does not guarantee the same results for your business.",
              ar: "المعلومات عن خدماتنا ومشروعاتنا السابقة ونتائجها عامة، ولا تضمن تحقيق النتائج نفسها لمشروعك.",
            },
          ],
        },
      ];

  return {
    title: { en: "Terms of Use", ar: "شروط الاستخدام" },
    intro: {
      en: `These terms apply to your use of the ${n.en} website. By using the site, you agree to them.`,
      ar: `تنطبق هذه الشروط على استخدامك لموقع ${n.ar}. باستخدامك للموقع فإنك توافق عليها.`,
    },
    updated: UPDATED,
    placeholder: true,
    sections: [
      {
        heading: { en: "Using the site", ar: "استخدام الموقع" },
        paragraphs: [
          {
            en: "Use the site for lawful, personal purposes. Do not try to disrupt it, send automated or false requests, or access parts of it that are not meant for the public.",
            ar: "استخدم الموقع لأغراض شخصية ومشروعة. لا تحاول تعطيله أو إرسال طلبات آلية أو غير صحيحة أو الوصول إلى أجزاء غير مخصصة للعامة.",
          },
        ],
      },
      ...service,
      {
        heading: { en: "What you send us", ar: "ما ترسله إلينا" },
        paragraphs: [
          {
            en: "Please make sure the details you send are accurate. If you share feedback, we may use it to improve our service. We will not publish your name or comments without your permission.",
            ar: "تأكد من صحة البيانات التي ترسلها. لو شاركت رأيك فقد نستخدمه لتحسين خدمتنا، ولن ننشر اسمك أو تعليقاتك دون إذنك.",
          },
        ],
      },
      {
        heading: { en: "Intellectual property", ar: "الملكية الفكرية" },
        paragraphs: [
          {
            en: `The ${n.en} name, logo, photos, videos and text on this site belong to us or our licensors. You may not copy or reuse them without written permission.`,
            ar: `اسم ${n.ar} وشعاره والصور والفيديوهات والنصوص على هذا الموقع مملوكة لنا أو لمن رخّص لنا باستخدامها، ولا يجوز نسخها أو إعادة استخدامها دون إذن كتابي.`,
          },
        ],
      },
      {
        heading: { en: "Links to other sites", ar: "روابط لمواقع أخرى" },
        paragraphs: [
          {
            en: "Links to social media, maps or other sites are for convenience. We are not responsible for their content or privacy practices.",
            ar: "الروابط إلى وسائل التواصل الاجتماعي أو الخرائط أو المواقع الأخرى للتسهيل فقط، ولسنا مسؤولين عن محتواها أو ممارساتها في الخصوصية.",
          },
        ],
      },
      {
        heading: { en: "Liability", ar: "المسؤولية" },
        paragraphs: [
          {
            en: "We work to keep the site accurate and available, but it is provided as it is. To the extent the law allows, we are not liable for losses caused by using the site or by it being unavailable.",
            ar: "نحرص على دقة الموقع وإتاحته، لكنه يُقدَّم كما هو. وفي الحدود التي يسمح بها القانون، لسنا مسؤولين عن أي خسائر تنتج عن استخدام الموقع أو عدم إتاحته.",
          },
        ],
      },
      {
        heading: { en: "Governing law", ar: "القانون الحاكم" },
        paragraphs: [
          {
            en: "These terms are governed by the laws of the Arab Republic of Egypt, and the courts of Cairo have jurisdiction over any dispute.",
            ar: "تخضع هذه الشروط لقوانين جمهورية مصر العربية، وتختص محاكم القاهرة بنظر أي نزاع.",
          },
        ],
      },
      {
        heading: { en: "Changes and contact", ar: "التعديلات والتواصل" },
        paragraphs: [
          {
            en: `We may update these terms and will change the date at the top of this page when we do. Questions: ${n.inbox}.`,
            ar: `قد نحدّث هذه الشروط، وسنغيّر التاريخ أعلى الصفحة عند ذلك. للاستفسارات: ${n.inbox}.`,
          },
        ],
      },
    ],
  };
}
