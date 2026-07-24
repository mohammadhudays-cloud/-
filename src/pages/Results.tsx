import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Button, Card, Badge, Progress, difficultyLabel } from '../components/ui'
import { QuestionCard } from '../components/QuestionCard'
import { getLocalAttempts } from '../lib/store'
import { questionById, topicBySlug, sectionBySlug } from '../lib/bank'
import type { Attempt } from '../lib/types'

export default function Results() {
  const { id } = useParams()
  const loc = useLocation()
  const nav = useNavigate()
  const stateAttempt = (loc.state as { attempt?: Attempt } | null)?.attempt
  const attempt = useMemo<Attempt | undefined>(
    () => stateAttempt ?? getLocalAttempts().find((a) => a.id === id),
    [stateAttempt, id]
  )
  const [filter, setFilter] = useState<'all' | 'wrong'>('all')

  if (!attempt) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold">لم يُعثر على النتيجة</p>
        <Link to="/" className="mt-3 inline-block text-brand-600 hover:underline">العودة للرئيسية</Link>
      </div>
    )
  }

  const pct = attempt.total ? Math.round((attempt.correct / attempt.total) * 100) : 0
  const wrong = attempt.total - attempt.correct
  const skipped = attempt.answers.filter((a) => a.chosen === null).length
  const tone = pct >= 80 ? 'emerald' : pct >= 50 ? 'sky' : 'rose'
  const verdict = examVerdict(pct)

  // per-section breakdown
  const bySection: Record<string, { total: number; correct: number }> = {}
  for (const a of attempt.answers) {
    const topic = questionById(a.qid)?.topic
    const sec = topic ? topicBySlug(topic)?.section : undefined
    if (!sec) continue
    bySection[sec] ??= { total: 0, correct: 0 }
    bySection[sec].total++
    if (a.correct) bySection[sec].correct++
  }

  const shownAnswers = attempt.answers.filter((a) => (filter === 'wrong' ? !a.correct : true))

  return (
    <div className="space-y-6">
      {/* score header */}
      <Card className="overflow-hidden p-0">
        <div
          className={`p-6 text-center text-white ${
            tone === 'emerald'
              ? 'bg-gradient-to-bl from-emerald-500 to-emerald-700'
              : tone === 'sky'
                ? 'bg-gradient-to-bl from-sky-500 to-sky-700'
                : 'bg-gradient-to-bl from-rose-500 to-rose-700'
          }`}
        >
          <div className="text-6xl font-extrabold tabular">{pct}%</div>
          <div className="mt-1 text-white/90 font-bold">{verdict.title}</div>
          <div className="mt-1 text-sm text-white/80">{verdict.note}</div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-app">
          <Stat label="صحيحة" value={attempt.correct} tone="text-emerald-600" />
          <Stat label="خاطئة" value={wrong - skipped} tone="text-rose-600" />
          <Stat label="متروكة" value={skipped} tone="text-muted" />
        </div>
      </Card>

      {/* per-section */}
      {Object.keys(bySection).length > 1 && (
        <Card className="p-5">
          <h2 className="mb-3 font-extrabold">التوزيع حسب المجال</h2>
          <div className="space-y-3">
            {Object.entries(bySection).map(([sec, v]) => {
              const s = sectionBySlug(sec)
              const a = Math.round((v.correct / v.total) * 100)
              return (
                <div key={sec}>
                  <div className="mb-1 flex justify-between text-sm font-bold">
                    <span>{s?.icon} {s?.title}</span>
                    <span className="tabular text-muted">{v.correct}/{v.total} · {a}%</span>
                  </div>
                  <Progress value={a} tone={s ? ({ emerald: 'emerald', sky: 'sky', amber: 'amber' }[s.color] ?? 'brand') : 'brand'} />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => nav('/')}>الرئيسية</Button>
        <Button variant="outline" onClick={() => nav('/progress')}>تقدمي</Button>
        <Button
          variant="soft"
          className="mr-auto"
          onClick={() => nav((loc.state as { origin?: string })?.origin ?? '/practice')}
        >
          🔁 جولة جديدة
        </Button>
      </div>

      {/* review */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">مراجعة الإجابات</h2>
          <div className="flex gap-1 rounded-xl border border-app surface p-1">
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>الكل ({attempt.total})</FilterBtn>
            <FilterBtn active={filter === 'wrong'} onClick={() => setFilter('wrong')}>الأخطاء ({wrong})</FilterBtn>
          </div>
        </div>

        {shownAnswers.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl">🎉</div>
            <p className="mt-2 font-bold">لا أخطاء في هذه الجولة، أحسنت!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {shownAnswers.map((a) => {
              const q = questionById(a.qid)
              if (!q) return null
              const topic = topicBySlug(q.topic)
              return (
                <Card key={a.qid} className="p-5">
                  {topic && (
                    <div className="mb-2">
                      <Badge tone="brand">{topic.title}</Badge>
                      <Badge>{difficultyLabel(q.difficulty)}</Badge>
                    </div>
                  )}
                  <QuestionCard
                    question={q}
                    chosen={a.chosen}
                    onChoose={() => {}}
                    revealed
                    showExplanation
                  />
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="p-4 text-center">
      <div className={`text-2xl font-extrabold tabular ${tone}`}>{value}</div>
      <div className="text-xs font-bold text-muted">{label}</div>
    </div>
  )
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
        active ? 'bg-brand-600 text-white' : 'text-muted hover:bg-[var(--bg)]'
      }`}
    >
      {children}
    </button>
  )
}

function examVerdict(pct: number): { title: string; note: string } {
  if (pct >= 80) return { title: 'مستوى خبير 🌟', note: 'أداء يؤهلك للرتب المتقدمة (80 فأعلى).' }
  if (pct >= 70) return { title: 'اجتياز متقدم ✅', note: 'ضمن نطاق المعلم الممارس/المتقدم (70–79).' }
  if (pct >= 50) return { title: 'اجتياز مبدئي', note: 'ضمن نطاق رخصة معلم (50–69) — واصل التطوير.' }
  return { title: 'يحتاج مزيداً من التدريب', note: 'ركّز على المجالات الأضعف وكرّر المحاولة.' }
}
