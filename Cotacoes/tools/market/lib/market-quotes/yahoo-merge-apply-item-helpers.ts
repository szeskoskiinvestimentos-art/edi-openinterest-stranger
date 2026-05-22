import type { MarketPoint } from '../../types.js'
import type { Asset } from '../../types.js'
import type { YahooMergeAuditItem, YahooNameFallback, YahooTradingViewFallback } from './yahoo-merge-apply-types.js'
import type { YahooSparkChartLike } from './yahoo-merge-yahoo.js'
import { extractSpark } from './yahoo-merge-fetch.js'
import { pruneByCutoff } from './yahoo-merge-symbols.js'

export function upsertPointIntoSeries(params: {
  series: Record<string, MarketPoint[]>
  assetSymbol: string
  point: MarketPoint
  cutoffMs: number
}) {
  const points = Array.isArray(params.series[params.assetSymbol]) ? params.series[params.assetSymbol] : []
  const prevPoint = points.length ? points[points.length - 1] : null
  const next = prevPoint && prevPoint.t === params.point.t ? points.slice(0, -1).concat([params.point]) : points.concat([params.point])
  params.series[params.assetSymbol] = pruneByCutoff(next, params.cutoffMs)
}

export function buildPointFromExtracted(params: {
  nowIso: string
  price: number
  change: number | null
  changePct: number | null
  asOf: string | null
}): MarketPoint {
  const point: MarketPoint = { t: params.nowIso, price: params.price }
  if (typeof params.change === 'number') point.change = params.change
  if (typeof params.changePct === 'number') point.changePct = params.changePct
  if (params.asOf) point.asOf = params.asOf
  return point
}

export function selectBestYahooChart(params: {
  intraday: YahooSparkChartLike | undefined
  daily: YahooSparkChartLike | undefined
}): { chart: YahooSparkChartLike | null; interval: '5m' | '1d' } {
  let q = params.intraday || null
  let usedInterval: '5m' | '1d' = '5m'
  if (!q) {
    q = params.daily || null
    usedInterval = '1d'
  } else {
    const ex = extractSpark(q)
    if (ex.price === null && params.daily) {
      q = params.daily
      usedInterval = '1d'
    }
  }
  return { chart: q, interval: usedInterval }
}

export function tryUpdateFromYahooQuote(params: {
  assetSymbol: string
  category: string
  yahooSymbol: string
  dataInterval: '5m' | '1d'
  nowIso: string
  byYahooQuote: Map<string, { price: number; asOf: string | null; change: number | null; changePct: number | null }>
  recordUpdated: (audit: YahooMergeAuditItem, point: MarketPoint, dayFallbackUsed: boolean, quoteFallbackUsedNow: boolean) => void
}): boolean {
  const qf = params.byYahooQuote.get(params.yahooSymbol)
  if (!qf) return false
  const point = buildPointFromExtracted({
    nowIso: params.nowIso,
    price: qf.price,
    change: qf.change,
    changePct: qf.changePct,
    asOf: qf.asOf,
  })
  params.recordUpdated(
    {
      assetSymbol: params.assetSymbol,
      category: params.category,
      yahooSymbol: params.yahooSymbol,
      status: 'updated',
      price: qf.price,
      dataInterval: params.dataInterval,
      resolvedBy: 'symbol',
    },
    point,
    false,
    true,
  )
  return true
}

export async function tryUpdateFromNameFallback(params: {
  asset: Asset | undefined
  assetSymbol: string
  category: string
  attemptedYahooSymbol: string
  nowIso: string
  nameFallback: YahooNameFallback
  recordUpdated: (audit: YahooMergeAuditItem, point: MarketPoint, dayFallbackUsed: boolean, quoteFallbackUsedNow: boolean) => void
}): Promise<boolean> {
  const resolved = await params.nameFallback.resolve(params.asset, params.category, params.attemptedYahooSymbol)
  if (!resolved) return false
  const extracted = extractSpark(resolved.chart)
  const price = extracted.price
  if (price === null) return false
  const point = buildPointFromExtracted({
    nowIso: params.nowIso,
    price,
    change: extracted.change,
    changePct: extracted.changePct,
    asOf: extracted.asOf,
  })
  params.recordUpdated(
    {
      assetSymbol: params.assetSymbol,
      category: params.category,
      yahooSymbol: resolved.yahooSymbol,
      status: 'updated',
      price,
      dataInterval: resolved.dataInterval,
      resolvedBy: 'name',
    },
    point,
    resolved.dataInterval === '1d',
    false,
  )
  return true
}

export async function tryUpdateFromTradingViewFallback(params: {
  asset: Asset | undefined
  assetSymbol: string
  category: string
  attemptedYahooSymbol: string
  usedInterval: '5m' | '1d'
  nowIso: string
  dayFallbackUsed: boolean
  tradingViewFallback: YahooTradingViewFallback
  recordUpdated: (audit: YahooMergeAuditItem, point: MarketPoint, dayFallbackUsed: boolean, quoteFallbackUsedNow: boolean) => void
}): Promise<boolean> {
  const tv = await params.tradingViewFallback.resolve(params.asset, params.category)
  if (!tv) return false
  const point: MarketPoint = { t: params.nowIso, price: tv.price, asOf: params.nowIso }
  params.recordUpdated(
    {
      assetSymbol: params.assetSymbol,
      category: params.category,
      yahooSymbol: params.attemptedYahooSymbol,
      status: 'updated',
      price: tv.price,
      dataInterval: params.usedInterval,
      resolvedBy: 'tradingview',
      tradingViewSymbol: tv.tradingViewSymbol,
      tradingViewUsedColumn: tv.usedColumn,
      tradingViewUpdateMode: tv.updateMode,
    },
    point,
    params.dayFallbackUsed,
    false,
  )
  return true
}

export function synthPointFromChangePct(params: {
  nowIso: string
  prevPrice: number
  changePct: number
  asOf: string | null
}): MarketPoint | null {
  const synthPrice = params.prevPrice * (1 + params.changePct / 100)
  if (!Number.isFinite(synthPrice) || synthPrice <= 0) return null
  const point: MarketPoint = { t: params.nowIso, price: synthPrice }
  point.change = synthPrice - params.prevPrice
  point.changePct = params.changePct
  if (params.asOf) point.asOf = params.asOf
  return point
}
