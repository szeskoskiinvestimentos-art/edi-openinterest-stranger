import type { Asset, MarketPoint } from '../../types.js'

export function latestPct(points: MarketPoint[] | undefined | null) {
  if (!points || points.length < 1) return null
  const last = points[points.length - 1]
  if (last && typeof last.extendedChangePct === 'number' && Number.isFinite(last.extendedChangePct)) return last.extendedChangePct
  if (last && typeof last.changePct === 'number' && Number.isFinite(last.changePct)) return last.changePct
  if (points.length < 2) return null
  const prev = points[points.length - 2]
  if (!last || !prev) return null
  if (!(typeof last.price === 'number' && Number.isFinite(last.price))) return null
  if (!(typeof prev.price === 'number' && Number.isFinite(prev.price) && prev.price !== 0)) return null
  return ((last.price - prev.price) / prev.price) * 100
}

export function latestDelta(points: MarketPoint[] | undefined | null) {
  if (!points || points.length < 1) return null
  const last = points[points.length - 1]
  if (last && typeof last.change === 'number' && Number.isFinite(last.change)) return last.change
  if (points.length < 2) return null
  const prev = points[points.length - 2]
  if (!last || !prev) return null
  if (!(typeof last.price === 'number' && Number.isFinite(last.price))) return null
  if (!(typeof prev.price === 'number' && Number.isFinite(prev.price))) return null
  return last.price - prev.price
}

export function latestLevel(points: MarketPoint[] | undefined | null) {
  if (!points || points.length < 1) return null
  const last = points[points.length - 1]
  if (last && typeof last.price === 'number' && Number.isFinite(last.price)) return last.price
  return null
}

export function resolveSeriesKeyByAssetMatcher(
  assets: Asset[],
  series: Record<string, MarketPoint[]>,
  matcher: RegExp,
) {
  const keys = Object.keys(series || {})
  const keySet = new Set(keys)
  const lc = new Map(keys.map(k => [k.toLowerCase(), k]))
  for (const a of assets || []) {
    const sym = String(a && a.symbol ? a.symbol : '').trim()
    const name = String(a && a.name ? a.name : '').trim()
    if (!sym) continue
    if (!matcher.test(sym) && !matcher.test(name)) continue
    if (keySet.has(sym)) return sym
    const k = lc.get(sym.toLowerCase())
    if (k) return k
  }
  return null
}

