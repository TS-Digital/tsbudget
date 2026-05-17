'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import CompoundChart from '@/components/CompoundChart'
import GoalTracker from '@/components/GoalTracker'
import AIInsightCard from '@/components/AIInsightCard'

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState({
    net: 2500,
    committed: 1600,
    savings: 300,
    biggestCategory: 'Rent / Mortgage',
  })

  const discretionary = snapshot.net - snapshot.committed - snapshot.savings
  const savingsRate = snapshot.net > 0 ? (snapshot.savings / snapshot.net) * 100 : 0

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
            Financial Dashboard
          </h1>
          <p className="text-[#7a8599]">Your monthly snapshot, projections, and AI-powered tips.</p>
        </div>

        {/* Snapshot inputs */}
        <div className="rounded-2xl border border-[#2a3447] bg-[#141920] p-6 mb-6">
          <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
            Monthly Snapshot
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Net Monthly Income (£)', key: 'net' as const },
              { label: 'Fixed Costs (£)', key: 'committed' as const },
              { label: 'Savings (£)', key: 'savings' as const },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-[#7a8599] mb-1.5">{f.label}</label>
                <input
                  type="number"
                  className="w-full"
                  min={0}
                  step={50}
                  value={snapshot[f.key]}
                  onChange={(e) =>
                    setSnapshot((p) => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-[#7a8599] mb-1.5">Biggest Expense</label>
              <input
                type="text"
                className="w-full"
                value={snapshot.biggestCategory}
                onChange={(e) => setSnapshot((p) => ({ ...p, biggestCategory: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Net Income', value: fmt(snapshot.net), color: '#e8eaf0' },
              { label: 'Fixed Costs', value: fmt(snapshot.committed), color: '#818cf8' },
              { label: 'Discretionary', value: fmt(discretionary), color: '#fb923c' },
              { label: 'Saved', value: fmt(snapshot.savings), color: '#22c55e' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-[#1c2433] p-4">
                <div className="text-xs text-[#7a8599] mb-1">{s.label}</div>
                <div className="text-xl font-bold font-num" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#7a8599]">
            <span>Savings rate:</span>
            <span
              className="font-bold font-num"
              style={{ color: savingsRate >= 20 ? '#22c55e' : savingsRate >= 10 ? '#c9a84c' : '#ef4444' }}
            >
              {savingsRate.toFixed(1)}%
            </span>
            {savingsRate < 10 && <span className="text-[#ef4444]">— aim for at least 10%</span>}
            {savingsRate >= 20 && <span className="text-[#22c55e]">— great work!</span>}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CompoundChart />
          <GoalTracker />
        </div>

        {/* AI Insight */}
        <AIInsightCard
          net={snapshot.net}
          committed={snapshot.committed}
          savings={snapshot.savings}
          biggestCategory={snapshot.biggestCategory}
        />

        <footer className="mt-12 text-center text-xs text-[#7a8599]">
          TSBudget provides estimates for guidance only. Consult a qualified accountant for
          regulated financial advice.
        </footer>
      </main>
    </>
  )
}
