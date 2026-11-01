// MAS's articles (D66): written for café and restaurant owners from published research, cited at the end
// of each article. The images are ours, made with Higgsfield (D66).
import type { Insight, InsightBlock } from "./types";

const p = (en: string, ar: string): InsightBlock => ({ kind: "p", text: { en, ar } });
const h2 = (en: string, ar: string): InsightBlock => ({ kind: "h2", text: { en, ar } });
const list = (...items: [string, string][]): InsightBlock => ({
  kind: "list",
  items: items.map(([en, ar]) => ({ en, ar })),
});
const figure = (imageSlotId: string, en: string, ar: string): InsightBlock => ({
  kind: "figure",
  imageSlotId,
  caption: { en, ar },
});

export const insights: Insight[] = [
  {
    slug: "reading-your-menu",
    title: { en: "Reading your menu like a map", ar: "اقرأ المنيو كأنه خريطة" },
    excerpt: {
      en: "Every dish has two jobs: to sell and to earn. Menu engineering puts both numbers side by side and shows you where to act first.",
      ar: "لكل طبق مهمتان: أن يُباع وأن يربح. هندسة المنيو تضع الرقمين جنبًا إلى جنب وتُريك من أين تبدأ.",
    },
    body: [
      p(
        "Every dish on a menu has two jobs: it has to sell, and it has to earn. Most owners know which dishes sell. Far fewer know what each one leaves behind once its ingredients are paid for. Menu engineering puts both numbers side by side.",
        "لكل طبق في المنيو مهمتان: أن يُباع، وأن يربح. أغلب أصحاب المطاعم يعرفون أي الأطباق تُباع، لكن قليلين يعرفون ما يتبقى من كل طبق بعد دفع ثمن مكوناته. هندسة المنيو تضع الرقمين جنبًا إلى جنب.",
      ),
      h2("Where the method comes from", "من أين جاءت الطريقة"),
      p(
        "Michael Kasavana and Donald Smith set it out at Michigan State University in 1982, borrowing a portfolio matrix from business strategy. Each dish is placed on two axes: how often it is ordered compared with the rest of its section, and its contribution margin, which is its selling price minus the cost of the food on the plate.",
        "وضعها مايكل كاسافانا ودونالد سميث في جامعة ولاية ميشيغان عام 1982، مستعيرين مصفوفة من عالم استراتيجيات الأعمال. يوضع كل طبق على محورين: كم مرة يُطلب مقارنةً ببقية أطباق قسمه، وهامش مساهمته، أي سعر بيعه ناقص تكلفة الطعام الموجود في الطبق.",
      ),
      h2("Two numbers for every dish", "رقمان لكل طبق"),
      list(
        [
          "Contribution margin: the price minus the plate cost. A main sold at EGP 320 that costs EGP 110 in ingredients contributes EGP 210.",
          "هامش المساهمة: السعر ناقص تكلفة الطبق. طبق رئيسي يُباع بـ 320 جنيهًا وتكلف مكوناته 110 جنيهات يساهم بـ 210 جنيهات.",
        ],
        [
          "Menu mix: the dish's share of everything sold in its section over the same period.",
          "نسبة المبيعات: حصة الطبق من كل ما بيع في قسمه خلال الفترة نفسها.",
        ],
        [
          "The popularity line: in the original method a dish counts as popular when it reaches 70 percent of an equal share. With ten mains an equal share is 10 percent, so the line sits at 7 percent.",
          "خط الشعبية: في الطريقة الأصلية يُعد الطبق مطلوبًا إذا بلغ 70 في المئة من الحصة المتساوية. مع عشرة أطباق رئيسية تكون الحصة المتساوية 10 في المئة، فيقع الخط عند 7 في المئة.",
        ],
        [
          "The margin line: the section's average contribution margin, weighted by how many of each dish were sold.",
          "خط الربحية: متوسط هامش المساهمة في القسم، مرجّحًا بعدد ما بيع من كل طبق.",
        ],
      ),
      h2("Four kinds of dish", "أربعة أنواع من الأطباق"),
      list(
        [
          "Stars, popular and profitable: keep them as they are, give them the best place on the page, and protect their recipe and portion.",
          "النجوم، مطلوبة ومربحة: أبقِها كما هي، وامنحها أفضل مكان في الصفحة، واحمِ وصفتها وحجم حصتها.",
        ],
        [
          "Plowhorses, popular but thin: look at the recipe and the portion before the price. A change to a side or a garnish often fixes the margin without the guest noticing.",
          "أحصنة العمل، مطلوبة لكن ربحها ضعيف: راجع الوصفة وحجم الحصة قبل السعر. تغيير بسيط في الطبق الجانبي أو التزيين يُصلح الهامش كثيرًا دون أن يلاحظ الضيف.",
        ],
        [
          "Puzzles, profitable but rarely ordered: move them to where the eye lands, rename them, describe them better, or have the team recommend them.",
          "الألغاز، مربحة لكن نادرًا ما تُطلب: انقلها إلى حيث تقع العين، أو غيّر اسمها، أو صِفها بشكل أفضل، أو اجعل الفريق يرشّحها.",
        ],
        [
          "Dogs, neither: replace them, or keep one only if it does a job the numbers can't see, such as being the only vegetarian main.",
          "الأطباق الضعيفة، لا هذا ولا ذاك: استبدلها، أو أبقِ واحدًا منها فقط إذا كان يؤدي دورًا لا تراه الأرقام، كأن يكون الطبق النباتي الوحيد.",
        ],
      ),
      figure(
        "mas.insights.reading-your-menu.pass",
        "The margin is decided on the pass: a recipe card and a scale keep every plate at its costed portion.",
        "الهامش يُحسم عند تجهيز الطبق: بطاقة الوصفة والميزان يُبقيان كل طبق على الحصة المحسوبة تكلفتها.",
      ),
      h2("Making it a habit", "اجعلها عادة"),
      p(
        "Run the analysis section by section, starters with starters and mains with mains, using the till's real sales and recipe costs that are up to date. Once a quarter is enough for most places, and again after every price rise from a supplier.",
        "أجرِ التحليل قسمًا قسمًا، المقبلات مع المقبلات والأطباق الرئيسية مع الرئيسية، بأرقام المبيعات الحقيقية من نقطة البيع وتكاليف وصفات محدّثة. مرة كل ثلاثة أشهر تكفي لأغلب الأماكن، ومرة أخرى بعد كل زيادة في أسعار الموردين.",
      ),
      p(
        "A menu read this way usually gets shorter, easier to cook from and more profitable at the same time. The matrix doesn't decide for you. It tells you where to look first.",
        "المنيو الذي يُقرأ بهذه الطريقة يصبح عادةً أقصر وأسهل في التحضير وأكثر ربحًا في الوقت نفسه. المصفوفة لا تقرر عنك، لكنها تخبرك أين تنظر أولًا.",
      ),
    ],
    sources: [
      {
        title:
          "Kasavana, M. L. & Smith, D. I. (1982). Menu Engineering: A Practical Guide to Menu Analysis",
        url: "https://search.worldcat.org/search?q=Menu+Engineering+A+Practical+Guide+to+Menu+Analysis",
      },
      {
        title:
          "Hospitality Review, Florida International University (1995): applying the Kasavana–Smith method",
        url: "https://digitalcommons.fiu.edu/record/17973/files/V13n195e.pdf",
      },
    ],
    publishedAt: "2026-10-18",
    imageSlotId: "mas.insights.reading-your-menu",
    placeholder: false,
  },
  {
    slug: "why-restaurants-close",
    title: {
      en: "Why restaurants close, and what the survivors do differently",
      ar: "لماذا تُغلق المطاعم، وماذا يفعل الناجون بشكل مختلف",
    },
    excerpt: {
      en: "The famous “nine in ten fail in year one” is a myth. A study of every restaurant in one city shows the real risk, and what separated the places that lasted.",
      ar: "مقولة «تسعة من كل عشرة مطاعم تفشل في عامها الأول» خرافة. دراسة شملت كل مطاعم مدينة كاملة تكشف حجم المخاطرة الحقيقي، وما ميّز الأماكن التي استمرت.",
    },
    body: [
      p(
        "“Nine out of ten restaurants fail in their first year” is one of the most repeated lines in the business. In 2005 H.G. Parsa and his colleagues tested it in the Cornell Hotel and Restaurant Administration Quarterly, and the real number was far lower.",
        "«تسعة من كل عشرة مطاعم تفشل في عامها الأول» من أكثر العبارات تكرارًا في هذا المجال. في عام 2005 اختبرها إتش. جي. بارسا وزملاؤه في دورية كورنيل لإدارة الفنادق والمطاعم، فجاء الرقم الحقيقي أقل بكثير.",
      ),
      h2("What the numbers say", "ماذا تقول الأرقام"),
      p(
        "The researchers followed the restaurant permits of Columbus, Ohio, from 1996 to 1999 and recorded every change of ownership. About 26 percent of restaurants changed hands or closed in their first year, and about 60 percent within three years. That is turnover rather than failure alone: some of those restaurants were sold and kept trading.",
        "تتبّع الباحثون تراخيص المطاعم في مدينة كولومبس بولاية أوهايو من 1996 إلى 1999، وسجّلوا كل تغيير في الملكية. نحو 26 في المئة من المطاعم انتقلت ملكيتها أو أُغلقت في عامها الأول، ونحو 60 في المئة خلال ثلاث سنوات. وهذا معدل تغيّر لا فشل فقط، إذ بيع بعض هذه المطاعم واستمر في العمل.",
      ),
      p(
        "So the risk is real, but it is not fate. The study then interviewed owners whose restaurants had lasted and owners whose restaurants had closed, to find what separated them.",
        "المخاطرة إذن حقيقية، لكنها ليست قدرًا. بعد ذلك أجرت الدراسة مقابلات مع أصحاب مطاعم استمرت وأصحاب مطاعم أُغلقت، لمعرفة ما الذي فرّق بينهم.",
      ),
      h2("A concept, not just a cuisine", "فكرة متكاملة، لا مجرد نوع طعام"),
      p(
        "The clearest difference was the concept. The owners who lasted described a concept that went beyond the food to a way of operating: how the place runs and how it treats its team and its guests. The owners who had closed described their concept only as a type of food. They all served good food, and it was not enough.",
        "كان أوضح فرق هو الفكرة. أصحاب المطاعم التي استمرت وصفوا فكرة تتجاوز الطعام إلى طريقة في العمل: كيف يُدار المكان، وكيف يعامل فريقه وضيوفه. أما من أغلقوا فوصفوا فكرتهم بنوع الطعام فقط. كلهم قدّموا طعامًا جيدًا، ولم يكن ذلك كافيًا.",
      ),
      p(
        "Formal strategy mattered less than expected. Some of the most successful owners had none and adapted as they went, while some who closed had detailed plans.",
        "أما الاستراتيجية المكتوبة فكانت أقل أهمية مما يُتوقع. بعض أنجح الملاك لم يكن لديهم استراتيجية وكانوا يتكيّفون مع الطريق، بينما كان لدى بعض من أغلقوا خطط مفصّلة.",
      ),
      h2("What the places that lasted had in common", "ما الذي جمع بين الأماكن التي استمرت"),
      list(
        [
          "Attention. Closures came largely from not giving the business enough time, passion or knowledge.",
          "الاهتمام. جاءت حالات الإغلاق في الغالب من عدم منح المشروع ما يكفي من الوقت أو الشغف أو المعرفة.",
        ],
        [
          "Financial management. Some of the most successful owners started with little capital; managing the money every week mattered more than the size of the investment.",
          "الإدارة المالية. بعض أنجح الملاك بدأوا برأس مال صغير؛ وكانت متابعة الأموال أسبوعيًا أهم من حجم الاستثمار.",
        ],
        [
          "Relationships. Successful owners credited their relationships with guests; owners who had closed tended to blame competitors' marketing.",
          "العلاقات. نسب الناجحون نجاحهم إلى علاقتهم بالضيوف، بينما مال من أغلقوا إلى لوم تسويق المنافسين.",
        ],
        [
          "A life that can carry the business. Family pressure and burnout were behind many of the closures.",
          "حياة تتحمل المشروع. كانت ضغوط العائلة والإنهاك وراء كثير من حالات الإغلاق.",
        ],
        [
          "Planned growth. One owner who closed had expanded until the restaurant became unmanageable.",
          "نمو مخطط. أحد من أغلقوا توسّع حتى صار المطعم خارج السيطرة.",
        ],
      ),
      p(
        "Location mattered less than people assume. In the interviews, a poor location could be overcome by a great product and operation, but a good location could not save a bad one. No restaurant in the sample closed because of outside forces alone.",
        "وكان الموقع أقل أهمية مما يظن الناس. ففي المقابلات أمكن لمنتج وتشغيل ممتازين أن يتغلبا على موقع ضعيف، لكن الموقع الجيد لم ينقذ مطعمًا سيئًا. ولم يُغلق أي مطعم في العينة بسبب عوامل خارجية وحدها.",
      ),
      h2("Before you open", "قبل أن تفتتح"),
      p(
        "Write the concept down beyond the menu: who it is for, how service runs, what the team is like and what a guest should feel. Read the numbers every week. Plan growth before it happens. And build a team and a routine that do not depend on one person being there every hour.",
        "اكتب فكرتك بما يتجاوز المنيو: لمن هي، وكيف تسير الخدمة، وكيف يكون الفريق، وماذا يجب أن يشعر به الضيف. اقرأ الأرقام كل أسبوع. خطّط للنمو قبل أن يحدث. وابنِ فريقًا ونظام عمل لا يعتمدان على وجود شخص واحد في كل ساعة.",
      ),
    ],
    sources: [
      {
        title:
          "Parsa, H. G., Self, J. T., Njite, D. & King, T. (2005). Why Restaurants Fail. Cornell Hotel and Restaurant Administration Quarterly, 46(3), 304–322",
        url: "https://doi.org/10.1177/0010880405275598",
      },
    ],
    publishedAt: "2026-10-25",
    imageSlotId: "mas.insights.why-restaurants-close",
    placeholder: false,
  },
  {
    slug: "what-one-star-is-worth",
    title: { en: "What one more star is worth", ar: "كم تساوي نجمة إضافية" },
    excerpt: {
      en: "A Harvard study linked one extra star on a review site to 5 to 9 percent more revenue for independent restaurants. The rating follows the operation.",
      ar: "ربطت دراسة من هارفارد بين نجمة إضافية على موقع التقييمات وزيادة 5 إلى 9 في المئة في إيرادات المطاعم المستقلة. والتقييم يتبع التشغيل.",
    },
    body: [
      p(
        "Guests read reviews before they come, and the rating beside a restaurant's name is often the first thing they see. One of the best-known studies of what that rating does to the business is Michael Luca's 2011 working paper at Harvard Business School.",
        "يقرأ الضيوف التقييمات قبل أن يأتوا، وكثيرًا ما يكون التقييم بجوار اسم المطعم أول ما يرونه. ومن أشهر الدراسات عن أثر هذا التقييم على العمل ورقة مايكل لوكا البحثية في كلية هارفارد للأعمال عام 2011.",
      ),
      h2("The Seattle study", "دراسة سياتل"),
      p(
        "Luca matched Yelp reviews of Seattle restaurants with revenue data from the state of Washington. Yelp rounds each restaurant's average to the nearest half star, so two places with almost the same average can show different ratings. That let him separate the effect of the rating itself from the quality of the food.",
        "قارن لوكا تقييمات مطاعم سياتل على موقع Yelp ببيانات إيراداتها من ولاية واشنطن. يقرّب Yelp متوسط كل مطعم إلى أقرب نصف نجمة، فقد يظهر مكانان متوسطهما شبه متطابق بتقييمين مختلفين. وهذا سمح له بفصل أثر التقييم نفسه عن جودة الطعام.",
      ),
      p(
        "One more star was linked to 5 to 9 percent more revenue. The effect was on independent restaurants; chains were largely unaffected, because guests already know what to expect from a chain.",
        "ارتبطت النجمة الإضافية بزيادة في الإيرادات بين 5 و9 في المئة. وكان الأثر على المطاعم المستقلة، أما السلاسل فلم تتأثر تقريبًا، لأن الضيوف يعرفون مسبقًا ماذا ينتظرهم فيها.",
      ),
      p(
        "One study in one city is not a rule for every market. But the mechanism is easy to recognise anywhere: when guests know little about a place, the rating fills the gap.",
        "دراسة واحدة في مدينة واحدة ليست قاعدة لكل سوق، لكن الآلية مألوفة في كل مكان: حين لا يعرف الضيوف الكثير عن مكان ما، يملأ التقييم هذا الفراغ.",
      ),
      figure(
        "mas.insights.what-one-star-is-worth.service",
        "A rating is the sum of many small moments at the table.",
        "التقييم هو مجموع لحظات صغيرة كثيرة على الطاولة.",
      ),
      h2("The rating follows the operation", "التقييم يتبع التشغيل"),
      p(
        "A rating is the result of every visit, so the work happens in the room, not on the review site. A few habits move it steadily:",
        "التقييم نتيجة كل زيارة، لذلك فالعمل يحدث داخل المكان لا على موقع التقييمات. وهذه عادات تحرّكه بثبات:",
      ),
      list(
        [
          "Make the basics consistent: the same dish, the same portion and the same welcome every night.",
          "اجعل الأساسيات ثابتة: الطبق نفسه، والحصة نفسها، والترحيب نفسه كل ليلة.",
        ],
        [
          "Ask at the right moment: a guest who has just said the meal was good is the one to invite to write about it.",
          "اطلب في اللحظة المناسبة: الضيف الذي قال للتو إن الوجبة كانت جيدة هو من تدعوه ليكتب عنها.",
        ],
        [
          "Reply to every review, the critical ones first, briefly and without arguing. Future guests read the replies.",
          "ردّ على كل تقييم، والسلبية أولًا، باختصار ودون جدال. فالضيوف القادمون يقرأون الردود.",
        ],
        [
          "Treat complaints as data: if three reviews mention a slow wait on Fridays, the fix is on the Friday rota.",
          "تعامل مع الشكاوى كبيانات: إذا ذكرت ثلاثة تقييمات انتظارًا طويلًا يوم الجمعة، فالحل في جدول ورديات الجمعة.",
        ],
        [
          "Never buy or invent reviews. The platforms forbid it, and guests notice.",
          "لا تشترِ تقييمات ولا تختلقها أبدًا. المنصات تمنع ذلك، والضيوف يلاحظون.",
        ],
      ),
      p(
        "Ratings also settle as reviews add up. With only a handful of reviews the average swings; Luca noted that once a restaurant has twenty or thirty, it steadies. A new place should expect its early rating to move, and keep its attention on the next service.",
        "كما تستقر التقييمات مع تراكم المراجعات. فمع عدد قليل منها يتأرجح المتوسط، وقد لاحظ لوكا أنه يستقر حين يصل المطعم إلى عشرين أو ثلاثين تقييمًا. على المكان الجديد أن يتوقع تحرّك تقييمه في البداية، وأن يُبقي تركيزه على الخدمة التالية.",
      ),
    ],
    sources: [
      {
        title:
          "Harvard Business School Working Knowledge (2011). The Yelp Factor: Are Consumer Reviews Good for Business?",
        url: "https://www.library.hbs.edu/working-knowledge/the-yelp-factor-are-consumer-reviews-good-for-business",
      },
    ],
    publishedAt: "2026-11-01",
    imageSlotId: "mas.insights.what-one-star-is-worth",
    placeholder: false,
  },
];
