import type { YahooMergeDeps } from './yahoo-merge-deps.js'

export type YahooSparkQuote = {
  close?: Array<number | null>
}

export type YahooSparkChartLike = {
  meta?: {
    symbol?: string
    currency?: string
  }
  timestamp?: number[]
  indicators?: {
    quote?: YahooSparkQuote[]
  }
}

export type YahooSparkResultItem = {
  symbol?: string
  response?: YahooSparkChartLike[]
}

export type YahooSparkResponse = {
  spark?: {
    result?: YahooSparkResultItem[]
    error?: unknown
  }
}

export async function yahooSearchByName(deps: YahooMergeDeps, q: string, timeoutMs: number) {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=en-US`
  try {
    const data = await deps.fetchJsonWithTimeout<unknown>(url, Math.max(1500, timeoutMs), {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
      Referer: 'https://finance.yahoo.com/',
    })
    const quotes =
      data && typeof data === 'object' && 'quotes' in data && Array.isArray((data as Record<string, unknown>).quotes)
        ? ((data as Record<string, unknown>).quotes as unknown[])
        : []
    return quotes
  } catch {
    return []
  }
}
