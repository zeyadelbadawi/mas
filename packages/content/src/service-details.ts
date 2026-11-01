// The nine services in depth (D69): what each one is, what it covers and what the owner receives. Built
// on the client's own summary of each service (D5, masServices) and standard industry practice; no
// figures or claims about MAS beyond what the client states.
import type { ServiceDetails } from "./types";

const c = (enT: string, arT: string, enD: string, arD: string) => ({
  t: { en: enT, ar: arT },
  d: { en: enD, ar: arD },
});
const r = (en: string, ar: string) => ({ en, ar });

export const serviceDetails: Record<string, ServiceDetails> = {
  "fnb-concept-development": {
    intro: {
      en: "Every successful café or restaurant starts with a clear idea of who it is for and why they will come back. We shape that idea with you, test it against the market and turn it into a plan you can build, fund and open.",
      ar: "كل كافيه أو مطعم ناجح يبدأ بفكرة واضحة: لمن هو، ولماذا سيعود إليه الناس. نبني هذه الفكرة معك، ونختبرها أمام السوق، ونحوّلها إلى خطة يمكن تنفيذها وتمويلها وافتتاحها.",
    },
    covers: [
      c(
        "Market research",
        "دراسة السوق",
        "The area, the guests it draws, the competition around it and the gaps it leaves open.",
        "المنطقة، والضيوف الذين تجذبهم، والمنافسة حولها، والفرص التي لم يشغلها أحد بعد.",
      ),
      c(
        "The concept",
        "الفكرة",
        "Cuisine, atmosphere, service style and price level, written down as one clear idea.",
        "نوع المطبخ، والأجواء، وأسلوب الخدمة، ومستوى الأسعار، مكتوبة كفكرة واحدة واضحة.",
      ),
      c(
        "Positioning",
        "التموضع",
        "What makes the place different, and why a guest would choose it over the one next door.",
        "ما الذي يميز المكان، ولماذا يختاره الضيف بدلًا من المكان المجاور.",
      ),
      c(
        "Space and flow",
        "المساحة وحركة العمل",
        "How the kitchen, bar and dining room should work together, before the design starts.",
        "كيف يجب أن يعمل المطبخ والبار والصالة معًا، قبل أن يبدأ التصميم.",
      ),
      c(
        "Business plan",
        "خطة العمل",
        "Investment, opening budget, expected sales and costs, and the point where it pays back.",
        "حجم الاستثمار، وميزانية الافتتاح، والمبيعات والتكاليف المتوقعة، ونقطة استرداد رأس المال.",
      ),
      c(
        "Opening roadmap",
        "خارطة الافتتاح",
        "Who does what and when, from signing the lease to the first service.",
        "من يفعل ماذا ومتى، من توقيع العقد حتى أول خدمة.",
      ),
    ],
    deliverables: [
      r("A written concept and positioning", "فكرة وتموضع مكتوبان"),
      r("A market and competition review", "مراجعة للسوق والمنافسين"),
      r("A business plan with a financial model", "خطة عمل بنموذج مالي"),
      r("An opening timeline with owners and dates", "جدول زمني للافتتاح بالمسؤوليات والمواعيد"),
    ],
  },
  "fnb-catering-service": {
    intro: {
      en: "A place is remembered by its name, its look and the way it speaks. We build the brand around the concept and then take it to guests: the launch, the social channels and the campaigns that keep the room full.",
      ar: "يتذكر الناس المكان باسمه وشكله وطريقة كلامه. نبني البراند حول الفكرة، ثم نوصله إلى الضيوف: الافتتاح، وقنوات التواصل الاجتماعي، والحملات التي تُبقي الصالة ممتلئة.",
    },
    covers: [
      c(
        "Brand strategy",
        "استراتيجية البراند",
        "The brand's personality, promise and audience, in line with the concept.",
        "شخصية البراند ووعده وجمهوره، بما يتماشى مع الفكرة.",
      ),
      c(
        "Naming",
        "التسمية",
        "A name that fits the place, is easy to say in Arabic and English, and is free to use.",
        "اسم يناسب المكان، وسهل النطق بالعربية والإنجليزية، ومتاح للاستخدام.",
      ),
      c(
        "Identity",
        "الهوية",
        "Logo, colours, type and the rules for using them, from the menu to the uniforms.",
        "الشعار والألوان والخطوط وقواعد استخدامها، من المنيو حتى الزي الرسمي.",
      ),
      c(
        "PR and launch",
        "العلاقات العامة والافتتاح",
        "The opening story, press and the first guests who will talk about the place.",
        "قصة الافتتاح، والإعلام، وأوائل الضيوف الذين سيتحدثون عن المكان.",
      ),
      c(
        "Social media and content",
        "السوشيال ميديا والمحتوى",
        "A content plan, photography and a steady voice across the channels guests use.",
        "خطة محتوى، وتصوير، وصوت ثابت على القنوات التي يستخدمها الضيوف.",
      ),
      c(
        "Campaigns",
        "الحملات",
        "Seasonal and event campaigns, with clear goals and results read after each one.",
        "حملات موسمية وحملات للمناسبات، بأهداف واضحة ونتائج تُقرأ بعد كل حملة.",
      ),
    ],
    deliverables: [
      r("A brand strategy and name", "استراتيجية البراند والاسم"),
      r("An identity with its usage guide", "هوية بصرية ودليل استخدامها"),
      r("A launch and PR plan", "خطة للافتتاح والعلاقات العامة"),
      r("A content calendar and campaign plan", "تقويم محتوى وخطة حملات"),
    ],
  },
  "menu-engineering-costing": {
    intro: {
      en: "The menu is where the concept meets the numbers. We build or rework it so every dish has a cost, a price and a reason to be there, and the kitchen can make it the same way every time.",
      ar: "المنيو هو المكان الذي تلتقي فيه الفكرة بالأرقام. نبنيه أو نعيد صياغته بحيث يكون لكل طبق تكلفة وسعر وسبب لوجوده، ويقدّمه المطبخ بالطريقة نفسها كل مرة.",
    },
    covers: [
      c(
        "Menu development",
        "تطوير المنيو",
        "The range, the categories and the balance of dishes that fit the concept and the kitchen.",
        "تشكيلة الأصناف والأقسام وتوازن الأطباق بما يناسب الفكرة والمطبخ.",
      ),
      c(
        "Recipe creation",
        "ابتكار الوصفات",
        "Dishes developed and tested, then written as standard recipes with weights and steps.",
        "أطباق تُطوَّر وتُختبر، ثم تُكتب كوصفات قياسية بالأوزان والخطوات.",
      ),
      c(
        "Recipe costing",
        "حساب تكلفة الوصفات",
        "The cost of every plate from current supplier prices, updated when prices change.",
        "تكلفة كل طبق من أسعار الموردين الحالية، وتُحدَّث عند تغيّر الأسعار.",
      ),
      c(
        "Pricing",
        "التسعير",
        "Prices set from cost, margin and the market, not from guesswork.",
        "أسعار مبنية على التكلفة والهامش والسوق، لا على التخمين.",
      ),
      c(
        "Menu engineering",
        "هندسة المنيو",
        "Each dish read by how well it sells and how much it earns, and the menu adjusted to match.",
        "قراءة كل طبق بحسب مبيعاته وما يحققه من ربح، وضبط المنيو على هذا الأساس.",
      ),
      c(
        "Menu design and layout",
        "تصميم المنيو وترتيبه",
        "Where each dish sits on the page and how it is described, so guests see the right ones first.",
        "مكان كل طبق في الصفحة وطريقة وصفه، ليرى الضيوف الأطباق المناسبة أولًا.",
      ),
    ],
    deliverables: [
      r("A complete menu with descriptions", "منيو كامل بالأوصاف"),
      r("Standard recipe cards with photos", "بطاقات وصفات قياسية بالصور"),
      r("A costing sheet for every dish", "ورقة تكلفة لكل طبق"),
      r("A menu-engineering review every quarter", "مراجعة هندسة المنيو كل ثلاثة أشهر"),
    ],
  },
  "events-management": {
    intro: {
      en: "Corporate days, private dinners and family celebrations each need their own planning. We handle the food and the event from the first brief to the last guest leaving, so the host can enjoy it too.",
      ar: "أيام الشركات، والعشاءات الخاصة، والاحتفالات العائلية، لكل منها تخطيطه الخاص. نتولى الطعام والمناسبة من أول اجتماع حتى مغادرة آخر ضيف، ليستمتع المضيف بها أيضًا.",
    },
    covers: [
      c(
        "Planning and brief",
        "التخطيط والمتطلبات",
        "The guests, the occasion, the budget and what success looks like for the host.",
        "الضيوف، والمناسبة، والميزانية، وما يعنيه النجاح بالنسبة للمضيف.",
      ),
      c(
        "Event menus",
        "منيو المناسبة",
        "Menus built for the occasion and the number of guests, including dietary needs.",
        "منيو مصمم للمناسبة ولعدد الضيوف، مع مراعاة الاحتياجات الغذائية الخاصة.",
      ),
      c(
        "Corporate events",
        "مناسبات الشركات",
        "Conferences, launches and staff days, served on time and to the brief.",
        "المؤتمرات، وإطلاق المنتجات، وأيام الموظفين، بخدمة في موعدها ووفق المطلوب.",
      ),
      c(
        "Private and social occasions",
        "المناسبات الخاصة والاجتماعية",
        "Dinners, engagements and family gatherings, at home or at a venue.",
        "العشاءات، والخطوبة، والتجمعات العائلية، في المنزل أو في مكان المناسبة.",
      ),
      c(
        "Venue, setup and suppliers",
        "المكان والتجهيز والموردون",
        "Furniture, tableware, decoration and the suppliers behind them, coordinated in one plan.",
        "الأثاث، وأدوات المائدة، والديكور، والموردون، منسّقون في خطة واحدة.",
      ),
      c(
        "Service on the day",
        "الخدمة يوم المناسبة",
        "The team, the timing and the running order, managed on site from start to finish.",
        "الفريق، والتوقيت، وترتيب الفقرات، بإدارة في الموقع من البداية حتى النهاية.",
      ),
    ],
    deliverables: [
      r("An event plan and budget", "خطة وميزانية للمناسبة"),
      r("A menu and tasting before the day", "منيو وتذوق قبل يوم المناسبة"),
      r("A running order for the team", "جدول تنفيذ للفريق"),
      r("A full team on the day", "فريق كامل يوم المناسبة"),
    ],
  },
  "recruitment-training": {
    intro: {
      en: "Guests remember people more than décor. We plan the team the place needs, find the right people and train them to one standard, so the service is the same on a quiet Tuesday as on a full Friday.",
      ar: "يتذكر الضيوف الناس أكثر من الديكور. نخطط للفريق الذي يحتاجه المكان، ونختار الأشخاص المناسبين، وندربهم على معيار واحد، لتكون الخدمة يوم ثلاثاء هادئ مثلها يوم جمعة مزدحم.",
    },
    covers: [
      c(
        "Staffing plan",
        "خطة العمالة",
        "The roles, the numbers and the shifts the place needs, matched to its busy hours.",
        "الوظائف، والأعداد، والورديات التي يحتاجها المكان، بحسب ساعات الذروة.",
      ),
      c(
        "Job descriptions",
        "الوصف الوظيفي",
        "Clear roles and expectations for every position, from the kitchen to the floor.",
        "أدوار وتوقعات واضحة لكل وظيفة، من المطبخ إلى الصالة.",
      ),
      c(
        "Recruitment",
        "التوظيف",
        "Sourcing, interviews and trial shifts to find people with the right attitude and skill.",
        "البحث عن المرشحين، والمقابلات، وورديات التجربة، لاختيار أصحاب السلوك والمهارة المناسبين.",
      ),
      c(
        "Onboarding",
        "التهيئة",
        "A structured first weeks for every new hire: the concept, the menu, the standards.",
        "أسابيع أولى منظمة لكل موظف جديد: الفكرة، والمنيو، والمعايير.",
      ),
      c(
        "Training",
        "التدريب",
        "Service steps, product knowledge, food safety and handling guests, taught and practised.",
        "خطوات الخدمة، ومعرفة المنتج، وسلامة الغذاء، والتعامل مع الضيوف، تُشرح وتُمارس.",
      ),
      c(
        "Continuous development",
        "التطوير المستمر",
        "Regular reviews, refreshers and a path for good people to grow and stay.",
        "مراجعات دورية، وتدريب تنشيطي، ومسار يتيح للمتميزين النمو والبقاء.",
      ),
    ],
    deliverables: [
      r("A staffing plan and organisation chart", "خطة عمالة وهيكل تنظيمي"),
      r("Job descriptions for every role", "وصف وظيفي لكل دور"),
      r("A trained opening team", "فريق افتتاح مدرَّب"),
      r("Training manuals and checklists", "أدلة تدريب وقوائم مراجعة"),
    ],
  },
  "operations-hospitality-management": {
    intro: {
      en: "Opening is one day; running well is every day after it. We set up and manage the daily operation so the kitchen, the floor and the back office work as one, and every guest gets the experience the concept promises.",
      ar: "الافتتاح يوم واحد، أما الإدارة الجيدة فهي كل يوم بعده. نضع نظام التشغيل اليومي وندير العمل ليعمل المطبخ والصالة والإدارة كفريق واحد، ويحصل كل ضيف على التجربة التي تعد بها الفكرة.",
    },
    covers: [
      c(
        "Standard operating procedures",
        "إجراءات التشغيل القياسية",
        "How every task is done, from opening the doors to closing the till, written and followed.",
        "طريقة أداء كل مهمة، من فتح الأبواب حتى إغلاق الخزينة، مكتوبة ومُتّبعة.",
      ),
      c(
        "Service standards",
        "معايير الخدمة",
        "The steps of service and the welcome guests should get, every visit.",
        "خطوات الخدمة والترحيب الذي يجب أن يلقاه الضيف في كل زيارة.",
      ),
      c(
        "Kitchen operations",
        "تشغيل المطبخ",
        "Preparation, the pass, hygiene and food safety, organised for speed and consistency.",
        "التحضير، ومنطقة تسليم الأطباق، والنظافة، وسلامة الغذاء، منظمة للسرعة والثبات.",
      ),
      c(
        "Shift management",
        "إدارة الورديات",
        "Rotas, briefings and handovers so each shift starts ready and ends clean.",
        "جداول الورديات، والاجتماعات القصيرة، والتسليم، لتبدأ كل وردية جاهزة وتنتهي منظمة.",
      ),
      c(
        "Guest experience",
        "تجربة الضيف",
        "Feedback, complaints and reviews handled quickly, and used to improve the service.",
        "الملاحظات، والشكاوى، والتقييمات، تُعالج بسرعة وتُستخدم لتحسين الخدمة.",
      ),
      c(
        "Day-to-day management",
        "الإدارة اليومية",
        "A manager's eye on the place every day, with the numbers reported to the owner.",
        "متابعة إدارية للمكان كل يوم، مع تقارير بالأرقام لصاحب المشروع.",
      ),
    ],
    deliverables: [
      r("An operations manual", "دليل تشغيل"),
      r("Service standards and checklists", "معايير خدمة وقوائم مراجعة"),
      r("A daily and weekly reporting routine", "روتين تقارير يومي وأسبوعي"),
      r("Ongoing management, if you want it", "إدارة مستمرة إن رغبت"),
    ],
  },
  "financial-control-performance": {
    intro: {
      en: "A busy room is not always a profitable one. We look at where the money goes, put controls on the costs that matter most and give the owner a clear view of performance every week.",
      ar: "الصالة المزدحمة ليست دائمًا صالة مربحة. ننظر إلى أين تذهب الأموال، ونضبط التكاليف الأهم، ونمنح صاحب المشروع رؤية واضحة للأداء كل أسبوع.",
    },
    covers: [
      c(
        "Financial review and audit",
        "المراجعة والتدقيق المالي",
        "A full look at the accounts, the controls and where money is being lost.",
        "نظرة شاملة على الحسابات وأنظمة الرقابة ومواطن تسرّب الأموال.",
      ),
      c(
        "Food-cost control",
        "التحكم في تكلفة الطعام",
        "Actual food cost measured against the recipes, with waste and variances explained.",
        "قياس تكلفة الطعام الفعلية مقابل الوصفات، مع تفسير الهدر والفروقات.",
      ),
      c(
        "Profit and loss",
        "الأرباح والخسائر",
        "A monthly P&L the owner can read, line by line, with what changed and why.",
        "قائمة أرباح وخسائر شهرية يستطيع صاحب المشروع قراءتها بندًا بندًا، مع ما تغيّر وسببه.",
      ),
      c(
        "Cash flow",
        "التدفق النقدي",
        "Money in and out planned ahead, so suppliers and salaries are never a surprise.",
        "تخطيط مسبق لما يدخل وما يخرج من أموال، فلا تكون مستحقات الموردين والرواتب مفاجأة.",
      ),
      c(
        "POS analysis",
        "تحليل نقاط البيع",
        "Sales by item, hour and server, read to find what drives the day.",
        "المبيعات حسب الصنف والساعة والموظف، تُقرأ لمعرفة ما يحرك اليوم.",
      ),
      c(
        "Performance reporting",
        "تقارير الأداء",
        "A short weekly report with the few numbers that matter and the actions they call for.",
        "تقرير أسبوعي قصير بالأرقام القليلة المهمة والإجراءات التي تتطلبها.",
      ),
    ],
    deliverables: [
      r("A financial health review", "تقييم للوضع المالي"),
      r("Cost-control procedures", "إجراءات للتحكم في التكاليف"),
      r("A monthly P&L and cash-flow plan", "قائمة أرباح وخسائر شهرية وخطة تدفق نقدي"),
      r("A weekly performance dashboard", "لوحة أداء أسبوعية"),
    ],
  },
  "production-packaging-supply": {
    intro: {
      en: "Behind every plate is a chain of suppliers, stock and preparation. We organise that chain, and where a brand grows, set up central production and packaging so every branch serves the same product.",
      ar: "وراء كل طبق سلسلة من الموردين والمخزون والتحضير. ننظم هذه السلسلة، وحين يكبر البراند ننشئ إنتاجًا وتغليفًا مركزيًا لتقدم كل الفروع المنتج نفسه.",
    },
    covers: [
      c(
        "Procurement",
        "المشتريات",
        "The right suppliers chosen and prices agreed, with specifications for what is bought.",
        "اختيار الموردين المناسبين والاتفاق على الأسعار، مع مواصفات لما يُشترى.",
      ),
      c(
        "Supplier coordination",
        "التنسيق مع الموردين",
        "Orders, deliveries and quality checks on arrival, managed on a schedule.",
        "الطلبات، والتوريدات، وفحص الجودة عند الاستلام، تُدار وفق جدول.",
      ),
      c(
        "Inventory",
        "المخزون",
        "Stock levels, counts and first-in-first-out, so nothing runs out and little is wasted.",
        "مستويات المخزون والجرد ونظام الوارد أولًا يُصرف أولًا، فلا ينفد شيء ويقل الهدر.",
      ),
      c(
        "Central production",
        "الإنتاج المركزي",
        "Sauces, doughs, bakery and prepared items made in one place for several branches.",
        "الصوصات، والعجائن، والمخبوزات، والأصناف المجهزة، تُنتج في مكان واحد لعدة فروع.",
      ),
      c(
        "Packaging",
        "التغليف",
        "Packaging for delivery and retail that keeps food at its best and carries the brand.",
        "تغليف للتوصيل والبيع يحافظ على جودة الطعام ويحمل هوية البراند.",
      ),
      c(
        "Supply and distribution",
        "التوريد والتوزيع",
        "Getting products to each branch on time, with food safety kept along the way.",
        "توصيل المنتجات إلى كل فرع في موعدها، مع الحفاظ على سلامة الغذاء طوال الطريق.",
      ),
    ],
    deliverables: [
      r("A supplier list with agreed specifications", "قائمة موردين بمواصفات متفق عليها"),
      r("Purchasing and inventory procedures", "إجراءات للمشتريات والمخزون"),
      r("A central production plan, where it makes sense", "خطة إنتاج مركزي حين يكون ذلك مجديًا"),
      r("Packaging specifications", "مواصفات التغليف"),
    ],
  },
  "tools-quality-assurance": {
    intro: {
      en: "Standards only hold if someone checks them. We set up the systems and tools a place runs on, then measure the guest experience from the outside, the way a guest sees it.",
      ar: "المعايير لا تصمد إلا إذا تابعها أحد. نجهّز الأنظمة والأدوات التي يعمل بها المكان، ثم نقيس تجربة الضيف من الخارج، كما يراها الضيف.",
    },
    covers: [
      c(
        "POS setup and advice",
        "إعداد أنظمة نقاط البيع",
        "Choosing and setting up the point-of-sale system, menus and reports to fit the operation.",
        "اختيار نظام نقاط البيع وإعداده، مع المنيو والتقارير بما يناسب التشغيل.",
      ),
      c(
        "Mystery shopping",
        "المتسوق الخفي",
        "Unannounced visits that score the experience against the place's own standards.",
        "زيارات غير معلنة تقيّم التجربة وفق معايير المكان نفسه.",
      ),
      c(
        "Guest-experience audits",
        "تدقيق تجربة الضيف",
        "A full review of the visit, from the booking to the bill, with clear fixes.",
        "مراجعة كاملة للزيارة، من الحجز حتى الفاتورة، مع حلول واضحة.",
      ),
      c(
        "Food safety and hygiene",
        "سلامة الغذاء والنظافة",
        "Checks built on HACCP principles, in line with the National Food Safety Authority's requirements.",
        "فحوصات مبنية على مبادئ تحليل المخاطر ونقاط التحكم الحرجة (HACCP)، بما يتماشى مع متطلبات الهيئة القومية لسلامة الغذاء.",
      ),
      c(
        "Equipment rental",
        "تأجير المعدات",
        "Kitchen and service equipment for openings, events and busy seasons.",
        "معدات المطبخ والخدمة للافتتاحات والمناسبات والمواسم المزدحمة.",
      ),
      c(
        "Tableware rental",
        "تأجير أدوات المائدة",
        "Plates, glassware and cutlery when an event or a launch needs more than the place owns.",
        "الأطباق والكاسات وأدوات المائدة حين تحتاج مناسبة أو افتتاح أكثر مما يملكه المكان.",
      ),
    ],
    deliverables: [
      r("A POS set up for the operation", "نظام نقاط بيع مُعدّ للتشغيل"),
      r("Mystery-shopping reports with scores", "تقارير المتسوق الخفي بالتقييمات"),
      r("An audit with a list of fixes", "تقرير تدقيق بقائمة الإصلاحات"),
      r("Equipment and tableware when needed", "المعدات وأدوات المائدة عند الحاجة"),
    ],
  },
};
