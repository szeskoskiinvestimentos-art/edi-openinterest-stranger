import type { MarketQuotes } from '../../../types.js'

export const majors = ['XOM', 'CVX', 'SHEL', 'BP', 'TTE', 'EQNR', 'COP', 'OXY']

export function resolveMajorsInfo(
  market: MarketQuotes,
  findSymbol: (market: MarketQuotes, matcher: RegExp) => string | null,
  avgPctForSymbols: (market: MarketQuotes, symbols: string[], preferExtended: boolean) => { pct: number | null; used: string[] },
) {
  const majorsPresent = majors.map(s => findSymbol(market, new RegExp(`^${s}$`, 'i'))).filter(Boolean) as string[]
  const majorsAvg = avgPctForSymbols(market, majorsPresent, true)
  return { majors, majorsPresent, majorsAvg }
}
