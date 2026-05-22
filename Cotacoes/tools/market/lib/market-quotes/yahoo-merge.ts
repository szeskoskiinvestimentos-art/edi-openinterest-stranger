import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { MarketPoint, MarketQuotes } from '../../types.js'
import type { YahooMergeDeps } from './yahoo-merge-deps.js'
import { applyYahooMergePlan } from './yahoo-merge-apply.js'
import { fetchYahooSparkInto } from './yahoo-merge-fetch.js'
import { fetchBestChartForYahooSymbol } from './yahoo-merge-best-chart.js'
import { createNameSearchFallback } from './yahoo-merge-name-fallback.js'
import { buildYahooMergePlan } from './yahoo-merge-plan.js'
import { buildYahooFallbackStores } from './yahoo-merge-fallbacks.js'
import { createTradingViewFallback } from './yahoo-merge-tradingview-fallback.js'
import { writeYahooMergeOutputs } from './yahoo-merge-write.js'
import type { YahooSparkChartLike } from './yahoo-merge-yahoo.js'
import { parseSymbolOverrides } from './yahoo-merge-symbols.js'

export async function mergeYahooQuotesIntoMarketQuotes(
  outDir: string,
  opts: { maxSymbols: number; timeoutMs: number },
  deps: YahooMergeDeps,
) {
  const jsonPath = path.join(outDir, 'market_quotes.json')
  const raw = await readFile(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw) as MarketQuotes
  if (!parsed || !Array.isArray(parsed.assets) || !parsed.series || !parsed.meta) return

  const nowIso = new Date().toISOString()
  const retentionDays = Number(parsed.meta.retentionDays || 5)
  const cutoffMs = Date.now() - Math.max(1, retentionDays) * 24 * 60 * 60 * 1000

  const assets = parsed.assets
  const series: Record<string, MarketPoint[]> = parsed.series

  const plan = buildYahooMergePlan({ deps, assets, maxSymbols: opts.maxSymbols })
  const { overrides, assetBySymbol, byCategory, selectedPlan, uniqueYahoo, skippedAssets } = plan
  if (!uniqueYahoo.length) return

  const byYahoo = new Map<string, YahooSparkChartLike>()
  const chunkSize = 80

  await fetchYahooSparkInto({
    target: byYahoo,
    symbols: uniqueYahoo,
    range: '1d',
    interval: '5m',
    timeoutMs: opts.timeoutMs,
    chunkSize,
    fetchJsonWithTimeout: deps.fetchJsonWithTimeout,
  })

  const { byYahooDaily, byYahooQuote } = await buildYahooFallbackStores({
    deps,
    selectedPlan,
    byYahoo,
    timeoutMs: opts.timeoutMs,
    chunkSize,
  })

  const nameSearchEnabled = deps.envBool('MARKET_YAHOO_NAME_SEARCH_ENABLED', false)
  const nameSearchMax = Math.max(0, Math.min(200, deps.envNumber('MARKET_YAHOO_NAME_SEARCH_MAX', 20)))
  const nameOverrideSuggested = new Set<string>()

  const tradingViewEnabled = deps.envBool('MARKET_TRADINGVIEW_FALLBACK_ENABLED', true)
  const tradingViewMax = Math.max(0, Math.min(240, Math.trunc(deps.envNumber('MARKET_TRADINGVIEW_FALLBACK_MAX', 40))))
  const tradingViewTimeoutMs = Math.max(1500, deps.envNumber('MARKET_TRADINGVIEW_TIMEOUT_MS', Math.max(6000, opts.timeoutMs)))
  const tradingViewOverrides = parseSymbolOverrides(deps.env('MARKET_TRADINGVIEW_SYMBOL_OVERRIDES'))
  const tradingViewOverrideSuggested = new Set<string>()

  const bestChartFetcher = async (symbol: string) =>
    fetchBestChartForYahooSymbol({ symbol, timeoutMs: opts.timeoutMs, fetchJsonWithTimeout: deps.fetchJsonWithTimeout })

  const nameFallback = createNameSearchFallback({
    deps,
    series,
    overrides,
    suggestedOverrides: nameOverrideSuggested,
    enabled: nameSearchEnabled,
    maxResolved: nameSearchMax,
    timeoutMs: opts.timeoutMs,
    fetchBestChartForSymbol: bestChartFetcher,
  })

  const tradingViewFallback = createTradingViewFallback({
    deps,
    series,
    tradingViewOverrides,
    suggestedOverrides: tradingViewOverrideSuggested,
    enabled: tradingViewEnabled,
    maxResolved: tradingViewMax,
    timeoutMs: tradingViewTimeoutMs,
  })

  const applied = await applyYahooMergePlan({
    deps,
    selectedPlan,
    assetBySymbol,
    byCategory,
    series,
    nowIso,
    cutoffMs,
    byYahoo,
    byYahooDaily,
    byYahooQuote,
    nameFallback,
    tradingViewFallback,
  })

  await writeYahooMergeOutputs({
    outDir,
    parsed,
    series,
    nowIso,
    deps,
    timeoutMs: opts.timeoutMs,
    plan: {
      selectedPlanLength: selectedPlan.length,
      uniqueYahooLength: uniqueYahoo.length,
      returnedYahooSize: byYahoo.size,
      skippedAssets,
      byCategory,
      overrides,
      assetBySymbol,
    },
    applied: {
      updated: applied.updated,
      covered: applied.covered,
      dailyFallbackUsed: applied.dailyFallbackUsed,
      quoteFallbackUsed: applied.quoteFallbackUsed,
      updatedSymbols: applied.updatedSymbols,
      missingSymbols: applied.missingSymbols,
      auditItems: applied.auditItems,
    },
    nameFallback,
    tradingViewFallback,
    nameOverrideSuggested,
    tradingViewOverrideSuggested,
  })
}
