import { requireUser } from '@/lib/supabase/api-auth'

export async function GET() {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const { data } = await supabase
    .from('tax_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return Response.json({ taxProfile: data })
}

export async function POST(request: Request) {
  const { user, supabase, error } = await requireUser()
  if (error) return error

  const body = await request.json()

  // Upsert: one tax profile per user (latest row)
  const { data: existing } = await supabase
    .from('tax_profiles')
    .select('id')
    .eq('user_id', user!.id)
    .limit(1)
    .maybeSingle()

  const payload = {
    user_id: user!.id,
    gross_income: body.grossIncome,
    tax_code: body.taxCode,
    pay_frequency: body.payFrequency,
    pension_pct: body.pensionPct,
    student_loan_plan: body.studentLoanPlan,
    scotland: body.scotland,
    employment_type: body.employmentType,
    updated_at: new Date().toISOString(),
  }

  const { data, error: dbErr } = existing
    ? await supabase.from('tax_profiles').update(payload).eq('id', existing.id).select().single()
    : await supabase.from('tax_profiles').insert(payload).select().single()

  if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
  return Response.json({ taxProfile: data })
}
