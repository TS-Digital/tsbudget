'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import PayslipCard from '@/components/PayslipCard'
import TaxDonutChart from '@/components/TaxDonutChart'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { TaxBreakdown, TaxInput, EmploymentType, PayFrequency, StudentLoanPlan } from '@/types/finance'

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'employed', label: 'Employed (PAYE)' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'director', label: 'Ltd Company Director' },
  { value: 'benefits', label: 'Benefits / Unemployed' },
  { value: 'student', label: 'Student' },
]

const FREQUENCIES: { value: PayFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'four_weekly', label: '4-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

const STUDENT_LOANS: { value: StudentLoanPlan; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'plan1', label: 'Plan 1 (pre-2012)' },
  { value: 'plan2', label: 'Plan 2 (post-2012)' },
  { value: 'plan4', label: 'Plan 4 (Scotland)' },
  { value: 'plan5', label: 'Plan 5 (2023+)' },
  { value: 'postgrad', label: 'Postgraduate' },
]

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-[#7a8599] mb-1.5">{children}</label>
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export default function CalculatorPage() {
  const [form, setForm] = useState<TaxInput>({
    employmentType: 'employed',
    grossIncome: 30000,
    taxCode: '1257L',
    payFrequency: 'monthly',
    pensionPct: 0,
    studentLoanPlan: 'none',
    scotland: false,
  })

  const [result, setResult] = useState<TaxBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const loadProfile = useCallback(async () => {
    const res = await fetch('/api/tax-profile')
    if (!res.ok) return
    const { taxProfile } = await res.json()
    if (!taxProfile) return
    setForm((prev) => ({
      ...prev,
      grossIncome: taxProfile.gross_income ?? prev.grossIncome,
      taxCode: taxProfile.tax_code ?? prev.taxCode,
      payFrequency: taxProfile.pay_frequency ?? prev.payFrequency,
      pensionPct: taxProfile.pension_pct ?? prev.pensionPct,
      studentLoanPlan: taxProfile.student_loan_plan ?? prev.studentLoanPlan,
      scotland: taxProfile.scotland ?? prev.scotland,
      employmentType: taxProfile.employment_type ?? prev.employmentType,
    }))
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        loadProfile()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (uid) loadProfile()
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const set = useCallback(<K extends keyof TaxInput>(key: K, value: TaxInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
  }, [])

  async function calculate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Calculation failed')
      setResult(await res.json())
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function saveTaxProfile() {
    setSaveStatus('saving')
    const res = await fetch('/api/tax-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grossIncome: form.grossIncome,
        taxCode: form.taxCode,
        payFrequency: form.payFrequency,
        pensionPct: form.pensionPct,
        studentLoanPlan: form.studentLoanPlan,
        scotland: form.scotland,
        employmentType: form.employmentType,
      }),
    })
    if (res.ok) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
            UK Tax Calculator
          </h1>
          <p className="text-[#7a8599]">2025/26 tax year · Income tax, NI, student loans, pension</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input panel */}
          <div className="rounded-2xl border border-[#2a3447] bg-[#141920] p-6 space-y-5">
            <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
              Your Details
            </h2>

            {/* Employment type */}
            <Field>
              <Label>Employment Type</Label>
              <select
                className="w-full"
                value={form.employmentType}
                onChange={(e) => set('employmentType', e.target.value as EmploymentType)}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>

            {/* Gross income */}
            <Field>
              <Label>Gross Annual Income (£)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8599]">£</span>
                <input
                  type="number"
                  className="w-full pl-9"
                  min={0}
                  step={1000}
                  value={form.grossIncome}
                  onChange={(e) => set('grossIncome', parseFloat(e.target.value) || 0)}
                />
              </div>
            </Field>

            {/* Tax code */}
            <Field>
              <Label>Tax Code</Label>
              <input
                type="text"
                className="w-full uppercase"
                placeholder="e.g. 1257L, BR, D0, K500"
                value={form.taxCode}
                onChange={(e) => set('taxCode', e.target.value)}
              />
            </Field>

            {/* Pay frequency */}
            <Field>
              <Label>Pay Frequency</Label>
              <select
                className="w-full"
                value={form.payFrequency}
                onChange={(e) => set('payFrequency', e.target.value as PayFrequency)}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </Field>

            {/* Pension */}
            <Field>
              <Label>Pension Contribution: {form.pensionPct}%</Label>
              <input
                type="range"
                className="w-full"
                min={0}
                max={30}
                step={0.5}
                value={form.pensionPct}
                onChange={(e) => set('pensionPct', parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-xs text-[#7a8599] mt-1">
                <span>0%</span><span>15%</span><span>30%</span>
              </div>
            </Field>

            {/* Student loan */}
            <Field>
              <Label>Student Loan Plan</Label>
              <select
                className="w-full"
                value={form.studentLoanPlan}
                onChange={(e) => set('studentLoanPlan', e.target.value as StudentLoanPlan)}
              >
                {STUDENT_LOANS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </Field>

            {/* Scotland toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.scotland}
                  onChange={(e) => set('scotland', e.target.checked)}
                />
                <div className="w-10 h-6 bg-[#2a3447] rounded-full peer-checked:bg-[#c9a84c] transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm font-medium">Scotland income tax rates</span>
            </label>

            {/* Calculate button */}
            {error && <p className="text-[#ef4444] text-sm">{error}</p>}
            <button
              onClick={calculate}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-[#0d1017] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#c9a84c', fontFamily: 'var(--font-syne)' }}
            >
              {loading ? 'Calculating…' : 'Calculate Take-Home Pay'}
            </button>

            {/* Save tax profile */}
            {userId ? (
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={saveTaxProfile}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#2a3447] hover:border-[#c9a84c]/50 text-[#7a8599] hover:text-[#c9a84c] transition-colors disabled:opacity-60"
                >
                  {saveStatus === 'saving' ? 'Saving…' : 'Save Tax Profile'}
                </button>
                {saveStatus === 'saved' && <span className="text-sm text-[#22c55e]">Saved!</span>}
                {saveStatus === 'error' && <span className="text-sm text-[#ef4444]">Save failed</span>}
              </div>
            ) : (
              <p className="text-xs text-[#7a8599]">
                <Link href="/login?next=/calculator" className="font-semibold text-[#c9a84c] hover:text-[#e2c06e]">
                  Sign in
                </Link>{' '}
                to save your tax profile.
              </p>
            )}
          </div>

          {/* Results panel */}
          <div className="space-y-6">
            {result ? (
              <>
                <TaxDonutChart breakdown={result} />
                <PayslipCard breakdown={result} frequency={form.payFrequency} />
              </>
            ) : (
              <div className="h-full min-h-64 rounded-2xl border border-[#2a3447] bg-[#141920] flex flex-col items-center justify-center text-center p-8">
                <div className="text-4xl mb-4" style={{ color: '#c9a84c' }}>£</div>
                <p className="text-[#7a8599]">
                  Fill in your details and click <strong className="text-[#e8eaf0]">Calculate</strong> to see your
                  take-home pay breakdown.
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-[#7a8599]">
          TSBudget provides estimates for guidance only. Consult a qualified accountant for regulated financial advice.
        </footer>
      </main>
    </>
  )
}
