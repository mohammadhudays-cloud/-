import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Badge } from '../components/ui'
import {
  sections,
  topicsOfSection,
  questionsOfSection,
  questionsOfTopic,
  questions as allQuestions,
} from '../lib/bank'
import { startPractice, startQuiz } from '../lib/starters'

const COUNTS = [10, 20, 30, 50]

export default function Practice() {
  const nav = useNavigate()
  const [scope, setScope] = useState<string>('all') // 'all' | section slug | `${section}:${topic}`
  const [difficulty, setDifficulty] = useState<0 | 1 | 2 | 3>(0)
  const [count, setCount] = useState(20)
  const [immediate, setImmediate] = useState(true)

  const pool = useMemo(() => {
    let qs = allQuestions
    if (scope !== 'all') {
      if (scope.includes(':')) {
        const [, topic] = scope.split(':')
        qs = questionsOfTopic(topic)
      } else {
        qs = questionsOfSection(scope)
      }
    }
    if (difficulty !== 0) qs = qs.filter((q) => q.difficulty === difficulty)
    return qs
  }, [scope, difficulty])

  const available = pool.length
  const effective = Math.min(count, available)

  function begin() {
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, effective)
    const label =
      scope === 'all'
        ? 'تدريب شامل'
        : scope.includes(':')
          ? `تدريب — ${topicTitle(scope)}`
          : `تدريب — ${sections.find((s) => s.slug === scope)?.short_title}`
    const [section_slug, topic_slug] = resolveScope(scope)
    const opts = {
      questions: picked,
      title: label,
      section_slug,
      topic_slug,
      origin: '/practice',
    }
    if (immediate) startPractice(opts)
    else startQuiz(opts)
    nav('/run')
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">التدريب</h1>
        <p className="mt-1 text-muted">خصّص جلسة تدريب حسب المجال والموضوع ومستوى الصعوبة.</p>
      </header>

      {/* scope */}
      <Section title="النطاق">
        <div className="grid gap-2">
          <ScopeRow
            active={scope === 'all'}
            onClick={() => setScope('all')}
            label="جميع المجالات"
            hint={`${allQuestions.length} سؤال`}
            icon="🎯"
          />
          {sections
            .filter((s) => questionsOfSection(s.slug).length > 0)
            .map((s) => (
              <div key={s.slug}>
                <ScopeRow
                  active={scope === s.slug}
                  onClick={() => setScope(s.slug)}
                  label={s.title}
                  hint={`${questionsOfSection(s.slug).length} سؤال`}
                  icon={s.icon}
                />
                {(scope === s.slug || scope.startsWith(`${s.slug}:`)) && (
                  <div className="mt-2 mr-6 grid gap-1.5 border-r-2 border-brand-200 pr-3 dark:border-brand-800">
                    {topicsOfSection(s.slug)
                      .filter((t) => questionsOfTopic(t.slug).length > 0)
                      .map((t) => (
                        <button
                          key={t.slug}
                          onClick={() => setScope(`${s.slug}:${t.slug}`)}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            scope === `${s.slug}:${t.slug}`
                              ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                              : 'text-muted hover:bg-[var(--bg)]'
                          }`}
                        >
                          <span>{t.title}</span>
                          <span className="tabular text-xs">{questionsOfTopic(t.slug).length}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </Section>

      {/* difficulty */}
      <Section title="مستوى الصعوبة">
        <div className="flex flex-wrap gap-2">
          {[
            { v: 0, l: 'الكل' },
            { v: 1, l: 'سهل' },
            { v: 2, l: 'متوسط' },
            { v: 3, l: 'متقدم' },
          ].map((d) => (
            <Chip key={d.v} active={difficulty === d.v} onClick={() => setDifficulty(d.v as 0 | 1 | 2 | 3)}>
              {d.l}
            </Chip>
          ))}
        </div>
      </Section>

      {/* count */}
      <Section title="عدد الأسئلة">
        <div className="flex flex-wrap gap-2">
          {COUNTS.map((c) => (
            <Chip key={c} active={count === c} onClick={() => setCount(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </Section>

      {/* mode */}
      <Section title="نمط التدريب">
        <div className="grid gap-2 sm:grid-cols-2">
          <ModeCard
            active={immediate}
            onClick={() => setImmediate(true)}
            title="شرح فوري"
            desc="يظهر الشرح بعد كل إجابة مباشرة — الأفضل للمذاكرة"
          />
          <ModeCard
            active={!immediate}
            onClick={() => setImmediate(false)}
            title="اختبار مصغّر"
            desc="النتيجة والشرح في النهاية — لقياس مستواك"
          />
        </div>
      </Section>

      <div className="sticky bottom-4 z-10">
        <Card className="flex items-center justify-between gap-3 p-4">
          <div className="text-sm">
            <span className="font-bold">{effective}</span>
            <span className="text-muted"> سؤالاً جاهزاً</span>
            {available < count && (
              <Badge tone="amber">المتاح {available}</Badge>
            )}
          </div>
          <Button size="lg" onClick={begin} disabled={effective === 0}>
            ابدأ التدريب ←
          </Button>
        </Card>
      </div>
    </div>
  )
}

function resolveScope(scope: string): [string | null, string | null] {
  if (scope === 'all') return [null, null]
  if (scope.includes(':')) {
    const [sec, top] = scope.split(':')
    return [sec, top]
  }
  return [scope, null]
}
function topicTitle(scope: string) {
  const [sec, top] = scope.split(':')
  return topicsOfSection(sec).find((t) => t.slug === top)?.title ?? ''
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-extrabold text-muted">{title}</h2>
      {children}
    </section>
  )
}

function ScopeRow({
  active,
  onClick,
  label,
  hint,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  hint: string
  icon: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${
        active
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/25'
          : 'border-app surface hover:bg-[var(--bg)]'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-bold">{label}</span>
      <span className="mr-auto text-xs text-muted tabular">{hint}</span>
    </button>
  )
}

function Chip({
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
      className={`rounded-xl border px-4 py-2 text-sm font-bold transition tabular ${
        active
          ? 'border-brand-500 bg-brand-600 text-white'
          : 'border-app surface text-muted hover:bg-[var(--bg)]'
      }`}
    >
      {children}
    </button>
  )
}

function ModeCard({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  title: string
  desc: string
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-right transition ${
        active ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/25' : 'border-app surface hover:bg-[var(--bg)]'
      }`}
    >
      <div className="font-bold">{title}</div>
      <div className="mt-1 text-sm text-muted leading-relaxed">{desc}</div>
    </button>
  )
}
