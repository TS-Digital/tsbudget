'use client'

export interface MarketQuote {
  symbol: string
  name: string
  price: number | null
  change: number | null
  changePct: number | null
  currency: string
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£', GBp: '£', USD: '$', EUR: '€',
}

function fmtPrice(price: number | null, currency: string): string {
  if (price === null) return '—'
  const sym = CURRENCY_SYMBOLS[currency] ?? ''
  // GBp = pence → divide by 100 for display
  const val = currency === 'GBp' ? price / 100 : price
  const decimals = val < 10 ? 4 : val < 1000 ? 2 : 0
  return `${sym}${val.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

function fmtPct(pct: number | null): string {
  if (pct === null) return '—'
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
}

interface Props {
  quote: MarketQuote
}

export default function MarketCard({ quote }: Props) {
  const positive = (quote.changePct ?? 0) >= 0
  const color = positive ? '#22c55e' : '#ef4444'
  const bgColor = positive ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'
  const borderColor = positive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'

  return (
    <div
      className="rounded-xl p-4 border transition-colors"
      style={{ background: bgColor, borderColor }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs text-[#7a8599] truncate font-mono">{quote.symbol}</div>
          <div className="text-sm font-medium text-[#e8eaf0] truncate leading-tight mt-0.5">
            {quote.name}
          </div>
        </div>
        <span
          className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md font-mono"
          style={{ background: `${color}20`, color }}
        >
          {fmtPct(quote.changePct)}
        </span>
      </div>

      <div className="font-bold font-num text-xl" style={{ color }}>
        {fmtPrice(quote.price, quote.currency)}
      </div>

      {quote.change !== null && (
        <div className="text-xs mt-1" style={{ color }}>
          {quote.change >= 0 ? '+' : ''}
          {fmtPrice(quote.change, quote.currency)} today
        </div>
      )}
    </div>
  )
}
