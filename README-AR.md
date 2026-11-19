# PostCraft AI 2.0 — دليل النشر من الهاتف

هذا المشروع يحتوي على واجهة عربية/إنجليزية بتصميم داكن متجاوب، مع Worker آمن يتصل بـ OpenAI.

## المزايا
- كاتب منشورات مع اختيار المنصة والنبرة واللغة والطول والجمهور والكلمات المفتاحية.
- مولّد هاشتاغات.
- حاسبة معدل التفاعل.
- تبديل العربية والإنجليزية.
- مفتاح OpenAI محفوظ كـ Secret في Cloudflare، ولا يُرسل إلى المتصفح.

## قبل النشر
تحتاج إلى:
1. حساب Cloudflare.
2. مفتاح OpenAI API صالح مع رصيد/فوترة مفعّلة.
3. مشروع Worker جديد أو استبدال ملفات مشروعك الحالي بعد أخذ نسخة احتياطية.

## أسهل طريقة من الهاتف: Cloudflare Dashboard
قد تختلف أسماء الأزرار قليلاً حسب تحديث لوحة Cloudflare.

1. فك ضغط `postcraft-ai-2.zip` على هاتفك.
2. افتح https://dash.cloudflare.com/
3. ادخل إلى **Workers & Pages**.
4. أنشئ Worker جديداً باسم `postcraft-ai`، أو افتح Worker الحالي الذي تريد استبداله.
5. ارفع ملفات المشروع عبر محرر/واجهة رفع الملفات المتاحة في لوحة Cloudflare. يجب أن تبقى البنية كما يلي:
   - `wrangler.jsonc`
   - `src/index.js`
   - `public/index.html`
   - `public/styles.css`
   - `public/app.js`
6. في إعدادات Worker افتح **Settings → Variables and Secrets**.
7. أضف متغيراً من نوع **Secret**:
   - Name: `OPENAI_API_KEY`
   - Value: مفتاحك السري من OpenAI.
8. (اختياري) أضف متغيراً عادياً:
   - Name: `OPENAI_MODEL`
   - Value: `gpt-4o-mini`
9. انشر Worker.

> إذا كانت لوحة Cloudflare لا تعرض رفع مجلد `public` أو ملفات المشروع كاملة من الهاتف، استخدم Cloudflare Workers Builds واربط مستودع GitHub ثم ارفع ملفات ZIP إلى مستودعك بعد فك الضغط. إعدادات البناء المعتادة:
> - Build command: `npm install`
> - Deploy command: `npx wrangler deploy`
> - Root directory: `/`

## النشر باستخدام Wrangler (حاسوب أو بيئة طرفية)
```bash
npm install
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```

## الاختبار
بعد النشر افتح:
- `https://YOUR-WORKER-DOMAIN/api/health`

النتيجة المتوقعة تتضمن:
```json
{"ok":true,"service":"PostCraft AI","configured":true,"model":"gpt-4o-mini"}
```

ثم افتح الصفحة الرئيسية، واكتب موضوعاً، واضغط **أنشئ منشوري**.

## الأمان
- لا تضع مفتاح OpenAI داخل `public/app.js` أو `index.html`.
- لا ترسل المفتاح في المحادثات أو الصور.
- إذا انكشف المفتاح، ألغِه وأنشئ مفتاحاً جديداً.
- راقب استخدام OpenAI وحدود الإنفاق من لوحة OpenAI.

## ملاحظات مهمة
- `gpt-4o-mini` هو النموذج الافتراضي في هذا المشروع. يمكنك تغييره إلى نموذج آخر متاح لحسابك بتعديل `OPENAI_MODEL`.
- حاسبة التفاعل تعمل محلياً داخل المتصفح ولا تحتاج إلى API.
- يلزم اتصال إنترنت للخطوط الخارجية؛ إذا لم تتوفر، يستخدم الموقع خطوط النظام الاحتياطية.
