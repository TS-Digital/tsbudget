'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Goal } from '@/types/finance'

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

const DEFAULT_GOALS: Goal[] = [
  { id: 'local-1', name: 'Emergency Fund', targetAmount: 3000, currentAmount: 500, monthlyContribution: 200 },
]

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showAdd, setShowAdd] = useState(false)
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: 1000, currentAmount: 0, monthlyContribution: 100 })

  const loadGoals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        const { goals: data } = await res.json()
        setGoals(data ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        loadGoals()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (uid) {
        loadGoals()
      } else {
        setGoals(DEFAULT_GOALS)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadGoals])

  async function addGoal() {
    if (!newGoal.name) return

    if (userId) {
      setSaveStatus('saving')
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      })
      if (res.ok) {
        const { goal } = await res.json()
        setGoals((prev) => [...prev, goal])
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } else {
      setGoals((prev) => [...prev, { ...newGoal, id: Math.random().toString(36).slice(2) }])
    }

    setNewGoal({ name: '', targetAmount: 1000, currentAmount: 0, monthlyContribution: 100 })
    setShowAdd(false)
  }

  async function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    if (userId) {
      await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
            Goal Tracker
          </h2>
          {userId && (
            <p className="text-xs text-[#22c55e] mt-0.5">
              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Save failed' : 'Synced to account'}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[#c9a84c]/50 text-[var(--color-muted)] hover:text-[#c9a84c] transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {showAdd && (
        <div className="mb-5 p-4 rounded-xl border border-[#c9a84c]/30 bg-[#c9a84c]/5 space-y-3">
          <input
            type="text"
            placeholder="Goal name (e.g. New Car)"
            className="w-full"
            value={newGoal.name}
            onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Target (£)', key: 'targetAmount' as const },
              { label: 'Saved (£)', key: 'currentAmount' as const },
              { label: '£/month', key: 'monthlyContribution' as const },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-[var(--color-muted)] mb-1">{f.label}</label>
                <input
                  type="number"
                  className="w-full"
                  min={0}
                  value={newGoal[f.key]}
                  onChange={(e) => setNewGoal((p) => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            ))}
          </div>
          <button
            onClick={addGoal}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-bg)]"
            style={{ background: '#c9a84c' }}
          >
            Add Goal
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-[var(--color-muted)]">Loading goals…</div>
      ) : goals.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--color-muted)]">No goals yet. Add one above.</div>
      ) : (
        <div className="space-y-5">
          {goals.map((g) => {
            const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100)
            const remaining = g.targetAmount - g.currentAmount
            const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(remaining / g.monthlyContribution) : null

            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{g.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-muted)]">
                      {fmt(g.currentAmount)} / {fmt(g.targetAmount)}
                    </span>
                    <button
                      onClick={() => removeGoal(g.id)}
                      className="text-[var(--color-muted)] hover:text-[#ef4444] text-xs transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: pct >= 100 ? '#22c55e' : '#c9a84c' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--color-muted)] mt-1.5">
                  <span>{pct.toFixed(0)}% complete</span>
                  {monthsLeft !== null && (
                    <span>
                      ~{monthsLeft} {monthsLeft === 1 ? 'month' : 'months'} at {fmt(g.monthlyContribution)}/mo
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!userId && (
        <p className="mt-5 text-xs text-[var(--color-muted)] border-t border-[var(--color-border)] pt-4">
          Sign in to save goals across devices.
        </p>
      )}
    </div>
  )
}
