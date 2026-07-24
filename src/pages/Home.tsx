import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Progress, sectionTone } from '../components/ui'
import { countsBySection, totalQuestions, buildExamSet } from '../lib/bank'
import { useApp } from '../context/AppContext'
import { computeStats } from '../lib/store'
import { topicBySlug } from '../lib/bank'
import { startExam } from '../lib/starters'

export default function Home() {
  const nav = useNavigate()
  const { attempts, user } = useApp()
  const stats = computeStats(attempts, (t) => topicBySlug(t)?.section)
  const counts = countsBySection()

  return (
    <div className="space-y-8">
      {/* hero */}
      <section className="relative overflow-hidden rounded-3xl border border-app bg-gradient-to-bl from-brand-600 to-brand-800 p-7 text-white shadow-md sm:p-10">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 left-24 h-52 w-52 rounded-full bg-white/5" />
        <div className="relative">
          <span className="inline-block rounded-lg bg-white/15 px-3 py-1 text-xs font-bold">
            الاختبار العام · التربوي · الكمي · اللغوي
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            استعد لاختبار الرخصة المهنية
            <br /> بثقة وإتقان
          </h1>
          <p className="mt-3 max-w-xl text-white/85 leading-loose">
            بنك أسئلة شامل بالشرح المفصل، اختبارات محاكية بمؤقّت زمني، ملخصات مركزة لكل موضوع، وتتبع
            دقيق لتقدمك. {totalQuestions}+ سؤال في المجالات الثلاثة للاختبار العام.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="soft"
              className="!bg-white !text-brand-700 hover:!bg-brand-50"
              onClick={() => {
                startExam(buildExamSet(88), 120)
                nav('/run')
              }}
            >
              ⏱️ ابدأ اختبار محاكاة
            </Button>
            <Link to="/practice">
              <Button size="lg" variant="soft" className="!bg-white/15 !text-white hover:!bg-white/25">
                ✏️ تدريب سريع
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* quick stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="أسئلة أُجبت" value={stats.totalAnswered} icon="📝" />
        <StatTile
          label="نسبة الإتقان"
          value={`${Math.round(stats.accuracy)}%`}
          icon="🎯"
        />
        <StatTile label="اختبارات محاكاة" value={stats.examsTaken} icon="⏱️" />
        <StatTile label="أيام متتالية" value={stats.streakDays} icon="🔥" />
      </section>

      {/* sections */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">مجالات الاختبار</h2>
          <Link to="/study" className="text-sm font-bold text-brand-600 hover:underline">
            كل المواضيع ←
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {counts.map(({ section, topics, questions }) => {
            const ps = stats.perSection[section.slug]
            const acc = ps && ps.answered ? Math.round((ps.correct / ps.answered) * 100) : 0
            const tone = sectionTone(section.color)
            return (
              <Card key={section.slug} to={`/study/${section.slug}`} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl">{section.icon}</span>
                  <span className="text-xs font-bold text-muted tabular">
                    {questions} سؤال · {topics} موضوع
                  </span>
                </div>
                <h3 className="text-lg font-extrabold">{section.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                  {section.description}
                </p>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-bold text-muted">
                    <span>الإتقان</span>
                    <span className="tabular">{acc}%</span>
                  </div>
                  <Progress value={acc} tone={tone} />
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* practice shortcuts */}
      <section className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          icon="✏️"
          title="تدريب بالمواضيع"
          desc="اختر موضوعاً وتدرب مع شرح فوري لكل سؤال"
          to="/practice"
        />
        <ActionCard
          icon="⏱️"
          title="اختبار محاكاة"
          desc="88 سؤالاً في ساعتين تحاكي الاختبار الحقيقي"
          to="/exam"
        />
        <ActionCard
          icon="🔁"
          title="بنك أخطائي"
          desc="راجع الأسئلة التي أخطأت فيها حتى تتقنها"
          to="/mistakes"
        />
      </section>

      {!user && (
        <section className="rounded-2xl border border-app surface p-5 text-center">
          <p className="font-bold">أنشئ حساباً لحفظ تقدمك عبر أجهزتك</p>
          <p className="mt-1 text-sm text-muted">
            يمكنك التدريب الآن كزائر — بياناتك محفوظة على هذا الجهاز، وتُزامَن عند تسجيل الدخول.
          </p>
          <div className="mt-3">
            <Link to="/auth">
              <Button>إنشاء حساب / دخول</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

function StatTile({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="surface rounded-2xl border border-app p-4">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-2xl font-extrabold tabular">{value}</div>
      <div className="text-xs font-bold text-muted">{label}</div>
    </div>
  )
}

function ActionCard({
  icon,
  title,
  desc,
  to,
}: {
  icon: string
  title: string
  desc: string
  to: string
}) {
  return (
    <Card to={to} className="p-5">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-extrabold">{title}</h3>
      <p className="mt-1 text-sm text-muted leading-relaxed">{desc}</p>
    </Card>
  )
}
