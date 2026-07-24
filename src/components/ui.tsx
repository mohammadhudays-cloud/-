import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Card({
  children,
  className = '',
  as: As = 'div',
  to,
  onClick,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'button'
  to?: string
  onClick?: () => void
}) {
  const cls = `surface border rounded-2xl shadow-sm ${className}`
  if (to)
    return (
      <Link to={to} className={`${cls} block transition hover:shadow-md hover:-translate-y-0.5`}>
        {children}
      </Link>
    )
  if (As === 'button')
    return (
      <button onClick={onClick} className={`${cls} text-right w-full transition hover:shadow-md`}>
        {children}
      </button>
    )
  return <div className={cls}>{children}</div>
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed select-none'
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-[0.95rem]',
    lg: 'px-6 py-3.5 text-lg',
  }
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200',
    outline: 'border border-app text-[var(--text)] hover:bg-[var(--bg)]',
    ghost: 'text-[var(--text)] hover:bg-[var(--bg)]',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Progress({ value, tone = 'brand' }: { value: number; tone?: string }) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }
  return (
    <div className="h-2.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${tones[tone] ?? tones.brand}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  }
  return (
    <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${tones[tone] ?? tones.slate}`}>
      {children}
    </span>
  )
}

export const sectionTone = (color: string) =>
  ({ emerald: 'emerald', sky: 'sky', amber: 'amber' }[color] ?? 'brand')

export function difficultyLabel(d: number) {
  return d === 1 ? 'سهل' : d === 2 ? 'متوسط' : 'متقدم'
}
export function difficultyTone(d: number) {
  return d === 1 ? 'emerald' : d === 2 ? 'sky' : 'rose'
}
