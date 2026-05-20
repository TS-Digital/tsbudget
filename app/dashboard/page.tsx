'use client'

import { useState, useEffect, useCallback } from 'react'
import Nav from '@/components/Nav'
import CompoundChart from '@/components/CompoundChart'
import GoalTracker from '@/components/GoalTracker'
import AIInsightCard from '@/components/AIInsightCard'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { BudgetCategory } from '@/types/finance'

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
  const [userId, setUserId] = useState<string | null>(null)
  const [budgetLoaded, setBudgetLoaded] = useState(false)

  const loadFromBudget = useCallback(async () => {
    const res = await fetch('/api/budgets')
    if (!res.ok) return
    const { budget } = await res.json()
    if (!budget) return

    const categories: BudgetCategory[] = Array.isArray(budget.categories) ? budget.categories : []
    const net = budget.net_monthly_income ?? 0
    const committed = categories.filter((c) => c.type === 'need').reduce((s, c) => s + (c.amount ?? 0), 0)
    const savings = categories.filter((c) => c.type === 'saving').reduce((s, c) => s + (c.amount ?? 0), 0)
    const biggest = categories.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))[0]?.name ?? 'Rent / Mortgage'

    setSnapshot({ net, committed, savings, biggestCategory: biggest })
    setBudgetLoaded(true)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        loadFromBudget()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (uid) {
        loadFromBudget()
      } else {
        setBudgetLoaded(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadFromBudget])

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
          <p className="text-[var(--color-muted)]">Your monthly snapshot, projections, and AI-powered tips.</p>
        </div>

        {/* Snapshot inputs */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
              Monthly Snapshot
            </h2>
            {userId && budgetLoaded && (
              <span className="text-xs text-[#22c55e]">Loaded from saved budget</span>
            )}
            {userId && !budgetLoaded && (
              <span className="text-xs text-[var(--color-muted)]">No saved budget yet — save one from the Budget page</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Net Monthly Income (£)', key: 'net' as const },
              { label: 'Fixed Costs (£)', key: 'committed' as const },
              { label: 'Savings (£)', key: 'savings' as const },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-[var(--color-muted)] mb-1.5">{f.label}</label>
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
              <label className="block text-xs text-[var(--color-muted)] mb-1.5">Biggest Expense</label>
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
              { label: 'Net Income', value: fmt(snapshot.net), color: 'var(--color-text)' },
              { label: 'Fixed Costs', value: fmt(snapshot.committed), color: '#818cf8' },
              { label: 'Discretionary', value: fmt(discretionary), color: '#fb923c' },
              { label: 'Saved', value: fmt(snapshot.savings), color: '#22c55e' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-[var(--color-surface-2)] p-4">
                <div className="text-xs text-[var(--color-muted)] mb-1">{s.label}</div>
                <div className="text-xl font-bold font-num" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted)]">
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

        <footer className="mt-12 text-center text-xs text-[var(--color-muted)]">
          NetWorth provides estimates for guidance only. Consult a qualified accountant for
          regulated financial advice.
        </footer>
      </main>
    </>
  )
}
