import type { YahooSparkChartLike } from './yahoo-merge-yahoo.js'
import { extractSpark, fetchYahooSpark } from './yahoo-merge-fetch.js'

export async function fetchBestChartForYahooSymbol(params: {
  symbol: string
  timeoutMs: number
  fetchJsonWithTimeout: <T>(url: string, timeoutMs: number, headers?: Record<string, string>) => Promise<T>
}): Promise<{ chart: YahooSparkChartLike | null; dataInterval: '5m' | '1d' }> {
  const sym = String(params.symbol || '').trim()
  if (!sym) return { chart: null, dataInterval: '1d' }

  const intraday = await fetchYahooSpark({
    symbols: [sym],
    range: '1d',
    interval: '5m',
    timeoutMs: params.timeoutMs,
    fetchJsonWithTimeout: params.fetchJsonWithTimeout,
  })
  const q0 = intraday.get(sym) || null
  if (q0) {
    const ex0 = extractSpark(q0)
    if (ex0.price !== null) return { chart: q0, dataInterval: '5m' }
  }

  const daily = await fetchYahooSpark({
    symbols: [sym],
    range: '5d',
    interval: '1d',
    timeoutMs: params.timeoutMs,
    fetchJsonWithTimeout: params.fetchJsonWithTimeout,
  })
  const q1 = daily.get(sym) || null
  if (!q1) return { chart: null, dataInterval: '1d' }
  const ex1 = extractSpark(q1)
  if (ex1.price === null) return { chart: null, dataInterval: '1d' }
  return { chart: q1, dataInterval: '1d' }
}

