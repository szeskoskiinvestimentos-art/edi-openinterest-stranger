import type { MarketQuotes } from '../../../../types.js'
import type { PetrobrasResolvedSymbols } from '../../symbols.js'

import { lastPoint, pctFromPoint } from '../../market.js'
import { isFiniteNumber } from '../../stats.js'

export function oilAvgPctFromMarket(market: MarketQuotes, symbols: PetrobrasResolvedSymbols) {
  const pctFor = (sym: string | null, preferExtended: boolean) =>
    sym ? pctFromPoint(lastPoint(market, sym), preferExtended) : null
  const xs = [pctFor(symbols.symBrent, true), pctFor(symbols.symWti, true)].filter(isFiniteNumber) as number[]
  if (!xs.length) return null
  return xs.reduce((a, b) => a + b, 0) / xs.length
}
