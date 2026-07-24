import { Link, useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Progress, sectionTone } from '../components/ui'
import { Markdown } from '../components/Markdown'
import {
  sections,
  sectionBySlug,
  topicsOfSection,
  topicBySlug,
  questionsOfTopic,
  questionsOfSection,
} from '../lib/bank'
import { useApp } from '../context/AppContext'
import { computeStats } from '../lib/store'
import { startPractice } from '../lib/starters'

export function StudyIndex() {
  const { attempts } = useApp()
  const stats = computeStats(attempts, (t) => topicBySlug(t)?.section)
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold">المذاكرة</h1>
        <p className="mt-1 text-muted">ملخصات مركزة لكل موضوع مع تدريب مباشر عليه.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((s) => {
          const ps = stats.perSection[s.slug]
          const acc = ps && ps.answered ? Math.round((ps.correct / ps.answered) * 100) : 0
          return (
            <Card key={s.slug} to={`/study/${s.slug}`} className="p-5">
              <div className="text-3xl">{s.icon}</div>
              <h2 className="mt-2 text-lg font-extrabold">{s.title}</h2>
              <p className="mt-1 text-sm text-muted">{topicsOfSection(s.slug).length} مواضيع · {questionsOfSection(s.slug).length} سؤال</p>
              <div className="mt-3">
                <Progress value={acc} tone={sectionTone(s.color)} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function SectionPage() {
  const { section } = useParams()
  const s = section ? sectionBySlug(section) : undefined
  const { attempts } = useApp()
  const nav = useNavigate()
  const stats = computeStats(attempts, (t) => topicBySlug(t)?.section)
  if (!s) return <NotFoundInline />

  const topics = topicsOfSection(s.slug)
  const tone = sectionTone(s.color)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/study" className="hover:underline">المذاكرة</Link>
        <span>/</span>
        <span className="font-bold text-[var(--text)]">{s.title}</span>
      </div>

      <header className="surface rounded-2xl border border-app p-5">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{s.icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold">{s.title}</h1>
            <p className="mt-1 text-muted leading-relaxed">{s.description}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              startPractice({
                questions: questionsOfSection(s.slug),
                title: `تدريب — ${s.title}`,
                section_slug: s.slug,
                topic_slug: null,
                origin: `/study/${s.slug}`,
              })
              nav('/run')
            }}
          >
            ✏️ تدرب على المجال كامل
          </Button>
        </div>
      </header>

      <div className="grid gap-3">
        {topics.map((t) => {
          const pt = stats.perTopic[t.slug]
          const acc = pt && pt.answered ? Math.round((pt.correct / pt.answered) * 100) : 0
          const n = questionsOfTopic(t.slug).length
          return (
            <Card key={t.slug} to={`/study/${s.slug}/${t.slug}`} className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 font-extrabold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 tabular">
                  {t.order}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{t.title}</h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="w-24"><Progress value={acc} tone={tone} /></div>
                    <span className="text-xs text-muted tabular">{acc}% · {n} سؤال</span>
                  </div>
                </div>
                <span className="text-muted">←</span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function TopicPage() {
  const { section, topic } = useParams()
  const nav = useNavigate()
  const s = section ? sectionBySlug(section) : undefined
  const t = topic ? topicBySlug(topic) : undefined
  if (!s || !t) return <NotFoundInline />
  const qs = questionsOfTopic(t.slug)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/study" className="hover:underline">المذاكرة</Link>
        <span>/</span>
        <Link to={`/study/${s.slug}`} className="hover:underline">{s.short_title}</Link>
        <span>/</span>
        <span className="font-bold text-[var(--text)]">{t.title}</span>
      </div>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{t.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge tone="brand">{s.short_title}</Badge>
            <Badge>{qs.length} سؤال تدريبي</Badge>
          </div>
        </div>
        <Button
          size="lg"
          onClick={() => {
            startPractice({
              questions: qs,
              title: `تدريب — ${t.title}`,
              section_slug: s.slug,
              topic_slug: t.slug,
              origin: `/study/${s.slug}/${t.slug}`,
            })
            nav('/run')
          }}
        >
          ✏️ تدرب على هذا الموضوع
        </Button>
      </header>

      <article className="surface rounded-2xl border border-app p-5 sm:p-7">
        <Markdown source={t.notes} />
      </article>

      <div className="flex justify-center">
        <Button
          size="lg"
          variant="soft"
          onClick={() => {
            startPractice({
              questions: qs,
              title: `تدريب — ${t.title}`,
              section_slug: s.slug,
              topic_slug: t.slug,
              origin: `/study/${s.slug}/${t.slug}`,
            })
            nav('/run')
          }}
        >
          جاهز؟ ابدأ التدريب على {qs.length} سؤالاً ←
        </Button>
      </div>
    </div>
  )
}

function NotFoundInline() {
  return (
    <div className="py-16 text-center">
      <p className="text-lg font-bold">لم يُعثر على المحتوى المطلوب</p>
      <Link to="/study" className="mt-3 inline-block text-brand-600 hover:underline">
        العودة للمذاكرة
      </Link>
    </div>
  )
}
