import { Link } from 'react-router-dom'
import { Card, Progress as Bar, Badge, sectionTone } from '../components/ui'
import { useApp } from '../context/AppContext'
import { computeStats, mistakeQids } from '../lib/store'
import { sections, topicsOfSection, topicBySlug, sectionBySlug } from '../lib/bank'

export default function ProgressPage() {
  const { attempts, user } = useApp()
  const stats = computeStats(attempts, (t) => topicBySlug(t)?.section)
  const mistakes = mistakeQids().length

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">تقدمي</h1>
          <p className="mt-1 text-muted">
            {user ? 'بياناتك مُزامَنة مع حسابك.' : 'بياناتك محفوظة على هذا الجهاز.'}
          </p>
        </div>
        {!user && (
          <Link to="/auth">
            <Badge tone="amber">سجّل لحفظ التقدم ←</Badge>
          </Link>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile icon="📝" label="أسئلة أُجبت" value={stats.totalAnswered} />
        <Tile icon="🎯" label="نسبة الإتقان" value={`${Math.round(stats.accuracy)}%`} />
        <Tile icon="⏱️" label="اختبارات" value={stats.examsTaken} />
        <Tile icon="🔥" label="أيام متتالية" value={stats.streakDays} />
      </div>

      {/* mastery by section/topic */}
      <Card className="p-5">
        <h2 className="mb-4 font-extrabold">الإتقان حسب المجال</h2>
        <div className="space-y-5">
          {sections.map((s) => {
            const ps = stats.perSection[s.slug]
            const acc = ps && ps.answered ? Math.round((ps.correct / ps.answered) * 100) : 0
            return (
              <div key={s.slug}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-bold">{s.icon} {s.title}</span>
                  <span className="text-sm text-muted tabular">
                    {ps?.answered ?? 0} إجابة · {acc}%
                  </span>
                </div>
                <Bar value={acc} tone={sectionTone(s.color)} />
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {topicsOfSection(s.slug).map((t) => {
                    const pt = stats.perTopic[t.slug]
                    const a = pt && pt.answered ? Math.round((pt.correct / pt.answered) * 100) : 0
                    return (
                      <Link
                        key={t.slug}
                        to={`/study/${s.slug}/${t.slug}`}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--bg)]"
                      >
                        <span className="min-w-0 flex-1 truncate text-muted">{t.title}</span>
                        <div className="w-16"><Bar value={a} tone={sectionTone(s.color)} /></div>
                        <span className="w-9 text-left text-xs tabular text-muted">{pt?.answered ? `${a}%` : '—'}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {mistakes > 0 && (
        <Link to="/mistakes">
          <Card className="flex items-center gap-3 p-5">
            <span className="text-3xl">🔁</span>
            <div className="flex-1">
              <div className="font-bold">بنك أخطائي</div>
              <div className="text-sm text-muted">{mistakes} سؤالاً بحاجة إلى مراجعة</div>
            </div>
            <span className="text-brand-600 font-bold">راجع ←</span>
          </Card>
        </Link>
      )}

      {/* history */}
      <Card className="p-5">
        <h2 className="mb-3 font-extrabold">آخر الجلسات</h2>
        {attempts.length === 0 ? (
          <p className="py-6 text-center text-muted">لا توجد جلسات بعد — ابدأ أول تدريب لك!</p>
        ) : (
          <div className="divide-y divide-app">
            {attempts.slice(0, 15).map((a) => {
              const pct = a.total ? Math.round((a.correct / a.total) * 100) : 0
              const label =
                a.mode === 'exam' ? 'محاكاة' : a.mode === 'quiz' ? 'اختبار مصغّر' : 'تدريب'
              const scope = a.topic_slug
                ? topicBySlug(a.topic_slug)?.title
                : a.section_slug
                  ? sectionBySlug(a.section_slug)?.title
                  : 'شامل'
              return (
                <Link
                  key={a.id}
                  to={`/results/${a.id}`}
                  className="flex items-center gap-3 py-3 hover:bg-[var(--bg)] rounded-lg px-2 -mx-2"
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl text-sm font-extrabold tabular ${
                      pct >= 80
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                        : pct >= 50
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                    }`}
                  >
                    {pct}%
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{label} · {scope}</div>
                    <div className="text-xs text-muted tabular">
                      {a.correct}/{a.total} · {fmtDate(a.started_at)}
                    </div>
                  </div>
                  <span className="text-muted">←</span>
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

function Tile({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="surface rounded-2xl border border-app p-4">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-2xl font-extrabold tabular">{value}</div>
      <div className="text-xs font-bold text-muted">{label}</div>
    </div>
  )
}

function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}
