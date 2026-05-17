import { requireUser } from '@/lib/supabase/api-auth'

export async function GET() {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const { data } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return Response.json({ budget: data })
}

export async function POST(request: Request) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const body = await request.json()

  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user!.id)
    .limit(1)
    .maybeSingle()

  const payload = {
    user_id: user!.id,
    method: body.method,
    categories: body.categories,
    income_sources: body.incomeSources ?? [],
    net_monthly_income: body.netMonthlyIncome,
    updated_at: new Date().toISOString(),
  }

  const { data, error: dbErr } = existing
    ? await supabase.from('budgets').update(payload).eq('id', existing.id).select().single()
    : await supabase.from('budgets').insert(payload).select().single()

  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
  return Response.json({ budget: data })
}
