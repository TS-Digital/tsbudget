'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
} from 'recharts'

const ASSETS = [
  { name: 'Cash Savings', annualReturn: 4.5, risk: 'Low', riskColor: '#22c55e' },
  { name: 'UK Bonds', annualReturn: 5.0, risk: 'Low–Medium', riskColor: '#a3e635' },
  { name: 'FTSE 100', annualReturn: 7.5, risk: 'Medium', riskColor: '#c9a84c' },
  { name: 'Global Index', annualReturn: 10.0, risk: 'Medium–High', riskColor: '#fb923c' },
  { name: 'UK Property', annualReturn: 8.0, risk: 'Medium', riskColor: '#c9a84c' },
  { name: 'Bitcoin (10yr)', annualReturn: 20.0, risk: 'Very High', riskColor: '#ef4444' },
]

const RISK_BG: Record<string, string> = {
  'Low': 'rgba(34,197,94,0.15)',
  'Low–Medium': 'rgba(163,230,53,0.15)',
  'Medium': 'rgba(201,168,76,0.15)',
  'Medium–High': 'rgba(251,146,60,0.15)',
  'Very High': 'rgba(239,68,68,0.15)',
}

export default function AssetComparison() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
        Asset Class Comparison
      </h2>
      <p className="text-xs text-[var(--color-muted)] mb-5">
        Historical average annual returns. Past performance does not guarantee future results.
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={ASSETS} layout="vertical" margin={{ left: 8, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 22]}
            tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={96}
            tick={{ fontSize: 11, fill: 'var(--color-text)' }}
          />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid #2a3447', borderRadius: '8px', color: 'var(--color-text)', fontSize: '12px' }}
            formatter={(v) => [`${v}% avg annual return`]}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="annualReturn" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, fill: 'var(--color-muted)', formatter: (v: unknown) => `${v}%` }}>
            {ASSETS.map((entry) => (
              <Cell key={entry.name} fill={entry.riskColor} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Risk legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {ASSETS.map((a) => (
          <div
            key={a.name}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
            style={{ background: RISK_BG[a.risk] ?? 'transparent', borderColor: `${a.riskColor}40`, color: a.riskColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: a.riskColor }} />
            {a.name}: <strong>{a.risk}</strong>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--color-muted)] mt-4">
        ⚠ Bitcoin returns shown for data purposes only. Crypto is highly volatile and speculative.
        NetWorth does not recommend any specific investment.
      </p>
    </div>
  )
}
