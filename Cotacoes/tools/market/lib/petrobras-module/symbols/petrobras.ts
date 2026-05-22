import type { MarketQuotes } from '../../../types.js'

export function resolvePetrobrasTickers(
  market: MarketQuotes,
  findSymbol: (market: MarketQuotes, matcher: RegExp) => string | null,
) {
  const symPETR4 = findSymbol(market, /\bPETR4(?:\.SA)?\b/i)
  const symPETR3 = findSymbol(market, /\bPETR3(?:\.SA)?\b/i)
  const symPBR = findSymbol(market, /(^PBR$|\bPBR\b)/i)
  const symPBRA = findSymbol(market, /(^PBRA$|\bPBRA\b)/i)
  return { symPETR4, symPETR3, symPBR, symPBRA }
}
