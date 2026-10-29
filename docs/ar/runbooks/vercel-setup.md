# دليل التشغيل: نشر نسخ الاختبار على Vercel Hobby

الخطوات دي محتاجة حساباتك، فأنت اللي هتعملها. كله على الخطط المجانية. خطة Vercel Hobby للاختبار بس (شروطها مش بتغطي الاستخدام التجاري)، والإنتاج هينتقل لفريق Vercel Pro بتاع العميل وقت التسليم.

## 1. إنشاء مشاريع Vercel الثلاثة

اعمل Import لمستودع GitHub ‏`zeyadelbadawi/mas` تلات مرات، مرة لكل موقع:

| اسم المشروع | Root Directory | البورت المحلي |
|---|---|---|
| `mas-web` | `apps/mas` | 3000 |
| `covy-web` | `apps/covy` | 3001 |
| `aroma-web` | `apps/aroma` | 3002 |

- الـ Framework: ‏**Next.js** (بيتعرف تلقائي). سيب أوامر التثبيت والبناء الافتراضية؛ Vercel هيثبّت بـ pnpm من جذر المستودع بسبب `pnpm-lock.yaml`.
- سيب خيار "Include files outside the Root Directory" مفعّل، لأن التطبيقات بتستورد الحزم المشتركة في `packages/*`.
- نسخة Node.js: ‏22.x (زي `.nvmrc`).

## 2. متغيرات البيئة (لكل مشروع)

انسخها من ملف `.env.example` في كل تطبيق، واضبطها لـ **Preview** و**Production**.

| المتغير | القيمة | ملاحظات |
|---|---|---|
| `RESEND_API_KEY` | من Resend (خطوة 3) | سري. مفتاح إرسال فقط |
| `MAIL_FROM` | مثلًا `COVY <reservations@send.mas.com>` | لازم يكون من الدومين المتحقق منه في Resend |
| `MAIL_TO` | ‏`mas@mas.com` / ‏`covy@mas.com` / ‏`aroma@mas.com` | في الاختبار ينفع بريدك أنت |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | من Cloudflare (خطوة 4) | |
| `TURNSTILE_SECRET_KEY` | من Cloudflare (خطوة 4) | سري. من غيره نماذج الإنتاج بترفض الإرسال |
| `NEXT_PUBLIC_SITE_URL` | سيبه فاضي على Hobby | بيتضبط على الدومين الحقيقي في الإنتاج |
| `NEXT_PUBLIC_GA4_ID` و`NEXT_PUBLIC_CLARITY_ID` | فاضيين دلوقتي | بيتضافوا لما العميل يعمل الحسابات |
| `NEXT_PUBLIC_MEDIA_URL` | فاضي دلوقتي | بيتضبط لما R2 يجهز (P2) |
| `SITE_INDEXABLE` | **سيبه فاضي** | ‏`true` على الإنتاج بس وقت الإطلاق. قبل كده كل الصفحات `noindex` |

نقطة استقبال النماذج بتقبل الطلبات من نفس الموقع بس، وعلى Vercel بتقرا `VERCEL_URL` و`VERCEL_BRANCH_URL` تلقائي، فنسخ المعاينة بتشتغل من غير إعدادات زيادة.

## 3. ‏Resend (رسائل النماذج)

1. اعمل حساب Resend مجاني (3,000 رسالة في الشهر، 100 في اليوم).
2. قبل التحقق من دومين، Resend بيبعت بس لبريد صاحب الحساب، وده كفاية لأول اختبار: خلي `MAIL_TO` هو البريد ده و`MAIL_FROM` هو `onboarding@resend.dev`.
3. للاختبار الحقيقي، ضيف الدومين الفرعي `send.mas.com` في Resend، وابعت سجلات DNS اللي هيظهرها (SPF وDKIM وسجل DMARC على `mas.com`) للمسؤول عن DNS عند العميل. الدومين الفرعي بيحافظ على سمعة البريد الأساسي للعميل.
4. اعمل API key بصلاحية **الإرسال فقط** وحطه في `RESEND_API_KEY` في المشاريع الثلاثة.

## 4. ‏Cloudflare Turnstile (الحماية من البرامج الآلية)

1. من لوحة Cloudflare ← Turnstile ← Add widget، بوضع **Managed**.
2. الـ Hostnames: دومينات `*.vercel.app` الثلاثة دلوقتي، وتضيف `mas.com` و`covy.mas.com` و`aroma.mas.com` وقت الإطلاق. Widget واحد للمواقع الثلاثة كفاية.
3. انسخ الـ site key والـ secret في المتغيرات اللي فوق.

للتطوير المحلي، `.env.example` فيه مفاتيح الاختبار من Cloudflare اللي دايمًا بتنجح.

## 5. التأكد من النشر

على رابط كل نسخة معاينة:

- ‏`/` و`/ar` بيفتحوا، وشريط ملفات الارتباط بيظهر، و"رفض الكل" بيخفيه.
- ‏`/kitchen-sink` بيعرض مكونات البناء، وبيرجع 404 على نسخ الإنتاج.
- ابعت حجز تجريبي (COVY أو أروما) أو طلب مشروع (MAS): بريد الفريق بيستقبل الطلب برقم مرجعي زي `CV-7K3P`، وبريد الضيف بيستقبل الرد التلقائي.
- ‏`/robots.txt` فيه `Disallow: /`.

## بعدين (مش مطلوب في P1)

- **التحليلات:** العميل يعمل GA4 property ومشروع Clarity لكل موقع على حساباته في Google وMicrosoft ويضيفك كمستخدم. في Clarity اضبط الإخفاء على **Strict**.
- **‏Cloudflare R2** لإطارات الـ sequences على `media.mas.com` ‏(P2).
- **الإنتاج:** نقل المشاريع لفريق Vercel Pro بتاع العميل، وإضافة الدومينات، وضبط `NEXT_PUBLIC_SITE_URL`، ووقت الإطلاق بس `SITE_INDEXABLE=true`.
