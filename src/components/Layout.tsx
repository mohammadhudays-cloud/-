import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useApp()
  return (
    <button
      onClick={toggleTheme}
      aria-label="تبديل المظهر"
      className="grid h-9 w-9 place-items-center rounded-xl border border-app surface hover:bg-[var(--bg)] transition"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

const nav = [
  { to: '/', label: 'الرئيسية', icon: '🏠', end: true },
  { to: '/study', label: 'المذاكرة', icon: '📖' },
  { to: '/practice', label: 'التدريب', icon: '✏️' },
  { to: '/exam', label: 'المحاكاة', icon: '⏱️' },
  { to: '/progress', label: 'تقدمي', icon: '📊' },
]

export default function Layout() {
  const { user } = useApp()
  const loc = useLocation()
  // hide chrome during an active exam/quiz run for focus
  const focus = /\/(run|exam\/run)/.test(loc.pathname)

  return (
    <div className="min-h-dvh flex flex-col">
      {!focus && (
        <header className="sticky top-0 z-30 border-b border-app surface/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                ر
              </span>
              <span className="hidden sm:block">الرخصة المهنية</span>
            </Link>
            <nav className="mr-auto hidden md:flex items-center gap-1">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-bold transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                        : 'text-muted hover:bg-[var(--bg)]'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="mr-auto md:mr-0 flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <Link
                  to="/account"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-700 font-bold dark:bg-brand-900/50 dark:text-brand-200"
                  title={user.email ?? 'حسابي'}
                >
                  {(user.email ?? 'م')[0].toUpperCase()}
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-700"
                >
                  دخول
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      {!focus && (
        <nav className="sticky bottom-0 z-30 border-t border-app surface md:hidden">
          <div className="mx-auto grid max-w-5xl grid-cols-5">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2 text-[0.7rem] font-bold transition ${
                    isActive ? 'text-brand-600 dark:text-brand-300' : 'text-muted'
                  }`
                }
              >
                <span className="text-lg">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      {!focus && (
        <footer className="border-t border-app py-6 text-center text-xs text-muted">
          منصة تدريبية غير رسمية لإعداد المعلمين لاختبار الرخصة المهنية العام · بُنيت للأغراض التعليمية
        </footer>
      )}
    </div>
  )
}
