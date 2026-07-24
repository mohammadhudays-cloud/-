import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { mistakeQids } from '../lib/store'
import { questionById } from '../lib/bank'
import { startPractice } from '../lib/starters'

export default function Mistakes() {
  const nav = useNavigate()
  const ids = mistakeQids()
  const qs = ids.map(questionById).filter((q): q is NonNullable<typeof q> => Boolean(q))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">بنك أخطائي 🔁</h1>
        <p className="mt-1 text-muted leading-relaxed">
          الأسئلة التي أخطأت فيها تُجمع هنا تلقائياً. تدرّب عليها حتى تتقنها، وتُزال من البنك عند إجابتها
          صحيحة.
        </p>
      </header>

      {qs.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-5xl">🎯</div>
          <p className="mt-3 text-lg font-bold">لا أخطاء محفوظة حالياً</p>
          <p className="mt-1 text-muted">أخطاؤك في التدريب والاختبارات ستظهر هنا لمراجعتها.</p>
          <div className="mt-4">
            <Button onClick={() => nav('/practice')}>ابدأ التدريب</Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="flex items-center gap-4 p-5">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-2xl font-extrabold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 tabular">
              {qs.length}
            </span>
            <div className="flex-1">
              <div className="font-bold">سؤالاً بحاجة إلى مراجعة</div>
              <div className="text-sm text-muted">راجعها في جلسة مركزة بشرح فوري</div>
            </div>
            <Button
              size="lg"
              onClick={() => {
                startPractice({
                  questions: qs,
                  title: 'مراجعة الأخطاء',
                  section_slug: null,
                  topic_slug: null,
                  origin: '/mistakes',
                })
                nav('/run')
              }}
            >
              ابدأ المراجعة ←
            </Button>
          </Card>

          <div className="grid gap-2">
            {qs.slice(0, 30).map((q) => (
              <div key={q.id} className="surface rounded-xl border border-app p-3 text-sm">
                {q.stem}
              </div>
            ))}
            {qs.length > 30 && (
              <p className="text-center text-sm text-muted">وغيرها {qs.length - 30} سؤالاً…</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
