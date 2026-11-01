// Sample articles. All placeholders (CLAUDE.md rule 5) until MAS sends its own; the site labels them as
// samples wherever they show.
import type { Insight } from "./types";

export const insights: Insight[] = [
  {
    slug: "reading-your-menu",
    title: { en: "Reading your menu like a map", ar: "اقرأ المنيو كأنه خريطة" },
    excerpt: {
      en: "Which dishes sell, which ones pay, and what to do with the ones that do neither.",
      ar: "أي الأطباق تُباع، وأيها يربح، وماذا تفعل بالأطباق التي لا تحقق هذا ولا ذاك.",
    },
    body: {
      en: [
        "Every dish on a menu does two jobs: it sells, and it earns. Put each item on a simple grid, how often it is ordered against how much it leaves after its cost, and the menu turns into a map.",
        "Dishes that sell well and earn well deserve the best place on the page. Popular dishes that earn little need a new recipe, a new portion or a new price. Dishes that earn well but rarely sell need a better description or a better spot. The rest can usually go.",
        "Do it every quarter with real sales from the till, not with memory. A menu that is read this way gets shorter, clearer and more profitable at the same time.",
      ],
      ar: [
        "كل طبق في المنيو له مهمتان: أن يُباع، وأن يربح. ضع كل صنف على شبكة بسيطة، عدد مرات طلبه مقابل ما يتبقى منه بعد تكلفته، فيتحول المنيو إلى خريطة.",
        "الأطباق التي تُباع كثيرًا وتربح جيدًا تستحق أفضل مكان في الصفحة. والأطباق المطلوبة قليلة الربح تحتاج وصفة جديدة أو حصة جديدة أو سعرًا جديدًا. والأطباق المربحة التي نادرًا ما تُطلب تحتاج وصفًا أفضل أو مكانًا أفضل. والباقي يمكن غالبًا الاستغناء عنه.",
        "كرر ذلك كل ثلاثة أشهر بأرقام المبيعات الحقيقية من نقطة البيع، لا من الذاكرة. المنيو الذي يُقرأ بهذه الطريقة يصبح أقصر وأوضح وأكثر ربحًا في الوقت نفسه.",
      ],
    },
    publishedAt: "2026-10-12",
    imageSlotId: "mas.insights.reading-your-menu",
    placeholder: true,
  },
  {
    slug: "the-ninety-days-before-opening",
    title: { en: "The ninety days before opening", ar: "التسعون يومًا قبل الافتتاح" },
    excerpt: {
      en: "What has to be true, week by week, before the first guest walks in.",
      ar: "ما يجب أن يكون جاهزًا، أسبوعًا بعد أسبوع، قبل أن يدخل أول ضيف.",
    },
    body: {
      en: [
        "Most opening problems are decided long before opening day. Ninety days out, the menu should be fixed, the suppliers chosen and the kitchen equipment ordered.",
        "Sixty days out, the team is hired and the training plan is written. Thirty days out, the systems are live: the till, the stock counts, the booking line. The last two weeks belong to rehearsals, with friends and family as the first guests.",
        "An opening plan with owners and dates for each step is less exciting than a launch party, and it is the reason the party goes well.",
      ],
      ar: [
        "أغلب مشكلات الافتتاح تُحسم قبل يوم الافتتاح بوقت طويل. قبل تسعين يومًا يجب أن يكون المنيو ثابتًا، والموردون مختارين، ومعدات المطبخ مطلوبة.",
        "قبل ستين يومًا يكون الفريق قد تم تعيينه وخطة التدريب مكتوبة. وقبل ثلاثين يومًا تعمل الأنظمة: نقطة البيع، وجرد المخزون، وخط الحجز. والأسبوعان الأخيران للبروفات، مع الأهل والأصدقاء كأول ضيوف.",
        "خطة افتتاح بمسؤول وموعد لكل خطوة أقل إثارة من حفل الافتتاح، لكنها السبب في نجاحه.",
      ],
    },
    publishedAt: "2026-09-28",
    imageSlotId: "mas.insights.the-ninety-days-before-opening",
    placeholder: true,
  },
  {
    slug: "hiring-your-first-team",
    title: { en: "Hiring your first team", ar: "تعيين فريقك الأول" },
    excerpt: {
      en: "Fewer, better people, trained to one standard before the doors open.",
      ar: "عدد أقل وكفاءة أعلى، بتدريب على معيار واحد قبل فتح الأبواب.",
    },
    body: {
      en: [
        "A new place is tempted to hire for its busiest night. Hire for an ordinary Tuesday instead, and build a short list of people to call when the room fills up.",
        "Look for attitude first and teach the rest: the menu, the steps of service, the way a table is set. Write those standards down, so every shift is trained the same way.",
        "The first team sets the tone for every team after it. Time spent choosing and training them is the cheapest marketing a restaurant will ever do.",
      ],
      ar: [
        "المكان الجديد يميل إلى التعيين على حساب أكثر لياليه ازدحامًا. عيّن على حساب يوم ثلاثاء عادي، وجهّز قائمة قصيرة بأشخاص تتصل بهم حين تمتلئ الصالة.",
        "ابحث عن السلوك أولًا وعلّم الباقي: المنيو، وخطوات الخدمة، وطريقة تجهيز الطاولة. واكتب هذه المعايير، ليتدرب كل شيفت بالطريقة نفسها.",
        "الفريق الأول يحدد الطابع لكل فريق بعده. والوقت الذي تقضيه في اختياره وتدريبه هو أرخص تسويق يمكن أن يقوم به مطعم.",
      ],
    },
    publishedAt: "2026-09-10",
    imageSlotId: "mas.insights.hiring-your-first-team",
    placeholder: true,
  },
];
