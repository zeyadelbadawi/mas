import type { MasService } from "./types";

// The 9 client-verified services (D5). Summaries come from the MAS brand-strategy deck.
export const masServices: MasService[] = [
  {
    slug: "fnb-concept-development",
    order: 1,
    title: { en: "F&B Concept Development", ar: "تطوير مفاهيم المطاعم والكافيهات" },
    summary: {
      en: "Concept development, market research, business planning and positioning.",
      ar: "تطوير الفكرة، ودراسة السوق، وخطة العمل، وتحديد التموضع.",
    },
  },
  {
    slug: "fnb-catering-service",
    order: 2,
    title: { en: "F&B Catering Service", ar: "خدمات الضيافة والتموين" },
    summary: {
      en: "Brand strategy, naming, identity and positioning. PR, marketing strategy, social media, content and campaigns.",
      ar: "استراتيجية البراند والتسمية والهوية والتموضع. العلاقات العامة واستراتيجية التسويق والسوشيال ميديا والمحتوى والحملات.",
    },
  },
  {
    slug: "menu-engineering-costing",
    order: 3,
    title: { en: "Menu Engineering & Costing", ar: "هندسة المنيو والتكاليف" },
    summary: {
      en: "Menu development and engineering. Recipe creation, costing and profitability optimisation.",
      ar: "تطوير المنيو وهندسته. ابتكار الوصفات وحساب التكلفة ورفع الربحية.",
    },
  },
  {
    slug: "events-management",
    order: 4,
    title: { en: "Events Management", ar: "إدارة المناسبات" },
    summary: {
      en: "Catering for corporate, private, social and event needs. Event management from start to finish.",
      ar: "ضيافة لمناسبات الشركات والخاصة والاجتماعية، وإدارة المناسبة من البداية إلى النهاية.",
    },
  },
  {
    slug: "recruitment-training",
    order: 5,
    title: { en: "Recruitment & Training", ar: "التوظيف والتدريب" },
    summary: {
      en: "Recruitment, staffing plans and talent sourcing. Onboarding, training and continuous development.",
      ar: "التوظيف وخطط العمالة واستقطاب الكفاءات. التهيئة والتدريب والتطوير المستمر.",
    },
  },
  {
    slug: "operations-hospitality-management",
    order: 6,
    title: { en: "Operations & Hospitality Management", ar: "إدارة التشغيل والضيافة" },
    summary: {
      en: "Day-to-day restaurant and café operations. Hospitality management that drives great guest experiences.",
      ar: "تشغيل المطاعم والكافيهات يومًا بيوم، وإدارة ضيافة تصنع تجربة مميزة للضيوف.",
    },
  },
  {
    slug: "financial-control-performance",
    order: 7,
    title: { en: "Financial Control & Performance", ar: "الرقابة المالية والأداء" },
    summary: {
      en: "Financial review and audit. Food-cost control. P&L, cash-flow, POS analysis and performance reporting.",
      ar: "مراجعة وتدقيق مالي، والتحكم في تكلفة الطعام، وتحليل الأرباح والخسائر والتدفق النقدي ونقاط البيع، وتقارير الأداء.",
    },
  },
  {
    slug: "production-packaging-supply",
    order: 8,
    title: { en: "Production, Packaging & Supply", ar: "الإنتاج والتغليف والتوريد" },
    summary: {
      en: "Procurement, inventory and supplier coordination. Production/manufacturing, packaging and supply management.",
      ar: "المشتريات والمخزون والتنسيق مع الموردين. الإنتاج والتصنيع والتغليف وإدارة التوريد.",
    },
  },
  {
    slug: "tools-quality-assurance",
    order: 9,
    title: { en: "Tools & Quality Assurance", ar: "الأدوات وضمان الجودة" },
    summary: {
      en: "POS systems setup and advice. Mystery shopping and guest-experience audits. Equipment and tableware rental.",
      ar: "إعداد أنظمة نقاط البيع والاستشارات. المتسوق الخفي وتقييم تجربة الضيوف. تأجير المعدات وأدوات المائدة.",
    },
  },
];
