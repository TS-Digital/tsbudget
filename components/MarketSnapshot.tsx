'use client'

import { useEffect, useState } from 'react'
import MarketCard, { type MarketQuote } from '@/components/MarketCard'

const GROUPS = [
  {
    label: 'UK Markets',
    symbols: ['^FTSE', '^FTMC', 'VWRL.L', 'VUAG.L'],
  },
  {
    label: 'Global Indices',
    symbols: ['^GSPC', '^IXIC', '^DJI'],
  },
  {
    label: 'Crypto & Commodities',
    symbols: ['BTC-USD', 'ETH-USD', 'GC=F', 'CL=F'],
  },
]

export default function MarketSnapshot() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)

  useEffect(() => {
    fetch('/api/market-data')
      .then((r) => {
        if (!r.ok) throw new Error('Market data unavailable')
        return r.json()
      })
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setQuotes(data)
        setFetchedAt(new Date())
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#fb923c]/30 bg-[#fb923c]/5 p-5 text-sm">
        <p className="text-[#fb923c] font-medium mb-1">Market data temporarily unavailable</p>
        <p className="text-[var(--color-muted)]">{error} — check finance.yahoo.com directly for live prices.</p>
      </div>
    )
  }

  const bySymbol = Object.fromEntries(quotes.map((q) => [q.symbol, q]))

  return (
    <div className="space-y-5">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className="text-sm font-semibold text-[var(--color-muted)] mb-3">{group.label}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {group.symbols.map((sym) =>
              bySymbol[sym] ? (
                <MarketCard key={sym} quote={bySymbol[sym]} />
              ) : null,
            )}
          </div>
        </div>
      ))}

      {fetchedAt && (
        <p className="text-xs text-[var(--color-muted)] text-right">
          Prices as of {fetchedAt.toLocaleTimeString('en-GB')} · delayed up to 15 min · cached server-side
        </p>
      )}
    </div>
  )
}
