import type { AnswerRecord, Attempt, Mode } from './types'
import { supabase } from './supabase'

const LS_ATTEMPTS = 'pl_attempts_v1'
const LS_MISTAKES = 'pl_mistakes_v1'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    /* storage full or unavailable — ignore */
  }
}

export function getLocalAttempts(): Attempt[] {
  return read<Attempt[]>(LS_ATTEMPTS, [])
}

export interface FinishInput {
  mode: Mode
  section_slug: string | null
  topic_slug: string | null
  answers: AnswerRecord[]
  duration_seconds: number
  started_at: string
}

export async function saveAttempt(input: FinishInput): Promise<Attempt> {
  const correct = input.answers.filter((a) => a.correct).length
  const attempt: Attempt = {
    id: crypto.randomUUID(),
    mode: input.mode,
    section_slug: input.section_slug,
    topic_slug: input.topic_slug,
    total: input.answers.length,
    correct,
    duration_seconds: input.duration_seconds,
    answers: input.answers,
    started_at: input.started_at,
    finished_at: new Date().toISOString(),
  }

  // always persist locally so guests keep their history and it survives offline
  const all = getLocalAttempts()
  all.unshift(attempt)
  write(LS_ATTEMPTS, all.slice(0, 200))
  updateMistakes(input.answers)

  // best-effort sync to Supabase when signed in
  try {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      await supabase.from('pl_attempts').insert({
        user_id: data.user.id,
        mode: attempt.mode,
        section_slug: attempt.section_slug,
        topic_slug: attempt.topic_slug,
        total: attempt.total,
        correct: attempt.correct,
        duration_seconds: attempt.duration_seconds,
        answers: attempt.answers,
        started_at: attempt.started_at,
        finished_at: attempt.finished_at,
      })
    }
  } catch {
    /* network/policy issues never block the local experience */
  }

  return attempt
}

/** Merge remote attempts (on login) into local history, de-duplicated by id. */
export async function pullRemoteAttempts(): Promise<void> {
  try {
    const { data } = await supabase
      .from('pl_attempts')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(200)
    if (!data) return
    const local = getLocalAttempts()
    const byId = new Map<string, Attempt>()
    for (const a of [...local, ...(data as unknown as Attempt[])]) byId.set(a.id, a)
    const merged = [...byId.values()].sort(
      (a, b) => +new Date(b.started_at) - +new Date(a.started_at)
    )
    write(LS_ATTEMPTS, merged.slice(0, 200))
  } catch {
    /* ignore */
  }
}

// ---- Mistakes bank ----------------------------------------------------------
// qid -> number of times still answered wrong (0 removes it)
type MistakeMap = Record<string, number>

export function getMistakes(): MistakeMap {
  return read<MistakeMap>(LS_MISTAKES, {})
}

function updateMistakes(answers: AnswerRecord[]) {
  const m = getMistakes()
  for (const a of answers) {
    if (a.chosen === null) continue
    if (a.correct) {
      if (m[a.qid]) {
        m[a.qid] -= 1
        if (m[a.qid] <= 0) delete m[a.qid]
      }
    } else {
      m[a.qid] = (m[a.qid] || 0) + 1
    }
  }
  write(LS_MISTAKES, m)
}

export function mistakeQids(): string[] {
  return Object.keys(getMistakes())
}

export function clearMistake(qid: string) {
  const m = getMistakes()
  delete m[qid]
  write(LS_MISTAKES, m)
}

// ---- Stats ------------------------------------------------------------------
export interface Stats {
  totalAnswered: number
  totalCorrect: number
  accuracy: number
  attempts: number
  examsTaken: number
  bestExamPct: number
  perSection: Record<string, { answered: number; correct: number }>
  perTopic: Record<string, { answered: number; correct: number }>
  streakDays: number
}

export function computeStats(attempts: Attempt[], topicSection: (t: string) => string | undefined): Stats {
  const perSection: Stats['perSection'] = {}
  const perTopic: Stats['perTopic'] = {}
  let totalAnswered = 0
  let totalCorrect = 0
  let examsTaken = 0
  let bestExamPct = 0

  for (const at of attempts) {
    totalAnswered += at.total
    totalCorrect += at.correct
    if (at.mode === 'exam') {
      examsTaken++
      const pct = at.total ? (at.correct / at.total) * 100 : 0
      if (pct > bestExamPct) bestExamPct = pct
    }
    for (const a of at.answers) {
      const topic = qidTopic(a.qid)
      if (topic) {
        perTopic[topic] ??= { answered: 0, correct: 0 }
        perTopic[topic].answered++
        if (a.correct) perTopic[topic].correct++
        const sec = topicSection(topic)
        if (sec) {
          perSection[sec] ??= { answered: 0, correct: 0 }
          perSection[sec].answered++
          if (a.correct) perSection[sec].correct++
        }
      }
    }
  }

  return {
    totalAnswered,
    totalCorrect,
    accuracy: totalAnswered ? (totalCorrect / totalAnswered) * 100 : 0,
    attempts: attempts.length,
    examsTaken,
    bestExamPct,
    perSection,
    perTopic,
    streakDays: computeStreak(attempts),
  }
}

// question id encodes topic via the bank; resolved lazily to avoid a cycle
let _qidTopic: (qid: string) => string | undefined = () => undefined
export function registerQidTopic(fn: (qid: string) => string | undefined) {
  _qidTopic = fn
}
function qidTopic(qid: string) {
  return _qidTopic(qid)
}

function computeStreak(attempts: Attempt[]): number {
  if (!attempts.length) return 0
  const days = new Set(attempts.map((a) => a.started_at.slice(0, 10)))
  let streak = 0
  const d = new Date()
  // allow today or yesterday to start the streak
  const todayStr = d.toISOString().slice(0, 10)
  const yst = new Date(d.getTime() - 86400000).toISOString().slice(0, 10)
  if (!days.has(todayStr) && !days.has(yst)) return 0
  if (!days.has(todayStr)) d.setDate(d.getDate() - 1)
  for (;;) {
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}
