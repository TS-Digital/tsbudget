'use client'

import { useState, useMemo } from 'react'
import Nav from '@/components/Nav'

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(n)
}

const UC_WORK_ALLOWANCE_WITH_HOUSING = 344
const UC_WORK_ALLOWANCE_WITHOUT_HOUSING = 673
const UC_TAPER = 0.55

export default function BenefitsPage() {
  const [uc, setUc] = useState(800)
  const [housingBenefit, setHousingBenefit] = useState(0)
  const [childBenefit, setChildBenefit] = useState(0)
  const [pip, setPip] = useState(0)
  const [otherBenefits, setOtherBenefits] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [hasHousingCosts, setHasHousingCosts] = useState(true)

  const result = useMemo(() => {
    const workAllowance = hasHousingCosts ? UC_WORK_ALLOWANCE_WITH_HOUSING : UC_WORK_ALLOWANCE_WITHOUT_HOUSING
    const earningsAboveAllowance = Math.max(0, earnings - workAllowance)
    const ucReduction = earningsAboveAllowance * UC_TAPER
    const adjustedUc = Math.max(0, uc - ucReduction)
    const totalIncome = adjustedUc + housingBenefit + childBenefit + pip + otherBenefits + earnings

    // Comparison: +£100 more work
    const extraEarnings = earnings + 100
    const extraReduction = Math.max(0, extraEarnings - workAllowance) * UC_TAPER
    const extraUc = Math.max(0, uc - extraReduction)
    const extraTotal = extraUc + housingBenefit + childBenefit + pip + otherBenefits + extraEarnings
    const netGainFromExtra100 = extraTotal - totalIncome

    return { adjustedUc, ucReduction, totalIncome, netGainFromExtra100 }
  }, [uc, housingBenefit, childBenefit, pip, otherBenefits, earnings, hasHousingCosts])

  const workAllowance = hasHousingCosts ? UC_WORK_ALLOWANCE_WITH_HOUSING : UC_WORK_ALLOWANCE_WITHOUT_HOUSING

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
            Benefits Calculator
          </h1>
          <p className="text-[var(--color-muted)]">
            Universal Credit taper rate, work allowance, and total income from benefits and work.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
              <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Benefits Income</h2>

              {[
                { label: 'Universal Credit (£/month)', value: uc, set: setUc },
                { label: 'Housing Benefit (£/month)', value: housingBenefit, set: setHousingBenefit },
                { label: 'Child Benefit (£/month)', value: childBenefit, set: setChildBenefit },
                { label: 'PIP / ESA / Carers (£/month)', value: pip, set: setPip },
                { label: 'Other Benefits (£/month)', value: otherBenefits, set: setOtherBenefits },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs text-[var(--color-muted)] mb-1.5">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">£</span>
                    <input
                      type="number"
                      className="w-full pl-9"
                      min={0}
                      step={10}
                      value={f.value}
                      onChange={(e) => f.set(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
              <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Work Earnings</h2>

              <div>
                <label className="block text-xs text-[var(--color-muted)] mb-1.5">Monthly Work Earnings (£)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">£</span>
                  <input
                    type="number"
                    className="w-full pl-9"
                    min={0}
                    step={50}
                    value={earnings}
                    onChange={(e) => setEarnings(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={hasHousingCosts} onChange={(e) => setHasHousingCosts(e.target.checked)} />
                  <div className="w-10 h-6 bg-[var(--color-border)] rounded-full peer-checked:bg-[#c9a84c] transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm font-medium">I have housing costs (lower work allowance)</span>
              </label>

              <div className="rounded-xl bg-[var(--color-surface-2)] p-3 text-sm">
                <div className="text-xs text-[var(--color-muted)] mb-1">Your Work Allowance</div>
                <div className="font-bold font-num text-lg" style={{ color: '#c9a84c' }}>
                  {fmt(workAllowance)}/month
                </div>
                <div className="text-xs text-[var(--color-muted)] mt-1">
                  UC is reduced by 55p for every £1 earned above this amount
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Monthly Income Breakdown</h2>
              </div>
              <div className="divide-y divide-[var(--color-border)]/50">
                {[
                  { label: 'UC Standard Allowance', value: fmt(uc) },
                  { label: `UC Reduction (taper on earnings over ${fmt(workAllowance)})`, value: `−${fmt(result.ucReduction)}`, red: true },
                  { label: 'Adjusted UC', value: fmt(result.adjustedUc), highlight: true },
                  { label: 'Housing Benefit', value: fmt(housingBenefit) },
                  { label: 'Child Benefit', value: fmt(childBenefit) },
                  { label: 'PIP / ESA / Carers', value: fmt(pip) },
                  { label: 'Other Benefits', value: fmt(otherBenefits) },
                  { label: 'Work Earnings', value: fmt(earnings), green: true },
                ].map((r) => (
                  <div key={r.label} className={`px-6 py-3 flex items-center justify-between ${r.highlight ? 'bg-[var(--color-surface-2)]' : ''}`}>
                    <span className="text-sm text-[var(--color-text)]">{r.label}</span>
                    <span className={`font-mono text-sm ${r.red ? 'text-[#ef4444]' : r.green ? 'text-[#22c55e]' : r.highlight ? 'text-[#c9a84c] font-bold' : ''}`}>
                      {r.value}
                    </span>
                  </div>
                ))}
                <div className="px-6 py-4 bg-[var(--color-surface-2)] flex items-center justify-between">
                  <span className="font-semibold">Total Monthly Income</span>
                  <span className="text-xl font-bold font-num text-[#22c55e]">{fmt(result.totalIncome)}</span>
                </div>
              </div>
            </div>

            {/* Work incentive card */}
            <div className="rounded-2xl border border-[#34d399]/30 bg-[#34d399]/5 p-6">
              <h3 className="font-bold mb-1" style={{ fontFamily: 'var(--font-syne)', color: '#34d399' }}>
                Is it worth earning more?
              </h3>
              <p className="text-xs text-[var(--color-muted)] mb-4">
                If your earnings increased by £100/month:
              </p>
              <div className="text-3xl font-bold font-num mb-1" style={{ color: result.netGainFromExtra100 > 0 ? '#22c55e' : '#ef4444' }}>
                +{fmt(result.netGainFromExtra100)}
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                net gain (after UC taper reduction) per month
              </p>
              {result.netGainFromExtra100 > 0 && (
                <p className="text-xs text-[#34d399] mt-2">
                  ✓ You keep {fmt(result.netGainFromExtra100)} of every extra £100 earned — it is worth working more.
                </p>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-[var(--color-muted)]">
          NetWorth provides estimates for guidance only. Benefits entitlements depend on your full
          household circumstances. Check GOV.UK or speak to Citizens Advice for accurate figures.
        </footer>
      </main>
    </>
  )
}
