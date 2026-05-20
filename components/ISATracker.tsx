'use client'

import { useState, useMemo } from 'react'

const ISA_ALLOWANCE = 20_000
const LISA_ALLOWANCE = 4_000

function getTaxYear(): { start: Date; end: Date; label: string } {
  const now = new Date()
  const year = now.getFullYear()
  const aprilSix = new Date(year, 3, 6) // April 6
  const startYear = now >= aprilSix ? year : year - 1
  return {
    start: new Date(startYear, 3, 6),
    end: new Date(startYear + 1, 3, 5, 23, 59, 59),
    label: `${startYear}/${String(startYear + 1).slice(2)}`,
  }
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
}

export default function ISATracker() {
  const [contributed, setContributed] = useState(0)
  const [lisaContributed, setLisaContributed] = useState(0)

  const taxYear = useMemo(() => getTaxYear(), [])
  const daysLeft = daysUntil(taxYear.end)
  const remaining = Math.max(0, ISA_ALLOWANCE - contributed)
  const lisaRemaining = Math.max(0, LISA_ALLOWANCE - lisaContributed)
  const lisaBonus = lisaContributed * 0.25
  const pctUsed = Math.min(100, (contributed / ISA_ALLOWANCE) * 100)
  const overLimit = contributed > ISA_ALLOWANCE

  const weeklyToMax = daysLeft > 0 ? (remaining / (daysLeft / 7)).toFixed(0) : '0'
  const monthlyToMax = daysLeft > 0 ? (remaining / (daysLeft / 30.44)).toFixed(0) : '0'

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-syne)' }}>
            ISA Allowance Tracker
          </h2>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">Tax year {taxYear.label} · {daysLeft} days remaining</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold font-num" style={{ color: overLimit ? '#ef4444' : '#22c55e' }}>
            {fmt(remaining)}
          </div>
          <div className="text-xs text-[var(--color-muted)]">remaining allowance</div>
        </div>
      </div>

      {/* ISA input */}
      <div className="mb-4">
        <label className="block text-xs text-[var(--color-muted)] mb-1.5">
          ISA contributions this tax year (£)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            className="flex-1"
            min={0}
            max={25000}
            step={500}
            value={contributed}
            onChange={(e) => setContributed(parseFloat(e.target.value) || 0)}
          />
          <span className="text-sm text-[var(--color-muted)] shrink-0">of {fmt(ISA_ALLOWANCE)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 rounded-full bg-[var(--color-border)] overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pctUsed}%`,
            background: overLimit ? '#ef4444' : pctUsed > 75 ? '#c9a84c' : '#22c55e',
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--color-muted)] mb-4">
        <span>{pctUsed.toFixed(0)}% used</span>
        <span>{fmt(ISA_ALLOWANCE)} annual limit</span>
      </div>

      {overLimit && (
        <div className="mb-4 p-3 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/8 text-xs text-[#ef4444]">
          ⚠ You may have over-contributed. Having multiple ISAs of the same type in one tax year
          (except LISAs) is not permitted. Contact your provider and HMRC.
        </div>
      )}

      {/* To-maximise hints */}
      {remaining > 0 && daysLeft > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-[var(--color-surface-2)] p-3">
            <div className="text-xs text-[var(--color-muted)] mb-1">To max by April 5</div>
            <div className="font-bold font-num">£{weeklyToMax}<span className="text-[var(--color-muted)] font-normal text-xs">/week</span></div>
          </div>
          <div className="rounded-xl bg-[var(--color-surface-2)] p-3">
            <div className="text-xs text-[var(--color-muted)] mb-1">Or per month</div>
            <div className="font-bold font-num">£{monthlyToMax}<span className="text-[var(--color-muted)] font-normal text-xs">/month</span></div>
          </div>
        </div>
      )}

      {/* LISA section */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-syne)' }}>
          Lifetime ISA (LISA) Tracker
          <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">under 40 only · {fmt(LISA_ALLOWANCE)}/yr max</span>
        </h3>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="number"
            className="flex-1"
            min={0}
            max={5000}
            step={100}
            value={lisaContributed}
            onChange={(e) => setLisaContributed(parseFloat(e.target.value) || 0)}
          />
          <span className="text-sm text-[var(--color-muted)] shrink-0">of {fmt(LISA_ALLOWANCE)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[var(--color-surface-2)] p-3">
            <div className="text-xs text-[var(--color-muted)] mb-1">You contributed</div>
            <div className="font-bold font-num">{fmt(lisaContributed)}</div>
          </div>
          <div className="rounded-xl bg-[var(--color-surface-2)] p-3">
            <div className="text-xs text-[var(--color-muted)] mb-1">Gov 25% bonus</div>
            <div className="font-bold font-num text-[#22c55e]">{fmt(lisaBonus)}</div>
          </div>
          <div className="rounded-xl bg-[var(--color-surface-2)] p-3">
            <div className="text-xs text-[var(--color-muted)] mb-1">Remaining</div>
            <div className="font-bold font-num" style={{ color: '#c9a84c' }}>{fmt(lisaRemaining)}</div>
          </div>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-2">
          LISA counts towards your £20,000 ISA annual allowance. Can be used for first home purchase or retirement (age 60+).
        </p>
      </div>
    </div>
  )
}
