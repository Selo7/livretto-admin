import { createClient } from '@supabase/supabase-js'

// Usa a service role key para bypasear RLS nas tabelas admin
export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
