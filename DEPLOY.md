# خطوات النشر النهائية

تم إنجاز كل شيء عدا خطوة واحدة أخيرة تحتاج نقرات منك، لأن جلسة العمل التي بُني فيها المشروع لا تملك صلاحية الوصول الشبكي إلى خوادم Netlify (سياسة الشبكة تسمح بـ GitHub فقط).

## الحالة الحالية

| العنصر | الحالة |
|---|---|
| الكود على GitHub | ✅ مرفوع على فرع `claude/professional-license-platform-lqew7q` |
| قاعدة البيانات Supabase | ✅ جاهزة ومعبّأة (3 مجالات، 21 موضوعاً، 315 سؤالاً) |
| مشروع Netlify | ✅ مُنشأ باسم `rukhsa-mihaniya-platform` |
| نشر الموقع | ⏳ يحتاج ربط المستودع (خطوة واحدة أدناه) |

- **رابط المشروع في Netlify:** https://app.netlify.com/projects/rukhsa-mihaniya-platform
- **الرابط بعد النشر:** https://rukhsa-mihaniya-platform.netlify.app
- **معرّف الموقع (Site ID):** `5692130f-7e16-4a8b-982c-b72d8b55778e`

## الطريقة الأولى (الأسهل والموصى بها): ربط المستودع بـ Netlify

1. افتح https://app.netlify.com/projects/rukhsa-mihaniya-platform
2. اذهب إلى **Project configuration → Build & deploy → Continuous deployment**
3. اضغط **Link repository** واختر GitHub ثم المستودع `mohammadhudays-cloud/-`
4. اختر الفرع: `claude/professional-license-platform-lqew7q`
5. إعدادات البناء ستُقرأ تلقائياً من `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. اضغط **Deploy** — وسينشر الموقع تلقائياً مع كل تحديث لاحق.

## الطريقة الثانية: النشر من جهازك مباشرة

```bash
git clone https://github.com/mohammadhudays-cloud/-.git
cd -
git checkout claude/professional-license-platform-lqew7q
npm install
npm run build
npx netlify-cli deploy --prod --dir=dist --site 5692130f-7e16-4a8b-982c-b72d8b55778e
```

## الطريقة الثالثة: النشر التلقائي عبر GitHub Actions

ملف سير العمل جاهز في `.github/workflows/deploy.yml`. لتفعيله أضف هذين السرّين في
**GitHub → Settings → Secrets and variables → Actions**:

| اسم السر | القيمة |
|---|---|
| `NETLIFY_AUTH_TOKEN` | من https://app.netlify.com/user/applications#personal-access-tokens |
| `NETLIFY_SITE_ID` | `5692130f-7e16-4a8b-982c-b72d8b55778e` |

بعدها سيُنشر الموقع تلقائياً مع كل `push`.

## ملاحظة عن متغيرات البيئة

قيم Supabase مضمّنة كقيم افتراضية في `src/lib/supabase.ts`، فالموقع سيعمل دون أي إعداد إضافي.
لتجاوزها يمكنك ضبط `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` في متغيرات بيئة Netlify.
(المفتاح المستخدم من نوع publishable وهو آمن للاستخدام في الواجهة الأمامية، والحماية الفعلية
مطبّقة عبر سياسات RLS في قاعدة البيانات.)
