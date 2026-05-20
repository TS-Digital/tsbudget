import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
let cache: { data: unknown; timestamp: number } | null = null

const TICKERS = [
  '^FTSE', '^FTMC', 'VWRL.L', 'VUAG.L',
  '^GSPC', '^IXIC', '^DJI',
  'BTC-USD', 'ETH-USD',
  'GC=F', 'CL=F',
]

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return Response.json(cache.data)
  }

  try {
    const results = await yf.quote(TICKERS)
    const quotes = Array.isArray(results) ? results : [results]

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
    if (cache) return Response.json(cache.data)
    return Response.json({ error: 'Market data temporarily unavailable' }, { status: 503 })
  }
}
