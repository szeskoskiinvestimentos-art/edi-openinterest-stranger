import type { FuturesDeps } from '../futures-utils.js'
import type { UsTsyExtraItem, UsTsyFutureItem } from '../us-treasury-futures-types.js'

import { fetchYahooSpark, sparkStats, type SparkLike } from './spark.js'

export async function fillMissingRootsFromSpark(
  deps: FuturesDeps,
  params: { roots: string[]; items: UsTsyFutureItem[]; timeoutMs: number; tenorByRoot: Record<string, string> },
) {
  const haveRoot = new Set(params.items.map(it => String(it && it.rootSymbol ? it.rootSymbol : '').trim()))
  const missing = params.roots.filter(r => r && !haveRoot.has(r))
  if (!missing.length) return

  const bySpark = new Map<string, SparkLike>()
  for (let i = 0; i < missing.length; i += 80) {
    const batch = missing.slice(i, i + 80)
    const got = await fetchYahooSpark(deps, { symbols: batch, timeoutMs: params.timeoutMs, range: '1d', interval: '5m' })
    for (const [k, v] of got.entries()) bySpark.set(k, v)
  }

  for (const rootSymbol of missing) {
    const ex = sparkStats(bySpark.get(rootSymbol) || null)
    if (ex.price === null) continue
    const tenor = params.tenorByRoot[rootSymbol] || rootSymbol.replace(/=F$/i, '').trim() || rootSymbol
    const vertex = rootSymbol.replace(/=F$/i, '').trim() || rootSymbol
    params.items.push({
      tenor,
      rootSymbol,
      vertex,
      yahooSymbol: rootSymbol,
      expiration: 0,
      expirationFmt: 'Contínuo',
      lastPrice: ex.price,
      dayChange: ex.change,
      dayChangePct: ex.changePct,
    })
  }
}

export async function fetchExtrasFromSpark(
  deps: FuturesDeps,
  params: { symbols: string[]; timeoutMs: number; labelBySymbol: Record<string, string> },
) {
  const extras: UsTsyExtraItem[] = []
  if (!params.symbols.length) return extras

  const bySpark = new Map<string, SparkLike>()
  for (let i = 0; i < params.symbols.length; i += 80) {
    const batch = params.symbols.slice(i, i + 80)
    const got = await fetchYahooSpark(deps, { symbols: batch, timeoutMs: params.timeoutMs, range: '1d', interval: '5m' })
    for (const [k, v] of got.entries()) bySpark.set(k, v)
  }

  for (const sym of params.symbols) {
    const ex = sparkStats(bySpark.get(sym) || null)
    if (ex.price === null) continue
    const label = params.labelBySymbol[sym] || sym
    extras.push({
      label,
      yahooSymbol: sym,
      price: ex.price,
      dayChange: ex.change,
      dayChangePct: ex.changePct,
      intradayRangePct: ex.rangePct,
      signalScore: null,
      asOf: ex.asOf,
    })
  }
  return extras
}
