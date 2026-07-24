import type { Mode, Question } from './types'

export interface RunConfig {
  mode: Mode
  title: string
  questions: Question[]
  section_slug: string | null
  topic_slug: string | null
  // exam/quiz: reveal answers only at the end. practice: reveal immediately.
  immediateFeedback: boolean
  durationSeconds?: number // countdown for exam
  origin: string // where to return / retry
}

const KEY = 'pl_active_run_v1'

let active: RunConfig | null = null

export function startRun(cfg: RunConfig) {
  active = cfg
  try {
    // questions can be re-derived, but persist ids to allow refresh-resume
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...cfg, questions: cfg.questions.map((q) => q.id) })
    )
  } catch {
    /* ignore */
  }
}

export function getActiveRun(): RunConfig | null {
  return active
}

export function clearRun() {
  active = null
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

// Rehydrate after a page refresh using the bank to resolve question ids.
export function resumeRun(resolve: (id: string) => Question | undefined): RunConfig | null {
  if (active) return active
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Omit<RunConfig, 'questions'> & { questions: string[] }
    const questions = parsed.questions
      .map(resolve)
      .filter((q): q is Question => Boolean(q))
    if (!questions.length) return null
    active = { ...parsed, questions }
    return active
  } catch {
    return null
  }
}
