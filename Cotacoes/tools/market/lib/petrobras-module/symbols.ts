import type { MarketQuotes } from '../../types.js'
export type { PetrobrasResolvedSymbols } from './symbols/types.ts'
import type { PetrobrasResolvedSymbols } from './symbols/types.ts'
import { resolvePetrobrasSymbols as resolvePetrobrasSymbolsImpl } from './symbols/resolve.ts'

export function resolvePetrobrasSymbols(params: {
  market: MarketQuotes
  findSymbol: (market: MarketQuotes, matcher: RegExp) => string | null
  findSymbolByMatchers: (market: MarketQuotes, matchers: RegExp[]) => string | null
  avgPctForSymbols: (
    market: MarketQuotes,
    symbols: string[],
    preferExtended: boolean,
  ) => { pct: number | null; used: string[] }
}): PetrobrasResolvedSymbols {
  return resolvePetrobrasSymbolsImpl(params)
}
