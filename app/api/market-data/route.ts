const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
let cache: { data: unknown; timestamp: number } | null = null

const TICKERS = [
  '^FTSE', '^FTMC', 'VWRL.L', 'VUAG.L',
  '^GSPC', '^IXIC', '^DJI',
  'BTC-USD', 'ETH-USD',
  'GC=F', 'CL=F',
]

interface YahooQuote {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  regularMarketChange?: number
  regularMarketChangePercent?: number
  currency?: string
}

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return Response.json(cache.data)
  }

  try {
    const symbols = TICKERS.join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&formatted=false&lang=en-GB&region=GB`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TSBudget/1.0)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`)

    const json = await res.json()
    const quotes: YahooQuote[] = json?.quoteResponse?.result ?? []

    if (quotes.length === 0) throw new Error('Empty response from Yahoo Finance')

    const data = quotes.map((q) => ({
      symbol: q.symbol,
      name: q.shortName ?? q.longName ?? q.symbol,
      price: q.regularMarketPrice ?? null,
      change: q.regularMarketChange ?? null,
      changePct: q.regularMarketChangePercent ?? null,
      currency: q.currency ?? 'USD',
    }))

    cache = { data, timestamp: Date.now() }
    return Response.json(data)
  } catch {
    // Return stale cache if available rather than erroring
    if (cache) return Response.json(cache.data)
    return Response.json({ error: 'Market data temporarily unavailable' }, { status: 503 })
  }
}
