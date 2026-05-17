import { createClient } from '@/lib/supabase/server'

/** Returns the authenticated user or a 401 Response. */
export async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, supabase, error: Response.json({ error: 'Unauthorised' }, { status: 401 }) }
  }
  return { user, supabase, error: null }
}
