# Mamo Finance — حزمة التسليم والرفع إلى GitHub

هذه الحزمة تحتوي على كود تطبيق **Mamo Finance** للويب والخادم وقاعدة البيانات ومشروع Expo/Android، إضافة إلى ملفات الإعداد والتوثيق والاختبارات. تم استبعاد الأسرار، مجلدات الاعتمادات الضخمة، سجلات التطوير، وملفات البناء المؤقتة حتى تكون الحزمة مناسبة للحفظ والرفع إلى GitHub.

## محتويات المشروع

| المسار | المحتوى |
|---|---|
| `client/` | واجهة الويب العربية RTL والإنجليزية LTR |
| `server/` | خادم Express وtRPC وOAuth ومنطق التطبيق |
| `drizzle/` | مخطط قاعدة البيانات والمهاجرات |
| `shared/` | الأنواع والثوابت المشتركة |
| `mobile/` | تطبيق Expo/Android المتصل بالخادم نفسه |
| `storage/` | مساعدات التخزين في الخادم |
| `README.md` | التوثيق الأساسي للمشروع |
| `mobile/README.md` | تشغيل وبناء تطبيق Android |
| `Mamo-Android-Install.md` | تعليمات تثبيت APK |
| `Mamo-Brand-QA.md` | توثيق الهوية والفحص البصري |
| `todo.md` | سجل المتطلبات والتغييرات |

## ما تم استبعاده عمدًا

لا ترفع ملفات `.env` أو أي ملف يحتوي على `DATABASE_URL` أو `JWT_SECRET` أو مفاتيح OAuth أو مفاتيح EAS. كذلك تم استبعاد `node_modules/` و`.manus-logs/` و`.git/` وملفات البناء والكاش، لأنها ليست جزءًا من المصدر المطلوب لحفظ المشروع.

## التشغيل المحلي للويب

ثبّت Node.js 22 أو أحدث وpnpm، ثم نفّذ من جذر المشروع:

```bash
pnpm install
pnpm run check
pnpm test
pnpm dev
```

يلزم توفير متغيرات البيئة في ملف `.env` محليًا أو من خلال نظام أسرار آمن. لا تضع هذا الملف داخل GitHub. راجع `README.md` و`server/_core/env.ts` لمعرفة أسماء المتغيرات المطلوبة.

## تشغيل تطبيق Expo

```bash
cd mobile
pnpm install
pnpm start
```

لإنشاء APK عبر EAS، سجّل الدخول إلى حساب Expo/EAS من جهازك ثم استخدم إعداد `production-apk` الموجود في `mobile/eas.json`. عنوان الخادم المنشور مضبوط داخل إعدادات Mamo الحالية، ويمكن تغييره في نسخة خاصة بك عند الحاجة.

## إنشاء مستودع GitHub جديد

من داخل مجلد المشروع بعد فك الضغط، أنشئ مستودعًا خاصًا أو عامًا من GitHub ثم نفّذ:

```bash
git init
git add .
git commit -m "Initial Mamo Finance handover"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

استبدل `USERNAME/REPOSITORY` بعنوان مستودعك. قبل تنفيذ `git push`، افحص الملفات المتتبعة وتأكد من عدم وجود `.env` أو مفاتيح سرية:

```bash
git status
git grep -n -I -E 'sk-|JWT_SECRET=|DATABASE_URL=|EXPO_TOKEN=|BEGIN PRIVATE KEY'
```

وجود أسماء متغيرات البيئة داخل التوثيق طبيعي، أما وجود قيم فعلية للمفاتيح أو كلمات المرور فليس طبيعيًا ويجب حذفه قبل الرفع.

## ملاحظة مهمة عن قاعدة البيانات

الكود والمخطط موجودان في الحزمة، لكن بيانات قاعدة البيانات الحية لا تُحفظ داخل GitHub. يلزم إعداد قاعدة بيانات جديدة وربط `DATABASE_URL` بها عند تشغيل نسخة مستقلة، ثم تطبيق المهاجرات حسب التعليمات الموجودة في `README.md`.
