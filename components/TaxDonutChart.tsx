'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TaxBreakdown } from '@/types/finance'

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

const COLORS = {
  net: '#22c55e',
  tax: '#ef4444',
  ni: '#f97316',
  pension: '#818cf8',
  loan: '#fb923c',
}

interface Props {
  breakdown: TaxBreakdown
}

export default function TaxDonutChart({ breakdown: b }: Props) {
  const data = [
    { name: 'Take-Home', value: Math.round(b.netAnnual), color: COLORS.net },
    { name: 'Income Tax', value: Math.round(b.incomeTax), color: COLORS.tax },
    { name: 'NI', value: Math.round(b.nationalInsurance), color: COLORS.ni },
    ...(b.pensionDeduction > 0 ? [{ name: 'Pension', value: Math.round(b.pensionDeduction), color: COLORS.pension }] : []),
    ...(b.studentLoan > 0 ? [{ name: 'Student Loan', value: Math.round(b.studentLoan), color: COLORS.loan }] : []),
  ].filter((d) => d.value > 0)

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-syne)' }}>Income Split</h3>
      <p className="text-xs text-[var(--color-muted)] mb-4">Annual breakdown</p>

      {/* Big net figure */}
      <div className="text-center mb-2">
        <div className="text-4xl font-bold font-num" style={{ color: '#22c55e' }}>
          {fmt(b.netAnnual)}
        </div>
        <div className="text-xs text-[var(--color-muted)] mt-1">annual take-home</div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid #2a3447', borderRadius: '8px', color: 'var(--color-text)' }}
            formatter={(value) => typeof value === 'number' ? fmt(value) : value}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
