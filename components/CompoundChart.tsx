'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { calcCompoundInterest } from '@/lib/budgetEngine'

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

export default function CompoundChart() {
  const [principal, setPrincipal] = useState(1000)
  const [monthly, setMonthly] = useState(200)
  const [rate, setRate] = useState(7)
  const [years, setYears] = useState(10)

  const data = calcCompoundInterest(principal, monthly, rate, years * 12)
  const yearlyData = data.filter((_, i) => (i + 1) % 12 === 0).map((d, i) => ({
    year: `Year ${i + 1}`,
    balance: d.balance,
  }))

  const contributed = principal + monthly * years * 12
  const finalBalance = data[data.length - 1]?.balance ?? 0
  const growth = finalBalance - contributed

  return (
    <div className="rounded-2xl border border-[#2a3447] bg-[#141920] p-6">
      <h2 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
        Investment Projection
      </h2>
      <p className="text-xs text-[#7a8599] mb-5">Compound interest calculator</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Starting Amount (£)', value: principal, set: setPrincipal, min: 0, step: 500 },
          { label: 'Monthly Contribution (£)', value: monthly, set: setMonthly, min: 0, step: 50 },
          { label: 'Annual Return (%)', value: rate, set: setRate, min: 0.1, step: 0.5 },
          { label: 'Years', value: years, set: setYears, min: 1, step: 1 },
        ].map((f) => (
          <div key={f.label}>
            <label className="block text-xs text-[#7a8599] mb-1.5">{f.label}</label>
            <input
              type="number"
              className="w-full"
              min={f.min}
              step={f.step}
              value={f.value}
              onChange={(e) => f.set(parseFloat(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-[#1c2433] p-3">
          <div className="text-xs text-[#7a8599] mb-1">Contributed</div>
          <div className="font-bold font-num text-lg">{fmt(contributed)}</div>
        </div>
        <div className="rounded-xl bg-[#1c2433] p-3">
          <div className="text-xs text-[#7a8599] mb-1">Growth</div>
          <div className="font-bold font-num text-lg" style={{ color: '#22c55e' }}>{fmt(growth)}</div>
        </div>
        <div className="rounded-xl bg-[#1c2433] p-3">
          <div className="text-xs text-[#7a8599] mb-1">Final Value</div>
          <div className="font-bold font-num text-lg" style={{ color: '#c9a84c' }}>{fmt(finalBalance)}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={yearlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3447" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#7a8599' }} />
          <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#7a8599' }} />
          <Tooltip
            contentStyle={{ background: '#1c2433', border: '1px solid #2a3447', borderRadius: '8px', color: '#e8eaf0' }}
            formatter={(v) => typeof v === 'number' ? fmt(v) : v}
          />
          <Line type="monotone" dataKey="balance" stroke="#c9a84c" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
