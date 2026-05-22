import { extractSpark, fetchYahooQuote, fetchYahooSparkInto } from './yahoo-merge-fetch.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'
import type { YahooSparkChartLike } from './yahoo-merge-yahoo.js'

export async function buildYahooFallbackStores(params: {
  deps: YahooMergeDeps
  selectedPlan: Array<{ yahooSymbol: string }>
  byYahoo: Map<string, YahooSparkChartLike>
  timeoutMs: number
  chunkSize: number
}): Promise<{
  dailyFallbackEnabled: boolean
  dailyFallbackSymbols: Set<string>
  byYahooDaily: Map<string, YahooSparkChartLike>
  byYahooQuote: Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>
}> {
  const dailyFallbackEnabled = params.deps.envBool('MARKET_YAHOO_DAILY_FALLBACK_ENABLED', true)
  const dailyFallbackMax = Math.max(0, Math.min(800, Math.trunc(params.deps.envNumber('MARKET_YAHOO_DAILY_FALLBACK_MAX_SYMBOLS', 160))))

  const dailyFallbackSymbols = new Set<string>()
  for (const p of params.selectedPlan) {
    const q = params.byYahoo.get(p.yahooSymbol)
    if (!q) {
      dailyFallbackSymbols.add(p.yahooSymbol)
      continue
    }
    const extracted = extractSpark(q)
    if (extracted.price === null) dailyFallbackSymbols.add(p.yahooSymbol)
  }

  const byYahooDaily = new Map<string, YahooSparkChartLike>()
  if (dailyFallbackEnabled && dailyFallbackSymbols.size) {
    const list = Array.from(dailyFallbackSymbols).slice(0, dailyFallbackMax)
    await fetchYahooSparkInto({
      target: byYahooDaily,
      symbols: list,
      range: '5d',
      interval: '1d',
      timeoutMs: params.timeoutMs,
      chunkSize: params.chunkSize,
      fetchJsonWithTimeout: params.deps.fetchJsonWithTimeout,
    })
  }

  const quoteFallbackEnabled = params.deps.envBool('MARKET_YAHOO_QUOTE_FALLBACK_ENABLED', true)
  const quoteFallbackMax = Math.max(0, Math.min(1200, Math.trunc(params.deps.envNumber('MARKET_YAHOO_QUOTE_FALLBACK_MAX_SYMBOLS', 240))))
  const byYahooQuote = new Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>()
  if (quoteFallbackEnabled && dailyFallbackSymbols.size) {
    const list = Array.from(dailyFallbackSymbols).slice(0, quoteFallbackMax)
    for (let i = 0; i < list.length; i += 80) {
      const batch = list.slice(i, i + 80)
      const got = await fetchYahooQuote({ symbols: batch, timeoutMs: params.timeoutMs, fetchJsonWithTimeout: params.deps.fetchJsonWithTimeout })
      for (const [k, v] of got.entries()) byYahooQuote.set(k, v)
    }
  }

  return { dailyFallbackEnabled, dailyFallbackSymbols, byYahooDaily, byYahooQuote }
}
