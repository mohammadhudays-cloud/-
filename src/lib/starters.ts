import { startRun } from './session'
import { shuffle } from './bank'
import type { Question } from './types'

export function startExam(questions: Question[], minutes: number) {
  startRun({
    mode: 'exam',
    title: 'اختبار محاكاة — الاختبار العام',
    questions,
    section_slug: null,
    topic_slug: null,
    immediateFeedback: false,
    durationSeconds: minutes * 60,
    origin: '/exam',
  })
}

export function startPractice(opts: {
  questions: Question[]
  title: string
  section_slug: string | null
  topic_slug: string | null
  origin: string
}) {
  startRun({
    mode: 'practice',
    title: opts.title,
    questions: shuffle(opts.questions),
    section_slug: opts.section_slug,
    topic_slug: opts.topic_slug,
    immediateFeedback: true,
    origin: opts.origin,
  })
}

export function startQuiz(opts: {
  questions: Question[]
  title: string
  section_slug: string | null
  topic_slug: string | null
  origin: string
}) {
  startRun({
    mode: 'quiz',
    title: opts.title,
    questions: shuffle(opts.questions),
    section_slug: opts.section_slug,
    topic_slug: opts.topic_slug,
    immediateFeedback: false,
    origin: opts.origin,
  })
}
