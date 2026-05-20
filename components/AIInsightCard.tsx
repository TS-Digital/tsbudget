'use client'

import { useState } from 'react'

interface Props {
  net: number
  committed: number
  savings: number
  biggestCategory: string
}

export default function AIInsightCard({ net, committed, savings, biggestCategory }: Props) {
  const [tip, setTip] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchTip() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ net, committed, savings, biggestCategory }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTip(data.tip)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load AI tip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#818cf8]/30 bg-[#818cf8]/5 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-syne)', color: '#a5b4fc' }}>
            ✦ AI Budget Insight
          </h2>
          <p className="text-xs text-[var(--color-muted)]">Powered by Claude AI · Not regulated financial advice</p>
        </div>
        <button
          onClick={fetchTip}
          disabled={loading}
          className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 hover:scale-[1.02]"
          style={{ background: '#818cf8', color: 'var(--color-bg)' }}
        >
          {loading ? 'Thinking…' : tip ? 'Refresh' : 'Get Tips'}
        </button>
      </div>

      {error && <p className="text-[#ef4444] text-sm mb-2">{error}</p>}

      {tip ? (
        <div className="space-y-2">
          {tip
            .split('\n')
            .filter((line) => line.trim().startsWith('•') || line.trim().startsWith('-'))
            .map((line, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-text)]">
                <span className="text-[#818cf8] mt-0.5 shrink-0">•</span>
                <span>{line.replace(/^[•\-]\s*/, '')}</span>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          Click &quot;Get Tips&quot; and NetWorth AI will analyse your financial snapshot and give you 3
          personalised, actionable budgeting tips.
        </p>
      )}
    </div>
  )
}
