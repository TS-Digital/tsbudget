'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const ASSET_CLASSES = [
  { label: 'Cash Savings', return: 4.5, risk: 'Low' },
  { label: 'UK Bonds', return: 5.0, risk: 'Low–Medium' },
  { label: 'FTSE 100', return: 7.5, risk: 'Medium' },
  { label: 'Global Index (S&P 500)', return: 10.0, risk: 'Medium–High' },
  { label: 'UK Property (avg)', return: 8.0, risk: 'Medium' },
  { label: 'Bitcoin (10yr avg)', return: 20.0, risk: 'Very High ⚠' },
]

const WRAPPERS = [
  { value: 'isa', label: 'Stocks & Shares ISA', desc: 'Tax-free growth & withdrawals, £20k/yr limit' },
  { value: 'sipp', label: 'SIPP (Pension)', desc: '25% tax relief added to contributions automatically' },
  { value: 'gia', label: 'General Investment Account', desc: '18% CGT on gains above £3k/yr allowance' },
]

const CASH_RATE = 4.5 // comparison line
const CGT_ALLOWANCE = 3000
const CGT_RATE = 0.18

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (Math.abs(n) >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${n.toFixed(0)}`
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

function buildYearlyData(
  principal: number,
  monthly: number,
  annualRate: number,
  years: number,
  wrapper: string,
) {
  // Effective amounts after tax relief for SIPP
  const effMonthly = wrapper === 'sipp' ? monthly * 1.25 : monthly
  const effPrincipal = wrapper === 'sipp' ? principal * 1.25 : principal
  const monthlyRate = annualRate / 100 / 12
  const cashMonthlyRate = CASH_RATE / 100 / 12

  let balance = effPrincipal
  let cashBalance = principal
  let contributed = effPrincipal
  let cashContributed = principal

  const data: { year: number; investment: number; cash: number; contributed: number }[] = []

  for (let y = 1; y <= years; y++) {
    const startBalance = balance

    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + effMonthly
      cashBalance = cashBalance * (1 + cashMonthlyRate) + monthly
    }

    contributed += effMonthly * 12
    cashContributed += monthly * 12

    // GIA: apply annual CGT on gains above allowance
    if (wrapper === 'gia') {
      const annualGains = balance - startBalance - effMonthly * 12
      const taxableGains = Math.max(0, annualGains - CGT_ALLOWANCE)
      balance -= taxableGains * CGT_RATE
    }

    data.push({
      year: y,
      investment: Math.round(balance),
      cash: Math.round(cashBalance),
      contributed: Math.round(contributed),
    })
  }

  return data
}

export default function InvestCalculator({ defaultMonthly = 200 }: { defaultMonthly?: number }) {
  const [lumpSum, setLumpSum] = useState(1000)
  const [monthly, setMonthly] = useState(defaultMonthly)
  const [assetIdx, setAssetIdx] = useState(3)
  const [wrapper, setWrapper] = useState('isa')
  const [years, setYears] = useState(10)

  const asset = ASSET_CLASSES[assetIdx]
  const isHighRisk = asset.risk.startsWith('Very High')

  const data = useMemo(
    () => buildYearlyData(lumpSum, monthly, asset.return, years, wrapper),
    [lumpSum, monthly, asset.return, years, wrapper],
  )

  const last = data[data.length - 1]
  const finalValue = last?.investment ?? 0
  const cashFinal = last?.cash ?? 0
  const contributed = last?.contributed ?? 0
  const growth = finalValue - contributed
  const taxAdvantage = finalValue - cashFinal

  const sipPBonus = wrapper === 'sipp' ? (lumpSum + monthly * years * 12) * 0.25 : 0

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
        &ldquo;What if I invested?&rdquo; Calculator
      </h2>
      <p className="text-xs text-[var(--color-muted)] mb-5">
        All projections use compound interest and historical average returns. Past performance ≠ future results.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1.5">Lump Sum (£)</label>
          <input type="number" min={0} step={500} value={lumpSum}
            onChange={(e) => setLumpSum(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1.5">Monthly (£)</label>
          <input type="number" min={0} step={50} value={monthly}
            onChange={(e) => setMonthly(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1.5">Years: {years}</label>
          <input type="range" min={1} max={40} step={1} value={years}
            onChange={(e) => setYears(parseInt(e.target.value))} />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-muted)] mb-1.5">Annual Return</label>
          <div className="text-lg font-bold font-num" style={{ color: '#c9a84c' }}>
            {asset.return}%
          </div>
        </div>
      </div>

      {/* Asset class */}
      <div className="mb-4">
        <label className="block text-xs text-[var(--color-muted)] mb-2">Asset Class</label>
        <div className="flex flex-wrap gap-2">
          {ASSET_CLASSES.map((a, i) => (
            <button
              key={a.label}
              onClick={() => setAssetIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                assetIdx === i
                  ? 'border-[#c9a84c] bg-[#c9a84c]/15 text-[#c9a84c]'
                  : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[#c9a84c]/40'
              }`}
            >
              {a.label} ({a.return}%)
            </button>
          ))}
        </div>
        {isHighRisk && (
          <p className="text-xs mt-2 text-[#ef4444]">
            ⚠ Crypto returns are highly volatile. This is shown as historical data only — not a recommendation.
          </p>
        )}
      </div>

      {/* Tax wrapper */}
      <div className="mb-5">
        <label className="block text-xs text-[var(--color-muted)] mb-2">Tax Wrapper</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {WRAPPERS.map((w) => (
            <button
              key={w.value}
              onClick={() => setWrapper(w.value)}
              className={`text-left p-3 rounded-xl border transition-all ${
                wrapper === w.value
                  ? 'border-[#818cf8] bg-[#818cf8]/10'
                  : 'border-[var(--color-border)] hover:border-[#818cf8]/40'
              }`}
            >
              <div className={`text-xs font-semibold mb-0.5 ${wrapper === w.value ? 'text-[#a5b4fc]' : 'text-[var(--color-text)]'}`}>
                {w.label}
              </div>
              <div className="text-xs text-[var(--color-muted)] leading-snug">{w.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Contributed', value: fmt(contributed), color: 'var(--color-text)' },
          { label: 'Final Value', value: fmt(finalValue), color: '#c9a84c' },
          { label: 'Growth', value: fmt(growth), color: '#22c55e' },
          wrapper === 'sipp'
            ? { label: 'Tax Relief Bonus', value: fmt(sipPBonus), color: '#818cf8' }
            : { label: 'vs Cash Savings', value: fmt(taxAdvantage), color: '#818cf8' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-[var(--color-surface-2)] p-3">
            <div className="text-xs text-[var(--color-muted)] mb-1">{s.label}</div>
            <div className="font-bold font-num text-lg leading-tight" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {wrapper === 'sipp' && (
        <div className="mb-4 p-3 rounded-lg border border-[#818cf8]/30 bg-[#818cf8]/5 text-xs text-[#a5b4fc]">
          SIPP values include 20% basic rate tax relief automatically added to contributions.
          Higher-rate taxpayers can claim an additional 20–25% via Self-Assessment.
          25% of the pot can be taken tax-free at retirement (currently age 57+).
        </div>
      )}
      {wrapper === 'gia' && (
        <div className="mb-4 p-3 rounded-lg border border-[#fb923c]/30 bg-[#fb923c]/5 text-xs text-[#fb923c]">
          GIA projections deduct 18% CGT on annual gains above the £{CGT_ALLOWANCE.toLocaleString()} annual allowance.
          Dividend income and interest may also be taxable separately.
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            tickFormatter={(v) => `Yr ${v}`}
          />
          <YAxis tickFormatter={(v) => fmtK(v)} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} width={60} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid #2a3447', borderRadius: '8px', color: 'var(--color-text)', fontSize: '12px' }}
            formatter={(v) => typeof v === 'number' ? fmt(v) : v}
            labelFormatter={(v) => `Year ${v}`}
          />
          <Legend formatter={(v) => <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>{v}</span>} />
          <Line type="monotone" dataKey="investment" name={`${asset.label} (${wrapper.toUpperCase()})`}
            stroke="#c9a84c" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="cash" name="Cash Savings (4.5%)"
            stroke="#818cf8" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
          <Line type="monotone" dataKey="contributed" name="Total Contributed"
            stroke="var(--color-border)" strokeWidth={1} strokeDasharray="2 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
