import type { MarketQuotes } from '../../../types.js'

import type { PetrobrasResolvedSymbols } from './types.ts'
import { resolveBrazilMarketProxies } from './br-market.ts'
import { resolveEnergySymbols } from './energy.ts'
import { resolveFxPairs } from './fx.ts'
import { resolveMajorsInfo } from './majors.ts'
import { resolvePetrobrasTickers } from './petrobras.ts'
import { resolveRiskSymbols } from './risk.ts'

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
  const market = params.market

  const petrobras = resolvePetrobrasTickers(market, params.findSymbol)
  const br = resolveBrazilMarketProxies(market, params.findSymbol, params.findSymbolByMatchers)
  const fx = resolveFxPairs(market, params.findSymbol)
  const energy = resolveEnergySymbols(market, params.findSymbol, params.findSymbolByMatchers)
  const risk = resolveRiskSymbols(market, params.findSymbol, params.findSymbolByMatchers)
  const majorsInfo = resolveMajorsInfo(market, params.findSymbol, params.avgPctForSymbols)

  return {
    ...petrobras,
    ...br,
    ...fx,
    ...energy,
    ...risk,
    majors: majorsInfo.majors,
    majorsPresent: majorsInfo.majorsPresent,
    majorsAvg: majorsInfo.majorsAvg,
  }
}
