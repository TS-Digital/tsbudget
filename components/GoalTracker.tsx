'use client'

import { useState } from 'react'
import type { Goal } from '@/types/finance'

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: makeId(), name: 'Emergency Fund', targetAmount: 3000, currentAmount: 500, monthlyContribution: 200 },
  ])
  const [showAdd, setShowAdd] = useState(false)
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: 1000, currentAmount: 0, monthlyContribution: 100 })

  function addGoal() {
    if (!newGoal.name) return
    setGoals((prev) => [...prev, { ...newGoal, id: makeId() }])
    setNewGoal({ name: '', targetAmount: 1000, currentAmount: 0, monthlyContribution: 100 })
    setShowAdd(false)
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div className="rounded-2xl border border-[#2a3447] bg-[#141920] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
          Goal Tracker
        </h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="text-sm px-3 py-1.5 rounded-lg border border-[#2a3447] hover:border-[#c9a84c]/50 text-[#7a8599] hover:text-[#c9a84c] transition-colors"
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
                <label className="block text-xs text-[#7a8599] mb-1">{f.label}</label>
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
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#0d1017]"
            style={{ background: '#c9a84c' }}
          >
            Add Goal
          </button>
        </div>
      )}

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
                  <span className="text-xs text-[#7a8599]">
                    {fmt(g.currentAmount)} / {fmt(g.targetAmount)}
                  </span>
                  <button
                    onClick={() => removeGoal(g.id)}
                    className="text-[#7a8599] hover:text-[#ef4444] text-xs transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#2a3447] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: pct >= 100 ? '#22c55e' : '#c9a84c' }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#7a8599] mt-1.5">
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
    </div>
  )
}
