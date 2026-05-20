'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { calcBudget, createDefaultCategories } from '@/lib/budgetEngine'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { BudgetCategory, BudgetMethod, ExpenseType } from '@/types/finance'

const METHOD_OPTIONS: { value: BudgetMethod; label: string; desc: string }[] = [
  { value: 'custom', label: 'Custom Split', desc: 'Allocate each category manually' },
  { value: '50/30/20', label: '50/30/20 Rule', desc: '50% needs, 30% wants, 20% savings' },
  { value: 'zero', label: 'Zero-Based', desc: 'Every pound gets a job' },
  { value: 'pay_yourself_first', label: 'Pay Yourself First', desc: 'Save first, spend the rest' },
]

const TYPE_COLOR: Record<ExpenseType, string> = {
  need: '#818cf8',
  want: '#fb923c',
  saving: '#22c55e',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(n)
}

export default function BudgetAllocator({ defaultNetMonthly = 2000 }: { defaultNetMonthly?: number }) {
  const [netMonthly, setNetMonthly] = useState(defaultNetMonthly)
  const [method, setMethod] = useState<BudgetMethod>('50/30/20')
  const [savingsPct, setSavingsPct] = useState(20)
  const [cats, setCats] = useState<BudgetCategory[]>(createDefaultCategories)
  const [userId, setUserId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<ExpenseType>('need')

  const budget = useMemo(
    () => calcBudget(netMonthly, cats, method, savingsPct),
    [netMonthly, cats, method, savingsPct],
  )

  const loadBudget = useCallback(async () => {
    const res = await fetch('/api/budgets')
    if (!res.ok) return
    const { budget: saved } = await res.json()
    if (!saved) return
    if (saved.net_monthly_income) setNetMonthly(saved.net_monthly_income)
    if (saved.method) setMethod(saved.method)
    if (Array.isArray(saved.categories) && saved.categories.length > 0) setCats(saved.categories)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        loadBudget()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (uid) loadBudget()
    })

    return () => subscription.unsubscribe()
  }, [loadBudget])

  async function saveBudget() {
    setSaveStatus('saving')
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method,
        categories: budget.categories,
        netMonthlyIncome: netMonthly,
        incomeSources: [],
      }),
    })
    if (res.ok) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  function updateAmount(id: string, amount: number) {
    setCats((prev) => prev.map((c) => (c.id === id ? { ...c, amount: Math.max(0, amount) } : c)))
  }

  function updateType(id: string, type: ExpenseType) {
    setCats((prev) => prev.map((c) => (c.id === id ? { ...c, type } : c)))
  }

  function removeCategory(id: string) {
    setCats((prev) => prev.filter((c) => c.id !== id))
  }

  function addCategory() {
    if (!newCatName.trim()) return
    const id = `cat_${Date.now()}`
    setCats((prev) => [...prev, { id, name: newCatName.trim(), amount: 0, type: newCatType }])
    setNewCatName('')
    setNewCatType('need')
    setShowAddCat(false)
  }

  const chartData = budget.categories
    .filter((c) => c.amount > 0)
    .map((c) => ({ name: c.name, value: c.amount, color: TYPE_COLOR[c.type] }))

  const leftOverColor = budget.leftOver >= 0 ? '#22c55e' : '#ef4444'

  return (
    <div className="space-y-6">
      {/* Net income input */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
          Your Monthly Net Income
        </h2>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">£</span>
          <input
            type="number"
            className="w-full pl-7"
            min={0}
            step={100}
            value={netMonthly}
            onChange={(e) => setNetMonthly(parseFloat(e.target.value) || 0)}
          />
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-2">
          Use the Tax Calculator to get your exact monthly take-home.
        </p>
      </div>

      {/* Method picker */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
          Budgeting Method
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {METHOD_OPTIONS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMethod(m.value)}
              className={`text-left p-4 rounded-xl border transition-all ${
                method === m.value
                  ? 'border-[#c9a84c] bg-[#c9a84c]/10'
                  : 'border-[var(--color-border)] hover:border-[#c9a84c]/40 hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <div className={`font-semibold text-sm mb-1 ${method === m.value ? 'text-[#c9a84c]' : 'text-[var(--color-text)]'}`}>
                {m.label}
              </div>
              <div className="text-xs text-[var(--color-muted)]">{m.desc}</div>
            </button>
          ))}
        </div>

        {method === 'pay_yourself_first' && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">
              Savings Target: {savingsPct}%
            </label>
            <input
              type="range"
              className="w-full max-w-xs"
              min={5}
              max={50}
              step={1}
              value={savingsPct}
              onChange={(e) => setSavingsPct(parseInt(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Net Monthly', value: fmt(netMonthly), color: 'var(--color-text)' },
          { label: 'Committed', value: fmt(budget.totalCommitted), color: '#818cf8' },
          { label: 'Saved', value: fmt(budget.totalSavings), color: '#22c55e' },
          { label: 'Left Over', value: fmt(budget.leftOver), color: leftOverColor },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="text-xs text-[var(--color-muted)] mb-1">{s.label}</div>
            <div className="text-xl font-bold font-num" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {budget.leftOver < 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/8 text-sm">
          <span className="text-[#ef4444] text-lg">⚠</span>
          <span className="text-[#ef4444]">
            You&apos;re overspending by <strong>{fmt(Math.abs(budget.leftOver))}</strong>/month. Reduce some categories.
          </span>
        </div>
      )}
      {budget.totalSavings === 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#fb923c]/40 bg-[#fb923c]/8 text-sm">
          <span className="text-[#fb923c] text-lg">⚠</span>
          <span className="text-[#fb923c]">You have no savings or emergency fund allocated.</span>
        </div>
      )}

      {/* Categories + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category list */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="font-bold" style={{ fontFamily: 'var(--font-syne)' }}>Categories</h2>
            <div className="flex gap-2 text-xs">
              {(['need', 'want', 'saving'] as ExpenseType[]).map((t) => (
                <span key={t} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: TYPE_COLOR[t] }} />
                  <span className="text-[var(--color-muted)] capitalize">{t}</span>
                </span>
              ))}
            </div>
          </div>
          {(method === '50/30/20' || method === 'pay_yourself_first') && (
            <div className="px-4 py-2.5 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-xs text-[var(--color-muted)]">
              Amounts are calculated automatically.{' '}
              <button
                type="button"
                onClick={() => setMethod('custom')}
                className="text-[#c9a84c] font-semibold hover:text-[#e2c06e]"
              >
                Switch to Custom Split
              </button>{' '}
              to edit them manually.
            </div>
          )}
          <div className="divide-y divide-[var(--color-border)]/50 max-h-[500px] overflow-y-auto">
            {budget.categories.map((cat) => (
              <div key={cat.id} className="px-4 py-3 flex items-center gap-3">
                <button
                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-offset-1 ring-offset-[var(--color-surface)] transition-colors"
                  style={{ background: TYPE_COLOR[cat.type] }}
                  onClick={() => {
                    const cycle: ExpenseType[] = ['need', 'want', 'saving']
                    const next = cycle[(cycle.indexOf(cat.type) + 1) % 3]
                    updateType(cat.id, next)
                  }}
                  title="Click to change type"
                />
                <span className="flex-1 text-sm truncate">{cat.name}</span>
                <div className="relative w-28 shrink-0">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-xs">£</span>
                  <input
                    type="number"
                    className="w-full pl-5 py-1.5 text-sm text-right"
                    min={0}
                    step={10}
                    value={cat.amount}
                    onChange={(e) => updateAmount(cat.id, parseFloat(e.target.value) || 0)}
                    readOnly={method === '50/30/20' || method === 'pay_yourself_first'}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(cat.id)}
                  className="text-[var(--color-muted)] hover:text-[#ef4444] text-lg leading-none shrink-0 transition-colors"
                  title="Remove category"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--color-border)]">
            {showAddCat ? (
              <div className="px-4 py-3 flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 py-1.5 text-sm"
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  autoFocus
                />
                <select
                  className="text-sm py-1.5 px-2 w-24"
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as ExpenseType)}
                >
                  <option value="need">Need</option>
                  <option value="want">Want</option>
                  <option value="saving">Saving</option>
                </select>
                <button
                  type="button"
                  onClick={addCategory}
                  className="text-sm font-semibold text-[#c9a84c] hover:text-[#e2c06e] shrink-0"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddCat(false); setNewCatName('') }}
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] shrink-0"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted)]">Click the dot to cycle type (Need → Want → Saving)</span>
                <button
                  type="button"
                  onClick={() => setShowAddCat(true)}
                  className="text-xs font-semibold text-[#c9a84c] hover:text-[#e2c06e]"
                >
                  + Add category
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col">
          <h2 className="font-bold mb-1" style={{ fontFamily: 'var(--font-syne)' }}>Allocation Chart</h2>
          <p className="text-xs text-[var(--color-muted)] mb-2">Savings rate: {budget.savingsRate.toFixed(1)}%</p>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={110} dataKey="value" strokeWidth={0}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid #2a3447',
                    borderRadius: '8px',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                  }}
                  formatter={(v) => typeof v === 'number' ? fmt(v) : v}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Save / sign-in nudge */}
      {userId ? (
        <div className="flex items-center gap-3">
          <button
            onClick={saveBudget}
            disabled={saveStatus === 'saving'}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[var(--color-bg)] disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: '#c9a84c' }}
          >
            {saveStatus === 'saving' ? 'Saving…' : 'Save Budget'}
          </button>
          {saveStatus === 'saved' && <span className="text-sm text-[#22c55e]">Budget saved!</span>}
          {saveStatus === 'error' && <span className="text-sm text-[#ef4444]">Save failed — try again.</span>}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-muted)]">
          <Link href="/login?next=/budget" className="font-semibold text-[#c9a84c] hover:text-[#e2c06e]">
            Sign in
          </Link>{' '}
          to save your budget across devices.
        </p>
      )}
    </div>
  )
}
