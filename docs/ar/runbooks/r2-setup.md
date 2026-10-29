# دليل التشغيل: Cloudflare R2 لإطارات الـ Sequences

إطارات الـ sequences بالحجم الكامل حوالي 15–20 ميجا لكل sequence، وده كتير على git وVercel، فبتتحط في Cloudflare R2 على الخطة المجانية (10 جيجا تخزين، ومن غير رسوم نقل بيانات). لحد ما نجهزه، المواقع بتعرض نسخ المراجعة الصغيرة (960×540) اللي في المستودع.

1. **إنشاء الـ bucket:** من لوحة Cloudflare ← ‏R2 Object Storage ← تفعيل R2 (هيطلب كارت أو PayPal للتحقق بس، ومفيش أي دفع جوه الخطة المجانية). اعمل bucket باسم `mas-media`.
2. **الوصول العام:** للاختبار دلوقتي: Settings ← Public access ← R2.dev subdomain ← Allow، وهيديك رابط زي `https://pub-xxxxxxxx.r2.dev`. للإطلاق: Custom domains ← ‏`media.mas.com` (محتاج DNS بتاع mas.com يكون على نفس حساب Cloudflare).
3. **‏CORS:** ‏Settings ← CORS policy ← Edit، والصق الـ JSON اللي في النسخة الإنجليزية (قراءة فقط GET وHEAD).
4. **مفتاح الرفع:** ‏R2 ← Manage R2 API tokens ← Create API token بصلاحية Object Read & Write على `mas-media` بس. حط القيم في إعدادات بيئة Claude Code (قائمة البيئة في شريط عنوان الجلسة ← Edit) بالأسماء دي: `R2_ACCOUNT_ID` و`R2_ACCESS_KEY_ID` و`R2_SECRET_ACCESS_KEY` و`R2_BUCKET`. **متبعتش المفاتيح في الشات.** الجلسة الجديدة هتقراها، وأنا هرفع الإطارات.
5. **ربط المواقع:** في كل مشروع على Vercel اضبط `NEXT_PUBLIC_MEDIA_URL` على الرابط العام من الخطوة 2 (من غير / في الآخر) واعمل Redeploy.
