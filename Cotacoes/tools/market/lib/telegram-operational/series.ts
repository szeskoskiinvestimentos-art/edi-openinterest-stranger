import type { MarketPoint, MarketQuotes } from '../../types.ts'

export function getLatestPoint(series: MarketPoint[] | undefined | null) {
  if (!series || series.length === 0) return null
  return series[series.length - 1] || null
}

export function trendPct(series: MarketPoint[] | undefined | null, pointsBack: number) {
  if (!series || series.length < 2) return null
  const last = series[series.length - 1]
  const idx = Math.max(0, series.length - 1 - Math.max(1, pointsBack))
  const prev = series[idx]
  if (!last || !prev) return null
  if (!Number.isFinite(last.price) || !Number.isFinite(prev.price) || prev.price === 0) return null
  return ((last.price - prev.price) / prev.price) * 100
}

export function resolveSeriesKey(quotes: MarketQuotes, candidates: string[]) {
  const keys = quotes && quotes.series ? Object.keys(quotes.series) : []
  for (const c of candidates) {
    if (keys.includes(c)) return c
  }
  const lc = new Map(keys.map(k => [k.toLowerCase(), k]))
  for (const c of candidates) {
    const k = lc.get(c.toLowerCase())
    if (k) return k
  }
  return null
}

export function resolveSeriesKeyByAssetMatchers(quotes: MarketQuotes, matchers: RegExp[]) {
  const assets = quotes && Array.isArray(quotes.assets) ? quotes.assets : []
  const keys = quotes && quotes.series ? Object.keys(quotes.series) : []
  const keySet = new Set(keys)
  const lc = new Map(keys.map(k => [k.toLowerCase(), k]))

  for (const m of matchers || []) {
    for (const a of assets) {
      const symbol = String(a && a.symbol ? a.symbol : '').trim()
      const name = String(a && a.name ? a.name : '').trim()
      if (!symbol) continue
      if (!m.test(symbol) && !m.test(name)) continue
      if (keySet.has(symbol)) return symbol
      const k = lc.get(symbol.toLowerCase())
      if (k) return k
    }
  }
  return null
}

export function safeTextLine(s: string | null | undefined) {
  const v = String(s || '').trim()
  return v ? v : 'n/d'
}

export function computeEmPulse(quotes: MarketQuotes) {
  const basket = [
    { w: 0.35, key: resolveSeriesKey(quotes, ['USD/MXN - US Dollar Mexican Peso', 'USD/MXN', 'USDMXN']) },
    { w: 0.35, key: resolveSeriesKey(quotes, ['USD/ZAR - US Dollar South African Rand', 'USD/ZAR', 'USDZAR']) },
    { w: 0.15, key: resolveSeriesKey(quotes, ['USD/CLP - US Dollar Chilean Peso', 'USD/CLP', 'USDCLP']) },
    { w: 0.15, key: resolveSeriesKey(quotes, ['USD/TRY - US Dollar Turkish Lira', 'USD/TRY', 'USDTRY']) },
  ].filter(x => !!x.key) as Array<{ w: number; key: string }>

  if (!basket.length) return { state: 'n/d', score: null }

  const lastPct = (key: string) => {
    const pt = getLatestPoint(quotes.series[key])
    const v = pt && typeof pt.changePct === 'number' ? pt.changePct : null
    return v
  }

  let sumW = 0
  let sum = 0
  for (const it of basket) {
    const v = lastPct(it.key)
    if (typeof v !== 'number' || !Number.isFinite(v)) continue
    sumW += it.w
    sum += it.w * v
  }
  if (sumW <= 0) return { state: 'n/d', score: null }

  const score = sum / sumW
  const neutral = 0.12
  const state = score > neutral ? 'pressão EM' : score < -neutral ? 'fluxo EM favorável' : 'EM misto'
  return { state, score }
}
