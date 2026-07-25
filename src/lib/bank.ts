import rawBank from '../data/bank.json'
import type { Bank, Question, Section, Topic } from './types'

const bank = rawBank as unknown as Bank

export const sections: Section[] = [...bank.sections].sort((a, b) => a.order - b.order)
export const topics: Topic[] = [...bank.topics].sort((a, b) => a.order - b.order)
export const questions: Question[] = bank.questions

export const sectionBySlug = (slug: string) => sections.find((s) => s.slug === slug)
export const topicBySlug = (slug: string) => topics.find((t) => t.slug === slug)
export const topicsOfSection = (slug: string) =>
  topics.filter((t) => t.section === slug).sort((a, b) => a.order - b.order)

export const questionsOfTopic = (slug: string) => questions.filter((q) => q.topic === slug)
export const questionsOfSection = (slug: string) => {
  const ts = new Set(topicsOfSection(slug).map((t) => t.slug))
  return questions.filter((q) => ts.has(q.topic))
}
export const questionById = (id: string) => questions.find((q) => q.id === id)

export const sectionOfTopic = (topicSlug: string) => {
  const t = topicBySlug(topicSlug)
  return t ? sectionBySlug(t.section) : undefined
}

export function countsBySection() {
  return sections.map((s) => ({
    section: s,
    topics: topicsOfSection(s.slug).length,
    questions: questionsOfSection(s.slug).length,
  }))
}

export const totalQuestions = questions.length

// Fisher-Yates shuffle (returns a new array)
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Build an exam-like set drawing proportionally from all sections.
 * Mirrors the ETEC general exam spread: heavier on the pedagogical domain.
 */
export function buildExamSet(size = 88): Question[] {
  // weights roughly reflecting the general exam emphasis
  const weights: Record<string, number> = { tarbawi: 0.55, kammi: 0.25, lughawi: 0.2 }
  // Sections with no questions yet must not swallow their share of the exam,
  // so the weights are renormalised over the sections that actually have items.
  const available = sections.filter((s) => questionsOfSection(s.slug).length > 0)
  const totalWeight = available.reduce(
    (sum, s) => sum + (weights[s.slug] ?? 1 / sections.length),
    0
  )
  const picked: Question[] = []
  for (const s of available) {
    const w = (weights[s.slug] ?? 1 / sections.length) / (totalWeight || 1)
    const n = Math.round(size * w)
    picked.push(...shuffle(questionsOfSection(s.slug)).slice(0, n))
  }
  // top up or trim to exact size
  if (picked.length < size) {
    const remaining = shuffle(questions.filter((q) => !picked.includes(q)))
    picked.push(...remaining.slice(0, size - picked.length))
  }
  return shuffle(picked).slice(0, size)
}
