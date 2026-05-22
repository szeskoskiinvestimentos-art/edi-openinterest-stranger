import { arrowFromPct, fmtPct } from '../format.js'
import { getLatestPoint, resolveSeriesKey, resolveSeriesKeyByAssetMatchers, trendPct } from '../series.js'
import type { MarketQuotes } from '../../../types.ts'

export function createCardsMarketAccess(quotes: MarketQuotes | null) {
  const sym = (cs: string[]) => (quotes ? resolveSeriesKey(quotes, cs) : null)
  const symRx = (matchers: RegExp[]) => (quotes ? resolveSeriesKeyByAssetMatchers(quotes, matchers) : null)
  const qSeries = (cs: string[]) => (quotes && sym(cs) ? quotes.series[sym(cs)!] : null)

  const pull = (cs: string[]) => {
    const series = qSeries(cs)
    const pt = series ? getLatestPoint(series) : null
    const pct = pt && typeof pt.changePct === 'number' ? pt.changePct : null
    const a = arrowFromPct(pct)
    return { a, pct: fmtPct(pct) }
  }

  const pullKey = (key: string | null) => (key ? pull([key]) : { a: 'n/d', pct: 'n/d' })

  const lastOf = (cs: string[]) => {
    const series = qSeries(cs)
    const pt = series ? getLatestPoint(series) : null
    const price = pt && typeof pt.price === 'number' && Number.isFinite(pt.price) ? pt.price : null
    const pct =
      pt && typeof pt.changePct === 'number' && Number.isFinite(pt.changePct)
        ? pt.changePct
        : series
          ? trendPct(series, 1)
          : null
    const a = arrowFromPct(pct)
    return { price, pct, a }
  }

  return { sym, symRx, qSeries, pull, pullKey, lastOf }
}

export function minutesSinceIso(iso: string | undefined) {
  if (!iso) return null
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  return Math.max(0, Math.round((Date.now() - t) / 60000))
}

export function fmtAge(m: number | null) {
  return typeof m === 'number' && Number.isFinite(m) ? `${m}m` : 'n/d'
}

export function fmtLevel(v: unknown) {
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : 'n/d'
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

