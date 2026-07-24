import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getLocalAttempts, pullRemoteAttempts, registerQidTopic } from '../lib/store'
import { questionById, topicBySlug } from '../lib/bank'
import type { Attempt } from '../lib/types'

// resolve a question id to its topic slug for stats aggregation
registerQidTopic((qid) => questionById(qid)?.topic)

type Theme = 'light' | 'dark'

interface AppState {
  user: User | null
  session: Session | null
  loadingAuth: boolean
  theme: Theme
  toggleTheme: () => void
  attempts: Attempt[]
  refreshAttempts: () => void
  signOut: () => Promise<void>
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [attempts, setAttempts] = useState<Attempt[]>(() => getLocalAttempts())
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('pl_theme') as Theme | null
    if (saved) return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('pl_theme', theme)
  }, [theme])

  const refreshAttempts = () => setAttempts(getLocalAttempts())

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session)
        setUser(data.session?.user ?? null)
        if (data.session?.user) pullRemoteAttempts().then(refreshAttempts)
      })
      .catch(() => {
        /* auth backend unreachable — continue in guest mode */
      })
      .finally(() => setLoadingAuth(false))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setUser(sess?.user ?? null)
      if (sess?.user) pullRemoteAttempts().then(refreshAttempts)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const value = useMemo<AppState>(
    () => ({
      user,
      session,
      loadingAuth,
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      attempts,
      refreshAttempts,
      signOut,
    }),
    [user, session, loadingAuth, theme, attempts]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used within AppProvider')
  return v
}

export { topicBySlug }
