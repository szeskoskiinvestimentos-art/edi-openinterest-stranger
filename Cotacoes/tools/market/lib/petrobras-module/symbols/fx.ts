import type { MarketQuotes } from '../../../types.js'

export function resolveFxPairs(market: MarketQuotes, findSymbol: (market: MarketQuotes, matcher: RegExp) => string | null) {
  const symUSDMXN = findSymbol(market, /^USD\/MXN\b/i)
  const symUSDZAR = findSymbol(market, /^USD\/ZAR\b/i)
  const symUSDCLP = findSymbol(market, /^USD\/CLP\b/i)
  const symUSDTRY = findSymbol(market, /^USD\/TRY\b/i)
  return { symUSDMXN, symUSDZAR, symUSDCLP, symUSDTRY }
}
