import { requireUser } from '@/lib/supabase/api-auth'

export async function GET() {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const { data, error: dbErr } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
  return Response.json({ goals: data })
}

export async function POST(request: Request) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const body = await request.json()

  const { data, error: dbErr } = await supabase
    .from('goals')
    .insert({
      user_id: user!.id,
      name: body.name,
      target_amount: body.targetAmount,
      current_amount: body.currentAmount ?? 0,
      monthly_contribution: body.monthlyContribution ?? 0,
    })
    .select()
    .single()

  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
  return Response.json({ goal: data })
}

export async function PATCH(request: Request) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const body = await request.json()
  const { id, ...updates } = body

  const { data, error: dbErr } = await supabase
    .from('goals')
    .update({
      name: updates.name,
      target_amount: updates.targetAmount,
      current_amount: updates.currentAmount,
      monthly_contribution: updates.monthlyContribution,
    })
    .eq('id', id)
    .eq('user_id', user!.id) // RLS guard
    .select()
    .single()

  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
  return Response.json({ goal: data })
}

export async function DELETE(request: Request) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  const { error: dbErr } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user!.id)

  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
  return Response.json({ ok: true })
}
