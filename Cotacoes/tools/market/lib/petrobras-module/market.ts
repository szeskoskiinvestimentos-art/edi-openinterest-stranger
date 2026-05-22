import type { MarketPoint, MarketQuotes } from '../../types.js'
import { isFiniteNumber } from './stats.js'

export function lastPoint(market: MarketQuotes, symbol: string): MarketPoint | null {
  const arr = market && market.series ? market.series[symbol] : null
  if (!Array.isArray(arr) || !arr.length) return null
  return arr[arr.length - 1] || null
}

export function pctFromPoint(point: MarketPoint | null, preferExtended: boolean) {
  if (!point) return null
  if (preferExtended && isFiniteNumber(point.extendedChangePct)) return point.extendedChangePct
  if (isFiniteNumber(point.changePct)) return point.changePct
  if (!preferExtended && isFiniteNumber(point.extendedChangePct)) return point.extendedChangePct
  return null
}

export function asOfFromPoint(point: MarketPoint | null) {
  if (!point) return null
  const v = (point.asOf || point.t || '').trim()
  return v || null
}

export function findSymbol(market: MarketQuotes, matcher: RegExp) {
  const assets = market && Array.isArray(market.assets) ? market.assets : []
  for (const a of assets) {
    const symRaw = String(a && a.symbol ? a.symbol : '')
    const sym = symRaw.trim()
    const symCore = (sym.split(' - ')[0] || sym).trim()
    const name = String(a && a.name ? a.name : '')
    if (matcher.test(sym) || matcher.test(symCore) || matcher.test(name)) return symRaw
  }
  const series = market && market.series && typeof market.series === 'object' ? market.series : null
  if (series) {
    for (const symRaw of Object.keys(series)) {
      const sym = String(symRaw || '').trim()
      const symCore = (sym.split(' - ')[0] || sym).trim()
      if (matcher.test(sym) || matcher.test(symCore)) return symRaw
    }
  }
  return null
}

export function findSymbolByMatchers(market: MarketQuotes, matchers: RegExp[]) {
  for (const m of matchers) {
    const sym = findSymbol(market, m)
    if (sym) return sym
  }
  return null
}

export function avgPctForSymbols(market: MarketQuotes, symbols: string[], preferExtended: boolean) {
  const pts = symbols
    .map(s => ({ s, p: pctFromPoint(lastPoint(market, s), preferExtended) }))
    .filter(x => isFiniteNumber(x.p))
  if (!pts.length) return { pct: null, used: [] as string[] }
  const pct = pts.reduce((acc, x) => acc + (x.p as number), 0) / pts.length
  return { pct, used: pts.map(x => x.s) }
}

