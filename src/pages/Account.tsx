import { useNavigate } from 'react-router-dom'
import { Button, Card, Badge } from '../components/ui'
import { useApp } from '../context/AppContext'
import { computeStats } from '../lib/store'
import { topicBySlug } from '../lib/bank'
import { useEffect } from 'react'

export default function Account() {
  const nav = useNavigate()
  const { user, signOut, attempts } = useApp()
  const stats = computeStats(attempts, (t) => topicBySlug(t)?.section)

  useEffect(() => {
    if (!user) nav('/auth', { replace: true })
  }, [user, nav])

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card className="p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-2xl font-extrabold text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
          {(user.email ?? 'م')[0].toUpperCase()}
        </div>
        <div className="mt-3 font-extrabold" dir="ltr">{user.email}</div>
        <div className="mt-1"><Badge tone="emerald">حساب مفعّل</Badge></div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Mini label="أسئلة" value={stats.totalAnswered} />
        <Mini label="الإتقان" value={`${Math.round(stats.accuracy)}%`} />
        <Mini label="اختبارات" value={stats.examsTaken} />
      </div>

      <Card className="divide-y divide-app">
        <Row onClick={() => nav('/progress')} icon="📊" label="تقدمي التفصيلي" />
        <Row onClick={() => nav('/mistakes')} icon="🔁" label="بنك أخطائي" />
        <Row onClick={() => nav('/exam')} icon="⏱️" label="اختبار محاكاة جديد" />
      </Card>

      <Button
        variant="danger"
        className="w-full"
        onClick={async () => {
          await signOut()
          nav('/', { replace: true })
        }}
      >
        تسجيل الخروج
      </Button>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface rounded-2xl border border-app p-4 text-center">
      <div className="text-xl font-extrabold tabular">{value}</div>
      <div className="text-xs font-bold text-muted">{label}</div>
    </div>
  )
}

function Row({ onClick, icon, label }: { onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 p-4 text-right transition hover:bg-[var(--bg)]"
    >
      <span className="text-xl">{icon}</span>
      <span className="flex-1 font-bold">{label}</span>
      <span className="text-muted">←</span>
    </button>
  )
}
