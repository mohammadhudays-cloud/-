import { createClient } from '@supabase/supabase-js'

// The publishable key is safe to ship in client code. Env vars (set in Netlify)
// take precedence so the project can be re-pointed without a rebuild of these
// defaults, but sensible fallbacks keep the deployed site working out of the box.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://jisrxycanpofnfnfdhtc.supabase.co'
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_RKs-6ZjE_XwgsW33yXzDBw_T49jjzni'

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = Boolean(url && key)
