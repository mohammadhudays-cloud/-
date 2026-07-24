export interface Section {
  slug: string
  title: string
  short_title: string
  description: string
  icon: string
  color: string
  order: number
}

export interface Topic {
  slug: string
  section: string
  title: string
  order: number
  notes: string
}

export interface Question {
  id: string
  topic: string
  difficulty: 1 | 2 | 3
  stem: string
  options: string[]
  answer: number
  explanation: string
}

export interface Bank {
  sections: Section[]
  topics: Topic[]
  questions: Question[]
}

export type Mode = 'practice' | 'quiz' | 'exam'

export interface AnswerRecord {
  qid: string
  chosen: number | null
  correct: boolean
}

export interface Attempt {
  id: string
  user_id?: string
  mode: Mode
  section_slug: string | null
  topic_slug: string | null
  total: number
  correct: number
  duration_seconds: number
  answers: AnswerRecord[]
  started_at: string
  finished_at: string | null
}
