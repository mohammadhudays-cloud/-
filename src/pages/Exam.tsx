import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Badge } from '../components/ui'
import { buildExamSet, totalQuestions } from '../lib/bank'
import { startExam } from '../lib/starters'
import { useApp } from '../context/AppContext'
import { computeStats } from '../lib/store'
import { topicBySlug } from '../lib/bank'

const PRESETS = [
  { q: 88, min: 120, label: 'المحاكاة الكاملة', desc: 'يحاكي الاختبار العام الرسمي' },
  { q: 50, min: 60, label: 'نصف اختبار', desc: 'جلسة أقصر لقياس المستوى' },
  { q: 25, min: 30, label: 'اختبار سريع', desc: 'تقييم خاطف قبل النوم' },
]

export default function Exam() {
  const nav = useNavigate()
  const [preset, setPreset] = useState(PRESETS[0])
  const { attempts } = useApp()
  const stats = computeStats(attempts, (t) => topicBySlug(t)?.section)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">اختبار المحاكاة</h1>
        <p className="mt-1 text-muted leading-relaxed">
          اختبار موقوت يحاكي أجواء اختبار الرخصة المهنية العام، بأسئلة موزعة على المجالات الثلاثة.
          لا يظهر الشرح إلا بعد التسليم.
        </p>
      </header>

      <Card className="p-5">
        <h2 className="mb-3 font-extrabold">اختر صيغة الاختبار</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <button
              key={p.q}
              onClick={() => setPreset(p)}
              className={`rounded-xl border p-4 text-right transition ${
                preset.q === p.q
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/25'
                  : 'border-app surface hover:bg-[var(--bg)]'
              }`}
            >
              <div className="text-2xl font-extrabold tabular">{p.q}</div>
              <div className="text-xs text-muted">سؤال · {p.min} دقيقة</div>
              <div className="mt-2 font-bold text-sm">{p.label}</div>
              <div className="text-xs text-muted leading-relaxed">{p.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-extrabold">قبل أن تبدأ</h2>
        <ul className="space-y-2 text-sm leading-relaxed">
          <Rule icon="⏱️">مؤقّت تنازلي — يُسلَّم الاختبار تلقائياً عند انتهاء الوقت.</Rule>
          <Rule icon="🔀">يمكنك التنقل بين الأسئلة والرجوع إليها عبر شريط الأرقام.</Rule>
          <Rule icon="🙈">الإجابات الصحيحة والشرح تظهر بعد التسليم فقط.</Rule>
          <Rule icon="💾">تُحفظ نتيجتك في «تقدمي»، وتُزامَن مع حسابك إن كنت مسجلاً.</Rule>
        </ul>
      </Card>

      {stats.examsTaken > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-app surface p-4">
          <span className="text-2xl">🏅</span>
          <div className="text-sm">
            <span className="text-muted">أفضل نتيجة محاكاة لك: </span>
            <span className="font-extrabold tabular">{Math.round(stats.bestExamPct)}%</span>
          </div>
          <Badge tone="brand">{stats.examsTaken} اختبار سابق</Badge>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <Button
          size="lg"
          onClick={() => {
            startExam(buildExamSet(preset.q), preset.min)
            nav('/run')
          }}
        >
          ⏱️ ابدأ اختبار {preset.q} سؤالاً الآن
        </Button>
        <p className="text-xs text-muted">من إجمالي {totalQuestions} سؤالاً في بنك الاختبار العام</p>
      </div>
    </div>
  )
}

function Rule({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5">{icon}</span>
      <span>{children}</span>
    </li>
  )
}
