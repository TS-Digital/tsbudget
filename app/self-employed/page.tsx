'use client'

import { useState, useMemo } from 'react'
import Nav from '@/components/Nav'

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(n)
}

type VatRate = 'standard' | 'reduced' | 'zero'
const VAT_RATES: Record<VatRate, number> = { standard: 0.20, reduced: 0.05, zero: 0 }

function calcSelfEmployedTax(profit: number): { incomeTax: number; class2: number; class4: number; total: number } {
  // Income tax (simplified — uses England/Wales 2025/26 bands)
  const pa = 12570
  const taxable = Math.max(0, profit - pa)
  let incomeTax = 0
  if (taxable > 0) incomeTax += Math.min(taxable, 50270 - 12570) * 0.20
  if (taxable > 50270 - 12570) incomeTax += Math.min(taxable - (50270 - 12570), 125140 - 50270) * 0.40
  if (taxable > 125140 - 12570) incomeTax += (taxable - (125140 - 12570)) * 0.45

  // Class 2 NI
  const class2 = profit > 12570 ? 3.45 * 52 : 0

  // Class 4 NI
  let class4 = 0
  if (profit > 12570) class4 += Math.min(profit, 50270) - 12570
  if (profit > 50270) class4 += (profit - 50270) * 0.02
  class4 = class4 > 0 ? (Math.min(profit, 50270) - 12570) * 0.06 + (profit > 50270 ? (profit - 50270) * 0.02 : 0) : 0

  return { incomeTax, class2, class4, total: incomeTax + class2 + class4 }
}

export default function SelfEmployedPage() {
  const [income, setIncome] = useState(50000)
  const [expenses, setExpenses] = useState(10000)
  const [vatRegistered, setVatRegistered] = useState(false)
  const [vatRate, setVatRate] = useState<VatRate>('standard')
  const [isDirector, setIsDirector] = useState(false)
  const [directorSalary, setDirectorSalary] = useState(12570)

  const profit = Math.max(0, income - expenses)
  const tax = useMemo(() => calcSelfEmployedTax(profit), [profit])

  const netAfterTax = profit - tax.total
  const recommendedReserve = profit > 0 ? ((tax.total / profit) * 100 + 5) : 25
  const monthlyTakeHome = netAfterTax / 12

  // VAT
  const vatAmount = vatRegistered ? income * VAT_RATES[vatRate] : 0
  const vatQuarterly = vatAmount / 4

  // Corp tax (if director)
  const corpTaxRate = profit <= 50000 ? 0.19 : profit >= 250000 ? 0.25 : 0.19 + ((profit - 50000) / 200000) * 0.06
  const corpTax = isDirector ? profit * corpTaxRate : 0
  const dividendIncome = isDirector ? profit - directorSalary - corpTax : 0

  const rows = [
    { label: 'Business Income', value: fmt(income), positive: true },
    { label: 'Business Expenses', value: `−${fmt(expenses)}`, positive: false },
    { label: 'Taxable Profit', value: fmt(profit), highlight: true },
    { label: 'Income Tax (Self-Assessment)', value: `−${fmt(tax.incomeTax)}`, positive: false },
    { label: 'Class 2 NI', value: `−${fmt(tax.class2)}`, positive: false },
    { label: 'Class 4 NI', value: `−${fmt(tax.class4)}`, positive: false },
    { label: 'Total Tax Bill', value: `−${fmt(tax.total)}`, positive: false, highlight: true },
    { label: 'Net Annual Take-Home', value: fmt(netAfterTax), positive: true, big: true },
    { label: 'Monthly Take-Home', value: fmt(monthlyTakeHome), positive: true },
  ]

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
            Self-Employed / Business Module
          </h1>
          <p className="text-[#7a8599]">
            Profit after expenses, Self-Assessment tax estimate, VAT reserve, and director planning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#2a3447] bg-[#141920] p-6 space-y-4">
              <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Income & Expenses</h2>

              {[
                { label: 'Gross Business Income (£)', value: income, set: setIncome },
                { label: 'Allowable Business Expenses (£)', value: expenses, set: setExpenses },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs text-[#7a8599] mb-1.5">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8599]">£</span>
                    <input
                      type="number"
                      className="w-full pl-7"
                      min={0}
                      step={1000}
                      value={f.value}
                      onChange={(e) => f.set(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* VAT */}
            <div className="rounded-2xl border border-[#2a3447] bg-[#141920] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>VAT</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" checked={vatRegistered} onChange={(e) => setVatRegistered(e.target.checked)} />
                    <div className="w-9 h-5 bg-[#2a3447] rounded-full peer-checked:bg-[#c9a84c] transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-sm">VAT registered</span>
                </label>
              </div>
              {vatRegistered && (
                <>
                  <div>
                    <label className="block text-xs text-[#7a8599] mb-1.5">VAT Rate</label>
                    <select className="w-full" value={vatRate} onChange={(e) => setVatRate(e.target.value as VatRate)}>
                      <option value="standard">Standard (20%)</option>
                      <option value="reduced">Reduced (5%)</option>
                      <option value="zero">Zero-Rated (0%)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#1c2433] p-3">
                      <div className="text-xs text-[#7a8599] mb-1">VAT to collect annually</div>
                      <div className="font-bold font-num text-lg" style={{ color: '#fb923c' }}>{fmt(vatAmount)}</div>
                    </div>
                    <div className="rounded-xl bg-[#1c2433] p-3">
                      <div className="text-xs text-[#7a8599] mb-1">VAT per quarter</div>
                      <div className="font-bold font-num text-lg" style={{ color: '#fb923c' }}>{fmt(vatQuarterly)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Director */}
            <div className="rounded-2xl border border-[#2a3447] bg-[#141920] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Ltd Company Director</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" checked={isDirector} onChange={(e) => setIsDirector(e.target.checked)} />
                    <div className="w-9 h-5 bg-[#2a3447] rounded-full peer-checked:bg-[#c9a84c] transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </div>
                  <span className="text-sm">I run a Ltd company</span>
                </label>
              </div>
              {isDirector && (
                <>
                  <div>
                    <label className="block text-xs text-[#7a8599] mb-1.5">Director Salary (£/yr)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8599]">£</span>
                      <input
                        type="number"
                        className="w-full pl-7"
                        min={0}
                        step={1000}
                        value={directorSalary}
                        onChange={(e) => setDirectorSalary(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <p className="text-xs text-[#7a8599] mt-1">Tip: set to £12,570 to avoid NI whilst using full personal allowance.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-[#1c2433] p-3">
                      <div className="text-xs text-[#7a8599] mb-1">Corp Tax Rate</div>
                      <div className="font-bold font-num">{(corpTaxRate * 100).toFixed(1)}%</div>
                    </div>
                    <div className="rounded-xl bg-[#1c2433] p-3">
                      <div className="text-xs text-[#7a8599] mb-1">Corp Tax Bill</div>
                      <div className="font-bold font-num text-[#ef4444]">{fmt(corpTax)}</div>
                    </div>
                    <div className="rounded-xl bg-[#1c2433] p-3">
                      <div className="text-xs text-[#7a8599] mb-1">Dividend</div>
                      <div className="font-bold font-num text-[#22c55e]">{fmt(dividendIncome)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#2a3447] bg-[#141920] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2a3447]">
                <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Tax Breakdown</h2>
              </div>
              <div className="divide-y divide-[#2a3447]/50">
                {rows.map((r) => (
                  <div key={r.label} className={`px-6 py-3 flex items-center justify-between ${r.highlight ? 'bg-[#1c2433]' : ''}`}>
                    <span className={`text-sm ${r.highlight ? 'font-semibold' : 'text-[#e8eaf0]'}`}>{r.label}</span>
                    <span
                      className={`font-mono text-sm ${
                        r.big ? 'text-lg font-bold' : ''
                      } ${r.positive ? (r.highlight ? 'text-[#c9a84c]' : 'text-[#22c55e]') : 'text-[#ef4444]'}`}
                    >
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax reserve */}
            <div className="rounded-2xl border border-[#fb923c]/30 bg-[#fb923c]/5 p-6">
              <h3 className="font-bold mb-1" style={{ fontFamily: 'var(--font-syne)', color: '#fb923c' }}>
                Tax Reserve Pot
              </h3>
              <p className="text-xs text-[#7a8599] mb-3">
                Set aside this % of each invoice/payment for your Self-Assessment bill.
              </p>
              <div className="text-4xl font-bold font-num" style={{ color: '#fb923c' }}>
                {Math.min(100, Math.round(recommendedReserve))}%
              </div>
              <p className="text-xs text-[#7a8599] mt-2">
                That&apos;s roughly {fmt((income * Math.min(100, recommendedReserve)) / 100 / 12)}/month set aside.
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-[#7a8599]">
          TSBudget provides estimates for guidance only. Consult a qualified accountant for regulated financial advice.
        </footer>
      </main>
    </>
  )
}
