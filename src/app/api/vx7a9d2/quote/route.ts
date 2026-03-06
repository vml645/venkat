import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { HIDDEN_TAB_COOKIE, isSessionTokenValid } from '@/lib/hiddenTabAuth'
import type { AssetClass } from '@/lib/portfolioStore'

type YahooQuote = {
  symbol?: string
  longName?: string
  shortName?: string
  regularMarketPrice?: number
  regularMarketPreviousClose?: number
  regularMarketChangePercent?: number
  quoteType?: string
}

type QuoteResponsePayload = {
  quoteResponse?: { result?: YahooQuote[] }
}

type YahooChartPayload = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string
        regularMarketPrice?: number
        previousClose?: number
      }
    }>
  }
}

function notFound() {
  return new NextResponse('Not Found', { status: 404 })
}

async function hasHiddenAccess() {
  const cookieStore = await cookies()
  return isSessionTokenValid(cookieStore.get(HIDDEN_TAB_COOKIE)?.value)
}

function mapQuoteTypeToAssetClass(quoteType?: string): AssetClass {
  const normalized = (quoteType ?? '').toUpperCase()

  if (normalized.includes('MUTUALFUND') || normalized.includes('ETF') || normalized.includes('INDEX')) {
    return 'fund'
  }

  if (normalized.includes('CRYPTO')) {
    return 'crypto'
  }

  if (normalized.includes('CASH') || normalized.includes('MONEYMARKET')) {
    return 'cash'
  }

  if (normalized.includes('EQUITY') || normalized.includes('STOCK')) {
    return 'equity'
  }

  return 'other'
}

async function fetchQuoteFromYahooV7(ticker: string) {
  const endpoints = [
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`,
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      })

      if (!response.ok) {
        continue
      }

      const payload = (await response.json()) as QuoteResponsePayload
      const quote = payload.quoteResponse?.result?.[0]
      if (quote) {
        return quote
      }
    } catch {
      continue
    }
  }

  return null
}

async function fetchQuoteFromYahooChart(ticker: string) {
  const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`

  try {
    const response = await fetch(endpoint, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })
    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as YahooChartPayload
    const meta = payload.chart?.result?.[0]?.meta
    if (!meta || typeof meta.regularMarketPrice !== 'number') {
      return null
    }

    return {
      symbol: meta.symbol ?? ticker,
      longName: ticker,
      shortName: ticker,
      regularMarketPrice: meta.regularMarketPrice,
      regularMarketPreviousClose: typeof meta.previousClose === 'number' ? meta.previousClose : undefined,
      regularMarketChangePercent:
        typeof meta.previousClose === 'number' && meta.previousClose !== 0
          ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
          : 0,
      quoteType: 'EQUITY',
    } satisfies YahooQuote
  } catch {
    return null
  }
}

async function fetchYahooQuote(ticker: string) {
  const quote = (await fetchQuoteFromYahooV7(ticker)) ?? (await fetchQuoteFromYahooChart(ticker))
  if (!quote) {
    return null
  }

  let sector: string | undefined
  try {
    const profileUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=assetProfile`
    const profileResponse = await fetch(profileUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (profileResponse.ok) {
      const profilePayload = (await profileResponse.json()) as {
        quoteSummary?: {
          result?: Array<{ assetProfile?: { sector?: string } }>
        }
      }
      sector = profilePayload.quoteSummary?.result?.[0]?.assetProfile?.sector
    }
  } catch {
    sector = undefined
  }

  return {
    ticker: (quote.symbol ?? ticker).toUpperCase(),
    name: quote.longName ?? quote.shortName ?? ticker.toUpperCase(),
    price: typeof quote.regularMarketPrice === 'number' ? quote.regularMarketPrice : null,
    closePrice: typeof quote.regularMarketPreviousClose === 'number' ? quote.regularMarketPreviousClose : null,
    dailyChangePct: typeof quote.regularMarketChangePercent === 'number' ? quote.regularMarketChangePercent : 0,
    assetClass: mapQuoteTypeToAssetClass(quote.quoteType),
    sector,
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(ticker.toUpperCase())}`,
  }
}

export async function GET(request: Request) {
  if (!(await hasHiddenAccess())) {
    return notFound()
  }

  const { searchParams } = new URL(request.url)
  const ticker = String(searchParams.get('ticker') ?? '').trim().toUpperCase()

  if (!ticker) {
    return new NextResponse('Ticker is required', { status: 400 })
  }

  try {
    const quote = await fetchYahooQuote(ticker)
    if (!quote) {
      return new NextResponse('Quote not found', { status: 404 })
    }

    return NextResponse.json(quote, {
      headers: {
        'Cache-Control': 'private, max-age=20, stale-while-revalidate=120',
      },
    })
  } catch {
    return new NextResponse('Failed to fetch quote from upstream providers', { status: 502 })
  }
}
