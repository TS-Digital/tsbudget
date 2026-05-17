import { requireUser } from '@/lib/supabase/api-auth'

export async function GET() {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const { data, error: dbErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
  return Response.json({ profile: data })
}

export async function POST(request: Request) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const body = await request.json()

  const { data, error: dbErr } = await supabase
    .from('profiles')
    .upsert({ id: user!.id, ...body }, { onConflict: 'id' })
    .select()
    .single()

  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
  return Response.json({ profile: data })
}
