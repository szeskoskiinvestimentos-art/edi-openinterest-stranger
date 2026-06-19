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
    try {
      const MAX_ABS_CHANGE_PCT = 80
      const derivedAbsThreshold = (() => {
        const rb = String((audit as unknown as { resolvedBy?: unknown }).resolvedBy || '')
        const interval = String((audit as unknown as { dataInterval?: unknown }).dataInterval || '')
        if (rb === 'tradingview' && interval === '1d') return 25
        return MAX_ABS_CHANGE_PCT
      })()
      const changePctField =
        typeof (point as unknown as { changePct?: unknown }).changePct === 'number' &&
        Number.isFinite((point as unknown as { changePct: number }).changePct)
          ? ((point as unknown as { changePct: number }).changePct as number)
          : null
      if (changePctField !== null && Math.abs(changePctField) > MAX_ABS_CHANGE_PCT) {
        ;(audit as unknown as { changePctSource?: string }).changePctSource = 'missing'
        ;(audit as unknown as { changePctSuppressed?: boolean }).changePctSuppressed = true
        ;(audit as unknown as { changePctSuppressedKind?: string }).changePctSuppressedKind = 'field'
        ;(audit as unknown as { changePctSuppressedValue?: number }).changePctSuppressedValue = changePctField
        ;(audit as unknown as { changePctSuppressedThreshold?: number }).changePctSuppressedThreshold = MAX_ABS_CHANGE_PCT
        delete (point as unknown as { changePct?: unknown }).changePct
      } else if (changePctField !== null) {
        ;(audit as unknown as { changePctSource?: string }).changePctSource = 'field'
      }

      const existingPoints = Array.isArray(params.series[p.assetSymbol]) ? params.series[p.assetSymbol] : []
      const prev = existingPoints.length ? existingPoints[existingPoints.length - 1] : null
      const prevPrice = prev && typeof prev.price === 'number' && Number.isFinite(prev.price) ? prev.price : null
      const shouldDeriveChange =
        prevPrice !== null
        && prevPrice > 0
        && typeof point.price === 'number'
        && Number.isFinite(point.price)
        && point.price > 0
        && point.change === undefined
        && point.changePct === undefined
      if (shouldDeriveChange) {
        point.change = point.price - prevPrice
        const pct = ((point.price - prevPrice) / prevPrice) * 100
        if (Number.isFinite(pct) && Math.abs(pct) <= derivedAbsThreshold) {
          point.changePct = pct
          ;(audit as unknown as { changePctSource?: string }).changePctSource = 'derived'
          ;(audit as unknown as { changePctDerivedFrom?: string }).changePctDerivedFrom = 'prev_price'
        } else if (Number.isFinite(pct)) {
          ;(audit as unknown as { changePctSource?: string }).changePctSource = 'missing'
          ;(audit as unknown as { changePctSuppressed?: boolean }).changePctSuppressed = true
          ;(audit as unknown as { changePctSuppressedKind?: string }).changePctSuppressedKind = 'derived'
          ;(audit as unknown as { changePctSuppressedValue?: number }).changePctSuppressedValue = pct
          ;(audit as unknown as { changePctSuppressedThreshold?: number }).changePctSuppressedThreshold = derivedAbsThreshold
        }
      }

      const src = (audit as unknown as { changePctSource?: unknown }).changePctSource
      if (src !== 'field' && src !== 'derived' && src !== 'missing') {
        const hasPct =
          typeof (point as unknown as { changePct?: unknown }).changePct === 'number' &&
          Number.isFinite((point as unknown as { changePct: number }).changePct)
        ;(audit as unknown as { changePctSource?: string }).changePctSource = hasPct ? 'field' : 'missing'
      }
    } catch {
      void 0
    }
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
