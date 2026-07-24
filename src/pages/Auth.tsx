import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

type Tab = 'signin' | 'signup'

export default function Auth() {
  const nav = useNavigate()
  const { user } = useApp()
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (user) nav('/account', { replace: true })
  }, [user, nav])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // Supabase returns a success with an empty `identities` array when the
        // email is already registered (anti-enumeration). No account is created
        // and no email is sent — so tell the user to sign in instead of leaving
        // them waiting for a message that will never arrive.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setTab('signin')
          setMsg({
            kind: 'err',
            text: 'هذا البريد مسجّل مسبقاً ولن يصلك بريد تأكيد. سجّل الدخول بكلمة مرورك، أو أعد تعيينها إن نسيتها.',
          })
          return
        }

        // When email confirmation is disabled, a session comes back right away.
        if (data.session) {
          nav('/', { replace: true })
          return
        }

        setMsg({
          kind: 'ok',
          text: 'تم إنشاء الحساب! تحقق من بريدك (ومجلد الرسائل غير المرغوبة) لتأكيد الحساب ثم سجّل الدخول.',
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        nav('/', { replace: true })
      }
    } catch (err) {
      setMsg({ kind: 'err', text: translateError((err as Error).message) })
    } finally {
      setBusy(false)
    }
  }

  async function resetPassword() {
    if (!email) {
      setMsg({ kind: 'err', text: 'اكتب بريدك الإلكتروني أولاً ثم اضغط «نسيت كلمة المرور».' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      })
      if (error) throw error
      setMsg({
        kind: 'ok',
        text: 'أُرسل رابط إعادة تعيين كلمة المرور إلى بريدك (تحقق من مجلد الرسائل غير المرغوبة).',
      })
    } catch (err) {
      setMsg({ kind: 'err', text: translateError((err as Error).message) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-2xl text-white">
          ر
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">
          {tab === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </h1>
        <p className="mt-1 text-sm text-muted">لحفظ تقدمك ومزامنته عبر أجهزتك</p>
      </div>

      <Card className="p-6">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-app p-1">
          <TabBtn active={tab === 'signin'} onClick={() => setTab('signin')}>دخول</TabBtn>
          <TabBtn active={tab === 'signup'} onClick={() => setTab('signup')}>حساب جديد</TabBtn>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            dir="ltr"
          />
          <Field
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="6 أحرف على الأقل"
            dir="ltr"
          />

          {msg && (
            <div
              className={`rounded-xl p-3 text-sm ${
                msg.kind === 'ok'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
              }`}
            >
              {msg.text}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? 'جارٍ…' : tab === 'signin' ? 'دخول' : 'إنشاء الحساب'}
          </Button>
        </form>

        {tab === 'signin' && (
          <button
            type="button"
            onClick={resetPassword}
            disabled={busy}
            className="mt-4 block w-full text-center text-sm font-bold text-muted hover:text-brand-600 disabled:opacity-50"
          >
            نسيت كلمة المرور؟
          </button>
        )}
      </Card>

      <button
        onClick={() => nav('/')}
        className="mt-4 block w-full text-center text-sm font-bold text-muted hover:text-brand-600"
      >
        المتابعة كزائر ←
      </button>
    </div>
  )
}

function TabBtn({
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
      type="button"
      onClick={onClick}
      className={`rounded-lg py-2 text-sm font-bold transition ${
        active ? 'bg-brand-600 text-white' : 'text-muted hover:bg-[var(--bg)]'
      }`}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  dir,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      <input
        type={type}
        value={value}
        dir={dir}
        required
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-app surface px-4 py-2.5 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
    </label>
  )
}

function translateError(m: string): string {
  if (/Invalid login credentials/i.test(m)) return 'بيانات الدخول غير صحيحة.'
  if (/already registered/i.test(m)) return 'هذا البريد مسجّل مسبقاً — سجّل الدخول.'
  if (/at least 6/i.test(m)) return 'كلمة المرور يجب ألا تقل عن 6 أحرف.'
  if (/rate limit/i.test(m)) return 'محاولات كثيرة، انتظر قليلاً ثم أعد المحاولة.'
  return m
}
