import type { Asset, MarketPoint } from '../../../types.js'
import type { YahooMergeDeps } from '../yahoo-merge-deps.js'
import type { YahooSparkChartLike } from '../yahoo-merge-yahoo.js'
import { extractSpark } from '../yahoo-merge-fetch.js'
import { getPriceScaleBoundsForCategory } from '../yahoo-merge-symbols.js'
import type { YahooMergeAuditItem, YahooNameFallback, YahooTradingViewFallback } from '../yahoo-merge-apply-types.js'
import {
  buildPointFromExtracted,
  selectBestYahooChart,
  upsertPointIntoSeries,
} from '../yahoo-merge-apply-item-helpers.js'
import { resolveWhenNoChart } from './resolve-no-chart.js'
import { resolveWhenNoPrice } from './resolve-no-price.js'
import { resolveWhenOutOfBounds } from './resolve-out-of-bounds.js'

export async function applyYahooMergeItem(params: {
  deps: YahooMergeDeps
  planItem: { assetSymbol: string; yahooSymbol: string }
  assetBySymbol: Map<string, Asset>
  series: Record<string, MarketPoint[]>
  nowIso: string
  cutoffMs: number
  byYahoo: Map<string, YahooSparkChartLike>
  byYahooDaily: Map<string, YahooSparkChartLike>
  byYahooQuote: Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>
  nameFallback: YahooNameFallback
  tradingViewFallback: YahooTradingViewFallback
}): Promise<{
  category: string
  attempted: number
  updated: number
  missing: number
  covered: number
  dailyFallbackUsed: number
  quoteFallbackUsed: number
  updatedSymbols: string[]
  missingSymbols: string[]
  auditItems: YahooMergeAuditItem[]
}> {
  const p = params.planItem
  const asset = params.assetBySymbol.get(p.assetSymbol)
  const cat = String(asset && asset.category ? asset.category : 'n/d') || 'n/d'

  const updatedSymbols: string[] = []
  const missingSymbols: string[] = []
  const auditItems: YahooMergeAuditItem[] = []
  let updated = 0
  let covered = 0
  let dailyFallbackUsed = 0
  let quoteFallbackUsed = 0

  const recordUpdated = (
    audit: YahooMergeAuditItem,
    point: MarketPoint,
    dayFallbackUsed: boolean,
    quoteFallbackUsedNow: boolean,
  ) => {
    upsertPointIntoSeries({ series: params.series, assetSymbol: p.assetSymbol, point, cutoffMs: params.cutoffMs })
    updated += 1
    if (dayFallbackUsed) dailyFallbackUsed += 1
    if (quoteFallbackUsedNow) quoteFallbackUsed += 1
    updatedSymbols.push(p.assetSymbol)
    auditItems.push(audit)
  }

  const recordMissing = (audit: YahooMergeAuditItem) => {
    missingSymbols.push(p.assetSymbol)
    auditItems.push(audit)
  }

  const qIntraday = params.byYahoo.get(p.yahooSymbol)
  const qDaily = params.byYahooDaily.get(p.yahooSymbol)
  const selected = selectBestYahooChart({ intraday: qIntraday, daily: qDaily })
  const q = selected.chart
  const usedInterval = selected.interval

  const finalize = () => ({
    category: cat,
    attempted: 1,
    updated,
    missing: missingSymbols.length,
    covered,
    dailyFallbackUsed,
    quoteFallbackUsed,
    updatedSymbols,
    missingSymbols,
    auditItems,
  })

  if (!q) {
    await resolveWhenNoChart({
      deps: params.deps,
      asset,
      assetSymbol: p.assetSymbol,
      category: cat,
      yahooSymbol: p.yahooSymbol,
      usedInterval,
      nowIso: params.nowIso,
      byYahooQuote: params.byYahooQuote,
      nameFallback: params.nameFallback,
      tradingViewFallback: params.tradingViewFallback,
      recordUpdated,
      recordMissing,
    })
    return finalize()
  }

  covered = 1
  const extracted = extractSpark(q)
  const price = extracted.price

  if (price === null) {
    await resolveWhenNoPrice({
      deps: params.deps,
      asset,
      assetSymbol: p.assetSymbol,
      category: cat,
      yahooSymbol: p.yahooSymbol,
      usedInterval,
      nowIso: params.nowIso,
      byYahooQuote: params.byYahooQuote,
      nameFallback: params.nameFallback,
      tradingViewFallback: params.tradingViewFallback,
      recordUpdated,
      recordMissing,
    })
    return finalize()
  }

  const prevPoints = Array.isArray(params.series[p.assetSymbol]) ? params.series[p.assetSymbol] : []
  const prev = prevPoints.length ? prevPoints[prevPoints.length - 1] : null
  if (prev && typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price > 0) {
    const [minRatio, maxRatio] = getPriceScaleBoundsForCategory(params.deps, cat)
    const ratio = price / prev.price
    const outOfBounds = !Number.isFinite(ratio) || ratio < minRatio || ratio > maxRatio
    if (outOfBounds) {
      await resolveWhenOutOfBounds({
        asset,
        assetSymbol: p.assetSymbol,
        category: cat,
        yahooSymbol: p.yahooSymbol,
        usedInterval,
        nowIso: params.nowIso,
        prevPrice: prev.price,
        extracted: { changePct: extracted.changePct, asOf: extracted.asOf },
        tradingViewFallback: params.tradingViewFallback,
        recordUpdated,
        recordMissing,
      })
      return finalize()
    }
  }

  const point = buildPointFromExtracted({
    nowIso: params.nowIso,
    price,
    change: extracted.change,
    changePct: extracted.changePct,
    asOf: extracted.asOf,
  })
  recordUpdated(
    {
      assetSymbol: p.assetSymbol,
      category: cat,
      yahooSymbol: p.yahooSymbol,
      status: 'updated',
      price,
      dataInterval: usedInterval,
      resolvedBy: 'symbol',
    },
    point,
    usedInterval === '1d',
    false,
  )
  return finalize()
}
