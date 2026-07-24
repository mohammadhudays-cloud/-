import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuestionCard } from '../components/QuestionCard'
import { Button, Progress } from '../components/ui'
import { getActiveRun, resumeRun, clearRun } from '../lib/session'
import { questionById } from '../lib/bank'
import { saveAttempt } from '../lib/store'
import { useApp } from '../context/AppContext'
import type { AnswerRecord } from '../lib/types'

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function Runner() {
  const nav = useNavigate()
  const { refreshAttempts } = useApp()
  const run = useMemo(() => getActiveRun() ?? resumeRun((id) => questionById(id)), [])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  const startedAt = useRef(new Date().toISOString())
  const [remaining, setRemaining] = useState(run?.durationSeconds ?? 0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!run) nav('/', { replace: true })
  }, [run, nav])

  // exam countdown
  useEffect(() => {
    if (!run?.durationSeconds) return
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t)
          finish()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  if (!run) return null

  const q = run.questions[idx]
  const chosen = answers[q.id] ?? null
  const isRevealed = run.immediateFeedback ? Boolean(revealed[idx]) : false
  const answeredCount = Object.keys(answers).length

  function choose(i: number) {
    if (run!.immediateFeedback && revealed[idx]) return
    setAnswers((a) => ({ ...a, [q.id]: i }))
    if (run!.immediateFeedback) setRevealed((r) => ({ ...r, [idx]: true }))
  }

  function next() {
    if (idx < run!.questions.length - 1) setIdx(idx + 1)
  }
  function prev() {
    if (idx > 0) setIdx(idx - 1)
  }

  async function finish() {
    if (submitting) return
    setSubmitting(true)
    const records: AnswerRecord[] = run!.questions.map((qq) => {
      const c = answers[qq.id]
      return {
        qid: qq.id,
        chosen: c ?? null,
        correct: c === qq.answer,
      }
    })
    const duration =
      run!.durationSeconds && remaining >= 0
        ? run!.durationSeconds - remaining
        : Math.round((Date.now() - +new Date(startedAt.current)) / 1000)
    const attempt = await saveAttempt({
      mode: run!.mode,
      section_slug: run!.section_slug,
      topic_slug: run!.topic_slug,
      answers: records,
      duration_seconds: Math.max(duration, 1),
      started_at: startedAt.current,
    })
    refreshAttempts()
    clearRun()
    nav(`/results/${attempt.id}`, { state: { attempt, origin: run!.origin }, replace: true })
  }

  const progressPct = ((idx + 1) / run.questions.length) * 100
  const lowTime = run.durationSeconds ? remaining < 60 : false

  return (
    <div className="mx-auto max-w-2xl">
      {/* top bar */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => {
            if (confirm('هل تريد إنهاء الجلسة والخروج؟ سيتم حفظ إجاباتك الحالية.')) finish()
          }}
          className="rounded-xl border border-app surface px-3 py-2 text-sm font-bold hover:bg-[var(--bg)]"
        >
          إنهاء
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-muted">
            <span className="truncate">{run.title}</span>
            <span className="tabular">
              {answeredCount}/{run.questions.length} مُجاب
            </span>
          </div>
          <Progress value={progressPct} />
        </div>
        {run.durationSeconds ? (
          <div
            className={`rounded-xl px-3 py-2 text-sm font-extrabold tabular ${
              lowTime
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 animate-pulse'
                : 'surface border border-app'
            }`}
          >
            ⏱️ {fmtTime(remaining)}
          </div>
        ) : null}
      </div>

      {/* question navigator dots for exam/quiz */}
      {!run.immediateFeedback && run.questions.length <= 100 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {run.questions.map((qq, i) => {
            const done = answers[qq.id] !== undefined
            return (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition tabular ${
                  i === idx
                    ? 'bg-brand-600 text-white'
                    : done
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200'
                      : 'surface border border-app text-muted'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      )}

      <div className="surface rounded-2xl border border-app p-5 shadow-sm">
        <QuestionCard
          question={q}
          chosen={chosen}
          onChoose={choose}
          revealed={isRevealed}
          index={idx}
          total={run.questions.length}
          showExplanation={run.immediateFeedback}
        />
      </div>

      {/* controls */}
      <div className="mt-5 flex items-center gap-3">
        <Button variant="outline" onClick={prev} disabled={idx === 0}>
          ← السابق
        </Button>
        {idx === run.questions.length - 1 ? (
          <Button variant="primary" className="mr-auto" onClick={finish} disabled={submitting}>
            {submitting ? 'جارٍ الحفظ…' : 'إنهاء وعرض النتيجة'}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="mr-auto"
            onClick={next}
            disabled={run.immediateFeedback && chosen === null}
          >
            التالي →
          </Button>
        )}
      </div>

      {run.immediateFeedback && chosen === null && (
        <p className="mt-3 text-center text-sm text-muted">اختر إجابة لعرض الشرح ثم انتقل للسؤال التالي</p>
      )}
    </div>
  )
}
